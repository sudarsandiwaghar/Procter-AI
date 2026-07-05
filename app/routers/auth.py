from fastapi import APIRouter, Depends, HTTPException, status
from sqlalchemy.orm import Session
from app.database.connection import get_db
from app.models.models import User, Student, Faculty, Admin
from app.schemas.schemas import (
    StudentRegisterRequest, UserLogin, Token, UserOut,
    ChangePasswordRequest
)
from app.utils.security import get_password_hash, verify_password, create_access_token
from app.middleware.auth import get_current_user

router = APIRouter(prefix="/auth", tags=["Authentication"])

@router.post("/student/register", status_code=status.HTTP_201_CREATED)
def register_student(payload: StudentRegisterRequest, db: Session = Depends(get_db)):
    """
    Registers a new student account, hashing their password and storing user and profile records.
    """
    email_clean = payload.email.strip().lower()
    
    # 1. Check if user already exists
    existing_user = db.query(User).filter(User.email == email_clean).first()
    if existing_user:
        raise HTTPException(
            status_code=status.HTTP_409_CONFLICT,
            detail="A user with this email address already exists."
        )
        
    # 2. Check if register number already exists
    existing_student = db.query(Student).filter(Student.register_number == payload.register_number.strip()).first()
    if existing_student:
        raise HTTPException(
            status_code=status.HTTP_409_CONFLICT,
            detail="A student with this register number already exists."
        )

    # 3. Hash password
    pw_hash = get_password_hash(payload.password)

    # 4. Create base User
    new_user = User(
        full_name=payload.full_name.strip(),
        email=email_clean,
        phone=payload.phone,
        password_hash=pw_hash,
        role="student"
    )
    db.add(new_user)
    db.flush()  # Extract new_user.id

    # 5. Create student profile
    new_student = Student(
        user_id=new_user.id,
        register_number=payload.register_number.strip(),
        department=payload.department.strip(),
        semester=payload.semester,
        is_approved=True  # Automatically approve for local deployment ease, can change as needed
    )
    db.add(new_student)
    db.commit()

    return {
        "user_id": new_user.id,
        "email": email_clean,
        "message": "Student account successfully registered. Please log in to authenticate."
    }


@router.post("/student/login", response_model=Token)
def login_student(credentials: UserLogin, db: Session = Depends(get_db)):
    """
    Authenticates a student using email and password, returning a JWT token upon success.
    """
    email_clean = credentials.email.strip().lower()
    user = db.query(User).filter(User.email == email_clean, User.role == "student").first()
    
    if not user or not verify_password(credentials.password, user.password_hash):
        raise HTTPException(
            status_code=status.HTTP_401_UNAUTHORIZED,
            detail="Invalid student credentials. Please check your email or password."
        )

    student_profile = db.query(Student).filter(Student.user_id == user.id).first()
    if student_profile and not student_profile.is_approved:
        raise HTTPException(
            status_code=status.HTTP_403_FORBIDDEN,
            detail="Your student account has not been approved by the Admin yet."
        )

    access_token = create_access_token(subject=user.email, role="student")
    return {
        "access_token": access_token,
        "token_type": "bearer",
        "role": "student",
        "full_name": user.full_name,
        "user_id": user.id
    }


@router.post("/faculty/login", response_model=Token)
def login_faculty(credentials: UserLogin, db: Session = Depends(get_db)):
    """
    Authenticates a faculty user using email and password, returning a JWT token upon success.
    """
    email_clean = credentials.email.strip().lower()
    user = db.query(User).filter(User.email == email_clean, User.role == "faculty").first()
    
    if not user or not verify_password(credentials.password, user.password_hash):
        raise HTTPException(
            status_code=status.HTTP_401_UNAUTHORIZED,
            detail="Invalid faculty credentials. Please check your email or password."
        )

    access_token = create_access_token(subject=user.email, role="faculty")
    return {
        "access_token": access_token,
        "token_type": "bearer",
        "role": "faculty",
        "full_name": user.full_name,
        "user_id": user.id
    }


@router.post("/admin/login", response_model=Token)
def login_admin(credentials: UserLogin, db: Session = Depends(get_db)):
    """
    Authenticates an admin user using email and password, returning a JWT token upon success.
    """
    email_clean = credentials.email.strip().lower()
    user = db.query(User).filter(User.email == email_clean, User.role == "admin").first()
    
    if not user or not verify_password(credentials.password, user.password_hash):
        raise HTTPException(
            status_code=status.HTTP_401_UNAUTHORIZED,
            detail="Invalid administrator credentials. Please check your email or password."
        )

    access_token = create_access_token(subject=user.email, role="admin")
    return {
        "access_token": access_token,
        "token_type": "bearer",
        "role": "admin",
        "full_name": user.full_name,
        "user_id": user.id
    }


@router.post("/logout")
def logout_user():
    """
    Stateless JWT logout endpoint. Simply advises the client to purge their token store.
    """
    return {"message": "Successfully logged out from ProctorAI. Client-side token storage can now be purged."}


@router.get("/profile")
def get_user_profile(current_user: User = Depends(get_current_user), db: Session = Depends(get_db)):
    """
    Returns the currently logged-in user's details, embedding student/faculty specific fields.
    """
    profile_data = {
        "id": current_user.id,
        "full_name": current_user.full_name,
        "email": current_user.email,
        "phone": current_user.phone,
        "role": current_user.role,
        "created_at": current_user.created_at
    }

    if current_user.role == "student":
        student = db.query(Student).filter(Student.user_id == current_user.id).first()
        if student:
            profile_data["student_details"] = {
                "id": student.id,
                "register_number": student.register_number,
                "department": student.department,
                "semester": student.semester,
                "is_approved": student.is_approved
            }
    elif current_user.role == "faculty":
        faculty = db.query(Faculty).filter(Faculty.user_id == current_user.id).first()
        if faculty:
            profile_data["faculty_details"] = {
                "id": faculty.id,
                "employee_id": faculty.employee_id,
                "department": faculty.department
            }

    return profile_data


@router.put("/change-password")
def change_password(payload: ChangePasswordRequest, current_user: User = Depends(get_current_user), db: Session = Depends(get_db)):
    """
    Allows a verified user to update their account password safely.
    """
    if not verify_password(payload.old_password, current_user.password_hash):
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail="The old password you entered is incorrect."
        )

    # Simple password constraints
    p = payload.new_password.strip()
    if len(p) < 8 or not any(char.isdigit() for char in p):
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail="New password must be at least 8 characters long and contain at least one digit."
        )

    current_user.password_hash = get_password_hash(p)
    db.commit()
    return {"message": "Password successfully updated. Please use your new password for future sign-ins."}
