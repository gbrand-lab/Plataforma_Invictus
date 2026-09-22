"""
Armazenamento das fotos de imóveis.

Se as credenciais do Cloudinary estiverem no .env, cada imagem sobe pra lá e a
URL salva no imóvel já é a do CDN (`res.cloudinary.com/...`). Sem credenciais
(padrão em dev), cai para o disco local em `uploads/` — funciona, mas não
sobrevive a um novo deploy, então em produção (Railway) configure o Cloudinary.
"""

import logging
import shutil
import uuid
from pathlib import Path

from fastapi import HTTPException, Request, status

from .config import settings

logger = logging.getLogger("invictus.storage")

_LOCAL_DIR = Path(__file__).resolve().parent.parent / "uploads" / "imoveis"
_LOCAL_DIR.mkdir(parents=True, exist_ok=True)

_LOCAL_DIR_VIDEOS = Path(__file__).resolve().parent.parent / "uploads" / "videos"
_LOCAL_DIR_VIDEOS.mkdir(parents=True, exist_ok=True)

_cloudinary_pronto = False


def _configurar_cloudinary() -> None:
    global _cloudinary_pronto
    if _cloudinary_pronto:
        return
    import cloudinary

    cloudinary.config(
        cloud_name=settings.cloudinary_cloud_name,
        api_key=settings.cloudinary_api_key,
        api_secret=settings.cloudinary_api_secret,
        secure=True,
    )
    _cloudinary_pronto = True


def _erro_upload(exc: Exception, o_que: str) -> HTTPException:
    """Loga a exceção de verdade (não some no meio do stack do ASGI) e devolve um erro claro pro cliente."""
    logger.exception("Falha ao enviar %s pro Cloudinary", o_que)
    return HTTPException(
        status_code=status.HTTP_502_BAD_GATEWAY,
        detail=f"Não foi possível enviar {o_que} agora (armazenamento externo indisponível). "
        f"Se persistir, avise o suporte: {exc}",
    )


def salvar_imagem(conteudo: bytes, extensao: str, request: Request) -> str:
    """Salva um arquivo de imagem já validado e devolve a URL pública."""
    if settings.cloudinary_configurado:
        import cloudinary.uploader

        _configurar_cloudinary()
        try:
            resultado = cloudinary.uploader.upload(
                conteudo,
                folder="invictus/imoveis",
                resource_type="image",
            )
        except Exception as exc:
            raise _erro_upload(exc, "a imagem") from exc
        return resultado["secure_url"]

    nome = f"{uuid.uuid4().hex}{extensao}"
    (_LOCAL_DIR / nome).write_bytes(conteudo)
    return str(request.base_url).rstrip("/") + f"/uploads/imoveis/{nome}"


def salvar_video_arquivo(caminho: Path, request: Request) -> str:
    """
    Envia um vídeo que já está em disco (não em memória — vídeo pode passar de
    centenas de MB) e devolve a URL pública. `caminho` é o arquivo final,
    depois de já ter passado (ou não) pela compressão em app/video.py.
    """
    if settings.cloudinary_configurado:
        import cloudinary.uploader

        _configurar_cloudinary()
        try:
            resultado = cloudinary.uploader.upload_large(
                str(caminho),
                folder="invictus/imoveis/videos",
                resource_type="video",
            )
        except Exception as exc:
            raise _erro_upload(exc, "o vídeo") from exc
        return resultado["secure_url"]

    nome = f"{uuid.uuid4().hex}{caminho.suffix}"
    destino = _LOCAL_DIR_VIDEOS / nome
    shutil.copy(caminho, destino)
    return str(request.base_url).rstrip("/") + f"/uploads/videos/{nome}"
