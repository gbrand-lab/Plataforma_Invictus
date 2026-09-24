from pathlib import Path

from pydantic import field_validator
from pydantic_settings import BaseSettings, SettingsConfigDict

_PLACEHOLDERS = ("teste", "troque", "changeme", "secret", "senha")

_ENV_FILE = Path(__file__).resolve().parent.parent / ".env"


class Settings(BaseSettings):
    database_url: str
    jwt_secret: str
    jwt_expire_minutes: int = 1440
    cors_origins: str = "http://localhost:3000"

    # Fotos de imóveis: sem isso, upload cai no disco local (uploads/) — ok em dev,
    # mas some a cada deploy no Railway. Preencher no .env de produção.
    cloudinary_cloud_name: str | None = None
    cloudinary_api_key: str | None = None
    cloudinary_api_secret: str | None = None

    # Aviso automático de imóvel novo pros leads cadastrados (ver app/email.py).
    # Sem essas 2 variáveis preenchidas, o envio é pulado silenciosamente.
    resend_api_key: str | None = None
    resend_remetente_email: str | None = None
    resend_remetente_nome: str = "Invictus Imóveis"
    frontend_base_url: str = "https://www.imobiliariainvictus.com.br"

    model_config = SettingsConfigDict(env_file=_ENV_FILE, env_file_encoding="utf-8")

    @field_validator("jwt_secret")
    @classmethod
    def _jwt_secret_forte(cls, v: str) -> str:
        if len(v) < 32 or any(p in v.lower() for p in _PLACEHOLDERS):
            raise ValueError(
                "JWT_SECRET fraco ou placeholder. Gere um valor forte, ex.: "
                "python -c \"import secrets; print(secrets.token_urlsafe(64))\""
            )
        return v

    @property
    def cors_origins_list(self) -> list[str]:
        return [origin.strip() for origin in self.cors_origins.split(",") if origin.strip()]

    @property
    def cloudinary_configurado(self) -> bool:
        return bool(self.cloudinary_cloud_name and self.cloudinary_api_key and self.cloudinary_api_secret)

    @property
    def resend_configurado(self) -> bool:
        return bool(self.resend_api_key and self.resend_remetente_email)


settings = Settings()
