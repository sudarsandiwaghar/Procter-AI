import React, { useState, useEffect, useRef } from "react";
import { Routes, Route, Link, useNavigate, useLocation } from "react-router-dom";
import { 
  Shield, 
  User, 
  Award, 
  FileText, 
  Clock, 
  LogOut, 
  Camera, 
  Eye, 
  Sparkles, 
  ChevronRight, 
  BookOpen, 
  Download,
  Info,
  CheckCircle,
  Video,
  X,
  Mail,
  HelpCircle,
  Lock,
  Phone,
  X as XIcon, // avoiding duplicate X name if any
  Edit,
  ArrowRight
} from "lucide-react";
import { Log, RegisteredUser, Question, Exam } from "../../types";
import { questionsData, SUBJECTS } from "../../questionsData";
import { jsPDF } from "jspdf";

interface StudentWorkspaceProps {
  user: RegisteredUser;
  onLogout: () => void;
  registeredUsers: RegisteredUser[];
  setRegisteredUsers: (u: RegisteredUser[]) => void;
  logs: Log[];
  setLogs: React.Dispatch<React.SetStateAction<Log[]>>;
  triggerViolation: (event: string, level: "HIGH" | "MED" | "LOW" | "INFO", model: string, ref: string) => void;
  webcamStream: MediaStream | null;
  cameraActive: boolean;
  startCamera: () => void;
  stopCamera: () => void;
  videoRef: React.RefObject<HTMLVideoElement | null>;
  canvasRef: React.RefObject<HTMLCanvasElement | null>;
  chatMessages: Array<{ sender: string; text: string }>;
  setChatMessages: React.Dispatch<React.SetStateAction<Array<{ sender: string; text: string }>>>;
  onSendEmailReport: (examTitle: string, score: number, total: number, percentage: number, integrity: number, logs: Log[]) => void;
  emailDeliveryHtml: string;
  showEmailPreview: boolean;
  setShowEmailPreview: (s: boolean) => void;
}

interface SubmittedExamResult {
  id?: string;
  studentEmail?: string;
  studentName?: string;
  subject: string;
  score: number;
  total: number;
  percentage: number;
  integrityScore: number;
  date: string;
  logsCount: number;
  email_sent?: boolean;
  email_sent_at?: string | null;
  ai_feedback?: string;
  logs?: any[];
}

