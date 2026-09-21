"""
Compressão de vídeo — vídeo de celular/drone costuma vir gigante (200-800MB
em poucos minutos). Sem comprimir, isso é caro de guardar e lento de assistir
no site. Usa o ffmpeg (instalado no build via nixpacks.toml) pra recodificar
em H.264/AAC com bitrate controlado; se o ffmpeg não estiver disponível (ex:
ambiente local sem ele configurado), cai para o arquivo original sem comprimir.
"""

import shutil
import subprocess
from pathlib import Path

# Acima disso, sempre comprime — abaixo, só se a resolução for maior que o alvo.
LIMIAR_COMPACTACAO_BYTES = 15 * 1024 * 1024
ALTURA_MAX = 1080


def ffmpeg_disponivel() -> bool:
    return shutil.which("ffmpeg") is not None


def comprimir_video(origem: Path, destino: Path) -> bool:
    """
    Recodifica `origem` em `destino` (mp4, H.264 + AAC, faststart pra tocar
    no navegador sem baixar tudo antes). Retorna True se comprimiu, False se
    não foi possível (ffmpeg ausente ou processo falhou) — quem chamou deve
    usar o arquivo original nesse caso.
    """
    if not ffmpeg_disponivel():
        return False

    comando = [
        "ffmpeg",
        "-y",
        "-i", str(origem),
        "-vf", f"scale=-2:min({ALTURA_MAX}\\,ih)",
        "-c:v", "libx264",
        "-preset", "veryfast",
        "-crf", "26",
        "-c:a", "aac",
        "-b:a", "128k",
        "-movflags", "+faststart",
        str(destino),
    ]

    try:
        resultado = subprocess.run(
            comando,
            stdout=subprocess.PIPE,
            stderr=subprocess.PIPE,
            timeout=15 * 60,
        )
    except (subprocess.TimeoutExpired, OSError):
        return False

    return resultado.returncode == 0 and destino.exists() and destino.stat().st_size > 0


def preparar_video(origem: Path, pasta_saida: Path) -> Path:
    """
    Decide se comprime e devolve o caminho do arquivo final a ser enviado
    (guardado localmente ou no Cloudinary). Vídeo pequeno e já em resolução
    baixa não precisa passar pelo ffmpeg.
    """
    tamanho = origem.stat().st_size
    if tamanho < LIMIAR_COMPACTACAO_BYTES:
        return origem

    destino = pasta_saida / f"{origem.stem}_comprimido.mp4"
    if comprimir_video(origem, destino) and destino.stat().st_size < tamanho:
        return destino

    return origem
