import datetime
from fastapi import APIRouter, Depends, HTTPException, status
from sqlalchemy.orm import Session
from typing import List, Optional
from app.database.connection import get_db
from app.models.models import User, Faculty, Student, Subject, Exam, ProctorLog, Result
from app.schemas.schemas import FacultyCreateRequest, UserOut, StudentOut, SubjectCreate, SubjectOut
from app.middleware.auth import RoleChecker, get_current_user
from app.utils.security import get_password_hash

router = APIRouter(prefix="/admin", tags=["Admin Services"])

# Guard all routes in this router with Admin role requirement
is_admin = RoleChecker(["admin"])


@router.post("/faculty", response_model=UserOut, status_code=status.HTTP_201_CREATED)
def create_faculty(
    payload: FacultyCreateRequest,
    current_user: User = Depends(is_admin),
    db: Session = Depends(get_db)
):
    """
    Allows administrators to register faculty members, establishing both User and Faculty records.
    """
    email_clean = payload.email.strip().lower()
    
    # 1. Verify uniqueness
    existing_user = db.query(User).filter(User.email == email_clean).first()
    if existing_user:
        raise HTTPException(
            status_code=status.HTTP_409_CONFLICT,
            detail="A user with this email address already exists."
        )

    existing_faculty = db.query(Faculty).filter(Faculty.employee_id == payload.employee_id.strip()).first()
    if existing_faculty:
        raise HTTPException(
            status_code=status.HTTP_409_CONFLICT,
            detail="A faculty member with this Employee ID already exists."
        )

    # 2. Hash and save
    pw_hash = get_password_hash(payload.password)
    new_user = User(
        full_name=payload.full_name.strip(),
        email=email_clean,
        phone=payload.phone,
        password_hash=pw_hash,
        role="faculty"
    )
    db.add(new_user)
    db.flush()

    new_faculty = Faculty(
        user_id=new_user.id,
        employee_id=payload.employee_id.strip(),
        department=payload.department.strip()
    )
    db.add(new_faculty)
    db.commit()
    db.refresh(new_user)
    return new_user


@router.delete("/faculty/{faculty_id}", status_code=status.HTTP_200_OK)
def delete_faculty(
    faculty_id: int,
    current_user: User = Depends(is_admin),
    db: Session = Depends(get_db)
):
    """
    Permanently deletes a faculty member and Cascade cleans their registered items.
    """
    faculty = db.query(Faculty).filter(Faculty.id == faculty_id).first()
    if not faculty:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="Faculty member not found."
        )

    user = db.query(User).filter(User.id == faculty.user_id).first()
    if user:
        db.delete(user) # Will cascade-delete student/faculty records
    else:
        db.delete(faculty)
        
    db.commit()
    return {"message": "Faculty member successfully deleted."}


@router.put("/students/{student_id}/approve", response_model=StudentOut)
def approve_student(
    student_id: int,
    approve: bool = True,
    current_user: User = Depends(is_admin),
    db: Session = Depends(get_db)
):
    """
    Approves or revokes a student profile's portal entry permissions.
    """
    student = db.query(Student).filter(Student.id == student_id).first()
    if not student:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="Student record not found."
        )

    student.is_approved = approve
    db.commit()
    db.refresh(student)
    return student


@router.get("/users")
def manage_users(
    role: Optional[str] = None,
    current_user: User = Depends(is_admin),
    db: Session = Depends(get_db)
):
    """
    Lists users currently registered on the platform with optional role filtering.
    """
    query = db.query(User)
    if role:
        query = query.filter(User.role == role)
    users = query.all()

    response = []
    for u in users:
        user_data = {
            "id": u.id,
            "full_name": u.full_name,
            "email": u.email,
            "phone": u.phone,
            "role": u.role,
            "created_at": u.created_at
        }
        if u.role == "student":
            student = db.query(Student).filter(Student.user_id == u.id).first()
            if student:
                user_data["register_number"] = student.register_number
                user_data["department"] = student.department
                user_data["semester"] = student.semester
                user_data["is_approved"] = student.is_approved
        elif u.role == "faculty":
            faculty = db.query(Faculty).filter(Faculty.user_id == u.id).first()
            if faculty:
                user_data["employee_id"] = faculty.employee_id
                user_data["department"] = faculty.department
        response.append(user_data)

    return response


