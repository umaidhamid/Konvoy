"use client";

import React, { useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { Eye, EyeOff, Mail, Lock, User, ShieldQuestion, KeyRound, CheckCircle2, ArrowRight, ArrowLeft, ShieldCheck, Sparkles, HelpCircle } from "lucide-react";

type AuthMode = "login" | "register" | "forgot";

/* ==========================================================================
    ULTRA-PREMIUM IMAGE VECTOR GRAPHICS (NO TEXT, PURE THEMED GEOMETRY)
   ========================================================================== */

// 1. Full Screen Main Background Image Layout Component
function GlobalCanvasBackground() {
  return (
    <div className="absolute inset-0 z-0 overflow-hidden pointer-events-none">
      <svg className="h-full w-full object-cover opacity-30 dark:opacity-40" xmlns="http://www.w3.org/2000/svg" width="100%" height="100%" viewBox="0 0 1440 900" fill="none">
        <defs>
          <radialGradient id="bg-glow-1" cx="20%" cy="30%" r="50%">
            <stop offset="0%" stopColor="var(--primary)" stopOpacity="0.25" />
            <stop offset="100%" stopColor="var(--background)" stopOpacity="0" />
          </radialGradient>
          <radialGradient id="bg-glow-2" cx="80%" cy="70%" r="60%">
            <stop offset="0%" stopColor="#059669" stopOpacity="0.15" />
            <stop offset="100%" stopColor="var(--background)" stopOpacity="0" />
          </radialGradient>
        </defs>
        <rect width="1440" height="900" fill="var(--background)" />
        <circle cx="250" cy="250" r="500" fill="url(#bg-glow-1)" />
        <circle cx="1100" cy="650" r="600" fill="url(#bg-glow-2)" />
        {/* Floating Abstract Mesh Shapes */}
        <path d="M-100,200 Q200,100 400,300 T900,100 T1500,400" stroke="var(--border)" strokeWidth="1" strokeDasharray="12 12" fill="none" opacity="0.4" />
        <path d="M-50,500 Q300,400 600,600 T1200,300 T1600,700" stroke="var(--border)" strokeWidth="1.5" strokeDasharray="6 6" fill="none" opacity="0.2" />
      </svg>
    </div>
  );
}

// 2. Login Graphic (Primary Blue/Purple Theme)
function LoginGraphic() {
  return (
    <svg className="h-full w-full max-h-44 object-contain" viewBox="0 0 320 200" fill="none" xmlns="http://www.w3.org/2000/svg">
      <defs>
        <linearGradient id="login-grad" x1="0" y1="0" x2="320" y2="200">
          <stop offset="0%" stopColor="var(--primary)" stopOpacity="0.8"/>
          <stop offset="100%" stopColor="#6366f1" stopOpacity="0.2"/>
        </linearGradient>
      </defs>
      {/* Base Abstract Dashboard Grid */}
      <rect x="20" y="40" width="280" height="130" rx="16" fill="url(#login-grad)" stroke="var(--border)" strokeWidth="1.5" opacity="0.15"/>
      <rect x="40" y="60" width="100" height="8" rx="4" fill="var(--foreground)" opacity="0.2"/>
      <rect x="40" y="76" width="60" height="6" rx="3" fill="var(--foreground)" opacity="0.1"/>
      {/* Core Secure Entry Object */}
      <circle cx="210" cy="105" r="45" fill="var(--card)" stroke="var(--border)" strokeWidth="2" className="shadow-lg"/>
      <circle cx="210" cy="105" r="32" fill="var(--primary)" fillOpacity="0.08"/>
      {/* Center Lock Shape */}
      <path d="M198 106 V96 C198 89.3 203.3 84 210 84 C216.7 84 222 89.3 222 96 V106" stroke="var(--primary)" strokeWidth="3" strokeLinecap="round"/>
      <rect x="193" y="106" width="34" height="26" rx="6" fill="var(--card)" stroke="var(--primary)" strokeWidth="3"/>
      <circle cx="210" cy="118" r="3" fill="var(--primary)"/>
    </svg>
  );
}

// 3. Register Graphic (Emerald Account Creation Theme)
function RegisterGraphic() {
  return (
    <svg className="h-full w-full max-h-44 object-contain" viewBox="0 0 320 200" fill="none" xmlns="http://www.w3.org/2000/svg">
      <defs>
        <linearGradient id="reg-grad" x1="0" y1="0" x2="100" y2="100">
          <stop offset="0%" stopColor="#10b981" stopOpacity="0.4"/>
          <stop offset="100%" stopColor="#059669" stopOpacity="0"/>
        </linearGradient>
      </defs>
      {/* Network Nodes representing Account Profile Setup */}
      <path d="M60,110 L120,60 L200,140 L260,80" stroke="var(--border)" strokeWidth="2" strokeLinecap="round" opacity="0.4"/>
      <circle cx="60" cy="110" r="6" fill="var(--muted-foreground)" opacity="0.3"/>
      <circle cx="120" cy="60" r="8" fill="#10b981" fillOpacity="0.2" stroke="#10b981" strokeWidth="2"/>
      <circle cx="200" cy="140" r="6" fill="var(--muted-foreground)" opacity="0.3"/>
      
      {/* Core Dynamic User ID Card */}
      <g filter="drop-shadow(0px 8px 16px rgba(0,0,0,0.08))">
        <rect x="110" y="55" width="130" height="90" rx="14" fill="var(--card)" stroke="#10b981" strokeWidth="1.5"/>
        <rect x="110" y="55" width="40" height="90" rx="14" fill="url(#reg-grad)" opacity="0.5"/>
        {/* Abstract Avatar Graphic */}
        <circle cx="175" cy="88" r="14" fill="var(--muted)" stroke="var(--border)" strokeWidth="1.5"/>
        <path d="M162 114 C162 104 170 102 175 102 C180 102 188 104 188 114" fill="var(--muted)" stroke="var(--border)" strokeWidth="1.5"/>
        {/* Accent lines */}
        <rect x="130" y="120" width="35" height="4" rx="2" fill="#10b981" opacity="0.6"/>
        <circle cx="215" cy="75" r="3" fill="#10b981"/>
      </g>
    </svg>
  );
}

// 4. Forgot & Multi-Step Recovery Graphic (Amber/Orange Vault Key Theme)
function RecoveryGraphic() {
  return (
    <svg className="h-full w-full max-h-36 object-contain" viewBox="0 0 320 140" fill="none" xmlns="http://www.w3.org/2000/svg">
      <defs>
        <linearGradient id="reco-grad" x1="0" y1="0" x2="320" y2="140">
          <stop offset="0%" stopColor="#f59e0b" stopOpacity="0.15"/>
          <stop offset="100%" stopColor="#d97706" stopOpacity="0"/>
        </linearGradient>
      </defs>
      {/* Track Rail Grid */}
      <rect x="15" y="15" width="290" height="110" rx="12" fill="url(#reco-grad)" stroke="var(--border)" strokeWidth="1"/>
      <line x1="40" y1="70" x2="280" y2="70" stroke="var(--border)" strokeWidth="2" strokeDasharray="4 8" opacity="0.6"/>
      
      {/* Verification Stepper Tokens */}
      <circle cx="70" cy="70" r="18" fill="var(--card)" stroke="#f59e0b" strokeWidth="2"/>
      <circle cx="70" cy="70" r="8" fill="#f59e0b" opacity="0.3"/>
      
      <circle cx="160" cy="70" r="18" fill="var(--card)" stroke="var(--border)" strokeWidth="1.5"/>
      <path d="M155 70 H165 M160 65 V75" stroke="var(--muted-foreground)" strokeWidth="2" opacity="0.6"/>

      <circle cx="250" cy="70" r="18" fill="var(--card)" stroke="var(--border)" strokeWidth="1.5"/>
      <circle cx="250" cy="70" r="4" fill="var(--muted)" />
      
      {/* Floating Laser Scanning Line Accent */}
      <line x1="110" y1="35" x2="110" y2="105" stroke="#f59e0b" strokeWidth="2" strokeLinecap="round" opacity="0.8"/>
    </svg>
  );
}


/* ==========================================================================
    MAIN INTERACTIVE ROOT CONTAINER
   ========================================================================== */
export default function AuthContainer() {
  const [mode, setMode] = useState<AuthMode>("login");

  return (
    <div className="relative flex min-h-screen w-full items-center justify-center p-0 sm:p-6 text-foreground transition-colors duration-300 overflow-hidden">
      
      {/* IMAGE 1: Full-Screen Background Art Integration */}
      <GlobalCanvasBackground />

      {/* Split Main Card Workspace */}
      <div className="relative z-10 flex min-h-screen w-full max-w-[1050px] overflow-hidden bg-card/85 shadow-2xl sm:min-h-[700px] sm:rounded-2xl border border-border/70 backdrop-blur-xl">
        
        {/* LEFT PANEL: Context Graphic Split Screen Area */}
        <div className="relative hidden w-1/2 flex-col justify-between overflow-hidden bg-muted/40 p-10 md:flex border-r border-border/50">
          
          {/* Dynamic background colored layers synced with action flow */}
          <div className="absolute inset-0 z-0 overflow-hidden">
            <AnimatePresence mode="wait">
              <motion.div
                key={mode}
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                exit={{ opacity: 0 }}
                transition={{ duration: 0.5 }}
                className={`absolute inset-0 transition-colors duration-500 ${
                  mode === 'login' ? 'bg-primary/[0.02]' : mode === 'register' ? 'bg-emerald-500/[0.02]' : 'bg-amber-500/[0.02]'
                }`}
              />
            </AnimatePresence>
          </div>

          {/* Top Brand Block */}
          <div className="relative z-10 flex items-center gap-2.5 font-bold tracking-tight text-foreground">
            <div className="flex h-9 w-9 items-center justify-center rounded-xl bg-primary shadow-md shadow-primary/10 text-primary-foreground">
              <ShieldCheck className="h-5 w-5" />
            </div>
            <span className="text-lg bg-gradient-to-r from-foreground to-foreground/80 bg-clip-text">SecurePortal</span>
          </div>

          {/* Center Graphic Container Switching via State */}
          <div className="relative z-10 my-auto py-6 w-full flex items-center justify-center">
            <AnimatePresence mode="wait">
              {mode === "login" && (
                <motion.div
                  key="img-login"
                  initial={{ opacity: 0, scale: 0.95, y: 10 }}
                  animate={{ opacity: 1, scale: 1, y: 0 }}
                  exit={{ opacity: 0, scale: 0.95, y: -10 }}
                  transition={{ duration: 0.35 }}
                  className="w-full flex flex-col items-center space-y-6"
                >
                  <LoginGraphic />
                  <div className="space-y-2 text-center max-w-[85%]">
                    <h2 className="text-2xl font-extrabold tracking-tight">Welcome back partner</h2>
                    <p className="text-xs text-muted-foreground leading-relaxed">
                      Log in to access your secure personalized dashboard, manage analytics, and review system audits.
                    </p>
                  </div>
                </motion.div>
              )}

              {mode === "register" && (
                <motion.div
                  key="img-register"
                  initial={{ opacity: 0, scale: 0.95, y: 10 }}
                  animate={{ opacity: 1, scale: 1, y: 0 }}
                  exit={{ opacity: 0, scale: 0.95, y: -10 }}
                  transition={{ duration: 0.35 }}
                  className="w-full flex flex-col items-center space-y-6"
                >
                  <RegisterGraphic />
                  <div className="space-y-2 text-center max-w-[85%]">
                    <h2 className="text-2xl font-extrabold tracking-tight text-emerald-600 dark:text-emerald-400">Start your journey</h2>
                    <p className="text-xs text-muted-foreground leading-relaxed">
                      Set up a production-ready profile equipped with fallback question architecture templates out-of-the-box.
                    </p>
                  </div>
                </motion.div>
              )}

              {mode === "forgot" && (
                <motion.div
                  key="img-forgot"
                  initial={{ opacity: 0, scale: 0.95, y: 10 }}
                  animate={{ opacity: 1, scale: 1, y: 0 }}
                  exit={{ opacity: 0, scale: 0.95, y: -10 }}
                  transition={{ duration: 0.35 }}
                  className="w-full flex flex-col items-center space-y-6"
                >
                  <RecoveryGraphic />
                  <div className="space-y-2 text-center max-w-[85%]">
                    <h2 className="text-2xl font-extrabold tracking-tight text-amber-600 dark:text-amber-400">Account Recovery Flow</h2>
                    <p className="text-xs text-muted-foreground leading-relaxed">
                      Multi-tier identity verification engine. Answer validation queries and supply your standard token parameter to sign a new payload.
                    </p>
                  </div>
                </motion.div>
              )}
            </AnimatePresence>
          </div>

          <div className="relative z-10 text-xs font-medium text-muted-foreground/40 tracking-widest uppercase">
            &copy; 2026 Enterprise Identity Stack
          </div>
        </div>

        {/* RIGHT PANEL: Pure Interactive Form Component Stack */}
        <div className="flex w-full flex-col justify-center px-6 py-10 md:w-1/2 md:p-10 lg:p-12 bg-card/60 backdrop-blur-md">
          <div className="mx-auto w-full max-w-sm">
            <AnimatePresence mode="wait">
              {mode === "login" && <LoginForm key="login" onNavigate={setMode} />}
              {mode === "register" && <RegisterForm key="register" onNavigate={setMode} />}
              {mode === "forgot" && <ForgotPasswordFlow key="forgot" onNavigate={setMode} />}
            </AnimatePresence>
          </div>
        </div>

      </div>
    </div>
  );
}

/* ==========================================================================
    LOGIN FORM
   ========================================================================== */
function LoginForm({ onNavigate }: { onNavigate: (mode: AuthMode) => void }) {
  const [showPassword, setShowPassword] = useState(false);
  const [formData, setFormData] = useState({ email: "", password: "" });

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    console.log("Logging in with:", formData);
  };

  return (
    <motion.div
      initial={{ opacity: 0, x: -16 }}
      animate={{ opacity: 1, x: 0 }}
      exit={{ opacity: 0, x: 16 }}
      transition={{ duration: 0.25 }}
    >
      <div className="space-y-2">
        <h1 className="text-3xl font-extrabold tracking-tight">Welcome Back</h1>
        <p className="text-sm text-muted-foreground">Enter your credentials to access your account</p>
      </div>

      <form onSubmit={handleSubmit} className="mt-8 space-y-4">
        <div className="space-y-1.5">
          <label className="text-xs font-bold uppercase tracking-wider text-muted-foreground/90">Email Address</label>
          <div className="relative">
            <Mail className="absolute top-1/2 left-3.5 h-4 w-4 -translate-y-1/2 text-muted-foreground/60" />
            <input
              type="email"
              required
              className="w-full rounded-xl border border-input bg-background/40 py-2.5 pr-4 pl-11 text-sm outline-none transition-all focus:border-primary focus:ring-4 focus:ring-primary/10"
              placeholder="name@example.com"
              value={formData.email}
              onChange={(e) => setFormData({ ...formData, email: e.target.value })}
            />
          </div>
        </div>

        <div className="space-y-1.5">
          <div className="flex items-center justify-between">
            <label className="text-xs font-bold uppercase tracking-wider text-muted-foreground/90">Password</label>
            <button
              type="button"
              onClick={() => onNavigate("forgot")}
              className="text-xs font-semibold text-primary hover:text-primary/80 transition-colors"
            >
              Forgot password?
            </button>
          </div>
          <div className="relative">
            <Lock className="absolute top-1/2 left-3.5 h-4 w-4 -translate-y-1/2 text-muted-foreground/60" />
            <input
              type={showPassword ? "text" : "password"}
              required
              className="w-full rounded-xl border border-input bg-background/40 py-2.5 pr-11 pl-11 text-sm outline-none transition-all focus:border-primary focus:ring-4 focus:ring-primary/10"
              placeholder="••••••••"
              value={formData.password}
              onChange={(e) => setFormData({ ...formData, password: e.target.value })}
            />
            <button
              type="button"
              onClick={() => setShowPassword(!showPassword)}
              className="absolute top-1/2 right-3.5 -translate-y-1/2 text-muted-foreground/60 hover:text-foreground transition-colors"
            >
              {showPassword ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
            </button>
          </div>
        </div>

        <button
          type="submit"
          className="mt-3 flex w-full items-center justify-center rounded-xl bg-primary py-2.5 text-sm font-semibold text-primary-foreground shadow-lg shadow-primary/15 transition-all hover:bg-primary/90 focus:outline-none focus:ring-2 focus:ring-primary"
        >
          Sign In
        </button>
      </form>

      <div className="mt-6 text-center text-sm text-muted-foreground">
        Don&apos;t have an account?{" "}
        <button onClick={() => onNavigate("register")} className="font-bold text-primary hover:underline">
          Sign up
        </button>
      </div>
    </motion.div>
  );
}

/* ==========================================================================
    REGISTER FORM
   ========================================================================== */
function RegisterForm({ onNavigate }: { onNavigate: (mode: AuthMode) => void }) {
  const [formData, setFormData] = useState({
    fullName: "",
    email: "",
    password: "",
    securityQuestion: "What was the name of your first pet?",
    securityAnswer: "",
  });

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    console.log("Registering user:", formData);
  };

  return (
    <motion.div
      initial={{ opacity: 0, x: 16 }}
      animate={{ opacity: 1, x: 0 }}
      exit={{ opacity: 0, x: -16 }}
      transition={{ duration: 0.25 }}
    >
      <div className="space-y-2">
        <h1 className="text-3xl font-bold tracking-tight">Create account</h1>
        <p className="text-sm text-muted-foreground">Join us today by completing your details</p>
      </div>

      <form onSubmit={handleSubmit} className="mt-6 space-y-3.5">
        <div className="space-y-1.5">
          <label className="text-xs font-bold uppercase tracking-wider text-muted-foreground/90">Full Name</label>
          <div className="relative">
            <User className="absolute top-1/2 left-3.5 h-4 w-4 -translate-y-1/2 text-muted-foreground/60" />
            <input
              type="text"
              required
              className="w-full rounded-xl border border-input bg-background/40 py-2.5 pr-4 pl-11 text-sm outline-none transition-all focus:border-primary focus:ring-4 focus:ring-primary/10"
              placeholder="John Doe"
              value={formData.fullName}
              onChange={(e) => setFormData({ ...formData, fullName: e.target.value })}
            />
          </div>
        </div>

        <div className="space-y-1.5">
          <label className="text-xs font-bold uppercase tracking-wider text-muted-foreground/90">Email Address</label>
          <div className="relative">
            <Mail className="absolute top-1/2 left-3.5 h-4 w-4 -translate-y-1/2 text-muted-foreground/60" />
            <input
              type="email"
              required
              className="w-full rounded-xl border border-input bg-background/40 py-2.5 pr-4 pl-11 text-sm outline-none transition-all focus:border-primary focus:ring-4 focus:ring-primary/10"
              placeholder="name@example.com"
              value={formData.email}
              onChange={(e) => setFormData({ ...formData, email: e.target.value })}
            />
          </div>
        </div>

        <div className="space-y-1.5">
          <label className="text-xs font-bold uppercase tracking-wider text-muted-foreground/90">Password</label>
          <div className="relative">
            <Lock className="absolute top-1/2 left-3.5 h-4 w-4 -translate-y-1/2 text-muted-foreground/60" />
            <input
              type="password"
              required
              className="w-full rounded-xl border border-input bg-background/40 py-2.5 pr-4 pl-11 text-sm outline-none transition-all focus:border-primary focus:ring-4 focus:ring-primary/10"
              placeholder="••••••••"
              value={formData.password}
              onChange={(e) => setFormData({ ...formData, password: e.target.value })}
            />
          </div>
        </div>

        {/* Security recovery options card */}
        <div className="rounded-xl border border-amber-500/15 bg-amber-500/[0.02] p-4 space-y-3 shadow-inner">
          <p className="text-[11px] font-bold uppercase tracking-wider text-amber-600 dark:text-amber-400 flex items-center gap-1.5">
            <Sparkles className="h-3.5 w-3.5" /> Security Recovery Option
          </p>
          
          <div className="space-y-1.5">
            <label className="text-xs font-semibold text-muted-foreground">Security Question</label>
            <select
              className="w-full rounded-lg border border-input bg-background p-2 text-sm outline-none transition-all focus:border-amber-500 focus:ring-2 focus:ring-amber-500/10 cursor-pointer"
              value={formData.securityQuestion}
              onChange={(e) => setFormData({ ...formData, securityQuestion: e.target.value })}
            >
              <option>What was the name of your first pet?</option>
              <option>What city were you born in?</option>
              <option>What was your mother&apos;s maiden name?</option>
            </select>
          </div>

          <div className="space-y-1.5">
            <label className="text-xs font-semibold text-muted-foreground">Your Answer</label>
            <div className="relative">
              <ShieldQuestion className="absolute top-1/2 left-3 h-4 w-4 -translate-y-1/2 text-muted-foreground/70" />
              <input
                type="text"
                required
                className="w-full rounded-lg border border-input bg-background py-2 pr-4 pl-10 text-sm outline-none transition-all focus:border-amber-500 focus:ring-2 focus:ring-amber-500/10"
                placeholder="Secret answer"
                value={formData.securityAnswer}
                onChange={(e) => setFormData({ ...formData, securityAnswer: e.target.value })}
              />
            </div>
          </div>
        </div>

        <button
          type="submit"
          className="flex w-full items-center justify-center rounded-xl bg-primary py-2.5 text-sm font-semibold text-primary-foreground shadow-md transition-all hover:bg-primary/95"
        >
          Register Account
        </button>
      </form>

      <div className="mt-5 text-center text-sm text-muted-foreground">
        Already have an account?{" "}
        <button onClick={() => onNavigate("login")} className="font-bold text-primary hover:underline">
          Sign in
        </button>
      </div>
    </motion.div>
  );
}

