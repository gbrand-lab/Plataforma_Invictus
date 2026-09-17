import uuid as uuid_lib
from datetime import datetime, date

from sqlalchemy import JSON, Boolean, Date, DateTime, Float, ForeignKey, Integer, String, Text
from sqlalchemy.orm import Mapped, mapped_column, relationship

from .database import Base


def _novo_uuid() -> str:
    return str(uuid_lib.uuid4())


class Usuario(Base):
    __tablename__ = "usuarios"

    # PK interna (auto-incremento) — nunca exposta em URL/API; usada só para FKs no banco.
    pk: Mapped[int] = mapped_column("id", Integer, primary_key=True)
    uuid: Mapped[str] = mapped_column(String(36), unique=True, index=True, default=_novo_uuid)
    nome: Mapped[str] = mapped_column(String(120))
    email: Mapped[str] = mapped_column(String(180), unique=True, index=True)
    telefone: Mapped[str | None] = mapped_column(String(30), nullable=True)
    senha_hash: Mapped[str] = mapped_column(String(255))
    # 'admin' (criado via script) ou 'corretor' (cadastro público em /corretor/cadastro).
    role: Mapped[str] = mapped_column(String(20), default="admin")
    criado_em: Mapped[datetime] = mapped_column(DateTime, default=datetime.utcnow)

    @property
    def id(self) -> str:
        """Identificador público — é o uuid, não a PK interna sequencial."""
        return self.uuid


class Lead(Base):
    """Contato de quem pediu para ser avisado de novos imóveis (drawer do site público)."""

    __tablename__ = "leads"

    pk: Mapped[int] = mapped_column("id", Integer, primary_key=True)
    uuid: Mapped[str] = mapped_column(String(36), unique=True, index=True, default=_novo_uuid)
    nome: Mapped[str] = mapped_column(String(120))
    telefone: Mapped[str] = mapped_column(String(30))
    email: Mapped[str] = mapped_column(String(180))
    criado_em: Mapped[datetime] = mapped_column(DateTime, default=datetime.utcnow)

    @property
    def id(self) -> str:
        return self.uuid


class ConfiguracaoApp(Base):
    """Linha única (id=1) com as configurações gerais editáveis pelo admin."""

    __tablename__ = "configuracao_app"

    id: Mapped[int] = mapped_column(Integer, primary_key=True)
    requer_aprovacao_imovel: Mapped[bool] = mapped_column(Boolean, default=False)


class Imovel(Base):
    __tablename__ = "imoveis"

    # PK interna (auto-incremento) — nunca exposta em URL/API; usada só para FKs no banco.
    pk: Mapped[int] = mapped_column("id", Integer, primary_key=True)
    uuid: Mapped[str] = mapped_column(String(36), unique=True, index=True, default=_novo_uuid)
    ref: Mapped[str] = mapped_column(String(30), unique=True, index=True)
    slug: Mapped[str] = mapped_column(String(220), unique=True, index=True)
    titulo: Mapped[str] = mapped_column(String(200))
    subtitulo: Mapped[str | None] = mapped_column(String(200), nullable=True)
    descricao: Mapped[str] = mapped_column(Text)

    finalidade: Mapped[str] = mapped_column(String(10))  # venda | aluguel | repasse
    categoria: Mapped[str] = mapped_column(String(20))  # apartamento | casa | terreno | comercial

    preco: Mapped[float] = mapped_column(Float)
    condominio: Mapped[float] = mapped_column(Float, default=0)
    iptu: Mapped[float] = mapped_column(Float, default=0)

    cidade: Mapped[str] = mapped_column(String(120))
    bairro: Mapped[str] = mapped_column(String(120))
    endereco: Mapped[str] = mapped_column(String(220))
    lat: Mapped[float | None] = mapped_column(Float, nullable=True)
    lng: Mapped[float | None] = mapped_column(Float, nullable=True)
    localizacao_aproximada: Mapped[bool] = mapped_column(Boolean, default=True)

    quartos: Mapped[int] = mapped_column(Integer, default=0)
    suites: Mapped[int] = mapped_column(Integer, default=0)
    banheiros: Mapped[int] = mapped_column(Integer, default=0)
    vagas: Mapped[int] = mapped_column(Integer, default=0)
    area: Mapped[float] = mapped_column(Float)

    caracteristicas: Mapped[list] = mapped_column(JSON, default=list)
    imagens: Mapped[list] = mapped_column(JSON, default=list)
    videos: Mapped[list] = mapped_column(JSON, default=list)

    corretor: Mapped[str] = mapped_column(String(120))
    creci: Mapped[str | None] = mapped_column(String(60), nullable=True)
    telefone: Mapped[str | None] = mapped_column(String(30), nullable=True)
    whatsapp: Mapped[str | None] = mapped_column(String(30), nullable=True)

    publicado_em: Mapped[date] = mapped_column(Date, default=date.today)
    # draft | pending | published | sold | rented | inactive
    status: Mapped[str] = mapped_column(String(20), default="draft")
    destaque: Mapped[bool] = mapped_column(Boolean, default=False)
    na_chave: Mapped[bool] = mapped_column(Boolean, default=False)
    novo: Mapped[bool] = mapped_column(Boolean, default=True)
    visualizacoes: Mapped[int] = mapped_column(Integer, default=0)

    criado_por_pk: Mapped[int | None] = mapped_column("criado_por_id", ForeignKey("usuarios.id"), nullable=True)
    criado_por: Mapped["Usuario"] = relationship()

    criado_em: Mapped[datetime] = mapped_column(DateTime, default=datetime.utcnow)
    atualizado_em: Mapped[datetime] = mapped_column(DateTime, default=datetime.utcnow, onupdate=datetime.utcnow)

    @property
    def id(self) -> str:
        """Identificador público — é o uuid, não a PK interna sequencial."""
        return self.uuid

    @property
    def criado_por_id(self) -> str | None:
        return self.criado_por.uuid if self.criado_por else None

    @property
    def criado_por_nome(self) -> str | None:
        return self.criado_por.nome if self.criado_por else None
