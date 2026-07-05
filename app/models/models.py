import datetime
from sqlalchemy import Column, Integer, String, Float, Boolean, DateTime, ForeignKey, Text
from sqlalchemy.orm import relationship
from app.database.connection import Base

class User(Base):
    __tablename__ = "users"

    id = Column(Integer, primary_key=True, index=True, autoincrement=True)
    full_name = Column(String(150), nullable=False)
    email = Column(String(150), unique=True, index=True, nullable=False)
    phone = Column(String(20), nullable=True)
    password_hash = Column(String(255), nullable=False)
    role = Column(String(20), default="student", nullable=False)  # student, faculty, admin
    created_at = Column(DateTime, default=datetime.datetime.utcnow)

    # Relationships
    student_profile = relationship("Student", uselist=False, back_populates="user", cascade="all, delete-orphan")
    faculty_profile = relationship("Faculty", uselist=False, back_populates="user", cascade="all, delete-orphan")
    admin_profile = relationship("Admin", uselist=False, back_populates="user", cascade="all, delete-orphan")


class Student(Base):
    __tablename__ = "students"

    id = Column(Integer, primary_key=True, index=True, autoincrement=True)
    user_id = Column(Integer, ForeignKey("users.id", ondelete="CASCADE"), unique=True, nullable=False)
    register_number = Column(String(50), unique=True, index=True, nullable=False)
    department = Column(String(100), nullable=False)
    semester = Column(Integer, nullable=False)
    is_approved = Column(Boolean, default=False)  # Admin approval flag

    # Relationships
    user = relationship("User", back_populates="student_profile")
    answers = relationship("StudentAnswer", back_populates="student", cascade="all, delete-orphan")
    results = relationship("Result", back_populates="student", cascade="all, delete-orphan")
    proctor_logs = relationship("ProctorLog", back_populates="student", cascade="all, delete-orphan")
    ai_reports = relationship("AIReport", back_populates="student", cascade="all, delete-orphan")


class Faculty(Base):
    __tablename__ = "faculty"

    id = Column(Integer, primary_key=True, index=True, autoincrement=True)
    user_id = Column(Integer, ForeignKey("users.id", ondelete="CASCADE"), unique=True, nullable=False)
    employee_id = Column(String(50), unique=True, index=True, nullable=False)
    department = Column(String(100), nullable=False)

    # Relationships
    user = relationship("User", back_populates="faculty_profile")
    exams = relationship("Exam", back_populates="faculty", cascade="all, delete-orphan")


class Admin(Base):
    __tablename__ = "admins"

    id = Column(Integer, primary_key=True, index=True, autoincrement=True)
    user_id = Column(Integer, ForeignKey("users.id", ondelete="CASCADE"), unique=True, nullable=False)

    # Relationships
    user = relationship("User", back_populates="admin_profile")


class Subject(Base):
    __tablename__ = "subjects"

    id = Column(Integer, primary_key=True, index=True, autoincrement=True)
    subject_name = Column(String(100), unique=True, index=True, nullable=False)
    semester = Column(Integer, nullable=False)

    # Relationships
    exams = relationship("Exam", back_populates="subject", cascade="all, delete-orphan")


class Exam(Base):
    __tablename__ = "exams"

    id = Column(Integer, primary_key=True, index=True, autoincrement=True)
    title = Column(String(150), nullable=False)
    subject_id = Column(Integer, ForeignKey("subjects.id", ondelete="CASCADE"), nullable=False)
    faculty_id = Column(Integer, ForeignKey("faculty.id", ondelete="CASCADE"), nullable=False)
    duration = Column(Integer, nullable=False)  # in minutes
    total_marks = Column(Integer, nullable=False)
    start_time = Column(DateTime, nullable=False)
    end_time = Column(DateTime, nullable=False)
    is_published = Column(Boolean, default=False, nullable=False)

    # Relationships
    subject = relationship("Subject", back_populates="exams")
    faculty = relationship("Faculty", back_populates="exams")
    questions = relationship("Question", back_populates="exam", cascade="all, delete-orphan")
    student_answers = relationship("StudentAnswer", back_populates="exam", cascade="all, delete-orphan")
    results = relationship("Result", back_populates="exam", cascade="all, delete-orphan")
    proctor_logs = relationship("ProctorLog", back_populates="exam", cascade="all, delete-orphan")
    ai_reports = relationship("AIReport", back_populates="exam", cascade="all, delete-orphan")


