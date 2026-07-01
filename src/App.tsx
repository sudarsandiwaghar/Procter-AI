import { useState, useRef, useEffect } from "react";
import { BrowserRouter, Routes, Route, Navigate } from "react-router-dom";
import { Log, RegisteredUser } from "./types";
import Home from "./pages/Home";
import StudentLogin from "./pages/student/Login";
import StudentRegister from "./pages/student/Register";
import FacultyLogin from "./pages/faculty/Login";
import AdminLogin from "./pages/admin/Login";
import StudentWorkspace from "./pages/student/StudentWorkspace";
import FacultyWorkspace from "./pages/faculty/FacultyWorkspace";
import AdminWorkspace from "./pages/admin/AdminWorkspace";

export default function App() {
  // Mock users database
  const [registeredUsers, setRegisteredUsers] = useState<RegisteredUser[]>([
    { name: "Sudar S", email: "sudar@ssit.edu", password: "Root", role: "student", phone: "+91 94452 82210" },
    { name: "Ramanathan R", email: "faculty@ssit.edu", password: "Root", role: "faculty", phone: "+91 94441 52019" },
    { name: "Sudarsan S", email: "sudarsan@ssit.edu", password: "Root", role: "admin", phone: "+91 91599 02330" }
  ]);

  // Authenticated User
  const [currentUser, setCurrentUser] = useState<RegisteredUser | null>(null);

  // Email delivery states
  const [emailDeliveryStatus, setEmailDeliveryStatus] = useState<"idle" | "sending" | "success" | "error">("idle");
  const [emailDeliveryMessage, setEmailDeliveryMessage] = useState("");
  const [emailDeliveryHtml, setEmailDeliveryHtml] = useState("");
  const [showEmailPreview, setShowEmailPreview] = useState(false);

  // Biometric Webcam Capture States
  const [webcamStream, setWebcamStream] = useState<MediaStream | null>(null);
  const [cameraActive, setCameraActive] = useState(false);
  const videoRef = useRef<HTMLVideoElement | null>(null);
  const canvasRef = useRef<HTMLCanvasElement | null>(null);

  // Gemini assistant message log history
  const [chatMessages, setChatMessages] = useState([
    { sender: "ai", text: "Hello! I'm the ProctorAI Academic Assistant. Ask me anything about our computer vision models, performance evaluation indices, or system security layers!" }
  ]);

  // Anomalous Telemetry stream
  const [logs, setLogs] = useState<Log[]>([
    { id: "1", time: "14:23:05", studentId: "sudar@ssit.edu", event: "Face Not Detected", level: "HIGH", model: "MediaPipe Face", ref: "Frame #1823" },
    { id: "2", time: "14:23:19", studentId: "sudar@ssit.edu", event: "Multiple Faces (2 Detected)", level: "HIGH", model: "TensorFlow.js Multi-Face", ref: "Frame #1994" },
    { id: "3", time: "vijay@ssit.edu", studentId: "vijay@ssit.edu", event: "Gaze: LEFT > 4s", level: "MED", model: "MediaPipe GazeMesh", ref: "Frame #2887" },
    { id: "4", time: "abhishek@ssit.edu", studentId: "abhishek@ssit.edu", event: "Head Turned (Yaw: 38°)", level: "MED", model: "MediaPipe FaceMesh", ref: "Frame #3211" }
  ]);

  // Request client video capture stream
  const startCamera = async () => {
    try {
      const stream = await navigator.mediaDevices.getUserMedia({
        video: { width: 640, height: 480 },
        audio: false
      });
      setWebcamStream(stream);
      setCameraActive(true);
      triggerViolation("Local webcam capture authorized", "INFO", "Webcam Driver API", "SYS_DEV_OK");
    } catch (err) {
      console.error("Camera access failed:", err);
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

  // Sync webcam element ref with active stream
  useEffect(() => {
    if (videoRef.current && webcamStream) {
      videoRef.current.srcObject = webcamStream;
    }
  }, [webcamStream, cameraActive]);

  // Trigger violation log
  const triggerViolation = (event: string, level: "HIGH" | "MED" | "LOW" | "INFO", model: string, ref: string) => {
    const timestamp = new Date().toLocaleTimeString("en-US", { hour12: false });
    const newLog: Log = {
      id: String(Date.now()),
      time: timestamp,
      studentId: currentUser ? currentUser.email : "STU-GUEST",
      event,
      level,
      model,
      ref
    };
    setLogs(prev => [newLog, ...prev]);
  };

  // Send Email report POST API trigger
  const sendEmailReport = async (
    examTitle: string,
    score: number,
    total: number,
    percentage: number,
    integrity: number,
    currentLogs: Log[]
  ) => {
    if (!currentUser) return;
    const targetEmail = currentUser.email.trim();

    setEmailDeliveryStatus("sending");
    setEmailDeliveryMessage("");

    try {
      const payload = {
        studentName: currentUser.name,
        studentEmail: targetEmail,
        examTitle: examTitle,
        scoreText: `${score} / ${total}`,
        percentage,
        integrityScore: integrity,
        anomalyCount: currentLogs.filter(l => l.level === "HIGH" || l.level === "MED").length,
        logs: currentLogs.slice(0, 8)
      };

      const res = await fetch("/api/send-email", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(payload)
      });

      const data = await res.json();
      if (res.ok && data.success) {
        setEmailDeliveryStatus("success");
        setEmailDeliveryMessage(data.message);
        setEmailDeliveryHtml(data.html);
      } else {
        setEmailDeliveryStatus("error");
        setEmailDeliveryMessage(data.error || "Failed to dispatch email report.");
      }
    } catch (err: any) {
      console.error("Error dispatching email:", err);
      setEmailDeliveryStatus("error");
      setEmailDeliveryMessage(err.message || "Network error occurred while dispatching email report.");
    }
  };

  const handleLogout = () => {
    stopCamera();
    setCurrentUser(null);
    setChatMessages([
      { sender: "ai", text: "Hello! I'm the ProctorAI Academic Assistant. Ask me anything about our computer vision models, performance evaluation indices, or system security layers!" }
    ]);
  };

  const handleRegisterStudent = (newUser: RegisteredUser) => {
    setRegisteredUsers(prev => [...prev, newUser]);
  };

  return (
    <BrowserRouter>
      <Routes>
        {/* Landing Page */}
        <Route path="/" element={<Home />} />

        {/* Auth routes */}
        <Route 
          path="/student/login" 
          element={
            currentUser && currentUser.role === "student" ? (
              <Navigate to="/student/dashboard" replace />
            ) : (
              <StudentLogin 
                registeredUsers={registeredUsers} 
                onLoginSuccess={setCurrentUser} 
              />
            )
          } 
        />
        <Route 
          path="/student/register" 
          element={
            currentUser && currentUser.role === "student" ? (
              <Navigate to="/student/dashboard" replace />
            ) : (
              <StudentRegister onRegisterSuccess={handleRegisterStudent} />
            )
          } 
        />

        <Route 
          path="/faculty/login" 
          element={
            currentUser && currentUser.role === "faculty" ? (
              <Navigate to="/faculty/dashboard" replace />
            ) : (
              <FacultyLogin 
                registeredUsers={registeredUsers} 
                onLoginSuccess={setCurrentUser} 
              />
            )
          } 
        />

        <Route 
          path="/admin/login" 
          element={
            currentUser && currentUser.role === "admin" ? (
              <Navigate to="/admin/dashboard" replace />
            ) : (
              <AdminLogin 
                registeredUsers={registeredUsers} 
                onLoginSuccess={setCurrentUser} 
              />
            )
          } 
        />

        {/* Student Workspace (Protected) */}
        <Route 
          path="/student/*" 
          element={
            currentUser && currentUser.role === "student" ? (
              <StudentWorkspace 
                user={currentUser}
                onLogout={handleLogout}
                registeredUsers={registeredUsers}
                setRegisteredUsers={setRegisteredUsers}
                logs={logs}
                setLogs={setLogs}
                triggerViolation={triggerViolation}
                webcamStream={webcamStream}
                cameraActive={cameraActive}
                startCamera={startCamera}
                stopCamera={stopCamera}
                videoRef={videoRef}
                canvasRef={canvasRef}
                chatMessages={chatMessages}
                setChatMessages={setChatMessages}
                onSendEmailReport={sendEmailReport}
                emailDeliveryHtml={emailDeliveryHtml}
                showEmailPreview={showEmailPreview}
                setShowEmailPreview={setShowEmailPreview}
              />
            ) : (
              <Navigate to="/student/login" replace />
            )
          } 
        />

        {/* Faculty Workspace (Protected) */}
        <Route 
          path="/faculty/*" 
          element={
            currentUser && currentUser.role === "faculty" ? (
              <FacultyWorkspace 
                user={currentUser}
                onLogout={handleLogout}
                registeredUsers={registeredUsers}
                setRegisteredUsers={setRegisteredUsers}
              />
            ) : (
              <Navigate to="/faculty/login" replace />
            )
          } 
        />

        {/* Admin Workspace (Protected) */}
        <Route 
          path="/admin/*" 
          element={
            currentUser && currentUser.role === "admin" ? (
              <Navigate to="/admin/login" replace />
            ) : (
              <AdminWorkspace 
                user={currentUser}
                onLogout={handleLogout}
                registeredUsers={registeredUsers}
                setRegisteredUsers={setRegisteredUsers}
                logs={logs}
                setLogs={setLogs}
              />
            )
          } 
        />

        {/* Fallback */}
        <Route path="*" element={<Navigate to="/" replace />} />
      </Routes>
    </BrowserRouter>
  );
}
