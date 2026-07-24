"use client";

import { useState } from "react";
import { Loader2, Mail, MessageSquare, Clock, LifeBuoy } from "lucide-react";
import { toast } from "sonner";
import { contactService } from "@/services/contact.service";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Label } from "@/components/ui/label";

import { labelStyles, inputStyles, primaryButtonStyles } from "@/components/auth/auth-styles";
import { BrandMark } from "@/components/auth/brand-mark";
import { FeatureBadge } from "@/components/auth/feature-badge";

const textareaStyles =
  "w-full rounded-xl border border-slate-200 bg-white px-3.5 py-3 text-sm text-slate-900 " +
  "placeholder:text-slate-400 transition-colors duration-150 " +
  "focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-slate-900 focus-visible:ring-offset-0 focus-visible:border-slate-900 " +
  "disabled:cursor-not-allowed disabled:opacity-50 " +
  "dark:border-slate-800 dark:bg-slate-950 dark:text-slate-50 dark:placeholder:text-slate-500 dark:focus-visible:ring-white dark:focus-visible:border-white";

export default function ContactPage() {
  const [isLoading, setIsLoading] = useState(false);
  const [formData, setFormData] = useState({
    name: "",
    email: "",
    subject: "",
    message: "",
  });

  const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    setIsLoading(true);

    try {
      const response = await contactService.send(
        formData.name,
        formData.email,
        formData.subject,
        formData.message
      );

      toast.success(response?.message || "Message sent successfully");
      setFormData({ name: "", email: "", subject: "", message: "" });
    } catch (error: any) {
      toast.error(
        error?.response?.data?.message ||
          error?.message ||
          "Failed to send your message. Please try again."
      );
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="flex min-h-screen w-full bg-white lg:grid lg:grid-cols-12 dark:bg-slate-950">
      {/* Left: brand / info panel */}
      <div className="relative hidden flex-col justify-between overflow-hidden border-r border-slate-800 bg-slate-950 p-12 text-white lg:col-span-5 lg:flex xl:col-span-4">
        <div
          className="pointer-events-none absolute inset-0 opacity-[0.07]"
          style={{
            backgroundImage:
              "linear-gradient(to right, #fff 1px, transparent 1px), linear-gradient(to bottom, #fff 1px, transparent 1px)",
            backgroundSize: "36px 36px",
          }}
        />
        <div className="pointer-events-none absolute -left-32 -top-32 h-96 w-96 rounded-full bg-emerald-500/20 blur-[120px]" />
        <div className="pointer-events-none absolute -bottom-40 -right-24 h-96 w-96 rounded-full bg-indigo-500/20 blur-[120px]" />

        <div className="relative z-10">
          <BrandMark light />
        </div>

        <div className="relative z-10 flex max-w-sm flex-col gap-5">
          <h1 className="text-3xl font-semibold leading-tight tracking-tight text-white">
            We&apos;d love to hear from you.
          </h1>
          <p className="text-sm leading-relaxed text-slate-400">
            Questions about the CLI, encrypted file sharing, or your workspace? Send us a
            message and our team will get back to you shortly.
          </p>
        </div>

        <div className="relative z-10 grid grid-cols-2 gap-3">
          <FeatureBadge icon={<Mail size={16} />} label="Email support" />
          <FeatureBadge icon={<Clock size={16} />} label="Fast response" />
          <FeatureBadge icon={<MessageSquare size={16} />} label="Real people" />
          <FeatureBadge icon={<LifeBuoy size={16} />} label="Dedicated help" />
        </div>

        <div className="relative z-10 flex items-center gap-2 text-xs text-slate-500">
          <span className="h-1.5 w-1.5 rounded-full bg-emerald-500" />
          <span>We usually reply within 24 hours</span>
        </div>
      </div>

      {/* Right: contact form */}
      <div className="flex flex-1 items-center justify-center p-6 sm:p-10 lg:col-span-7 xl:col-span-8">
        <div className="w-full max-w-[480px]">
          <div className="mb-8 flex justify-center lg:hidden">
            <BrandMark />
          </div>

          <div className="w-full rounded-2xl border border-slate-200 bg-white p-8 shadow-sm dark:border-slate-800 dark:bg-slate-900">
            <div className="mb-7 space-y-1.5">
              <h2 className="text-2xl font-semibold tracking-tight text-slate-900 dark:text-slate-50">
                Contact us
              </h2>
              <p className="text-sm text-slate-500 dark:text-slate-400">
                Fill out the form below and we&apos;ll get back to you as soon as possible.
              </p>
            </div>

            <form onSubmit={handleSubmit} className="space-y-4">
              <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
                <div className="space-y-1.5">
                  <Label htmlFor="name" className={labelStyles}>
                    Name
                  </Label>
                  <Input
                    id="name"
                    type="text"
                    placeholder="Jane Doe"
                    required
                    autoComplete="name"
                    value={formData.name}
                    onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                    className={inputStyles}
                  />
                </div>

                <div className="space-y-1.5">
                  <Label htmlFor="email" className={labelStyles}>
                    Email
                  </Label>
                  <Input
                    id="email"
                    type="email"
                    placeholder="name@company.com"
                    required
                    autoComplete="email"
                    value={formData.email}
                    onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                    className={inputStyles}
                  />
                </div>
              </div>

              <div className="space-y-1.5">
                <Label htmlFor="subject" className={labelStyles}>
                  Subject
                </Label>
                <Input
                  id="subject"
                  type="text"
                  placeholder="How can we help?"
                  required
                  value={formData.subject}
                  onChange={(e) => setFormData({ ...formData, subject: e.target.value })}
                  className={inputStyles}
                />
              </div>

              <div className="space-y-1.5">
                <Label htmlFor="message" className={labelStyles}>
                  Message
                </Label>
                <Textarea
                  id="message"
                  placeholder="Tell us a bit more..."
                  required
                  rows={5}
                  value={formData.message}
                  onChange={(e) => setFormData({ ...formData, message: e.target.value })}
                  className={textareaStyles}
                />
              </div>

              <Button
                type="submit"
                className={`${primaryButtonStyles} mt-2`}
                disabled={isLoading}
              >
                <span className="flex items-center justify-center">
                  {isLoading && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
                  {isLoading ? "Sending..." : "Send message"}
                </span>
              </Button>
            </form>
          </div>

          <p className="mt-6 text-center text-xs text-slate-400 dark:text-slate-600">
            Prefer email? Reach us directly and we&apos;ll route it to the right person.
          </p>
        </div>
      </div>
    </div>
  );
}
