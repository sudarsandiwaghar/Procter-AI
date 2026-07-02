import React, { useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import { Shield, Eye, EyeOff, Mail, Lock, User, Check, ArrowLeft, Loader2 } from "lucide-react";
import { RegisteredUser } from "../../types";

interface LoginProps {
  registeredUsers: RegisteredUser[];
  onLoginSuccess: (user: RegisteredUser) => void;
}

export default function StudentLogin({ registeredUsers, onLoginSuccess }: LoginProps) {
  const navigate = useNavigate();
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const [rememberMe, setRememberMe] = useState(false);
  const [error, setError] = useState("");
  const [success, setSuccess] = useState("");
  const [isSubmitting, setIsSubmitting] = useState(false);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (isSubmitting) return;

    setError("");
    setSuccess("");

    const u = email.trim().toLowerCase();
    const p = password.trim();

    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailRegex.test(u)) {
      setError("Please enter a valid email address.");
      return;
    }

    setIsSubmitting(true);

    const loginUser = async () => {
      try {
        const res = await fetch("/api/auth/login", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ email: u, password: p })
        });
        
        let data: any = {};
        const contentType = res.headers.get("content-type");
        if (contentType && contentType.includes("application/json")) {
          data = await res.json();
        } else {
          const text = await res.text();
          throw new Error(text || `Status ${res.status}`);
        }

        if (res.ok) {
          if (data.role === "student") {
            setSuccess("Authentication success! Initiating secure Student dashboard...");
            setTimeout(() => {
              onLoginSuccess({
                name: data.user.name,
                email: data.user.email,
                role: data.role,
                phone: data.user.phone || "",
                password: p
              });
              navigate("/student/dashboard");
            }, 1000);
          } else {
            setError(`Role mismatch. This credential belongs to the ${data.role} portal.`);
          }
        } else {
          // Fallback to client-side registeredUsers for maximum resilience if user registered only locally
          const matchedUser = registeredUsers.find(
            (user) => 
              user.email.toLowerCase() === u && 
              user.password === p
          );
          if (matchedUser) {
            if (matchedUser.role === "student") {
              setSuccess("Authentication success! Initiating secure Student dashboard...");
              setTimeout(() => {
                onLoginSuccess(matchedUser);
                navigate("/student/dashboard");
              }, 1000);
            } else {
              setError(`Role mismatch. This credential belongs to the ${matchedUser.role} portal.`);
            }
          } else {
            setError(data.error || "Invalid Student credentials.");
          }
        }
      } catch (err) {
        // Fallback to client-side registeredUsers if offline
        const matchedUser = registeredUsers.find(
          (user) => 
            user.email.toLowerCase() === u && 
            user.password === p
        );
        if (matchedUser) {
          if (matchedUser.role === "student") {
            setSuccess("Authentication success! Initiating secure Student dashboard...");
            setTimeout(() => {
              onLoginSuccess(matchedUser);
              navigate("/student/dashboard");
            }, 1000);
          } else {
            setError(`Role mismatch. This credential belongs to the ${matchedUser.role} portal.`);
          }
        } else {
          setError("Invalid Student credentials or auth server is offline.");
        }
      } finally {
        setIsSubmitting(false);
      }
    };
    loginUser();
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
            <User className="w-6 h-6 animate-pulse" />
          </div>
          <div>
            <h2 className="font-serif text-3xl font-bold text-white tracking-tight">Student Portal</h2>
            <p className="text-xs text-white/40 font-mono uppercase tracking-widest mt-1">Secured Examination Network</p>
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
        <form onSubmit={handleSubmit} className="space-y-5 text-left font-space text-xs">
          <div className="space-y-2">
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

          <div className="space-y-2">
            <div className="flex justify-between items-center">
              <label className="text-white/60 tracking-wider font-semibold uppercase block">Security Password</label>
              <button 
                type="button"
                onClick={() => alert("Password recovery instructions sent to your email address.")}
                className="text-[10px] text-emerald-400 hover:text-emerald-300 hover:underline"
              >
                Forgot Password?
              </button>
            </div>
            <div className="relative">
              <Lock className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-white/30" />
              <input 
                type={showPassword ? "text" : "password"}
                required
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                placeholder="••••••••"
                className="w-full bg-white/5 border border-white/10 rounded-xl pl-11 pr-11 py-3.5 text-white focus:outline-none focus:border-emerald-500 transition-colors"
              />
              <button 
                type="button"
                onClick={() => setShowPassword(!showPassword)}
                className="absolute right-3.5 top-1/2 -translate-y-1/2 text-white/30 hover:text-white transition-colors"
              >
                {showPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
              </button>
            </div>
          </div>

          {/* Remember me & submit */}
          <div className="flex items-center justify-between pt-1">
            <label className="flex items-center gap-2 cursor-pointer select-none">
              <input 
                type="checkbox"
                checked={rememberMe}
                onChange={(e) => setRememberMe(e.target.checked)}
                className="accent-emerald-500 rounded border-white/10"
              />
              <span className="text-white/55 text-[10px]">Remember Me</span>
            </label>
          </div>

          <button 
            type="submit"
            disabled={isSubmitting}
            className="w-full py-4 bg-emerald-500 hover:bg-emerald-400 disabled:bg-neutral-800 disabled:text-white/40 disabled:cursor-not-allowed text-black font-semibold uppercase tracking-wider rounded-xl transition-all cursor-pointer shadow-lg active:scale-[0.98] mt-2 flex items-center justify-center gap-2"
          >
            {isSubmitting ? (
              <>
                <Loader2 className="w-4 h-4 animate-spin" /> Authenticating...
              </>
            ) : (
              "Authenticate Credentials"
            )}
          </button>
        </form>

        <div className="mt-8 border-t border-white/5 pt-6 text-center text-[10px] text-white/40">
          First-time student candidate?{" "}
          <Link to="/student/register" className="text-emerald-400 hover:text-emerald-300 font-semibold font-space hover:underline">
            Register Account
          </Link>
        </div>
      </div>
    </div>
  );
}
