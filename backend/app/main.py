from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware
from slowapi import _rate_limit_exceeded_handler
from slowapi.errors import RateLimitExceeded
from slowapi.middleware import SlowAPIMiddleware

from .config import settings
from .database import Base, engine
from .limiter import limiter
from .routers import auth, config, imoveis, leads, usuarios

Base.metadata.create_all(bind=engine)

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


@app.get("/health")
def health():
    return {"status": "ok"}
