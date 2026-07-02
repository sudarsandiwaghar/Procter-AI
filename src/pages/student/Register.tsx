import React, { useState, useEffect } from "react";
import { Link, useNavigate } from "react-router-dom";
import { Shield, Mail, Lock, User, Check, ArrowLeft, Phone, Loader2 } from "lucide-react";
import { RegisteredUser } from "../../types";

interface RegisterProps {
  onRegisterSuccess: (newUser: RegisteredUser) => void;
}

export default function StudentRegister({ onRegisterSuccess }: RegisterProps) {
  const navigate = useNavigate();
  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [phone, setPhone] = useState("");
  const [password, setPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [error, setError] = useState("");
  const [success, setSuccess] = useState("");
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [isCheckingHealth, setIsCheckingHealth] = useState(true);
  const [healthStatus, setHealthStatus] = useState<"online" | "offline" | "checking">("checking");

  useEffect(() => {
    let active = true;
    const checkHealth = async () => {
      try {
        const res = await fetch("/api/health");
        if (res.ok) {
          if (active) {
            setHealthStatus("online");
            setIsCheckingHealth(false);
          }
        } else {
          throw new Error(`Server status: ${res.status}`);
        }
      } catch (err) {
        if (active) {
          console.error("Backend health probe failed:", err);
          setHealthStatus("offline");
          setIsCheckingHealth(false);
          setError("ProctorAI secure gateway connection is offline. Please check that the server is active.");
        }
      }
    };
    checkHealth();
    return () => {
      active = false;
    };
  }, []);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (isSubmitting) return;

    setError("");
    setSuccess("");

    const n = name.trim();
    const em = email.trim();
    const ph = phone.trim();
    const p = password.trim();
    const cp = confirmPassword.trim();

    if (!n) {
      setError("Please fill out your full name.");
      return;
    }

    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailRegex.test(em)) {
      setError("Please enter a valid email address.");
      return;
    }

    const hasNumber = /\d/.test(p);
    if (p.length < 8 || !hasNumber) {
      setError("Password must be at least 8 characters long and contain at least one number.");
      return;
    }

    if (p !== cp) {
      setError("Passwords do not match.");
      return;
    }

    setIsSubmitting(true);

    const registerUser = async () => {
      try {
        const res = await fetch("/api/auth/register", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ name: n, email: em, password: p })
        });
        
        let data: any = {};
        const contentType = res.headers.get("content-type");
        if (contentType && contentType.includes("application/json")) {
          data = await res.json();
        } else {
          const text = await res.text();
          throw new Error(text || `Server returned status ${res.status}`);
        }

        if (res.ok) {
          const newUser: RegisteredUser = {
            name: n,
            email: em,
            phone: ph,
            password: p,
            role: "student"
          };
          setSuccess("Student registration complete! Redirecting to secure login...");
          onRegisterSuccess(newUser);
          setTimeout(() => {
            navigate("/student/login");
          }, 1500);
        } else {
          setError(data.error || "Registration failed. Please check your credentials and try again.");
        }
      } catch (err: any) {
        console.error("Register catch error:", err);
        setError(err.message || "Network connection issue. Backend auth server is offline.");
      } finally {
        setIsSubmitting(false);
      }
    };
    registerUser();
  };

  return (
    <div className="min-h-screen bg-[#020202] text-white flex flex-col justify-center items-center px-4 py-12 relative selection:bg-emerald-500 selection:text-black">
      {/* Background visual glows */}
      <div className="absolute top-1/4 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[350px] h-[350px] bg-emerald-500/5 filter blur-[100px] rounded-full pointer-events-none" />

      <Link to="/" className="absolute top-8 left-8 flex items-center gap-2 text-xs text-white/50 hover:text-emerald-400 font-space tracking-wider transition-colors">
        <ArrowLeft className="w-4 h-4" /> Back to Landing Page
      </Link>

      <div className="w-full max-w-md bg-neutral-900/40 border border-white/10 rounded-2xl p-8 shadow-2xl relative overflow-hidden backdrop-blur-md">
        <div className="absolute inset-x-0 top-0 h-[2px] bg-gradient-to-r from-emerald-500 via-teal-400 to-emerald-500" />
        
        {/* Header */}
        <div className="text-center space-y-3 mb-8">
          <div className="mx-auto w-12 h-12 rounded-xl bg-emerald-500/10 border border-emerald-500/20 flex items-center justify-center text-emerald-400">
            <User className="w-6 h-6" />
          </div>
          <div>
            <h2 className="font-serif text-3xl font-bold text-white tracking-tight">Student Registration</h2>
            <p className="text-xs text-white/40 font-mono uppercase tracking-widest mt-1">Enroll as Candidate</p>
          </div>
        </div>

        {/* Validation messages */}
        {error && (
          <div className="mb-6 p-4 bg-red-500/10 border border-red-500/20 text-red-400 text-xs rounded-xl font-light text-left leading-relaxed">
            {error}
          </div>
        )}
        {success && (
          <div className="mb-6 p-4 bg-emerald-500/10 border border-emerald-500/20 text-emerald-400 text-xs rounded-xl font-light text-left leading-relaxed flex items-center gap-2">
            <Check className="w-4 h-4" /> {success}
          </div>
        )}

        {/* Form */}
        <form onSubmit={handleSubmit} className="space-y-4 text-left font-space text-xs">
          
          <div className="space-y-1.5">
            <label className="text-white/60 tracking-wider font-semibold uppercase block">Candidate Full Name</label>
            <div className="relative">
              <User className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-white/30" />
              <input 
                type="text"
                required
                value={name}
                onChange={(e) => setName(e.target.value)}
                placeholder="e.g. Sudar S"
                className="w-full bg-white/5 border border-white/10 rounded-xl pl-11 pr-4 py-3.5 text-white focus:outline-none focus:border-emerald-500 transition-colors"
              />
            </div>
          </div>

          <div className="space-y-1.5">
            <label className="text-white/60 tracking-wider font-semibold uppercase block">Email ID</label>
            <div className="relative">
              <Mail className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-white/30" />
              <input 
                type="email"
                required
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                placeholder="candidate@example.com"
                className="w-full bg-white/5 border border-white/10 rounded-xl pl-11 pr-4 py-3.5 text-white focus:outline-none focus:border-emerald-500 transition-colors"
              />
            </div>
          </div>

          <div className="space-y-1.5">
            <label className="text-white/60 tracking-wider font-semibold uppercase block">Phone Number</label>
            <div className="relative">
              <Phone className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-white/30" />
              <input 
                type="tel"
                value={phone}
                onChange={(e) => setPhone(e.target.value)}
                placeholder="+91 XXXXX XXXXX"
                className="w-full bg-white/5 border border-white/10 rounded-xl pl-11 pr-4 py-3.5 text-white focus:outline-none focus:border-emerald-500 transition-colors"
              />
            </div>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div className="space-y-1.5">
              <label className="text-white/60 tracking-wider font-semibold uppercase block">Password</label>
              <div className="relative">
                <Lock className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-white/30" />
                <input 
                  type="password"
                  required
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  placeholder="••••••••"
                  className="w-full bg-white/5 border border-white/10 rounded-xl pl-11 pr-4 py-3.5 text-white focus:outline-none focus:border-emerald-500 transition-colors"
                />
              </div>
            </div>

            <div className="space-y-1.5">
              <label className="text-white/60 tracking-wider font-semibold uppercase block">Confirm</label>
              <div className="relative">
                <Lock className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-white/30" />
                <input 
                  type="password"
                  required
                  value={confirmPassword}
                  onChange={(e) => setConfirmPassword(e.target.value)}
                  placeholder="••••••••"
                  className="w-full bg-white/5 border border-white/10 rounded-xl pl-11 pr-4 py-3.5 text-white focus:outline-none focus:border-emerald-500 transition-colors"
                />
              </div>
            </div>
          </div>

          <button 
            type="submit"
            disabled={isSubmitting || healthStatus === "offline" || isCheckingHealth}
            className="w-full py-4 bg-emerald-500 hover:bg-emerald-400 disabled:bg-neutral-800 disabled:text-white/40 disabled:cursor-not-allowed text-black font-semibold uppercase tracking-wider rounded-xl transition-all cursor-pointer shadow-lg active:scale-[0.98] mt-4 flex items-center justify-center gap-2"
          >
            {isSubmitting ? (
              <>
                <Loader2 className="w-4 h-4 animate-spin" /> Registering...
              </>
            ) : isCheckingHealth ? (
              <>
                <Loader2 className="w-4 h-4 animate-spin" /> Checking Connection...
              </>
            ) : healthStatus === "offline" ? (
              "Secure Gateway Offline"
            ) : (
              "Register Student Account"
            )}
          </button>
        </form>

        <div className="mt-8 border-t border-white/5 pt-6 text-center text-[10px] text-white/40">
          Already registered?{" "}
          <Link to="/student/login" className="text-emerald-400 hover:text-emerald-300 font-semibold font-space hover:underline">
            Login here
          </Link>
        </div>
      </div>
    </div>
  );
}
