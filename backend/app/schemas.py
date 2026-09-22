from datetime import date, datetime
from typing import Literal

from pydantic import BaseModel, ConfigDict, EmailStr, Field

Finalidade = Literal["venda", "aluguel", "repasse"]
Categoria = Literal["apartamento", "casa_solta", "casa_condominio", "terreno", "comercial"]
StatusImovel = Literal["draft", "pending", "published", "sold", "rented"]


class Video(BaseModel):
    titulo: str
    duracao: str
    url: str | None = None


# ---------- Auth ----------

class LoginPayload(BaseModel):
    email: EmailStr
    senha: str


class RegistroCorretorPayload(BaseModel):
    nome: str
    email: EmailStr
    telefone: str
    senha: str = Field(min_length=10, max_length=72)


class TokenResponse(BaseModel):
    access_token: str
    token_type: str = "bearer"


class UsuarioOut(BaseModel):
    model_config = ConfigDict(from_attributes=True)

    id: str
    nome: str
    email: EmailStr
    telefone: str | None = None
    role: str
    criado_em: datetime


class UsuarioComContagem(UsuarioOut):
    total_imoveis: int = 0


# ---------- Imóvel ----------

class ImovelBase(BaseModel):
    titulo: str
    subtitulo: str | None = None
    descricao: str
    finalidade: Finalidade
    categoria: Categoria
    preco: float = Field(ge=0)
    condominio: float = 0
    iptu: float = 0
    cidade: str
    bairro: str = Field(min_length=1)
    endereco: str
    lat: float | None = None
    lng: float | None = None
    localizacao_aproximada: bool = True
    quartos: int = 0
    suites: int = 0
    banheiros: int = 0
    vagas: int = 0
    area: float = Field(ge=0, default=0)
    area_construida: float = Field(ge=0, default=0)
    area_total: float = Field(ge=0, default=0)
    caracteristicas: list[str] = []
    imagens: list[str] = []
    videos: list[Video] = []
    corretor: str
    creci: str | None = None
    telefone: str | None = None
    whatsapp: str | None = None
    status: StatusImovel = "draft"
    destaque: bool = False
    na_chave: bool = False
    novo: bool = True


class ImovelCreate(ImovelBase):
    ref: str | None = None
    slug: str | None = None
    # Preenchido automaticamente pelo backend a partir de quem está logado — ver routers/imoveis.py.
    corretor: str | None = None
    # Só no cadastro — sobrescreve o `imagens: list[str] = []` de ImovelBase (que também serve de
    # saída/leitura, onde não dá pra exigir 3 fotos de imóveis antigos já cadastrados com menos).
    imagens: list[str] = Field(min_length=3)


class ImovelUpdate(BaseModel):
    """Todos os campos opcionais — permite PATCH parcial."""
    titulo: str | None = None
    subtitulo: str | None = None
    descricao: str | None = None
    finalidade: Finalidade | None = None
    categoria: Categoria | None = None
    preco: float | None = None
    condominio: float | None = None
    iptu: float | None = None
    cidade: str | None = None
    bairro: str | None = Field(default=None, min_length=1)
    endereco: str | None = None
    lat: float | None = None
    lng: float | None = None
    localizacao_aproximada: bool | None = None
    quartos: int | None = None
    suites: int | None = None
    banheiros: int | None = None
    vagas: int | None = None
    area: float | None = None
    area_construida: float | None = None
    area_total: float | None = None
    caracteristicas: list[str] | None = None
    imagens: list[str] | None = None
    videos: list[Video] | None = None
    corretor: str | None = None
    creci: str | None = None
    telefone: str | None = None
    whatsapp: str | None = None
    status: StatusImovel | None = None
    destaque: bool | None = None
    na_chave: bool | None = None
    novo: bool | None = None


class ImovelOut(ImovelBase):
    """Uso interno (admin/corretor) — inclui contato e quem cadastrou."""

    model_config = ConfigDict(from_attributes=True)

    id: str
    ref: str
    slug: str
    publicado_em: date
    visualizacoes: int
    criado_em: datetime
    atualizado_em: datetime
    criado_por_id: str | None = None
    criado_por_nome: str | None = None


class ImovelPublicoOut(BaseModel):
    """Uso público (site + /parceiros) — sem contato do corretor nem quem cadastrou."""

    model_config = ConfigDict(from_attributes=True)

    id: str
    ref: str
    slug: str
    titulo: str
    subtitulo: str | None = None
    descricao: str
    finalidade: Finalidade
    categoria: Categoria
    preco: float
    condominio: float
    iptu: float
    cidade: str
    bairro: str
    endereco: str
    lat: float | None = None
    lng: float | None = None
    quartos: int
    suites: int
    banheiros: int
    vagas: int
    area: float
    area_construida: float = 0
    area_total: float = 0
    caracteristicas: list[str] = []
    imagens: list[str] = []
    videos: list[Video] = []
    status: StatusImovel
    destaque: bool
    na_chave: bool
    novo: bool
    publicado_em: date
    visualizacoes: int


# ---------- Lead ----------

class LeadCreate(BaseModel):
    nome: str = Field(min_length=2, max_length=120)
    telefone: str = Field(min_length=8, max_length=30)
    email: EmailStr


class LeadOut(BaseModel):
    model_config = ConfigDict(from_attributes=True)

    id: str
    nome: str
    telefone: str
    email: EmailStr
    criado_em: datetime


# ---------- Configuração ----------

class ConfiguracaoOut(BaseModel):
    model_config = ConfigDict(from_attributes=True)

    requer_aprovacao_imovel: bool


class ConfiguracaoUpdate(BaseModel):
    requer_aprovacao_imovel: bool
