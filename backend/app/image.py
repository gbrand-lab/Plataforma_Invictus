"""
Processamento de foto — converte HEIC/HEIF (formato padrão de fotos do
iPhone) pra JPEG, redimensiona o que vier gigante (foto de celular moderno
passa fácil de 4000px de largura) e recomprime. Isso evita duas dores:
1. Foto de iPhone que chega em HEIC e não abre em navegador nenhum.
2. Lote de várias fotos grandes estourando o limite de tamanho e travando
   o upload inteiro por causa de uma foto só.
"""

import io

from PIL import Image, ImageOps

try:
    import pillow_heif

    pillow_heif.register_heif_opener()
except ImportError:  # ambiente sem pillow-heif — HEIC vira erro de leitura, resto funciona normal
    pass

LADO_MAX = 2400
QUALIDADE_JPEG = 85

# Teto real do plano Cloudinary em uso — acima disso o upload é recusado.
LIMITE_CLOUDINARY_BYTES = 20 * 1024 * 1024


def _codificar_jpeg(imagem: Image.Image, qualidade: int) -> bytes:
    buffer = io.BytesIO()
    imagem.save(buffer, format="JPEG", quality=qualidade, optimize=True)
    return buffer.getvalue()


def preparar_imagem(conteudo: bytes) -> bytes:
    """Recebe os bytes de qualquer formato suportado (incl. HEIC) e devolve JPEG pronto pra guardar."""
    imagem = Image.open(io.BytesIO(conteudo))
    imagem = ImageOps.exif_transpose(imagem)  # corrige rotação de fotos tiradas na vertical

    if imagem.mode not in ("RGB", "L"):
        imagem = imagem.convert("RGB")

    if imagem.width > LADO_MAX or imagem.height > LADO_MAX:
        imagem.thumbnail((LADO_MAX, LADO_MAX), Image.LANCZOS)

    saida = _codificar_jpeg(imagem, QUALIDADE_JPEG)

    # Praticamente nunca acontece (JPEG nesse tamanho já fica na casa de 1-2MB),
    # mas por segurança: se ainda assim passar do teto do Cloudinary, aperta mais.
    for qualidade, lado in ((70, 1800), (60, 1400)):
        if len(saida) <= LIMITE_CLOUDINARY_BYTES:
            break
        menor = imagem.copy()
        menor.thumbnail((lado, lado), Image.LANCZOS)
        saida = _codificar_jpeg(menor, qualidade)

    return saida