@router.post("/subjects", response_model=SubjectOut, status_code=status.HTTP_201_CREATED)
def create_subject(
    payload: SubjectCreate,
    current_user: User = Depends(is_admin),
    db: Session = Depends(get_db)
):
    """
    Registers a new curriculum subject inside the ProctorAI platform.
    """
    existing = db.query(Subject).filter(Subject.subject_name == payload.subject_name.strip()).first()
    if existing:
        raise HTTPException(status_code=400, detail="Subject already registered.")

    new_sub = Subject(
        subject_name=payload.subject_name.strip(),
        semester=payload.semester
    )
    db.add(new_sub)
    db.commit()
    db.refresh(new_sub)
    return new_sub


@router.get("/subjects", response_model=List[SubjectOut])
def list_subjects(
    current_user: User = Depends(is_admin),
    db: Session = Depends(get_db)
):
    """
    Fetches all registered subjects.
    """
    return db.query(Subject).all()


@router.delete("/subjects/{subject_id}")
def delete_subject(
    subject_id: int,
    current_user: User = Depends(is_admin),
    db: Session = Depends(get_db)
):
    """
    Removes a subject from the platform.
    """
    subj = db.query(Subject).filter(Subject.id == subject_id).first()
    if not subj:
        raise HTTPException(status_code=404, detail="Subject not found.")
    db.delete(subj)
    db.commit()
    return {"message": f"Subject '{subj.subject_name}' deleted."}


@router.get("/proctor-logs")
def view_proctor_logs(
    exam_id: Optional[int] = None,
    student_id: Optional[int] = None,
    current_user: User = Depends(is_admin),
    db: Session = Depends(get_db)
):
    """
    Aggregates secure AI proctoring logs for oversight review, tracking browser tab switches, offline head movements, etc.
    """
    query = db.query(ProctorLog)
    if exam_id:
        query = query.filter(ProctorLog.exam_id == exam_id)
    if student_id:
        query = query.filter(ProctorLog.student_id == student_id)
        
    logs = query.order_by(ProctorLog.timestamp.desc()).all()
    
    response = []
    for log in logs:
        student = db.query(Student).filter(Student.id == log.student_id).first()
        student_user = db.query(User).filter(User.id == student.user_id).first() if student else None
        exam = db.query(Exam).filter(Exam.id == log.exam_id).first()
        
        response.append({
            "id": log.id,
            "student_id": log.student_id,
            "student_name": student_user.full_name if student_user else "Unknown Student",
            "register_number": student.register_number if student else "N/A",
            "exam_title": exam.title if exam else "Unknown Exam",
            "timestamp": log.timestamp,
            "activity": log.activity,
            "cheating_score": log.cheating_score
        })

    return response


@router.get("/system-report")
def generate_system_reports(
    current_user: User = Depends(is_admin),
    db: Session = Depends(get_db)
):
    """
    Synthesizes overall metrics for administrative operations.
    """
    total_students = db.query(Student).count()
    total_faculty = db.query(Faculty).count()
    total_exams = db.query(Exam).count()
    total_results = db.query(Result).count()
    
    # Calculate grade distribution
    grade_counts = {}
    for g in ["S", "A", "B", "C", "D", "E", "F"]:
        grade_counts[g] = db.query(Result).filter(Result.grade == g).count()

    return {
        "generated_at": datetime.datetime.utcnow(),
        "total_students": total_students,
        "total_faculty": total_faculty,
        "total_exams_registered": total_exams,
        "total_exam_submissions": total_results,
        "grade_distribution": grade_counts,
        "system_status": "Operational"
    }