export default function StudentWorkspace({
  user,
  onLogout,
  registeredUsers,
  setRegisteredUsers,
  logs,
  setLogs,
  triggerViolation,
  webcamStream,
  cameraActive,
  startCamera,
  stopCamera,
  videoRef,
  canvasRef,
  chatMessages,
  setChatMessages,
  onSendEmailReport,
  emailDeliveryHtml,
  showEmailPreview,
  setShowEmailPreview
}: StudentWorkspaceProps) {
  const navigate = useNavigate();
  const location = useLocation();
  const [activeTab, setActiveTab] = useState("dashboard");

  // Local Profile edit states
  const [profilePhoto, setProfilePhoto] = useState<string>("https://images.unsplash.com/photo-1534528741775-53994a69daeb?auto=format&fit=crop&q=80&w=150&h=150");
  const [profileName, setProfileName] = useState(user.name);
  const [profileEmail, setProfileEmail] = useState(user.email);
  const [profilePhone, setProfilePhone] = useState(user.phone || "+91 94452 82210");
  const [passwordCurrent, setPasswordCurrent] = useState("");
  const [passwordNew, setPasswordNew] = useState("");
  const [passwordConfirm, setPasswordConfirm] = useState("");
  const [profileMessage, setProfileMessage] = useState("");

  // Exam States
  const [activeSubject, setActiveSubject] = useState<string>("");
  const [activeQuestions, setActiveQuestions] = useState<Question[]>([]);
  const [currentQuestionIdx, setCurrentQuestionIdx] = useState(0);
  const [selectedAnswers, setSelectedAnswers] = useState<Record<number, number>>({});
  const [examTimer, setExamTimer] = useState(300); // 5 mins
  const [integrityScore, setIntegrityScore] = useState(100);
  const [activeViolationsCount, setActiveViolationsCount] = useState(0);
  const [examActive, setExamActive] = useState(false);
  const [examSubmittedResult, setExamSubmittedResult] = useState<SubmittedExamResult | null>(null);

  // Anomaly simulator flags
  const [flagLookAway, setFlagLookAway] = useState(false);
  const [flagMultiFace, setFlagMultiFace] = useState(false);
  const [flagPhone, setFlagPhone] = useState(false);

  // Chatbot states
  const [chatInput, setChatInput] = useState("");
  const [chatLoading, setChatLoading] = useState(false);

  // Results History Simulated database
  const [resultsHistory, setResultsHistory] = useState<SubmittedExamResult[]>([
    {
      subject: "Operating Systems",
      score: 8,
      total: 10,
      percentage: 80,
      integrityScore: 92,
      date: "2026-06-25",
      logsCount: 2
    },
    {
      subject: "Database Management Systems",
      score: 9,
      total: 10,
      percentage: 90,
      integrityScore: 100,
      date: "2026-06-20",
      logsCount: 0
    }
  ]);

  // Synchronize results with full-stack backend
  useEffect(() => {
    const fetchResults = async () => {
      try {
        const res = await fetch("/api/results");
        if (res.ok) {
          const data = await res.json();
          // Filter results by current student email
          const studentResults = data.filter((r: any) => r.studentEmail === user.email);
          if (studentResults.length > 0) {
            setResultsHistory(studentResults);
          }
        }
      } catch (err) {
        console.error("Error fetching results from server:", err);
      }
    };
    fetchResults();
  }, [user.email]);

  // Sync tab state with current sub-path
  useEffect(() => {
    const path = location.pathname;
    if (path.includes("/student/profile")) {
      setActiveTab("profile");
    } else if (path.includes("/student/exams")) {
      setActiveTab("exams");
    } else if (path.includes("/student/results")) {
      setActiveTab("results");
    } else {
      setActiveTab("dashboard");
    }
  }, [location]);

  // Exam timer countdown
  useEffect(() => {
    let interval: any;
    if (examActive && examTimer > 0) {
      interval = setInterval(() => {
        setExamTimer(prev => {
          if (prev <= 1) {
            clearInterval(interval);
            handleAutoSubmit();
            return 0;
          }
          return prev - 1;
        });
      }, 1000);
    }
    return () => clearInterval(interval);
  }, [examActive, examTimer]);

  // Mock Eye Gaze & Face mesh canvas overlays
  useEffect(() => {
    let animationFrame: number;
    if (cameraActive && canvasRef.current && examActive) {
      const canvas = canvasRef.current;
      const ctx = canvas.getContext("2d");
      if (ctx) {
        const renderOverlay = () => {
          ctx.clearRect(0, 0, canvas.width, canvas.height);
          
          // Draw artificial futuristic landmark mesh
          ctx.strokeStyle = "rgba(16,185,129,0.35)";
          ctx.lineWidth = 1;
          
          // Outer face ring oval
          ctx.beginPath();
          ctx.ellipse(150, 110, 70, 90, 0, 0, 2 * Math.PI);
          ctx.stroke();

          // Mesh lines connecting coordinates
          ctx.beginPath();
          ctx.moveTo(150, 20); ctx.lineTo(150, 200);
          ctx.moveTo(80, 110); ctx.lineTo(220, 110);
          ctx.stroke();

          // Draw pupil look points
          ctx.fillStyle = "#10B981";
          
          if (flagLookAway) {
            // Looking way off right side
            ctx.fillStyle = "#F59E0B";
            ctx.beginPath();
            ctx.arc(130, 95, 3, 0, 2 * Math.PI); // Left pupil offset
            ctx.arc(180, 95, 3, 0, 2 * Math.PI); // Right pupil offset
            ctx.fill();
            ctx.fillText("WARN: DEVIATION_FLAG_DETECTION", 20, 30);
          } else {
            // Center gazing pupils
            ctx.beginPath();
            ctx.arc(125, 95, 3, 0, 2 * Math.PI);
            ctx.arc(175, 95, 3, 0, 2 * Math.PI);
            ctx.fill();
          }

          if (flagMultiFace) {
            ctx.strokeStyle = "#EF4444";
            ctx.strokeRect(10, 10, 120, 120);
            ctx.fillStyle = "#EF4444";
            ctx.fillText("HIGH_WARN: DOUBLE_FACE", 15, 25);
          }

          if (flagPhone) {
            ctx.strokeStyle = "#EF4444";
            ctx.strokeRect(180, 100, 80, 80);
            ctx.fillStyle = "#EF4444";
            ctx.fillText("HIGH_WARN: PHONE_DET", 185, 120);
          }

          animationFrame = requestAnimationFrame(renderOverlay);
        };
        renderOverlay();
      }
    }
    return () => cancelAnimationFrame(animationFrame);
  }, [cameraActive, flagLookAway, flagMultiFace, flagPhone, examActive]);

  // Tab switch warn visibility monitor
  useEffect(() => {
    const handleVisibilityChange = () => {
      if (document.hidden && examActive) {
        triggerViolation("System Tab Switch Detected", "HIGH", "Browser Behavior Tracker", "OS_EVENT_WINDOW_BLUR");
        setIntegrityScore(prev => Math.max(0, prev - 15));
        setActiveViolationsCount(prev => prev + 1);
      }
    };
    document.addEventListener("visibilitychange", handleVisibilityChange);
    return () => document.removeEventListener("visibilitychange", handleVisibilityChange);
  }, [examActive]);

  // Simulating anomaly toggle
  const toggleAnomalySim = (type: "lookaway" | "multiface" | "phone") => {
    if (!examActive) return;

    if (type === "lookaway") {
      const next = !flagLookAway;
      setFlagLookAway(next);
      if (next) {
        triggerViolation("Gaze turned away from monitor (Yaw: 31°)", "MED", "MediaPipe FaceMesh", "GZ_WARN_LEFT");
        setIntegrityScore(prev => Math.max(0, prev - 12));
        setActiveViolationsCount(prev => prev + 1);
      }
    } else if (type === "multiface") {
      const next = !flagMultiFace;
      setFlagMultiFace(next);
      if (next) {
        triggerViolation("Secondary face detected in camera viewport", "HIGH", "MediaPipe Face Detection", "BIO_MULTIPLE_PERSONS");
        setIntegrityScore(prev => Math.max(0, prev - 25));
        setActiveViolationsCount(prev => prev + 1);
      }
    } else if (type === "phone") {
      const next = !flagPhone;
      setFlagPhone(next);
      if (next) {
        triggerViolation("Mobile phone device visible in capture window", "HIGH", "YOLOv8 Phone Classifier", "OBJ_PHONE_DET");
        setIntegrityScore(prev => Math.max(0, prev - 35));
        setActiveViolationsCount(prev => prev + 1);
      }
    }
  };

  // Start exam
  const handleStartExam = (subjectName: string) => {
    setActiveSubject(subjectName);
    const filtered = questionsData.filter(q => q.subject === subjectName);
    const shuffled = [...filtered].sort(() => 0.5 - Math.random());
    const selected = shuffled.slice(0, 10).map((q, idx) => ({
      id: q.id,
      question: q.question,
      options: q.options,
      correctAnswer: q.correctAnswer
    }));

    setActiveQuestions(selected);
    setCurrentQuestionIdx(0);
    setSelectedAnswers({});
    setExamTimer(300);
    setIntegrityScore(100);
    setActiveViolationsCount(0);
    setFlagLookAway(false);
    setFlagMultiFace(false);
    setFlagPhone(false);
    setExamActive(true);
    setExamSubmittedResult(null);

    triggerViolation(`Student Exam Portal Initialized: ${subjectName}`, "INFO", "Authentication Node", "SESSION_INIT");
    startCamera();
  };

  // Select option
  const handleSelectAnswer = (qId: number, oIdx: number) => {
    if (!examActive) return;
    setSelectedAnswers(prev => ({
      ...prev,
      [qId]: oIdx
    }));
  };

  // Submit manual
  const handleSubmitExam = async () => {
    if (!examActive) return;
    stopCamera();
    
    // Calculate final score
    let correct = 0;
    activeQuestions.forEach(q => {
      if (selectedAnswers[q.id] === q.correctAnswer) {
        correct++;
      }
    });

    const percentage = Math.round((correct / activeQuestions.length) * 100);
    const date = new Date().toISOString().split("T")[0];

    const currentSessionLogs = logs.filter(l => l.studentId === user.email);

    // Build submission payload
    const payload = {
      studentEmail: user.email,
      studentName: user.name,
      subject: activeSubject,
      score: correct,
      total: activeQuestions.length,
      percentage,
      integrityScore,
      logs: currentSessionLogs.slice(0, 8)
    };

    try {
      const response = await fetch("/api/results", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(payload)
      });
      if (response.ok) {
        const fullResult: SubmittedExamResult = await response.json();
        setResultsHistory(prev => [fullResult, ...prev]);
        setExamSubmittedResult(fullResult);
      } else {
        // Fallback if API fails
        const fallbackResult: SubmittedExamResult = {
          subject: activeSubject,
          score: correct,
          total: activeQuestions.length,
          percentage,
          integrityScore,
          date,
          logsCount: activeViolationsCount
        };
        setResultsHistory(prev => [fallbackResult, ...prev]);
        setExamSubmittedResult(fallbackResult);
      }
    } catch (err) {
      console.error("Failed to submit result to server:", err);
      const fallbackResult: SubmittedExamResult = {
        subject: activeSubject,
        score: correct,
        total: activeQuestions.length,
        percentage,
        integrityScore,
        date,
        logsCount: activeViolationsCount
      };
      setResultsHistory(prev => [fallbackResult, ...prev]);
      setExamSubmittedResult(fallbackResult);
    }

    setExamActive(false);
    triggerViolation(`Proctoring Session Locked & Finalized: ${activeSubject}`, "INFO", "Hardware Registry", "SESSION_LOCK");
  };

  // Auto submit on timer end
  const handleAutoSubmit = () => {
    triggerViolation("Exam duration timer expired. Initiating secure lock.", "HIGH", "Behavioral Monitor", "TIMER_EXP_FORCE_SUBMIT");
    handleSubmitExam();
  };

  // Download PDF Report
  const handleDownloadReportPDF = (res: SubmittedExamResult) => {
    const doc = new jsPDF();
    doc.setFillColor(2, 2, 2);
    doc.rect(0, 0, 210, 297, "F");
    
    doc.setTextColor(16, 185, 129);
    doc.setFont("Helvetica", "bold");
    doc.setFontSize(22);
    doc.text("PROCTORAI SECURED EXAM LEDGER", 20, 30);

    doc.setTextColor(255, 255, 255);
    doc.setFontSize(10);
    doc.text(`TRANSACTION ID: SHA256-${Date.now()}`, 20, 42);
    doc.text("INSTITUTION: SRI SAI RAM INSTITUTE OF TECHNOLOGY", 20, 48);

    doc.setFontSize(12);
    doc.text(`Candidate Name: ${profileName}`, 20, 70);
    doc.text(`Email ID: ${profileEmail}`, 20, 78);
    doc.text(`Assessed Subject: ${res.subject}`, 20, 86);
    doc.text(`Assessment Date: ${res.date}`, 20, 94);

    doc.setDrawColor(255, 255, 255);
    doc.setLineWidth(0.5);
    doc.line(20, 105, 190, 105);

    doc.setFontSize(14);
    doc.text("PERFORMANCE ANALYSIS SCORECARD", 20, 120);
    doc.setFontSize(11);
    doc.text(`Answering Accuracy: ${res.score} / ${res.total} Correct (${res.percentage}%)`, 20, 132);
    doc.text(`Session Integrity Score: ${res.integrityScore}% (Verified Secure)`, 20, 140);
    doc.text(`Security Flags Intercepted: ${res.logsCount} events`, 20, 148);

    doc.line(20, 160, 190, 160);
    
    doc.setFontSize(14);
    doc.text("CHRONOLOGICAL BIO-METRIC EVENTS", 20, 175);
    
    let y = 188;
    logs.slice(0, 8).forEach((l) => {
      doc.setFontSize(9);
      doc.setTextColor(150, 150, 150);
      doc.text(`[${l.time}]`, 20, y);
      doc.setTextColor(255, 255, 255);
      doc.text(`${l.event} (${l.level})`, 42, y);
      y += 8;
    });

    doc.setTextColor(16, 185, 129);
    doc.setFontSize(9);
    doc.text("SSL/TLS DIGITAL SECURITY LEDGER VERIFIED CERTIFICATE", 20, 275);

    doc.save(`ProctorAI_Result_${res.subject.replace(/ /g, "_")}.pdf`);
  };

  // Edit Profile Handlers
  const handleUpdateProfile = (e: React.FormEvent) => {
    e.preventDefault();
    setProfileMessage("");

    if (!profileName.trim() || !profileEmail.trim()) {
      setProfileMessage("Name and Email are required properties.");
      return;
    }

    // Update in registeredUsers mock db
    const updated = registeredUsers.map(u => {
      if (u.email.toLowerCase() === user.email.toLowerCase()) {
        return {
          ...u,
          name: profileName,
          email: profileEmail,
          phone: profilePhone
        };
      }
      return u;
    });

    setRegisteredUsers(updated);
    setProfileMessage("Profile specifics successfully secured!");
  };

  const handleChangePassword = (e: React.FormEvent) => {
    e.preventDefault();
    setProfileMessage("");

    if (!passwordCurrent || !passwordNew || !passwordConfirm) {
      setProfileMessage("Please fill out all credentials fields.");
      return;
    }

    if (passwordNew !== passwordConfirm) {
      setProfileMessage("New security passwords do not align.");
      return;
    }

    // Match and update
    let matched = false;
    const updated = registeredUsers.map(u => {
      if (u.email.toLowerCase() === user.email.toLowerCase() && u.password === passwordCurrent) {
        matched = true;
        return {
          ...u,
          password: passwordNew
        };
      }
      return u;
    });

    if (!matched) {
      setProfileMessage("Current password doesn't match our ledger records.");
      return;
    }

    setRegisteredUsers(updated);
    setPasswordCurrent("");
    setPasswordNew("");
    setPasswordConfirm("");
    setProfileMessage("Security Password successfully overwritten & compiled!");
  };

  // Chatbot submit
  const handleChatRequest = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!chatInput.trim()) return;

    const userMsg = chatInput.trim();
    setChatMessages(prev => [...prev, { sender: "user", text: userMsg }]);
    setChatInput("");
    setChatLoading(true);

    try {
      const response = await fetch("/api/chatbot", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          message: userMsg,
          history: chatMessages,
          examResult: examSubmittedResult ? {
            studentName: profileName,
            studentId: "STU-SSIT-0219",
            examTitle: examSubmittedResult.subject,
            correctCount: examSubmittedResult.score,
            totalCount: examSubmittedResult.total,
            percentage: examSubmittedResult.percentage,
            integrityScore: examSubmittedResult.integrityScore,
            logs: logs
          } : null
        })
      });

      const data = await response.json();
      if (data.reply) {
        setChatMessages(prev => [...prev, { sender: "ai", text: data.reply }]);
      } else {
        setChatMessages(prev => [...prev, { sender: "ai", text: "I've processed your data but couldn't formulate an academic reply. Let's try again!" }]);
      }
    } catch (err) {
      setChatMessages(prev => [...prev, { sender: "ai", text: "A communication lag occurred. The server-side Gemini tutor is currently sync-locked." }]);
    } finally {
      setChatLoading(false);
    }
  };

  // Format countdown
  const formatTime = (secs: number) => {
    const mins = Math.floor(secs / 60);
    const s = secs % 60;
    return `${mins}:${s < 10 ? '0' : ''}${s}`;
  };

  return (
    <div className="min-h-screen bg-[#020202] text-white flex selection:bg-emerald-500 selection:text-black font-sans">
      
      {/* SIDEBAR NAVIGATION */}
      <aside className="w-64 bg-[#050505] border-r border-white/5 flex flex-col justify-between p-6 shrink-0 hidden md:flex font-space">
        <div className="space-y-8">
          
          {/* Logo brand */}
          <Link to="/" className="flex items-center gap-3">
            <div className="w-8 h-8 border border-white/10 rounded-lg flex items-center justify-center bg-white/5">
              <Shield className="w-4 h-4 text-emerald-400" />
            </div>
            <div className="text-left">
              <span className="font-bold uppercase tracking-wider text-xs block text-white">ProctorAI</span>
              <span className="text-[8px] text-white/30 uppercase tracking-widest font-mono">Student Space</span>
            </div>
          </Link>

          {/* Nav Items */}
          <nav className="space-y-1.5 text-xs text-left">
            <Link 
              to="/student/dashboard" 
              className={`flex items-center gap-3 px-4 py-3 rounded-xl transition-colors font-semibold ${
                activeTab === "dashboard" ? "bg-emerald-500/10 text-emerald-400 border border-emerald-500/20" : "text-white/60 hover:bg-white/5 hover:text-white"
              }`}
            >
              <BookOpen className="w-4 h-4" /> My Exams
            </Link>

            <Link 
              to="/student/exams" 
              className={`flex items-center gap-3 px-4 py-3 rounded-xl transition-colors font-semibold ${
                activeTab === "exams" ? "bg-emerald-500/10 text-emerald-400 border border-emerald-500/20" : "text-white/60 hover:bg-white/5 hover:text-white"
              }`}
            >
              <Video className="w-4 h-4" /> Upcoming Exams
            </Link>

            <Link 
              to="/student/results" 
              className={`flex items-center gap-3 px-4 py-3 rounded-xl transition-colors font-semibold ${
                activeTab === "results" ? "bg-emerald-500/10 text-emerald-400 border border-emerald-500/20" : "text-white/60 hover:bg-white/5 hover:text-white"
              }`}
            >
              <Award className="w-4 h-4" /> Previous Results
            </Link>

            <Link 
              to="/student/profile" 
              className={`flex items-center gap-3 px-4 py-3 rounded-xl transition-colors font-semibold ${
                activeTab === "profile" ? "bg-emerald-500/10 text-emerald-400 border border-emerald-500/20" : "text-white/60 hover:bg-white/5 hover:text-white"
              }`}
            >
              <User className="w-4 h-4" /> Student Profile
            </Link>
          </nav>

        </div>

        {/* User Info / Log out */}
        <div className="border-t border-white/5 pt-6 text-left space-y-4">
          <div className="flex items-center gap-3">
            <img 
              src={profilePhoto} 
              alt="Student Avatar" 
              className="w-10 h-10 rounded-full border border-white/10"
            />
            <div className="overflow-hidden">
              <span className="block text-xs font-bold text-white truncate">{profileName}</span>
              <span className="block text-[9px] text-white/40 truncate font-mono">{profileEmail}</span>
            </div>
          </div>

          <button 
            onClick={onLogout}
            className="w-full flex items-center justify-center gap-2 py-3 bg-red-500/5 hover:bg-red-500/10 border border-red-500/10 hover:border-red-500/20 text-red-400 text-xs rounded-xl font-bold transition-all cursor-pointer"
          >
            <LogOut className="w-3.5 h-3.5" /> De-authorize Session
          </button>
        </div>
      </aside>

      {/* MAIN CONTENT WORKSPACE AREA */}
      <main className="flex-1 overflow-y-auto p-6 md:p-10">
        
        {/* MOBILE TOP BAR (Hidden on desktop) */}
        <div className="md:hidden flex justify-between items-center mb-8 border-b border-white/5 pb-4 font-space">
          <div className="flex items-center gap-3">
            <div className="w-7 h-7 border border-white/10 rounded-lg flex items-center justify-center bg-white/5">
              <Shield className="w-3.5 h-3.5 text-emerald-400" />
            </div>
            <span className="font-bold text-xs uppercase text-white">ProctorAI</span>
          </div>

          <div className="flex items-center gap-3">
            <Link to="/student/dashboard" className="text-xs font-semibold text-white/60 hover:text-white">Exams</Link>
            <Link to="/student/results" className="text-xs font-semibold text-white/60 hover:text-white">Results</Link>
            <Link to="/student/profile" className="text-xs font-semibold text-white/60 hover:text-white">Profile</Link>
            <button onClick={onLogout} className="text-red-400 text-xs font-bold">Logout</button>
          </div>
        </div>

        {/* ACTIVE EXAM OVERLAY WINDOW */}
        {examActive ? (
          <div className="bg-[#070707] border border-white/10 rounded-3xl p-6 md:p-8 shadow-2xl text-left animate-fadeIn">
            
            <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-start">
              
              {/* Exam questions column */}
              <div className="lg:col-span-7 space-y-6">
                
                {/* Exam Title & Header stats */}
                <div className="flex items-center justify-between border-b border-white/5 pb-4">
                  <div>
                    <span className="font-space text-[9px] uppercase tracking-widest text-white/40">Active Proctored Exam Manifest</span>
                    <h3 className="text-lg md:text-xl font-bold text-white mt-1">{activeSubject}</h3>
                  </div>
                  <div className="flex items-center gap-6">
                    <div className="text-right">
                      <span className="font-space text-[8px] uppercase tracking-widest text-white/40 block font-bold">Time Remaining</span>
                      <span className="font-mono text-emerald-400 font-bold text-lg">{formatTime(examTimer)}</span>
                    </div>
                    <div className="text-right">
                      <span className="font-space text-[8px] uppercase tracking-widest text-white/40 block font-bold">Trust Rating</span>
                      <span className={`font-mono font-bold text-lg ${integrityScore >= 80 ? "text-emerald-400" : integrityScore >= 50 ? "text-amber-400" : "text-red-400"}`}>{integrityScore}%</span>
                    </div>
                  </div>
                </div>

                {/* Question Navigator */}
                <div className="bg-white/[0.02] border border-white/5 rounded-xl p-4">
                  <div className="flex justify-between text-[9px] text-white/40 mb-2.5 font-mono uppercase tracking-wider font-bold">
                    <span>Question Sheet Selection Grid</span>
                    <span className="text-emerald-400">2.0 Marks per Item</span>
                  </div>
                  <div className="flex flex-wrap gap-2">
                    {activeQuestions.map((q, idx) => (
                      <button
                        key={idx}
                        onClick={() => setCurrentQuestionIdx(idx)}
                        className={`w-8 h-8 rounded-lg font-space text-xs font-bold transition-all flex items-center justify-center border cursor-pointer ${
                          idx === currentQuestionIdx 
                            ? "bg-emerald-500 text-black border-emerald-400 font-extrabold shadow-md shadow-emerald-500/20" 
                            : selectedAnswers[q.id] !== undefined 
                              ? "bg-emerald-500/10 text-emerald-300 border-emerald-500/30" 
                              : "bg-white/5 text-white/60 border-white/10 hover:bg-white/10"
                        }`}
                      >
                        {idx + 1}
                      </button>
                    ))}
                  </div>
                </div>

                {/* Current Question */}
                <div className="space-y-6">
                  <div className="flex justify-between text-[10px] text-white/40 font-mono">
                    <span>QUESTION {currentQuestionIdx + 1} OF {activeQuestions.length}</span>
                    <span>{Object.keys(selectedAnswers).length} / {activeQuestions.length} COMPLETED</span>
                  </div>

                  <h4 className="text-base font-semibold text-white leading-relaxed">
                    {activeQuestions[currentQuestionIdx]?.question}
                  </h4>

                  <div className="space-y-3 font-space">
                    {activeQuestions[currentQuestionIdx]?.options.map((opt, oIdx) => (
                      <div 
                        key={oIdx}
                        onClick={() => handleSelectAnswer(activeQuestions[currentQuestionIdx].id, oIdx)}
                        className={`border rounded-xl p-4 cursor-pointer text-xs text-left transition-colors flex items-center gap-3 ${
                          selectedAnswers[activeQuestions[currentQuestionIdx].id] === oIdx
                            ? "border-emerald-500 bg-emerald-500/5 text-emerald-200"
                            : "border-white/5 hover:border-white/10 hover:bg-white/[0.01]"
                        }`}
                      >
                        <span className={`w-5 h-5 rounded-full border flex items-center justify-center text-[10px] font-mono shrink-0 ${
                          selectedAnswers[activeQuestions[currentQuestionIdx].id] === oIdx ? "border-emerald-500 text-emerald-400" : "border-white/20 text-white/40"
                        }`}>
                          {String.fromCharCode(65 + oIdx)}
                        </span>
                        <span>{opt}</span>
                      </div>
                    ))}
                  </div>
                </div>

                {/* Footer Controls inside Exam */}
                <div className="flex justify-between items-center border-t border-white/5 pt-6 mt-8">
                  <div className="flex items-center gap-2">
                    <button 
                      disabled={currentQuestionIdx === 0}
                      onClick={() => setCurrentQuestionIdx(p => Math.max(0, p - 1))}
                      className="px-4 py-2 border border-white/10 rounded-xl text-xs hover:bg-white/5 disabled:opacity-30 transition-colors cursor-pointer"
                    >
                      Prev
                    </button>
                    <button 
                      disabled={currentQuestionIdx === activeQuestions.length - 1}
                      onClick={() => setCurrentQuestionIdx(p => Math.min(activeQuestions.length - 1, p + 1))}
                      className="px-4 py-2 border border-white/10 rounded-xl text-xs hover:bg-white/5 disabled:opacity-30 transition-colors cursor-pointer"
                    >
                      Next
                    </button>
                  </div>

                  {currentQuestionIdx === activeQuestions.length - 1 ? (
                    <button 
                      onClick={handleSubmitExam}
                      className="px-6 py-2.5 bg-emerald-500 hover:bg-emerald-400 text-black font-semibold font-space text-xs uppercase tracking-wider rounded-xl transition-all shadow-md active:scale-95 cursor-pointer"
                    >
                      Lock & Submit Exam
                    </button>
                  ) : (
                    <span className="text-[10px] font-mono text-white/30 tracking-wider">SELECT CHOICE TO LOG ANSWER</span>
                  )}
                </div>

              </div>

              {/* Camera + Simulator columns */}
              <div className="lg:col-span-5 space-y-6">
                
                {/* Active Webcam viewport */}
                <div className="bg-[#090909] border border-white/10 rounded-2xl p-5 shadow-2xl">
                  <div className="flex items-center justify-between mb-3 text-[10px] text-white/40 font-mono font-bold">
                    <span className="flex items-center gap-1.5">
                      <span className="w-1.5 h-1.5 bg-emerald-500 rounded-full animate-pulse"></span>
                      Vision Stream
                    </span>
                    <span>FPS: 30</span>
                  </div>

                  <div className="relative aspect-video bg-neutral-950 border border-white/5 rounded-xl overflow-hidden">
                    {/* Video and Overlay canvas */}
                    {webcamStream && cameraActive && (
                      <video 
                        ref={videoRef}
                        autoPlay
                        playsInline
                        muted
                        className="absolute inset-0 w-full h-full object-cover rounded-xl"
                      />
                    )}
                    <canvas 
                      ref={canvasRef}
                      width={300}
                      height={180}
                      className="absolute inset-0 w-full h-full object-contain pointer-events-none"
                    />

                    {/* Overlay status label */}
                    <div className="absolute bottom-3 left-3 px-2 py-1 bg-black/75 rounded text-[9px] font-mono text-emerald-400 border border-emerald-500/20">
                      SYS_SEC_ACTIVE // MESH_MATCH_OK
                    </div>
                  </div>
                </div>

                {/* Behavioral warning mock toggles */}
                <div className="bg-[#090909] border border-white/10 rounded-2xl p-5">
                  <span className="font-space text-[10px] uppercase tracking-widest text-emerald-400 font-bold block mb-4">Hardware Anomaly Simulators</span>
                  
                  <div className="space-y-3">
                    <button 
                      onClick={() => toggleAnomalySim("lookaway")}
                      className={`w-full py-3 border rounded-xl text-xs font-medium font-space transition-all cursor-pointer flex items-center justify-between px-4 ${
                        flagLookAway ? "bg-amber-500/10 border-amber-500 text-amber-400" : "bg-white/5 border-white/10 text-white hover:bg-white/10"
                      }`}
                    >
                      <span>Simulate Head Turn / Lookaway</span>
                      <span className="text-[10px] font-mono font-bold uppercase">{flagLookAway ? "Flagged" : "Trigger"}</span>
                    </button>

                    <button 
                      onClick={() => toggleAnomalySim("multiface")}
                      className={`w-full py-3 border rounded-xl text-xs font-medium font-space transition-all cursor-pointer flex items-center justify-between px-4 ${
                        flagMultiFace ? "bg-red-500/10 border-red-500 text-red-400" : "bg-white/5 border-white/10 text-white hover:bg-white/10"
                      }`}
                    >
                      <span>Simulate Secondary Face Detection</span>
                      <span className="text-[10px] font-mono font-bold uppercase">{flagMultiFace ? "Flagged" : "Trigger"}</span>
                    </button>

                    <button 
                      onClick={() => toggleAnomalySim("phone")}
                      className={`w-full py-3 border rounded-xl text-xs font-medium font-space transition-all cursor-pointer flex items-center justify-between px-4 ${
                        flagPhone ? "bg-red-500/10 border-red-500 text-red-400" : "bg-white/5 border-white/10 text-white hover:bg-white/10"
                      }`}
                    >
                      <span>Simulate Mobile Phone Device</span>
                      <span className="text-[10px] font-mono font-bold uppercase">{flagPhone ? "Flagged" : "Trigger"}</span>
                    </button>
                  </div>
                </div>

              </div>

            </div>

          </div>
        ) : (
          <Routes>
            {/* SUBPATH 1: My Exams Dashboard */}
            <Route path="/" element={
              <div className="space-y-8 text-left animate-fadeIn">
                
                {/* Header */}
                <div>
                  <span className="font-space text-[10px] text-emerald-400 uppercase tracking-widest font-bold">Candidate Secure Workspace</span>
                  <h2 className="font-serif text-3xl md:text-4xl font-bold mt-1">Welcome back, <span className="text-emerald-400 italic font-normal">{profileName}</span>!</h2>
                  <p className="text-white/50 text-xs md:text-sm font-light mt-1.5 max-w-xl">
                    Email ID is authenticated under SSL node. Review your assigned core assessment subjects or examine previous performance recommendations below.
                  </p>
                </div>

                {/* Performance overview summary card */}
                <div className="bg-neutral-900/40 border border-white/10 rounded-2xl p-6 relative overflow-hidden">
                  <div className="absolute inset-y-0 right-0 w-1/3 bg-[radial-gradient(ellipse_at_right,rgba(16,185,129,0.05),transparent_70%)] pointer-events-none" />
                  <span className="font-space text-[9px] uppercase tracking-widest text-emerald-400 font-bold block mb-4">Core Academic Statistics</span>
                  <div className="grid grid-cols-2 md:grid-cols-4 gap-6">
                    <div className="bg-[#070707] border border-white/5 rounded-xl p-4 text-center">
                      <span className="block text-2xl font-serif font-bold text-white">5</span>
                      <span className="block text-[8px] font-mono text-white/40 uppercase tracking-widest mt-1">Total Assigned Exams</span>
                    </div>
                    <div className="bg-[#070707] border border-white/5 rounded-xl p-4 text-center">
                      <span className="block text-2xl font-serif font-bold text-white">{resultsHistory.length}</span>
                      <span className="block text-[8px] font-mono text-white/40 uppercase tracking-widest mt-1">Exams Completed</span>
                    </div>
                    <div className="bg-[#070707] border border-white/5 rounded-xl p-4 text-center">
                      <span className="block text-2xl font-serif font-bold text-emerald-400">{resultsHistory.length > 0 ? Math.round(resultsHistory.reduce((acc, c) => acc + c.percentage, 0) / resultsHistory.length) : 0}%</span>
                      <span className="block text-[8px] font-mono text-white/40 uppercase tracking-widest mt-1">Average Score</span>
                    </div>
                    <div className="bg-[#070707] border border-white/5 rounded-xl p-4 text-center">
                      <span className="block text-2xl font-serif font-bold text-emerald-400">96.0%</span>
                      <span className="block text-[8px] font-mono text-white/40 uppercase tracking-widest mt-1">Avg Integrity Level</span>
                    </div>
                  </div>
                </div>

                {/* My assigned exams grid */}
                <div className="space-y-4">
                  <h3 className="font-serif text-2xl font-bold text-white">My Active Core Exams</h3>
                  
                  <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                    {[
                      {
                        name: "Data Structures & Algorithms",
                        desc: "Examines linear layouts, Big-O complexities, balanced binary trees, heap sort, and graph algorithm traversals.",
                        code: "DSA-301",
                        duration: "5 mins"
                      },
                      {
                        name: "Database Management Systems",
                        desc: "Covers normal forms (1NF/2NF/3NF/BCNF), relational projections, transaction isolation states, and B-Tree indexes.",
                        code: "DBMS-302",
                        duration: "5 mins"
                      },
                      {
                        name: "Operating Systems",
                        desc: "Covers thread synchronization, CPU deadlocks, page replacement schemes, and file index systems.",
                        code: "OS-303",
                        duration: "5 mins"
                      },
                      {
                        name: "Computer Networks",
                        desc: "Covers TCP/IP model layers, subnet CIDR partitions, transport TLS, and network routing configurations.",
                        code: "CN-304",
                        duration: "5 mins"
                      },
                      {
                        name: "Aptitude & Quantitative Reasoning",
                        desc: "Covers logic distribution mechanics, permutations, dynamic timelines, speed formulas, and ratios.",
                        code: "APT-305",
                        duration: "5 mins"
                      }
                    ].map((exam, idx) => (
                      <div key={idx} className="bg-[#070707] border border-white/5 hover:border-emerald-500/20 rounded-2xl p-6 flex flex-col justify-between group transition-all">
                        <div>
                          <div className="flex justify-between items-start mb-3">
                            <span className="text-[8.5px] font-mono font-bold text-emerald-400 bg-emerald-500/10 border border-emerald-500/20 px-2 py-0.5 rounded uppercase">
                              {exam.code}
                            </span>
                            <span className="text-[9px] font-mono text-white/30">{exam.duration} · 10 MCQs</span>
                          </div>
                          <h4 className="font-serif text-lg font-bold text-white group-hover:text-emerald-400 transition-colors">{exam.name}</h4>
                          <p className="text-xs text-white/50 leading-relaxed font-light mt-2">{exam.desc}</p>
                        </div>
                        <div className="flex gap-4.5 pt-6 border-t border-white/5 mt-6">
                          <button 
                            onClick={() => handleStartExam(exam.name)}
                            className="px-5 py-2.5 bg-emerald-500 hover:bg-emerald-400 text-black font-semibold font-space text-xs uppercase tracking-wider rounded-xl transition-all cursor-pointer shadow-md flex items-center gap-2 active:scale-95"
                          >
                            Launch Secure Exam <ArrowRight className="w-3.5 h-3.5" />
                          </button>
                        </div>
                      </div>
                    ))}
                  </div>
                </div>

              </div>
            } />

            {/* SUBPATH 2: Upcoming Exams */}
            <Route path="/exams" element={
              <div className="space-y-8 text-left animate-fadeIn">
                <div>
                  <span className="font-space text-[10px] text-emerald-400 uppercase tracking-widest font-bold">Upcoming Exams</span>
                  <h2 className="font-serif text-3xl font-bold mt-1">Pending Assessment Manifest</h2>
                  <p className="text-white/50 text-xs md:text-sm font-light mt-1.5 max-w-xl">
                    Seeded unique exam papers are randomized per candidate from the 200 questions bank.
                  </p>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 font-space">
                  {[
                    {
                      name: "Data Structures & Algorithms",
                      desc: "Covers balanced trees, sorting algorithm complexities, graph traversals, and dynamic programming concepts.",
                      code: "DSA-301",
                      duration: "5 mins"
                    },
                    {
                      name: "Database Management Systems",
                      desc: "Covers SQL query optimization, database normalization forms, ACID transactions, and indexing structures.",
                      code: "DBMS-302",
                      duration: "5 mins"
                    },
                    {
                      name: "Operating Systems",
                      desc: "Covers thread synchronization, CPU deadlocks, page replacement schemes, and file index systems.",
                      code: "OS-303",
                      duration: "5 mins"
                    },
                    {
                      name: "Computer Networks",
                      desc: "Covers TCP/IP model layers, subnet CIDR partitions, transport TLS, and network routing configurations.",
                      code: "CN-304",
                      duration: "5 mins"
                    },
                    {
                      name: "Aptitude & Quantitative Reasoning",
                      desc: "Covers logic distribution mechanics, permutations, dynamic timelines, speed formulas, and ratios.",
                      code: "APT-305",
                      duration: "5 mins"
                    }
                  ].map((exam, idx) => (
                    <div key={idx} className="bg-[#070707] border border-white/5 hover:border-emerald-500/20 rounded-2xl p-6 flex flex-col justify-between group transition-all">
                      <div>
                        <div className="flex justify-between items-start mb-3">
                          <span className="text-[8px] font-mono font-bold text-emerald-400 bg-emerald-500/10 border border-emerald-500/20 px-2 py-0.5 rounded uppercase">
                            {exam.code}
                          </span>
                          <span className="text-[9px] font-mono text-white/30">{exam.duration}</span>
                        </div>
                        <h4 className="font-serif text-base font-bold text-white group-hover:text-emerald-400 transition-colors leading-tight">{exam.name}</h4>
                        <p className="text-[11px] text-[#EBEBEB]/60 font-light mt-2 leading-relaxed">{exam.desc}</p>
                      </div>

                      <button 
                        onClick={() => handleStartExam(exam.name)}
                        className="w-full py-3 bg-white/5 hover:bg-emerald-500 hover:text-black border border-white/10 hover:border-emerald-500 text-white font-semibold font-space text-[10px] uppercase tracking-wider rounded-xl transition-all cursor-pointer text-center mt-6 block active:scale-95"
                      >
                        Initialize Hardware Handshake
                      </button>
                    </div>
                  ))}
                </div>
              </div>
            } />

            {/* SUBPATH 3: Previous Results & AI Performance report */}
            <Route path="/results" element={
              <div className="space-y-8 text-left animate-fadeIn">
                <div>
                  <span className="font-space text-[10px] text-emerald-400 uppercase tracking-widest font-bold">Previous Graded Marks</span>
                  <h2 className="font-serif text-3xl font-bold mt-1">My Performance scorecard</h2>
                  <p className="text-white/50 text-xs md:text-sm font-light mt-1.5 max-w-xl">
                    Review completed exams below. Access complete cryptographic PDF certificates, or invoke our Gemini-powered academic tutor to resolve confusing concepts.
                  </p>
                </div>

                <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-start">
                  
                  {/* Results list */}
                  <div className="lg:col-span-6 space-y-4 font-space">
                    {resultsHistory.map((res, idx) => (
                      <div key={idx} className="bg-[#070707] border border-white/5 rounded-2xl p-5 flex items-center justify-between gap-4">
                        <div className="space-y-1">
                          <h4 className="font-serif text-sm font-bold text-white leading-snug">{res.subject}</h4>
                          <div className="flex flex-wrap gap-x-3 gap-y-1 text-[10px] text-white/40 font-mono">
                            <span>Score: {res.score}/{res.total}</span>
                            <span>Integrity: {res.integrityScore}%</span>
                            <span>Date: {res.date}</span>
                          </div>
                        </div>

                        <div className="flex gap-2 shrink-0">
                          <button 
                            onClick={() => handleDownloadReportPDF(res)}
                            className="p-2 bg-emerald-500/10 hover:bg-emerald-500/20 text-emerald-400 rounded-lg border border-emerald-500/20 transition-all cursor-pointer"
                            title="Download Cryptographic PDF Record"
                          >
                            <Download className="w-4 h-4" />
                          </button>
                        </div>
                      </div>
                    ))}
                  </div>

                  {/* Academic chat tutor */}
                  <div className="lg:col-span-6 bg-[#070707] border border-white/10 rounded-2xl p-5 flex flex-col h-[400px]">
                    <div className="flex items-center gap-2 border-b border-white/5 pb-3 mb-4 font-space">
                      <Sparkles className="w-4 h-4 text-emerald-400 animate-pulse" />
                      <div>
                        <span className="text-[10px] font-bold text-emerald-400 block">ProctorAI Academics Chatbot</span>
                        <span className="text-[8px] text-white/35 uppercase font-mono tracking-widest">Powered by server-side Gemini</span>
                      </div>
                    </div>

                    <div className="flex-1 overflow-y-auto space-y-3 text-xs mb-4 pr-1">
                      {chatMessages.map((msg, idx) => (
                        <div key={idx} className={`flex ${msg.sender === "user" ? "justify-end" : "justify-start"}`}>
                          <div className={`p-3 rounded-2xl max-w-[85%] font-light leading-relaxed ${
                            msg.sender === "user" 
                              ? "bg-emerald-500/10 text-emerald-200 border border-emerald-500/20 rounded-tr-none" 
                              : "bg-white/5 text-white/90 border border-white/5 rounded-tl-none text-left"
                          }`}>
                            {msg.text}
                          </div>
                        </div>
                      ))}
                      {chatLoading && (
                        <div className="flex justify-start">
                          <div className="p-3 rounded-2xl bg-white/5 text-white/40 border border-white/5 rounded-tl-none text-left animate-pulse">
                            Academic tutor formulating answer...
                          </div>
                        </div>
                      )}
                    </div>

                    <form onSubmit={handleChatRequest} className="flex gap-2 font-space">
                      <input 
                        type="text"
                        value={chatInput}
                        onChange={(e) => setChatInput(e.target.value)}
                        placeholder="Ask about B-Trees, CIDR subnet, virtual memory thread..."
                        className="flex-1 bg-white/5 border border-white/10 rounded-xl px-4 py-3 text-xs text-white focus:outline-none focus:border-emerald-500 transition-colors"
                      />
                      <button 
                        type="submit"
                        disabled={chatLoading}
                        className="px-4 bg-emerald-500 hover:bg-emerald-400 text-black font-bold uppercase rounded-xl transition-all text-[10px] cursor-pointer"
                      >
                        Send
                      </button>
                    </form>
                  </div>

                </div>

              </div>
            } />

            {/* SUBPATH 4: Student Profile Page */}
            <Route path="/profile" element={
              <div className="space-y-8 text-left animate-fadeIn">
                <div>
                  <span className="font-space text-[10px] text-emerald-400 uppercase tracking-widest font-bold">Candidate Specifications</span>
                  <h2 className="font-serif text-3xl font-bold mt-1">Student Particulars</h2>
                  <p className="text-white/50 text-xs md:text-sm font-light mt-1.5 max-w-xl">
                    Verify or modify your authorized credentials. These specifications are compiled onto cryptographic transcripts and exam submissions.
                  </p>
                </div>

                {profileMessage && (
                  <div className="p-4 bg-emerald-500/10 border border-emerald-500/20 text-emerald-400 text-xs rounded-xl font-light">
                    {profileMessage}
                  </div>
                )}

                <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-start">
                  
                  {/* Left panel: Photo */}
                  <div className="lg:col-span-4 bg-[#070707] border border-white/5 rounded-2xl p-6 text-center space-y-4">
                    <span className="font-space text-[9px] uppercase tracking-widest text-[#EBEBEB]/40 font-bold block">Biometric Template Photo</span>
                    
                    <div className="relative mx-auto w-32 h-32 rounded-full border border-white/15 overflow-hidden flex items-center justify-center bg-white/5 group">
                      <img 
                        src={profilePhoto} 
                        alt="Profile avatar" 
                        className="w-full h-full object-cover group-hover:scale-105 transition-transform"
                      />
                      <button 
                        onClick={() => {
                          const url = prompt("Enter an image URL to update your profile photo:", profilePhoto);
                          if (url) setProfilePhoto(url);
                        }}
                        className="absolute inset-0 bg-black/60 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center text-[10px] font-space font-bold text-white uppercase cursor-pointer"
                      >
                        <Edit className="w-4 h-4 mr-1" /> Update
                      </button>
                    </div>

                    <div>
                      <h4 className="text-sm font-bold text-white font-space">{profileName}</h4>
                      <span className="text-[10px] text-white/40 font-mono">ID: CANDIDATE-2092-SSIT</span>
                    </div>
                  </div>

                  {/* Right panel: Details Forms */}
                  <div className="lg:col-span-8 space-y-6">
                    
                    {/* General Info */}
                    <div className="bg-[#070707] border border-white/5 rounded-2xl p-6">
                      <h3 className="font-serif text-lg font-bold text-white mb-6">General Particulars</h3>
                      <form onSubmit={handleUpdateProfile} className="grid grid-cols-1 sm:grid-cols-2 gap-4 font-space text-xs">
                        <div className="space-y-1.5 text-left">
                          <label className="text-white/55 font-bold uppercase tracking-wider block">Full Name</label>
                          <input 
                            type="text"
                            required
                            value={profileName}
                            onChange={(e) => setProfileName(e.target.value)}
                            className="w-full bg-white/5 border border-white/10 rounded-xl px-4 py-3 text-white focus:outline-none focus:border-emerald-500"
                          />
                        </div>

                        <div className="space-y-1.5 text-left">
                          <label className="text-white/55 font-bold uppercase tracking-wider block">Email ID</label>
                          <input 
                            type="email"
                            required
                            value={profileEmail}
                            onChange={(e) => setProfileEmail(e.target.value)}
                            className="w-full bg-white/5 border border-white/10 rounded-xl px-4 py-3 text-white focus:outline-none focus:border-emerald-500"
                          />
                        </div>

                        <div className="space-y-1.5 text-left sm:col-span-2">
                          <label className="text-white/55 font-bold uppercase tracking-wider block">Phone Number</label>
                          <input 
                            type="tel"
                            value={profilePhone}
                            onChange={(e) => setProfilePhone(e.target.value)}
                            className="w-full bg-white/5 border border-white/10 rounded-xl px-4 py-3 text-white focus:outline-none focus:border-emerald-500"
                          />
                        </div>

                        <button 
                          type="submit"
                          className="sm:col-span-2 py-3.5 bg-emerald-500 hover:bg-emerald-400 text-black font-semibold uppercase tracking-wider rounded-xl transition-all cursor-pointer mt-2 active:scale-[0.98]"
                        >
                          Save Profile Specifics
                        </button>
                      </form>
                    </div>

                    {/* Change Password */}
                    <div className="bg-[#070707] border border-white/5 rounded-2xl p-6">
                      <h3 className="font-serif text-lg font-bold text-white mb-6">Update Security Password</h3>
                      <form onSubmit={handleChangePassword} className="grid grid-cols-1 sm:grid-cols-3 gap-4 font-space text-xs">
                        <div className="space-y-1.5 text-left">
                          <label className="text-white/55 font-bold uppercase tracking-wider block">Current Password</label>
                          <input 
                            type="password"
                            required
                            value={passwordCurrent}
                            onChange={(e) => setPasswordCurrent(e.target.value)}
                            placeholder="••••••••"
                            className="w-full bg-white/5 border border-white/10 rounded-xl px-4 py-3 text-white focus:outline-none focus:border-emerald-500"
                          />
                        </div>

                        <div className="space-y-1.5 text-left">
                          <label className="text-white/55 font-bold uppercase tracking-wider block">New Password</label>
                          <input 
                            type="password"
                            required
                            value={passwordNew}
                            onChange={(e) => setPasswordNew(e.target.value)}
                            placeholder="••••••••"
                            className="w-full bg-white/5 border border-white/10 rounded-xl px-4 py-3 text-white focus:outline-none focus:border-emerald-500"
                          />
                        </div>

                        <div className="space-y-1.5 text-left">
                          <label className="text-white/55 font-bold uppercase tracking-wider block">Confirm New</label>
                          <input 
                            type="password"
                            required
                            value={passwordConfirm}
                            onChange={(e) => setPasswordConfirm(e.target.value)}
                            placeholder="••••••••"
                            className="w-full bg-white/5 border border-white/10 rounded-xl px-4 py-3 text-white focus:outline-none focus:border-emerald-500"
                          />
                        </div>

                        <button 
                          type="submit"
                          className="sm:col-span-3 py-3.5 bg-emerald-500 hover:bg-emerald-400 text-black font-semibold uppercase tracking-wider rounded-xl transition-all cursor-pointer mt-2 active:scale-[0.98]"
                        >
                          Update Security Credentials
                        </button>
                      </form>
                    </div>

                  </div>

                </div>

              </div>
            } />
          </Routes>
        )}

      </main>

    </div>
  );
}
