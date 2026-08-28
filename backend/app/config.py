from pydantic_settings import BaseSettings, SettingsConfigDict


class Settings(BaseSettings):
    model_config = SettingsConfigDict(env_file=".env", extra="ignore")

    database_url: str = "postgresql+asyncpg://postgres:postgres@localhost:5433/aqms"
    cors_origins: list[str] = ["http://localhost:5173"]
    jwt_secret: str = "change-me"


settings = Settings()
