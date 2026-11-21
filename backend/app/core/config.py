from pydantic_settings import BaseSettings, SettingsConfigDict

class Settings(BaseSettings):
    database_url: str = "sqlite:///./nexo_u.db"
    demo_emitter_key: str = "change-me-for-local-demo"
    cors_origins: str = "http://localhost:5173"
    jwt_secret: str = ""
    jwt_exp_minutes: int = 120
    demo_mode: bool = False
    model_config = SettingsConfigDict(env_file=".env", extra="ignore")

settings = Settings()
