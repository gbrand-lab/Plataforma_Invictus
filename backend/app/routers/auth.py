from fastapi import APIRouter, Depends, HTTPException, Request, status
from sqlalchemy.orm import Session

from ..auth import criar_access_token, hash_senha, verificar_senha
from ..database import get_db
from ..dependencies import get_current_user
from ..limiter import limiter
from ..models import Usuario
from ..schemas import LoginPayload, RegistroCorretorPayload, TokenResponse, UsuarioOut

router = APIRouter(prefix="/auth", tags=["auth"])


@router.post("/login", response_model=TokenResponse)
@limiter.limit("5/minute")
def login(request: Request, payload: LoginPayload, db: Session = Depends(get_db)):
    usuario = db.query(Usuario).filter(Usuario.email == payload.email).first()
    if not usuario or not verificar_senha(payload.senha, usuario.senha_hash):
        raise HTTPException(status_code=status.HTTP_401_UNAUTHORIZED, detail="E-mail ou senha inválidos")

    token = criar_access_token(sub=usuario.email, role=usuario.role)
    return TokenResponse(access_token=token)


@router.post("/registrar", response_model=TokenResponse, status_code=status.HTTP_201_CREATED)
@limiter.limit("3/hour")
def registrar_corretor(request: Request, payload: RegistroCorretorPayload, db: Session = Depends(get_db)):
    """Cadastro público — o corretor já sai logado, sem precisar de aprovação do admin."""
    existente = db.query(Usuario).filter(Usuario.email == payload.email).first()
    if existente:
        raise HTTPException(status_code=status.HTTP_409_CONFLICT, detail="Já existe uma conta com esse e-mail")

    usuario = Usuario(
        nome=payload.nome,
        email=payload.email,
        telefone=payload.telefone,
        senha_hash=hash_senha(payload.senha),
        role="corretor",
    )
    db.add(usuario)
    db.commit()
    db.refresh(usuario)

    token = criar_access_token(sub=usuario.email, role=usuario.role)
    return TokenResponse(access_token=token)


@router.get("/me", response_model=UsuarioOut)
def me(usuario: Usuario = Depends(get_current_user)):
    return usuario
