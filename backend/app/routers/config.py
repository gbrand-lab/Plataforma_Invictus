from fastapi import APIRouter, Depends
from sqlalchemy.orm import Session

from ..configuracao import obter_configuracao
from ..database import get_db
from ..dependencies import get_current_admin
from ..models import Usuario
from ..schemas import ConfiguracaoOut, ConfiguracaoUpdate

router = APIRouter(prefix="/config", tags=["config"])


@router.get("", response_model=ConfiguracaoOut)
def obter(db: Session = Depends(get_db), _admin: Usuario = Depends(get_current_admin)):
    return obter_configuracao(db)


@router.patch("", response_model=ConfiguracaoOut)
def atualizar(
    payload: ConfiguracaoUpdate,
    db: Session = Depends(get_db),
    _admin: Usuario = Depends(get_current_admin),
):
    config = obter_configuracao(db)
    config.requer_aprovacao_imovel = payload.requer_aprovacao_imovel
    db.commit()
    db.refresh(config)
    return config
