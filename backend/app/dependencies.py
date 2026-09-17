from fastapi import Depends, HTTPException, status
from fastapi.security import OAuth2PasswordBearer
from sqlalchemy.orm import Session

from .auth import decodificar_token
from .database import get_db
from .models import Usuario

oauth2_scheme = OAuth2PasswordBearer(tokenUrl="/auth/login", auto_error=False)


def get_current_user(token: str | None = Depends(oauth2_scheme), db: Session = Depends(get_db)) -> Usuario:
    credenciais_invalidas = HTTPException(
        status_code=status.HTTP_401_UNAUTHORIZED,
        detail="Credenciais inválidas ou expiradas",
        headers={"WWW-Authenticate": "Bearer"},
    )
    if not token:
        raise credenciais_invalidas

    payload = decodificar_token(token)
    if not payload or "sub" not in payload:
        raise credenciais_invalidas

    usuario = db.query(Usuario).filter(Usuario.email == payload["sub"]).first()
    if not usuario:
        raise credenciais_invalidas
    return usuario


def get_current_admin(usuario: Usuario = Depends(get_current_user)) -> Usuario:
    if usuario.role != "admin":
        raise HTTPException(status_code=status.HTTP_403_FORBIDDEN, detail="Acesso restrito ao administrador")
    return usuario
