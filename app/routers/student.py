import datetime
from fastapi import APIRouter, Depends, HTTPException, status, BackgroundTasks
from sqlalchemy.orm import Session
from typing import List
from app.database.connection import get_db
from app.models.models import User, Student, Exam, Question, StudentAnswer, Result, AIReport, Subject
from app.schemas.schemas import (
    ExamSubmissionRequest, ResultOut, UserUpdate, StudentOut
)
from app.middleware.auth import RoleChecker, get_current_user
from app.ai.gemini_service import generate_performance_report

router = APIRouter(prefix="/student", tags=["Student Services"])

# Guard all routes in this router with Student role requirement
is_student = RoleChecker(["student"])


@router.put("/profile", response_model=UserUpdate)
def update_student_profile(
    payload: UserUpdate,
    current_user: User = Depends(is_student),
    db: Session = Depends(get_db)
):
    """
    Updates student profile details (name, phone) on the User model.
    """
    if payload.full_name is not None:
        current_user.full_name = payload.full_name.strip()
    if payload.phone is not None:
        current_user.phone = payload.phone.strip()
    
    db.commit()
    db.refresh(current_user)
    return current_user


@router.get("/exams")
def get_available_exams(
    current_user: User = Depends(is_student),
    db: Session = Depends(get_db)
):
    """
    Returns all published examinations matching the student's academic semester.
    """
    student = db.query(Student).filter(Student.user_id == current_user.id).first()
    if not student:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="Student profile record not found."
        )

    # Fetch subjects in the student's semester
    subjects = db.query(Subject).filter(Subject.semester == student.semester).all()
    subject_ids = [sub.id for sub in subjects]

    # Query exams for these subjects that are published
    exams = db.query(Exam).filter(
        Exam.subject_id.in_(subject_ids),
        Exam.is_published == True
    ).all()

    response = []
    for exam in exams:
        # Check if the student has already taken this exam
        has_taken = db.query(Result).filter(
            Result.student_id == student.id,
            Result.exam_id == exam.id
        ).first() is not None

        subj = db.query(Subject).filter(Subject.id == exam.subject_id).first()
        
        response.append({
            "id": exam.id,
            "title": exam.title,
            "subject_name": subj.subject_name if subj else "Unknown Subject",
            "duration": exam.duration,
            "total_marks": exam.total_marks,
            "start_time": exam.start_time,
            "end_time": exam.end_time,
            "is_completed": has_taken
        })

    return response


@router.get("/exams/{exam_id}/start")
def start_exam(
    exam_id: int,
    current_user: User = Depends(is_student),
    db: Session = Depends(get_db)
):
    """
    Initiates an exam session, returning questions with correct answers redacted to prevent inspection exploitation.
    """
    student = db.query(Student).filter(Student.user_id == current_user.id).first()
    if not student:
        raise HTTPException(status_code=404, detail="Student profile not found.")

    # Check if student already submitted this exam
    existing_result = db.query(Result).filter(
        Result.student_id == student.id,
        Result.exam_id == exam_id
    ).first()
    if existing_result:
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail="You have already submitted this examination."
        )

    exam = db.query(Exam).filter(Exam.id == exam_id, Exam.is_published == True).first()
    if not exam:
        raise HTTPException(status_code=404, detail="Examination not found or not published.")

    # Check timing
    now = datetime.datetime.utcnow()
    if now < exam.start_time:
        raise HTTPException(status_code=400, detail=f"This exam has not started yet. Starts at: {exam.start_time}")
    if now > exam.end_time:
        raise HTTPException(status_code=400, detail="This exam session has already closed.")

    # Retrieve questions and scramble options or hide answers
    questions = db.query(Question).filter(Question.exam_id == exam_id).all()
    questions_data = []
    for q in questions:
        questions_data.append({
            "id": q.id,
            "question": q.question,
            "option_a": q.option_a,
            "option_b": q.option_b,
            "option_c": q.option_c,
            "option_d": q.option_d,
            "difficulty": q.difficulty
        })

    return {
        "exam_id": exam.id,
        "title": exam.title,
        "duration": exam.duration,
        "questions": questions_data
    }


def generate_and_save_ai_report_task(
    student_id: int,
    exam_id: int,
    student_name: str,
    exam_title: str,
    score: float,
    total_marks: int,
    wrong_topics: list
):
    from app.database.connection import SessionLocal
    from app.ai.gemini_service import generate_performance_report
    from app.models.models import AIReport
    import logging

    logger = logging.getLogger(__name__)
    db = SessionLocal()
    try:
        report_data = generate_performance_report(
            student_name=student_name,
            exam_title=exam_title,
            score=score,
            total_marks=total_marks,
            wrong_topics=wrong_topics
        )

        ai_report = AIReport(
            student_id=student_id,
            exam_id=exam_id,
            strengths=report_data["strengths"],
            weaknesses=report_data["weaknesses"],
            recommendations=report_data["recommendations"],
            confidence_score=report_data["confidence_score"]
        )
        db.add(ai_report)
        db.commit()
    except Exception as e:
        logger.error(f"Error in background AI report generation: {e}")
        db.rollback()
    finally:
        db.close()


