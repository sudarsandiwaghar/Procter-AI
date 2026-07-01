import { useState, useEffect } from "react";
import { Link } from "react-router-dom";
import { 
  Shield, 
  Eye, 
  Cpu, 
  CheckCircle, 
  FileText, 
  ArrowRight, 
  Info, 
  Lock, 
  Award, 
  Users, 
  Menu, 
  X, 
  Mail, 
  Phone, 
  MapPin,
  ChevronDown
} from "lucide-react";
import { LightRays } from "../Component";

export default function Home() {
  const [scrolled, setScrolled] = useState(false);
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const [loginDropdownOpen, setLoginDropdownOpen] = useState(false);
  const [selectedProctorCheck, setSelectedProctorCheck] = useState(0);

  // Stats counters state with organic simulation on mount
  const [stats, setStats] = useState({
    checks: 0,
    models: 0,
    roles: 0,
    accuracy: 0
  });

  useEffect(() => {
    const handleScroll = () => {
      setScrolled(window.scrollY > 40);
    };
    window.addEventListener("scroll", handleScroll);

    const timer = setTimeout(() => {
      setStats({
        checks: 10,
        models: 7,
        roles: 3,
        accuracy: 99
      });
    }, 400);

    return () => {
      window.removeEventListener("scroll", handleScroll);
      clearTimeout(timer);
    };
  }, []);

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

  return (
    <div className="min-h-screen bg-[#020202] text-white selection:bg-emerald-500 selection:text-black overflow-x-hidden relative">
      {/* BACKGROUND ELEMENTS */}
      <div className="absolute top-0 left-0 w-full h-[85vh] overflow-hidden pointer-events-none z-0">
        <LightRays raysOrigin="top-center" raysColor="#10B981" raysSpeed={1.0} lightSpread={1.4} rayLength={1.3} pulsating={true} opacity={0.3} />
      </div>
      <div className="blob blob-1 fixed top-[-100px] left-[-100px] pointer-events-none z-0 bg-emerald-500/5 filter blur-[120px] w-[500px] h-[500px] rounded-full" />
      <div className="blob blob-2 fixed bottom-[-120px] right-[-120px] pointer-events-none z-0 bg-emerald-500/5 filter blur-[100px] w-[450px] h-[450px] rounded-full animate-pulse" />

      {/* HEADER / NAVIGATION BAR */}
      <nav 
        className={`fixed top-0 left-0 w-full z-50 transition-all duration-300 px-6 md:px-12 py-5 flex items-center justify-between ${
          scrolled
            ? "bg-[#050505]/90 backdrop-blur-md border-b border-white/5 py-4 shadow-lg shadow-black/50" 
            : "bg-transparent"
        }`}
      >
        {/* Logo */}
        <Link to="/" className="flex items-center gap-3 group">
          <div className="w-9 h-9 border border-white/15 group-hover:border-emerald-500/80 rounded-lg flex items-center justify-center transition-all duration-700 group-hover:rotate-180 bg-white/5">
            <Shield className="w-4.5 h-4.5 text-emerald-400 group-hover:text-emerald-300" />
          </div>
          <div>
            <span className="font-space font-bold uppercase tracking-wider text-sm text-[#EBEBEB] group-hover:text-emerald-400 transition-colors">ProctorAI</span>
            <div className="text-[9px] text-[#EBEBEB]/40 uppercase tracking-widest font-mono">Vision Platform</div>
          </div>
        </Link>

        {/* Navigation Links (Desktop) */}
        <div className="hidden lg:flex items-center gap-8">
          <a href="#hero" className="text-xs font-semibold tracking-wider hover:text-emerald-400 text-white/70 transition-colors">Home</a>
          <a href="#features" className="text-xs font-semibold tracking-wider hover:text-emerald-400 text-white/70 transition-colors">Features</a>
          <a href="#benefits" className="text-xs font-semibold tracking-wider hover:text-emerald-400 text-white/70 transition-colors">Benefits</a>
          <a href="#proctoring" className="text-xs font-semibold tracking-wider hover:text-emerald-400 text-white/70 transition-colors">Proctoring</a>
          <a href="#evaluation" className="text-xs font-semibold tracking-wider hover:text-emerald-400 text-white/70 transition-colors">Evaluation</a>
          <a href="#contact" className="text-xs font-semibold tracking-wider hover:text-emerald-400 text-white/70 transition-colors">Contact</a>
        </div>

        {/* Action Button + Login Dropdown (Desktop) */}
        <div className="hidden lg:flex items-center gap-4 relative">
          <div 
            className="relative"
            onMouseEnter={() => setLoginDropdownOpen(true)}
            onMouseLeave={() => setLoginDropdownOpen(false)}
          >
            <button className="text-xs font-semibold px-5 py-2.5 bg-emerald-500 hover:bg-emerald-400 text-black rounded-full transition-all duration-300 font-space tracking-wide shadow-md flex items-center gap-2 cursor-pointer">
              Login <ChevronDown className={`w-3.5 h-3.5 transition-transform duration-300 ${loginDropdownOpen ? 'rotate-180' : ''}`} />
            </button>

            {/* Dropdown Items */}
            {loginDropdownOpen && (
              <div className="absolute right-0 mt-1 w-48 bg-[#090909] border border-white/10 rounded-xl py-2 shadow-2xl animate-fadeIn z-50">
                <Link to="/student/login" className="block px-4 py-2.5 text-xs text-white/80 hover:bg-white/5 hover:text-emerald-400 transition-colors text-left font-space">
                  Student Login
                </Link>
                <Link to="/faculty/login" className="block px-4 py-2.5 text-xs text-white/80 hover:bg-white/5 hover:text-emerald-400 transition-colors text-left font-space">
                  Faculty Login
                </Link>
                <Link to="/admin/login" className="block px-4 py-2.5 text-xs text-white/80 hover:bg-white/5 hover:text-emerald-400 transition-colors text-left font-space">
                  Admin Login
                </Link>
              </div>
            )}
          </div>
        </div>

        {/* Mobile Menu Icon */}
        <button className="lg:hidden text-white cursor-pointer" onClick={() => setMobileMenuOpen(!mobileMenuOpen)}>
          {mobileMenuOpen ? <X className="w-6 h-6" /> : <Menu className="w-6 h-6" />}
        </button>
      </nav>

      {/* MOBILE NAV DROPDOWN */}
      {mobileMenuOpen && (
        <div className="fixed inset-x-0 top-[70px] bg-[#050505]/95 border-b border-white/5 z-40 p-6 flex flex-col gap-4 animate-fadeIn lg:hidden font-space">
          <a href="#hero" onClick={() => setMobileMenuOpen(false)} className="text-sm font-semibold hover:text-emerald-400 text-white/80">Home</a>
          <a href="#features" onClick={() => setMobileMenuOpen(false)} className="text-sm font-semibold hover:text-emerald-400 text-white/80">Features</a>
          <a href="#benefits" onClick={() => setMobileMenuOpen(false)} className="text-sm font-semibold hover:text-emerald-400 text-white/80">Benefits</a>
          <a href="#proctoring" onClick={() => setMobileMenuOpen(false)} className="text-sm font-semibold hover:text-emerald-400 text-white/80">Proctoring</a>
          <a href="#evaluation" onClick={() => setMobileMenuOpen(false)} className="text-sm font-semibold hover:text-emerald-400 text-white/80">Evaluation</a>
          <a href="#contact" onClick={() => setMobileMenuOpen(false)} className="text-sm font-semibold hover:text-emerald-400 text-white/80">Contact</a>
          <div className="h-[1px] bg-white/5 my-1" />
          <div className="flex flex-col gap-2">
            <span className="text-[10px] text-white/40 uppercase tracking-widest font-bold">Portals Login</span>
            <Link to="/student/login" onClick={() => setMobileMenuOpen(false)} className="text-xs py-2 text-white/70 hover:text-emerald-400">Student Portal</Link>
            <Link to="/faculty/login" onClick={() => setMobileMenuOpen(false)} className="text-xs py-2 text-white/70 hover:text-emerald-400">Faculty Portal</Link>
            <Link to="/admin/login" onClick={() => setMobileMenuOpen(false)} className="text-xs py-2 text-white/70 hover:text-emerald-400">Admin Portal</Link>
          </div>
        </div>
      )}

      {/* HERO SECTION */}
      <section id="hero" className="min-h-screen pt-32 pb-24 px-6 md:px-12 flex items-center justify-center relative z-10">
        <div className="max-w-7xl mx-auto grid grid-cols-1 lg:grid-cols-12 gap-12 items-center">
          
          <div className="lg:col-span-7 text-left space-y-6">
            <div className="inline-flex items-center gap-2 px-3 py-1 bg-emerald-500/10 border border-emerald-500/25 rounded-full text-emerald-400 text-xs font-mono font-medium tracking-wide">
              <span className="w-2 h-2 rounded-full bg-emerald-400 animate-pulse"></span>
              Secure Proctoring & Intelligent Assessment
            </div>

            <h1 className="font-serif text-5xl md:text-7xl lg:text-[80px] font-bold text-white tracking-tight leading-[1.05]">
              Integrity first.<br />
              <span className="text-transparent bg-clip-text bg-gradient-to-r from-emerald-400 via-teal-300 to-emerald-400 italic font-normal">AI-Powered Evaluation.</span>
            </h1>

            <p className="text-[#EBEBEB]/60 text-sm md:text-base font-light leading-relaxed max-w-xl">
              An advanced, browser-native AI proctoring and semantic grading suite. Real-time client-side computer vision ensures continuous assessment integrity, while serverless LLM modules pre-grade short answers securely.
            </p>

            <div className="flex flex-wrap items-center gap-4 pt-4">
              <Link 
                to="/student/login"
                className="px-8 py-4 bg-emerald-500 hover:bg-emerald-400 text-black font-semibold font-space text-xs uppercase tracking-wider rounded-full transition-all duration-300 shadow-xl shadow-emerald-500/20 hover:shadow-emerald-500/40 hover:-translate-y-0.5 active:scale-95 flex items-center gap-2"
              >
                Access Secure Portal <ArrowRight className="w-4 h-4" />
              </Link>
              <a 
                href="#features"
                className="px-8 py-4 bg-white/5 hover:bg-white/10 border border-white/10 text-white font-semibold font-space text-xs uppercase tracking-wider rounded-full transition-all duration-300 hover:-translate-y-0.5 active:scale-95"
              >
                Discover Features
              </a>
            </div>
          </div>

          <div className="lg:col-span-5 relative flex justify-center">
            {/* Visual Abstract Mesh / Shield Graphics */}
            <div className="w-[300px] h-[300px] md:w-[400px] md:h-[400px] rounded-3xl bg-neutral-900/40 border border-white/10 p-6 shadow-2xl relative overflow-hidden backdrop-blur-md flex flex-col justify-between">
              <div className="absolute inset-0 bg-[radial-gradient(ellipse_at_center,rgba(16,185,129,0.05),transparent_60%)]"></div>
              
              <div className="flex items-center justify-between z-10">
                <div className="flex items-center gap-2">
                  <div className="w-2.5 h-2.5 bg-emerald-500 rounded-full animate-ping"></div>
                  <span className="font-space text-[10px] uppercase tracking-widest text-emerald-400 font-bold">Biometric Shield</span>
                </div>
                <span className="font-mono text-[10px] text-white/35">V_CORE v1.02</span>
              </div>

              <div className="my-auto py-6 flex flex-col items-center justify-center space-y-4 z-10">
                <div className="w-20 h-20 bg-emerald-500/10 border border-emerald-500/20 rounded-2xl flex items-center justify-center text-emerald-400">
                  <Shield className="w-10 h-10" />
                </div>
                <div className="text-center">
                  <span className="font-serif text-2xl font-bold text-white block">Active Defense</span>
                  <span className="font-mono text-[11px] text-[#EBEBEB]/50 block mt-1">Zero latency local landmark scans</span>
                </div>
              </div>

              <div className="border-t border-white/5 pt-4 flex justify-between text-left z-10 font-mono text-[9px] text-[#EBEBEB]/40">
                <div>
                  <span>TRUST ACCURACY</span>
                  <span className="block text-emerald-400 text-xs font-bold font-space mt-0.5">{stats.accuracy}%</span>
                </div>
                <div>
                  <span>AI CHANNELS</span>
                  <span className="block text-emerald-400 text-xs font-bold font-space mt-0.5">{stats.checks} active</span>
                </div>
                <div>
                  <span>USER ROLES</span>
                  <span className="block text-emerald-400 text-xs font-bold font-space mt-0.5">3 (Separated)</span>
                </div>
              </div>
            </div>
          </div>

        </div>
      </section>

      {/* STATS BAR */}
      <section className="py-12 bg-white/[0.01] border-y border-white/5 relative z-10">
        <div className="max-w-7xl mx-auto px-6 md:px-12 grid grid-cols-2 md:grid-cols-4 gap-8">
          <div className="text-left">
            <span className="block font-serif text-4xl font-bold text-white tracking-tight">{stats.checks}</span>
            <span className="block text-[11px] font-space uppercase tracking-wider text-emerald-400/80 font-bold mt-1">Proctoring Signals</span>
          </div>
          <div className="text-left">
            <span className="block font-serif text-4xl font-bold text-white tracking-tight">{stats.models}</span>
            <span className="block text-[11px] font-space uppercase tracking-wider text-emerald-400/80 font-bold mt-1">AI Detection Models</span>
          </div>
          <div className="text-left">
            <span className="block font-serif text-4xl font-bold text-white tracking-tight">{stats.roles}</span>
            <span className="block text-[11px] font-space uppercase tracking-wider text-emerald-400/80 font-bold mt-1">Distinct Role Portals</span>
          </div>
          <div className="text-left">
            <span className="block font-serif text-4xl font-bold text-white tracking-tight">{stats.accuracy}%</span>
            <span className="block text-[11px] font-space uppercase tracking-wider text-emerald-400/80 font-bold mt-1">Semantic Auto-Evaluation</span>
          </div>
        </div>
      </section>

      {/* FEATURES SECTION */}
      <section id="features" className="py-24 px-6 md:px-12 max-w-7xl mx-auto z-10 relative">
        <div className="text-center max-w-3xl mx-auto mb-16">
          <span className="font-space text-[10px] text-emerald-400 uppercase tracking-widest font-bold">CORE CAPABILITIES</span>
          <h2 className="font-serif text-4xl md:text-5xl font-bold text-white mt-2">
            Engineered for <span className="text-emerald-400 italic font-normal">Modern Institutions</span>
          </h2>
          <p className="text-white/50 text-sm max-w-xl mx-auto font-light mt-4">
            A comprehensive visual and semantic platform offering seamless examinations with unmatched integrity protection.
          </p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
          {/* Card 1 */}
          <div className="bg-neutral-900/30 border border-white/5 rounded-2xl p-8 hover:border-emerald-500/20 transition-all text-left">
            <div className="w-12 h-12 rounded-xl bg-emerald-500/10 border border-emerald-500/20 flex items-center justify-center text-emerald-400 mb-6">
              <Eye className="w-6 h-6" />
            </div>
            <h3 className="font-serif text-xl font-bold text-white mb-3">On-Device Computer Vision</h3>
            <p className="text-white/55 text-xs md:text-sm font-light leading-relaxed">
              Maintains full student biometric privacy by processing gaze, face, and object checks locally in the browser. Zero raw frames are transmitted to server databases.
            </p>
          </div>

          {/* Card 2 */}
          <div className="bg-neutral-900/30 border border-white/5 rounded-2xl p-8 hover:border-emerald-500/20 transition-all text-left">
            <div className="w-12 h-12 rounded-xl bg-emerald-500/10 border border-emerald-500/20 flex items-center justify-center text-emerald-400 mb-6">
              <Cpu className="w-6 h-6" />
            </div>
            <h3 className="font-serif text-xl font-bold text-white mb-3">Hybrid Evaluation AI</h3>
            <p className="text-white/55 text-xs md:text-sm font-light leading-relaxed">
              Provides real-time subjective answer grading with instant score recommendations and rubric alignment. Generates comprehensive audit summaries for faculty reviews.
            </p>
          </div>

          {/* Card 3 */}
          <div className="bg-neutral-900/30 border border-white/5 rounded-2xl p-8 hover:border-emerald-500/20 transition-all text-left">
            <div className="w-12 h-12 rounded-xl bg-emerald-500/10 border border-emerald-500/20 flex items-center justify-center text-emerald-400 mb-6">
              <Lock className="w-6 h-6" />
            </div>
            <h3 className="font-serif text-xl font-bold text-white mb-3">Strict Cryptographic Security</h3>
            <p className="text-white/55 text-xs md:text-sm font-light leading-relaxed">
              Ensures data authenticity by packaging exam scores, biometric anomalies, and system visibility logs into beautiful cryptographic PDF and HTML email ledgers.
            </p>
          </div>
        </div>
      </section>

      {/* BENEFITS (ROLE BENEFITS) SECTION */}
      <section id="benefits" className="py-24 px-6 md:px-12 bg-white/[0.01] border-y border-white/5 z-10 relative">
        <div className="max-w-7xl mx-auto">
          <div className="text-center max-w-3xl mx-auto mb-16">
            <span className="font-space text-[10px] text-emerald-400 uppercase tracking-widest font-bold">ROLE-BASED BENEFITS</span>
            <h2 className="font-serif text-4xl md:text-5xl font-bold text-white mt-2">
              Three Roles. <span className="text-emerald-400 italic font-normal">One Fluid Platform.</span>
            </h2>
            <p className="text-white/50 text-sm max-w-xl mx-auto font-light mt-4">
              Engineered explicitly with custom workspaces, tools, and widgets for students, faculty members, and administrators alike.
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-8 text-left">
            {/* Student benefits */}
            <div className="border border-white/5 rounded-2xl p-8 bg-[#070707] relative overflow-hidden">
              <span className="absolute top-4 right-4 text-emerald-400/20 font-space text-5xl font-black">STU</span>
              <div className="flex items-center gap-3 mb-6">
                <div className="w-10 h-10 rounded-lg bg-emerald-500/10 border border-emerald-500/20 flex items-center justify-center text-emerald-400">
                  <Award className="w-5 h-5" />
                </div>
                <h4 className="font-serif text-lg font-bold text-white">For Students</h4>
              </div>
              <ul className="space-y-3.5 text-xs md:text-sm text-white/60 font-light">
                <li className="flex items-start gap-2">
                  <CheckCircle className="w-4 h-4 text-emerald-400 shrink-0 mt-0.5" />
                  <span>Secure, distraction-free online exam environment.</span>
                </li>
                <li className="flex items-start gap-2">
                  <CheckCircle className="w-4 h-4 text-emerald-400 shrink-0 mt-0.5" />
                  <span>Instant, customized feedback from our academic chatbot tutor.</span>
                </li>
                <li className="flex items-start gap-2">
                  <CheckCircle className="w-4 h-4 text-emerald-400 shrink-0 mt-0.5" />
                  <span>Interactive result dashboards tracking scoring trends.</span>
                </li>
              </ul>
              <Link to="/student/login" className="inline-flex items-center gap-1 text-xs text-emerald-400 hover:text-emerald-300 mt-8 font-space font-semibold">
                Access Student Portal →
              </Link>
            </div>

            {/* Faculty benefits */}
            <div className="border border-white/5 rounded-2xl p-8 bg-[#070707] relative overflow-hidden">
              <span className="absolute top-4 right-4 text-emerald-400/20 font-space text-5xl font-black">FAC</span>
              <div className="flex items-center gap-3 mb-6">
                <div className="w-10 h-10 rounded-lg bg-emerald-500/10 border border-emerald-500/20 flex items-center justify-center text-emerald-400">
                  <Users className="w-5 h-5" />
                </div>
                <h4 className="font-serif text-lg font-bold text-white">For Faculty</h4>
              </div>
              <ul className="space-y-3.5 text-xs md:text-sm text-white/60 font-light">
                <li className="flex items-start gap-2">
                  <CheckCircle className="w-4 h-4 text-emerald-400 shrink-0 mt-0.5" />
                  <span>Seamless test authoring & randomized question pool deployment.</span>
                </li>
                <li className="flex items-start gap-2">
                  <CheckCircle className="w-4 h-4 text-emerald-400 shrink-0 mt-0.5" />
                  <span>AI assistant pre-scoring on subjective short answers.</span>
                </li>
                <li className="flex items-start gap-2">
                  <CheckCircle className="w-4 h-4 text-emerald-400 shrink-0 mt-0.5" />
                  <span>Grade verification controls with instant override options.</span>
                </li>
              </ul>
              <Link to="/faculty/login" className="inline-flex items-center gap-1 text-xs text-emerald-400 hover:text-emerald-300 mt-8 font-space font-semibold">
                Access Faculty Portal →
              </Link>
            </div>

            {/* Admin benefits */}
            <div className="border border-white/5 rounded-2xl p-8 bg-[#070707] relative overflow-hidden">
              <span className="absolute top-4 right-4 text-emerald-400/20 font-space text-5xl font-black">ADM</span>
              <div className="flex items-center gap-3 mb-6">
                <div className="w-10 h-10 rounded-lg bg-emerald-500/10 border border-emerald-500/20 flex items-center justify-center text-emerald-400">
                  <Shield className="w-5 h-5" />
                </div>
                <h4 className="font-serif text-lg font-bold text-white">For Administrators</h4>
              </div>
              <ul className="space-y-3.5 text-xs md:text-sm text-white/60 font-light">
                <li className="flex items-start gap-2">
                  <CheckCircle className="w-4 h-4 text-emerald-400 shrink-0 mt-0.5" />
                  <span>Complete management over student and faculty rosters.</span>
                </li>
                <li className="flex items-start gap-2">
                  <CheckCircle className="w-4 h-4 text-emerald-400 shrink-0 mt-0.5" />
                  <span>Real-time proctoring security streams and anomaly logs.</span>
                </li>
                <li className="flex items-start gap-2">
                  <CheckCircle className="w-4 h-4 text-emerald-400 shrink-0 mt-0.5" />
                  <span>Secured PDF records and system integration settings.</span>
                </li>
              </ul>
              <Link to="/admin/login" className="inline-flex items-center gap-1 text-xs text-emerald-400 hover:text-emerald-300 mt-8 font-space font-semibold">
                Access Admin Portal →
              </Link>
            </div>
          </div>
        </div>
      </section>

      {/* AI PROCTORING HIGHLIGHTS */}
      <section id="proctoring" className="py-24 px-6 md:px-12 relative z-10 text-left">
        <div className="max-w-7xl mx-auto">
          
          <div className="text-center max-w-3xl mx-auto mb-16">
            <span className="font-space text-[10px] text-[#10B981] uppercase tracking-widest font-bold">AI PROCTORING HIGHLIGHTS</span>
            <h2 className="font-serif text-4xl md:text-5xl font-bold text-white mt-3">
              Four Core Signals. <span className="text-[#10B981] italic font-normal">Fully Client-Side.</span>
            </h2>
            <p className="text-[#EBEBEB]/50 text-sm font-light mt-4 max-w-xl mx-auto text-center leading-relaxed">
              We compile coordinates and warning triggers on device. No video raw bandwidth overflows your network; integrity checks remain lightning fast and 100% private.
            </p>
          </div>

          <div className="grid grid-cols-1 lg:grid-cols-12 gap-12 items-start">
            {/* Left Info Panel */}
            <div className="lg:col-span-5 text-left">
              <h3 className="font-serif text-2xl font-bold mb-4 text-white tracking-tight">Derived Metrics Tunnel</h3>
              <p className="text-white/60 text-sm font-light leading-relaxed mb-6">
                Web browsers execute real-time 3D landmark mesh modeling on device. Rather than wasting raw streaming video bandwidth and invading student privacy, only coordinates and violation states are compiled.
              </p>

              {/* Simulated scan logs console */}
              <div className="bg-[#080808] border border-white/10 rounded-2xl p-5 shadow-xl relative overflow-hidden font-mono text-[11px] text-[#10B981]/80">
                <div className="flex items-center justify-between border-b border-white/5 pb-3 mb-3 text-[9px] text-white/40 font-space font-bold tracking-widest">
                  <span className="flex items-center gap-1.5">
                    <span className="w-1.5 h-1.5 bg-[#10B981] rounded-full animate-ping"></span>
                    PROCTOR_CV_STETHOSCOPE — ACTIVE
                  </span>
                  <span>FPS: 30</span>
                </div>
                <div className="space-y-1.5">
                  <div>_ [INIT] Mounting TensorFlow on-device model weights...</div>
                  <div className="text-white/50">_ [OK] FaceMesh model loaded: 468 landmark vectors.</div>
                  <div className="text-white/50">_ [OK] Gaze bounds set: yaw[-25°, 25°] pitch[-15°, 15°]</div>
                  <div className="text-amber-400">_ [WARN] Left yaw threshold exceeded: -28.4° (Deviation Flag)</div>
                  <div className="text-white/50">_ [OK] Multi-person scan count: 1 face detected.</div>
                </div>
              </div>
            </div>

            {/* Right Interactive Checks Card Grid */}
            <div className="lg:col-span-7 grid grid-cols-1 sm:grid-cols-2 gap-4">
              {proctoringChecks.map((item, idx) => (
                <div 
                  key={idx}
                  onClick={() => setSelectedProctorCheck(idx)}
                  className={`relative bg-neutral-950/40 border rounded-xl p-6 cursor-pointer text-left transition-all duration-300 hover:-translate-y-0.5 ${
                    selectedProctorCheck === idx 
                      ? "border-emerald-500 bg-emerald-500/[0.02]" 
                      : "border-white/5 hover:border-white/10"
                  }`}
                >
                  <div className="flex items-center justify-between mb-3">
                    <span className="text-2xl">{item.icon}</span>
                    <span className="font-space text-[8px] tracking-wider text-emerald-400 bg-emerald-500/5 px-2 py-0.5 rounded border border-emerald-500/20 font-bold uppercase">
                      {item.badge}
                    </span>
                  </div>

                  <h4 className="font-serif text-base font-bold text-white">
                    {item.title}
                  </h4>
                  <div className="text-[9px] text-white/40 font-mono mt-0.5 mb-2">
                    {item.model}
                  </div>
                  
                  <p className="text-xs text-white/60 font-light leading-relaxed">
                    {item.desc}
                  </p>
                </div>
              ))}
            </div>
          </div>

        </div>
      </section>

      {/* PERFORMANCE EVALUATION HIGHLIGHTS */}
      <section id="evaluation" className="py-24 px-6 md:px-12 max-w-7xl mx-auto z-10 relative">
        <div className="text-center max-w-3xl mx-auto mb-16">
          <span className="font-space text-[10px] text-[#10B981] uppercase tracking-widest font-bold">INTELLIGENT PERFORMANCE EVALUATION</span>
          <h2 className="font-serif text-4xl md:text-5xl font-bold text-white mt-3 leading-none">
            AI Scores First. <span className="text-[#10B981] italic font-normal">Examiners Verify.</span>
          </h2>
          <p className="text-[#EBEBEB]/50 text-sm font-light mt-4 leading-relaxed max-w-xl mx-auto">
            A secure hybrid subjective grading engine. LLM intelligence provides a pre-graded baseline draft within seconds, leaving the final authority and annotations to human examiners.
          </p>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-8 text-left">
          {/* GPT-4o Grading Instance card */}
          <div className="bg-[#070707] border border-white/5 rounded-2xl p-6 md:p-8 relative overflow-hidden">
            <span className="absolute top-4 right-4 px-2 py-0.5 bg-[#10B981]/15 border border-[#10B981]/25 text-[#10B981] text-[9px] font-mono rounded font-bold uppercase">
              Auto Evaluator
            </span>
            <span className="font-space text-[10px] uppercase tracking-widest text-emerald-400 font-bold">GPT-4o GRADING INSTANCE</span>
            <h3 className="font-serif text-lg font-bold text-white mt-2 mb-4">Short Answer Semantic Processing</h3>

            <div className="bg-black/40 border border-white/5 rounded-xl p-4 mb-4">
              <span className="text-[8px] font-mono text-white/30 uppercase tracking-widest block mb-1">STUDENT ANSWER TRANSCRIPT:</span>
              <p className="text-xs text-white/80 font-light leading-relaxed italic">
                "An RDBMS index uses a balanced tree (B-Tree) structure to speed up searches. It creates a sorted copy of the columns, permitting logarithmic O(log n) search operations instead of sequential O(n) table scans."
              </p>
            </div>

            <div className="grid grid-cols-2 gap-4 mb-4">
              <div className="bg-black/30 border border-white/5 rounded-xl p-3">
                <span className="text-[8px] font-mono text-white/30 block mb-0.5">PRELIMINARY MARKS</span>
                <span className="font-serif text-2xl font-bold text-emerald-400">9.0 / 10.0</span>
              </div>
              <div className="bg-black/30 border border-white/5 rounded-xl p-3">
                <span className="text-[8px] font-mono text-white/30 block mb-0.5">COMPLEXITY KEY</span>
                <span className="font-serif text-2xl font-bold text-emerald-400">O(log n) Match</span>
              </div>
            </div>

            <div className="bg-black/30 border border-white/5 rounded-xl p-3 text-xs text-white/50 leading-relaxed font-light">
              <span className="font-bold text-amber-400 block mb-0.5">AI FEEDBACK JUSTIFICATION:</span>
              Correctly identifies O(log n) search criteria and logarithmic complexities. Very crisp definition. Deducted 1 mark due to lacking explanation of leaf splits under random insertion routines.
            </div>
          </div>

          {/* Human verification card */}
          <div className="bg-[#070707] border border-white/5 rounded-2xl p-6 md:p-8 relative overflow-hidden">
            <span className="absolute top-4 right-4 px-2 py-0.5 bg-amber-500/15 border border-amber-500/25 text-amber-400 text-[9px] font-mono rounded font-bold uppercase">
              Faculty Audit Rail
            </span>
            <span className="font-space text-[10px] uppercase tracking-widest text-[#10B981] font-bold">HUMAN EXAMINER VERIFICATION</span>
            <h3 className="font-serif text-lg font-bold text-white mt-2 mb-4">Manual Verification & Overrides</h3>

            <div className="space-y-4">
              <div className="p-4 bg-white/[0.02] border border-white/5 rounded-xl flex items-center justify-between gap-4">
                <div>
                  <h4 className="text-xs text-white font-bold">Fine-Tuned Grading Dial</h4>
                  <p className="text-[10px] text-white/40 mt-0.5">Increase or decrease scores based on specific institutional guidelines.</p>
                </div>
                <span className="text-xs text-[#10B981] font-mono font-bold bg-[#10B981]/5 px-2.5 py-1 rounded-lg border border-[#10B981]/20">9.5 / 10</span>
              </div>

              <div className="p-4 bg-white/[0.02] border border-white/5 rounded-xl">
                <h4 className="text-xs text-white font-bold mb-1">OCR Handwriting Canvas Digitizer</h4>
                <div className="border border-dashed border-white/10 rounded-lg p-3 bg-black/40 text-center font-mono text-[10px]">
                  <span className="text-emerald-400 font-bold block">✓ student_proof_STU092.pdf successfully digitized</span>
                  <span className="text-white/30 block mt-0.5">OCR confidence rate: 98.4% with full visual overlay</span>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* TESTIMONIALS SECTION */}
      <section className="py-24 px-6 md:px-12 bg-white/[0.01] border-t border-white/5 z-10 relative">
        <div className="max-w-7xl mx-auto">
          <div className="text-center max-w-3xl mx-auto mb-16">
            <span className="font-space text-[10px] text-emerald-400 uppercase tracking-widest font-bold">ACADEMIC TESTIMONIALS</span>
            <h2 className="font-serif text-4xl md:text-5xl font-bold text-white mt-2">
              Trusted by <span className="text-emerald-400 italic font-normal">Educators Worldwide</span>
            </h2>
            <p className="text-white/50 text-sm max-w-xl mx-auto font-light mt-4">
              Discover why top institutions count on ProctorAI to secure their academic pathways.
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8 text-left font-sans">
            {/* Review 1 */}
            <div className="bg-[#070707] border border-white/5 rounded-2xl p-6 flex flex-col justify-between">
              <p className="text-white/70 text-xs md:text-sm font-light leading-relaxed italic mb-6">
                "ProctorAI has streamlined our exam audits. The gaze-tracking is highly accurate and student privacy is protected. The semantic short answer evaluation saves our professors countless hours."
              </p>
              <div>
                <span className="block text-xs font-bold text-white font-space">Dr. Sudarsan S.</span>
                <span className="block text-[10px] text-white/40 uppercase tracking-widest font-mono mt-0.5">Department of Computing · SSIT</span>
              </div>
            </div>

            {/* Review 2 */}
            <div className="bg-[#070707] border border-white/5 rounded-2xl p-6 flex flex-col justify-between">
              <p className="text-white/70 text-xs md:text-sm font-light leading-relaxed italic mb-6">
                "Our students appreciate that their raw video files are not sent to any central server. The platform feels highly premium, responsive, and completely objective."
              </p>
              <div>
                <span className="block text-xs font-bold text-white font-space">Prof. Rajesh Kumar</span>
                <span className="block text-[10px] text-white/40 uppercase tracking-widest font-mono mt-0.5">Dean of Academics · Tech University</span>
              </div>
            </div>

            {/* Review 3 */}
            <div className="bg-[#070707] border border-white/5 rounded-2xl p-6 flex flex-col justify-between">
              <p className="text-white/70 text-xs md:text-sm font-light leading-relaxed italic mb-6">
                "The separate logins and specialized dashboard layouts are extremely intuitive. The admin can control rosters easily while faculty focus purely on test creation."
              </p>
              <div>
                <span className="block text-xs font-bold text-white font-space">Meera S.</span>
                <span className="block text-[10px] text-white/40 uppercase tracking-widest font-mono mt-0.5">Systems Operations Officer</span>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* CONTACT / FOOTER SECTION */}
      <section id="contact" className="py-24 px-6 md:px-12 relative z-10 border-t border-white/5 bg-[#030303]">
        <div className="max-w-7xl mx-auto grid grid-cols-1 lg:grid-cols-12 gap-12 text-left">
          
          <div className="lg:col-span-5 space-y-6">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 border border-white/10 rounded-xl flex items-center justify-center bg-white/5">
                <Shield className="w-5 h-5 text-emerald-400" />
              </div>
              <div>
                <span className="font-space font-bold uppercase tracking-wider text-base text-[#EBEBEB]">ProctorAI</span>
                <div className="text-[10px] text-[#EBEBEB]/40 uppercase tracking-widest font-mono">Vision Platform</div>
              </div>
            </div>

            <p className="text-white/50 text-xs md:text-sm font-light leading-relaxed max-w-sm">
              We are dedicated to building robust computer vision and automated evaluation tools that empower modern academic environments safely and privately.
            </p>

            <div className="space-y-3 pt-4 text-xs text-white/60 font-light">
              <div className="flex items-center gap-3">
                <Mail className="w-4 h-4 text-emerald-400" />
                <span>support@ssit.edu</span>
              </div>
              <div className="flex items-center gap-3">
                <Phone className="w-4 h-4 text-emerald-400" />
                <span>+91 44 2251 2252</span>
              </div>
              <div className="flex items-center gap-3">
                <MapPin className="w-4 h-4 text-emerald-400" />
                <span>Sri Sai Ram Institute of Technology, Chennai, India</span>
              </div>
            </div>
          </div>

          <div className="lg:col-span-7">
            <h3 className="font-serif text-xl font-bold text-white mb-6">Send an Inquiry</h3>
            <form onSubmit={(e) => { e.preventDefault(); alert("Thank you! Your inquiry has been secured."); }} className="grid grid-cols-1 sm:grid-cols-2 gap-4 font-space text-xs">
              <input 
                type="text" 
                required
                placeholder="Full Name" 
                className="bg-white/5 border border-white/10 rounded-xl px-4 py-3.5 text-white focus:outline-none focus:border-emerald-500 transition-colors"
              />
              <input 
                type="email" 
                required
                placeholder="Institution Email" 
                className="bg-white/5 border border-white/10 rounded-xl px-4 py-3.5 text-white focus:outline-none focus:border-emerald-500 transition-colors"
              />
              <input 
                type="text" 
                placeholder="Designation / Role" 
                className="sm:col-span-2 bg-white/5 border border-white/10 rounded-xl px-4 py-3.5 text-white focus:outline-none focus:border-emerald-500 transition-colors"
              />
              <textarea 
                required
                rows={4}
                placeholder="How can we assist you with academic integrity solutions?" 
                className="sm:col-span-2 bg-white/5 border border-white/10 rounded-xl px-4 py-3.5 text-white focus:outline-none focus:border-emerald-500 transition-colors"
              />
              <button 
                type="submit"
                className="sm:col-span-2 py-4 bg-emerald-500 hover:bg-emerald-400 text-black font-semibold uppercase tracking-wider rounded-xl transition-all cursor-pointer shadow-lg active:scale-[0.98]"
              >
                Submit Secured Message
              </button>
            </form>
          </div>

        </div>

        <div className="max-w-7xl mx-auto border-t border-white/5 my-12 pt-8 text-center space-y-4 font-space text-[10px] text-white/30">
          <span className="uppercase tracking-widest font-bold block">
            © {new Date().getFullYear()} ProctorAI · Sri Sai Ram Institute of Technology. All rights reserved.
          </span>
          <p className="font-light leading-relaxed max-w-2xl mx-auto">
            Built for security and compliance under international WebRTC and data confidentiality mandates. Derived landmarks strictly protect identity patterns offline.
          </p>
        </div>
      </section>
    </div>
  );
}
