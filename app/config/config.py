from pydantic_settings import BaseSettings
from pydantic import Field

class Settings(BaseSettings):
    DATABASE_URL: str = Field(default="sqlite:///./proctorai.db")
    JWT_SECRET_KEY: str = Field(default="your_super_secret_jwt_signing_key_must_be_long_and_random_64_chars_recommended")
    JWT_ALGORITHM: str = "HS256"
    ACCESS_TOKEN_EXPIRE_MINUTES: int = 1440
    GEMINI_API_KEY: str = Field(default="")
    APP_NAME: str = "ProctorAI-Backend"
    DEBUG: bool = True
    HOST: str = "0.0.0.0"
    PORT: int = 8000

    class Config:
        env_file = ".env"
        env_file_encoding = "utf-8"
        case_sensitive = True

settings = Settings()

# Clean up DATABASE_URL to handle env formatting anomalies and quote wrappers robustly
db_url = settings.DATABASE_URL.strip()
if db_url.startswith("DATABASE_URL="):
    db_url = db_url[len("DATABASE_URL="):].strip()
while (db_url.startswith('"') and db_url.endswith('"')) or (db_url.startswith("'") and db_url.endswith("'")):
    db_url = db_url[1:-1].strip()
if db_url.startswith("mysql://"):
    db_url = db_url.replace("mysql://", "mysql+pymysql://", 1)
if not db_url or db_url.lower() in ("none", "undefined", "null"):
    db_url = "sqlite:///./proctorai.db"

settings.DATABASE_URL = db_url