@router.post("/exams/submit")
def submit_exam(
    payload: ExamSubmissionRequest,
    background_tasks: BackgroundTasks,
    current_user: User = Depends(is_student),
    db: Session = Depends(get_db)
):
    """
    Grades an exam submission on the server side, calculates scores, percentages, grades,
    saves answers, and invokes Google Gemini asynchronously for instant evaluation summaries.
    """
    student = db.query(Student).filter(Student.user_id == current_user.id).first()
    if not student:
        raise HTTPException(status_code=404, detail="Student profile not found.")

    exam = db.query(Exam).filter(Exam.id == payload.exam_id).first()
    if not exam:
        raise HTTPException(status_code=404, detail="Exam not found.")

    # Check if already submitted
    existing_result = db.query(Result).filter(
        Result.student_id == student.id,
        Result.exam_id == exam.id
    ).first()
    if existing_result:
        raise HTTPException(status_code=400, detail="Exam has already been submitted by this student.")

    # Retrieve all questions
    questions = {q.id: q for q in db.query(Question).filter(Question.exam_id == exam.id).all()}
    
    correct_count = 0
    total_questions = len(questions)
    
    if total_questions == 0:
        raise HTTPException(status_code=400, detail="This exam does not have any questions registered.")

    student_answers_to_save = []
    wrong_topics = []

    for ans in payload.answers:
        q_id = ans.question_id
        selected = ans.selected_answer.strip().upper()
        
        if q_id in questions:
            question_obj = questions[q_id]
            is_correct = (question_obj.correct_answer.strip().upper() == selected)
            if is_correct:
                correct_count += 1
            else:
                wrong_topics.append(f"Question ID {q_id}: {question_obj.question[:60]}...")
            
            student_answers_to_save.append(
                StudentAnswer(
                    student_id=student.id,
                    exam_id=exam.id,
                    question_id=q_id,
                    selected_answer=selected,
                    is_correct=is_correct
                )
            )

    # Bulk save student answers
    db.add_all(student_answers_to_save)

    # Score calculation
    # Distribute score equally based on exam.total_marks
    mark_per_question = exam.total_marks / total_questions
    final_score = correct_count * mark_per_question
    percentage = (final_score / exam.total_marks) * 100

    # Determine Grade
    if percentage >= 90:
        grade = "S"
    elif percentage >= 80:
        grade = "A"
    elif percentage >= 70:
        grade = "B"
    elif percentage >= 60:
        grade = "C"
    elif percentage >= 50:
        grade = "D"
    elif percentage >= 40:
        grade = "E"
    else:
        grade = "F"

    # Save Result
    new_result = Result(
        student_id=student.id,
        exam_id=exam.id,
        score=final_score,
        percentage=round(percentage, 2),
        grade=grade,
        time_taken=payload.time_taken
    )
    db.add(new_result)
    db.commit()  # Commit first to save the result and capture generated ID
    db.refresh(new_result)

    # Generate Gemini Performance evaluation report in the background
    background_tasks.add_task(
        generate_and_save_ai_report_task,
        student_id=student.id,
        exam_id=exam.id,
        student_name=current_user.full_name,
        exam_title=exam.title,
        score=final_score,
        total_marks=exam.total_marks,
        wrong_topics=wrong_topics
    )

    return {
        "result_id": new_result.id,
        "score": final_score,
        "percentage": round(percentage, 2),
        "grade": grade,
        "ai_feedback": {
            "strengths": "• Generating your detailed AI report...",
            "weaknesses": "• Generating your detailed AI report...",
            "recommendations": "• Generating your detailed AI report..."
        }
    }


@router.get("/results")
def get_student_results(
    current_user: User = Depends(is_student),
    db: Session = Depends(get_db)
):
    """
    Returns a historic log of exam results for the student.
    """
    student = db.query(Student).filter(Student.user_id == current_user.id).first()
    if not student:
        raise HTTPException(status_code=404, detail="Student profile not found.")

    results = db.query(Result).filter(Result.student_id == student.id).all()
    
    response = []
    for res in results:
        exam = db.query(Exam).filter(Exam.id == res.exam_id).first()
        subj = db.query(Subject).filter(Subject.id == exam.subject_id).first() if exam else None
        
        response.append({
            "id": res.id,
            "exam_title": exam.title if exam else "Unknown Exam",
            "subject_name": subj.subject_name if subj else "Unknown Subject",
            "score": res.score,
            "total_marks": exam.total_marks if exam else 100,
            "percentage": res.percentage,
            "grade": res.grade,
            "time_taken": res.time_taken,
            "submitted_at": res.submitted_at
        })

    return response


@router.get("/ai-reports/{exam_id}")
def get_student_ai_report(
    exam_id: int,
    current_user: User = Depends(is_student),
    db: Session = Depends(get_db)
):
    """
    Retrieves the generated AI Performance report for a specific exam.
    """
    student = db.query(Student).filter(Student.user_id == current_user.id).first()
    if not student:
        raise HTTPException(status_code=404, detail="Student profile not found.")

    report = db.query(AIReport).filter(
        AIReport.student_id == student.id,
        AIReport.exam_id == exam_id
    ).first()

    if not report:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="AI report not generated for this exam session yet."
        )

    return {
        "exam_id": report.exam_id,
        "strengths": report.strengths,
        "weaknesses": report.weaknesses,
        "recommendations": report.recommendations,
        "confidence_score": report.confidence_score,
        "created_at": report.created_at
    }
