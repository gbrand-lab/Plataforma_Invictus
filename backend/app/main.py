from pathlib import Path

from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware
from fastapi.staticfiles import StaticFiles
from slowapi import _rate_limit_exceeded_handler
from slowapi.errors import RateLimitExceeded
from slowapi.middleware import SlowAPIMiddleware
from sqlalchemy import inspect, text

from .config import settings
from .database import Base, engine
from .limiter import limiter
from .routers import auth, config, imoveis, leads, uploads, usuarios

Base.metadata.create_all(bind=engine)


def _adicionar_colunas_novas() -> None:
    """Sem Alembic: garante colunas novas em bancos já existentes (create_all só cria tabelas)."""
    inspetor = inspect(engine)
    if "imoveis" not in inspetor.get_table_names():
        return
    colunas = {c["name"] for c in inspetor.get_columns("imoveis")}
    faltantes = {"area_construida": "FLOAT DEFAULT 0", "area_total": "FLOAT DEFAULT 0"}
    with engine.begin() as conn:
        for nome, definicao in faltantes.items():
            if nome not in colunas:
                conn.execute(text(f"ALTER TABLE imoveis ADD COLUMN {nome} {definicao}"))


_adicionar_colunas_novas()

UPLOADS_DIR = Path(__file__).resolve().parent.parent / "uploads"
UPLOADS_DIR.mkdir(exist_ok=True)

app = FastAPI(title="Invictus API", version="0.1.0")

app.state.limiter = limiter
app.add_exception_handler(RateLimitExceeded, _rate_limit_exceeded_handler)
app.add_middleware(SlowAPIMiddleware)

app.add_middleware(
    CORSMiddleware,
    allow_origins=settings.cors_origins_list,
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

app.include_router(auth.router)
app.include_router(imoveis.router)
app.include_router(usuarios.router)
app.include_router(config.router)
app.include_router(leads.router)
app.include_router(uploads.router)

app.mount("/uploads", StaticFiles(directory=UPLOADS_DIR), name="uploads")


@app.get("/health")
def health():
    return {"status": "ok"}