class Question(Base):
    __tablename__ = "questions"

    id = Column(Integer, primary_key=True, index=True, autoincrement=True)
    exam_id = Column(Integer, ForeignKey("exams.id", ondelete="CASCADE"), nullable=False)
    question = Column(Text, nullable=False)
    option_a = Column(String(255), nullable=False)
    option_b = Column(String(255), nullable=False)
    option_c = Column(String(255), nullable=False)
    option_d = Column(String(255), nullable=False)
    correct_answer = Column(String(10), nullable=False)  # A, B, C, D
    difficulty = Column(String(20), default="medium", nullable=False)  # easy, medium, hard

    # Relationships
    exam = relationship("Exam", back_populates="questions")
    student_answers = relationship("StudentAnswer", back_populates="question", cascade="all, delete-orphan")


class StudentAnswer(Base):
    __tablename__ = "student_answers"

    id = Column(Integer, primary_key=True, index=True, autoincrement=True)
    student_id = Column(Integer, ForeignKey("students.id", ondelete="CASCADE"), nullable=False)
    exam_id = Column(Integer, ForeignKey("exams.id", ondelete="CASCADE"), nullable=False)
    question_id = Column(Integer, ForeignKey("questions.id", ondelete="CASCADE"), nullable=False)
    selected_answer = Column(String(10), nullable=False)  # A, B, C, D
    is_correct = Column(Boolean, nullable=False)

    # Relationships
    student = relationship("Student", back_populates="answers")
    exam = relationship("Exam", back_populates="student_answers")
    question = relationship("Question", back_populates="student_answers")


class Result(Base):
    __tablename__ = "results"

    id = Column(Integer, primary_key=True, index=True, autoincrement=True)
    student_id = Column(Integer, ForeignKey("students.id", ondelete="CASCADE"), nullable=False)
    exam_id = Column(Integer, ForeignKey("exams.id", ondelete="CASCADE"), nullable=False)
    score = Column(Float, nullable=False)
    percentage = Column(Float, nullable=False)
    grade = Column(String(10), nullable=False)  # S, A, B, C, D, E, F
    time_taken = Column(Integer, nullable=False)  # in seconds
    submitted_at = Column(DateTime, default=datetime.datetime.utcnow)

    # Relationships
    student = relationship("Student", back_populates="results")
    exam = relationship("Exam", back_populates="results")


class ProctorLog(Base):
    __tablename__ = "proctor_logs"

    id = Column(Integer, primary_key=True, index=True, autoincrement=True)
    student_id = Column(Integer, ForeignKey("students.id", ondelete="CASCADE"), nullable=False)
    exam_id = Column(Integer, ForeignKey("exams.id", ondelete="CASCADE"), nullable=False)
    timestamp = Column(DateTime, default=datetime.datetime.utcnow, nullable=False)
    activity = Column(String(150), nullable=False)  # Face Missing, Tab Switch, Head Turn, etc.
    cheating_score = Column(Float, default=0.0, nullable=False)

    # Relationships
    student = relationship("Student", back_populates="proctor_logs")
    exam = relationship("Exam", back_populates="proctor_logs")


class AIReport(Base):
    __tablename__ = "ai_reports"

    id = Column(Integer, primary_key=True, index=True, autoincrement=True)
    student_id = Column(Integer, ForeignKey("students.id", ondelete="CASCADE"), nullable=False)
    exam_id = Column(Integer, ForeignKey("exams.id", ondelete="CASCADE"), nullable=False)
    strengths = Column(Text, nullable=True)  # JSON or text
    weaknesses = Column(Text, nullable=True)  # JSON or text
    recommendations = Column(Text, nullable=True)
    confidence_score = Column(Float, default=0.9, nullable=False)
    created_at = Column(DateTime, default=datetime.datetime.utcnow)

    # Relationships
    student = relationship("Student", back_populates="ai_reports")
    exam = relationship("Exam", back_populates="ai_reports")
