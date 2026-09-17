from fastapi import APIRouter, Depends, HTTPException, Query, status
from sqlalchemy import func
from sqlalchemy.orm import Session

from ..configuracao import obter_configuracao
from ..database import get_db
from ..dependencies import get_current_admin, get_current_user
from ..models import Imovel, Usuario
from ..schemas import ImovelCreate, ImovelOut, ImovelPublicoOut, ImovelUpdate
from ..utils import gerar_ref, slugify

router = APIRouter(prefix="/imoveis", tags=["imoveis"])


def _escapar_like(termo: str) -> str:
    """Escapa curingas de LIKE (%, _) para que busca de texto não vire varredura custosa."""
    return termo.replace("\\", "\\\\").replace("%", "\\%").replace("_", "\\_")


def _serializar_publico(imovel: Imovel) -> ImovelPublicoOut:
    """Nunca inclui contato/corretor; some com endereço exato quando a localização é aproximada."""
    dados = ImovelPublicoOut.model_validate(imovel).model_dump()
    if imovel.localizacao_aproximada:
        dados["endereco"] = None
        dados["lat"] = None
        dados["lng"] = None
    return ImovelPublicoOut(**dados)


# ---------- Público ----------

@router.get("", response_model=list[ImovelPublicoOut])
def listar_publicados(
    db: Session = Depends(get_db),
    finalidade: str | None = None,
    categoria: str | None = None,
    cidade: str | None = None,
    bairro: str | None = None,
    na_chave: bool | None = Query(default=None),
    quartos_min: int | None = None,
    banheiros_min: int | None = None,
    vagas_min: int | None = None,
    preco_min: float | None = None,
    preco_max: float | None = None,
    area_min: float | None = None,
    q: str | None = Query(default=None, max_length=80),
    ordem: str = "recentes",
    limit: int = Query(default=100, le=200),
    offset: int = Query(default=0, ge=0),
):
    query = db.query(Imovel).filter(Imovel.status == "published")

    if finalidade:
        query = query.filter(Imovel.finalidade == finalidade)
    if categoria:
        query = query.filter(Imovel.categoria == categoria)
    if cidade:
        query = query.filter(Imovel.cidade == cidade)
    if bairro:
        query = query.filter(Imovel.bairro == bairro)
    if na_chave:
        query = query.filter(Imovel.na_chave.is_(True))
    if quartos_min:
        query = query.filter(Imovel.quartos >= quartos_min)
    if banheiros_min:
        query = query.filter(Imovel.banheiros >= banheiros_min)
    if vagas_min:
        query = query.filter(Imovel.vagas >= vagas_min)
    if preco_min is not None:
        query = query.filter(Imovel.preco >= preco_min)
    if preco_max is not None:
        query = query.filter(Imovel.preco <= preco_max)
    if area_min is not None:
        query = query.filter(Imovel.area >= area_min)
    if q:
        termo = f"%{_escapar_like(q.lower())}%"
        query = query.filter(
            func.lower(Imovel.titulo).like(termo, escape="\\")
            | func.lower(Imovel.subtitulo).like(termo, escape="\\")
            | func.lower(Imovel.bairro).like(termo, escape="\\")
            | func.lower(Imovel.cidade).like(termo, escape="\\")
            | func.lower(Imovel.ref).like(termo, escape="\\")
        )

    ordenadores = {
        "recentes": Imovel.publicado_em.desc(),
        "menor": Imovel.preco.asc(),
        "maior": Imovel.preco.desc(),
        "area": Imovel.area.desc(),
    }
    query = query.order_by(ordenadores.get(ordem, ordenadores["recentes"])).limit(limit).offset(offset)

    return [_serializar_publico(i) for i in query.all()]


@router.get("/{slug}", response_model=ImovelPublicoOut)
def obter_por_slug(slug: str, db: Session = Depends(get_db)):
    imovel = db.query(Imovel).filter(Imovel.slug == slug, Imovel.status == "published").first()
    if not imovel:
        raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail="Imóvel não encontrado")
    return _serializar_publico(imovel)


# ---------- Área autenticada (admin vê tudo; corretor só os próprios) ----------

