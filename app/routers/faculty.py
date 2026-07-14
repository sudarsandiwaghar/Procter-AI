import datetime
from fastapi import APIRouter, Depends, HTTPException, status
from sqlalchemy.orm import Session
from typing import List, Optional
from app.database.connection import get_db
from app.models.models import User, Faculty, Exam, Question, Result, Student, Subject, AIReport
from app.schemas.schemas import ExamCreate, ExamOut, QuestionCreate, QuestionOut
from app.middleware.auth import RoleChecker, get_current_user

router = APIRouter(prefix="/faculty", tags=["Faculty Services"])

# Guard all routes in this router with Faculty role requirement
is_faculty = RoleChecker(["faculty"])


@router.post("/exams", response_model=ExamOut, status_code=status.HTTP_201_CREATED)
def create_exam(
    payload: ExamCreate,
    current_user: User = Depends(is_faculty),
    db: Session = Depends(get_db)
):
    """
    Creates a new exam under the authenticated faculty member's profile.
    Optionally pre-populates it with associated exam questions.
    """
    faculty = db.query(Faculty).filter(Faculty.user_id == current_user.id).first()
    if not faculty:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="Faculty profile record not found."
        )

    # Verify subject exists
    subject = db.query(Subject).filter(Subject.id == payload.subject_id).first()
    if not subject:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="Specified Subject ID does not exist."
        )

    # Validate exam timing constraints
    if payload.start_time >= payload.end_time:
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail="Exam start time must be chronologically before the end time."
        )

    # Create exam
    new_exam = Exam(
        title=payload.title.strip(),
        subject_id=payload.subject_id,
        faculty_id=faculty.id,
        duration=payload.duration,
        total_marks=payload.total_marks,
        start_time=payload.start_time,
        end_time=payload.end_time,
        is_published=False
    )
    db.add(new_exam)
    db.flush()

    # Pre-add questions if provided
    if payload.questions:
        for q in payload.questions:
            db.add(
                Question(
                    exam_id=new_exam.id,
                    question=q.question.strip(),
                    option_a=q.option_a.strip(),
                    option_b=q.option_b.strip(),
                    option_c=q.option_c.strip(),
                    option_d=q.option_d.strip(),
                    correct_answer=q.correct_answer.strip().upper(),
                    difficulty=q.difficulty.strip().lower()
                )
            )

    db.commit()
    db.refresh(new_exam)
    return new_exam


@router.put("/exams/{exam_id}", response_model=ExamOut)
def edit_exam(
    exam_id: int,
    payload: ExamCreate,
    current_user: User = Depends(is_faculty),
    db: Session = Depends(get_db)
):
    """
    Modifies an existing exam configuration. Only the original author faculty can modify.
    """
    faculty = db.query(Faculty).filter(Faculty.user_id == current_user.id).first()
    if not faculty:
        raise HTTPException(status_code=404, detail="Faculty profile not found.")

    exam = db.query(Exam).filter(Exam.id == exam_id, Exam.faculty_id == faculty.id).first()
    if not exam:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="Exam not found or you do not have permission to modify this exam."
        )

    # Edit fields
    exam.title = payload.title.strip()
    exam.subject_id = payload.subject_id
    exam.duration = payload.duration
    exam.total_marks = payload.total_marks
    exam.start_time = payload.start_time
    exam.end_time = payload.end_time

    db.commit()
    db.refresh(exam)
    return exam


@router.delete("/exams/{exam_id}", status_code=status.HTTP_200_OK)
def delete_exam(
    exam_id: int,
    current_user: User = Depends(is_faculty),
    db: Session = Depends(get_db)
):
    """
    Permanently deletes an exam, cascade-purging its questions and historical results safely.
    """
    faculty = db.query(Faculty).filter(Faculty.user_id == current_user.id).first()
    if not faculty:
        raise HTTPException(status_code=404, detail="Faculty profile not found.")

    exam = db.query(Exam).filter(Exam.id == exam_id, Exam.faculty_id == faculty.id).first()
    if not exam:
        raise HTTPException(status_code=404, detail="Exam not found or restricted access.")

    db.delete(exam)
    db.commit()
    return {"message": f"Exam '{exam.title}' and all associated results and logs successfully deleted."}


@router.post("/exams/{exam_id}/questions", response_model=QuestionOut, status_code=status.HTTP_201_CREATED)
def create_question(
    exam_id: int,
    payload: QuestionCreate,
    current_user: User = Depends(is_faculty),
    db: Session = Depends(get_db)
):
    """
    Appends a new proctor exam question to a specific active examination.
    """
    faculty = db.query(Faculty).filter(Faculty.user_id == current_user.id).first()
    exam = db.query(Exam).filter(Exam.id == exam_id, Exam.faculty_id == faculty.id).first()
    if not exam:
        raise HTTPException(status_code=404, detail="Exam not found or unauthorized access.")

    new_q = Question(
        exam_id=exam.id,
        question=payload.question.strip(),
        option_a=payload.option_a.strip(),
        option_b=payload.option_b.strip(),
        option_c=payload.option_c.strip(),
        option_d=payload.option_d.strip(),
        correct_answer=payload.correct_answer.strip().upper(),
        difficulty=payload.difficulty.strip().lower()
    )
    db.add(new_q)
    db.commit()
    db.refresh(new_q)
    return new_q


