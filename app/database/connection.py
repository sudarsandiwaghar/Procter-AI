from sqlalchemy import create_engine
from sqlalchemy.ext.declarative import declarative_base
from sqlalchemy.orm import sessionmaker
from app.config.config import settings

# Engine configuration with appropriate settings for the selected dialect
connect_args = {}
engine_kwargs = {"echo": settings.DEBUG}

db_url = settings.DATABASE_URL

if not db_url.startswith("sqlite"):
    # Attempt to test MySQL engine connectivity. If it fails, fallback to local SQLite database to prevent crash and ensure database works.
    try:
        temp_engine = create_engine(db_url, **engine_kwargs)
        with temp_engine.connect() as conn:
            pass
        print("Successfully connected to MySQL database.")
        engine_kwargs.update({
            "pool_size": 10,
            "max_overflow": 20,
            "pool_timeout": 30,
            "pool_recycle": 1800,
            "pool_pre_ping": True
        })
    except Exception as e:
        print(f"MySQL connection failed ({e}). Falling back to robust SQLite database...")
        db_url = "sqlite:///./proctorai.db"
        connect_args = {"check_same_thread": False}
        engine_kwargs = {"echo": settings.DEBUG}
else:
    connect_args = {"check_same_thread": False}

engine = create_engine(
    db_url,
    connect_args=connect_args,
    **engine_kwargs
)

SessionLocal = sessionmaker(autocommit=False, autoflush=False, bind=engine)

Base = declarative_base()

def get_db():
    """
    FastAPI dependency that provides a transactional database session.
    Automatically closes the session once the request is complete.
    """
    db = SessionLocal()
    try:
        yield db
    finally:
        db.close()
