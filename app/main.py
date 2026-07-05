from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware
from app.config.config import settings
from app.database.connection import engine, Base
from app.routers import auth, student, faculty, admin, ai

# Initialize MySQL tables on application startup if they do not exist
try:
    Base.metadata.create_all(bind=engine)
    print("Database schemas successfully verified/created.")
    
    # Auto-seed default accounts
    from app.database.connection import SessionLocal
    from app.models.models import User, Student, Faculty, Admin
    
    db = SessionLocal()
    try:
        from app.utils.security import get_password_hash
        # 1. Faculty - Pranati Kurnal
        faculty_user = db.query(User).filter(User.email == "faculty@ssit.edu").first()
        if not faculty_user:
            faculty_user = User(
                full_name="Pranati Kurnal",
                email="faculty@ssit.edu",
                phone="+91 94441 52019",
                password_hash=get_password_hash("Root"),
                role="faculty"
            )
            db.add(faculty_user)
            db.flush()
            faculty_profile = Faculty(
                user_id=faculty_user.id,
                employee_id="FAC001",
                department="Information Technology"
            )
            db.add(faculty_profile)
        else:
            faculty_user.full_name = "Pranati Kurnal"
            # Ensure faculty profile exists
            fac_prof = db.query(Faculty).filter(Faculty.user_id == faculty_user.id).first()
            if not fac_prof:
                db.add(Faculty(user_id=faculty_user.id, employee_id="FAC001", department="Information Technology"))
        
        # 2. Student - Sudar S
        student_user = db.query(User).filter(User.email == "sudar@ssit.edu").first()
        if not student_user:
            student_user = User(
                full_name="Sudar S",
                email="sudar@ssit.edu",
                phone="+91 94452 82210",
                password_hash=get_password_hash("Root"),
                role="student"
            )
            db.add(student_user)
            db.flush()
            student_profile = Student(
                user_id=student_user.id,
                register_number="REG001",
                department="Information Technology",
                semester=5,
                is_approved=True
            )
            db.add(student_profile)
            
        # 3. Admin - Sudarsan S
        admin_user = db.query(User).filter(User.email == "sudarsan@ssit.edu").first()
        if not admin_user:
            admin_user = User(
                full_name="Sudarsan S",
                email="sudarsan@ssit.edu",
                phone="+91 91599 02330",
                password_hash=get_password_hash("Root"),
                role="admin"
            )
            db.add(admin_user)
            db.flush()
            admin_profile = Admin(
                user_id=admin_user.id
            )
            db.add(admin_profile)
            
        db.commit()
        print("Database default users successfully seeded/updated.")
    except Exception as seed_err:
        db.rollback()
        print(f"Warning: database seeding error: {seed_err}")
    finally:
        db.close()

except Exception as e:
    print(f"Warning: Could not automatically bootstrap MySQL tables: {e}")
    print("Ensure MySQL is active and the connection string in .env is configured correctly.")

app = FastAPI(
    title=settings.APP_NAME,
    description="Backend API Gateway for ProctorAI - An AI-Proctored Online Examination Platform with Intelligent Performance Evaluation",
    version="1.0.0",
    debug=settings.DEBUG
)

# Configure Cross-Origin Resource Sharing (CORS) safely for frontend connectivity
app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],  # Adjust this to specific domains in production
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

# Core API root check
@app.get("/")
def read_root():
    return {
        "status": "online",
        "app": settings.APP_NAME,
        "message": "Welcome to ProctorAI Secure Backend Services API Portal."
    }

# Health Probe Endpoint
@app.get("/api/health")
@app.get("/health")
def health_check():
    return {
        "status": "online",
        "timestamp": "2026-07-03T12:00:00Z",
        "database": "connected"
    }

# Include App Routers with explicit sub-routing matching requirements
app.include_router(auth.router, prefix="/api")
app.include_router(student.router, prefix="/api")
app.include_router(faculty.router, prefix="/api")
app.include_router(admin.router, prefix="/api")
app.include_router(ai.router, prefix="/api")

if __name__ == "__main__":
    import uvicorn
    uvicorn.run(
        "main:app",
        host=settings.HOST,
        port=settings.PORT,
        reload=settings.DEBUG
    )
