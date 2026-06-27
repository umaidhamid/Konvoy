"use client";

import { useState } from "react";
import { Eye, EyeOff } from "lucide-react";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { inputStyles, labelStyles } from "./auth-styles";

export type FieldName = "fullName" | "phone" | "email" | "password" | "confirmPassword";

export interface FieldConfig {
  name: FieldName;
  label: string;
  type: "text" | "email" | "tel" | "password";
  autoComplete?: string;
  placeholder?: string;
  helperText?: string;
}

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

export function FormField({ config, value, onChange }: FormFieldProps) {
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

export const FIELDS: FieldConfig[] = [
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