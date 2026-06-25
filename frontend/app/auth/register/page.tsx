"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { Eye, EyeOff, Loader2, Copy, Download, AlertTriangle, Terminal, Shield, Share2, Code2 } from "lucide-react";
import { toast } from "sonner";
import { authService } from "@/service/auth.service";

import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";

// ---------------------------------------------------------------------------
// Shared style tokens (Exactly aligned with LoginPage)
// ---------------------------------------------------------------------------

const inputStyles =
  "h-12 w-full rounded-xl border border-slate-200 bg-white px-3.5 text-sm text-slate-900 " +
  "placeholder:text-slate-400 transition-colors duration-150 " +
  "focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-slate-900 focus-visible:ring-offset-0 focus-visible:border-slate-900 " +
  "disabled:cursor-not-allowed disabled:opacity-50 " +
  "dark:border-slate-800 dark:bg-slate-950 dark:text-slate-50 dark:placeholder:text-slate-500 dark:focus-visible:ring-white dark:focus-visible:border-white";

const labelStyles =
  "text-xs font-semibold uppercase tracking-wide text-slate-600 dark:text-slate-400";

const primaryButtonStyles =
  "h-12 w-full rounded-xl bg-slate-900 text-sm font-medium text-white shadow-sm " +
  "transition-colors duration-150 hover:bg-slate-800 " +
  "focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-slate-900 focus-visible:ring-offset-2 " +
  "disabled:cursor-not-allowed disabled:opacity-60 " +
  "dark:bg-white dark:text-slate-900 dark:hover:bg-slate-200 dark:focus-visible:ring-white";

const secondaryButtonStyles =
  "h-12 flex-1 rounded-xl border border-slate-200 bg-slate-50 text-sm font-semibold text-slate-700 " +
  "transition-colors duration-150 hover:bg-slate-100 " +
  "focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-slate-300 focus-visible:ring-offset-2 " +
  "dark:border-slate-700 dark:bg-slate-800 dark:text-slate-200 dark:hover:bg-slate-700";

// ---------------------------------------------------------------------------
// Field configuration
// ---------------------------------------------------------------------------

type FieldName = "fullName" | "phone" | "email" | "password" | "confirmPassword";

interface FieldConfig {
  name: FieldName;
  label: string;
  type: "text" | "email" | "tel" | "password";
  autoComplete?: string;
  placeholder?: string;
  helperText?: string;
}

const FIELDS: FieldConfig[] = [
  { name: "fullName", label: "Full name", type: "text", autoComplete: "name", placeholder: "Alex Mercer" },
  { name: "phone", label: "Phone number", type: "tel", autoComplete: "tel", placeholder: "+1 (555) 000-0000" },
  { name: "email", label: "Work email", type: "email", autoComplete: "email", placeholder: "name@company.com" },
  {
    name: "password",
    label: "Password",
    type: "password",
    autoComplete: "new-password",
    placeholder: "••••••••",
    helperText: "Requires 8+ characters with mixed case letters, numbers & symbols.",
  },
  {
    name: "confirmPassword",
    label: "Confirm password",
    type: "password",
    placeholder: "••••••••",
    autoComplete: "new-password",
  },
];

// ---------------------------------------------------------------------------
// Reusable sub-components
// ---------------------------------------------------------------------------

interface PasswordInputProps {
  id: string;
  name: string;
  value: string;
  onChange: (e: React.ChangeEvent<HTMLInputElement>) => void;
  placeholder?: string;
  autoComplete?: string;
  required?: boolean;
}

function PasswordInput({ id, name, value, onChange, placeholder, autoComplete, required }: PasswordInputProps) {
  const [visible, setVisible] = useState(false);

  return (
    <div className="relative">
      <Input
        id={id}
        name={name}
        type={visible ? "text" : "password"}
        required={required}
        placeholder={placeholder}
        value={value}
        onChange={onChange}
        autoComplete={autoComplete}
        className={`${inputStyles} pr-11`}
      />
      <button
        type="button"
        onClick={() => setVisible((v) => !v)}
        className="absolute right-3.5 top-1/2 -translate-y-1/2 text-slate-400 transition-colors hover:text-slate-700 dark:text-slate-500 dark:hover:text-slate-200"
        aria-label={visible ? "Hide password" : "Show password"}
        tabIndex={-1}
      >
        {visible ? <EyeOff size={18} /> : <Eye size={18} />}
      </button>
    </div>
  );
}

interface FormFieldProps {
  config: FieldConfig;
  value: string;
  onChange: (e: React.ChangeEvent<HTMLInputElement>) => void;
}

