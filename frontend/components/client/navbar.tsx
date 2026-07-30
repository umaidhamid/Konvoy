"use client";

import { useAuth } from "@/hooks/useAuth";
import { BrandMark } from "@/components/auth/brand-mark";
import { ArrowRight } from "lucide-react";

const NAV_LINKS = [
  { label: "How it works", href: "#how-it-works" },
  { label: "Features", href: "#features" },
  { label: "CLI", href: "#cli" },
  { label: "Pricing", href: "/pricing" },
  { label: "Roadmap", href: "#roadmap" },
  { label: "Contact", href: "/contact" },
];

export const Navbar = () => {
  const { isAuthenticated } = useAuth();

  return (
    <nav className="fixed top-0 w-full z-50 border-b border-border bg-background/80 backdrop-blur-md">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 h-16 flex items-center justify-between">
        <a href="/" className="shrink-0">
          <BrandMark />
        </a>

        <div className="hidden md:flex items-center gap-8 text-sm text-primary">
          {NAV_LINKS.map((link) => (
            <a
              key={link.href}
              href={link.href}
              className="hover:text-foreground transition-colors"
            >
              {link.label}
            </a>
          ))}
        </div>

        <div className="flex items-center gap-3">
          {isAuthenticated ? (
            <a
              href="/dashboard/projects"
              className="bg-primary text-primary-foreground px-4 py-2 rounded-lg text-sm font-medium hover:opacity-90 transition-opacity"
            >
              Go to dashboard
            </a>
          ) : (
            <>
              <a
                href="/auth/login"
                className="bg-primary/80 text-primary-foreground px-4 py-2 rounded-lg font-medium hover:opacity-90 transition-opacity hidden sm:block"
              >
                <div className="flex items-center gap-1">
                  Login <ArrowRight className="ml-1 h-4 w-4" />
                </div>
              </a>
              <a
                href="/auth/register"
                className="bg-primary text-primary-foreground px-4 py-2 rounded-lg text-sm font-medium hover:opacity-90 transition-opacity"
              >
                <div className="flex items-center gap-1">
                  Get started <ArrowRight className="ml-1 h-4 w-4" />
                </div>
              </a>
            </>
          )}
        </div>
      </div>
    </nav>
  );
};
