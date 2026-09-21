import tempfile
import uuid
from pathlib import Path

from fastapi import APIRouter, Depends, HTTPException, Request, UploadFile, status

from ..dependencies import get_current_user
from ..limiter import limiter
from ..models import Usuario
from ..storage import salvar_imagem, salvar_video_arquivo
from ..video import preparar_video

router = APIRouter(prefix="/uploads", tags=["uploads"])

_TMP_DIR = Path(__file__).resolve().parent.parent.parent / "uploads" / "_tmp"
_TMP_DIR.mkdir(parents=True, exist_ok=True)

TIPOS_IMAGEM = {
    "image/jpeg": ".jpg",
    "image/png": ".png",
    "image/webp": ".webp",
}
TAMANHO_MAX_BYTES = 8 * 1024 * 1024
MAX_ARQUIVOS = 20

TAMANHO_MAX_PDF_BYTES = 40 * 1024 * 1024
MAX_PAGINAS_PDF = 60
PDF_DPI = 150

TIPOS_VIDEO = {
    "video/mp4": ".mp4",
    "video/webm": ".webm",
    "video/quicktime": ".mov",
}
# Sem teto "de negócio" — isso é só uma trava de segurança contra disco cheio
# (vídeo é gravado em disco por streaming, não em memória, então cabe bem mais
# que os 200MB antigos; o ffmpeg comprime o que passar de 15MB antes de guardar).
TAMANHO_MAX_VIDEO_BYTES = 3 * 1024 * 1024 * 1024
TAMANHO_CHUNK = 1024 * 1024


@router.post("/imagens", status_code=status.HTTP_201_CREATED)
@limiter.limit("30/minute")
async def enviar_imagens(
    request: Request,
    arquivos: list[UploadFile],
    _usuario: Usuario = Depends(get_current_user),
):
    if not arquivos:
        raise HTTPException(status_code=status.HTTP_400_BAD_REQUEST, detail="Envie ao menos uma imagem")
    if len(arquivos) > MAX_ARQUIVOS:
        raise HTTPException(status_code=status.HTTP_400_BAD_REQUEST, detail=f"No máximo {MAX_ARQUIVOS} imagens por vez")

    urls: list[str] = []
    for arquivo in arquivos:
        extensao = TIPOS_IMAGEM.get(arquivo.content_type or "")
        if not extensao:
            raise HTTPException(
                status_code=status.HTTP_400_BAD_REQUEST,
                detail=f"Formato não suportado: {arquivo.filename}. Envie JPG, PNG ou WebP.",
            )

        conteudo = await arquivo.read()
        if len(conteudo) > TAMANHO_MAX_BYTES:
            raise HTTPException(
                status_code=status.HTTP_400_BAD_REQUEST,
                detail=f"{arquivo.filename} passa de 8 MB.",
            )

        urls.append(salvar_imagem(conteudo, extensao, request))

    return {"urls": urls}


@router.post("/pdf", status_code=status.HTTP_201_CREATED)
@limiter.limit("10/minute")
async def enviar_pdf(
    request: Request,
    arquivo: UploadFile,
    _usuario: Usuario = Depends(get_current_user),
):
    """Recebe um PDF (book/catálogo do imóvel) e transforma cada página numa imagem."""
    if arquivo.content_type != "application/pdf":
        raise HTTPException(status_code=status.HTTP_400_BAD_REQUEST, detail="Envie um arquivo PDF")

    conteudo = await arquivo.read()
    if len(conteudo) > TAMANHO_MAX_PDF_BYTES:
        raise HTTPException(status_code=status.HTTP_400_BAD_REQUEST, detail="O PDF passa de 40 MB.")

    import pymupdf

    try:
        documento = pymupdf.open(stream=conteudo, filetype="pdf")
    except Exception as exc:  # arquivo corrompido ou não é um PDF válido
        raise HTTPException(status_code=status.HTTP_400_BAD_REQUEST, detail="Não foi possível ler o PDF.") from exc

    if documento.page_count == 0:
        raise HTTPException(status_code=status.HTTP_400_BAD_REQUEST, detail="O PDF está vazio.")
    if documento.page_count > MAX_PAGINAS_PDF:
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail=f"O PDF tem {documento.page_count} páginas — no máximo {MAX_PAGINAS_PDF}.",
        )

    zoom = PDF_DPI / 72
    matriz = pymupdf.Matrix(zoom, zoom)

    urls: list[str] = []
    for pagina in documento:
        pixmap = pagina.get_pixmap(matrix=matriz)
        urls.append(salvar_imagem(pixmap.tobytes("jpg"), ".jpg", request))

    return {"urls": urls}


@router.post("/video", status_code=status.HTTP_201_CREATED)
@limiter.limit("10/minute")
async def enviar_video(
    request: Request,
    arquivo: UploadFile,
    _usuario: Usuario = Depends(get_current_user),
):
    """
    Sem limite "de negócio" de tamanho — vídeo de celular/drone é gigante e não
    queremos rejeitar o corretor por isso. Grava em disco por streaming (não
    carrega tudo em memória), comprime com ffmpeg se estiver grande, e só
    depois envia pro armazenamento final (Cloudinary ou disco local).
    """
    extensao = TIPOS_VIDEO.get(arquivo.content_type or "")
    if not extensao:
        raise HTTPException(status_code=status.HTTP_400_BAD_REQUEST, detail="Envie um vídeo em MP4, WebM ou MOV.")

    bruto = _TMP_DIR / f"{uuid.uuid4().hex}{extensao}"
    final = bruto
    tamanho = 0
    try:
        with bruto.open("wb") as saida:
            while True:
                pedaco = await arquivo.read(TAMANHO_CHUNK)
                if not pedaco:
                    break
                tamanho += len(pedaco)
                if tamanho > TAMANHO_MAX_VIDEO_BYTES:
                    raise HTTPException(
                        status_code=status.HTTP_400_BAD_REQUEST,
                        detail="Vídeo grande demais — fala com o suporte se precisar enviar algo assim.",
                    )
                saida.write(pedaco)

        if tamanho == 0:
            raise HTTPException(status_code=status.HTTP_400_BAD_REQUEST, detail="Arquivo de vídeo vazio.")

        final = preparar_video(bruto, _TMP_DIR)
        return {"url": salvar_video_arquivo(final, request)}
    finally:
        bruto.unlink(missing_ok=True)
        if final != bruto:
            final.unlink(missing_ok=True)
