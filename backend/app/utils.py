import re
import secrets
import unicodedata


def slugify(texto: str) -> str:
    texto = unicodedata.normalize("NFKD", texto).encode("ascii", "ignore").decode("ascii")
    texto = re.sub(r"[^a-zA-Z0-9\s-]", "", texto).strip().lower()
    return re.sub(r"[\s-]+", "-", texto)


def gerar_ref() -> str:
    """Referência pública do imóvel — aleatória, não sequencial (não deve revelar o total cadastrado)."""
    return f"INV-{secrets.token_hex(4).upper()}"
