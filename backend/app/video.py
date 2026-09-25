"""
Compressão de vídeo — vídeo de celular/drone costuma vir gigante (200-800MB
em poucos minutos). O plano do Cloudinary em uso recusa qualquer arquivo
acima de 20MB, então a meta aqui não é só "menor" — é caber dentro desse
teto. Calcula o bitrate necessário a partir da duração do vídeo (via
ffprobe) e recodifica em H.264/AAC mirando esse tamanho, com uma segunda
tentativa mais agressiva se a primeira ainda passar do teto.
Usa o ffmpeg/ffprobe (instalados no build via nixpacks.toml); se não
estiverem disponíveis (ex: ambiente local sem configurar), cai para o
arquivo original sem comprimir.
"""

import json
import shutil
import subprocess
from pathlib import Path

# Teto real do plano Cloudinary em uso — acima disso o upload é recusado.
LIMITE_CLOUDINARY_BYTES = 20 * 1024 * 1024
# Mira um pouco abaixo do teto: sobra margem pro overhead do container MP4 e
# pro bitrate real nunca bater exatamente o alvo calculado.
TAMANHO_ALVO_BYTES = int(LIMITE_CLOUDINARY_BYTES * 0.9)  # ~18MB

ALTURA_MAX = 1080
BITRATE_AUDIO_BPS = 96_000
# Piso do bitrate de vídeo — evita gerar um resultado ilegível em clipes muito longos
# só pra caber no tamanho alvo; nesse caso aceitamos passar do teto e deixar o
# Cloudinary recusar com um erro claro, em vez de entregar um vídeo inútil.
BITRATE_VIDEO_MIN_BPS = 150_000


def ffmpeg_disponivel() -> bool:
    return shutil.which("ffmpeg") is not None and shutil.which("ffprobe") is not None


def _duracao_segundos(origem: Path) -> float | None:
    """Duração do vídeo via ffprobe — usada pra calcular o bitrate que cabe no tamanho alvo."""
    try:
        resultado = subprocess.run(
            ["ffprobe", "-v", "error", "-show_entries", "format=duration", "-of", "json", str(origem)],
            stdout=subprocess.PIPE,
            stderr=subprocess.PIPE,
            timeout=30,
        )
        dados = json.loads(resultado.stdout)
        duracao = float(dados["format"]["duration"])
        return duracao if duracao > 0 else None
    except (subprocess.TimeoutExpired, OSError, KeyError, ValueError, json.JSONDecodeError):
        return None


def _codificar(origem: Path, destino: Path, *, bitrate_video_bps: int | None, crf: int | None) -> bool:
    """
    Recodifica em mp4 (H.264 + AAC, faststart pra tocar no navegador sem baixar
    tudo antes). Com `bitrate_video_bps` mira um tamanho de arquivo (bitrate
    controlado com teto de pico, pra não estourar em cenas complexas); com
    `crf` usa qualidade constante sem controle de tamanho (fallback sem duração).
    """
    comando = [
        "ffmpeg", "-y",
        "-i", str(origem),
        "-vf", f"scale=-2:min({ALTURA_MAX}\\,ih)",
        "-c:v", "libx264",
        "-preset", "veryfast",
        "-c:a", "aac",
        "-b:a", str(BITRATE_AUDIO_BPS),
        "-movflags", "+faststart",
    ]
    if bitrate_video_bps:
        comando += [
            "-b:v", str(bitrate_video_bps),
            "-maxrate", str(int(bitrate_video_bps * 1.3)),
            "-bufsize", str(int(bitrate_video_bps * 2)),
        ]
    else:
        comando += ["-crf", str(crf or 26)]
    comando.append(str(destino))

    try:
        resultado = subprocess.run(comando, stdout=subprocess.PIPE, stderr=subprocess.PIPE, timeout=15 * 60)
    except (subprocess.TimeoutExpired, OSError):
        return False

    return resultado.returncode == 0 and destino.exists() and destino.stat().st_size > 0


def preparar_video(origem: Path, pasta_saida: Path) -> Path:
    """
    Decide se comprime e devolve o caminho do arquivo final a ser enviado.
    Vídeo que já cabe no tamanho alvo não precisa passar pelo ffmpeg.
    """
    tamanho = origem.stat().st_size
    if tamanho <= TAMANHO_ALVO_BYTES:
        return origem
    if not ffmpeg_disponivel():
        return origem

    destino = pasta_saida / f"{origem.stem}_comprimido.mp4"
    duracao = _duracao_segundos(origem)

    if not duracao:
        # Sem duração (ffprobe falhou) — melhor esforço com qualidade constante,
        # sem garantia de caber no teto do Cloudinary.
        if _codificar(origem, destino, bitrate_video_bps=None, crf=26) and destino.stat().st_size < tamanho:
            return destino
        return origem

    bitrate_total = (TAMANHO_ALVO_BYTES * 8) / duracao
    bitrate_video = max(int(bitrate_total - BITRATE_AUDIO_BPS), BITRATE_VIDEO_MIN_BPS)
    if not _codificar(origem, destino, bitrate_video_bps=bitrate_video, crf=None):
        return origem

    if destino.stat().st_size <= LIMITE_CLOUDINARY_BYTES:
        return destino

    # A estimativa passou do teto (cena muito complexa) — refaz uma vez mais
    # agressivo, descontando a proporção exata que estourou.
    fator = (LIMITE_CLOUDINARY_BYTES / destino.stat().st_size) * 0.85
    bitrate_video = max(int(bitrate_video * fator), BITRATE_VIDEO_MIN_BPS)
    if _codificar(origem, destino, bitrate_video_bps=bitrate_video, crf=None):
        return destino

    return origem
