export interface Log {
  id: string;
  time: string;
  studentId: string;
  event: string;
  level: "HIGH" | "MED" | "LOW" | "INFO";
  ref: string;
  model: string;
}

export interface Question {
  id: number;
  question: string;
  options: string[];
  correctAnswer: number;
}

export interface RegisteredUser {
  name: string;
  email: string;
  password?: string;
  role: "student" | "faculty" | "admin";
  phone?: string;
}

export interface Exam {
  id: number;
  subjectName: string;
  description: string;
  durationMinutes: number;
  totalQuestions: number;
}

export interface SubmittedExamResult {
  id: string;
  studentEmail: string;
  studentName: string;
  subject: string;
  score: number;
  total: number;
  percentage: number;
  integrityScore: number;
  ai_feedback?: string;
  email_sent: boolean;
  email_sent_at?: string | null;
  date: string;
  logsCount: number;
  logs?: Log[];
}

export interface EmailLog {
  id: string;
  resultId: string;
  targetEmail: string;
  sentByUserId: string;
  status: "sent" | "failed";
  sentAt: string;
}

