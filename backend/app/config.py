import os
from pathlib import Path
from dotenv import load_dotenv
from typing import List

# Load .env file from backend directory
backend_dir = Path(__file__).parent.parent
env_file = backend_dir / ".env"
load_dotenv(dotenv_path=env_file)

print(f"[CONFIG] Looking for .env at: {env_file}")
print(f"[CONFIG] .env exists: {env_file.exists()}")


class Settings:
    def __init__(self):
        self.MONGO_URI = os.getenv("MONGO_URI")
        self.MONGO_DB = os.getenv("MONGO_DB")
        self.JWT_SECRET = os.getenv("JWT_SECRET")
        self.JWT_ALG = os.getenv("JWT_ALG", "HS256")
        self.JWT_EXPIRE_MINUTES = int(os.getenv("JWT_EXPIRE_MINUTES", "10080"))
        self.CORS_ORIGINS = os.getenv("CORS_ORIGINS", "http://localhost:5173")
        self.KLAVIYO_API_KEY = os.getenv("KLAVIYO_API_KEY", "")
        
        print(f"[CONFIG] MONGO_URI: {'set' if self.MONGO_URI else 'NOT SET'}")
        print(f"[CONFIG] JWT_SECRET: {'set' if self.JWT_SECRET else 'NOT SET'}")
        print(f"[CONFIG] CORS_ORIGINS: {self.CORS_ORIGINS}")

    def cors_origins_list(self) -> List[str]:
        return [o.strip() for o in self.CORS_ORIGINS.split(",") if o.strip()]


settings = Settings()
