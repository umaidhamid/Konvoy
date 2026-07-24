import { Navbar } from "@/components/client/navbar";
import { Hero } from "@/components/client/herosection/page";
import { HowItWorks } from "@/components/client/how-it-works";
import { Features } from "@/components/client/features";
import { CliShowcase } from "@/components/client/cli-showcase";
import { Roadmap } from "@/components/client/roadmap";
import { CtaFooter } from "@/components/client/cta-footer";

export default function Home() {
  return (
    <main className="min-h-screen bg-background text-foreground antialiased selection:bg-primary/10 selection:text-primary">
      <Navbar />
      <Hero />
      <HowItWorks />
      <Features />
      <CliShowcase />
      <Roadmap />
      <CtaFooter />
    </main>
  );
}
