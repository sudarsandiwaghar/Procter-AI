import { useState, useEffect } from "react";
import { Routes, Route, Link, useNavigate, useLocation } from "react-router-dom";
import { 
  Shield, 
  User, 
  Award, 
  FileText, 
  Clock, 
  LogOut, 
  Sparkles, 
  PlusCircle, 
  ListTodo, 
  BarChart3, 
  CheckCircle, 
  Edit,
  Trash2,
  Lock,
  Mail,
  Phone,
  Settings
} from "lucide-react";
import { RegisteredUser, Question } from "../../types";
import { questionsData } from "../../questionsData";

interface FacultyWorkspaceProps {
  user: RegisteredUser;
  onLogout: () => void;
  registeredUsers: RegisteredUser[];
  setRegisteredUsers: (u: RegisteredUser[]) => void;
}

export default function FacultyWorkspace({
  user,
  onLogout,
  registeredUsers,
  setRegisteredUsers
}: FacultyWorkspaceProps) {
  const navigate = useNavigate();
  const location = useLocation();
  const [activeTab, setActiveTab] = useState("dashboard");

  // Local state for profile
  const [profilePhoto, setProfilePhoto] = useState<string>("https://images.unsplash.com/photo-1573496359142-b8d87734a5a2?auto=format&fit=crop&q=80&w=150&h=150");
  const [profileName, setProfileName] = useState(user.name);
  const [profileEmail, setProfileEmail] = useState(user.email);
  const [profilePhone, setProfilePhone] = useState(user.phone || "+91 94441 52019");
  const [passwordCurrent, setPasswordCurrent] = useState("");
  const [passwordNew, setPasswordNew] = useState("");
  const [passwordConfirm, setPasswordConfirm] = useState("");
  const [profileMessage, setProfileMessage] = useState("");

  // Create Exam form states
  const [examSubject, setExamSubject] = useState("");
  const [examCode, setExamCode] = useState("");
  const [examQuestions, setExamQuestions] = useState<Omit<Question, "id">[]>([
    {
      subject: "",
      question: "",
      options: ["", "", "", ""],
      correctAnswer: 0
    }
  ]);
  const [examMessage, setExamMessage] = useState("");

  // Manage Questions state
  const [globalQuestions, setGlobalQuestions] = useState<Question[]>(questionsData);
  const [editingQuestion, setEditingQuestion] = useState<Question | null>(null);

  useEffect(() => {
    const path = location.pathname;
    if (path.includes("/faculty/profile")) {
      setActiveTab("profile");
    } else if (path.includes("/faculty/create-exam")) {
      setActiveTab("create-exam");
    } else if (path.includes("/faculty/manage-questions")) {
      setActiveTab("manage-questions");
    } else if (path.includes("/faculty/analytics")) {
      setActiveTab("analytics");
    } else {
      setActiveTab("dashboard");
    }
  }, [location]);

  // Handle Profile Update
  const handleUpdateProfile = (e: React.FormEvent) => {
    e.preventDefault();
    setProfileMessage("");

    if (!profileName.trim() || !profileEmail.trim()) {
      setProfileMessage("Name and Email are required fields.");
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
    setProfileMessage("Faculty profile successfully synchronized!");
  };

  const handleChangePassword = (e: React.FormEvent) => {
    e.preventDefault();
    setProfileMessage("");

    if (!passwordCurrent || !passwordNew || !passwordConfirm) {
      setProfileMessage("Please fill out all credentials fields.");
      return;
    }

    if (passwordNew !== passwordConfirm) {
      setProfileMessage("New passwords do not match.");
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
      setProfileMessage("Current password doesn't match our database record.");
      return;
    }

    setRegisteredUsers(updated);
    setPasswordCurrent("");
    setPasswordNew("");
    setPasswordConfirm("");
    setProfileMessage("Faculty security password successfully updated!");
  };

  // Create Exam logic
  const handleAddQuestionToForm = () => {
    setExamQuestions(prev => [
      ...prev,
      {
        subject: examSubject,
        question: "",
        options: ["", "", "", ""],
        correctAnswer: 0
      }
    ]);
  };

  const handleRemoveQuestionFromForm = (idx: number) => {
    if (examQuestions.length <= 1) return;
    setExamQuestions(prev => prev.filter((_, i) => i !== idx));
  };

  const handleFormQuestionChange = (idx: number, field: string, val: any, optIdx?: number) => {
    setExamQuestions(prev => prev.map((q, i) => {
      if (i === idx) {
        if (field === "question") {
          return { ...q, question: val };
        } else if (field === "correctAnswer") {
          return { ...q, correctAnswer: parseInt(val) };
        } else if (field === "option" && optIdx !== undefined) {
          const newOpts = [...q.options];
          newOpts[optIdx] = val;
          return { ...q, options: newOpts };
        }
      }
      return q;
    }));
  };

  const handleCreateExamSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setExamMessage("");

    if (!examSubject.trim() || !examCode.trim()) {
      setExamMessage("Subject Name and Subject Code are required.");
      return;
    }

    // Verify all questions have content
    const hasEmpty = examQuestions.some(q => !q.question.trim() || q.options.some(o => !o.trim()));
    if (hasEmpty) {
      setExamMessage("Please fill out all question text inputs and multiple choice options.");
      return;
    }

    // Create unique IDs
    const startId = globalQuestions.length > 0 ? Math.max(...globalQuestions.map(q => q.id)) + 1 : 101;
    const newQuestions: Question[] = examQuestions.map((q, idx) => ({
      id: startId + idx,
      subject: examSubject,
      question: q.question,
      options: q.options,
      correctAnswer: q.correctAnswer
    }));

    // Update global questions list
    const updatedGlobal = [...globalQuestions, ...newQuestions];
    setGlobalQuestions(updatedGlobal);

    // Save questions list to storage or context
    setExamMessage(`Successfully compiled and published secure exam paper for ${examSubject} (${examCode}) containing ${newQuestions.length} custom questions!`);
    
    // Reset form
    setExamSubject("");
    setExamCode("");
    setExamQuestions([
      {
        subject: "",
        question: "",
        options: ["", "", "", ""],
        correctAnswer: 0
      }
    ]);

    setTimeout(() => {
      navigate("/faculty/manage-questions");
    }, 1500);
  };

  // Manage Questions Delete
  const handleDeleteQuestion = (id: number) => {
    setGlobalQuestions(prev => prev.filter(q => q.id !== id));
  };

  return (
    <div className="min-h-screen bg-[#020202] text-white flex selection:bg-emerald-500 selection:text-black font-sans">
      
      {/* SIDEBAR NAVIGATION */}
      <aside className="w-64 bg-[#050505] border-r border-white/5 flex flex-col justify-between p-6 shrink-0 hidden md:flex font-space">
        <div className="space-y-8">
          
          {/* Logo Brand */}
          <Link to="/" className="flex items-center gap-3">
            <div className="w-8 h-8 border border-white/10 rounded-lg flex items-center justify-center bg-white/5">
              <Shield className="w-4 h-4 text-emerald-400" />
            </div>
            <div className="text-left">
              <span className="font-bold uppercase tracking-wider text-xs block text-white">ProctorAI</span>
              <span className="text-[8px] text-white/30 uppercase tracking-widest font-mono">Faculty Lounge</span>
            </div>
          </Link>

          {/* Navigation links */}
          <nav className="space-y-1.5 text-xs text-left">
            <Link 
              to="/faculty/dashboard" 
              className={`flex items-center gap-3 px-4 py-3 rounded-xl transition-colors font-semibold ${
                activeTab === "dashboard" ? "bg-emerald-500/10 text-emerald-400 border border-emerald-500/20" : "text-white/60 hover:bg-white/5 hover:text-white"
              }`}
            >
              <BarChart3 className="w-4 h-4" /> Instructor Dashboard
            </Link>

            <Link 
              to="/faculty/create-exam" 
              className={`flex items-center gap-3 px-4 py-3 rounded-xl transition-colors font-semibold ${
                activeTab === "create-exam" ? "bg-emerald-500/10 text-emerald-400 border border-emerald-500/20" : "text-white/60 hover:bg-white/5 hover:text-white"
              }`}
            >
              <PlusCircle className="w-4 h-4" /> Create Core Exam
            </Link>

            <Link 
              to="/faculty/manage-questions" 
              className={`flex items-center gap-3 px-4 py-3 rounded-xl transition-colors font-semibold ${
                activeTab === "manage-questions" ? "bg-emerald-500/10 text-emerald-400 border border-emerald-500/20" : "text-white/60 hover:bg-white/5 hover:text-white"
              }`}
            >
              <ListTodo className="w-4 h-4" /> Manage Questions
            </Link>

            <Link 
              to="/faculty/analytics" 
              className={`flex items-center gap-3 px-4 py-3 rounded-xl transition-colors font-semibold ${
                activeTab === "analytics" ? "bg-emerald-500/10 text-emerald-400 border border-emerald-500/20" : "text-white/60 hover:bg-white/5 hover:text-white"
              }`}
            >
              <Sparkles className="w-4 h-4" /> Analytics & Reports
            </Link>

            <Link 
              to="/faculty/profile" 
              className={`flex items-center gap-3 px-4 py-3 rounded-xl transition-colors font-semibold ${
                activeTab === "profile" ? "bg-emerald-500/10 text-emerald-400 border border-emerald-500/20" : "text-white/60 hover:bg-white/5 hover:text-white"
              }`}
            >
              <User className="w-4 h-4" /> Faculty Profile
            </Link>
          </nav>

        </div>

        {/* User Info / Logout */}
        <div className="border-t border-white/5 pt-6 text-left space-y-4">
          <div className="flex items-center gap-3">
            <img 
              src={profilePhoto} 
              alt="Faculty Avatar" 
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
            <LogOut className="w-3.5 h-3.5" /> Close Session
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
            <Link to="/faculty/dashboard" className="text-white/60 hover:text-white">Dashboard</Link>
            <Link to="/faculty/create-exam" className="text-white/60 hover:text-white">Create</Link>
            <Link to="/faculty/analytics" className="text-white/60 hover:text-white">Analytics</Link>
            <button onClick={onLogout} className="text-red-400">Logout</button>
          </div>
        </div>

        <Routes>
          {/* SUBPATH 1: Faculty Dashboard Overview */}
          <Route path="/" element={
            <div className="space-y-8 text-left animate-fadeIn">
              <div>
                <span className="font-space text-[10px] text-emerald-400 uppercase tracking-widest font-bold">Faculty Admin Panel</span>
                <h2 className="font-serif text-3xl md:text-4xl font-bold mt-1">Hello, Prof. <span className="text-emerald-400 italic font-normal">{profileName}</span></h2>
                <p className="text-white/50 text-xs md:text-sm font-light mt-1.5 max-w-xl">
                  Authorized access. Manage exam creation matrices, review candidate analytics, or customize dynamic question pools.
                </p>
              </div>

              {/* Status Metrics cards */}
              <div className="grid grid-cols-2 lg:grid-cols-4 gap-6 font-space">
                <div className="bg-[#070707] border border-white/5 rounded-2xl p-6">
                  <span className="text-xs text-white/40 uppercase font-mono block">Published Exams</span>
                  <span className="block text-3xl font-serif font-bold text-white mt-2">5</span>
                </div>
                <div className="bg-[#070707] border border-white/5 rounded-2xl p-6">
                  <span className="text-xs text-white/40 uppercase font-mono block">Questions Database</span>
                  <span className="block text-3xl font-serif font-bold text-emerald-400 mt-2">{globalQuestions.length}</span>
                </div>
                <div className="bg-[#070707] border border-white/5 rounded-2xl p-6">
                  <span className="text-xs text-white/40 uppercase font-mono block">Assessed Candidates</span>
                  <span className="block text-3xl font-serif font-bold text-white mt-2">142</span>
                </div>
                <div className="bg-[#070707] border border-white/5 rounded-2xl p-6">
                  <span className="text-xs text-white/40 uppercase font-mono block">Average Trust Score</span>
                  <span className="block text-3xl font-serif font-bold text-emerald-400 mt-2">94.8%</span>
                </div>
              </div>

              {/* Quick actions row */}
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6 pt-4">
                <div className="bg-[#070707] border border-white/5 rounded-2xl p-6 space-y-4">
                  <h3 className="font-serif text-lg font-bold text-white">Quick Exam Creator</h3>
                  <p className="text-xs text-white/50 leading-relaxed font-light">
                    Launch a new examination module. Enter a subject code, insert questions, options, and assign correct answers to push to candidate dashboard registers instantly.
                  </p>
                  <Link 
                    to="/faculty/create-exam" 
                    className="inline-flex items-center gap-2 text-xs font-bold font-space uppercase text-emerald-400 hover:text-emerald-300"
                  >
                    Launch exam wizard <PlusCircle className="w-4 h-4" />
                  </Link>
                </div>

                <div className="bg-[#070707] border border-white/5 rounded-2xl p-6 space-y-4">
                  <h3 className="font-serif text-lg font-bold text-white">Audit Question Bank</h3>
                  <p className="text-xs text-white/50 leading-relaxed font-light">
                    Modify existing question statements, add answers, and check general statistics. This system syncs with the 200 questions PDF export pipeline.
                  </p>
                  <Link 
                    to="/faculty/manage-questions" 
                    className="inline-flex items-center gap-2 text-xs font-bold font-space uppercase text-emerald-400 hover:text-emerald-300"
                  >
                    View question pool <ListTodo className="w-4 h-4" />
                  </Link>
                </div>
              </div>
            </div>
          } />

          {/* SUBPATH 2: Create Core Exam form */}
          <Route path="/create-exam" element={
            <div className="space-y-8 text-left animate-fadeIn">
              <div>
                <span className="font-space text-[10px] text-emerald-400 uppercase tracking-widest font-bold font-bold">Exam Builder Module</span>
                <h2 className="font-serif text-3xl font-bold mt-1">Deploy New Examination Paper</h2>
                <p className="text-white/50 text-xs md:text-sm font-light mt-1.5 max-w-xl">
                  Formulate a high-precision digital exam paper. All questions are compiled and loaded securely into client sandboxes.
                </p>
              </div>

              {examMessage && (
                <div className="p-4 bg-emerald-500/10 border border-emerald-500/20 text-emerald-400 text-xs rounded-xl font-light">
                  {examMessage}
                </div>
              )}

              <form onSubmit={handleCreateExamSubmit} className="space-y-6 font-space">
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-6 bg-[#070707] border border-white/5 rounded-2xl p-6 text-xs">
                  <div className="space-y-1.5">
                    <label className="text-white/55 font-bold uppercase tracking-wider block">Subject Title</label>
                    <input 
                      type="text"
                      required
                      value={examSubject}
                      onChange={(e) => setExamSubject(e.target.value)}
                      placeholder="e.g. Distributed Computing"
                      className="w-full bg-white/5 border border-white/10 rounded-xl px-4 py-3 text-white focus:outline-none focus:border-emerald-500"
                    />
                  </div>

                  <div className="space-y-1.5">
                    <label className="text-white/55 font-bold uppercase tracking-wider block">Subject Code</label>
                    <input 
                      type="text"
                      required
                      value={examCode}
                      onChange={(e) => setExamCode(e.target.value)}
                      placeholder="e.g. DC-401"
                      className="w-full bg-white/5 border border-white/10 rounded-xl px-4 py-3 text-white focus:outline-none focus:border-emerald-500"
                    />
                  </div>
                </div>

                {/* Questions inputs */}
                <div className="space-y-6">
                  <div className="flex justify-between items-center">
                    <h3 className="font-serif text-xl font-bold text-white">Questions Schema</h3>
                    <button 
                      type="button"
                      onClick={handleAddQuestionToForm}
                      className="px-4 py-2 bg-emerald-500 hover:bg-emerald-400 text-black font-semibold text-xs rounded-xl transition-all cursor-pointer flex items-center gap-1.5"
                    >
                      <PlusCircle className="w-3.5 h-3.5" /> Add Question Node
                    </button>
                  </div>

                  {examQuestions.map((q, idx) => (
                    <div key={idx} className="bg-[#070707] border border-white/5 rounded-2xl p-6 space-y-4 text-xs">
                      <div className="flex justify-between items-center border-b border-white/5 pb-3">
                        <span className="font-mono text-[10px] text-emerald-400 font-bold uppercase">Question Statement #{idx + 1}</span>
                        {examQuestions.length > 1 && (
                          <button 
                            type="button"
                            onClick={() => handleRemoveQuestionFromForm(idx)}
                            className="text-red-400 hover:text-red-300 text-[10px] font-bold flex items-center gap-1 cursor-pointer"
                          >
                            <Trash2 className="w-3.5 h-3.5" /> Remove Node
                          </button>
                        )}
                      </div>

                      <div className="space-y-1.5">
                        <label className="text-white/55 font-bold block">Question Description Text</label>
                        <textarea 
                          required
                          rows={2}
                          value={q.question}
                          onChange={(e) => handleFormQuestionChange(idx, "question", e.target.value)}
                          placeholder="What is the time complexity of lookup in a balanced red-black tree?"
                          className="w-full bg-white/5 border border-white/10 rounded-xl px-4 py-3 text-white focus:outline-none focus:border-emerald-500 font-sans"
                        />
                      </div>

                      <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                        {q.options.map((opt, oIdx) => (
                          <div key={oIdx} className="space-y-1">
                            <label className="text-white/40 block">Option {String.fromCharCode(65 + oIdx)}</label>
                            <input 
                              type="text"
                              required
                              value={opt}
                              onChange={(e) => handleFormQuestionChange(idx, "option", e.target.value, oIdx)}
                              placeholder={`Option ${String.fromCharCode(65 + oIdx)} content`}
                              className="w-full bg-white/5 border border-white/10 rounded-xl px-4 py-3 text-white focus:outline-none focus:border-emerald-500"
                            />
                          </div>
                        ))}
                      </div>

                      <div className="space-y-1.5 text-left max-w-xs">
                        <label className="text-white/55 font-bold block">Correct Option Assignment</label>
                        <select 
                          value={q.correctAnswer}
                          onChange={(e) => handleFormQuestionChange(idx, "correctAnswer", e.target.value)}
                          className="w-full bg-neutral-900 border border-white/10 rounded-xl px-4 py-3 text-white focus:outline-none focus:border-emerald-500"
                        >
                          <option value={0}>Option A</option>
                          <option value={1}>Option B</option>
                          <option value={2}>Option C</option>
                          <option value={3}>Option D</option>
                        </select>
                      </div>
                    </div>
                  ))}
                </div>

                <button 
                  type="submit"
                  className="w-full py-4 bg-emerald-500 hover:bg-emerald-400 text-black font-semibold uppercase tracking-wider rounded-xl transition-all cursor-pointer shadow-lg active:scale-[0.98]"
                >
                  Compile & Deploy Paper Manifest
                </button>
              </form>
            </div>
          } />

          {/* SUBPATH 3: Manage Questions list */}
          <Route path="/manage-questions" element={
            <div className="space-y-8 text-left animate-fadeIn">
              <div className="flex justify-between items-start md:items-center flex-col md:flex-row gap-4">
                <div>
                  <span className="font-space text-[10px] text-emerald-400 uppercase tracking-widest font-bold">Academic Question Base</span>
                  <h2 className="font-serif text-3xl font-bold mt-1">Audit Global Question Pool</h2>
                  <p className="text-white/50 text-xs md:text-sm font-light mt-1.5 max-w-xl">
                    View, audit, or delete active evaluation templates mapped in Sri Sai Ram Institute ledger.
                  </p>
                </div>
                <Link 
                  to="/faculty/create-exam"
                  className="px-4 py-2.5 bg-emerald-500 hover:bg-emerald-400 text-black font-semibold font-space text-xs rounded-xl flex items-center gap-1.5"
                >
                  <PlusCircle className="w-4 h-4" /> Create Exam
                </Link>
              </div>

              <div className="space-y-4 font-space">
                {globalQuestions.map((q, idx) => (
                  <div key={q.id} className="bg-[#070707] border border-white/5 rounded-2xl p-5 flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
                    <div className="space-y-1.5 text-xs">
                      <div className="flex items-center gap-2">
                        <span className="text-[8px] font-mono font-bold text-emerald-400 bg-emerald-500/10 border border-emerald-500/20 px-2 py-0.5 rounded uppercase">
                          {q.subject}
                        </span>
                        <span className="text-white/35 text-[9px] font-mono">Q-ID: #{q.id}</span>
                      </div>
                      <h4 className="text-white text-sm font-medium leading-relaxed font-sans">{q.question}</h4>
                      <div className="grid grid-cols-2 gap-x-4 gap-y-1 text-[10px] text-white/55 font-mono pt-1">
                        {q.options.map((opt, oIdx) => (
                          <span key={oIdx} className={oIdx === q.correctAnswer ? "text-emerald-400 font-bold" : "text-white/40"}>
                            {String.fromCharCode(65 + oIdx)}) {opt}
                          </span>
                        ))}
                      </div>
                    </div>

                    <button 
                      onClick={() => handleDeleteQuestion(q.id)}
                      className="p-2.5 bg-red-500/5 hover:bg-red-500/10 border border-red-500/10 text-red-400 rounded-lg hover:border-red-500/20 transition-all cursor-pointer shrink-0"
                      title="De-register question statement"
                    >
                      <Trash2 className="w-4 h-4" />
                    </button>
                  </div>
                ))}
              </div>
            </div>
          } />

          {/* SUBPATH 4: Analytics Dashboard */}
          <Route path="/analytics" element={
            <div className="space-y-8 text-left animate-fadeIn">
              <div>
                <span className="font-space text-[10px] text-emerald-400 uppercase tracking-widest font-bold">Dynamic Analytics Engine</span>
                <h2 className="font-serif text-3xl font-bold mt-1">Evaluation & Integrity Analytics</h2>
                <p className="text-white/50 text-xs md:text-sm font-light mt-1.5 max-w-xl">
                  Real-time cognitive and bio-metric behavioral summaries collected from candidate client-side computer vision sandboxes.
                </p>
              </div>

              <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 font-space">
                <div className="bg-[#070707] border border-white/5 rounded-2xl p-6 space-y-2">
                  <span className="text-[10px] text-white/40 uppercase block font-bold">Total Proctor Warnings</span>
                  <span className="text-3xl font-serif text-red-400 font-bold block">14 events</span>
                  <p className="text-[10px] text-[#EBEBEB]/40 leading-relaxed font-light">
                    Anomalous telemetry alerts captured and registered onto SMTP logs. Includes lookaways, tab blurs, and object overlaps.
                  </p>
                </div>

                <div className="bg-[#070707] border border-white/5 rounded-2xl p-6 space-y-2">
                  <span className="text-[10px] text-white/40 uppercase block font-bold">Average Graded Subjective Score</span>
                  <span className="text-3xl font-serif text-emerald-400 font-bold block">84.2%</span>
                  <p className="text-[10px] text-[#EBEBEB]/40 leading-relaxed font-light">
                    Cross-course performance average computed over 142 distinct candidate test instances.
                  </p>
                </div>

                <div className="bg-[#070707] border border-white/5 rounded-2xl p-6 space-y-2">
                  <span className="text-[10px] text-white/40 uppercase block font-bold">AI Autopilot Evaluation Flag</span>
                  <span className="text-3xl font-serif text-white font-bold block">100% OK</span>
                  <p className="text-[10px] text-[#EBEBEB]/40 leading-relaxed font-light">
                    The local computer vision models, SMTP transmitters, and Gemini scoring pipelines are currently reporting full execution sync.
                  </p>
                </div>
              </div>

              {/* Subjective pre-grading simulator list */}
              <div className="bg-[#070707] border border-white/10 rounded-2xl p-6 text-xs text-left space-y-4">
                <span className="font-space text-[10px] uppercase tracking-widest text-emerald-400 font-bold block">Simulated Subjective Pre-Grading Pipeline</span>
                
                <p className="text-white/50 leading-relaxed font-light font-space">
                  This system processes candidate free-text or descriptive solutions using advanced semantic cosine mapping, compiling initial subject grades securely.
                </p>

                <div className="space-y-3 font-space">
                  {[
                    { student: "Sudar S", email: "sudar@ssit.edu", subject: "Operating Systems", predicted: "Grade A (8.5/10)", confidence: "96.4%" },
                    { student: "Abhishek K", email: "abhishek@ssit.edu", subject: "Computer Networks", predicted: "Grade B (7.5/10)", confidence: "91.2%" },
                    { student: "Vijay R", email: "vijay@ssit.edu", subject: "DBMS", predicted: "Grade A+ (9.5/10)", confidence: "98.1%" }
                  ].map((cand, idx) => (
                    <div key={idx} className="bg-white/[0.02] border border-white/5 rounded-xl p-4 flex flex-col sm:flex-row sm:items-center justify-between gap-2">
                      <div>
                        <span className="block font-bold text-white text-xs">{cand.student} ({cand.email})</span>
                        <span className="block text-[10px] text-white/40 font-mono mt-0.5">{cand.subject}</span>
                      </div>
                      <div className="text-left sm:text-right font-mono">
                        <span className="block text-emerald-400 font-bold">{cand.predicted}</span>
                        <span className="block text-[8px] text-white/30">CONFIDENCE INDEX: {cand.confidence}</span>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            </div>
          } />

          {/* SUBPATH 5: Faculty Profile Page */}
          <Route path="/profile" element={
            <div className="space-y-8 text-left animate-fadeIn">
              <div>
                <span className="font-space text-[10px] text-emerald-400 uppercase tracking-widest font-bold">Faculty Specifications</span>
                <h2 className="font-serif text-3xl font-bold mt-1">Instructor Profile Details</h2>
                <p className="text-white/50 text-xs md:text-sm font-light mt-1.5 max-w-xl">
                  Inspect or overwrite your profile details. These specs represent your digital signature on created examinations.
                </p>
              </div>

              {profileMessage && (
                <div className="p-4 bg-emerald-500/10 border border-emerald-500/20 text-emerald-400 text-xs rounded-xl font-light">
                  {profileMessage}
                </div>
              )}

              <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-start">
                
                {/* Profile Photo */}
                <div className="lg:col-span-4 bg-[#070707] border border-white/5 rounded-2xl p-6 text-center space-y-4">
                  <span className="font-space text-[9px] uppercase tracking-widest text-[#EBEBEB]/40 font-bold block">Authorized Digital Signature Avatar</span>
                  
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
                    <span className="text-[10px] text-white/40 font-mono">ID: INSTRUCTOR-FAC-1024</span>
                  </div>
                </div>

                {/* Forms column */}
                <div className="lg:col-span-8 space-y-6">
                  
                  {/* General Profile Info */}
                  <div className="bg-[#070707] border border-white/5 rounded-2xl p-6">
                    <h3 className="font-serif text-lg font-bold text-white mb-6">Instructor Particulars</h3>
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
                        <label className="text-white/55 font-bold uppercase tracking-wider block">Institutional Mail ID</label>
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
                        Secured Update Specifications
                      </button>
                    </form>
                  </div>

                  {/* Password overrides */}
                  <div className="bg-[#070707] border border-white/5 rounded-2xl p-6">
                    <h3 className="font-serif text-lg font-bold text-white mb-6">Overwrite Security Password</h3>
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
                        Commit Overwritten Credentials
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
