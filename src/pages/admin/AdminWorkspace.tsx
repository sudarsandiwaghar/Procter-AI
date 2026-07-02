import React, { useState, useEffect } from "react";
import { Routes, Route, Link, useNavigate, useLocation } from "react-router-dom";
import { 
  Shield, 
  User, 
  Award, 
  FileText, 
  LogOut, 
  Users, 
  Sliders, 
  Database, 
  Sparkles, 
  PlusCircle, 
  Trash2, 
  Edit, 
  Mail, 
  Phone, 
  Lock, 
  AlertTriangle, 
  Terminal,
  Settings
} from "lucide-react";
import { RegisteredUser, Log } from "../../types";

interface AdminWorkspaceProps {
  user: RegisteredUser;
  onLogout: () => void;
  registeredUsers: RegisteredUser[];
  setRegisteredUsers: React.Dispatch<React.SetStateAction<RegisteredUser[]>>;
  logs: Log[];
  setLogs: React.Dispatch<React.SetStateAction<Log[]>>;
}

export default function AdminWorkspace({
  user,
  onLogout,
  registeredUsers,
  setRegisteredUsers,
  logs,
  setLogs
}: AdminWorkspaceProps) {
  const navigate = useNavigate();
  const location = useLocation();
  const [activeTab, setActiveTab] = useState("dashboard");

  // Local state for profile
  const [profilePhoto, setProfilePhoto] = useState<string>("https://images.unsplash.com/photo-1600585154340-be6161a56a0c?auto=format&fit=crop&q=80&w=150&h=150");
  const [profileName, setProfileName] = useState(user.name);
  const [profileEmail, setProfileEmail] = useState(user.email);
  const [profilePhone, setProfilePhone] = useState(user.phone || "+91 91599 02330");
  const [passwordCurrent, setPasswordCurrent] = useState("");
  const [passwordNew, setPasswordNew] = useState("");
  const [passwordConfirm, setPasswordConfirm] = useState("");
  const [profileMessage, setProfileMessage] = useState("");

  // Add Student/Faculty form states
  const [newUserRole, setNewUserRole] = useState<"student" | "faculty">("student");
  const [newUserName, setNewUserName] = useState("");
  const [newUserEmail, setNewUserEmail] = useState("");
  const [newUserPhone, setNewUserPhone] = useState("");
  const [newUserPassword, setNewUserPassword] = useState("");
  const [userActionMessage, setUserActionMessage] = useState("");

  // Selected item for edits
  const [editingUser, setEditingUser] = useState<RegisteredUser | null>(null);

  // Results Ledger and Resend Hub states
  const [results, setResults] = useState<any[]>([]);
  const [emailLogs, setEmailLogs] = useState<any[]>([]);
  const [resendingId, setResendingId] = useState<string | null>(null);
  const [resendOverride, setResendOverride] = useState("");
  const [activeResendResult, setActiveResendResult] = useState<any | null>(null);
  const [resendStatusMsg, setResendStatusMsg] = useState("");

  const fetchResultsData = async () => {
    try {
      const res = await fetch("/api/results");
      if (res.ok) {
        const data = await res.json();
        setResults(data);
      }
      const logsRes = await fetch("/api/results/email-logs");
      if (logsRes.ok) {
        const logsData = await logsRes.json();
        setEmailLogs(logsData);
      }
    } catch (err) {
      console.error("Error loading results data:", err);
    }
  };

  useEffect(() => {
    fetchResultsData();
    const interval = setInterval(fetchResultsData, 12000);
    return () => clearInterval(interval);
  }, []);

  const handleTriggerManualResend = async (resultId: string) => {
    setResendingId(resultId);
    setResendStatusMsg("");
    try {
      const res = await fetch("/api/results/resend", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          resultId,
          emailOverride: resendOverride ? resendOverride.trim() : undefined,
          senderUserId: user.email
        })
      });
      const data = await res.json();
      if (res.ok && data.success) {
        setResendStatusMsg("✓ Email report dispatched successfully.");
        setResendOverride("");
        fetchResultsData();
        setTimeout(() => setActiveResendResult(null), 1500);
      } else {
        setResendStatusMsg(`✗ Send failed: ${data.error || "relay error"}`);
      }
    } catch (err: any) {
      setResendStatusMsg(`✗ Network error: ${err.message}`);
    } finally {
      setResendingId(null);
    }
  };

  // Settings mock thresholds
  const [lookawayThreshold, setLookawayThreshold] = useState("3");
  const [phoneThreshold, setPhoneThreshold] = useState("1");
  const [tabBlurThreshold, setTabBlurThreshold] = useState("2");
  const [smtpServer, setSmtpServer] = useState("smtp.gmail.com");
  const [smtpPort, setSmtpPort] = useState("587");
  const [smtpSender, setSmtpSender] = useState("noreply-proctor@ssit.edu");

  useEffect(() => {
    const path = location.pathname;
    if (path.includes("/admin/profile")) {
      setActiveTab("profile");
    } else if (path.includes("/admin/students")) {
      setActiveTab("students");
    } else if (path.includes("/admin/faculty")) {
      setActiveTab("faculty");
    } else if (path.includes("/admin/exams")) {
      setActiveTab("exams");
    } else if (path.includes("/admin/reports")) {
      setActiveTab("reports");
    } else if (path.includes("/admin/settings")) {
      setActiveTab("settings");
    } else {
      setActiveTab("dashboard");
    }
  }, [location]);

  // General profile update
  const handleUpdateProfile = (e: React.FormEvent) => {
    e.preventDefault();
    setProfileMessage("");

    if (!profileName.trim() || !profileEmail.trim()) {
      setProfileMessage("Name and Email are required parameters.");
      return;
    }

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
    setProfileMessage("Administrator specifications securely compiled!");
  };

  const handleChangePassword = (e: React.FormEvent) => {
    e.preventDefault();
    setProfileMessage("");

    if (!passwordCurrent || !passwordNew || !passwordConfirm) {
      setProfileMessage("Please fill out all credentials input fields.");
      return;
    }

    if (passwordNew !== passwordConfirm) {
      setProfileMessage("Security password overrides do not align.");
      return;
    }

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
      setProfileMessage("Current password doesn't match secure ledger.");
      return;
    }

    setRegisteredUsers(updated);
    setPasswordCurrent("");
    setPasswordNew("");
    setPasswordConfirm("");
    setProfileMessage("System administrator security password overridden successfully!");
  };

  // Add student/faculty logic
  const handleCreateUserSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setUserActionMessage("");

    const name = newUserName.trim();
    const email = newUserEmail.trim();
    const phone = newUserPhone.trim();
    const password = newUserPassword.trim();

    if (!name || !email || !password) {
      setUserActionMessage("Name, Email, and Password are required credentials.");
      return;
    }

    const exists = registeredUsers.some(u => u.email.toLowerCase() === email.toLowerCase());
    if (exists) {
      setUserActionMessage("This Email ID is already registered in our systems ledger.");
      return;
    }

    const newUser: RegisteredUser = {
      name,
      email,
      phone,
      password,
      role: newUserRole
    };

    setRegisteredUsers(prev => [...prev, newUser]);
    setUserActionMessage(`Successfully created credentials for ${newUserRole} "${name}" (${email})!`);

    // Reset inputs
    setNewUserName("");
    setNewUserEmail("");
    setNewUserPhone("");
    setNewUserPassword("");
  };

  // Delete user logic
  const handleDeleteUser = (email: string) => {
    if (email.toLowerCase() === user.email.toLowerCase()) {
      alert("Cannot self-destruct active administrator account!");
      return;
    }
    setRegisteredUsers(prev => prev.filter(u => u.email.toLowerCase() !== email.toLowerCase()));
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
              <span className="text-[8px] text-white/30 uppercase tracking-widest font-mono">Operations Console</span>
            </div>
          </Link>

          {/* Navigation links */}
          <nav className="space-y-1.5 text-xs text-left">
            <Link 
              to="/admin/dashboard" 
              className={`flex items-center gap-3 px-4 py-3 rounded-xl transition-colors font-semibold ${
                activeTab === "dashboard" ? "bg-emerald-500/10 text-emerald-400 border border-emerald-500/20" : "text-white/60 hover:bg-white/5 hover:text-white"
              }`}
            >
              <Terminal className="w-4 h-4" /> Systems Control
            </Link>

            <Link 
              to="/admin/students" 
              className={`flex items-center gap-3 px-4 py-3 rounded-xl transition-colors font-semibold ${
                activeTab === "students" ? "bg-emerald-500/10 text-emerald-400 border border-emerald-500/20" : "text-white/60 hover:bg-white/5 hover:text-white"
              }`}
            >
              <Users className="w-4 h-4" /> Student Registry
            </Link>

            <Link 
              to="/admin/faculty" 
              className={`flex items-center gap-3 px-4 py-3 rounded-xl transition-colors font-semibold ${
                activeTab === "faculty" ? "bg-emerald-500/10 text-emerald-400 border border-emerald-500/20" : "text-white/60 hover:bg-white/5 hover:text-white"
              }`}
            >
              <Award className="w-4 h-4" /> Faculty Registry
            </Link>

            <Link 
              to="/admin/exams" 
              className={`flex items-center gap-3 px-4 py-3 rounded-xl transition-colors font-semibold ${
                activeTab === "exams" ? "bg-emerald-500/10 text-emerald-400 border border-emerald-500/20" : "text-white/60 hover:bg-white/5 hover:text-white"
              }`}
            >
              <Database className="w-4 h-4" /> Subject Matrices
            </Link>

            <Link 
              to="/admin/reports" 
              className={`flex items-center gap-3 px-4 py-3 rounded-xl transition-colors font-semibold ${
                activeTab === "reports" ? "bg-emerald-500/10 text-emerald-400 border border-emerald-500/20" : "text-white/60 hover:bg-white/5 hover:text-white"
              }`}
            >
              <AlertTriangle className="w-4 h-4" /> AI Proctor Logs
            </Link>

            <Link 
              to="/admin/settings" 
              className={`flex items-center gap-3 px-4 py-3 rounded-xl transition-colors font-semibold ${
                activeTab === "settings" ? "bg-emerald-500/10 text-emerald-400 border border-emerald-500/20" : "text-white/60 hover:bg-white/5 hover:text-white"
              }`}
            >
              <Sliders className="w-4 h-4" /> System Overrides
            </Link>

            <Link 
              to="/admin/profile" 
              className={`flex items-center gap-3 px-4 py-3 rounded-xl transition-colors font-semibold ${
                activeTab === "profile" ? "bg-emerald-500/10 text-emerald-400 border border-emerald-500/20" : "text-white/60 hover:bg-white/5 hover:text-white"
              }`}
            >
              <User className="w-4 h-4" /> Admin Profile
            </Link>
          </nav>

        </div>

        {/* User Info / Logout */}
        <div className="border-t border-white/5 pt-6 text-left space-y-4">
          <div className="flex items-center gap-3">
            <img 
              src={profilePhoto} 
              alt="Admin Avatar" 
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
            <LogOut className="w-3.5 h-3.5" /> Purge Auth Tokens
          </button>
        </div>
      </aside>

      {/* MAIN WORKSPACE CONTENT */}
      <main className="flex-1 overflow-y-auto p-6 md:p-10">
        
        {/* MOBILE NAVIGATION BAR */}
        <div className="md:hidden flex justify-between items-center mb-8 border-b border-white/5 pb-4 font-space text-xs">
          <div className="flex items-center gap-3">
            <div className="w-7 h-7 border border-white/10 rounded-lg flex items-center justify-center bg-white/5">
              <Shield className="w-3.5 h-3.5 text-emerald-400" />
            </div>
            <span className="font-bold uppercase text-white">ProctorAI</span>
          </div>

          <div className="flex items-center gap-2">
            <Link to="/admin/dashboard" className="text-white/60 hover:text-white">Console</Link>
            <Link to="/admin/students" className="text-white/60 hover:text-white">Students</Link>
            <Link to="/admin/reports" className="text-white/60 hover:text-white">AI Logs</Link>
            <button onClick={onLogout} className="text-red-400">Logout</button>
          </div>
        </div>

        <Routes>
          {/* SUBPATH 1: Admin Dashboard (Overview) */}
          <Route path="/" element={
            <div className="space-y-8 text-left animate-fadeIn">
              <div>
                <span className="font-space text-[10px] text-emerald-400 uppercase tracking-widest font-bold">Systems Root Console</span>
                <h2 className="font-serif text-3xl md:text-4xl font-bold mt-1">Operational Overview</h2>
                <p className="text-white/50 text-xs md:text-sm font-light mt-1.5 max-w-xl">
                  Centralized systems control. Monitor client-side telemetry streams, assign institutional roles, audit security parameters, or purge system cache logs.
                </p>
              </div>

              {/* Stats Grid */}
              <div className="grid grid-cols-2 lg:grid-cols-4 gap-6 font-space">
                <div className="bg-[#070707] border border-white/5 rounded-2xl p-6">
                  <span className="text-[10px] text-white/45 uppercase font-mono block">Registered Students</span>
                  <span className="block text-3xl font-serif font-bold text-white mt-2">{registeredUsers.filter(u => u.role === "student").length}</span>
                </div>
                <div className="bg-[#070707] border border-white/5 rounded-2xl p-6">
                  <span className="text-[10px] text-white/45 uppercase font-mono block">Faculty Staff</span>
                  <span className="block text-3xl font-serif font-bold text-emerald-400 mt-2">{registeredUsers.filter(u => u.role === "faculty").length}</span>
                </div>
                <div className="bg-[#070707] border border-white/5 rounded-2xl p-6">
                  <span className="text-[10px] text-white/45 uppercase font-mono block">Total Systems Administrators</span>
                  <span className="block text-3xl font-serif font-bold text-white mt-2">{registeredUsers.filter(u => u.role === "admin").length}</span>
                </div>
                <div className="bg-[#070707] border border-white/5 rounded-2xl p-6">
                  <span className="text-[10px] text-white/45 uppercase font-mono block">Vision Alerts Purged</span>
                  <span className="block text-3xl font-serif font-bold text-emerald-400 mt-2">{logs.length}</span>
                </div>
              </div>

              {/* Log stream widget */}
              <div className="bg-[#070707] border border-white/10 rounded-2xl p-6 space-y-4">
                <div className="flex justify-between items-center border-b border-white/5 pb-3">
                  <span className="font-space text-[10px] uppercase tracking-widest text-emerald-400 font-bold">AI Computer Vision Incident Feed</span>
                  <button 
                    onClick={() => setLogs([])}
                    className="text-[9px] font-mono text-red-400 hover:text-red-300 uppercase cursor-pointer hover:underline"
                  >
                    Clear Feed
                  </button>
                </div>

                <div className="h-48 overflow-y-auto space-y-2 font-mono text-[10px] leading-relaxed text-white/60 pr-1">
                  {logs.length === 0 ? (
                    <span className="text-white/30 italic block pt-8 text-center">[No biometric anomalies active on systems buffer]</span>
                  ) : (
                    logs.map((l, idx) => (
                      <div key={idx} className="flex justify-between border-b border-white/[0.02] pb-1.5 gap-4">
                        <span className="text-white/40 shrink-0">[{l.time}]</span>
                        <span className="flex-1 text-left truncate text-white/80">{l.event}</span>
                        <span className={`shrink-0 font-bold uppercase ${l.level === "HIGH" ? "text-red-400" : l.level === "MED" ? "text-amber-400" : "text-emerald-400"}`}>{l.level}</span>
                      </div>
                    ))
                  )}
                </div>
              </div>
            </div>
          } />

          {/* SUBPATH 2: Students registry management */}
          <Route path="/students" element={
            <div className="space-y-8 text-left animate-fadeIn">
              <div>
                <span className="font-space text-[10px] text-emerald-400 uppercase tracking-widest font-bold font-bold">Systems Student Database</span>
                <h2 className="font-serif text-3xl font-bold mt-1">Manage Student Registrations</h2>
                <p className="text-white/50 text-xs md:text-sm font-light mt-1.5 max-w-xl">
                  Review student logs, provision customized logins, delete stale credentials, or override accounts below.
                </p>
              </div>

              {userActionMessage && (
                <div className="p-4 bg-emerald-500/10 border border-emerald-500/20 text-emerald-400 text-xs rounded-xl font-light">
                  {userActionMessage}
                </div>
              )}

              <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-start">
                
                {/* List students */}
                <div className="lg:col-span-7 space-y-3 font-space">
                  <h3 className="font-serif text-lg font-bold text-white mb-2">Registered Candidates</h3>
                  {registeredUsers.filter(u => u.role === "student").map((std, idx) => (
                    <div key={idx} className="bg-[#070707] border border-white/5 rounded-xl p-4 flex items-center justify-between gap-4 text-xs">
                      <div className="space-y-0.5 text-left">
                        <span className="block font-bold text-white">{std.name}</span>
                        <span className="block text-[10px] text-white/40 font-mono">{std.email}</span>
                        {std.phone && <span className="block text-[9px] text-white/30 font-mono">{std.phone}</span>}
                      </div>

                      <button 
                        onClick={() => handleDeleteUser(std.email)}
                        className="p-2 bg-red-500/5 hover:bg-red-500/10 border border-red-500/10 hover:border-red-500/20 text-red-400 rounded-lg transition-all cursor-pointer shrink-0"
                        title="Delete candidate login"
                      >
                        <Trash2 className="w-4 h-4" />
                      </button>
                    </div>
                  ))}
                </div>

                {/* Create student credentials */}
                <div className="lg:col-span-5 bg-[#070707] border border-white/5 rounded-2xl p-6">
                  <h3 className="font-serif text-lg font-bold text-white mb-5">Provision New Candidate</h3>
                  <form onSubmit={(e) => { setNewUserRole("student"); handleCreateUserSubmit(e); }} className="space-y-4 font-space text-xs">
                    <div className="space-y-1.5 text-left">
                      <label className="text-white/55 font-bold uppercase">Full Name</label>
                      <input 
                        type="text"
                        required
                        value={newUserName}
                        onChange={(e) => setNewUserName(e.target.value)}
                        placeholder="e.g. Abhishek K"
                        className="w-full bg-white/5 border border-white/10 rounded-xl px-4 py-3 text-white focus:outline-none"
                      />
                    </div>

                    <div className="space-y-1.5 text-left">
                      <label className="text-white/55 font-bold uppercase">Email ID</label>
                      <input 
                        type="email"
                        required
                        value={newUserEmail}
                        onChange={(e) => setNewUserEmail(e.target.value)}
                        placeholder="e.g. abhishek@ssit.edu"
                        className="w-full bg-white/5 border border-white/10 rounded-xl px-4 py-3 text-white focus:outline-none"
                      />
                    </div>

                    <div className="space-y-1.5 text-left">
                      <label className="text-white/55 font-bold uppercase">Phone Contact</label>
                      <input 
                        type="tel"
                        value={newUserPhone}
                        onChange={(e) => setNewUserPhone(e.target.value)}
                        placeholder="e.g. +91 95412 10101"
                        className="w-full bg-white/5 border border-white/10 rounded-xl px-4 py-3 text-white focus:outline-none"
                      />
                    </div>

                    <div className="space-y-1.5 text-left">
                      <label className="text-white/55 font-bold uppercase">Authorized Access Password</label>
                      <input 
                        type="password"
                        required
                        value={newUserPassword}
                        onChange={(e) => setNewUserPassword(e.target.value)}
                        placeholder="••••••••"
                        className="w-full bg-white/5 border border-white/10 rounded-xl px-4 py-3 text-white focus:outline-none"
                      />
                    </div>

                    <button 
                      type="submit"
                      className="w-full py-3.5 bg-emerald-500 hover:bg-emerald-400 text-black font-semibold uppercase tracking-wider rounded-xl transition-all cursor-pointer active:scale-95"
                    >
                      Deploy Candidate Login
                    </button>
                  </form>
                </div>

              </div>
            </div>
          } />

          {/* SUBPATH 3: Faculty registry management */}
          <Route path="/faculty" element={
            <div className="space-y-8 text-left animate-fadeIn">
              <div>
                <span className="font-space text-[10px] text-emerald-400 uppercase tracking-widest font-bold">Systems Faculty Database</span>
                <h2 className="font-serif text-3xl font-bold mt-1">Manage Faculty Registrations</h2>
                <p className="text-white/50 text-xs md:text-sm font-light mt-1.5 max-w-xl">
                  Provision new professor accounts, authorize administrative grading keys, or delete credentials.
                </p>
              </div>

              {userActionMessage && (
                <div className="p-4 bg-emerald-500/10 border border-emerald-500/20 text-emerald-400 text-xs rounded-xl font-light">
                  {userActionMessage}
                </div>
              )}

              <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-start">
                
                {/* List faculty */}
                <div className="lg:col-span-7 space-y-3 font-space">
                  <h3 className="font-serif text-lg font-bold text-white mb-2">Authorized Instructors</h3>
                  {registeredUsers.filter(u => u.role === "faculty").map((fac, idx) => (
                    <div key={idx} className="bg-[#070707] border border-white/5 rounded-xl p-4 flex items-center justify-between gap-4 text-xs">
                      <div className="space-y-0.5 text-left">
                        <span className="block font-bold text-white">Prof. {fac.name}</span>
                        <span className="block text-[10px] text-white/40 font-mono">{fac.email}</span>
                        {fac.phone && <span className="block text-[9px] text-white/30 font-mono">{fac.phone}</span>}
                      </div>

                      <button 
                        onClick={() => handleDeleteUser(fac.email)}
                        className="p-2 bg-red-500/5 hover:bg-red-500/10 border border-red-500/10 hover:border-red-500/20 text-red-400 rounded-lg transition-all cursor-pointer shrink-0"
                        title="De-authorize professor credential"
                      >
                        <Trash2 className="w-4 h-4" />
                      </button>
                    </div>
                  ))}
                </div>

                {/* Create faculty credentials */}
                <div className="lg:col-span-5 bg-[#070707] border border-white/5 rounded-2xl p-6">
                  <h3 className="font-serif text-lg font-bold text-white mb-5">Provision New Instructor</h3>
                  <form onSubmit={(e) => { setNewUserRole("faculty"); handleCreateUserSubmit(e); }} className="space-y-4 font-space text-xs">
                    <div className="space-y-1.5 text-left">
                      <label className="text-white/55 font-bold uppercase">Professor Name</label>
                      <input 
                        type="text"
                        required
                        value={newUserName}
                        onChange={(e) => setNewUserName(e.target.value)}
                        placeholder="e.g. Prof. Ramanathan"
                        className="w-full bg-white/5 border border-white/10 rounded-xl px-4 py-3 text-white focus:outline-none"
                      />
                    </div>

                    <div className="space-y-1.5 text-left">
                      <label className="text-white/55 font-bold uppercase">Email ID</label>
                      <input 
                        type="email"
                        required
                        value={newUserEmail}
                        onChange={(e) => setNewUserEmail(e.target.value)}
                        placeholder="e.g. raman@ssit.edu"
                        className="w-full bg-white/5 border border-white/10 rounded-xl px-4 py-3 text-white focus:outline-none"
                      />
                    </div>

                    <div className="space-y-1.5 text-left">
                      <label className="text-white/55 font-bold uppercase">Phone Contact</label>
                      <input 
                        type="tel"
                        value={newUserPhone}
                        onChange={(e) => setNewUserPhone(e.target.value)}
                        placeholder="e.g. +91 98452 10101"
                        className="w-full bg-white/5 border border-white/10 rounded-xl px-4 py-3 text-white focus:outline-none"
                      />
                    </div>

                    <div className="space-y-1.5 text-left">
                      <label className="text-white/55 font-bold uppercase">Authorized Access Password</label>
                      <input 
                        type="password"
                        required
                        value={newUserPassword}
                        onChange={(e) => setNewUserPassword(e.target.value)}
                        placeholder="••••••••"
                        className="w-full bg-white/5 border border-white/10 rounded-xl px-4 py-3 text-white focus:outline-none"
                      />
                    </div>

                    <button 
                      type="submit"
                      className="w-full py-3.5 bg-emerald-500 hover:bg-emerald-400 text-black font-semibold uppercase tracking-wider rounded-xl transition-all cursor-pointer active:scale-95"
                    >
                      Deploy Faculty Login
                    </button>
                  </form>
                </div>

              </div>
            </div>
          } />

          {/* SUBPATH 4: Subject Matrices */}
          <Route path="/exams" element={
            <div className="space-y-8 text-left animate-fadeIn">
              <div>
                <span className="font-space text-[10px] text-emerald-400 uppercase tracking-widest font-bold">Systems Syllabus Database</span>
                <h2 className="font-serif text-3xl font-bold mt-1">Manage Subject Syllabus Matrices</h2>
                <p className="text-white/50 text-xs md:text-sm font-light mt-1.5 max-w-xl">
                  Overview of current subject registers and randomized exam modules.
                </p>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 font-space">
                {[
                  { name: "Data Structures & Algorithms", code: "DSA-301", pool: "40 Questions Pool", author: "Systems Admin" },
                  { name: "Database Management Systems", code: "DBMS-302", pool: "40 Questions Pool", author: "Systems Admin" },
                  { name: "Operating Systems", code: "OS-303", pool: "40 Questions Pool", author: "Systems Admin" },
                  { name: "Computer Networks", code: "CN-304", pool: "40 Questions Pool", author: "Systems Admin" },
                  { name: "Aptitude & Quantitative Reasoning", code: "APT-305", pool: "40 Questions Pool", author: "Systems Admin" }
                ].map((sub, idx) => (
                  <div key={idx} className="bg-[#070707] border border-white/5 rounded-2xl p-5 space-y-4">
                    <div className="flex justify-between items-start">
                      <span className="text-[8px] font-mono font-bold text-emerald-400 bg-emerald-500/10 border border-emerald-500/20 px-2 py-0.5 rounded uppercase">
                        {sub.code}
                      </span>
                      <span className="text-white/30 text-[9px] font-mono">{sub.pool}</span>
                    </div>

                    <div>
                      <h4 className="font-serif text-sm font-bold text-white leading-snug">{sub.name}</h4>
                      <span className="block text-[8px] text-white/40 uppercase mt-1 font-mono">Assigned Author: {sub.author}</span>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          } />

          {/* SUBPATH 5: AI Proctor Logs */}
          <Route path="/reports" element={
            <div className="space-y-8 text-left animate-fadeIn">
              <div>
                <span className="font-space text-[10px] text-emerald-400 uppercase tracking-widest font-bold font-bold">Anomalous Telemetry Node</span>
                <h2 className="font-serif text-3xl font-bold mt-1">AI Proctor logs & events</h2>
                <p className="text-white/50 text-xs md:text-sm font-light mt-1.5 max-w-xl">
                  Chronological event log buffer collected from candidate sandboxes. Use this stream to audit anomalous student behaviors.
                </p>
              </div>

              <div className="bg-[#070707] border border-white/5 rounded-2xl p-6 space-y-4 font-mono text-[11px]">
                <div className="flex justify-between items-center border-b border-white/5 pb-3">
                  <span className="text-xs font-bold text-white uppercase tracking-wider font-space">Biometric Security Ledger Feed</span>
                  <button 
                    onClick={() => setLogs([])}
                    className="text-red-400 text-[10px] font-space uppercase hover:underline"
                  >
                    Purge System Cache
                  </button>
                </div>

                <div className="space-y-2 max-h-96 overflow-y-auto pr-1">
                  {logs.length === 0 ? (
                    <span className="text-white/35 italic block text-center pt-16 font-space">[LEDGER EXAM BUFFER PURGED AND STABILIZED]</span>
                  ) : (
                    logs.map((l, idx) => (
                      <div key={idx} className="border-b border-white/[0.02] pb-2 flex flex-col sm:flex-row justify-between sm:items-center gap-1">
                        <div className="space-y-0.5">
                          <span className="text-white/35">[{l.time}]</span>
                          <span className="text-emerald-400 font-bold ml-2">[{l.ref}]</span>
                          <span className="text-white/95 ml-2">{l.event}</span>
                        </div>
                        <div className="flex gap-3 items-center">
                          <span className="text-white/30 text-[9px]">Model: {l.model}</span>
                          <span className={`font-bold text-[9px] px-1.5 py-0.5 rounded uppercase ${
                            l.level === "HIGH" ? "bg-red-500/10 text-red-400" : l.level === "MED" ? "bg-amber-500/10 text-amber-400" : "bg-emerald-500/10 text-emerald-400"
                          }`}>{l.level}</span>
                        </div>
                      </div>
                    ))
                  )}
                </div>
              </div>

              {/* Real-Time Assessment Results Ledger & Resend Hub */}
              <div className="bg-[#070707] border border-white/10 rounded-2xl p-6 text-xs text-left space-y-6">
                <div>
                  <span className="font-space text-[10px] uppercase tracking-widest text-emerald-400 font-bold block">Secure Assessment Results Ledger</span>
                  <h3 className="font-serif text-xl font-bold mt-1 text-white">Submitted Exam Reports</h3>
                  <p className="text-white/50 text-[11px] font-light mt-1">
                    Synchronized with the blockchain ledger. Click "Resend Email" to manually dispatch secure certificates or custom overrides.
                  </p>
                </div>

                {results.length === 0 ? (
                  <div className="text-center py-12 border border-dashed border-white/5 rounded-xl">
                    <span className="text-white/30 italic block font-space">[No exam submissions registered in this cycle]</span>
                  </div>
                ) : (
                  <div className="overflow-x-auto">
                    <table className="w-full text-left border-collapse font-space">
                      <thead>
                        <tr className="border-b border-white/10 text-white/40 text-[9px] uppercase tracking-wider">
                          <th className="py-3 px-4 font-bold">Student Name</th>
                          <th className="py-3 px-4 font-bold">Subject</th>
                          <th className="py-3 px-4 font-bold text-center">Score</th>
                          <th className="py-3 px-4 font-bold text-center">Integrity Index</th>
                          <th className="py-3 px-4 font-bold">Auto Email Dispatch</th>
                          <th className="py-3 px-4 font-bold text-right">Actions</th>
                        </tr>
                      </thead>
                      <tbody className="divide-y divide-white/5">
                        {results.map((res: any) => (
                          <tr key={res.id} className="hover:bg-white/[0.01] transition-colors">
                            <td className="py-3.5 px-4">
                              <span className="block font-bold text-white text-xs">{res.studentName}</span>
                              <span className="block text-[10px] text-white/40 font-mono mt-0.5">{res.studentEmail}</span>
                            </td>
                            <td className="py-3.5 px-4 font-mono text-[11px] text-white/80">{res.subject}</td>
                            <td className="py-3.5 px-4 text-center">
                              <span className="font-bold text-emerald-400 font-mono text-xs">{res.score} / {res.total}</span>
                            </td>
                            <td className="py-3.5 px-4 text-center">
                              <span className={`font-mono text-xs font-bold ${res.integrityScore >= 80 ? 'text-emerald-400' : 'text-amber-400'}`}>
                                {res.integrityScore}%
                              </span>
                            </td>
                            <td className="py-3.5 px-4">
                              {res.email_sent ? (
                                <div className="space-y-0.5">
                                  <span className="inline-flex items-center text-emerald-400 font-bold text-[10px] uppercase">
                                    ✓ Dispatched
                                  </span>
                                  <span className="block text-[8px] text-white/30 font-mono">
                                    {new Date(res.email_sent_at).toLocaleString()}
                                  </span>
                                </div>
                              ) : (
                                <span className="inline-flex items-center text-red-400 font-bold text-[10px] uppercase">
                                  ✗ Failed / Pending
                                </span>
                              )}
                            </td>
                            <td className="py-3.5 px-4 text-right">
                              <button
                                onClick={() => {
                                  setActiveResendResult(res);
                                  setResendOverride(res.studentEmail);
                                  setResendStatusMsg("");
                                }}
                                className="px-3 py-1.5 bg-emerald-500 hover:bg-emerald-400 text-black text-[10px] font-bold uppercase rounded-md tracking-wider transition-all"
                              >
                                Resend Email
                              </button>
                            </td>
                          </tr>
                        ))}
                      </tbody>
                    </table>
                  </div>
                )}
              </div>

              {/* Email Audit Log Trails */}
              <div className="bg-[#070707] border border-white/10 rounded-2xl p-6 text-xs text-left space-y-4">
                <div>
                  <span className="font-space text-[10px] uppercase tracking-widest text-emerald-400 font-bold block">Transactional Audit Stream</span>
                  <h3 className="font-serif text-lg font-bold mt-1 text-white">Manual & System Email Dispatch Log</h3>
                </div>

                <div className="space-y-2 max-h-48 overflow-y-auto font-mono text-[10px] pr-2">
                  {emailLogs.length === 0 ? (
                    <span className="text-white/30 italic block text-center py-6 font-space">[No resends logged in this session]</span>
                  ) : (
                    emailLogs.map((log: any) => (
                      <div key={log.id} className="border-b border-white/[0.02] pb-2 flex flex-col sm:flex-row justify-between sm:items-center gap-1">
                        <div>
                          <span className="text-white/35">[{new Date(log.sentAt).toLocaleTimeString()}]</span>
                          <span className="text-emerald-400 font-bold ml-2">Result ID: {log.resultId.slice(0, 10)}</span>
                          <span className="text-white/80 ml-2">Target: {log.targetEmail}</span>
                        </div>
                        <div className="flex gap-3 items-center">
                          <span className="text-white/30 text-[9px]">Sender: {log.sentByUserId}</span>
                          <span className={`font-bold px-1 py-0.5 rounded uppercase ${
                            log.status === "sent" ? "bg-emerald-500/10 text-emerald-400" : "bg-red-500/10 text-red-400"
                          }`}>{log.status}</span>
                        </div>
                      </div>
                    ))
                  )}
                </div>
              </div>

              {/* Custom Overrides Manual Resend Modal Overlay */}
              {activeResendResult && (
                <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-sm">
                  <div className="w-full max-w-md bg-[#0D0D0D] border border-white/15 rounded-2xl p-6 space-y-4 font-space text-xs">
                    <div className="flex justify-between items-center border-b border-white/10 pb-3">
                      <div>
                        <h3 className="font-serif text-base font-bold text-white">Manual Report Override</h3>
                        <p className="text-[10px] text-white/40 mt-0.5">Subject: {activeResendResult.subject}</p>
                      </div>
                      <button
                        onClick={() => setActiveResendResult(null)}
                        className="p-1.5 bg-white/5 hover:bg-white/10 rounded-full text-white/50 hover:text-white transition-colors"
                      >
                        <AlertTriangle className="w-4 h-4" />
                      </button>
                    </div>

                    <div className="space-y-4">
                      <div className="space-y-1.5">
                        <label className="text-white/60 block font-bold">Candidate</label>
                        <div className="bg-white/5 rounded-xl px-4 py-3 text-white/90">
                          {activeResendResult.studentName} ({activeResendResult.studentEmail})
                        </div>
                      </div>

                      <div className="space-y-1.5">
                        <label className="text-white/60 block font-bold">Target Email Address (Custom Override)</label>
                        <input
                          type="email"
                          value={resendOverride}
                          onChange={(e) => setResendOverride(e.target.value)}
                          placeholder="e.g. dean@ssit.edu (leave default if unchanged)"
                          className="w-full bg-white/5 border border-white/10 rounded-xl px-4 py-3 text-white focus:outline-none focus:border-emerald-500"
                        />
                        <span className="block text-[8px] text-white/30">
                          Input a custom override address to bypass candidate email parameters (for auditing/records).
                        </span>
                      </div>

                      {resendStatusMsg && (
                        <div className={`p-3 rounded-lg text-[11px] font-bold ${
                          resendStatusMsg.includes("✓") ? "bg-emerald-500/10 text-emerald-400" : "bg-red-500/10 text-red-400"
                        }`}>
                          {resendStatusMsg}
                        </div>
                      )}

                      <div className="flex gap-3 pt-2">
                        <button
                          onClick={() => setActiveResendResult(null)}
                          className="flex-1 py-3 bg-white/5 hover:bg-white/10 border border-white/5 text-white font-bold uppercase rounded-xl transition-all"
                        >
                          Cancel
                        </button>
                        <button
                          onClick={() => handleTriggerManualResend(activeResendResult.id)}
                          disabled={resendingId !== null}
                          className="flex-1 py-3 bg-emerald-500 hover:bg-emerald-400 text-black font-bold uppercase rounded-xl transition-all disabled:opacity-50"
                        >
                          {resendingId ? "Sending..." : "Dispatch Email"}
                        </button>
                      </div>
                    </div>
                  </div>
                </div>
              )}
            </div>
          } />

          {/* SUBPATH 6: System Settings & overrides */}
          <Route path="/settings" element={
            <div className="space-y-8 text-left animate-fadeIn">
              <div>
                <span className="font-space text-[10px] text-emerald-400 uppercase tracking-widest font-bold">Systems Infrastructure Overrides</span>
                <h2 className="font-serif text-3xl font-bold mt-1">Systems Config & Parameters</h2>
                <p className="text-white/50 text-xs md:text-sm font-light mt-1.5 max-w-xl">
                  Configure vision detection margins, set automatic test termination thresholds, or adjust SMTP email relay parameters.
                </p>
              </div>

              <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-start">
                
                {/* Vision Thresholds */}
                <div className="lg:col-span-6 bg-[#070707] border border-white/5 rounded-2xl p-6 space-y-5">
                  <h3 className="font-serif text-lg font-bold text-white border-b border-white/5 pb-3">AI Vision Parameters</h3>
                  
                  <div className="space-y-4 font-space text-xs">
                    <div className="space-y-1.5">
                      <label className="text-white/55 block">Max Allowed Lookaway Events (before score penalty)</label>
                      <input 
                        type="number"
                        value={lookawayThreshold}
                        onChange={(e) => setLookawayThreshold(e.target.value)}
                        className="w-full bg-white/5 border border-white/10 rounded-xl px-4 py-3 text-white focus:outline-none focus:border-emerald-500"
                      />
                    </div>

                    <div className="space-y-1.5">
                      <label className="text-white/55 block">Max Allowed Mobile Device Detection Warnings</label>
                      <input 
                        type="number"
                        value={phoneThreshold}
                        onChange={(e) => setPhoneThreshold(e.target.value)}
                        className="w-full bg-white/5 border border-white/10 rounded-xl px-4 py-3 text-white focus:outline-none focus:border-emerald-500"
                      />
                    </div>

                    <div className="space-y-1.5">
                      <label className="text-white/55 block">Max Tab Blur Limits (automatic session lock)</label>
                      <input 
                        type="number"
                        value={tabBlurThreshold}
                        onChange={(e) => setTabBlurThreshold(e.target.value)}
                        className="w-full bg-white/5 border border-white/10 rounded-xl px-4 py-3 text-white focus:outline-none focus:border-emerald-500"
                      />
                    </div>

                    <button 
                      onClick={() => alert("Vision thresholds updated in local state.")}
                      className="w-full py-3 bg-emerald-500 hover:bg-emerald-400 text-black font-semibold uppercase tracking-wider rounded-xl transition-all cursor-pointer"
                    >
                      Save vision settings
                    </button>
                  </div>
                </div>

                {/* SMTP SMTP Settings */}
                <div className="lg:col-span-6 bg-[#070707] border border-white/5 rounded-2xl p-6 space-y-5">
                  <h3 className="font-serif text-lg font-bold text-white border-b border-white/5 pb-3">SMTP Mail Relay Parameters</h3>
                  
                  <div className="space-y-4 font-space text-xs">
                    <div className="space-y-1.5">
                      <label className="text-white/55 block">SMTP Relay Server Endpoint</label>
                      <input 
                        type="text"
                        value={smtpServer}
                        onChange={(e) => setSmtpServer(e.target.value)}
                        className="w-full bg-white/5 border border-white/10 rounded-xl px-4 py-3 text-white focus:outline-none focus:border-emerald-500"
                      />
                    </div>

                    <div className="space-y-1.5">
                      <label className="text-white/55 block">SMTP Transport TLS Port</label>
                      <input 
                        type="text"
                        value={smtpPort}
                        onChange={(e) => setSmtpPort(e.target.value)}
                        className="w-full bg-white/5 border border-white/10 rounded-xl px-4 py-3 text-white focus:outline-none focus:border-emerald-500"
                      />
                    </div>

                    <div className="space-y-1.5">
                      <label className="text-white/55 block">SMTP Authorized Sender Address</label>
                      <input 
                        type="email"
                        value={smtpSender}
                        onChange={(e) => setSmtpSender(e.target.value)}
                        className="w-full bg-white/5 border border-white/10 rounded-xl px-4 py-3 text-white focus:outline-none focus:border-emerald-500"
                      />
                    </div>

                    <button 
                      onClick={() => alert("SMTP relay credentials updated.")}
                      className="w-full py-3 bg-emerald-500 hover:bg-emerald-400 text-black font-semibold uppercase tracking-wider rounded-xl transition-all cursor-pointer"
                    >
                      Commit Mail Parameters
                    </button>
                  </div>
                </div>

              </div>
            </div>
          } />

          {/* SUBPATH 7: Admin Profile details */}
          <Route path="/profile" element={
            <div className="space-y-8 text-left animate-fadeIn">
              <div>
                <span className="font-space text-[10px] text-emerald-400 uppercase tracking-widest font-bold">Admin Specifications</span>
                <h2 className="font-serif text-3xl font-bold mt-1">Administrator Profile Specifications</h2>
                <p className="text-white/50 text-xs md:text-sm font-light mt-1.5 max-w-xl">
                  Inspect or overwrite administrator details.
                </p>
              </div>

              {profileMessage && (
                <div className="p-4 bg-emerald-500/10 border border-emerald-500/20 text-emerald-400 text-xs rounded-xl font-light">
                  {profileMessage}
                </div>
              )}

              <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-start">
                
                {/* Photo */}
                <div className="lg:col-span-4 bg-[#070707] border border-white/5 rounded-2xl p-6 text-center space-y-4">
                  <span className="font-space text-[9px] uppercase tracking-widest text-[#EBEBEB]/40 font-bold block">Digital Security Root Key Avatar</span>
                  
                  <div className="relative mx-auto w-32 h-32 rounded-full border border-white/15 overflow-hidden flex items-center justify-center bg-white/5 group">
                    <img 
                      src={profilePhoto} 
                      alt="Profile Avatar" 
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
                    <span className="text-[10px] text-white/40 font-mono">ID: SECURE-ROOT-SYSTEMS</span>
                  </div>
                </div>

                {/* Forms */}
                <div className="lg:col-span-8 space-y-6 font-space text-xs">
                  
                  {/* General */}
                  <div className="bg-[#070707] border border-white/5 rounded-2xl p-6">
                    <h3 className="font-serif text-lg font-bold text-white mb-6">Administrator Particulars</h3>
                    <form onSubmit={handleUpdateProfile} className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                      <div className="space-y-1.5 text-left">
                        <label className="text-white/55 font-bold uppercase tracking-wider block">Full Name</label>
                        <input 
                          type="text"
                          required
                          value={profileName}
                          onChange={(e) => setProfileName(e.target.value)}
                          className="w-full bg-white/5 border border-white/10 rounded-xl px-4 py-3 text-white focus:outline-none"
                        />
                      </div>

                      <div className="space-y-1.5 text-left">
                        <label className="text-white/55 font-bold uppercase tracking-wider block">Email ID</label>
                        <input 
                          type="email"
                          required
                          value={profileEmail}
                          onChange={(e) => setProfileEmail(e.target.value)}
                          className="w-full bg-white/5 border border-white/10 rounded-xl px-4 py-3 text-white focus:outline-none"
                        />
                      </div>

                      <div className="space-y-1.5 text-left sm:col-span-2">
                        <label className="text-white/55 font-bold uppercase tracking-wider block">Phone Contact</label>
                        <input 
                          type="tel"
                          value={profilePhone}
                          onChange={(e) => setProfilePhone(e.target.value)}
                          className="w-full bg-white/5 border border-white/10 rounded-xl px-4 py-3 text-white focus:outline-none"
                        />
                      </div>

                      <button 
                        type="submit"
                        className="sm:col-span-2 py-3.5 bg-emerald-500 hover:bg-emerald-400 text-black font-semibold uppercase tracking-wider rounded-xl transition-all cursor-pointer mt-2 active:scale-[0.98]"
                      >
                        Secured Update Specifications
                      </button>
                    </form>
                  </div>

                  {/* Passwords */}
                  <div className="bg-[#070707] border border-white/5 rounded-2xl p-6">
                    <h3 className="font-serif text-lg font-bold text-white mb-6">Update root Password</h3>
                    <form onSubmit={handleChangePassword} className="grid grid-cols-1 sm:grid-cols-3 gap-4">
                      <div className="space-y-1.5 text-left">
                        <label className="text-white/55 font-bold uppercase tracking-wider block">Current Password</label>
                        <input 
                          type="password"
                          required
                          value={passwordCurrent}
                          onChange={(e) => setPasswordCurrent(e.target.value)}
                          placeholder="••••••••"
                          className="w-full bg-white/5 border border-white/10 rounded-xl px-4 py-3 text-white focus:outline-none"
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
                          className="w-full bg-white/5 border border-white/10 rounded-xl px-4 py-3 text-white focus:outline-none"
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
                          className="w-full bg-white/5 border border-white/10 rounded-xl px-4 py-3 text-white focus:outline-none"
                        />
                      </div>

                      <button 
                        type="submit"
                        className="sm:col-span-3 py-3.5 bg-emerald-500 hover:bg-emerald-400 text-black font-semibold uppercase tracking-wider rounded-xl transition-all cursor-pointer mt-2 active:scale-[0.98]"
                      >
                        Commit root Credentials
                      </button>
                    </form>
                  </div>

                </div>

              </div>

            </div>
          } />
        </Routes>

      </main>

    </div>
  );
}
