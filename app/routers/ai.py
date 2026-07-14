from fastapi import APIRouter, Depends, HTTPException, status
from sqlalchemy.orm import Session
from typing import List, Optional
import datetime
from app.database.connection import get_db
from app.models.models import User, Student, Exam, ProctorLog, AIReport, Result
from app.schemas.schemas import ChatRequest, ChatResponse, ProctorLogCreate, ProctorLogOut, AIReportOut
from app.middleware.auth import get_current_user
from app.ai.gemini_service import generate_chatbot_reply, generate_performance_report

router = APIRouter(prefix="/ai", tags=["AI Intelligence Services"])

# Proctoring event weights for dynamic cheating index computation
PROCTOR_WEIGHTS = {
    "Face Missing": 0.25,
    "Multiple Faces": 0.40,
    "Head Turn": 0.15,
    "Looking Away": 0.10,
    "Tab Switch": 0.35,
    "Fullscreen Exit": 0.20,
    "Voice Detection": 0.30,
    "Phone Detection": 0.50
}

@router.post("/proctor/log", response_model=ProctorLogOut)
def log_proctor_event(
    payload: ProctorLogCreate,
    current_user: User = Depends(get_current_user),
    db: Session = Depends(get_db)
):
    """
    Receives front-end web proctoring integrity events, logs them, calculates a custom individual infraction score,
    and increments the overall Proctor Logs Ledger.
    """
    student = db.query(Student).filter(Student.user_id == current_user.id).first()
    if not student:
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail="Only active student accounts can register proctoring logs."
        )

    # Validate Exam
    exam = db.query(Exam).filter(Exam.id == payload.exam_id).first()
    if not exam:
        raise HTTPException(status_code=404, detail="Target exam not found.")

    activity_name = payload.activity.strip()
    
    # Calculate cheating score based on weights
    score_increment = PROCTOR_WEIGHTS.get(activity_name, 0.10)

    # Save to db
    new_log = ProctorLog(
        student_id=student.id,
        exam_id=exam.id,
        activity=activity_name,
        cheating_score=score_increment,
        timestamp=datetime.datetime.utcnow()
    )
    db.add(new_log)
    db.commit()
    db.refresh(new_log)
    return new_log


@router.post("/chat", response_model=ChatResponse)
def solve_academic_doubt(
    payload: ChatRequest,
    current_user: User = Depends(get_current_user)
):
    """
    Leverages Google Gemini 2.5 Flash server-side to resolve academic, code, or preparation questions.
    """
    reply = generate_chatbot_reply(user_message=payload.message, context=payload.context)
    return {"reply": reply}


@router.post("/performance/analyze")
def analyze_performance_on_demand(
    exam_id: int,
    student_id: int,
    current_user: User = Depends(get_current_user),
    db: Session = Depends(get_db)
):
    """
    On-demand analysis trigger which fetches exam metrics and calls the Google Gemini API to build a new report.
    """
    student = db.query(Student).filter(Student.id == student_id).first()
    if not student:
        raise HTTPException(status_code=404, detail="Student profile not found.")
        
    exam = db.query(Exam).filter(Exam.id == exam_id).first()
    if not exam:
        raise HTTPException(status_code=404, detail="Exam session not found.")

    res = db.query(Result).filter(Result.student_id == student.id, Result.exam_id == exam.id).first()
    if not res:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="Student has not submitted any result for this exam yet."
        )

    # Extract student user info
    student_user = db.query(User).filter(User.id == student.user_id).first()
    student_name = student_user.full_name if student_user else "Student Candidate"

    # Gather logs for weaknesses context
    logs = db.query(ProctorLog).filter(ProctorLog.student_id == student.id, ProctorLog.exam_id == exam.id).all()
    cheating_events = [l.activity for l in logs]
    
    report_data = generate_performance_report(
        student_name=student_name,
        exam_title=exam.title,
        score=res.score,
        total_marks=exam.total_marks,
        wrong_topics=[f"Logged integrity warnings: {', '.join(cheating_events) if cheating_events else 'None'}"]
    )

    # Check if a report already exists to update or create
    existing_report = db.query(AIReport).filter(
        AIReport.student_id == student.id,
        AIReport.exam_id == exam.id
    ).first()

    if existing_report:
        existing_report.strengths = report_data["strengths"]
        existing_report.weaknesses = report_data["weaknesses"]
        existing_report.recommendations = report_data["recommendations"]
        existing_report.confidence_score = report_data["confidence_score"]
        report = existing_report
    else:
        report = AIReport(
            student_id=student.id,
            exam_id=exam.id,
            strengths=report_data["strengths"],
            weaknesses=report_data["weaknesses"],
            recommendations=report_data["recommendations"],
            confidence_score=report_data["confidence_score"]
        )
        db.add(report)

    db.commit()
    db.refresh(report)
    return report


@router.get("/report/{student_id}", response_model=List[AIReportOut])
def get_student_ai_reports(
    student_id: int,
    current_user: User = Depends(get_current_user),
    db: Session = Depends(get_db)
):
    """
    Returns all AI performance reports for a specific student.
    """
    reports = db.query(AIReport).filter(AIReport.student_id == student_id).all()
    return reports
