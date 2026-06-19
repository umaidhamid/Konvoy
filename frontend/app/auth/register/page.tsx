"use client";

import { useState } from "react";
import { toast } from "sonner";
import { authService } from "@/service/auth.service";
import { Loader2, Copy, Download, CheckCircle2, AlertTriangle } from "lucide-react";

export default function RegisterPage() {
  const [loading, setLoading] = useState(false);
  const [formData, setFormData] = useState({
    fullName: "umaidkhan",
    phone: "03001234567",
    email: "umaid.uk39@gmail.com",
    password: "Password123!",
    confirmPassword: "Password123!",
  });

  const [showModal, setShowModal] = useState(false);
  const [recoveryData, setRecoveryData] = useState<{ recoveryCode: string; email: string } | null>(null);

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (formData.password !== formData.confirmPassword) {
      toast.error("Passwords do not match");
      return;
    }

    setLoading(true);
    try {
      const response = await authService.register(
        formData.fullName, formData.phone, formData.email, formData.password
      );
      setRecoveryData({ recoveryCode: response.user.recoveryCode, email: response.user.email });
      setShowModal(true);
    } catch (error: any) {
      toast.error(error?.response?.data?.message || "Registration failed");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-slate-50 p-4">
      <div className="w-full max-w-md bg-white p-8 rounded-3xl shadow-xl border border-slate-100">
        <div className="text-center mb-8">
          <h2 className="text-3xl font-bold text-slate-900">Create Account</h2>
          <p className="text-slate-500 mt-2">Get started with your secure journey</p>
        </div>

        <form onSubmit={handleSubmit} className="space-y-4">
          {["fullName", "phone", "email", "password", "confirmPassword"].map((field) => (
            <div key={field}>
              <label className="block text-xs font-semibold text-slate-500 uppercase tracking-wider mb-1">
                {field.replace(/([A-Z])/g, " $1")}
              </label>
              <input 
             value={formData[field as keyof typeof formData]}
                name={field}
                type={field.includes("password") ? "password" : field === "email" ? "email" : "text"}
                required
                className="w-full px-4 py-3 bg-slate-50 border border-slate-200 rounded-xl focus:ring-2 focus:ring-blue-500 outline-none transition"
                onChange={handleChange}
              />
            </div>
          ))}

          <button 
            disabled={loading}
            className="w-full bg-blue-600 text-white font-bold py-4 rounded-xl hover:bg-blue-700 transition flex items-center justify-center gap-2 mt-6 disabled:opacity-70"
          >
            {loading ? <Loader2 className="animate-spin" /> : "Complete Registration"}
          </button>
        </form>
      </div>

      {/* Recovery Modal */}
      {showModal && recoveryData && (
        <div className="fixed inset-0 bg-slate-900/40 backdrop-blur-sm flex items-center justify-center p-4 z-50">
          <div className="bg-white p-8 rounded-3xl max-w-sm w-full shadow-2xl border border-slate-100 animate-in zoom-in-95 duration-200">
            <div className="text-center">
              <div className="w-16 h-16 bg-amber-100 text-amber-600 rounded-full flex items-center justify-center mx-auto mb-4">
                <AlertTriangle size={32} />
              </div>
              <h3 className="text-xl font-bold text-slate-900">Save Recovery Code</h3>
              <p className="text-slate-500 text-sm mt-2 mb-6">
                This is the <strong>only time</strong> you will see this code. Use it to recover your account if you lose email access.
              </p>
            </div>

            <div className="bg-slate-900 text-white p-4 rounded-xl text-center text-2xl font-mono tracking-widest mb-6">
              {recoveryData.recoveryCode}
           
            </div>

            <div className="flex gap-2">
              <button onClick={() => { navigator.clipboard.writeText(recoveryData.recoveryCode); toast.success("Copied!"); }} 
                className="flex-1 bg-slate-100 text-slate-700 py-3 rounded-xl flex items-center justify-center gap-2 hover:bg-slate-200 font-medium">
                <Copy size={16} /> Copy
              </button>
              <button onClick={() => { /* ... trigger download logic ... */ }} 
                className="flex-1 bg-blue-600 text-white py-3 rounded-xl flex items-center justify-center gap-2 hover:bg-blue-700 font-medium">
                <Download size={16} /> Save
              </button>
            </div>
            
            <button onClick={() => setShowModal(false)} className="w-full mt-4 text-slate-400 hover:text-slate-600 text-sm font-medium">
              I have saved this safely
            </button>
          </div>
        </div>
      )}
    </div>
  );
}