/* ==========================================================================
    FORGOT PASSWORD FLOW
   ========================================================================== */
type ForgotStep = 1 | 2 | 3;

function ForgotPasswordFlow({ onNavigate }: { onNavigate: (mode: AuthMode) => void }) {
  const [step, setStep] = useState<ForgotStep>(1);
  const [email, setEmail] = useState("");
  const [securityQuestion, setSecurityQuestion] = useState("What was the name of your first pet?");
  const [securityAnswer, setSecurityAnswer] = useState("");
  const [otpCode, setOtpCode] = useState("");
  
  const [receivedToken, setReceivedToken] = useState("");
  const [newPassword, setNewPassword] = useState("");

  const handleEmailSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setStep(2);
  };

  const handleVerificationSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    const mockSecureToken = "jwt_reset_token_xyz123abc";
    setReceivedToken(mockSecureToken);
    setStep(3);
  };

  const handlePasswordResetSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    console.log("Sending backend Token:", receivedToken, "with new password:", newPassword);
    alert("Password reset completed successfully!");
    onNavigate("login");
  };

  return (
    <div className="relative">
      {/* Back Button */}
      {step < 3 && (
        <button
          onClick={() => (step === 1 ? onNavigate("login") : setStep((step - 1) as ForgotStep))}
          className="mb-5 flex items-center gap-1.5 text-xs font-bold uppercase tracking-wider text-muted-foreground hover:text-foreground transition-colors"
        >
          <ArrowLeft className="h-3.5 w-3.5" /> Back
        </button>
      )}

      {/* STEP 1: REQUEST EMAIL */}
      {step === 1 && (
        <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} className="space-y-5">
          <div className="space-y-2">
            <h1 className="text-2xl font-bold tracking-tight">Identify Account</h1>
            <p className="text-sm text-muted-foreground">Enter your account email address to start recovery</p>
          </div>

          {/* Embedded Image Slot Step 1 (Synced with Amber Recovery System Geometry) */}
          <div className="w-full flex items-center justify-center p-2 opacity-90">
            <svg className="w-full max-h-24 object-contain" viewBox="0 0 200 80" fill="none" xmlns="http://www.w3.org/2000/svg">
              <rect x="10" y="10" width="180" height="60" rx="8" fill="var(--muted)" fillOpacity="0.4" stroke="var(--border)"/>
              <circle cx="50" cy="40" r="14" fill="var(--amber-500)" fillOpacity="0.1" stroke="#f59e0b" strokeWidth="1.5"/>
              <path d="M45 40 H55 M50 35 V45" stroke="#f59e0b" strokeWidth="2"/>
              <line x1="80" y1="35" x2="160" y2="35" stroke="var(--border)" strokeWidth="2"/>
              <line x1="80" y1="45" x2="130" y2="45" stroke="var(--border)" strokeWidth="2" opacity="0.5"/>
            </svg>
          </div>

          <form onSubmit={handleEmailSubmit} className="space-y-4">
            <div className="space-y-1.5">
              <label className="text-xs font-bold uppercase tracking-wider text-muted-foreground/90">Email Address</label>
              <div className="relative">
                <Mail className="absolute top-1/2 left-3.5 h-4 w-4 -translate-y-1/2 text-muted-foreground/60" />
                <input
                  type="email"
                  required
                  className="w-full rounded-xl border border-input bg-background/40 py-2.5 pr-4 pl-11 text-sm outline-none transition-all focus:border-primary focus:ring-4 focus:ring-primary/10"
                  placeholder="your-email@example.com"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                />
              </div>
            </div>
            <button
              type="submit"
              className="flex w-full items-center justify-center gap-2 rounded-xl bg-primary py-2.5 text-sm font-semibold text-primary-foreground shadow-md"
            >
              Continue <ArrowRight className="h-4 w-4" />
            </button>
          </form>
        </motion.div>
      )}

      {/* STEP 2: SECURITY VERIFICATION */}
      {step === 2 && (
        <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} className="space-y-5">
          <div className="space-y-1">
            <h1 className="text-2xl font-bold tracking-tight">Verification</h1>
            <p className="text-xs font-semibold text-amber-600 dark:text-amber-400">
              Complete security parameters configured on initial layout initialization.
            </p>
          </div>

          {/* Embedded Image Slot Step 2 */}
          <div className="w-full flex items-center justify-center p-1 opacity-90">
            <svg className="w-full max-h-20 object-contain" viewBox="0 0 200 60" fill="none" xmlns="http://www.w3.org/2000/svg">
              <rect width="200" height="60" rx="8" fill="var(--muted)" fillOpacity="0.3"/>
              <circle cx="100" cy="30" r="16" fill="var(--card)" stroke="#f59e0b" strokeWidth="2"/>
              <path d="M96 30 L104 30" stroke="#f59e0b" strokeWidth="2"/>
              <line x1="20" y1="30" x2="70" y2="30" stroke="var(--border)" strokeWidth="2" strokeDasharray="4 4"/>
              <line x1="130" y1="30" x2="180" y2="30" stroke="var(--border)" strokeWidth="2" strokeDasharray="4 4"/>
            </svg>
          </div>

          <form onSubmit={handleVerificationSubmit} className="space-y-4">
            <div className="space-y-2 rounded-xl border border-border bg-muted/30 p-3.5">
              <label className="text-[10px] font-bold uppercase tracking-widest text-muted-foreground flex items-center gap-1.5">
                <HelpCircle className="h-3.5 w-3.5" /> Challenge Target
              </label>
              <p className="text-sm font-medium text-foreground leading-snug">{securityQuestion}</p>
              <div className="relative mt-1.5">
                <ShieldQuestion className="absolute top-1/2 left-3 h-4 w-4 -translate-y-1/2 text-muted-foreground/70" />
                <input
                  type="text"
                  required
                  className="w-full rounded-lg border border-input bg-background py-2 pr-4 pl-10 text-sm outline-none transition-all focus:border-primary"
                  placeholder="Provide registration answer"
                  value={securityAnswer}
                  onChange={(e) => setSecurityAnswer(e.target.value)}
                />
              </div>
            </div>

            <div className="relative flex py-0.5 items-center">
              <div className="flex-grow border-t border-border/60"></div>
              <span className="flex-shrink mx-3 text-[10px] font-bold tracking-wider text-muted-foreground/70 uppercase">And Key Match</span>
              <div className="flex-grow border-t border-border/60"></div>
            </div>

            <div className="space-y-1.5">
              <label className="text-xs font-bold uppercase tracking-wider text-muted-foreground/90">One-Time Password (OTP)</label>
              <div className="relative">
                <KeyRound className="absolute top-1/2 left-3.5 h-4 w-4 -translate-y-1/2 text-muted-foreground/60" />
                <input
                  type="text"
                  required
                  maxLength={6}
                  className="w-full tracking-[0.35em] rounded-xl border border-input bg-background py-2.5 pr-4 pl-11 text-sm font-bold outline-none transition-all focus:border-primary"
                  placeholder="654321"
                  value={otpCode}
                  onChange={(e) => setOtpCode(e.target.value)}
                />
              </div>
            </div>

            <button
              type="submit"
              className="flex w-full items-center justify-center gap-2 rounded-xl bg-primary py-2.5 text-sm font-semibold text-primary-foreground shadow-sm"
            >
              Verify Identity & Get Token
            </button>
          </form>
        </motion.div>
      )}

      {/* STEP 3: RESET PASS */}
      {step === 3 && (
        <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} className="space-y-4">
          <div className="space-y-2 text-center">
            <div className="mx-auto flex h-12 w-12 items-center justify-center rounded-full bg-emerald-500/10 text-emerald-500 shadow-inner">
              <CheckCircle2 className="h-6 w-6" />
            </div>
            <h1 className="text-2xl font-bold tracking-tight">Set New Password</h1>
            <p className="text-xs text-muted-foreground">
              Verification approved. Token payload parsed successfully.
            </p>
          </div>

          {/* Embedded Image Slot Step 3 */}
          <div className="w-full flex items-center justify-center p-1 opacity-90">
            <svg className="w-full max-h-20 object-contain" viewBox="0 0 200 60" fill="none" xmlns="http://www.w3.org/2000/svg">
              <rect width="200" height="60" rx="8" fill="var(--muted)" fillOpacity="0.3"/>
              <path d="M70 32 L85 45 L130 18" stroke="#10b981" strokeWidth="3" strokeLinecap="round" strokeLinejoin="round"/>
            </svg>
          </div>

          <form onSubmit={handlePasswordResetSubmit} className="space-y-4">
            <div className="rounded-xl border border-border bg-muted/50 p-3.5 text-[11px] font-mono break-all text-muted-foreground shadow-inner">
              <span className="font-bold text-foreground block mb-1 text-[10px] uppercase tracking-wider">Active Authorization Token:</span>
              {receivedToken}
            </div>

            <div className="space-y-1.5">
              <label className="text-xs font-bold uppercase tracking-wider text-muted-foreground/90">New Password</label>
              <div className="relative">
                <Lock className="absolute top-1/2 left-3.5 h-4 w-4 -translate-y-1/2 text-muted-foreground/60" />
                <input
                  type="password"
                  required
                  className="w-full rounded-xl border border-input bg-background py-2.5 pr-4 pl-11 text-sm outline-none transition-all focus:border-primary"
                  placeholder="Enter new complex password"
                  value={newPassword}
                  onChange={(e) => setNewPassword(e.target.value)}
                />
              </div>
            </div>

            <button
              type="submit"
              className="flex w-full items-center justify-center rounded-xl bg-emerald-600 py-2.5 text-sm font-semibold text-white transition-all hover:bg-emerald-500 shadow-md"
            >
              Save & Return to Login
            </button>
          </form>
        </motion.div>
      )}
    </div>
  );
}