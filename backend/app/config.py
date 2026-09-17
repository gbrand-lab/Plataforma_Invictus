from pydantic import field_validator
from pydantic_settings import BaseSettings, SettingsConfigDict

_PLACEHOLDERS = ("teste", "troque", "changeme", "secret", "senha")


class Settings(BaseSettings):
    database_url: str
    jwt_secret: str
    jwt_expire_minutes: int = 1440
    cors_origins: str = "http://localhost:3000"

    model_config = SettingsConfigDict(env_file=".env", env_file_encoding="utf-8")

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


settings = Settings()
