from pydantic import BaseModel, EmailStr, Field
from typing import List, Optional
from datetime import datetime

# =====================================================================
# TOKEN SCHEMAS
# =====================================================================
class Token(BaseModel):
    access_token: str
    token_type: str
    role: str
    full_name: str
    user_id: int

class TokenData(BaseModel):
    email: Optional[str] = None
    role: Optional[str] = None


# =====================================================================
# USER SCHEMAS
# =====================================================================
class UserBase(BaseModel):
    full_name: str
    email: EmailStr
    phone: Optional[str] = None

class UserCreate(UserBase):
    password: str

class UserUpdate(BaseModel):
    full_name: Optional[str] = None
    phone: Optional[str] = None

class UserOut(UserBase):
    id: int
    role: str
    created_at: datetime

    class Config:
        from_attributes = True

class UserLogin(BaseModel):
    email: EmailStr
    password: str

class ChangePasswordRequest(BaseModel):
    old_password: str
    new_password: str


# =====================================================================
# PROFILE DETAIL SCHEMAS
# =====================================================================
class StudentCreate(BaseModel):
    register_number: str
    department: str
    semester: int

class StudentOut(BaseModel):
    id: int
    user_id: int
    register_number: str
    department: str
    semester: int
    is_approved: bool

    class Config:
        from_attributes = True

class StudentRegisterRequest(UserCreate):
    register_number: str
    department: str
    semester: int

class FacultyCreate(BaseModel):
    employee_id: str
    department: str

class FacultyOut(BaseModel):
    id: int
    user_id: int
    employee_id: str
    department: str

    class Config:
        from_attributes = True

class FacultyCreateRequest(UserCreate):
    employee_id: str
    department: str

class AdminOut(BaseModel):
    id: int
    user_id: int

    class Config:
        from_attributes = True


# =====================================================================
# SUBJECT SCHEMAS
# =====================================================================
class SubjectBase(BaseModel):
    subject_name: str
    semester: int

class SubjectCreate(SubjectBase):
    pass

class SubjectOut(SubjectBase):
    id: int

    class Config:
        from_attributes = True


# =====================================================================
# QUESTION SCHEMAS
# =====================================================================
class QuestionBase(BaseModel):
    question: str
    option_a: str
    option_b: str
    option_c: str
    option_d: str
    correct_answer: str = Field(description="Must be A, B, C, or D")
    difficulty: str = "medium"

class QuestionCreate(QuestionBase):
    pass

class QuestionOut(QuestionBase):
    id: int
    exam_id: int

    class Config:
        from_attributes = True


# =====================================================================
# EXAM SCHEMAS
# =====================================================================
class ExamBase(BaseModel):
    title: str
    subject_id: int
    duration: int = Field(description="Duration in minutes")
    total_marks: int
    start_time: datetime
    end_time: datetime

class ExamCreate(ExamBase):
    questions: Optional[List[QuestionCreate]] = None

class ExamOut(ExamBase):
    id: int
    faculty_id: int
    is_published: bool

    class Config:
        from_attributes = True

class ExamWithDetails(ExamOut):
    subject_name: str
    faculty_name: str
    questions_count: int


# =====================================================================
# STUDENT ANSWER & SUBMISSION SCHEMAS
# =====================================================================
class StudentAnswerBase(BaseModel):
    question_id: int
    selected_answer: str

class StudentAnswerCreate(StudentAnswerBase):
    pass

class ExamSubmissionRequest(BaseModel):
    exam_id: int
    time_taken: int = Field(description="Time taken in seconds")
    answers: List[StudentAnswerCreate]


# =====================================================================
# RESULT SCHEMAS
# =====================================================================
class ResultBase(BaseModel):
    score: float
    percentage: float
    grade: str
    time_taken: int

class ResultOut(ResultBase):
    id: int
    student_id: int
    exam_id: int
    submitted_at: datetime

    class Config:
        from_attributes = True

class ResultWithDetails(ResultOut):
    exam_title: str
    subject_name: str
    student_name: str
    student_register_number: str


# =====================================================================
# PROCTOR LOG SCHEMAS
# =====================================================================
class ProctorLogBase(BaseModel):
    activity: str = Field(description="e.g. 'Face Missing', 'Head Turn', 'Tab Switch', etc.")
    cheating_score: float = 0.0

class ProctorLogCreate(ProctorLogBase):
    exam_id: int

class ProctorLogOut(ProctorLogBase):
    id: int
    student_id: int
    exam_id: int
    timestamp: datetime

    class Config:
        from_attributes = True

class ProctorLogWithDetails(ProctorLogOut):
    student_name: str
    student_register_number: str
    exam_title: str


# =====================================================================
# AI REPORT SCHEMAS
# =====================================================================
class AIReportBase(BaseModel):
    strengths: str
    weaknesses: str
    recommendations: str
    confidence_score: float = 0.9

class AIReportCreate(AIReportBase):
    student_id: int
    exam_id: int

class AIReportOut(AIReportBase):
    id: int
    student_id: int
    exam_id: int
    created_at: datetime

    class Config:
        from_attributes = True


# =====================================================================
# AI INTERACTIVE APIs
# =====================================================================
class ChatRequest(BaseModel):
    message: str
    context: Optional[str] = ""

class ChatResponse(BaseModel):
    reply: str

class AIAnalyzeRequest(BaseModel):
    exam_id: int
    student_id: int