def _checar_dono_ou_admin(imovel: Imovel, usuario: Usuario) -> None:
    """Para não-admin, resposta é sempre 404 (nunca 403) — não revela que o
    recurso existe quando não pertence a quem está pedindo."""
    if usuario.role != "admin" and imovel.criado_por_id != usuario.id:
        raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail="Imóvel não encontrado")


@router.get("/admin/todos", response_model=list[ImovelOut])
def listar_todos(db: Session = Depends(get_db), _admin: Usuario = Depends(get_current_admin)):
    """Somente admin — visão completa da plataforma."""
    return db.query(Imovel).order_by(Imovel.criado_em.desc()).all()


@router.get("/admin/meus", response_model=list[ImovelOut])
def listar_meus(db: Session = Depends(get_db), usuario: Usuario = Depends(get_current_user)):
    """Admin ou corretor — só os imóveis que o próprio usuário cadastrou."""
    return (
        db.query(Imovel)
        .filter(Imovel.criado_por_pk == usuario.pk)
        .order_by(Imovel.criado_em.desc())
        .all()
    )


@router.get("/admin/{imovel_uuid}", response_model=ImovelOut)
def obter_por_id(imovel_uuid: str, db: Session = Depends(get_db), usuario: Usuario = Depends(get_current_user)):
    imovel = db.query(Imovel).filter(Imovel.uuid == imovel_uuid).first()
    if not imovel:
        raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail="Imóvel não encontrado")
    _checar_dono_ou_admin(imovel, usuario)
    return imovel


@router.post("/admin", response_model=ImovelOut, status_code=status.HTTP_201_CREATED)
def criar_imovel(
    payload: ImovelCreate,
    db: Session = Depends(get_db),
    usuario: Usuario = Depends(get_current_user),
):
    dados = payload.model_dump()
    dados["videos"] = [v.model_dump() if hasattr(v, "model_dump") else v for v in dados.get("videos", [])]

    # Corretor não escolhe o status livremente — segue a configuração de aprovação do admin.
    if usuario.role != "admin":
        config = obter_configuracao(db)
        dados["status"] = "pending" if config.requer_aprovacao_imovel else "published"

    slug = dados.pop("slug", None) or slugify(payload.titulo)
    slug_base, i = slug, 2
    while db.query(Imovel).filter(Imovel.slug == slug).first():
        slug = f"{slug_base}-{i}"
        i += 1

    ref = dados.pop("ref", None)
    if not ref:
        ref = gerar_ref()
        while db.query(Imovel).filter(Imovel.ref == ref).first():
            ref = gerar_ref()

    imovel = Imovel(**dados, slug=slug, ref=ref, criado_por_pk=usuario.pk)
    db.add(imovel)
    db.commit()
    db.refresh(imovel)
    return imovel


@router.patch("/admin/{imovel_uuid}", response_model=ImovelOut)
def atualizar_imovel(
    imovel_uuid: str,
    payload: ImovelUpdate,
    db: Session = Depends(get_db),
    usuario: Usuario = Depends(get_current_user),
):
    imovel = db.query(Imovel).filter(Imovel.uuid == imovel_uuid).first()
    if not imovel:
        raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail="Imóvel não encontrado")
    _checar_dono_ou_admin(imovel, usuario)

    dados = payload.model_dump(exclude_unset=True)
    if "videos" in dados:
        dados["videos"] = [v.model_dump() if hasattr(v, "model_dump") else v for v in dados["videos"]]

    # Corretor não pode mudar o próprio status para burlar a aprovação.
    if usuario.role != "admin":
        dados.pop("status", None)

    for campo, valor in dados.items():
        setattr(imovel, campo, valor)

    db.commit()
    db.refresh(imovel)
    return imovel


@router.delete("/admin/{imovel_uuid}", status_code=status.HTTP_204_NO_CONTENT)
def excluir_imovel(
    imovel_uuid: str,
    db: Session = Depends(get_db),
    usuario: Usuario = Depends(get_current_user),
):
    imovel = db.query(Imovel).filter(Imovel.uuid == imovel_uuid).first()
    if not imovel:
        raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail="Imóvel não encontrado")
    _checar_dono_ou_admin(imovel, usuario)
    db.delete(imovel)
    db.commit()
