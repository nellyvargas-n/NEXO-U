from typing import Literal
from pydantic import AliasChoices, Field
from pydantic_settings import BaseSettings, SettingsConfigDict

class Settings(BaseSettings):
    database_url: str = ""
    database_url_unpooled: str = ""
    demo_emitter_key: str = "change-me-for-local-demo"
    cors_origins: str = "http://localhost:5173"
    jwt_secret: str = ""
    jwt_algorithm: Literal["HS256"] = "HS256"
    # Acepta el nombre del .env del usuario y el nombre usado por versiones anteriores.
    jwt_exp_minutes: int = Field(default=60, ge=5, le=10080,
                                 validation_alias=AliasChoices("JWT_EXP_MINUTES", "ACCESS_TOKEN_EXPIRE_MINUTES"))
    demo_mode: bool = False
    public_frontend_url: str = "http://localhost:5173"
    smtp_host: str = ""
    smtp_port: int = 587
    smtp_username: str = ""
    smtp_password: str = ""
    smtp_from: str = ""
    smtp_starttls: bool = True
    gemini_api_key: str = ""
    gemini_model: str = "gemini-2.5-flash"
    environment: Literal["development", "testing", "production"] = "development"
    model_config = SettingsConfigDict(env_file=".env", extra="ignore")

settings = Settings()
