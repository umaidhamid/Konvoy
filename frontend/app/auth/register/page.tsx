"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { Loader2, Terminal, Shield, Share2, Code2 } from "lucide-react";
import { toast } from "sonner";
import { authService } from "@/service/auth.service";

import { Button } from "@/components/ui/button";

// Modular Global Layout & Shared Components
import { primaryButtonStyles } from "@/components/auth/auth-styles";
import { BrandMark } from "@/components/auth/brand-mark";
import { FeatureBadge } from "@/components/auth/feature-badge";

// Modular Registration Local Components
import { FormField, FIELDS } from "@/components/auth/register-field";
import { RecoveryModal } from "@/components/auth/recovery-modal";

export default function RegisterPage() {
  const [isLoading, setIsLoading] = useState(false);
  const router = useRouter();

  const [formData, setFormData] = useState({
    fullName: "umaidkhan",
    phone: "03001234567",
    email: "umaid.hamid.in@gmail.com",
    password: "Password123!",
    confirmPassword: "Password123!",
  });

  const [showModal, setShowModal] = useState(false);
  const [recoveryData, setRecoveryData] = useState<{ recoveryCode: string; email: string } | null>(null);

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
  };

  const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    if (formData.password !== formData.confirmPassword) {
      toast.error("Passwords do not match");
      return;
    }

    setIsLoading(true);
    try {
      const response = await authService.register(
        formData.fullName,
        formData.phone,
        formData.email,
        formData.password
      );
      setRecoveryData({
        recoveryCode: response.user.recoveryCode || "RC-XXXX-YYYY",
        email: response.user.email,
      });
      setShowModal(true);
      toast.success("Account created successfully!");
    } catch (error: any) {
      toast.error(error.response.data.errors.body[0]);
    } finally {
      setIsLoading(false);
    }
  };

  const handleCopyCode = async () => {
    if (!recoveryData) return;
    await navigator.clipboard.writeText(recoveryData.recoveryCode);
    toast.success("Recovery code copied to clipboard!");
  };

  const handleDownloadCode = () => {
    if (!recoveryData) return;
    const element = document.createElement("a");
    const file = new Blob(
      [`Account Recovery Code for ${recoveryData.email}: ${recoveryData.recoveryCode}`],
      { type: "text/plain" }
    );
    element.href = URL.createObjectURL(file);
    element.download = `konoy-recovery-${recoveryData.email}.txt`;
    document.body.appendChild(element);
    element.click();
    document.body.removeChild(element);
    toast.success("Recovery code file downloaded!");
  };

  return (
    <div className="flex min-h-screen w-full bg-white lg:grid lg:grid-cols-12 dark:bg-slate-950">
      {/* Left: brand / product panel */}
      <div className="relative hidden flex-col justify-between border-r border-slate-800 bg-slate-950 p-12 text-white lg:col-span-5 lg:flex xl:col-span-4">
        <BrandMark light />

        <div className="flex max-w-sm flex-col gap-5">
          <h1 className="text-3xl font-semibold leading-tight tracking-tight text-white">
            Build on a secure, developer-first engine.
          </h1>
          <p className="text-sm leading-relaxed text-slate-400">
            Create your enterprise sandbox account environment instantly. Store isolated configuration 
            deployments and sync variables via simple cryptographic channels.
          </p>
        </div>

        <div className="grid grid-cols-2 gap-3">
          <FeatureBadge icon={<Terminal size={16} />} label="CLI fetching" />
          <FeatureBadge icon={<Shield size={16} />} label="Encrypted" />
          <FeatureBadge icon={<Share2 size={16} />} label="Share links" />
          <FeatureBadge icon={<Code2 size={16} />} label="Dev docs" />
        </div>

        <div className="flex items-center gap-2 text-xs text-slate-500">
          <span className="h-1.5 w-1.5 rounded-full bg-emerald-500" />
          <span>v1.0.4 — Enterprise Registration Workspace</span>
        </div>
      </div>

      {/* Right: authentication form */}
      <div className="flex flex-1 items-center justify-center p-6 sm:p-10 lg:col-span-7 xl:col-span-8">
        <div className="w-full max-w-[440px]">
          <div className="mb-8 flex justify-center lg:hidden">
            <BrandMark />
          </div>

          <div className="w-full rounded-2xl border border-slate-200 bg-white p-8 shadow-sm dark:border-slate-800 dark:bg-slate-900">
            <div className="mb-7 space-y-1.5">
              <h2 className="text-2xl font-semibold tracking-tight text-slate-900 dark:text-slate-50">
                Create account
              </h2>
              <p className="text-sm text-slate-500 dark:text-slate-400">
                Setup your profile credentials to enter the workspace dashboard.
              </p>
            </div>

            <form onSubmit={handleSubmit} className="space-y-4">
              {FIELDS.map((field) => (
                <FormField
                  key={field.name}
                  config={field}
                  value={formData[field.name]}
                  onChange={handleChange}
                />
              ))}

              <Button type="submit" disabled={isLoading} className={`${primaryButtonStyles} mt-2`}>
                <span className="flex items-center justify-center">
                  {isLoading && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
                  {isLoading ? "Provisioning..." : "Complete registration"}
                </span>
              </Button>
            </form>

            <div className="mt-7 border-t border-slate-100 pt-5 text-center text-sm text-slate-500 dark:border-slate-800 dark:text-slate-400">
              Already have an account?{" "}
              <a 
                href="/auth/login" 
                className="font-semibold text-slate-900 underline-offset-4 hover:underline dark:text-slate-50"
              >
                Sign in
              </a>
            </div>
          </div>
        </div>
      </div>

      {showModal && recoveryData && (
        <RecoveryModal
          recoveryCode={recoveryData.recoveryCode}
          onCopy={handleCopyCode}
          onDownload={handleDownloadCode}
          onDismiss={() => {
            setShowModal(false);
            router.push("/auth/login");
          }}
        />
      )}
    </div>
  );
}