from pydantic_settings import BaseSettings

class Settings(BaseSettings):
    PROJECT_NAME: str = "Job Hunt AI"
    DATABASE_URL: str = "sqlite:///./jobhunt.db"  # Default to SQLite for easy start, can switch to Postgres
    SECRET_KEY: str = "supersecretkey"
    ALGORITHM: str = "HS256"
    ACCESS_TOKEN_EXPIRE_MINUTES: int = 30
    
    # AI / LLM
    OPENAI_API_KEY: str = ""
    
    # Telegram
    TELEGRAM_BOT_TOKEN: str = ""
    
    class Config:
        env_file = ".env"

settings = Settings()