@router.put("/questions/{question_id}", response_model=QuestionOut)
def update_question(
    question_id: int,
    payload: QuestionCreate,
    current_user: User = Depends(is_faculty),
    db: Session = Depends(get_db)
):
    """
    Updates the text or option parameters of a registered examination question.
    """
    faculty = db.query(Faculty).filter(Faculty.user_id == current_user.id).first()
    question = db.query(Question).filter(Question.id == question_id).first()
    if not question:
        raise HTTPException(status_code=404, detail="Question not found.")

    exam = db.query(Exam).filter(Exam.id == question.exam_id, Exam.faculty_id == faculty.id).first()
    if not exam:
        raise HTTPException(status_code=403, detail="Unauthorized to modify questions on this exam.")

    question.question = payload.question.strip()
    question.option_a = payload.option_a.strip()
    question.option_b = payload.option_b.strip()
    question.option_c = payload.option_c.strip()
    question.option_d = payload.option_d.strip()
    question.correct_answer = payload.correct_answer.strip().upper()
    question.difficulty = payload.difficulty.strip().lower()

    db.commit()
    db.refresh(question)
    return question


@router.delete("/questions/{question_id}")
def delete_question(
    question_id: int,
    current_user: User = Depends(is_faculty),
    db: Session = Depends(get_db)
):
    """
    Deletes a single question from an exam layout.
    """
    faculty = db.query(Faculty).filter(Faculty.user_id == current_user.id).first()
    question = db.query(Question).filter(Question.id == question_id).first()
    if not question:
        raise HTTPException(status_code=404, detail="Question not found.")

    exam = db.query(Exam).filter(Exam.id == question.exam_id, Exam.faculty_id == faculty.id).first()
    if not exam:
        raise HTTPException(status_code=403, detail="Unauthorized to delete questions on this exam.")

    db.delete(question)
    db.commit()
    return {"message": "Question successfully deleted from the examination form."}


@router.put("/exams/{exam_id}/publish", response_model=ExamOut)
def publish_exam(
    exam_id: int,
    current_user: User = Depends(is_faculty),
    db: Session = Depends(get_db)
):
    """
    Publishes an exam session so it becomes viewable and runnable by students.
    """
    faculty = db.query(Faculty).filter(Faculty.user_id == current_user.id).first()
    exam = db.query(Exam).filter(Exam.id == exam_id, Exam.faculty_id == faculty.id).first()
    if not exam:
        raise HTTPException(status_code=404, detail="Exam not found.")

    # Confirm exam has questions before publishing
    q_count = db.query(Question).filter(Question.exam_id == exam.id).count()
    if q_count == 0:
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail="Cannot publish an exam that contains zero questions. Please add questions first."
        )

    exam.is_published = True
    db.commit()
    db.refresh(exam)
    return exam


@router.get("/exams/{exam_id}/results")
def view_exam_results(
    exam_id: int,
    current_user: User = Depends(is_faculty),
    db: Session = Depends(get_db)
):
    """
    Enables faculty to view student submission results for a specific course exam they authored.
    """
    faculty = db.query(Faculty).filter(Faculty.user_id == current_user.id).first()
    exam = db.query(Exam).filter(Exam.id == exam_id, Exam.faculty_id == faculty.id).first()
    if not exam:
        raise HTTPException(status_code=404, detail="Exam not found or unauthorized access.")

    results = db.query(Result).filter(Result.exam_id == exam.id).all()
    
    response = []
    for res in results:
        student = db.query(Student).filter(Student.id == res.student_id).first()
        student_user = db.query(User).filter(User.id == student.user_id).first() if student else None
        
        response.append({
            "id": res.id,
            "student_id": res.student_id,
            "student_name": student_user.full_name if student_user else "Unknown Student",
            "register_number": student.register_number if student else "N/A",
            "department": student.department if student else "N/A",
            "score": res.score,
            "percentage": res.percentage,
            "grade": res.grade,
            "time_taken": res.time_taken,
            "submitted_at": res.submitted_at
        })

    return response


@router.get("/analytics")
def view_ai_analytics(
    current_user: User = Depends(is_faculty),
    db: Session = Depends(get_db)
):
    """
    Provides aggregated cognitive and performance statistics for exams managed by the faculty.
    """
    faculty = db.query(Faculty).filter(Faculty.user_id == current_user.id).first()
    if not faculty:
        raise HTTPException(status_code=404, detail="Faculty profile not found.")

    exams = db.query(Exam).filter(Exam.faculty_id == faculty.id).all()
    exam_ids = [e.id for e in exams]

    results_count = db.query(Result).filter(Result.exam_id.in_(exam_ids)).count() if exam_ids else 0
    exams_count = len(exams)

    # Average score computation
    avg_score = 0.0
    if results_count > 0:
        results = db.query(Result).filter(Result.exam_id.in_(exam_ids)).all()
        avg_score = sum(r.percentage for r in results) / len(results)

    # AI highlights aggregation
    reports = db.query(AIReport).filter(AIReport.exam_id.in_(exam_ids)).all() if exam_ids else []
    
    return {
        "exams_administered": exams_count,
        "total_submissions": results_count,
        "average_score_percentage": round(avg_score, 2),
        "ai_cognitive_summaries_count": len(reports),
        "exams": [
            {
                "id": e.id,
                "title": e.title,
                "is_published": e.is_published,
                "submissions_count": db.query(Result).filter(Result.exam_id == e.id).count()
            }
            for e in exams
        ]
    }