function FormField({ config, value, onChange }: FormFieldProps) {
  const { name, label, type, autoComplete, placeholder, helperText } = config;

  return (
    <div className="space-y-1.5">
      <Label htmlFor={name} className={labelStyles}>
        {label}
      </Label>

      {type === "password" ? (
        <PasswordInput
          id={name}
          name={name}
          value={value}
          onChange={onChange}
          placeholder={placeholder}
          autoComplete={autoComplete}
          required
        />
      ) : (
        <Input
          id={name}
          name={name}
          type={type}
          required
          placeholder={placeholder}
          value={value}
          onChange={onChange}
          autoComplete={autoComplete}
          className={inputStyles}
        />
      )}

      {helperText && (
        <p className="text-[11px] leading-normal text-slate-400 dark:text-slate-500">{helperText}</p>
      )}
    </div>
  );
}

interface FeatureBadgeProps {
  icon: React.ReactNode;
  label: string;
}

function FeatureBadge({ icon, label }: FeatureBadgeProps) {
  return (
    <div className="flex items-center gap-2.5 rounded-xl border border-slate-800 bg-slate-900 p-3">
      <span className="shrink-0 text-slate-300">{icon}</span>
      <span className="text-xs font-medium tracking-wide text-slate-200">{label}</span>
    </div>
  );
}

function BrandMark({ light = false }: { light?: boolean }) {
  return (
    <div className="flex items-center gap-3">
      <div
        className={
          light
            ? "flex h-9 w-9 items-center justify-center rounded-xl bg-white"
            : "flex h-9 w-9 items-center justify-center rounded-xl bg-slate-900 dark:bg-white"
        }
      >
        <span
          className={
            light
              ? "text-sm font-black tracking-tight text-slate-900"
              : "text-sm font-black tracking-tight text-white dark:text-slate-900"
          }
        >
          K
        </span>
      </div>
      <span
        className={
          light
            ? "text-lg font-semibold tracking-tight text-white"
            : "text-lg font-semibold tracking-tight text-slate-900 dark:text-slate-50"
        }
      >
        Konoy
      </span>
    </div>
  );
}

interface RecoveryModalProps {
  recoveryCode: string;
  onCopy: () => void;
  onDownload: () => void;
  onDismiss: () => void;
}

function RecoveryModal({ recoveryCode, onCopy, onDownload, onDismiss }: RecoveryModalProps) {
  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-950/60 p-4 backdrop-blur-sm">
      <div className="w-full max-w-[400px] rounded-2xl border border-slate-200 bg-white p-6 shadow-xl sm:p-8 dark:border-slate-800 dark:bg-slate-900">
        <div className="text-center">
          <div className="mx-auto mb-4 flex h-12 w-12 items-center justify-center rounded-full border border-amber-100 bg-amber-50 text-amber-600 dark:border-amber-900/30 dark:bg-amber-950/30">
            <AlertTriangle size={22} />
          </div>
          <h3 className="text-lg font-semibold tracking-tight text-slate-900 dark:text-slate-50">
            Save your recovery code
          </h3>
          <p className="mt-2 text-sm leading-relaxed text-slate-500 dark:text-slate-400">
            This is the <span className="font-semibold text-slate-700 dark:text-slate-300">only time</span> this
            code will be shown. Store it somewhere safe — you&apos;ll need it to recover account control.
          </p>
        </div>

        <div className="mt-6 rounded-xl border border-slate-800 bg-slate-950 px-4 py-4 text-center font-mono text-lg font-semibold tracking-wider text-white dark:border-slate-700">
          {recoveryCode}
        </div>

        <div className="mt-6 flex gap-3">
          <button type="button" onClick={onCopy} className={secondaryButtonStyles}>
            <span className="flex items-center justify-center gap-2">
              <Copy size={16} /> Copy
            </span>
          </button>
          <button type="button" onClick={onDownload} className={primaryButtonStyles}>
            <span className="flex items-center justify-center gap-2">
              <Download size={16} /> Save file
            </span>
          </button>
        </div>

        <button
          type="button"
          onClick={onDismiss}
          className="mt-5 w-full text-center text-xs font-semibold uppercase tracking-wider text-slate-400 transition-colors hover:text-slate-600 dark:text-slate-500 dark:hover:text-slate-300"
        >
          I&apos;ve saved this securely
        </button>
      </div>
    </div>
  );
}

// ---------------------------------------------------------------------------
// Main page
// ---------------------------------------------------------------------------

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