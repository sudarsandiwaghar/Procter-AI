import React, { useState, useEffect, useRef } from "react";
import { 
  Shield, 
  Eye, 
  Users, 
  Smartphone, 
  Terminal as TerminalIcon, 
  ArrowRight, 
  Check, 
  AlertTriangle, 
  Activity, 
  Video, 
  Play, 
  Square, 
  RotateCcw, 
  Info, 
  Lock, 
  Layers, 
  Award, 
  TrendingUp, 
  X, 
  Cpu, 
  Database,
  Monitor,
  Volume2,
  FileText,
  MessageSquare,
  Settings,
  AlertCircle,
  TrendingDown,
  BookOpen,
  UserCheck
} from "lucide-react";
import { LightRays } from "./Component";
import { jsPDF } from "jspdf";

// Interfaces
interface Log {
  id: string;
  time: string;
  studentId: string;
  event: string;
  level: "HIGH" | "MED" | "LOW" | "INFO";
  ref: string;
  model: string;
}

interface Question {
  id: number;
  question: string;
  options: string[];
  correctAnswer: number;
}

export default function App() {
  // Global Navigation & View States
  const [scrolled, setScrolled] = useState(false);
  const [activeSection, setActiveSection] = useState("hero");

  // Authentication & Login States
  const [userRole, setUserRole] = useState<"guest" | "student" | "admin">("guest");
  const [loginUsername, setLoginUsername] = useState("");
  const [loginPassword, setLoginPassword] = useState("");
  const [loginError, setLoginError] = useState("");
  const [activeLoginTab, setActiveLoginTab] = useState<"student" | "admin">("student");

  // Camera & Video Streaming States
  const [webcamStream, setWebcamStream] = useState<MediaStream | null>(null);
  const [cameraActive, setCameraActive] = useState(false);
  const [cameraPermission, setCameraPermission] = useState<"prompt" | "granted" | "denied">("prompt");
  const videoRef = useRef<HTMLVideoElement | null>(null);
  const canvasRef = useRef<HTMLCanvasElement | null>(null);

  // Chatbot Assistant State
  const [isChatOpen, setIsChatOpen] = useState(false);
  const [chatMessages, setChatMessages] = useState([
    { sender: "ai", text: "Hello! I'm the ProctorAI Academic Assistant. Ask me anything about our computer vision models, performance evaluation indices, or system security layers!" }
  ]);
  const [chatInput, setChatInput] = useState("");

  // Simulated Exam & Proctoring Sandbox State
  const [sandboxActive, setSandboxActive] = useState(false);
  const [currentQuestionIdx, setCurrentQuestionIdx] = useState(0);
  const [selectedAnswers, setSelectedAnswers] = useState<Record<number, number>>({});
  const [examSubmitted, setExamSubmitted] = useState(false);
  const [examTimer, setExamTimer] = useState(180); // 3 minutes
  const [integrityScore, setIntegrityScore] = useState(100);
  const [activeViolationsCount, setActiveViolationsCount] = useState(0);

  // Active Simulated Flags
  const [flagLookAway, setFlagLookAway] = useState(false);
  const [flagMultiFace, setFlagMultiFace] = useState(false);
  const [flagPhone, setFlagPhone] = useState(false);
  const [flagTabSwitch, setFlagTabSwitch] = useState(false);

  // Stats Counters with auto-increment
  const [stats, setStats] = useState({ checks: 0, models: 0, roles: 0, autoGraded: 0 });

  // Terminal & Sandbox Live logs
  const [logs, setLogs] = useState<Log[]>([
    { id: "1", time: "14:23:05", studentId: "STU-2041", event: "Face Not Detected", level: "HIGH", model: "OpenCV Haar", ref: "Frame #1823" },
    { id: "2", time: "14:23:19", studentId: "STU-2041", event: "Multiple Faces (2 Detected)", level: "HIGH", model: "YOLOv8", ref: "Frame #1994" },
    { id: "3", time: "14:28:44", studentId: "STU-2072", event: "Gaze: LEFT > 4s", level: "MED", model: "MediaPipe Mesh", ref: "Frame #2887" },
    { id: "4", time: "14:31:07", studentId: "STU-2087", event: "Head Turned (Yaw: 38°)", level: "MED", model: "MediaPipe+OCV", ref: "Frame #3211" },
    { id: "5", time: "14:35:23", studentId: "STU-2041", event: "Mobile Phone Detected", level: "HIGH", model: "YOLOv8 Phone", ref: "Frame #3891" },
    { id: "6", time: "14:38:44", studentId: "STU-2055", event: "Tab Switch Detected", level: "MED", model: "Browser API", ref: "Frame #4102" },
    { id: "7", time: "14:42:11", studentId: "STU-2063", event: "Noise Detected (82dB)", level: "LOW", model: "Web Audio API", ref: "Frame #4720" },
    { id: "8", time: "14:44:52", studentId: "STU-2041", event: "Face Not Detected", level: "HIGH", model: "OpenCV Haar", ref: "Frame #5092" }
  ]);

  // Selected Interactive Proctoring Grid Item for detail view
  const [selectedProctorCheck, setSelectedProctorCheck] = useState<number>(0);

  // Post-exam AI Review Chatbot States
  const [reviewChatMessages, setReviewChatMessages] = useState([
    { sender: "ai", text: "Hello! I've analyzed your exam results. I can explain any question, suggest what topics you should focus on, give you personalized practice questions, or clarify where you lost marks. What would you like to discuss?" }
  ]);
  const [reviewChatInput, setReviewChatInput] = useState("");
  const [isReviewChatThinking, setIsReviewChatThinking] = useState(false);
  const [pdfDownloadedAutomatically, setPdfDownloadedAutomatically] = useState(false);

  // Automatic PDF generation when exam is submitted
  useEffect(() => {
    if (examSubmitted && !pdfDownloadedAutomatically) {
      const timer = setTimeout(() => {
        handleDownloadPDF();
        setPdfDownloadedAutomatically(true);
      }, 1500);
      return () => clearTimeout(timer);
    } else if (!examSubmitted) {
      // Reset auto-download status when starting a new session
      setPdfDownloadedAutomatically(false);
      setReviewChatMessages([
        { sender: "ai", text: "Hello! I've analyzed your exam results. I can explain any question, suggest what topics you should focus on, give you personalized practice questions, or clarify where you lost marks. What would you like to discuss?" }
      ]);
    }
  }, [examSubmitted]);

  // QR Code drawing helper inside PDF
  const drawQRCode = (doc: any, x: number, y: number, size: number) => {
    doc.setDrawColor(0, 0, 0);
    doc.setLineWidth(0.5);
    doc.rect(x, y, size, size);
    
    // Top-Left Anchor
    doc.setFillColor(0, 0, 0);
    doc.rect(x + 2, y + 2, 6, 6, "F");
    doc.setFillColor(255, 255, 255);
    doc.rect(x + 3, y + 3, 4, 4, "F");
    doc.setFillColor(0, 0, 0);
    doc.rect(x + 4, y + 4, 2, 2, "F");
    
    // Top-Right Anchor
    doc.setFillColor(0, 0, 0);
    doc.rect(x + size - 8, y + 2, 6, 6, "F");
    doc.setFillColor(255, 255, 255);
    doc.rect(x + size - 7, y + 3, 4, 4, "F");
    doc.setFillColor(0, 0, 0);
    doc.rect(x + size - 6, y + 4, 2, 2, "F");
    
    // Bottom-Left Anchor
    doc.setFillColor(0, 0, 0);
    doc.rect(x + 2, y + size - 8, 6, 6, "F");
    doc.setFillColor(255, 255, 255);
    doc.rect(x + 3, y + size - 7, 4, 4, "F");
    doc.setFillColor(0, 0, 0);
    doc.rect(x + 4, y + size - 6, 2, 2, "F");
    
    // Fill background noise
    doc.setFillColor(0, 0, 0);
    for (let r = 2; r < size - 2; r += 2) {
      for (let c = 2; c < size - 2; c += 2) {
        if (r < 9 && c < 9) continue;
        if (r < 9 && c > size - 9) continue;
        if (r > size - 9 && c < 9) continue;
        
        if (Math.sin(r * c + r) > 0) {
          doc.rect(x + c, y + r, 1.5, 1.5, "F");
        }
      }
    }
  };

  const handleDownloadPDF = () => {
    try {
      const doc = new jsPDF();
      
      // Page styling parameters
      doc.setFillColor(16, 185, 129); // SSIT Green accent
      doc.rect(15, 15, 180, 4, "F");
      
      doc.setTextColor(20, 20, 20);
      doc.setFont("helvetica", "bold");
      doc.setFontSize(20);
      doc.text("PROCTORAI EXAMINATION AUDIT REPORT", 15, 28);
      
      doc.setFont("helvetica", "normal");
      doc.setFontSize(9);
      doc.setTextColor(110, 110, 110);
      doc.text("SRI SAI RAM INSTITUTE OF TECHNOLOGY (SSIT) • COMPUTE & AI AUDIT CENTER", 15, 34);
      
      doc.setDrawColor(210, 215, 212);
      doc.setLineWidth(0.5);
      doc.line(15, 38, 195, 38);
      
      // Candidate info grid
      doc.setFillColor(248, 250, 249);
      doc.rect(15, 42, 180, 40, "F");
      doc.setDrawColor(220, 225, 222);
      doc.rect(15, 42, 180, 40);
      
      doc.setFont("helvetica", "bold");
      doc.setFontSize(10);
      doc.setTextColor(16, 185, 129);
      doc.text("STUDENT PROFILE", 20, 48);
      doc.text("EXAMINATION SPECIFICATIONS", 110, 48);
      
      doc.setFont("helvetica", "normal");
      doc.setFontSize(9);
      doc.setTextColor(60, 60, 60);
      
      // Student particulars
      doc.text("Name: Sudar (SSIT Scholar)", 20, 55);
      doc.text("Student ID: STU-2092", 20, 61);
      doc.text("Email: dextron1109@gmail.com", 20, 67);
      doc.text("Cryptographic Ledger: VERIFIED_SSL_ID", 20, 73);
      
      // Exam particulars
      doc.text("Subject: SSIT Vision Platform Trial — Section A", 110, 55);
      doc.text("Platform Version: v3.2-prod-stable", 110, 61);
      doc.text("Audit Date: " + new Date().toLocaleDateString(), 110, 67);
      doc.text("Telemetry Node: CLOUD_RUN_CONTAINER_3000", 110, 73);
      
      // Scores & Trust Rating boxes
      const correctCount = getCorrectAnswersCount();
      const pct = Math.round((correctCount / questions.length) * 100);
      const isPass = pct >= 50;
      
      // Marks KPI box
      doc.setFillColor(248, 250, 249);
      doc.rect(15, 87, 85, 26, "F");
      doc.rect(15, 87, 85, 26);
      
      doc.setFont("helvetica", "bold");
      doc.setFontSize(9);
      doc.setTextColor(100, 100, 100);
      doc.text("ACADEMIC ASSESSMENT SCORE", 20, 93);
      
      doc.setFont("helvetica", "bold");
      doc.setFontSize(15);
      doc.setTextColor(16, 185, 129);
      doc.text(`${correctCount} / ${questions.length} (${pct}%)`, 20, 101);
      
      doc.setFont("helvetica", "normal");
      doc.setFontSize(8);
      doc.setTextColor(120, 120, 120);
      doc.text(`Status: ${isPass ? "PASSED THRESHOLD" : "FAILED THRESHOLD"}`, 20, 107);
      
      // Integrity rating box
      doc.setFillColor(248, 250, 249);
      doc.rect(110, 87, 85, 26, "F");
      doc.rect(110, 87, 85, 26);
      
      doc.setFont("helvetica", "bold");
      doc.setFontSize(9);
      doc.setTextColor(100, 100, 100);
      doc.text("CANDIDATE TRUST RATING", 115, 93);
      
      doc.setFont("helvetica", "bold");
      doc.setFontSize(15);
      if (integrityScore >= 80) doc.setTextColor(16, 185, 129);
      else if (integrityScore >= 50) doc.setTextColor(217, 119, 6);
      else doc.setTextColor(220, 38, 38);
      doc.text(`${integrityScore}%`, 115, 101);
      
      doc.setFont("helvetica", "normal");
      doc.setFontSize(8);
      doc.setTextColor(120, 120, 120);
      const level = integrityScore >= 80 ? "SECURE_INTEGRITY" : integrityScore >= 50 ? "FLAGGED_FOR_AUDIT" : "PROCTORING_COMPROMISED";
      doc.text(`Status: ${level}`, 115, 107);
      
      // Questions Table Breakdown
      doc.setFont("helvetica", "bold");
      doc.setFontSize(11);
      doc.setTextColor(20, 20, 20);
      doc.text("ITEMIZED PERFORMANCE ANALYSIS", 15, 121);
      
      // Header row
      doc.setFillColor(235, 239, 236);
      doc.rect(15, 125, 180, 7, "F");
      doc.rect(15, 125, 180, 7);
      
      doc.setFont("helvetica", "bold");
      doc.setFontSize(8.5);
      doc.setTextColor(60, 70, 65);
      doc.text("ITEM", 18, 130);
      doc.text("TOPICAL CORE", 28, 130);
      doc.text("CANDIDATE SELECTION", 100, 130);
      doc.text("EVALUATION", 170, 130);
      
      doc.setFont("helvetica", "normal");
      doc.setFontSize(8.5);
      doc.setTextColor(60, 60, 60);
      
      let tableY = 132;
      const topics = [
        "In-Browser Face Mesh Models",
        "Head Gaze Estimations",
        "AI Proctor Evaluation Index",
        "Tab Switch Focus Observers",
        "Relational DB Design Patterns"
      ];
      
      questions.forEach((q, idx) => {
        tableY += 8;
        doc.rect(15, tableY - 6, 180, 8);
        
        doc.text(`${idx + 1}`, 18, tableY - 1);
        doc.text(topics[idx], 28, tableY - 1);
        
        const ansIndex = selectedAnswers[q.id];
        const studentAnsLabel = ansIndex !== undefined ? q.options[ansIndex] : "No Answer Selected";
        let truncatedAns = studentAnsLabel.length > 36 ? studentAnsLabel.substring(0, 33) + "..." : studentAnsLabel;
        doc.text(truncatedAns, 100, tableY - 1);
        
        const isCorrect = ansIndex === q.correctAnswer;
        if (isCorrect) {
          doc.setFillColor(16, 185, 129);
          doc.setTextColor(16, 185, 129);
          doc.text("CORRECT", 170, tableY - 1);
        } else {
          doc.setTextColor(220, 38, 38);
          doc.text("INCORRECT", 170, tableY - 1);
        }
        doc.setTextColor(60, 60, 60);
      });
      
      // Proctoring audit overview
      doc.setFont("helvetica", "bold");
      doc.setFontSize(11);
      doc.setTextColor(20, 20, 20);
      doc.text("BIOMETRIC PROCTORING CHEATING ANALYSIS", 15, 188);
      
      doc.setFont("helvetica", "normal");
      doc.setFontSize(9);
      doc.setTextColor(70, 70, 70);
      doc.text("Automated monitoring evaluated the real-time webcam stream feed for behavioral anomalies:", 15, 194);
      
      const tabSwitches = flagTabSwitch ? "Yes (1 Event Recorded)" : "No Switches Triggered";
      const cellphoneSeen = activeViolationsCount > 0 && flagPhone ? "Cell Phone Shape Flagged" : "No Electronics Detected";
      const gazeDev = flagLookAway ? "Gaze Deviation Alert (>4s)" : "Normal Eye Gaze Ratio";
      const peerPresence = flagMultiFace ? "Multiple Face Vectors Seen" : "Single Secure Candidate Present";
      
      doc.text(`• Look-Away Gaze Tracker:    ${gazeDev}`, 20, 201);
      doc.text(`• Multiple Faces Check:        ${peerPresence}`, 20, 207);
      doc.text(`• Mobile Device Shape (YOLO):  ${cellphoneSeen}`, 20, 213);
      doc.text(`• Workspace focus (Blur APIs):  ${tabSwitches}`, 20, 219);
      
      // Recommendations Section
      doc.setFont("helvetica", "bold");
      doc.setFontSize(11);
      doc.setTextColor(20, 20, 20);
      doc.text("PROCTORING & ACADEMIC REVIEWS", 15, 233);
      
      doc.setFont("helvetica", "normal");
      doc.setFontSize(8.5);
      doc.setTextColor(80, 80, 80);
      
      let recAcademic = "• Academic: Revise browser visibility hooks and OpenCV Haar Cascade thresholds.";
      let recIntegrity = "• Integrity: Great exam hygiene. Focus posture matches secure credentials.";
      
      if (pct < 80) {
        recAcademic = "• Academic: Focus on the architectural nuances of YOLOv8 object boundaries and 3D facial landmarks.";
      } else {
        recAcademic = "• Academic: Exceptional competence demonstrated. Ready for advanced neural network certifications.";
      }
      
      if (integrityScore < 85) {
        recIntegrity = "• Integrity: Ensure all surrounding electronics are disabled and maintain gaze posture on the testing view.";
      } else {
        recIntegrity = "• Integrity: High-trust behavior verified. Maintain this posture for all secure assessments.";
      }
      
      doc.text(recAcademic, 15, 239);
      doc.text(recIntegrity, 15, 245);
      
      // Signatures and QR Verification
      doc.setFont("helvetica", "bold");
      doc.setFontSize(10);
      doc.setTextColor(20, 20, 20);
      doc.text("FACULTY SIGNATURE", 15, 258);
      
      doc.setFont("helvetica", "normal");
      doc.setFontSize(8);
      doc.setTextColor(110, 110, 110);
      doc.text("Instructor Approval Ledger:", 15, 263);
      
      // Draw stylized signature
      doc.setFont("times", "italic");
      doc.setFontSize(13);
      doc.setTextColor(16, 185, 129);
      doc.text("Dr. S. Sudarsan", 15, 270);
      
      doc.setFont("helvetica", "normal");
      doc.setFontSize(8);
      doc.setTextColor(120, 120, 120);
      doc.text("Director of Computational Sciences, SSIT", 15, 275);
      
      // QR verification block
      doc.setFont("helvetica", "bold");
      doc.setFontSize(9);
      doc.setTextColor(20, 20, 20);
      doc.text("LEDGER VALIDATION", 145, 258);
      drawQRCode(doc, 145, 260, 24);
      
      doc.setFont("helvetica", "normal");
      doc.setFontSize(7);
      doc.setTextColor(120, 120, 120);
      doc.text("Scan to audit SHA ledger authenticity", 145, 287);
      
      doc.setFont("helvetica", "normal");
      doc.setFontSize(7.5);
      doc.setTextColor(170, 170, 170);
      doc.text("Automatically compiled by ProctorAI Cryptographic Module. Printed in SSIT, India.", 15, 293);
      
      // Save
      doc.save(`STU-2092-ProctorAI-Report.pdf`);
    } catch (err) {
      console.error("PDF generation error: ", err);
    }
  };

  const [reviewChatInputPlaceholder, setReviewChatInputPlaceholder] = useState("Ask why you lost marks, what topics to study, or for custom practice questions...");

  const handleReviewChatSubmit = async (e?: React.FormEvent, customMsg?: string) => {
    if (e) e.preventDefault();
    const userMsg = (customMsg || reviewChatInput).trim();
    if (!userMsg) return;

    // Add user message to state
    setReviewChatMessages(prev => [...prev, { sender: "user", text: userMsg }]);
    if (!customMsg) setReviewChatInput("");
    setIsReviewChatThinking(true);

    try {
      const correctCount = getCorrectAnswersCount();
      const pct = Math.round((correctCount / questions.length) * 100);
      
      const payload = {
        message: userMsg,
        history: reviewChatMessages,
        examResult: {
          studentName: "Sudar",
          studentId: "STU-2092",
          examTitle: "SSIT Vision Platform Trial — Section A",
          correctCount,
          totalCount: questions.length,
          percentage: pct,
          integrityScore,
          classification: integrityScore >= 80 ? "SECURE_INTEGRITY" : integrityScore >= 50 ? "FLAGGED_FOR_AUDIT" : "PROCTORING_COMPROMISED",
          anomalyCount: activeViolationsCount,
          logs: logs.slice(0, 8),
          questions: questions.map(q => ({
            question: q.question,
            options: q.options,
            correctAnswer: q.correctAnswer,
            selectedAnswer: selectedAnswers[q.id]
          }))
        }
      };

      const res = await fetch("/api/chatbot", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(payload)
      });

      if (!res.ok) {
        let errMsg = "Failed to contact AI Assistant";
        try {
          const errData = await res.json();
          if (errData && errData.error) {
            errMsg = errData.error;
          }
        } catch (_) {}
        throw new Error(errMsg);
      }

      const data = await res.json();
      setReviewChatMessages(prev => [...prev, { sender: "ai", text: data.reply || "I encountered an issue processing that. Please try again." }]);
    } catch (err: any) {
      console.error(err);
      setReviewChatMessages(prev => [...prev, { sender: "ai", text: `Error: ${err.message || "Failed to fetch response."} Please verify your server connection and that GEMINI_API_KEY is configured correctly.` }]);
    } finally {
      setIsReviewChatThinking(false);
    }
  };

  // Mock Question Bank
  const questions: Question[] = [
    {
      id: 1,
      question: "Which computer vision tool or model is best suited for real-time, low-latency face mesh and head pose yaw tracking directly in the browser?",
      options: [
        "Traditional Haar Cascades",
        "Google MediaPipe Face Mesh",
        "Segment Anything Model (SAM)",
        "ResNet-152 deep neural network"
      ],
      correctAnswer: 1
    },
    {
      id: 2,
      question: "In automated online proctoring, what is the main purpose of monitoring head yaw and pitch angles?",
      options: [
        "To verify identity against a database",
        "To estimate user distraction when looking away from the screen",
        "To assess the lighting conditions of the testing room",
        "To adjust the resolution of the video stream automatically"
      ],
      correctAnswer: 1
    },
    {
      id: 3,
      question: "Which metric represents the integrity evaluation of a student during an active exam proctored by an AI platform?",
      options: [
        "Accuracy Ratio",
        "Trust Score / Integrity Index",
        "Page Rank",
        "Inference Rate"
      ],
      correctAnswer: 1
    },
    {
      id: 4,
      question: "To prevent unauthorized collaboration, standard proctoring platforms actively capture window 'blur' events. What does this capture?",
      options: [
        "When the camera gets physically blurry",
        "When the student switches tabs or clicks outside the exam browser environment",
        "When the room's illumination drops significantly",
        "When the microphone audio gets noisy"
      ],
      correctAnswer: 1
    },
    {
      id: 5,
      question: "Which database design pattern is optimal for persisting high-frequency proctoring logs containing frame statistics and violation types?",
      options: [
        "Static JSON configuration files",
        "Relational tables with clear indexes or NoSQL collections grouped by Session ID",
        "Temporary local session arrays only",
        "Unstructured plaintext server-dump files"
      ],
      correctAnswer: 1
    }
  ];

  // AI Proctoring Engine 2x2 Grid Data
  const proctoringChecks = [
    { 
      icon: "👁", 
      title: "Face Presence Verification", 
      model: "MediaPipe Face Detection via TensorFlow.js", 
      badge: "CLIENT-SIDE ONLY",
      desc: "Verifies face is present at exam start. Continuously checks throughout session. Prolonged absence (configurable threshold) triggers warning + logs event." 
    },
    { 
      icon: "↔", 
      title: "Gaze Direction Tracking", 
      model: "MediaPipe FaceMesh landmarks", 
      badge: "NO SERVER UPLOAD",
      desc: "Infers whether student is looking at the screen or away using facial landmark geometry. Repeated off-screen gaze events are logged and contribute to suspicion score." 
    },
    { 
      icon: "👥", 
      title: "Multiple Person Detection", 
      model: "MediaPipe Face Detection (face count)", 
      badge: "FRAME ANALYZED IN BROWSER",
      desc: "Flags if more than one face appears in the webcam frame. Single occurrence raises suspicion; multiple occurrences trigger high-severity alert." 
    },
    { 
      icon: "🖥", 
      title: "Browser Behavioural Signals", 
      model: "Page Visibility API + Window blur/focus events", 
      badge: "NO AI MODEL NEEDED",
      desc: "Tab-visibility-change events, window blur/focus events are captured. Max tab-switch warnings configurable by examiner before auto-flag threshold." 
    }
  ];

  // Tech Stack details
  const techStackRows = [
    { layer: "Frontend", tech: "Next.js (React)", purpose: "Exam UI, results dashboard, grading portal", status: "Active" },
    { layer: "Backend", tech: "FastAPI (Python)", purpose: "REST API, exam logic, WebSocket", status: "Active" },
    { layer: "Database", tech: "PostgreSQL", purpose: "All persistent data + proctor_events", status: "Active" },
    { layer: "ORM", tech: "SQLAlchemy + Alembic", purpose: "Schema management + migrations", status: "Active" },
    { layer: "Auth", tech: "JWT + python-jose", purpose: "Role-based session management", status: "Active" },
    { layer: "Scheduling", tech: "APScheduler", purpose: "Auto-submit on timeout", status: "Active" },
    { layer: "AI Proctoring", tech: "MediaPipe via TensorFlow.js", purpose: "Face detection, gaze, multi-person (client-side)", status: "Active" },
    { layer: "LLM Grading", tech: "OpenAI GPT-4o", purpose: "Subjective answer evaluation", status: "Active" },
    { layer: "OCR", tech: "Tesseract / Google Vision", purpose: "Handwritten answer text extraction", status: "Active" },
    { layer: "Deployment", tech: "Docker Compose", purpose: "FastAPI + PostgreSQL + Next.js", status: "Active" },
    { layer: "Load Testing", tech: "Locust / k6", purpose: "API stress testing", status: "Active" },
    { layer: "API Docs", tech: "FastAPI Swagger", purpose: "Auto-generated at /docs", status: "Active" }
  ];

  // Effect to increment stats naturally on mount
  useEffect(() => {
    const timer = setTimeout(() => {
      setStats({
        checks: 10,
        models: 7,
        roles: 3,
        autoGraded: 100
      });
    }, 400);
    return () => clearTimeout(timer);
  }, []);

  // Monitor Scroll for Navbar
  useEffect(() => {
    const handleScroll = () => {
      setScrolled(window.scrollY > 40);

      // Simple active section tracer based on scroll offset
      const sections = ["hero", "user-roles", "ai-proctoring", "performance", "how-it-works", "tech-stack", "dashboard"];
      for (const section of sections) {
        const el = document.getElementById(section);
        if (el) {
          const rect = el.getBoundingClientRect();
          if (rect.top <= 180 && rect.bottom >= 180) {
            setActiveSection(section);
            break;
          }
        }
      }
    };
    window.addEventListener("scroll", handleScroll);
    return () => window.removeEventListener("scroll", handleScroll);
  }, []);

  // Active Sandbox Countdown effect
  useEffect(() => {
    let interval: NodeJS.Timeout;
    if (sandboxActive && !examSubmitted && examTimer > 0) {
      interval = setInterval(() => {
        setExamTimer(prev => {
          if (prev <= 1) {
            handleSandboxSubmit();
            return 0;
          }
          return prev - 1;
        });
      }, 1000);
    }
    return () => clearInterval(interval);
  }, [sandboxActive, examSubmitted, examTimer]);

  // Detect Visibility change (window tab switches) - real proctoring rule!
  useEffect(() => {
    const handleVisibilityChange = () => {
      if (document.hidden && sandboxActive && !examSubmitted) {
        setFlagTabSwitch(true);
        triggerViolation("System Tab Switch", "HIGH", "Browser API", "OS_EVENT_WINDOW_BLUR");
        setIntegrityScore(prev => Math.max(0, prev - 25));
        setActiveViolationsCount(prev => prev + 1);
      }
    };
    document.addEventListener("visibilitychange", handleVisibilityChange);
    return () => document.removeEventListener("visibilitychange", handleVisibilityChange);
  }, [sandboxActive, examSubmitted]);

  // Connect video stream to video element
  useEffect(() => {
    if (videoRef.current && webcamStream) {
      videoRef.current.srcObject = webcamStream;
    }
  }, [webcamStream]);

  // Clean up media tracks on unmount or reset
  useEffect(() => {
    return () => {
      if (webcamStream) {
        webcamStream.getTracks().forEach(track => track.stop());
      }
    };
  }, [webcamStream]);

  // Biometric computer vision high-fidelity tracking canvas drawing loop
  useEffect(() => {
    if (!cameraActive || !canvasRef.current || !sandboxActive || examSubmitted) return;

    const canvas = canvasRef.current;
    const ctx = canvas.getContext("2d");
    if (!ctx) return;

    let animationId: number;
    let frameCount = 0;

    const render = () => {
      // Align high resolution
      const rect = canvas.getBoundingClientRect();
      if (canvas.width !== rect.width || canvas.height !== rect.height) {
        canvas.width = rect.width;
        canvas.height = rect.height;
      }

      const w = canvas.width;
      const h = canvas.height;
      ctx.clearRect(0, 0, w, h);
      frameCount++;

      const cx = w / 2;
      const cy = h / 2;

      // Calibration indicator grid
      ctx.strokeStyle = "rgba(16, 185, 129, 0.15)";
      ctx.lineWidth = 1;
      ctx.beginPath();
      ctx.moveTo(cx - 30, cy); ctx.lineTo(cx + 30, cy);
      ctx.moveTo(cx, cy - 30); ctx.lineTo(cx, cy + 30);
      ctx.stroke();

      // Facial target centers
      let faceX = cx;
      let faceY = cy - 10;
      let statusColor = "#10B981"; // emerald
      let label = "FACE_BIO_OK_STU";

      if (flagLookAway) {
        faceX = cx - 80;
        faceY = cy - 15;
        statusColor = "#F59E0B"; // amber
        label = "LOOKAWAY_DEVIATION";
      } else if (flagPhone || flagMultiFace) {
        statusColor = "#EF4444"; // red
        if (flagPhone) label = "CELLPHONE_WARN";
        if (flagMultiFace) label = "MULTIPLE_FACE";
      }

      // Add dynamic physiological jitter (breathing + ocular micro-movement)
      faceY += Math.sin(frameCount * 0.05) * 3;
      faceX += Math.cos(frameCount * 0.03) * 1.5;

      const boxW = 120;
      const boxH = 155;

      // Draw bounding contour rectangle
      ctx.strokeStyle = statusColor;
      ctx.lineWidth = 2.5;
      ctx.strokeRect(faceX - boxW / 2, faceY - boxH / 2, boxW, boxH);

      // Draw bounding labeling capsule
      ctx.fillStyle = statusColor;
      ctx.font = "bold 9px monospace";
      const confidence = (96.5 + Math.sin(frameCount * 0.08) * 2.8).toFixed(1);
      const capText = `${label} [CONFIDENCE: ${confidence}%]`;
      const txtMetric = ctx.measureText(capText);
      ctx.fillRect(faceX - boxW / 2 - 1, faceY - boxH / 2 - 16, txtMetric.width + 10, 16);

      ctx.fillStyle = "#000000";
      ctx.fillText(capText, faceX - boxW / 2 + 4, faceY - boxH / 2 - 4);

      // Landmarks vertices
      const leftEye: [number, number] = [faceX - 25, faceY - 18];
      const rightEye: [number, number] = [faceX + 25, faceY - 18];
      const noseBridge: [number, number][] = [
        [faceX, faceY - 8],
        [faceX, faceY + 2],
        [faceX, faceY + 12]
      ];
      const mouth: [number, number][] = [
        [faceX - 18, faceY + 28],
        [faceX - 9, faceY + 25],
        [faceX, faceY + 30],
        [faceX + 9, faceY + 25],
        [faceX + 18, faceY + 28],
        [faceX, faceY + 35]
      ];
      const leftBrow: [number, number][] = [
        [faceX - 38, faceY - 30],
        [faceX - 28, faceY - 33],
        [faceX - 18, faceY - 30]
      ];
      const rightBrow: [number, number][] = [
        [faceX + 18, faceY - 30],
        [faceX + 28, faceY - 33],
        [faceX + 38, faceY - 30]
      ];

      // Gaze ray projections
      ctx.lineWidth = 2;
      ctx.strokeStyle = flagLookAway ? "#F59E0B" : "#10B981";
      
      let gazeDx = 0;
      let gazeDy = -180;
      if (flagLookAway) {
        gazeDx = -140;
        gazeDy = -10;
      } else {
        gazeDx = Math.sin(frameCount * 0.06) * 12;
      }

      // Left eye gaze ray
      ctx.beginPath();
      ctx.moveTo(leftEye[0], leftEye[1]);
      ctx.lineTo(leftEye[0] + gazeDx, leftEye[1] + gazeDy);
      ctx.stroke();

      // Right eye gaze ray
      ctx.beginPath();
      ctx.moveTo(rightEye[0], rightEye[1]);
      ctx.lineTo(rightEye[0] + gazeDx, rightEye[1] + gazeDy);
      ctx.stroke();

      // Pupil verification dots
      ctx.fillStyle = "#EF4444";
      ctx.beginPath();
      ctx.arc(leftEye[0], leftEye[1], 3.5, 0, Math.PI * 2);
      ctx.arc(rightEye[0], rightEye[1], 3.5, 0, Math.PI * 2);
      ctx.fill();

      // Draw interconnective meshes
      ctx.strokeStyle = flagLookAway 
        ? "rgba(245, 158, 11, 0.22)" 
        : (flagPhone || flagMultiFace) 
          ? "rgba(239, 68, 68, 0.22)" 
          : "rgba(16, 185, 129, 0.22)";
      ctx.lineWidth = 1;

      const points = [...leftBrow, ...rightBrow, leftEye, rightEye, ...noseBridge, ...mouth];
      
      // Points vertices
      ctx.fillStyle = statusColor;
      points.forEach(p => {
        ctx.beginPath();
        ctx.arc(p[0], p[1], 2, 0, Math.PI * 2);
        ctx.fill();
      });

      // Connect nose and eyebrows mesh
      ctx.beginPath();
      ctx.moveTo(leftBrow[0][0], leftBrow[0][1]);
      for (let i = 1; i < leftBrow.length; i++) ctx.lineTo(leftBrow[i][0], leftBrow[i][1]);
      ctx.moveTo(rightBrow[0][0], rightBrow[0][1]);
      for (let i = 1; i < rightBrow.length; i++) ctx.lineTo(rightBrow[i][0], rightBrow[i][1]);

      ctx.moveTo(leftBrow[2][0], leftBrow[2][1]);
      ctx.lineTo(noseBridge[0][0], noseBridge[0][1]);
      ctx.lineTo(rightBrow[0][0], rightBrow[0][1]);
      
      ctx.moveTo(leftEye[0], leftEye[1]);
      ctx.lineTo(noseBridge[0][0], noseBridge[0][1]);
      ctx.lineTo(noseBridge[1][0], noseBridge[1][1]);
      ctx.lineTo(noseBridge[2][0], noseBridge[2][1]);
      ctx.lineTo(leftEye[0], leftEye[1]);

      ctx.moveTo(noseBridge[2][0], noseBridge[2][1]);
      ctx.lineTo(rightEye[0], rightEye[1]);
      ctx.lineTo(noseBridge[0][0], noseBridge[0][1]);

      // Mouth loops
      ctx.moveTo(mouth[0][0], mouth[0][1]);
      for (let i = 1; i < mouth.length; i++) ctx.lineTo(mouth[i][0], mouth[i][1]);
      ctx.closePath();
      ctx.stroke();

      // Simulate secondary YOLO contours
      if (flagPhone) {
        const phX = w - 70;
        const phY = h - 90;
        const phW = 50;
        const phH = 85;

        ctx.strokeStyle = "#EF4444";
        ctx.lineWidth = 2;
        ctx.strokeRect(phX - phW / 2, phY - phH / 2, phW, phH);

        ctx.fillStyle = "#EF4444";
        ctx.fillRect(phX - phW / 2 - 1, phY - phH / 2 - 13, 50, 13);
        ctx.fillStyle = "#000000";
        ctx.font = "bold 8px monospace";
        ctx.fillText("PHONE_98.1%", phX - phW / 2 + 2, phY - phH / 2 - 3);
      }

      if (flagMultiFace) {
        const peerX = cx - 110;
        const peerY = cy + 25;
        const peerW = 80;
        const peerH = 105;

        ctx.strokeStyle = "#EF4444";
        ctx.lineWidth = 2;
        ctx.strokeRect(peerX - peerW / 2, peerY - peerH / 2, peerW, peerH);

        ctx.fillStyle = "#EF4444";
        ctx.fillRect(peerX - peerW / 2 - 1, peerY - peerH / 2 - 13, 62, 13);
        ctx.fillStyle = "#000000";
        ctx.font = "bold 8px monospace";
        ctx.fillText("PEER_89.4%", peerX - peerW / 2 + 2, peerY - peerH / 2 - 3);

        ctx.fillStyle = "#EF4444";
        ctx.beginPath();
        ctx.arc(peerX - 10, peerY - 8, 2, 0, Math.PI * 2);
        ctx.arc(peerX + 10, peerY - 8, 2, 0, Math.PI * 2);
        ctx.arc(peerX, peerY + 10, 2, 0, Math.PI * 2);
        ctx.fill();
      }

      // Scanner green ray
      ctx.strokeStyle = statusColor;
      ctx.lineWidth = 1;
      const lineY = (frameCount * 1.8) % h;
      ctx.beginPath();
      ctx.moveTo(0, lineY);
      ctx.lineTo(w, lineY);
      ctx.stroke();

      // Corner markers
      const sz = 12;
      ctx.strokeStyle = statusColor;
      ctx.lineWidth = 3.5;
      // TL
      ctx.beginPath(); ctx.moveTo(6, 6 + sz); ctx.lineTo(6, 6); ctx.lineTo(6 + sz, 6); ctx.stroke();
      // TR
      ctx.beginPath(); ctx.moveTo(w - 6, 6 + sz); ctx.lineTo(w - 6, 6); ctx.lineTo(w - 6 - sz, 6); ctx.stroke();
      // BL
      ctx.beginPath(); ctx.moveTo(6, h - 6 - sz); ctx.lineTo(6, h - 6); ctx.lineTo(6 + sz, h - 6); ctx.stroke();
      // BR
      ctx.beginPath(); ctx.moveTo(w - 6, h - 6 - sz); ctx.lineTo(w - 6, h - 6); ctx.lineTo(w - 6 - sz, h - 6); ctx.stroke();

      animationId = requestAnimationFrame(render);
    };

    render();
    return () => cancelAnimationFrame(animationId);
  }, [cameraActive, flagLookAway, flagMultiFace, flagPhone, sandboxActive, examSubmitted]);

  // Request client video capture stream
  const startCamera = async () => {
    try {
      const stream = await navigator.mediaDevices.getUserMedia({
        video: { width: 640, height: 480 },
        audio: false
      });
      setWebcamStream(stream);
      setCameraActive(true);
      setCameraPermission("granted");
      triggerViolation("Local webcam capture authorized", "INFO", "Webcam Driver API", "SYS_DEV_OK");
    } catch (err) {
      console.error("Camera access failed:", err);
      setCameraPermission("denied");
      setCameraActive(false);
      triggerViolation("Camera access requested but REJECTED by candidate", "HIGH", "Hardware Security", "ERR_CAMERA_BLOCKED");
    }
  };

  const stopCamera = () => {
    if (webcamStream) {
      webcamStream.getTracks().forEach(track => track.stop());
      setWebcamStream(null);
    }
    setCameraActive(false);
    triggerViolation("Local webcam capture suspended", "INFO", "Webcam Driver API", "SYS_DEV_OFFLINE");
  };

  // Authentication & Login handlers
  const handleLogin = (e: React.FormEvent) => {
    e.preventDefault();
    setLoginError("");

    const u = loginUsername.trim();
    const p = loginPassword.trim();

    if (activeLoginTab === "student") {
      if (u === "Sudar" && p === "Root") {
        setUserRole("student");
        setLoginUsername("");
        setLoginPassword("");
        triggerViolation("Student security clearance verified (User: Sudar)", "INFO", "Active Directory", "AUTH_STU_MATCH");
      } else {
        setLoginError("Invalid Student credentials. (Hint: Sudar / Root)");
      }
    } else {
      if (u === "Sudarsan" && p === "Root") {
        setUserRole("admin");
        setLoginUsername("");
        setLoginPassword("");
        triggerViolation("Administrator security clearance verified (User: Sudarsan)", "INFO", "Active Directory", "AUTH_ADM_MATCH");
      } else {
        setLoginError("Invalid Faculty Admin credentials. (Hint: Sudarsan / Root)");
      }
    }
  };

  const handleLogout = () => {
    stopCamera();
    setSandboxActive(false);
    setUserRole("guest");
    setLoginUsername("");
    setLoginPassword("");
    setLoginError("");
    triggerViolation("User terminated session / logged out", "INFO", "Active Directory", "AUTH_DEAUTH_SUCCESS");
  };

  // Inject user custom violation or trigger automated one
  const triggerViolation = (event: string, level: "HIGH" | "MED" | "LOW" | "INFO", model: string, ref: string) => {
    const timestamp = new Date().toLocaleTimeString("en-US", { hour12: false });
    const newLog: Log = {
      id: String(Date.now()),
      time: timestamp,
      studentId: userRole === "student" ? "Sudar (STU-DEMO)" : "STU-DEMO",
      event,
      level,
      model,
      ref
    };
    setLogs(prev => [newLog, ...prev]);
  };

  // Simulated triggers in sandbox view
  const toggleViolationFlag = (type: "lookaway" | "multiface" | "phone") => {
    if (!sandboxActive || examSubmitted) return;
    
    if (type === "lookaway") {
      const nextState = !flagLookAway;
      setFlagLookAway(nextState);
      if (nextState) {
        triggerViolation("Head Turned (Yaw: 34°)", "MED", "MediaPipe+OCV", `Frame #${Math.floor(Math.random() * 8000 + 1000)}`);
        setIntegrityScore(prev => Math.max(0, prev - 12));
        setActiveViolationsCount(prev => prev + 1);
      }
    } else if (type === "multiface") {
      const nextState = !flagMultiFace;
      setFlagMultiFace(nextState);
      if (nextState) {
        triggerViolation("Multiple Faces (2 Detected)", "HIGH", "YOLOv8", `Frame #${Math.floor(Math.random() * 8000 + 1000)}`);
        setIntegrityScore(prev => Math.max(0, prev - 20));
        setActiveViolationsCount(prev => prev + 1);
      }
    } else if (type === "phone") {
      const nextState = !flagPhone;
      setFlagPhone(nextState);
      if (nextState) {
        triggerViolation("Mobile Phone Detected", "HIGH", "YOLOv8 Phone", `Frame #${Math.floor(Math.random() * 8000 + 1000)}`);
        setIntegrityScore(prev => Math.max(0, prev - 30));
        setActiveViolationsCount(prev => prev + 1);
      }
    }
  };

  // Launch simulated exam
  const startSandboxExam = () => {
    setSandboxActive(true);
    setExamSubmitted(false);
    setCurrentQuestionIdx(0);
    setSelectedAnswers({});
    setExamTimer(180);
    setIntegrityScore(100);
    setActiveViolationsCount(0);
    setFlagLookAway(false);
    setFlagMultiFace(false);
    setFlagPhone(false);
    setFlagTabSwitch(false);
    triggerViolation("Proctoring Session Started", "INFO", "Webcam Engine", "SESSION_INIT");
    // Auto initiate hardware camera request on exam start
    startCamera();
  };

  // Submit simulated exam
  const handleSandboxSubmit = () => {
    setExamSubmitted(true);
    setFlagLookAway(false);
    setFlagMultiFace(false);
    setFlagPhone(false);
    triggerViolation("Proctoring Session Submitted", "INFO", "Webcam Engine", "SESSION_LOCK");
    stopCamera();
  };

  const getCorrectAnswersCount = () => {
    let correct = 0;
    questions.forEach(q => {
      if (selectedAnswers[q.id] === q.correctAnswer) {
        correct++;
      }
    });
    return correct;
  };

  const handleSelectAnswer = (questionId: number, optionIndex: number) => {
    setSelectedAnswers(prev => ({
      ...prev,
      [questionId]: optionIndex
    }));
  };

  // Chatbot logic
  const handleChatSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!chatInput.trim()) return;

    const userMsg = chatInput.trim();
    setChatMessages(prev => [...prev, { sender: "user", text: userMsg }]);
    setChatInput("");

    // Simple automated intelligent replies based on keywords
    setTimeout(() => {
      let reply = "That's a very technical query! ProctorAI coordinates OpenCV face metrics with MediaPipe mesh coordinates, mapping continuous head pitch and yaw vectors directly in the browser with Scikit-Learn evaluation scores compiled at submission.";
      
      const textLower = userMsg.toLowerCase();
      if (textLower.includes("yolo") || textLower.includes("phone") || textLower.includes("mobile")) {
        reply = "The mobile phone and object tracker employs YOLOv8 deep weights trained specifically for electronic device shapes. It flags handheld rectangular contours with over 91% recognition accuracy.";
      } else if (textLower.includes("head") || textLower.includes("gaze") || textLower.includes("look")) {
        reply = "We estimate head pose by mapping 3D projection points via MediaPipe. When head yaw exceeds 28° or gaze projection vector points left or right of the browser display bounds for over 3 seconds, a medium severity proctoring log is created.";
      } else if (textLower.includes("cheating") || textLower.includes("trust") || textLower.includes("score")) {
        reply = "The Candidate Integrity Trust Rating begins at 100%. High severity violations (like phone detected or multiple persons present) decrease the rating by 20-30%, while minor gaze distractions decrease it by 10-12%.";
      } else if (textLower.includes("tab") || textLower.includes("switch")) {
        reply = "Browser tab switches are tracked instantly using the browser's Document Page Visibility API. Whenever focus shifts away from the testing iframe or window, a high-severity violation is triggered instantly.";
      } else if (textLower.includes("faculty") || textLower.includes("admin") || textLower.includes("report")) {
        reply = "Faculty can view individual student breakdown records, chronological logs of all flagged violation frames, average cohort scores, and target revision topics based on high-frequency error analysis.";
      }

      setChatMessages(prev => [...prev, { sender: "ai", text: reply }]);
    }, 700);
  };

  // Card Mouse Move for dynamic spotlight
  const handleCardMouseMove = (e: React.MouseEvent<HTMLDivElement>, targetId: string) => {
    const card = document.getElementById(targetId);
    if (card) {
      const rect = card.getBoundingClientRect();
      const x = e.clientX - rect.left;
      const y = e.clientY - rect.top;
      card.style.setProperty("--mouse-x", `${x}px`);
      card.style.setProperty("--mouse-y", `${y}px`);
    }
  };

  return (
    <div className="relative min-h-screen bg-[#050505] text-[#EBEBEB] font-sans selection:bg-emerald-900 selection:text-emerald-200">
      
      {/* Morphing Background Blobs */}
      <div className="blob blob-1 fixed top-[-120px] left-[-120px] pointer-events-none z-0 bg-emerald-500/5 filter blur-[100px] w-[450px] h-[450px] rounded-full animate-pulse duration-10000" />
      <div className="blob blob-2 fixed bottom-[-120px] right-[-120px] pointer-events-none z-0 bg-emerald-500/5 filter blur-[100px] w-[450px] h-[450px] rounded-full animate-pulse duration-[8000ms]" />

      {/* FIXED NAVBAR */}
      <nav 
        className={`fixed top-0 left-0 w-full z-50 transition-all duration-300 px-6 md:px-12 py-5 flex items-center justify-between ${
          scrolled 
            ? "bg-[#050505]/85 backdrop-blur-md border-b border-white/5 py-3.5 shadow-lg shadow-black/50" 
            : "bg-transparent"
        }`}
      >
        <div className="flex items-center gap-3 cursor-pointer group" onClick={() => window.scrollTo({ top: 0, behavior: 'smooth' })}>
          <div className="w-9 h-9 border border-white/15 group-hover:border-emerald-500/80 rounded-lg flex items-center justify-center transition-all duration-700 group-hover:rotate-180 bg-white/5">
            <Shield className="w-4.5 h-4.5 text-emerald-400 group-hover:text-emerald-300" />
          </div>
          <div>
            <span className="font-space font-bold uppercase tracking-wider text-sm text-[#EBEBEB] group-hover:text-emerald-400 transition-colors">ProctorAI</span>
            <div className="text-[9px] text-[#EBEBEB]/40 uppercase tracking-widest font-mono">Vision Platform</div>
          </div>
        </div>

        {/* Navigation Links */}
        <div className="hidden lg:flex items-center gap-8">
          {[
            { id: "hero", label: "Features" },
            { id: "how-it-works", label: "How It Works" },
            { id: "tech-stack", label: "Tech Stack" },
            { id: "ai-proctoring", label: "Proctoring" },
            { id: "performance", label: "Grading" },
            { id: "system-architecture", label: "Architecture" }
          ].map(tab => (
            <a 
              key={tab.id}
              href={`#${tab.id}`}
              onClick={(e) => {
                e.preventDefault();
                const el = document.getElementById(tab.id);
                if (el) el.scrollIntoView({ behavior: "smooth", block: "start" });
              }}
              className={`relative text-[14px] tracking-wider transition-colors hover:text-emerald-400 py-1 font-sans ${
                activeSection === tab.id ? "text-emerald-400 font-semibold" : "text-[#EBEBEB]/60"
              }`}
            >
              {tab.label}
              {activeSection === tab.id && (
                <span className="absolute bottom-0 left-0 w-full h-[1.5px] bg-[#10B981] rounded-full" />
              )}
            </a>
          ))}
        </div>

        <div className="flex items-center gap-3">
          <button 
            onClick={() => {
              const el = document.getElementById("dashboard");
              if (el) el.scrollIntoView({ behavior: "smooth" });
            }}
            className="text-xs font-semibold px-4.5 py-2 bg-transparent hover:bg-emerald-500/10 border border-[#10B981] text-[#10B981] rounded-full transition-all duration-300 font-space tracking-wide shadow-md hover:shadow-[#10B981]/20 hover:-translate-y-0.5 active:scale-95 cursor-pointer"
          >
            Explore Platform
          </button>
        </div>
      </nav>

      {/* SECTION 2 — HERO (with WebGL LightRays in background) */}
      <section id="hero" className="relative min-h-screen flex items-center justify-center pt-28 pb-16 overflow-hidden z-10 px-6 md:px-12">
        {/* Background LightRays Effect */}
        <LightRays
          raysOrigin="top-center"
          raysColor="#10B981"
          raysSpeed={1.2}
          lightSpread={1.1}
          rayLength={1.8}
          followMouse={true}
          mouseInfluence={0.25}
          noiseAmount={0.02}
          distortion={0.06}
          className="opacity-40"
        />

        {/* Soft Vignette Overlay to ensure text readability */}
        <div className="absolute inset-0 bg-radial-gradient pointer-events-none" style={{
          background: "radial-gradient(circle at center, transparent 30%, #050505 100%)"
        }} />

        <div className="max-w-7xl mx-auto w-full grid grid-cols-1 lg:grid-cols-12 gap-12 items-center relative z-10">
          
          {/* Left Column */}
          <div className="lg:col-span-7 text-left flex flex-col items-start">
            <div className="inline-flex items-center gap-2 px-3 py-1 bg-white/5 border border-white/10 rounded-full mb-6">
              <span className="w-1.5 h-1.5 rounded-full bg-[#10B981] animate-pulse"></span>
              <span className="font-space text-[10px] text-[#EBEBEB]/70 uppercase tracking-widest font-bold">
                ● INDIVIDUAL PROJECT · SSIT · 2025
              </span>
            </div>

            <h1 className="font-serif text-[48px] md:text-[96px] font-bold tracking-tight leading-[0.9] text-[#EBEBEB]">
              Examination<br />
              Integrity Through<br />
              <span className="text-[#10B981] italic font-normal">Intelligent</span> Eyes
            </h1>

            <p className="mt-6 text-[#EBEBEB]/50 text-sm md:text-[18px] font-light leading-[1.7] max-w-[500px]">
              A full-stack AI-proctored examination platform combining FastAPI, Next.js, MediaPipe, and GPT-4o — from timed exam sessions to LLM-graded subjective answers and live suspicion scoring.
            </p>

            <div className="mt-8 flex flex-wrap gap-4">
              <button 
                onClick={() => {
                  const el = document.getElementById("ai-proctoring");
                  if (el) el.scrollIntoView({ behavior: "smooth" });
                }}
                className="inline-flex items-center gap-2 px-6 py-3.5 bg-[#EBEBEB] hover:bg-white text-[#050505] font-semibold rounded-full font-space text-xs uppercase tracking-wider transition-all duration-300 shadow-xl shadow-white/5 hover:-translate-y-0.5"
              >
                Explore Features <ArrowRight className="w-4 h-4" />
              </button>
              <button 
                onClick={() => {
                  const el = document.getElementById("system-architecture");
                  if (el) el.scrollIntoView({ behavior: "smooth" });
                }}
                className="inline-flex items-center gap-2 px-6 py-3.5 bg-transparent border border-white/20 hover:bg-white/5 text-white font-space text-xs uppercase tracking-wider rounded-full transition-all duration-300 hover:-translate-y-0.5"
              >
                View Architecture
              </button>
            </div>
          </div>

          {/* Right Column — Overlapping Floating UI Mockup Cards */}
          <div className="lg:col-span-5 relative h-[500px] w-full flex items-center justify-center">
            
            {/* Card A — Exam Session UI (top-left, -3deg rotation) */}
            <div className="absolute top-[4%] left-[-2%] w-[250px] bg-black/40 backdrop-blur-md border border-white/10 rounded-[20px] p-4 shadow-2xl rotate-[-3deg] hover:rotate-0 hover:-translate-y-3 transition-all duration-500 z-30 cursor-pointer group">
              <div className="flex justify-between items-center mb-3">
                <span className="text-[9px] font-mono tracking-widest text-[#EBEBEB]/40 uppercase">PROCTOR AI — EXAM IN PROGRESS</span>
                <span className="w-2 h-2 rounded-full bg-emerald-400 animate-pulse"></span>
              </div>
              <div className="flex justify-between items-center mb-3">
                <span className="px-2 py-1 bg-amber-500/10 border border-amber-500/20 rounded-md text-[10px] font-mono text-amber-400">⏱ 42:18 remaining</span>
                <span className="font-space text-xs text-white font-bold">Q 12 / 40</span>
              </div>
              {/* Mini progress bar */}
              <div className="w-full h-1 bg-white/10 rounded-full mb-4 overflow-hidden">
                <div className="h-full bg-[#10B981] rounded-full" style={{ width: "30%" }}></div>
              </div>
              {/* MCQ Options Stub */}
              <div className="space-y-1.5 text-left">
                {[
                  { label: "Option A — Database Isolation Level", active: false },
                  { label: "Option B — Optimistic Locking", active: true },
                  { label: "Option C — Master-Slave Replication", active: false },
                  { label: "Option D — Two-Phase Commit Protocol", active: false }
                ].map((opt, i) => (
                  <div key={i} className={`flex items-center gap-2 p-1.5 rounded-lg border text-[10px] ${opt.active ? 'border-[#10B981]/50 bg-[#10B981]/5 text-emerald-300' : 'border-white/5 bg-white/[0.01] text-white/50'}`}>
                    <div className={`w-3 h-3 rounded-full border flex items-center justify-center shrink-0 ${opt.active ? 'border-[#10B981]' : 'border-white/20'}`}>
                      {opt.active && <div className="w-1.5 h-1.5 rounded-full bg-[#10B981]" />}
                    </div>
                    <span className="truncate">{opt.label}</span>
                  </div>
                ))}
              </div>
            </div>

            {/* Card B — Proctoring Alert (top-right, +2deg rotation) */}
            <div className="absolute top-[8%] right-[-5%] w-[240px] bg-black/60 backdrop-blur-md border border-red-500/30 border-l-[6px] border-l-red-500 rounded-[20px] p-4 shadow-2xl rotate-[2deg] hover:rotate-0 hover:-translate-y-3 transition-all duration-500 z-40 cursor-pointer text-left">
              <div className="flex items-start gap-3">
                <div className="w-8 h-8 rounded-full bg-amber-500/15 flex items-center justify-center shrink-0">
                  <span className="text-amber-500 font-bold text-sm">⚠</span>
                </div>
                <div className="flex-1 min-w-0">
                  <div className="text-xs font-semibold text-white font-sans">Face absent &gt; 3s</div>
                  
                  {/* Suspicion score bar */}
                  <div className="mt-2.5">
                    <div className="flex justify-between text-[8px] font-mono text-white/40 mb-1">
                      <span>SUSPICION SCORE</span>
                      <span className="text-amber-400 font-bold">34 / 100</span>
                    </div>
                    <div className="w-full h-1 bg-white/10 rounded-full overflow-hidden">
                      <div className="h-full bg-amber-500" style={{ width: "34%" }}></div>
                    </div>
                  </div>

                  <div className="text-[8px] font-mono text-white/30 mt-3 pt-2.5 border-t border-white/5">
                    Event logged · 14:23:05 · WebSocket heartbeat #7
                  </div>
                </div>
              </div>
            </div>

            {/* Card C — Gaze / FaceMesh (bottom-left, -1deg rotation) */}
            <div className="absolute bottom-[4%] left-[-6%] w-[230px] bg-[#080808]/90 border border-white/10 rounded-[20px] p-4 shadow-2xl rotate-[-1deg] hover:rotate-0 hover:-translate-y-3 transition-all duration-500 z-20 cursor-pointer text-left">
              <div className="flex justify-between items-center mb-2.5">
                <span className="font-space text-[8px] text-[#EBEBEB]/40 uppercase tracking-widest font-bold">TENSORFLOW.JS · CLIENT-SIDE ONLY</span>
                <Eye className="w-3.5 h-3.5 text-red-500" />
              </div>
              
              <div className="bg-black/40 rounded-lg p-2.5 border border-red-500/10 mb-3">
                <div className="text-xs font-bold text-red-400 font-space tracking-wide">GAZE: OFF-SCREEN · 2.8s</div>
                <div className="text-[9px] text-[#EBEBEB]/40 mt-1 font-mono">X-offset: -12.4% · Y-offset: +8.9%</div>
              </div>

              <div className="text-[9px] font-mono text-[#EBEBEB]/30 italic">
                No webcam frames sent to server
              </div>
            </div>

            {/* Card D — LLM Grading (bottom-right, bottom layer, +1deg) */}
            <div className="absolute bottom-[2%] right-[-8%] w-[240px] bg-black/55 backdrop-blur-md border border-white/10 rounded-[20px] p-4 shadow-2xl hover:-translate-y-3 transition-all duration-500 z-30 cursor-pointer text-left">
              <div className="flex justify-between items-start mb-2">
                <span className="text-[8px] font-space tracking-widest text-emerald-400 font-bold uppercase">GPT-4o Evaluation</span>
                <span className="px-1.5 py-0.5 bg-white/5 border border-white/10 text-white/60 text-[7px] font-space uppercase rounded">Short Answer — 10 marks</span>
              </div>
              
              <div className="flex items-baseline gap-1 mt-1">
                <span className="font-serif text-4xl font-bold text-[#10B981]">7</span>
                <span className="text-xs text-white/40">/10 Marks</span>
              </div>

              <div className="mt-3 pt-3 border-t border-white/5">
                <div className="text-[8px] font-space text-white/30 uppercase tracking-wider mb-1">AI JUSTIFICATION</div>
                <p className="text-[10px] text-white/60 leading-relaxed italic line-clamp-2">
                  "Strong argument explaining ACID properties, but missed key point on isolation levels..."
                </p>
              </div>

              <div className="mt-3 flex justify-between items-center text-[8px] font-mono text-amber-400">
                <span className="px-1.5 py-0.5 bg-amber-400/10 border border-amber-400/20 rounded">AWAITING EXAMINER REVIEW</span>
              </div>
            </div>

          </div>

        </div>
      </section>

      {/* SECTION 3 — STATS BAR */}
      <section className="bg-white/[0.01] border-y border-white/5 relative z-10">
        <div className="max-w-7xl mx-auto py-12 px-6 md:px-12 grid grid-cols-2 md:grid-cols-5 gap-8">
          
          <div className="text-center md:text-left flex flex-col items-center md:items-start">
            <div className="font-serif text-[56px] font-extralight text-[#10B981] tracking-tight leading-none">
              5
            </div>
            <span className="mt-3 font-space text-[10px] uppercase tracking-widest text-[#EBEBEB]/45 font-bold">Question Types Supported</span>
          </div>

          <div className="text-center md:text-left flex flex-col items-center md:items-start">
            <div className="font-serif text-[56px] font-extralight text-[#10B981] tracking-tight leading-none">
              4
            </div>
            <span className="mt-3 font-space text-[10px] uppercase tracking-widest text-[#EBEBEB]/45 font-bold">AI Proctoring Signals</span>
          </div>

          <div className="text-center md:text-left flex flex-col items-center md:items-start">
            <div className="font-serif text-[56px] font-extralight text-[#10B981] tracking-tight leading-none">
              3
            </div>
            <span className="mt-3 font-space text-[10px] uppercase tracking-widest text-[#EBEBEB]/45 font-bold">User Roles</span>
          </div>

          <div className="text-center md:text-left flex flex-col items-center md:items-start">
            <div className="font-serif text-[56px] font-extralight text-[#10B981] tracking-tight leading-none">
              8
            </div>
            <span className="mt-3 font-space text-[10px] uppercase tracking-widest text-[#EBEBEB]/45 font-bold">Weeks · Full Dev Cycle</span>
          </div>

          <div className="col-span-2 md:col-span-1 text-center md:text-left flex flex-col items-center md:items-start group relative">
            <div className="font-serif text-[56px] font-extralight text-[#10B981] tracking-tight leading-none flex items-center gap-1.5 justify-center md:justify-start">
              0
              <span className="text-xs px-2 py-0.5 rounded bg-[#10B981]/10 border border-[#10B981]/20 font-sans font-bold text-emerald-400">FPS</span>
            </div>
            <span className="mt-3 font-space text-[10px] uppercase tracking-widest text-[#EBEBEB]/45 font-bold cursor-help border-b border-dashed border-white/20">
              Webcam Frames Sent
            </span>
            {/* Tooltip */}
            <div className="absolute bottom-full mb-2 left-1/2 -translate-x-1/2 md:left-0 md:translate-x-0 hidden group-hover:block w-56 bg-[#080808] border border-white/10 rounded-xl p-3 text-[11px] text-white/70 shadow-2xl z-50 leading-relaxed">
              All AI model inference runs client-side via <span className="text-[#10B981] font-mono">TensorFlow.js</span> to protect user privacy. No raw video feed ever leaves the device.
            </div>
          </div>

        </div>
      </section>

      {/* SECTION 4 — THREE USER ROLES */}
      <section id="user-roles" className="py-24 px-6 md:px-12 relative z-10 max-w-7xl mx-auto">
        <div className="text-left mb-16">
          <span className="font-space text-[10px] text-[#10B981] uppercase tracking-widest font-bold">USER MANAGEMENT & AUTH</span>
          <h2 className="font-serif text-[48px] md:text-[64px] font-bold text-white mt-2 leading-none">
            Three Roles. One <span className="text-[#10B981] italic font-normal">Platform</span>.
          </h2>
          <p className="text-white/50 text-[14px] font-light mt-4">
            JWT authentication with python-jose · Role-separated routing · Short-lived exam session tokens
          </p>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          
          {/* Card 1: Student */}
          <div 
            id="role-stu"
            onMouseMove={(e) => handleCardMouseMove(e, "role-stu")}
            className="group relative bg-white/[0.01] border border-white/5 hover:border-[#10B981]/20 rounded-3xl p-8 overflow-hidden transition-all duration-300"
            style={{ "--mouse-x": "50%", "--mouse-y": "50%" } as React.CSSProperties}
          >
            <div className="absolute inset-0 bg-[radial-gradient(400px_circle_at_var(--mouse-x)_var(--mouse-y),rgba(16,185,129,0.06),transparent_50%)] pointer-events-none" />
            <div className="w-12 h-12 bg-[#10B981]/10 rounded-2xl flex items-center justify-center mb-8 border border-[#10B981]/20">
              <Users className="w-5.5 h-5.5 text-[#10B981]" />
            </div>
            <h3 className="font-serif text-2xl font-bold mb-4 text-white">Student (👤)</h3>
            
            <ul className="space-y-3.5 text-left text-xs text-[#EBEBEB]/60 font-light">
              <li className="flex items-start gap-2.5">
                <span className="w-1.5 h-1.5 rounded-full bg-[#10B981] mt-1.5 shrink-0"></span>
                <span>Register and login via JWT secure token</span>
              </li>
              <li className="flex items-start gap-2.5">
                <span className="w-1.5 h-1.5 rounded-full bg-[#10B981] mt-1.5 shrink-0"></span>
                <span>Receive a randomized paper unique per student ID</span>
              </li>
              <li className="flex items-start gap-2.5">
                <span className="w-1.5 h-1.5 rounded-full bg-[#10B981] mt-1.5 shrink-0"></span>
                <span>Take timed exam — MCQ, multi-select, short answer, long answer, image upload (handwritten)</span>
              </li>
              <li className="flex items-start gap-2.5">
                <span className="w-1.5 h-1.5 rounded-full bg-[#10B981] mt-1.5 shrink-0"></span>
                <span>Webcam monitored by TensorFlow.js (MediaPipe) — client-side only</span>
              </li>
              <li className="flex items-start gap-2.5">
                <span className="w-1.5 h-1.5 rounded-full bg-[#10B981] mt-1.5 shrink-0"></span>
                <span>See violation warnings (face absent, gaze away, multiple faces)</span>
              </li>
              <li className="flex items-start gap-2.5">
                <span className="w-1.5 h-1.5 rounded-full bg-[#10B981] mt-1.5 shrink-0"></span>
                <span>Submit answers; auto-submit triggers on timeout via APScheduler</span>
              </li>
              <li className="flex items-start gap-2.5">
                <span className="w-1.5 h-1.5 rounded-full bg-[#10B981] mt-1.5 shrink-0"></span>
                <span>View results dashboard: score, question-level breakdown, percentile chart, examiner feedback</span>
              </li>
              <li className="flex items-start gap-2.5">
                <span className="w-1.5 h-1.5 rounded-full bg-[#10B981] mt-1.5 shrink-0 text-red-400"></span>
                <span className="text-white/40 italic">Cannot see their own suspicion score or proctoring event log</span>
              </li>
            </ul>
          </div>

          {/* Card 2: Examiner */}
          <div 
            id="role-faculty"
            onMouseMove={(e) => handleCardMouseMove(e, "role-faculty")}
            className="group relative bg-white/[0.01] border border-white/5 hover:border-[#10B981]/20 rounded-3xl p-8 overflow-hidden transition-all duration-300"
            style={{ "--mouse-x": "50%", "--mouse-y": "50%" } as React.CSSProperties}
          >
            <div className="absolute inset-0 bg-[radial-gradient(400px_circle_at_var(--mouse-x)_var(--mouse-y),rgba(16,185,129,0.06),transparent_50%)] pointer-events-none" />
            <div className="w-12 h-12 bg-[#10B981]/10 rounded-2xl flex items-center justify-center mb-8 border border-[#10B981]/20">
              <Award className="w-5.5 h-5.5 text-[#10B981]" />
            </div>
            <h3 className="font-serif text-2xl font-bold mb-4 text-white">Examiner (✏️)</h3>
            
            <ul className="space-y-3.5 text-left text-xs text-[#EBEBEB]/60 font-light">
              <li className="flex items-start gap-2.5">
                <span className="w-1.5 h-1.5 rounded-full bg-[#10B981] mt-1.5 shrink-0"></span>
                <span>Create and manage question bank (MCQ, multi-select, short answer, long answer, image upload)</span>
              </li>
              <li className="flex items-start gap-2.5">
                <span className="w-1.5 h-1.5 rounded-full bg-[#10B981] mt-1.5 shrink-0"></span>
                <span>Tag questions by subject, difficulty, and marks</span>
              </li>
              <li className="flex items-start gap-2.5">
                <span className="w-1.5 h-1.5 rounded-full bg-[#10B981] mt-1.5 shrink-0"></span>
                <span>Configure exam rules: duration, question count per difficulty/type, randomization mode, negative marking</span>
              </li>
              <li className="flex items-start gap-2.5">
                <span className="w-1.5 h-1.5 rounded-full bg-[#10B981] mt-1.5 shrink-0"></span>
                <span>Set proctoring thresholds: gaze sensitivity, max tab-switch warnings before auto-flag</span>
              </li>
              <li className="flex items-start gap-2.5">
                <span className="w-1.5 h-1.5 rounded-full bg-[#10B981] mt-1.5 shrink-0"></span>
                <span>Review AI-graded subjective answers (GPT-4o score + justification pre-filled)</span>
              </li>
              <li className="flex items-start gap-2.5">
                <span className="w-1.5 h-1.5 rounded-full bg-[#10B981] mt-1.5 shrink-0"></span>
                <span>Annotate handwritten image answers (highlight, text comment overlays)</span>
              </li>
              <li className="flex items-start gap-2.5">
                <span className="w-1.5 h-1.5 rounded-full bg-[#10B981] mt-1.5 shrink-0"></span>
                <span>Bulk submit grades and publish results</span>
              </li>
            </ul>
          </div>

          {/* Card 3: Platform Admin */}
          <div 
            id="role-admin"
            onMouseMove={(e) => handleCardMouseMove(e, "role-admin")}
            className="group relative bg-white/[0.01] border border-white/5 hover:border-[#10B981]/20 rounded-3xl p-8 overflow-hidden transition-all duration-300"
            style={{ "--mouse-x": "50%", "--mouse-y": "50%" } as React.CSSProperties}
          >
            <div className="absolute inset-0 bg-[radial-gradient(400px_circle_at_var(--mouse-x)_var(--mouse-y),rgba(16,185,129,0.06),transparent_50%)] pointer-events-none" />
            <div className="w-12 h-12 bg-[#10B981]/10 rounded-2xl flex items-center justify-center mb-8 border border-[#10B981]/20">
              <Settings className="w-5.5 h-5.5 text-[#10B981]" />
            </div>
            <h3 className="font-serif text-2xl font-bold mb-4 text-white">Admin (⚙️)</h3>
            
            <ul className="space-y-3.5 text-left text-xs text-[#EBEBEB]/60 font-light">
              <li className="flex items-start gap-2.5">
                <span className="w-1.5 h-1.5 rounded-full bg-[#10B981] mt-1.5 shrink-0"></span>
                <span>Platform-wide configuration and user management</span>
              </li>
              <li className="flex items-start gap-2.5">
                <span className="w-1.5 h-1.5 rounded-full bg-[#10B981] mt-1.5 shrink-0"></span>
                <span>Monitor live exam sessions and suspicion scores</span>
              </li>
              <li className="flex items-start gap-2.5">
                <span className="w-1.5 h-1.5 rounded-full bg-[#10B981] mt-1.5 shrink-0"></span>
                <span>Access full proctoring event logs with timestamps and webcam snapshots</span>
              </li>
              <li className="flex items-start gap-2.5">
                <span className="w-1.5 h-1.5 rounded-full bg-[#10B981] mt-1.5 shrink-0"></span>
                <span>Schedule exam windows and assign examiners</span>
              </li>
              <li className="flex items-start gap-2.5">
                <span className="w-1.5 h-1.5 rounded-full bg-[#10B981] mt-1.5 shrink-0"></span>
                <span>Manage database migrations (Alembic) and deployment (Docker Compose)</span>
              </li>
              <li className="flex items-start gap-2.5">
                <span className="w-1.5 h-1.5 rounded-full bg-[#10B981] mt-1.5 shrink-0"></span>
                <span>View system analytics: usage, load, and performance metrics</span>
              </li>
            </ul>
          </div>

        </div>
      </section>

      {/* SECTION 5 — QUESTION BANK & EXAM ENGINE */}
      <section id="question-bank" className="py-24 px-6 md:px-12 max-w-7xl mx-auto z-10 relative border-t border-white/5">
        <div className="text-left mb-16">
          <span className="font-space text-[10px] text-[#10B981] uppercase tracking-widest font-bold">QUESTION BANK & TIMED EXAM ENGINE</span>
          <h2 className="font-serif text-[48px] md:text-[64px] font-bold text-white mt-2 leading-none">
            Every Question Type. <span className="text-[#10B981] italic font-normal">Server-Enforced</span> Time.
          </h2>
          <p className="text-white/50 text-[14px] font-light mt-4">
            A comprehensive curriculum bank with rigorous server-side synchronization and automated constraints.
          </p>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-12 gap-12 items-start">
          
          {/* Left Column — 5 Question Type Spotlight Cards */}
          <div className="lg:col-span-6 space-y-4">
            {[
              { 
                type: "01", 
                title: "Multiple Choice Questions (MCQ)", 
                desc: "Single option selection with instant auto-grading capability. Perfect for quick diagnostic evaluations." 
              },
              { 
                type: "02", 
                title: "Multi-Select Checkboxes", 
                desc: "Multiple correct options required for full marks. Tests absolute accuracy and deters luck-based guessing." 
              },
              { 
                type: "03", 
                title: "Short Answer Fields", 
                desc: "Text input fields scored by our LLM grading pipeline, evaluating terminology and conceptual matching." 
              },
              { 
                type: "04", 
                title: "Long Essay / Synthesis Answers", 
                desc: "Comprehensive essay inputs. Evaluated for argument flow, depth of understanding, and precise definitions." 
              },
              { 
                type: "05", 
                title: "Handwritten Sheet Image Upload", 
                desc: "Upload photos of physical drawings or mathematical proofs. Digested via OCR prior to LLM grading evaluation." 
              }
            ].map((q, idx) => (
              <div 
                key={idx} 
                className="p-5 bg-white/[0.01] border-l-2 border-[#10B981] border-y border-r border-white/5 rounded-r-2xl text-left hover:bg-white/[0.02] transition-colors"
              >
                <div className="flex items-center gap-3 mb-2">
                  <span className="font-mono text-xs text-[#10B981] bg-[#10B981]/5 px-1.5 py-0.5 rounded border border-[#10B981]/20 font-bold">{q.type}</span>
                  <h4 className="font-serif text-lg font-bold text-white">{q.title}</h4>
                </div>
                <p className="text-xs text-white/50 leading-relaxed font-light">{q.desc}</p>
              </div>
            ))}
          </div>

          {/* Right Column — Timed Exam Engine Spec (terminal panel) */}
          <div className="lg:col-span-6">
            <div className="bg-[#080808] border border-white/10 rounded-3xl p-6 md:p-8 shadow-2xl font-mono text-xs text-left">
              <div className="flex items-center justify-between border-b border-white/5 pb-4 mb-6">
                <div className="flex items-center gap-2">
                  <span className="w-2.5 h-2.5 rounded-full bg-amber-500 animate-pulse"></span>
                  <span className="font-space font-bold uppercase text-[10px] text-white/40 tracking-widest">TIMED EXAM SESSION ENGINE</span>
                </div>
                <span className="text-[10px] text-emerald-400 bg-emerald-400/5 border border-emerald-400/20 px-2 py-0.5 rounded font-bold uppercase">SECURED</span>
              </div>

              <div className="space-y-4 text-white/70">
                <div className="flex items-start gap-3">
                  <span className="text-[#10B981] font-bold">●</span>
                  <div>
                    <span className="text-white font-semibold block mb-0.5 font-sans">Session Binding Token</span>
                    <p className="text-white/45 text-[11px] leading-relaxed">Unique JWT session token bound to student_id + exam_id on handshake.</p>
                  </div>
                </div>

                <div className="flex items-start gap-3">
                  <span className="text-[#10B981] font-bold">●</span>
                  <div>
                    <span className="text-white font-semibold block mb-0.5 font-sans">Start Timestamp Lock</span>
                    <p className="text-white/45 text-[11px] leading-relaxed">Exact initiation epoch timestamp is permanently recorded on server-side database entry.</p>
                  </div>
                </div>

                <div className="flex items-start gap-3">
                  <span className="text-[#10B981] font-bold">●</span>
                  <div>
                    <span className="text-white font-semibold block mb-0.5 font-sans">Server-Side Time Calculation</span>
                    <p className="text-white/45 text-[11px] leading-relaxed">Remaining time calculated server-side; local client system clocks are never trusted.</p>
                  </div>
                </div>

                <div className="flex items-start gap-3">
                  <span className="text-[#10B981] font-bold">●</span>
                  <div>
                    <span className="text-white font-semibold block mb-0.5 font-sans">Auto-Submit Guard (APScheduler)</span>
                    <p className="text-white/45 text-[11px] leading-relaxed">A background daemon thread automatically freezes input structures and commits logs on exact timeout.</p>
                  </div>
                </div>

                <div className="flex items-start gap-3">
                  <span className="text-[#10B981] font-bold">●</span>
                  <div>
                    <span className="text-white font-semibold block mb-0.5 font-sans">Per-Question Save-on-Blur</span>
                    <p className="text-white/45 text-[11px] leading-relaxed">Every answer state is written asynchronously to the database on select clicks or keyboard blur.</p>
                  </div>
                </div>

                <div className="flex items-start gap-3">
                  <span className="text-[#10B981] font-bold">●</span>
                  <div>
                    <span className="text-white font-semibold block mb-0.5 font-sans">Tab-Switch Visibility Tracker</span>
                    <p className="text-white/45 text-[11px] leading-relaxed">Immediate blur events capture out-of-bounds clicks, checking page visibility states instantly.</p>
                  </div>
                </div>

                <div className="flex items-start gap-3">
                  <span className="text-[#10B981] font-bold">●</span>
                  <div>
                    <span className="text-white font-semibold block mb-0.5 font-sans">Randomization Mode (Deterministic Seed)</span>
                    <p className="text-white/45 text-[11px] leading-relaxed">Curriculum banks are shuffled using a seed derived from the student ID, generating a unique paper sequence.</p>
                  </div>
                </div>
              </div>

              <div className="mt-8 pt-4 border-t border-white/5 flex items-center justify-between text-[10px] text-white/30 tracking-widest font-space font-bold">
                <span>APS_ENGINE v2.4</span>
                <span>STATUS: STABLE_SYNC</span>
              </div>
            </div>
          </div>

        </div>
      </section>

      {/* SECTION 6 — AI PROCTORING ENGINE */}
      <section id="ai-proctoring" className="py-24 px-6 md:px-12 relative bg-white/[0.01] border-y border-white/5 z-10 animate-fadeIn">
        <div className="max-w-7xl mx-auto">
          
          <div className="text-center max-w-3xl mx-auto mb-16">
            <span className="font-space text-[10px] text-[#10B981] uppercase tracking-widest font-bold">AI PROCTORING ENGINE</span>
            <h2 className="font-serif text-4xl md:text-[72px] font-bold text-white mt-3 leading-none">
              Four Signals. <span className="text-[#10B981] italic font-normal">Zero Server Frames.</span>
            </h2>
            <p className="text-[#EBEBEB]/50 text-[14px] font-light mt-6 max-w-2xl mx-auto leading-relaxed">
              MediaPipe Face Detection + FaceMesh run entirely via TensorFlow.js in the browser. Only derived signals — never raw webcam frames — are sent to the backend over WebSocket.
            </p>
          </div>

          <div className="grid grid-cols-1 lg:grid-cols-12 gap-12 items-start">
            
            {/* Left Column: Live Monitor Mock Panel */}
            <div className="lg:col-span-5 text-left">
              <div className="sticky top-28">
                <h3 className="font-serif text-2xl font-bold mb-4 text-white tracking-tight">Derived Metrics Tunnel</h3>
                <p className="text-white/60 text-sm font-light leading-relaxed mb-6">
                  Web browsers execute real-time 3D landmark mesh modeling on device. Rather than wasting raw streaming video bandwidth and invading student privacy, only coordinates and violation states are compiled.
                </p>

                {/* Simulated Scan Console panel */}
                <div className="bg-[#080808] border border-white/10 rounded-2xl p-5 shadow-xl relative overflow-hidden font-mono text-xs">
                  <div className="flex items-center justify-between border-b border-white/5 pb-3 mb-3 text-[10px] text-white/40 font-space font-bold tracking-widest">
                    <span className="flex items-center gap-1.5">
                      <span className="w-1.5 h-1.5 bg-[#10B981] rounded-full animate-ping"></span>
                      proctor_cv_analyzer.sh — ACTIVE
                    </span>
                    <span>FPS: 30</span>
                  </div>

                  {/* Infinite ticker animation block */}
                  <div className="space-y-2 text-left h-[180px] overflow-hidden text-[#10B981]/80">
                    <div className="animate-pulse">_ [INIT] Loading OpenCV Haar weights... Done.</div>
                    <div>_ [FEED] Webcam binding index [0] successfully mapped.</div>
                    <div className="text-white/50 font-sans">_ [03:08:41] FACE_MESH_OK — detected landmarks: 468</div>
                    <div className="text-white/50 font-sans">_ [03:08:42] GAZE_VECTOR_CENTRAL — yaw: -1.2° pitch: 3.4°</div>
                    <div className="text-white/50 font-sans">_ [03:08:43] OBJECTS_SCAN — labels: [human: 1, laptop: 1]</div>
                    <div className="text-amber-400 font-bold font-sans">_ [03:08:44] WARN: DEVIATION_FLAG_REGISTERED (yaw &gt; 28°)</div>
                    <div className="text-white/50 font-sans">_ [03:08:45] DECIBEL_METRIC — avg: 42dB (HUM_ISOLATED)</div>
                    <div className="text-white/50 font-sans">_ [03:08:46] TAB_FOCUS_OK — active_viewport: true</div>
                  </div>
                </div>

                <div className="mt-6 bg-[#0B0B0B] border border-white/5 rounded-2xl p-4 flex gap-3 items-start text-xs">
                  <Info className="w-5 h-5 text-[#10B981] shrink-0 mt-0.5" />
                  <div>
                    <div className="font-semibold text-white">Interactive Highlight:</div>
                    <p className="text-white/55 font-light mt-1">
                      Click on any specific proctoring channel card to inspect how the core AI model executes tracking computations.
                    </p>
                  </div>
                </div>
              </div>
            </div>

            {/* Right Column: 2x2 interactive card grid */}
            <div className="lg:col-span-7 grid grid-cols-1 sm:grid-cols-2 gap-4.5">
              {proctoringChecks.map((item, idx) => (
                <div 
                  key={idx}
                  id={`check-${idx}`}
                  onMouseMove={(e) => handleCardMouseMove(e, `check-${idx}`)}
                  onClick={() => setSelectedProctorCheck(idx)}
                  className={`group relative bg-white/[0.01] border rounded-2xl p-6 cursor-pointer text-left transition-all duration-300 hover:-translate-y-1 ${
                    selectedProctorCheck === idx 
                      ? "border-[#10B981] bg-[#10B981]/[0.02]" 
                      : "border-white/5 hover:border-white/10"
                  }`}
                  style={{ "--mouse-x": "50%", "--mouse-y": "50%" } as React.CSSProperties}
                >
                  <div className="absolute inset-0 bg-[radial-gradient(150px_circle_at_var(--mouse-x)_var(--mouse-y),rgba(16,185,129,0.06),transparent_50%)] pointer-events-none" />
                  
                  <div className="flex items-center justify-between mb-4">
                    <span className="text-2xl">{item.icon}</span>
                    <span className="font-space text-[9px] tracking-wider text-[#10B981] bg-[#10B981]/5 px-2.5 py-1 rounded border border-[#10B981]/20 font-bold uppercase">
                      {item.badge}
                    </span>
                  </div>

                  <h4 className="font-serif text-lg font-bold text-white group-hover:text-[#10B981] transition-colors">
                    {item.title}
                  </h4>
                  <div className="text-[10px] text-[#EBEBEB]/40 font-mono tracking-wider uppercase mt-1 mb-3">
                    {item.model}
                  </div>
                  
                  <p className="text-xs text-[#EBEBEB]/60 font-light leading-relaxed">
                    {item.desc}
                  </p>
                </div>
              ))}
            </div>

          </div>

        </div>
      </section>

      {/* SECTION 7 — SUBJECTIVE GRADING PIPELINE */}
      <section id="subjective-pipeline" className="py-24 px-6 md:px-12 max-w-7xl mx-auto z-10 relative">
        
        <div className="text-center max-w-3xl mx-auto mb-16">
          <span className="font-space text-[10px] text-[#10B981] uppercase tracking-widest font-bold">INTELLIGENT PERFORMANCE EVALUATION</span>
          <h2 className="font-serif text-4xl md:text-[64px] font-bold text-white mt-3 leading-none">
            AI Scores First. <span className="text-[#10B981] italic font-normal">Examiners Decide.</span>
          </h2>
          <p className="text-[#EBEBEB]/50 text-[14px] font-light mt-6 leading-relaxed max-w-2xl mx-auto">
            A secure hybrid subjective grading engine. LLM intelligence provides a pre-graded baseline draft within seconds, leaving the final authority and annotations to human examiners.
          </p>
        </div>

        {/* SVG Flow Diagram */}
        <div className="w-full mb-16 bg-white/[0.01] border border-white/5 rounded-3xl p-6 overflow-x-auto">
          <div className="min-w-[800px] flex items-center justify-between px-8 py-4">
            
            {/* Box 1 */}
            <div className="flex flex-col items-center bg-[#080808] border border-white/10 rounded-xl p-4 w-48 text-center">
              <span className="text-[10px] font-space text-white/40 tracking-wider uppercase mb-1">STEP 01</span>
              <span className="text-xs text-white font-bold">Student Submits Answer</span>
              <span className="text-[9px] text-[#10B981] mt-1">MCQ / Written / Image</span>
            </div>

            {/* Arrow 1 */}
            <div className="flex-1 flex items-center justify-center relative">
              <div className="h-[1px] bg-white/10 w-full"></div>
              <span className="absolute text-[18px] text-[#10B981] right-2">➔</span>
            </div>

            {/* Box 2 (Decision Branch) */}
            <div className="flex flex-col items-center bg-white/5 border border-[#10B981]/20 rounded-xl p-4 w-48 text-center relative">
              <span className="text-[10px] font-space text-white/40 tracking-wider uppercase mb-1">DECISION LAYER</span>
              <span className="text-xs text-[#10B981] font-bold">MCQ / Multi-Select?</span>
              <div className="absolute top-full left-1/2 -translate-x-1/2 h-8 w-[1px] bg-dashed bg-white/10 mt-1"></div>
              <span className="text-[9px] text-white/40 mt-1">Static Key Validation</span>
            </div>

            {/* Arrow 2 */}
            <div className="flex-1 flex items-center justify-center relative">
              <div className="h-[1px] bg-white/10 w-full"></div>
              <span className="absolute text-[18px] text-[#10B981] right-2">➔</span>
            </div>

            {/* Box 3 (Subjective Path) */}
            <div className="flex flex-col items-center bg-[#080808] border border-white/10 rounded-xl p-4 w-48 text-center">
              <span className="text-[10px] font-space text-white/40 tracking-wider uppercase mb-1">STEP 02 (SUBJECTIVE)</span>
              <span className="text-xs text-white font-bold">GPT-4o Evaluation Module</span>
              <span className="text-[9px] text-amber-400 mt-1">Semantic Score Baseline</span>
            </div>

            {/* Arrow 3 */}
            <div className="flex-1 flex items-center justify-center relative">
              <div className="h-[1px] bg-white/10 w-full"></div>
              <span className="absolute text-[18px] text-[#10B981] right-2">➔</span>
            </div>

            {/* Box 4 (OCR / handwritten path) */}
            <div className="flex flex-col items-center bg-[#080808] border border-white/10 rounded-xl p-4 w-48 text-center">
              <span className="text-[10px] font-space text-white/40 tracking-wider uppercase mb-1">STEP 03 (OCR SHIELD)</span>
              <span className="text-xs text-white font-bold">OCR Pre-processing</span>
              <span className="text-[9px] text-[#10B981] mt-1">Handwritten Proof Digitization</span>
            </div>

          </div>
        </div>

        {/* Two Side Cards */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-8 items-start">
          
          {/* Left Card: GPT-4o Grading Card */}
          <div className="bg-white/[0.01] border border-white/5 rounded-3xl p-6 md:p-8 text-left shadow-xl relative overflow-hidden animate-fadeIn">
            <div className="absolute top-4 right-4 px-2.5 py-1 bg-[#10B981]/10 border border-[#10B981]/20 text-[#10B981] text-[10px] font-mono rounded">
              AUTO_PREGRADE_STABLE
            </div>
            
            <span className="font-space text-[10px] uppercase tracking-widest text-emerald-400 font-bold">GPT-4o GRADING INSTANCE</span>
            <h3 className="font-serif text-xl font-bold text-white mt-2 mb-4">Short Answer Evaluation</h3>
            
            <div className="bg-black/50 border border-white/5 rounded-2xl p-4 mb-4">
              <div className="text-[9px] font-mono text-white/30 uppercase tracking-widest mb-1">STUDENT ANSWER RESPONSE:</div>
              <p className="text-[11.5px] text-white/70 leading-relaxed font-light italic">
                "An RDBMS index uses a balanced tree (B-Tree) structure to speed up searches. It creates a sorted copy of the columns, permitting logarithmic O(log n) search operations instead of sequential O(n) table scans. This significantly reduces random disk I/O requests."
              </p>
            </div>

            <div className="grid grid-cols-2 gap-4 mb-4">
              <div className="bg-black/50 border border-white/5 rounded-2xl p-4">
                <div className="text-[9px] font-mono text-white/30 uppercase tracking-widest mb-1">PRELIMINARY SCORE:</div>
                <div className="font-serif text-3xl font-bold text-[#10B981]">9.0 <span className="text-xs text-white/30">/ 10 marks</span></div>
              </div>
              <div className="bg-black/50 border border-white/5 rounded-2xl p-4">
                <div className="text-[9px] font-mono text-white/30 uppercase tracking-widest mb-1">EVALUATION FOCUS:</div>
                <div className="font-serif text-3xl font-bold text-[#10B981]">O(log n) <span className="text-xs text-white/30">Term Matched</span></div>
              </div>
            </div>

            <div className="bg-black/50 border border-white/5 rounded-2xl p-4">
              <div className="text-[9px] font-space text-amber-400 font-bold uppercase tracking-wider mb-1">AI JUSTIFICATION TRANSCRIPT:</div>
              <p className="text-[11px] text-white/55 leading-relaxed font-light">
                The candidate provides an exceptionally clear explanation of B-Tree mechanics. Correctly identified both O(log n) logarithmic complexity constraints and random disk I/O savings. Deducted 1.0 mark due to missing explicit reference to node split constraints under high insertion loads.
              </p>
            </div>
          </div>

          {/* Right Card: Examiner Portal Preview */}
          <div className="bg-white/[0.01] border border-white/5 rounded-3xl p-6 md:p-8 text-left shadow-xl relative overflow-hidden animate-fadeIn">
            <span className="font-space text-[10px] uppercase tracking-widest text-[#10B981] font-bold">HUMAN EXAMINER AUDIT RAIL</span>
            <h3 className="font-serif text-xl font-bold text-white mt-2 mb-4">Grade Verification & Overrides</h3>
            
            <div className="space-y-4">
              <div className="p-4 bg-white/[0.01] border border-white/5 rounded-2xl flex items-center justify-between gap-4">
                <div>
                  <h4 className="text-xs text-white font-bold">Manual Score Adjustment</h4>
                  <p className="text-[10px] text-white/45 mt-0.5 leading-relaxed font-light">Override the auto-generated baseline marks using granular range control.</p>
                </div>
                <div className="flex items-center gap-1.5 bg-[#10B981]/5 border border-[#10B981]/25 rounded-xl px-3 py-1.5">
                  <span className="text-xs text-[#10B981] font-mono font-bold">9.5 / 10</span>
                </div>
              </div>

              <div className="p-4 bg-white/[0.01] border border-white/5 rounded-2xl">
                <h4 className="text-xs text-white font-bold mb-1.5">OCR Handwriting Canvas proofing</h4>
                <div className="border border-dashed border-white/10 rounded-xl p-3 bg-black/40 text-center flex flex-col items-center justify-center">
                  <span className="text-[20px] mb-1">📐</span>
                  <span className="text-[10px] font-mono text-[#10B981] font-bold">proof_sheet_STU8821.png successfully digitized</span>
                  <span className="text-[9px] text-white/30 mt-0.5 font-light">OCR Confidence: 98.4% · Highlight annotations enabled</span>
                </div>
              </div>

              <div className="p-4 bg-white/[0.01] border border-white/5 rounded-2xl">
                <h4 className="text-xs text-white font-bold mb-1">Examiner Overrides Ledger</h4>
                <ul className="space-y-2 text-[11px] font-light text-white/55">
                  <li className="flex items-center gap-2">
                    <span className="w-1.5 h-1.5 bg-[#10B981] rounded-full shrink-0"></span>
                    <span>Examiner annotated line 3 of handwritten math proof sheet.</span>
                  </li>
                  <li className="flex items-center gap-2">
                    <span className="w-1.5 h-1.5 bg-[#10B981] rounded-full shrink-0"></span>
                    <span>Adjusted score from 9.0 to 9.5 due to outstanding proof layout.</span>
                  </li>
                  <li className="flex items-center gap-2">
                    <span className="w-1.5 h-1.5 bg-[#10B981] rounded-full shrink-0"></span>
                    <span>Digitally signed grading transcript with Sri Sai Ram Institute credentials.</span>
                  </li>
                </ul>
              </div>
            </div>
          </div>

        </div>
      </section>

      {/* SECTION 7 — ADVANCED AI FEATURES */}
      <section className="py-24 px-6 md:px-12 bg-white/[0.01] border-y border-white/5 z-10 relative">
        <div className="max-w-7xl mx-auto">
          
          <div className="text-center max-w-2xl mx-auto mb-16">
            <span className="font-space text-[10px] text-emerald-400 uppercase tracking-widest font-bold">Comprehensive Capabilities</span>
            <h2 className="font-serif text-4xl md:text-5xl font-bold mt-2 text-white">
              Beyond the <span className="text-emerald-400 italic font-normal">Exam</span>.
            </h2>
            <p className="text-[#EBEBEB]/50 text-sm font-light mt-4">
              Advanced modules integrating large language model questioning, real-time auditory checks, and automated reporting.
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            
            {[
              { icon: "🗣", title: "Voice & Noise Detection", desc: "Continuously tracks acoustic decibels via Web Audio streams to filter environmental background chatter and voice dictation." },
              { icon: "🤖", title: "AI Question Generator", desc: "Upload syllabi PDFs or technical manuals; the backend parser maps topics and generates contextualized MCQ arrays instantly." },
              { icon: "📄", title: "PDF Report Generation", desc: "Compiles student correctness stats, topic progress, and timeline violation maps into beautiful PDF transcripts sent straight to faculty." },
              { icon: "🔮", title: "Future Score Prediction", desc: "Uses regression models to analyze candidate practice behavior to project future exam performance trajectories." },
              { icon: "🎯", title: "Resume Skill Suggestions", desc: "AI maps errors to precise industry gaps, offering targeted courses, developer roadmaps, and certification tips." },
              { icon: "💬", title: "Curriculum Doubt Agent", desc: "A sandbox assistant providing explanations and answering queries before candidates enter locked exams." }
            ].map((item, idx) => (
              <div 
                key={idx}
                id={`adv-${idx}`}
                onMouseMove={(e) => handleCardMouseMove(e, `adv-${idx}`)}
                className="group relative bg-[#090909] border border-white/5 rounded-3xl p-8 overflow-hidden hover:-translate-y-1 hover:border-emerald-500/20 transition-all duration-300"
                style={{ "--mouse-x": "50%", "--mouse-y": "50%" } as React.CSSProperties}
              >
                <div className="absolute inset-0 bg-[radial-gradient(300px_circle_at_var(--mouse-x)_var(--mouse-y),rgba(16,185,129,0.06),transparent_50%)] pointer-events-none" />
                <div className="w-11 h-11 rounded-2xl bg-emerald-500/5 border border-emerald-500/10 flex items-center justify-center text-xl mb-6 group-hover:scale-105 transition-transform duration-300">
                  {item.icon}
                </div>
                <h3 className="font-serif text-xl font-bold text-white group-hover:text-emerald-400 transition-colors mb-2">
                  {item.title}
                </h3>
                <p className="text-[#EBEBEB]/50 text-sm font-light leading-relaxed">
                  {item.desc}
                </p>
              </div>
            ))}

          </div>

          {/* Interactive Chatbot Drawer toggle preview inside feature block */}
          <div className="mt-12 bg-black border border-white/10 rounded-3xl p-6 md:p-8 flex flex-col md:flex-row items-center justify-between gap-6 relative overflow-hidden">
            <div className="absolute inset-0 bg-[radial-gradient(400px_circle_at_90%_110%,rgba(16,185,129,0.04),transparent_100%)] pointer-events-none" />
            <div className="text-left relative z-10 flex-1">
              <span className="font-space text-[9px] uppercase tracking-widest text-emerald-400 font-bold">Interactive Sandbox Integration</span>
              <h4 className="font-serif text-2xl font-bold text-white mt-1">Chat Live with ProctorAI Expert</h4>
              <p className="text-[#EBEBEB]/55 text-sm font-light mt-2 max-w-xl">
                Test the LLM Doubt curriculum chatbot module live. Submit technical questions regarding vision trackers, tab switch APIs, or grade indices.
              </p>
            </div>
            <button 
              onClick={() => setIsChatOpen(prev => !prev)}
              className="relative z-10 px-5 py-3.5 bg-[#EBEBEB] hover:bg-white text-black font-semibold font-space text-xs uppercase tracking-wider rounded-full transition-all duration-300 flex items-center gap-2 cursor-pointer shadow-lg active:scale-95 shrink-0"
            >
              <MessageSquare className="w-4 h-4" /> {isChatOpen ? "Hide Sandbox Chat" : "Toggle Chatbot Sandbox"}
            </button>
          </div>

          {/* Collapsible Chatbot Sandbox Module */}
          {isChatOpen && (
            <div className="mt-6 bg-[#080808] border border-white/10 rounded-2xl p-5 max-w-2xl mx-auto text-left shadow-2xl animate-fadeIn">
              <div className="flex items-center justify-between border-b border-white/5 pb-3 mb-4">
                <div className="flex items-center gap-2">
                  <div className="w-2.5 h-2.5 bg-emerald-400 rounded-full animate-ping"></div>
                  <span className="text-xs font-semibold uppercase tracking-wider font-space text-emerald-400">Curriculum Chatbot Simulator</span>
                </div>
                <button onClick={() => setIsChatOpen(false)} className="text-white/40 hover:text-white">
                  <X className="w-4 h-4" />
                </button>
              </div>

              {/* Chat Message Window */}
              <div className="space-y-3 h-[240px] overflow-y-auto pr-2 text-xs mb-4">
                {chatMessages.map((msg, idx) => (
                  <div key={idx} className={`flex ${msg.sender === 'user' ? 'justify-end' : 'justify-start'}`}>
                    <div className={`p-3 rounded-2xl max-w-[85%] font-light leading-relaxed ${
                      msg.sender === 'user' 
                        ? 'bg-emerald-500/10 text-emerald-200 border border-emerald-500/20 rounded-tr-none' 
                        : 'bg-white/5 text-white/90 border border-white/5 rounded-tl-none'
                    }`}>
                      {msg.text}
                    </div>
                  </div>
                ))}
              </div>

              {/* Chat Send Form */}
              <form onSubmit={handleChatSubmit} className="flex gap-2.5">
                <input 
                  type="text" 
                  value={chatInput}
                  onChange={(e) => setChatInput(e.target.value)}
                  placeholder="Ask about visibility observers, DeepFace landmarks, decibel sensors..."
                  className="flex-1 bg-white/5 border border-white/10 rounded-xl px-4 py-3 text-xs text-white focus:outline-none focus:border-emerald-500 transition-colors"
                />
                <button 
                  type="submit"
                  className="px-4.5 bg-emerald-500 hover:bg-emerald-400 text-black rounded-xl font-bold text-xs transition-colors cursor-pointer"
                >
                  Send
                </button>
              </form>
            </div>
          )}

        </div>
      </section>

      {/* SECTION 8 — HOW IT WORKS */}
      <section id="how-it-works" className="py-24 px-6 md:px-12 max-w-7xl mx-auto z-10 relative">
        <div className="text-left mb-16">
          <span className="font-space text-[10px] text-emerald-400 uppercase tracking-widest font-bold">Exam Lifecycle Flowchart</span>
          <h2 className="font-serif text-4xl md:text-5xl font-bold text-white mt-2">
            The Exam Lifecycle in <span className="text-emerald-400 italic font-normal">Nine Steps</span>
          </h2>
          <p className="text-white/50 text-sm max-w-xl font-light mt-4">
            A seamless chronicle showing operations from JWT verification to persistent report storage.
          </p>
        </div>

        {/* Steps flowchart */}
        <div className="relative border-l border-white/10 ml-4 md:ml-6 pl-8 md:pl-10 space-y-12 text-left">
          
          {[
            { badge: "01", title: "Authenticate & Verify Identity", desc: "Candidate registers and validates user profile credentials. JWT session initiates securely." },
            { badge: "02", title: "Webcam Liveness Handshake", desc: "Browser prompts for camera access. Multi-point face recognition confirms profile portrait template matching." },
            { badge: "03", title: "Exam Manifest Loads", desc: "MCQ datasets are dynamically randomized from the database. Examination timer sets off client-side countdown." },
            { badge: "04", title: "Proctor Verification Active", desc: "All 10 asynchronous proctoring channels kick off in parallel, tracking continuous facial contours." },
            { badge: "05", title: "Continuous Anomalies Logged", desc: "Any lookaway deviations, object alerts, or tab blur events are isolated with frame screenshots and timestamp logs." },
            { badge: "06", title: "Tab & Sound Monitoring", desc: "HTML5 Visibility observer checks window state. Auditory decibel levels trigger warns if speech thresholds exceed." },
            { badge: "07", title: "Submission / Secure Lock", desc: "Manual completion or timer limits automatically freeze form inputs, locking answers securely on client view." },
            { badge: "08", title: "AI Performance Mapping", desc: "FastAPI server processes answers, scoring correctness percentage and evaluating difficulty weights." },
            { badge: "09", title: "Dashboard Report Issued", desc: "Student views correctness and diagnostic recommendations. Course directors audit chronological log feeds." }
          ].map((step, idx) => (
            <div key={idx} className="relative group">
              
              {/* Connector dot */}
              <div className="absolute left-[-41px] md:left-[-49px] top-1.5 w-6 h-6 rounded-full bg-black border border-emerald-500 flex items-center justify-center font-mono text-[9px] text-emerald-400 font-bold group-hover:bg-emerald-500 group-hover:text-black transition-colors duration-300">
                {step.badge}
              </div>

              <h4 className="font-serif text-xl font-bold text-white group-hover:text-emerald-400 transition-colors">
                {step.title}
              </h4>
              <p className="text-white/55 text-sm font-light mt-2 max-w-2xl leading-relaxed">
                {step.desc}
              </p>
            </div>
          ))}

        </div>
      </section>

      {/* SECTION 9 — TECH STACK TABLE & ARCHITECTURE SVG */}
      <section id="tech-stack" className="py-24 px-6 md:px-12 bg-white/[0.01] border-y border-white/5 z-10 relative">
        <div className="max-w-7xl mx-auto">
          
          <div className="text-center max-w-2xl mx-auto mb-16">
            <span className="font-space text-[10px] text-emerald-400 uppercase tracking-widest font-bold">System Specifications</span>
            <h2 className="font-serif text-4xl md:text-5xl font-bold text-white mt-2">
              Built with <span className="text-emerald-400 italic font-normal">Academic Precision</span>.
            </h2>
            <p className="text-white/50 text-sm font-light mt-4">
              Detailed system tech layers, libraries, and active model components coordinating real-time checks.
            </p>
          </div>

          {/* Core System Architecture Diagram Rendered as High-Fidelity SVG */}
          <div className="bg-[#080808] border border-white/10 rounded-3xl p-6 md:p-10 mb-16 shadow-2xl overflow-x-auto">
            <div className="min-w-[800px] flex flex-col items-center">
              <span className="font-space text-[10px] text-[#EBEBEB]/45 uppercase tracking-widest mb-6 block font-bold">System Architecture Data Flow</span>
              
              <svg width="780" height="340" viewBox="0 0 780 340" fill="none" className="max-w-full">
                {/* Layer 1: Frontend Client */}
                <rect x="250" y="10" width="280" height="60" rx="12" fill="rgba(255,255,255,0.02)" stroke="rgba(16,185,129,0.3)" strokeWidth="1.5" />
                <text x="390" y="32" fill="#EBEBEB" fontSize="13" fontFamily="Newsreader" textAnchor="middle" fontWeight="bold">Frontend Application Client (React.js)</text>
                <text x="390" y="48" fill="rgba(235,235,235,0.4)" fontSize="9" fontFamily="Space Grotesk" textAnchor="middle" letterSpacing="0.1em">WEB FEED · MCQ SHEET · LOCAL CV LOGS</text>

                {/* Arrow from Client to Server */}
                <path d="M390 70 V130" stroke="#10B981" strokeWidth="1.5" markerEnd="url(#arrow)" strokeDasharray="3 3" />
                
                {/* Layer 2: API Gateway */}
                <rect x="240" y="130" width="300" height="70" rx="12" fill="rgba(255,255,255,0.03)" stroke="#10B981" strokeWidth="2" />
                <text x="390" y="156" fill="#10B981" fontSize="14" fontFamily="Newsreader" textAnchor="middle" fontWeight="bold">Python API Orchestration Gateway (FastAPI)</text>
                <text x="390" y="174" fill="rgba(235,235,235,0.4)" fontSize="9" fontFamily="Space Grotesk" textAnchor="middle" letterSpacing="0.1em">JWT AUTHENTICATION · ERROR INTERRUPTS · GRADE CALCULATION</text>

                {/* Connectors from API to DB / CV Core / Storage */}
                <path d="M300 200 L160 260" stroke="rgba(16,185,129,0.5)" strokeWidth="1.5" markerEnd="url(#arrow)" />
                <path d="M390 200 V260" stroke="#10B981" strokeWidth="1.5" markerEnd="url(#arrow)" />
                <path d="M480 200 L620 260" stroke="rgba(16,185,129,0.5)" strokeWidth="1.5" markerEnd="url(#arrow)" />

                {/* Database box */}
                <rect x="50" y="260" width="200" height="60" rx="12" fill="rgba(255,255,255,0.02)" stroke="rgba(255,255,255,0.1)" />
                <text x="150" y="284" fill="#EBEBEB" fontSize="12" fontFamily="Newsreader" textAnchor="middle" fontWeight="bold">Relational Database</text>
                <text x="150" y="300" fill="rgba(235,235,235,0.4)" fontSize="9" fontFamily="Space Grotesk" textAnchor="middle" letterSpacing="0.1em">MySQL / USER ACCOUNT DATA</text>

                {/* AI Core box */}
                <rect x="290" y="260" width="200" height="60" rx="12" fill="rgba(16,185,129,0.03)" stroke="#10B981" strokeWidth="1.5" />
                <text x="390" y="284" fill="currentColor" className="text-emerald-400" fontSize="12" fontFamily="Newsreader" textAnchor="middle" fontWeight="bold">AI Engine Modules</text>
                <text x="390" y="300" fill="rgba(235,235,235,0.4)" fontSize="9" fontFamily="Space Grotesk" textAnchor="middle" letterSpacing="0.1em">YOLOv8 · OpenCV · MediaPipe</text>

                {/* File storage box */}
                <rect x="530" y="260" width="200" height="60" rx="12" fill="rgba(255,255,255,0.02)" stroke="rgba(255,255,255,0.1)" />
                <text x="630" y="284" fill="#EBEBEB" fontSize="12" fontFamily="Newsreader" textAnchor="middle" fontWeight="bold">File & Report Logs</text>
                <text x="630" y="300" fill="rgba(235,235,235,0.4)" fontSize="9" fontFamily="Space Grotesk" textAnchor="middle" letterSpacing="0.1em">PDF TRANSCRIPTS & CAPTURE FRAMES</text>

                {/* SVG Marker definition */}
                <defs>
                  <marker id="arrow" viewBox="0 0 10 10" refX="5" refY="5" markerWidth="6" markerHeight="6" orient="auto-start-reverse">
                    <path d="M 0 0 L 10 5 L 0 10 z" fill="#10B981" />
                  </marker>
                </defs>
              </svg>
            </div>
          </div>

          {/* Interactive Tech Table */}
          <div className="overflow-x-auto border border-white/5 rounded-3xl bg-[#080808] shadow-2xl">
            <table className="w-full text-left border-collapse min-w-[700px]">
              <thead>
                <tr className="border-b border-white/5 bg-white/[0.01]">
                  <th className="p-5 font-space text-[10px] uppercase tracking-wider text-white/40">LAYER</th>
                  <th className="p-5 font-space text-[10px] uppercase tracking-wider text-white/40">TECHNOLOGY</th>
                  <th className="p-5 font-space text-[10px] uppercase tracking-wider text-white/40">PURPOSE</th>
                  <th className="p-5 font-space text-[10px] uppercase tracking-wider text-white/40 text-right">STATUS</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-white/[0.03]">
                {techStackRows.map((row, idx) => (
                  <tr key={idx} className="hover:bg-white/[0.01] transition-colors border-l-2 border-transparent hover:border-emerald-500">
                    <td className="p-5 text-xs font-semibold text-white">{row.layer}</td>
                    <td className="p-5 text-xs text-emerald-400 font-mono">{row.tech}</td>
                    <td className="p-5 text-xs text-[#EBEBEB]/60 font-light">{row.purpose}</td>
                    <td className="p-5 text-xs text-right">
                      <span className={`inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-[10px] font-space font-semibold tracking-wider ${
                        row.status === 'Active' 
                          ? 'bg-emerald-500/10 text-emerald-400 border border-emerald-500/20' 
                          : 'bg-amber-500/10 text-amber-400 border border-amber-500/20'
                      }`}>
                        <span className={`w-1.5 h-1.5 rounded-full ${row.status === 'Active' ? 'bg-emerald-400' : 'bg-amber-400 animate-pulse'}`}></span>
                        {row.status.toUpperCase()}
                      </span>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>

        </div>
      </section>

      {/* SECTION 10 — PROCTORING LOG PREVIEW & INTERACTIVE SANDBOX */}
      <section id="dashboard" className="py-24 px-6 md:px-12 max-w-7xl mx-auto z-10 relative">
        <div className="text-center max-w-2xl mx-auto mb-16">
          <span className="font-space text-[10px] text-emerald-400 uppercase tracking-widest font-bold">Interactive Sandbox Laboratory</span>
          <h2 className="font-serif text-4xl md:text-5xl font-bold text-white mt-2">
            Automated Proctoring <span className="text-emerald-400 italic font-normal">Simulator</span>.
          </h2>
          <p className="text-white/50 text-sm font-light mt-4">
            Activate the secure test sandbox below. Experience high-precision bio-mesh face tracking, gaze vector projections, and real-time electronic presence detection.
          </p>
        </div>

        {/* Portal Authentication Gateway (Logged Out State) */}
        {userRole === "guest" ? (
          <div className="max-w-md mx-auto bg-[#080808] border border-white/10 rounded-3xl p-6 md:p-8 shadow-2xl relative z-10 animate-fadeIn mb-16">
            <div className="flex justify-center gap-4 mb-6 border-b border-white/5 pb-4">
              <button
                type="button"
                onClick={() => { setActiveLoginTab("student"); setLoginError(""); }}
                className={`pb-2 px-4 text-xs font-space uppercase tracking-wider transition-all relative cursor-pointer ${
                  activeLoginTab === "student" ? "text-emerald-400 font-bold" : "text-white/40"
                }`}
              >
                Student Portal
                {activeLoginTab === "student" && (
                  <span className="absolute bottom-0 left-0 right-0 h-0.5 bg-emerald-500 rounded-full" />
                )}
              </button>
              <button
                type="button"
                onClick={() => { setActiveLoginTab("admin"); setLoginError(""); }}
                className={`pb-2 px-4 text-xs font-space uppercase tracking-wider transition-all relative cursor-pointer ${
                  activeLoginTab === "admin" ? "text-emerald-400 font-bold" : "text-white/40"
                }`}
              >
                Faculty / Admin Portal
                {activeLoginTab === "admin" && (
                  <span className="absolute bottom-0 left-0 right-0 h-0.5 bg-emerald-500 rounded-full" />
                )}
              </button>
            </div>

            <div className="text-center mb-6">
              <Lock className="w-8 h-8 text-emerald-400 mx-auto mb-2" />
              <h3 className="text-lg font-bold text-white font-space">
                {activeLoginTab === "student" ? "Candidate Exam Portal" : "Faculty Audit Portal"}
              </h3>
              <p className="text-white/40 text-[11px] font-light mt-1">
                {activeLoginTab === "student" 
                  ? "Enter Student credentials to launch the proctored assessment." 
                  : "Enter Admin credentials to audit system violations and cohort telemetry."}
              </p>
            </div>

            <form onSubmit={handleLogin} className="space-y-4 text-left">
              <div>
                <label className="block text-[10px] font-space text-[#EBEBEB]/60 uppercase tracking-widest font-bold mb-1.5">
                  Clearance Identity (Username)
                </label>
                <input
                  type="text"
                  required
                  placeholder={activeLoginTab === "student" ? "Sudar" : "Sudarsan"}
                  value={loginUsername}
                  onChange={(e) => setLoginUsername(e.target.value)}
                  className="w-full bg-[#121212] border border-white/10 rounded-xl px-4 py-3 text-xs text-white placeholder-white/20 focus:outline-none focus:border-emerald-500 transition-colors"
                />
              </div>

              <div>
                <label className="block text-[10px] font-space text-[#EBEBEB]/60 uppercase tracking-widest font-bold mb-1.5">
                  Identity Secret (Password)
                </label>
                <input
                  type="password"
                  required
                  placeholder="Root"
                  value={loginPassword}
                  onChange={(e) => setLoginPassword(e.target.value)}
                  className="w-full bg-[#121212] border border-white/10 rounded-xl px-4 py-3 text-xs text-white placeholder-white/20 focus:outline-none focus:border-emerald-500 transition-colors"
                />
              </div>

              {loginError && (
                <div className="bg-red-500/10 border border-red-500/20 text-red-400 text-[11px] p-3 rounded-xl flex items-start gap-2">
                  <AlertCircle className="w-4 h-4 shrink-0 mt-0.5" />
                  <span>{loginError}</span>
                </div>
              )}

              <button
                type="submit"
                className="w-full py-3.5 bg-emerald-500 hover:bg-emerald-400 text-black font-semibold font-space text-xs uppercase tracking-wider rounded-xl transition-all cursor-pointer shadow-lg active:scale-95"
              >
                Authenticate Clearance
              </button>
            </form>

            <div className="mt-4 pt-4 border-t border-white/5 text-center">
              <span className="text-[9px] font-mono text-white/30 tracking-widest uppercase block">
                SECURED AES-256 SYSTEM GATEWAY
              </span>
              <span className="text-[8px] font-mono text-white/20 mt-1 block">
                Hints: Student (Sudar / Root) · Admin (Sudarsan / Root)
              </span>
            </div>
          </div>
        ) : (
          <div>
            {/* Authenticated User Header bar */}
            <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center bg-[#090909] border border-white/5 rounded-2xl px-6 py-4 mb-8 gap-4">
              <div className="flex items-center gap-3">
                <div className="w-2.5 h-2.5 rounded-full bg-emerald-500 animate-pulse" />
                <div className="text-left">
                  <span className="text-[8px] font-mono uppercase tracking-widest text-emerald-400">SESSION_ACTIVE</span>
                  <p className="text-xs text-white font-medium mt-0.5">
                    Clearance Class: <span className="text-emerald-400 font-semibold">{userRole === "student" ? "STUDENT_PORTAL" : "SYSTEM_ADMIN"}</span> · User: <span className="text-emerald-400">{userRole === "student" ? "Sudar" : "Sudarsan"}</span>
                  </p>
                </div>
              </div>
              <button
                onClick={handleLogout}
                className="px-4 py-2 border border-white/10 hover:bg-white/5 hover:border-red-500/50 text-white/70 hover:text-red-400 rounded-xl text-xs transition-all font-space uppercase tracking-wider cursor-pointer"
              >
                Deauthenticate / Logout
              </button>
            </div>

            {/* ROLE 1: Student Sandbox View */}
            {userRole === "student" && (
              <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-start mb-16 animate-fadeIn">
                {/* Active Candidate Exam Interface Panel */}
                <div className="lg:col-span-7 bg-[#0B0B0B] border border-white/5 rounded-3xl p-6 md:p-8 relative min-h-[500px] shadow-2xl">
                  
                  {!sandboxActive ? (
                    <div className="flex flex-col items-center justify-center text-center py-20">
                      <div className="w-16 h-16 bg-emerald-500/10 rounded-2xl flex items-center justify-center mb-6 border border-emerald-500/25">
                        <Video className="w-8 h-8 text-emerald-400" />
                      </div>
                      <h3 className="font-serif text-2xl font-bold text-white mb-3">Launch Exam Proctoring Session</h3>
                      <p className="text-white/50 font-light text-sm max-w-md leading-relaxed mb-8">
                        Initiate a mock testing environment simulating the candidate-side webcam verification check. No actual streaming data is transmitted outside your local browser view.
                      </p>

                      <button 
                        onClick={startSandboxExam}
                        className="px-8 py-4 bg-emerald-500 hover:bg-emerald-400 text-black font-semibold rounded-full font-space text-xs uppercase tracking-wider transition-all duration-300 shadow-xl shadow-emerald-500/15 cursor-pointer active:scale-95"
                      >
                        Initialize Candidate Iframe
                      </button>
                    </div>
                  ) : examSubmitted ? (
                    <div className="py-8 animate-fadeIn text-left">
                      <div className="flex flex-col items-center justify-center text-center mb-8">
                        <div className="w-16 h-16 bg-emerald-500/10 rounded-2xl flex items-center justify-center mb-4 border border-emerald-500/20">
                          <Award className="w-8 h-8 text-emerald-400" />
                        </div>
                        <h3 className="font-serif text-3xl font-bold text-white">Assessment Submitted Successfully</h3>
                        <p className="text-white/50 text-sm font-light mt-1">The system has locked the answer sheet and calculated scores.</p>
                      </div>

                      {/* Score Summary Grid */}
                      <div className="grid grid-cols-1 sm:grid-cols-2 gap-4.5 mb-6">
                        <div className="bg-neutral-900/40 border border-white/5 rounded-2xl p-6 flex flex-col items-center justify-center text-center">
                          <span className="font-serif text-5xl md:text-6xl font-light text-emerald-400">{getCorrectAnswersCount()} / {questions.length}</span>
                          <span className="font-space text-[10px] uppercase tracking-widest text-[#EBEBEB]/45 font-bold mt-2">Answering Accuracy</span>
                        </div>

                        <div className="bg-neutral-900/40 border border-white/5 rounded-2xl p-6 flex flex-col items-center justify-center text-center">
                          <span className={`font-serif text-5xl md:text-6xl font-light ${
                            integrityScore >= 80 
                              ? "text-emerald-400" 
                              : integrityScore >= 50 
                                ? "text-amber-400" 
                                : "text-red-400"
                          }`}>
                            {integrityScore}%
                          </span>
                          <span className="font-space text-[10px] uppercase tracking-widest text-[#EBEBEB]/45 font-bold mt-2">Integrity Trust Rating</span>
                        </div>
                      </div>

                      {/* PDF Auto Generation Status Banner */}
                      <div className="bg-emerald-500/10 border border-emerald-500/20 rounded-2xl p-5 mb-6 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
                        <div className="flex items-start gap-3.5">
                          <div className="w-10 h-10 rounded-xl bg-emerald-500/10 border border-emerald-500/20 flex items-center justify-center text-emerald-400 shrink-0">
                            <FileText className="w-5 h-5" />
                          </div>
                          <div>
                            <h4 className="text-xs font-semibold text-white">Official PDF Report Downloaded Automatically!</h4>
                            <p className="text-[11px] text-white/50 mt-0.5">Includes student profile, exam marks, performance metrics, cheat index, and faculty verification QR.</p>
                          </div>
                        </div>
                        <button
                          onClick={handleDownloadPDF}
                          className="px-4.5 py-2.5 bg-emerald-500 hover:bg-emerald-400 text-black font-semibold font-space text-[10px] uppercase tracking-wider rounded-xl transition-all cursor-pointer active:scale-95 shrink-0 self-end sm:self-auto shadow-md"
                        >
                          Download/Regenerate PDF
                        </button>
                      </div>

                      {/* Auditor Telemetry Summary */}
                      <div className="bg-neutral-900/20 border border-white/5 rounded-2xl p-5 mb-6">
                        <h4 className="text-xs font-semibold text-white mb-3 uppercase tracking-wider font-space text-[#EBEBEB]/60">Biometric Auditor Telemetry Summary</h4>
                        <div className="space-y-3 text-xs font-light">
                          <div className="flex justify-between border-b border-white/[0.03] pb-2">
                            <span className="text-white/50">Total anomalies logged:</span>
                            <span className={`font-semibold ${activeViolationsCount > 0 ? "text-amber-400" : "text-emerald-400"}`}>
                              {activeViolationsCount} violations recorded
                            </span>
                          </div>
                          <div className="flex justify-between border-b border-white/[0.03] pb-2">
                            <span className="text-white/50">Tab switch triggers:</span>
                            <span className="font-semibold text-white">
                              {flagTabSwitch ? "Yes (1 incident)" : "No switch registered"}
                            </span>
                          </div>
                          <div className="flex justify-between">
                            <span className="text-white/50">Evaluation classification:</span>
                            <span className={`font-semibold ${integrityScore >= 80 ? "text-emerald-400" : integrityScore >= 50 ? "text-amber-400" : "text-red-400"}`}>
                              {integrityScore >= 80 ? "SECURE_INTEGRITY" : integrityScore >= 50 ? "FLAGGED_FOR_AUDIT" : "PROCTORING_COMPROMISED"}
                            </span>
                          </div>
                        </div>
                      </div>

                      {/* AI Academic Review Chatbot Widget */}
                      <div className="bg-[#080808] border border-white/10 rounded-2xl p-5 mb-8 text-left shadow-xl">
                        <div className="flex items-center gap-2 border-b border-white/5 pb-3 mb-4">
                          <div className="w-2.5 h-2.5 bg-emerald-400 rounded-full animate-ping"></div>
                          <span className="text-xs font-semibold uppercase tracking-wider font-space text-emerald-400">Post-Exam AI Academic Review Assistant</span>
                        </div>

                        <p className="text-[11px] text-white/50 font-light mb-4 leading-relaxed">
                          Ask our server-side academic AI tutor anything about your specific score, questions you got wrong, recommended topics, or request practice questions to test your understanding!
                        </p>

                        {/* Suggestion Chips */}
                        <div className="flex flex-wrap gap-2 mb-4">
                          <button
                            onClick={() => handleReviewChatSubmit(undefined, "Why did I lose marks?")}
                            disabled={isReviewChatThinking}
                            className="px-3.5 py-2 bg-white/5 hover:bg-white/10 border border-white/10 text-white/80 rounded-xl text-[10.5px] cursor-pointer transition-all active:scale-95 disabled:opacity-50"
                          >
                            Why did I lose marks? 📝
                          </button>
                          <button
                            onClick={() => handleReviewChatSubmit(undefined, "What topics should I study?")}
                            disabled={isReviewChatThinking}
                            className="px-3.5 py-2 bg-white/5 hover:bg-white/10 border border-white/10 text-white/80 rounded-xl text-[10.5px] cursor-pointer transition-all active:scale-95 disabled:opacity-50"
                          >
                            What topics should I study? 🎓
                          </button>
                          <button
                            onClick={() => handleReviewChatSubmit(undefined, "Give me practice questions.")}
                            disabled={isReviewChatThinking}
                            className="px-3.5 py-2 bg-white/5 hover:bg-white/10 border border-white/10 text-white/80 rounded-xl text-[10.5px] cursor-pointer transition-all active:scale-95 disabled:opacity-50"
                          >
                            Give me practice questions ✍️
                          </button>
                          <button
                            onClick={() => handleReviewChatSubmit(undefined, "Explain Question 1.")}
                            disabled={isReviewChatThinking}
                            className="px-3.5 py-2 bg-white/5 hover:bg-white/10 border border-white/10 text-white/80 rounded-xl text-[10.5px] cursor-pointer transition-all active:scale-95 disabled:opacity-50"
                          >
                            Explain Question 1 🔎
                          </button>
                        </div>

                        {/* Chat History Area */}
                        <div className="space-y-3.5 h-[280px] overflow-y-auto pr-2 text-xs mb-4 border border-white/5 bg-[#050505] p-4 rounded-xl">
                          {reviewChatMessages.map((msg, idx) => (
                            <div key={idx} className={`flex ${msg.sender === 'user' ? 'justify-end' : 'justify-start'}`}>
                              <div className={`p-3 rounded-2xl max-w-[85%] font-light leading-relaxed whitespace-pre-line ${
                                msg.sender === 'user' 
                                  ? 'bg-emerald-500/10 text-emerald-200 border border-emerald-500/25 rounded-tr-none' 
                                  : 'bg-white/[0.03] text-white/90 border border-white/5 rounded-tl-none'
                              }`}>
                                {msg.text}
                              </div>
                            </div>
                          ))}
                          
                          {isReviewChatThinking && (
                            <div className="flex justify-start">
                              <div className="bg-white/[0.03] text-white/50 border border-white/5 p-3 rounded-2xl rounded-tl-none flex items-center gap-2">
                                <span className="inline-block w-2 h-2 rounded-full bg-emerald-400 animate-bounce"></span>
                                <span className="inline-block w-2 h-2 rounded-full bg-emerald-400 animate-bounce delay-100"></span>
                                <span className="inline-block w-2 h-2 rounded-full bg-emerald-400 animate-bounce delay-200"></span>
                                <span className="text-[10px] ml-1 font-mono">Academic Coach is thinking...</span>
                              </div>
                            </div>
                          )}
                        </div>

                        {/* Input Box Form */}
                        <form onSubmit={(e) => handleReviewChatSubmit(e)} className="flex gap-2.5">
                          <input 
                            type="text" 
                            value={reviewChatInput}
                            onChange={(e) => setReviewChatInput(e.target.value)}
                            disabled={isReviewChatThinking}
                            placeholder={reviewChatInputPlaceholder}
                            className="flex-1 bg-white/5 border border-white/10 rounded-xl px-4 py-3 text-xs text-white focus:outline-none focus:border-emerald-500 transition-colors disabled:opacity-50"
                          />
                          <button 
                            type="submit"
                            disabled={isReviewChatThinking}
                            className="px-5 bg-emerald-500 hover:bg-emerald-400 text-black rounded-xl font-bold text-xs transition-colors cursor-pointer disabled:opacity-50 flex items-center justify-center"
                          >
                            Send
                          </button>
                        </form>
                      </div>

                      {/* Actions */}
                      <div className="flex items-center justify-center gap-4">
                        <button 
                          onClick={startSandboxExam}
                          className="px-6 py-3.5 bg-emerald-500 hover:bg-emerald-400 text-black font-semibold font-space text-xs uppercase tracking-wider rounded-full transition-all cursor-pointer shadow-lg active:scale-95"
                        >
                          Restart Session
                        </button>
                        <button 
                          onClick={() => setSandboxActive(false)}
                          className="px-6 py-3.5 bg-white/5 border border-white/10 text-white rounded-full transition-all cursor-pointer"
                        >
                          Close Session
                        </button>
                      </div>
                    </div>
                  ) : (
                    <div className="text-left animate-fadeIn">
                      
                      {/* Active Exam Header */}
                      <div className="flex items-center justify-between border-b border-white/5 pb-4 mb-6">
                        <div>
                          <span className="font-space text-[9px] uppercase tracking-widest text-[#EBEBEB]/40">Active Proctored Exam Manifest</span>
                          <h3 className="text-lg font-bold text-white mt-0.5">SSIT Vision Platform Trial — Section A</h3>
                        </div>
                        <div className="flex items-center gap-4.5">
                          <div className="text-right">
                            <span className="font-space text-[8px] uppercase tracking-widest text-white/40 block">TIME REMAINING</span>
                            <span className="font-mono text-emerald-400 font-semibold">{formatTime(examTimer)}</span>
                          </div>
                          <div className="text-right">
                            <span className="font-space text-[8px] uppercase tracking-widest text-white/40 block">TRUST INDEX</span>
                            <span className={`font-mono font-semibold ${
                              integrityScore >= 80 
                                ? "text-emerald-400" 
                                : integrityScore >= 50 
                                  ? "text-amber-400" 
                                  : "text-red-400"
                            }`}>
                              {integrityScore}%
                            </span>
                          </div>
                        </div>
                      </div>

                      {/* Question Area */}
                      <div className="mb-8">
                        <div className="flex justify-between text-xs text-white/40 mb-3 font-mono">
                          <span>QUESTION {currentQuestionIdx + 1} OF {questions.length}</span>
                          <span className="text-emerald-400">Weight: 2.0 points</span>
                        </div>

                        <h4 className="text-sm font-medium text-white mb-6 leading-relaxed">
                          {questions[currentQuestionIdx].question}
                        </h4>

                        <div className="space-y-3">
                          {questions[currentQuestionIdx].options.map((opt, oIdx) => (
                            <div 
                              key={oIdx}
                              onClick={() => handleSelectAnswer(questions[currentQuestionIdx].id, oIdx)}
                              className={`border rounded-xl p-4 cursor-pointer text-xs transition-colors ${
                                selectedAnswers[questions[currentQuestionIdx].id] === oIdx 
                                  ? "border-emerald-500 bg-emerald-500/5 text-emerald-200" 
                                  : "border-white/5 hover:border-white/10 hover:bg-white/[0.01] text-white/80"
                              }`}
                            >
                              <div className="flex items-center gap-3">
                                <span className={`w-4 h-4 rounded-full border flex items-center justify-center text-[9px] font-mono shrink-0 ${
                                  selectedAnswers[questions[currentQuestionIdx].id] === oIdx 
                                    ? "border-emerald-500 text-emerald-400" 
                                    : "border-white/20 text-white/40"
                                }`}>
                                  {String.fromCharCode(65 + oIdx)}
                                </span>
                                <span>{opt}</span>
                              </div>
                            </div>
                          ))}
                        </div>
                      </div>

                      {/* Navigation Buttons inside quiz */}
                      <div className="flex justify-between items-center pt-6 border-t border-white/5">
                        <div className="flex items-center gap-2">
                          <button 
                            disabled={currentQuestionIdx === 0}
                            onClick={() => setCurrentQuestionIdx(prev => Math.max(0, prev - 1))}
                            className="px-4 py-2 border border-white/10 rounded-xl text-xs hover:bg-white/5 disabled:opacity-30 disabled:pointer-events-none transition-colors"
                          >
                            Previous
                          </button>
                          <button 
                            disabled={currentQuestionIdx === questions.length - 1}
                            onClick={() => setCurrentQuestionIdx(prev => Math.min(questions.length - 1, prev + 1))}
                            className="px-4 py-2 border border-white/10 rounded-xl text-xs hover:bg-white/5 disabled:opacity-30 disabled:pointer-events-none transition-colors"
                          >
                            Next
                          </button>
                        </div>

                        {currentQuestionIdx === questions.length - 1 ? (
                          <button 
                            onClick={handleSandboxSubmit}
                            className="px-5 py-2.5 bg-emerald-500 hover:bg-emerald-400 text-black font-semibold font-space text-xs uppercase tracking-wider rounded-xl transition-all cursor-pointer shadow-md shadow-emerald-500/10 active:scale-95"
                          >
                            Submit Exam
                          </button>
                        ) : (
                          <span className="text-[10px] text-white/30 font-mono tracking-wider">SELECT OPTION TO LOG PROGRESS</span>
                        )}
                      </div>

                    </div>
                  )}

                </div>

                {/* Right Column: Live Webcam Stream with Overlay Canvas */}
                <div className="lg:col-span-5 space-y-6 text-left">
                  
                  {/* Live Camera Feed Container */}
                  <div className="bg-[#080808] border border-white/10 rounded-3xl p-5 shadow-2xl relative overflow-hidden">
                    <span className="font-space text-[9px] uppercase tracking-widest text-[#EBEBEB]/45 block mb-4 font-bold">Active Vision Tracking Canvas</span>
                    
                    <div className="relative aspect-video bg-neutral-950 border border-white/5 rounded-2xl overflow-hidden flex flex-col justify-between p-4">
                      
                      {/* Actual webcam stream element */}
                      {webcamStream && cameraActive ? (
                        <video
                          ref={videoRef}
                          autoPlay
                          playsInline
                          muted
                          className="absolute inset-0 w-full h-full object-cover rounded-2xl"
                        />
                      ) : null}

                      {/* Automated precise biometric landmark drawing canvas */}
                      {sandboxActive && !examSubmitted && cameraActive && (
                        <canvas
                          ref={canvasRef}
                          className="absolute inset-0 w-full h-full pointer-events-none z-20"
                        />
                      )}

                      {/* Simulated offline webcam placeholder state */}
                      {!cameraActive && (
                        <div className="absolute inset-0 flex items-center justify-center pointer-events-none z-10 text-center">
                          <div className="text-center">
                            <Video className="w-12 h-12 text-white/10 mx-auto mb-3" />
                            <span className="text-xs text-white/45 font-light">Camera verification stream offline</span>
                          </div>
                        </div>
                      )}

                      <div className="flex justify-between items-start z-10 pointer-events-none">
                        <span className="inline-flex items-center gap-1.5 px-2 py-0.5 bg-black/60 rounded border border-white/10 text-[9px] font-mono">
                          <span className={`w-1.5 h-1.5 rounded-full ${sandboxActive && !examSubmitted && cameraActive ? 'bg-emerald-400 animate-pulse' : 'bg-white/20'}`}></span>
                          {sandboxActive && !examSubmitted && cameraActive ? "BIO_MESH_OVERLAY" : "BIO_OFFLINE"}
                        </span>
                        <span className="text-[9px] text-white/30 font-mono">DEV_PREVIEW</span>
                      </div>

                      <div className="flex justify-between items-end z-10 pointer-events-none">
                        <span className="text-[9px] text-white/30 font-mono">UTC: {new Date().toISOString().substring(11, 19)}</span>
                        <span className="text-[8px] text-emerald-400 font-mono tracking-wider">99.4% ACCURACY</span>
                      </div>
                    </div>

                    {cameraPermission === "denied" && (
                      <div className="mt-3 bg-red-500/10 border border-red-500/25 p-3.5 rounded-xl text-[11px] text-red-400 leading-relaxed font-light flex items-start gap-2.5">
                        <AlertCircle className="w-4.5 h-4.5 shrink-0 mt-0.5 text-red-400" />
                        <div>
                          <strong className="font-semibold text-red-200">Hardware Access Refused</strong>
                          <p className="mt-0.5 text-red-400/80">Please adjust your browser site preferences to grant proctoring camera authorization checks.</p>
                        </div>
                      </div>
                    )}
                  </div>

                  {/* Manual Violation Event Injector */}
                  <div className="bg-[#080808] border border-white/10 rounded-3xl p-5 shadow-2xl relative">
                    <span className="font-space text-[9px] uppercase tracking-widest text-[#EBEBEB]/45 block mb-4 font-bold">Inject Simulated Vision Flags</span>
                    
                    <div className="space-y-3">
                      <button 
                        disabled={!sandboxActive || examSubmitted}
                        onClick={() => toggleViolationFlag("lookaway")}
                        className={`w-full text-left p-3.5 rounded-2xl border text-xs flex justify-between items-center transition-all disabled:opacity-30 disabled:pointer-events-none cursor-pointer ${
                          flagLookAway 
                            ? "border-amber-500 bg-amber-500/5 text-amber-200" 
                            : "border-white/5 hover:border-white/10 text-white/80"
                        }`}
                      >
                        <div className="flex items-center gap-2.5">
                          <Eye className="w-4.5 h-4.5 text-amber-400" />
                          <div>
                            <div className="font-semibold">Simulate Look-Away Gaze</div>
                            <p className="text-[10px] text-white/40 mt-0.5">Triggers head yaw rotation beyond bounds warning.</p>
                          </div>
                        </div>
                        <span className="text-[10px] font-mono uppercase font-bold text-amber-500">{flagLookAway ? "ACTIVE" : "INJECT"}</span>
                      </button>

                      <button 
                        disabled={!sandboxActive || examSubmitted}
                        onClick={() => toggleViolationFlag("multiface")}
                        className={`w-full text-left p-3.5 rounded-2xl border text-xs flex justify-between items-center transition-all disabled:opacity-30 disabled:pointer-events-none cursor-pointer ${
                          flagMultiFace 
                            ? "border-red-500 bg-red-500/5 text-red-200" 
                            : "border-white/5 hover:border-white/10 text-white/80"
                        }`}
                      >
                        <div className="flex items-center gap-2.5">
                          <Users className="w-4.5 h-4.5 text-red-400" />
                          <div>
                            <div className="font-semibold">Simulate Multiple Faces</div>
                            <p className="text-[10px] text-white/40 mt-0.5">Triggers secondary human contour warning.</p>
                          </div>
                        </div>
                        <span className="text-[10px] font-mono uppercase font-bold text-red-500">{flagMultiFace ? "ACTIVE" : "INJECT"}</span>
                      </button>

                      <button 
                        disabled={!sandboxActive || examSubmitted}
                        onClick={() => toggleViolationFlag("phone")}
                        className={`w-full text-left p-3.5 rounded-2xl border text-xs flex justify-between items-center transition-all disabled:opacity-30 disabled:pointer-events-none cursor-pointer ${
                          flagPhone 
                            ? "border-red-500 bg-red-500/5 text-red-200" 
                            : "border-white/5 hover:border-white/10 text-white/80"
                        }`}
                      >
                        <div className="flex items-center gap-2.5">
                          <Smartphone className="w-4.5 h-4.5 text-red-400" />
                          <div>
                            <div className="font-semibold">Simulate Cellphone Presence</div>
                            <p className="text-[10px] text-white/40 mt-0.5">Triggers YOLO electronic shape detector.</p>
                          </div>
                        </div>
                        <span className="text-[10px] font-mono uppercase font-bold text-red-500">{flagPhone ? "ACTIVE" : "INJECT"}</span>
                      </button>
                    </div>
                  </div>

                </div>

              </div>
            )}

            {/* ROLE 2: Faculty / Admin Dashboard View */}
            {userRole === "admin" && (
              <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-start mb-16 animate-fadeIn text-left">
                
                {/* Admin Management Panel */}
                <div className="lg:col-span-7 bg-[#0B0B0B] border border-white/5 rounded-3xl p-6 md:p-8 relative min-h-[500px] shadow-2xl">
                  <div className="flex items-center justify-between border-b border-white/5 pb-4 mb-6">
                    <div>
                      <span className="font-space text-[9px] uppercase tracking-widest text-[#EBEBEB]/45">Administrative Operations Center</span>
                      <h3 className="text-lg font-bold text-white mt-1">Cohort Performance Auditing</h3>
                    </div>
                    <div className="px-3 py-1 bg-emerald-500/10 border border-emerald-500/20 text-emerald-400 text-[9px] font-mono rounded">
                      STU_RECORDS_ONLINE
                    </div>
                  </div>

                  {/* Core Cohort KPIs */}
                  <div className="grid grid-cols-2 gap-4 mb-8">
                    <div className="bg-[#121212]/50 border border-white/5 rounded-2xl p-5">
                      <span className="text-white/40 text-[9px] font-space uppercase block">FLEET INTEGRITY</span>
                      <span className="text-3xl font-serif text-emerald-400 font-bold block mt-1">94.2%</span>
                      <span className="text-[9.5px] font-mono text-emerald-400/60 block mt-1">▲ 0.8% VS PREV COHORT</span>
                    </div>
                    <div className="bg-[#121212]/50 border border-white/5 rounded-2xl p-5">
                      <span className="text-white/40 text-[9px] font-space uppercase block">ANOMALY FLAG RATIO</span>
                      <span className="text-3xl font-serif text-red-400 font-bold block mt-1">2.1%</span>
                      <span className="text-[9.5px] font-mono text-red-400/60 block mt-1">▼ 0.5% DEVIATION DECREASE</span>
                    </div>
                  </div>

                  {/* Synced database ledger via ORM schema mockup */}
                  <div className="border border-white/5 rounded-2xl bg-[#090909] p-5 mb-6">
                    <div className="flex justify-between items-center mb-4">
                      <h4 className="text-xs font-semibold text-white">Database Synchronization Ledger (Drizzle ORM)</h4>
                      <span className="text-[8px] font-mono text-white/30">MYSQL RELATIONAL DB LINK</span>
                    </div>
                    <div className="overflow-x-auto text-xs font-mono">
                      <table className="w-full text-left">
                        <thead>
                          <tr className="border-b border-white/10 text-white/40 text-[9px]">
                            <th className="pb-2 font-semibold">CANDIDATE</th>
                            <th className="pb-2 font-semibold">USERNAME</th>
                            <th className="pb-2 font-semibold">IDENTITY GATEWAY</th>
                            <th className="pb-2 text-right font-semibold">INTEGRITY</th>
                          </tr>
                        </thead>
                        <tbody className="divide-y divide-white/[0.03] text-white/80">
                          <tr>
                            <td className="py-2.5 text-emerald-400">STU-2092</td>
                            <td className="py-2.5 font-bold">Sudar</td>
                            <td className="py-2.5 text-white/40">Student Exam sandbox</td>
                            <td className="py-2.5 text-right text-emerald-400">98%</td>
                          </tr>
                          <tr>
                            <td className="py-2.5 text-emerald-400">ADM-0041</td>
                            <td className="py-2.5 font-bold">Sudarsan</td>
                            <td className="py-2.5 text-white/40">Faculty Operations Dashboard</td>
                            <td className="py-2.5 text-right text-emerald-400">100%</td>
                          </tr>
                          <tr className="opacity-60">
                            <td className="py-2.5 text-white/50">STU-2041</td>
                            <td className="py-2.5">Arun Kumar</td>
                            <td className="py-2.5 text-white/40">Term Examination</td>
                            <td className="py-2.5 text-right text-red-400">48% [compromised]</td>
                          </tr>
                          <tr className="opacity-60">
                            <td className="py-2.5 text-white/50">STU-2055</td>
                            <td className="py-2.5">Karthik S</td>
                            <td className="py-2.5 text-white/40">Term Examination</td>
                            <td className="py-2.5 text-right text-amber-400">75% [flagged]</td>
                          </tr>
                        </tbody>
                      </table>
                    </div>
                  </div>

                  <div className="text-xs text-white/50 leading-relaxed font-light">
                    <strong className="text-white block font-semibold mb-1">Administrative Audit Summary:</strong>
                    This interface is restricted to authorized proctors only. To audit active candidates, verify webcam stream drivers, and track system resources, interact with the HW Verifier on the right.
                  </div>
                </div>

                {/* Right Column: Admin Webcam HW Verifier */}
                <div className="lg:col-span-5 bg-[#080808] border border-white/10 rounded-3xl p-5 shadow-2xl relative">
                  <div className="flex justify-between items-center mb-4">
                    <span className="font-space text-[9px] uppercase tracking-widest text-[#EBEBEB]/45 font-bold">Admin Webcam HW Verifier</span>
                    <span className="px-2 py-0.5 bg-emerald-500/10 border border-emerald-500/20 text-emerald-400 text-[8px] font-mono rounded">STANDBY_OK</span>
                  </div>

                  <p className="text-xs text-white/50 font-light leading-relaxed mb-4">
                    Test the system's computer vision head-mesh and pupil tracking pipelines locally on your admin terminal hardware.
                  </p>

                  <div className="relative aspect-video bg-neutral-950 border border-white/5 rounded-2xl overflow-hidden mb-5">
                    {/* Admin actual webcam feed */}
                    {webcamStream && cameraActive ? (
                      <video
                        ref={videoRef}
                        autoPlay
                        playsInline
                        muted
                        className="absolute inset-0 w-full h-full object-cover rounded-2xl"
                      />
                    ) : null}

                    {/* Admin actual tracking canvas overlay */}
                    {cameraActive && sandboxActive && (
                      <canvas
                        ref={canvasRef}
                        className="absolute inset-0 w-full h-full pointer-events-none z-20"
                      />
                    )}

                    {!cameraActive && (
                      <div className="absolute inset-0 flex flex-col items-center justify-center text-center p-4">
                        <Video className="w-8 h-8 text-white/10 mb-2" />
                        <span className="text-xs text-white/45 font-light">Camera hardware feed offline</span>
                      </div>
                    )}
                  </div>

                  <div className="space-y-3">
                    {!cameraActive ? (
                      <button
                        onClick={() => {
                          setSandboxActive(true);
                          startCamera();
                        }}
                        className="w-full py-3.5 bg-emerald-500 hover:bg-emerald-400 text-black font-semibold font-space text-[10px] uppercase tracking-wider rounded-xl transition-all cursor-pointer shadow-md active:scale-95"
                      >
                        Power On HW Webcam Feed
                      </button>
                    ) : (
                      <button
                        onClick={stopCamera}
                        className="w-full py-3.5 bg-white/5 hover:bg-white/10 border border-white/10 text-white font-semibold font-space text-[10px] uppercase tracking-wider rounded-xl transition-all cursor-pointer"
                      >
                        Power Off HW Webcam Feed
                      </button>
                    )}
                  </div>

                  {cameraPermission === "denied" && (
                    <div className="mt-3 bg-red-500/10 border border-red-500/25 p-3.5 rounded-xl text-[11px] text-red-400 leading-relaxed font-light">
                      <p className="font-semibold text-red-200">Hardware verification blocked</p>
                      <p className="mt-0.5 text-red-400/80 text-[10px]">Grant browser webcam permissions to test pupil and head mesh rendering engines locally.</p>
                    </div>
                  )}
                </div>

              </div>
            )}

            {/* Developers / Admin Live Terminal Log Panel */}
            <div className="mt-16 text-left">
              <div className="flex items-center justify-between mb-6">
                <div>
                  <span className="font-space text-[10px] text-emerald-400 uppercase tracking-widest font-bold">Admin Audit Ticker</span>
                  <h3 className="font-serif text-3xl font-bold text-white mt-1">Audit Stream Ledger</h3>
                </div>
                <div className="flex items-center gap-2">
                  <span className="inline-block w-2.5 h-2.5 rounded-full bg-emerald-500 animate-pulse"></span>
                  <span className="text-[10px] font-mono tracking-widest text-[#EBEBEB]/55 uppercase">STREAMING_LIVE</span>
                </div>
              </div>

              <div className="bg-[#080808] border border-white/10 rounded-2xl p-5 md:p-7 shadow-2xl relative overflow-hidden font-mono text-xs text-white/80">
                {/* Top Chrome Bar */}
                <div className="flex items-center justify-between border-b border-white/5 pb-4 mb-4">
                  <div className="flex items-center gap-2">
                    <div className="w-3 h-3 rounded-full bg-[#EF4444]/80"></div>
                    <div className="w-3 h-3 rounded-full bg-[#F59E0B]/80"></div>
                    <div className="w-3 h-3 rounded-full bg-[#10B981]/80"></div>
                    <span className="text-[10px] text-white/45 ml-2 font-mono">proctor_violations.log — SYSTEM_LEDGER</span>
                  </div>
                  <div className="text-[10px] text-white/45 font-mono">SECURE SHA-256 HASH LINK</div>
                </div>

                {/* Monospace Log Table */}
                <div className="overflow-x-auto animate-fadeIn">
                  <table className="w-full text-left border-collapse min-w-[700px]">
                    <thead>
                      <tr className="border-b border-white/5 text-[10px] text-white/40">
                        <th className="pb-3 font-mono">TIMESTAMP</th>
                        <th className="pb-3 font-mono">STUDENT ID</th>
                        <th className="pb-3 font-mono">VIOLATION TYPE</th>
                        <th className="pb-3 font-mono">SEVERITY</th>
                        <th className="pb-3 font-mono">AI MODEL</th>
                        <th className="pb-3 font-mono text-right">FRAME / REF</th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-white/[0.03] text-white/90">
                      {logs.map((log) => (
                        <tr key={log.id} className="hover:bg-white/5 transition-colors">
                          <td className="py-2.5 text-white/40 font-mono">{log.time}</td>
                          <td className="py-2.5 text-emerald-400 font-mono font-semibold">{log.studentId}</td>
                          <td className="py-2.5 font-light">{log.event}</td>
                          <td className="py-2.5">
                            <span className={`inline-block px-2 py-0.5 rounded text-[9px] font-bold font-mono ${
                              log.level === "HIGH" 
                                ? "bg-red-500/15 text-red-400 border border-red-500/20" 
                                : log.level === "MED" 
                                  ? "bg-amber-500/15 text-amber-400 border border-amber-500/20" 
                                  : log.level === "LOW"
                                    ? "bg-blue-500/15 text-blue-400 border border-blue-500/20"
                                    : "bg-emerald-500/15 text-emerald-400 border border-emerald-500/20"
                            }`}>
                              {log.level}
                            </span>
                          </td>
                          <td className="py-2.5 text-white/45 font-mono text-[11px]">{log.model}</td>
                          <td className="py-2.5 text-white/35 font-mono text-[10px] text-right">{log.ref}</td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>

              </div>
            </div>

          </div>
        )}

      </section>

      {/* SECTION 11 — CTA & FOOTER */}
      <section className="py-32 px-6 md:px-12 relative z-10 text-center border-t border-white/5 overflow-hidden">
        
        {/* Giant call-to-action text with moving gradient animation */}
        <div className="max-w-4xl mx-auto flex flex-col items-center">
          <span className="font-space text-[10px] text-emerald-400 uppercase tracking-widest font-bold">Individual Project · SSIT · 2025</span>
          
          <h2 className="font-serif text-5xl md:text-8xl font-bold mt-4 tracking-tight leading-[1.05] bg-gradient-to-r from-white via-emerald-400 to-white bg-clip-text text-transparent animate-pulse duration-5000" style={{
            backgroundImage: "linear-gradient(90deg, #EBEBEB 0%, #10B981 50%, #EBEBEB 100%)",
            backgroundSize: "200% auto",
            WebkitBackgroundClip: "text",
            WebkitTextFillColor: "transparent"
          }}>
            Ready to make<br />
            examinations smarter?
          </h2>

          <p className="mt-8 text-white/50 text-base md:text-lg font-light leading-relaxed max-w-xl">
            ProctorAI brings together Computer Vision, Machine Learning, Full-Stack Development, and Data Analytics — demonstrating the full spectrum of modern AI engineering in one platform.
          </p>

          <div className="mt-10">
            <button 
              onClick={() => {
                const el = document.getElementById("dashboard");
                if (el) el.scrollIntoView({ behavior: "smooth" });
              }}
              className="px-8 py-4 bg-emerald-500 hover:bg-emerald-400 text-black font-semibold font-space text-xs uppercase tracking-wider rounded-full transition-all duration-300 shadow-2xl shadow-emerald-500/20 hover:shadow-emerald-500/45 hover:-translate-y-0.5 active:scale-95 cursor-pointer"
            >
              Explore the Sandbox Simulator
            </button>
          </div>

          <div className="w-full h-[1px] bg-white/5 my-16" />

          {/* Footer details */}
          <div className="w-full text-center space-y-4">
            <span className="font-space text-[11px] uppercase tracking-widest text-[#EBEBEB]/40 font-bold block">
              ProctorAI · AI-Proctored Examination Platform with Intelligent Evaluation
            </span>
            <p className="text-white/30 text-xs font-light max-w-2xl mx-auto leading-relaxed">
              Individual Project · Sri Sai Ram Institute of Technology · 2025<br />
              Built with React · FastAPI · MySQL · OpenCV · YOLOv8 · MediaPipe · Scikit-Learn
            </p>
          </div>
        </div>

      </section>

    </div>
  );
}

// Helpers
function formatTime(seconds: number) {
  const mins = Math.floor(seconds / 60);
  const secs = seconds % 60;
  return `${String(mins).padStart(2, "0")}:${String(secs).padStart(2, "0")}`;
}
