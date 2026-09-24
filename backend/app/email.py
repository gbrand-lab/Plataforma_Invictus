import logging

import httpx

from .config import settings
from .database import SessionLocal
from .models import Lead

logger = logging.getLogger(__name__)

_FINALIDADE_LABEL = {
    "venda": "à venda",
    "aluguel": "para alugar",
    "repasse": "repasse de chave",
}


def _formatar_preco(preco: float) -> str:
    texto = f"{preco:,.2f}"
    texto = texto.replace(",", "_").replace(".", ",").replace("_", ".")
    return f"R$ {texto}"


def _montar_email_novo_imovel(imovel: dict) -> tuple[str, str]:
    finalidade = _FINALIDADE_LABEL.get(imovel["finalidade"], imovel["finalidade"])
    link = f"{settings.frontend_base_url}/imovel/{imovel['slug']}"
    assunto = f"Novo imóvel {finalidade}: {imovel['titulo']}"
    html = f"""
    <div style="font-family:Arial,sans-serif; max-width:520px; margin:0 auto; color:#1a1a1a">
      <p style="font-size:14px; letter-spacing:1px; text-transform:uppercase; color:#b8892b">Imóvel novo na Invictus</p>
      <h1 style="font-size:24px; margin:8px 0">{imovel['titulo']}</h1>
      <p style="font-size:16px; color:#444">{finalidade} — {imovel['bairro']}, {imovel['cidade']}</p>
      <p style="font-size:20px; font-weight:bold; margin:16px 0">{_formatar_preco(imovel['preco'])}</p>
      <a href="{link}" style="display:inline-block; background:#1a1a1a; color:#fff; padding:12px 24px; text-decoration:none; border-radius:6px">Ver imóvel</a>
    </div>
    """
    return assunto, html


def _enviar_resend(destinatario_email: str, assunto: str, html: str) -> None:
    resposta = httpx.post(
        "https://api.resend.com/emails",
        headers={"Authorization": f"Bearer {settings.resend_api_key}"},
        json={
            "from": f"{settings.resend_remetente_nome} <{settings.resend_remetente_email}>",
            "to": [destinatario_email],
            "subject": assunto,
            "html": html,
        },
        timeout=10,
    )
    resposta.raise_for_status()


def enviar_aviso_novo_imovel(imovel: dict) -> None:
    """Roda em background (ver routers/imoveis.py) — nunca deve derrubar a request que a disparou."""
    if not settings.resend_configurado:
        return

    assunto, html = _montar_email_novo_imovel(imovel)

    db = SessionLocal()
    try:
        leads = db.query(Lead).all()
        for lead in leads:
            try:
                _enviar_resend(lead.email, assunto, html)
            except Exception:
                logger.exception("Falha ao enviar aviso de imóvel novo para %s", lead.email)
    finally:
        db.close()
