from typing import List, Optional, Union
from pydantic import AnyHttpUrl, PostgresDsn, computed_field
from pydantic_settings import BaseSettings, SettingsConfigDict

class Settings(BaseSettings):
    PROJECT_NAME: str = "WaveGuard"
    API_V1_STR: str = "/api/v1"
    
    POSTGRES_USER: str
    POSTGRES_PASSWORD: str
    POSTGRES_DB: str
    DATABASE_URL: Optional[PostgresDsn] = None

    @computed_field
    @property
    def SQLALCHEMY_DATABASE_URI(self) -> PostgresDsn:
        if self.DATABASE_URL:
            return self.DATABASE_URL
        return PostgresDsn.build(
            scheme="postgresql+asyncpg",
            username=self.POSTGRES_USER,
            password=self.POSTGRES_PASSWORD,
            host="waveguard-db",
            path=self.POSTGRES_DB,
        )

    BACKEND_PORT: int = 8000
    BACKEND_CORS_ORIGINS: List[AnyHttpUrl] = []

    WAVEGUARD_ARMED_DEFAULT: bool = True
    WAVEGUARD_Z_THRESHOLD: float = 2.5
    WAVEGUARD_DEBOUNCE_SECONDS: int = 10
    WAVEGUARD_MIN_TRIGGER_SAMPLES: int = 3
    WAVEGUARD_WINDOW_SECONDS: int = 60

    TELEGRAM_BOT_TOKEN: Optional[str] = None
    TELEGRAM_CHAT_ID: Optional[str] = None

    model_config = SettingsConfigDict(env_file=".env", case_sensitive=True, extra="ignore")

settings = Settings()
