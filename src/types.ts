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
