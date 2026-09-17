from fastapi import APIRouter, Depends, Request, status
from sqlalchemy.orm import Session

from ..database import get_db
from ..dependencies import get_current_admin
from ..limiter import limiter
from ..models import Lead, Usuario
from ..schemas import LeadCreate, LeadOut

router = APIRouter(prefix="/leads", tags=["leads"])


@router.post("", response_model=LeadOut, status_code=status.HTTP_201_CREATED)
@limiter.limit("5/hour")
def criar_lead(request: Request, payload: LeadCreate, db: Session = Depends(get_db)):
    """Público — captura do drawer 'quero receber atualizações de imóveis'."""
    lead = Lead(nome=payload.nome, telefone=payload.telefone, email=payload.email)
    db.add(lead)
    db.commit()
    db.refresh(lead)
    return lead


@router.get("", response_model=list[LeadOut])
def listar_leads(db: Session = Depends(get_db), _admin: Usuario = Depends(get_current_admin)):
    """Somente admin — quem pediu para ser avisado de novos imóveis."""
    return db.query(Lead).order_by(Lead.criado_em.desc()).all()
