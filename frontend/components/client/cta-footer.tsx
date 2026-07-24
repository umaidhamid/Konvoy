"use client";

import { BrandMark } from "@/components/auth/brand-mark";

export const CtaFooter = () => {
  return (
    <>
      <section className="py-24 px-4 sm:px-6 lg:px-8 border-t border-border">
        <div className="max-w-3xl mx-auto text-center">
          <h2 className="text-3xl sm:text-4xl font-bold tracking-tight text-foreground mb-4">
            Stop passing .env files around
          </h2>
          <p className="text-muted-foreground text-lg mb-8">
            Create an account, add a project, and pull it from your next machine
            with the CLI.
          </p>
          <a
            href="/auth/register"
            className="inline-block bg-primary text-primary-foreground px-8 py-3.5 rounded-xl font-semibold hover:opacity-90 transition-opacity"
          >
            Create your vault
          </a>
        </div>
      </section>

      <footer className="py-12 px-4 sm:px-6 lg:px-8 border-t border-border">
        <div className="max-w-6xl mx-auto flex flex-col sm:flex-row items-center justify-between gap-6">
          <BrandMark />
          <p className="text-xs text-muted-foreground">
            &copy; {new Date().getFullYear()} Konvoy. Built for developers who juggle too many environments.
          </p>
        </div>
      </footer>
    </>
  );
};
