from fastapi import APIRouter, Depends
from sqlalchemy import func
from sqlalchemy.orm import Session

from ..database import get_db
from ..dependencies import get_current_admin
from ..models import Imovel, Usuario
from ..schemas import UsuarioComContagem

router = APIRouter(prefix="/usuarios", tags=["usuarios"])


@router.get("", response_model=list[UsuarioComContagem])
def listar_usuarios(db: Session = Depends(get_db), _admin: Usuario = Depends(get_current_admin)):
    """Somente admin — todos os usuários cadastrados (admin + corretores) e quantos imóveis cada um publicou."""
    contagens = dict(
        db.query(Imovel.criado_por_pk, func.count(Imovel.pk)).group_by(Imovel.criado_por_pk).all()
    )
    usuarios = db.query(Usuario).order_by(Usuario.criado_em.desc()).all()
    return [
        UsuarioComContagem(
            id=u.id,
            nome=u.nome,
            email=u.email,
            telefone=u.telefone,
            role=u.role,
            criado_em=u.criado_em,
            total_imoveis=contagens.get(u.pk, 0),
        )
        for u in usuarios
    ]
