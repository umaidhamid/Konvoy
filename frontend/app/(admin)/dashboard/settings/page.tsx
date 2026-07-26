"use client";

import React, { useContext, useEffect, useRef, useState } from "react";
import {
  Bell,
  Camera,
  KeyRound,
  LogOut,
  Loader2,
  Mail,
  RefreshCcw,
  Shield,
} from "lucide-react";
import { toast } from "sonner";
import { useRouter } from "next/navigation";
import { AuthContext } from "@/context/AuthContext";
import { authService } from "@/services/auth.service";
import { notificationsService } from "@/services/notifications.service";
import { RecoveryModal } from "@/components/auth/recovery-modal";

function SectionCard({
  icon: Icon,
  title,
  description,
  children,
}: {
  icon: React.ElementType;
  title: string;
  description: string;
  children: React.ReactNode;
}) {
  return (
    <div className="rounded-xl border border-border bg-card overflow-hidden">
      <div className="px-6 py-5 border-b border-border flex items-start gap-3">
        <div className="w-9 h-9 rounded-lg bg-primary/10 text-primary flex items-center justify-center shrink-0">
          <Icon className="w-4.5 h-4.5" />
        </div>
        <div className="min-w-0">
          <h2 className="text-sm font-semibold">{title}</h2>
          <p className="text-xs text-muted-foreground mt-0.5">{description}</p>
        </div>
      </div>
      <div className="p-6">{children}</div>
    </div>
  );
}

function FieldLabel({ children }: { children: React.ReactNode }) {
  return (
    <label className="block text-xs font-semibold text-muted-foreground tracking-wide uppercase mb-1.5">
      {children}
    </label>
  );
}

const inputClass =
  "w-full px-3.5 py-2.5 bg-background border border-border rounded-lg text-sm placeholder:text-muted-foreground focus:outline-none focus:border-primary focus:ring-1 focus:ring-primary/30 transition";

const primaryButtonClass =
  "px-4 py-2 bg-primary text-primary-foreground font-medium text-sm rounded-lg shadow-sm hover:opacity-90 disabled:opacity-50 disabled:cursor-not-allowed transition";

const secondaryButtonClass =
  "px-4 py-2 bg-secondary text-secondary-foreground font-medium text-sm rounded-lg hover:bg-secondary/70 disabled:opacity-50 disabled:cursor-not-allowed transition";

export default function SettingsPage() {
  const { user, setUser, loading } = useContext(AuthContext);
  const router = useRouter();

  // Profile (name)
  const [fullname, setFullname] = useState("");
  const [profileSubmitting, setProfileSubmitting] = useState(false);
  const [profileMessage, setProfileMessage] = useState("");
  const [profileError, setProfileError] = useState("");

  useEffect(() => {
    if (user) setFullname(user.fullname);
  }, [user]);

  // Avatar
  const avatarInputRef = useRef<HTMLInputElement>(null);
  const [avatarUploading, setAvatarUploading] = useState(false);

  // Password
  const [currentPassword, setCurrentPassword] = useState("");
  const [newPassword, setNewPassword] = useState("");
  const [passwordSubmitting, setPasswordSubmitting] = useState(false);
  const [passwordMessage, setPasswordMessage] = useState("");
  const [passwordError, setPasswordError] = useState("");

  // Email change
  const [newEmail, setNewEmail] = useState("");
  const [emailChangePassword, setEmailChangePassword] = useState("");
  const [emailChangeSubmitting, setEmailChangeSubmitting] = useState(false);
  const [emailChangeMessage, setEmailChangeMessage] = useState("");
  const [emailChangeError, setEmailChangeError] = useState("");

  // Recovery code
  const [recoveryPassword, setRecoveryPassword] = useState("");
  const [recoverySubmitting, setRecoverySubmitting] = useState(false);
  const [recoveryError, setRecoveryError] = useState("");
  const [newRecoveryCode, setNewRecoveryCode] = useState("");

  // Notifications
  const [markAllMessage, setMarkAllMessage] = useState("");

  const handleProfileSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setProfileError("");
    setProfileMessage("");
    if (!fullname.trim()) return setProfileError("Full name is required.");

    setProfileSubmitting(true);
    try {
      const res = await authService.updateProfile(fullname.trim());
      if (res.success) {
        setProfileMessage("Name updated.");
        setUser((prev) => (prev ? { ...prev, fullname: res.user.fullname } : prev));
      }
    } catch (err: any) {
      setProfileError(err?.response?.data?.message || "Could not update your name.");
    } finally {
      setProfileSubmitting(false);
    }
  };

  const handleAvatarSelected = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    e.target.value = "";
    if (!file) return;

    setAvatarUploading(true);
    try {
      const res = await authService.uploadAvatar(file);
      if (res.success) {
        setUser((prev) => (prev ? { ...prev, profileImage: res.user.profileImage } : prev));
        toast.success("Profile picture updated.");
      }
    } catch (err: any) {
      toast.error(err?.response?.data?.message || "Could not upload profile picture.");
    } finally {
      setAvatarUploading(false);
    }
  };

  const handlePasswordSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setPasswordError("");
    setPasswordMessage("");
    if (!currentPassword || !newPassword) {
      return setPasswordError("Both current and new password are required.");
    }

    setPasswordSubmitting(true);
    try {
      const res = await authService.changePassword(currentPassword, newPassword);
      if (res.success) {
        setPasswordMessage("Password changed successfully.");
        setCurrentPassword("");
        setNewPassword("");
      }
    } catch (err: any) {
      setPasswordError(err?.response?.data?.message || "Could not change password.");
    } finally {
      setPasswordSubmitting(false);
    }
  };

  const handleEmailChangeSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (emailChangeSubmitting) return;
    setEmailChangeError("");
    setEmailChangeMessage("");
    if (!newEmail.trim() || !emailChangePassword) {
      return setEmailChangeError("New email and password are required.");
    }

    setEmailChangeSubmitting(true);
    try {
      const res = await authService.requestEmailChange(newEmail.trim(), emailChangePassword);
      if (res.success) {
        setEmailChangeMessage(res.message || "Check your new email to confirm the change.");
        setNewEmail("");
        setEmailChangePassword("");
      }
    } catch (err: any) {
      setEmailChangeError(err?.response?.data?.message || "Could not request email change.");
    } finally {
      setEmailChangeSubmitting(false);
    }
  };

  const handleRecoveryRegenSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (recoverySubmitting) return;
    setRecoveryError("");
    if (!recoveryPassword) return setRecoveryError("Password is required.");

    setRecoverySubmitting(true);
    try {
      const res = await authService.regenerateRecoveryCode(recoveryPassword);
      if (res.success) {
        setNewRecoveryCode(res.recoveryCode);
        setRecoveryPassword("");
      }
    } catch (err: any) {
      setRecoveryError(err?.response?.data?.message || "Could not regenerate recovery code.");
    } finally {
      setRecoverySubmitting(false);
    }
  };

  const handleCopyRecoveryCode = async () => {
    await navigator.clipboard.writeText(newRecoveryCode);
    toast.success("Recovery code copied to clipboard!");
  };

  const handleDownloadRecoveryCode = () => {
    const element = document.createElement("a");
    const file = new Blob([`Account recovery code for ${user?.email}: ${newRecoveryCode}`], { type: "text/plain" });
    element.href = URL.createObjectURL(file);
    element.download = `konvoy-recovery-${user?.email}.txt`;
    document.body.appendChild(element);
    element.click();
    document.body.removeChild(element);
    toast.success("Recovery code file downloaded!");
  };

  const handleMarkAllRead = async () => {
    setMarkAllMessage("");
    try {
      await notificationsService.markAllRead();
      setMarkAllMessage("All notifications marked as read.");
    } catch (err: any) {
      setMarkAllMessage(err?.response?.data?.message || "Could not mark notifications as read.");
    }
  };

  const handleLogout = async () => {
    await authService.logout();
    router.push("/login");
    toast.success("Logged out successfully");
  };

  if (loading) {
    return (
      <div className="flex justify-center py-20">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary"></div>
      </div>
    );
  }

  const nameDirty = fullname.trim() !== "" && fullname.trim() !== user?.fullname;

  return (
    <div className="p-6 md:p-10">
      <div className="max-w-3xl mx-auto space-y-6">
        <div className="pb-6 border-b border-border">
          <h1 className="text-2xl font-bold tracking-tight">Settings</h1>
          <p className="text-sm text-muted-foreground mt-1">
            Manage your profile, security, and notification preferences.
          </p>
        </div>

        {/* Profile */}
        <div className="rounded-xl border border-border bg-card overflow-hidden">
          <div className="p-6 flex flex-col sm:flex-row sm:items-center gap-6">
            <div className="relative group shrink-0 mx-auto sm:mx-0">
              <div className="w-24 h-24 rounded-full overflow-hidden bg-secondary flex items-center justify-center text-2xl font-semibold text-secondary-foreground border-2 border-border">
                {user?.profileImage ? (
                  <img src={user.profileImage} alt="" className="w-full h-full object-cover" />
                ) : (
                  (user?.fullname || user?.email || "?").charAt(0).toUpperCase()
                )}
              </div>
              <button
                type="button"
                onClick={() => avatarInputRef.current?.click()}
                disabled={avatarUploading}
                title="Change profile picture"
                className="absolute inset-0 rounded-full bg-black/55 flex items-center justify-center text-white opacity-0 group-hover:opacity-100 focus-visible:opacity-100 transition-opacity disabled:opacity-100"
              >
                {avatarUploading ? (
                  <Loader2 className="w-5 h-5 animate-spin" />
                ) : (
                  <Camera className="w-5 h-5" />
                )}
              </button>
              <input
                ref={avatarInputRef}
                type="file"
                accept="image/jpeg,image/png,image/webp,image/gif"
                className="hidden"
                onChange={handleAvatarSelected}
              />
            </div>

            <form onSubmit={handleProfileSubmit} className="flex-1 min-w-0 space-y-3">
              <div>
                <FieldLabel>Full name</FieldLabel>
                <div className="flex gap-2">
                  <input
                    type="text"
                    value={fullname}
                    onChange={(e) => setFullname(e.target.value)}
                    className={inputClass}
                    placeholder="Your name"
                  />
                  <button
                    type="submit"
                    disabled={!nameDirty || profileSubmitting}
                    className={`${primaryButtonClass} shrink-0`}
                  >
                    {profileSubmitting ? "Saving..." : "Save"}
                  </button>
                </div>
              </div>
              <p className="text-xs text-muted-foreground">
                Signed in as <span className="text-foreground font-medium">{user?.email}</span>
              </p>
              {profileError && (
                <p className="text-xs text-destructive bg-destructive/5 border border-destructive/20 px-3 py-2 rounded-lg">
                  {profileError}
                </p>
              )}
              {profileMessage && (
                <p className="text-xs text-success bg-success/5 border border-success/20 px-3 py-2 rounded-lg">
                  {profileMessage}
                </p>
              )}
            </form>
          </div>
        </div>

        {/* Email */}
        <SectionCard
          icon={Mail}
          title="Email address"
          description="Changing it sends a confirmation link to the new address first."
        >
          <form onSubmit={handleEmailChangeSubmit} className="space-y-4">
            <div className="grid sm:grid-cols-2 gap-4">
              <div>
                <FieldLabel>New email</FieldLabel>
                <input
                  type="email"
                  value={newEmail}
                  onChange={(e) => setNewEmail(e.target.value)}
                  placeholder="you@example.com"
                  className={inputClass}
                />
              </div>
              <div>
                <FieldLabel>Current password</FieldLabel>
                <input
                  type="password"
                  value={emailChangePassword}
                  onChange={(e) => setEmailChangePassword(e.target.value)}
                  placeholder="••••••••"
                  className={inputClass}
                />
              </div>
            </div>
            {emailChangeError && (
              <p className="text-xs text-destructive bg-destructive/5 border border-destructive/20 px-3 py-2 rounded-lg">
                {emailChangeError}
              </p>
            )}
            {emailChangeMessage && (
              <p className="text-xs text-success bg-success/5 border border-success/20 px-3 py-2 rounded-lg">
                {emailChangeMessage}
              </p>
            )}
            <div className="flex justify-end">
              <button type="submit" disabled={emailChangeSubmitting} className={primaryButtonClass}>
                {emailChangeSubmitting ? "Sending..." : "Send confirmation link"}
              </button>
            </div>
          </form>
        </SectionCard>

        {/* Password */}
        <SectionCard icon={KeyRound} title="Password" description="Use a strong password you don't reuse elsewhere.">
          <form onSubmit={handlePasswordSubmit} className="space-y-4">
            <div className="grid sm:grid-cols-2 gap-4">
              <div>
                <FieldLabel>Current password</FieldLabel>
                <input
                  type="password"
                  value={currentPassword}
                  onChange={(e) => setCurrentPassword(e.target.value)}
                  placeholder="••••••••"
                  className={inputClass}
                />
              </div>
              <div>
                <FieldLabel>New password</FieldLabel>
                <input
                  type="password"
                  value={newPassword}
                  onChange={(e) => setNewPassword(e.target.value)}
                  placeholder="••••••••"
                  className={inputClass}
                />
              </div>
            </div>
            {passwordError && (
              <p className="text-xs text-destructive bg-destructive/5 border border-destructive/20 px-3 py-2 rounded-lg">
                {passwordError}
              </p>
            )}
            {passwordMessage && (
              <p className="text-xs text-success bg-success/5 border border-success/20 px-3 py-2 rounded-lg">
                {passwordMessage}
              </p>
            )}
            <div className="flex justify-end">
              <button type="submit" disabled={passwordSubmitting} className={primaryButtonClass}>
                {passwordSubmitting ? "Updating..." : "Update password"}
              </button>
            </div>
          </form>
        </SectionCard>

        {/* Recovery code */}
        <SectionCard
          icon={RefreshCcw}
          title="Recovery code"
          description="Regenerating invalidates your old code. Requires your current password."
        >
          <form onSubmit={handleRecoveryRegenSubmit} className="space-y-4">
            <div className="max-w-xs">
              <FieldLabel>Current password</FieldLabel>
              <input
                type="password"
                value={recoveryPassword}
                onChange={(e) => setRecoveryPassword(e.target.value)}
                placeholder="••••••••"
                className={inputClass}
              />
            </div>
            {recoveryError && (
              <p className="text-xs text-destructive bg-destructive/5 border border-destructive/20 px-3 py-2 rounded-lg">
                {recoveryError}
              </p>
            )}
            <div className="flex justify-end">
              <button type="submit" disabled={recoverySubmitting} className={secondaryButtonClass}>
                {recoverySubmitting ? "Regenerating..." : "Regenerate recovery code"}
              </button>
            </div>
          </form>
        </SectionCard>

        {/* Notifications */}
        <SectionCard icon={Bell} title="Notifications" description="Manage how your unread notifications are handled.">
          <div className="flex items-center justify-between gap-4">
            <p className="text-sm text-muted-foreground">Clear your unread notification count.</p>
            <button onClick={handleMarkAllRead} className={secondaryButtonClass}>
              Mark all as read
            </button>
          </div>
          {markAllMessage && <p className="text-xs text-muted-foreground mt-3">{markAllMessage}</p>}
        </SectionCard>

        {/* Session */}
        <SectionCard icon={Shield} title="Session" description="Sign out of Konvoy on this device.">
          <div className="flex items-center justify-between gap-4">
            <p className="text-sm text-muted-foreground">You'll need to log in again to access your account.</p>
            <button
              onClick={handleLogout}
              className="px-4 py-2 border border-destructive/30 text-destructive font-medium text-sm rounded-lg hover:bg-destructive/5 transition flex items-center gap-2"
            >
              <LogOut className="w-3.5 h-3.5" />
              Log out
            </button>
          </div>
        </SectionCard>
      </div>

      {newRecoveryCode && (
        <RecoveryModal
          recoveryCode={newRecoveryCode}
          onCopy={handleCopyRecoveryCode}
          onDownload={handleDownloadRecoveryCode}
          onDismiss={() => setNewRecoveryCode("")}
        />
      )}
    </div>
  );
}
