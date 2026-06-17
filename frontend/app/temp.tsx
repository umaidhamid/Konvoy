"use client"
import React from 'react';
import Head from 'next/head';
import { motion } from 'framer-motion';
import { 
  ShieldCheck, 
  History, 
  Terminal, 
  Key, 
  // Github, 
  Users, 
  ChevronRight, 
  CheckCircle2,
  Lock
} from 'lucide-react';

// --- Components ---

const Navbar = () => (
  <nav className="fixed top-0 w-full z-50 border-b border-white/10 bg-black/60 backdrop-blur-md">
    <div className="max-w-7xl mx-auto px-6 h-16 flex items-center justify-between">
      <div className="flex items-center gap-8">
        <span className="text-white font-bold text-xl tracking-tight">DevVault</span>
        <div className="hidden md:flex gap-6 text-sm text-zinc-400">
          <a href="#" className="hover:text-white transition-colors">Features</a>
          <a href="#" className="hover:text-white transition-colors">Docs</a>
          <a href="#" className="hover:text-white transition-colors">Pricing</a>
        </div>
      </div>
      <div className="flex items-center gap-4">
        <a href="#" className="text-sm text-zinc-400 hover:text-white transition-colors hidden sm:block">Sign In</a>
        <button className="bg-white text-black px-4 py-2 rounded-full text-sm font-medium hover:bg-zinc-200 transition-all">
          Get Started
        </button>
      </div>
    </div>
  </nav>
);

const Hero = () => (
  <section className="pt-32 pb-20 px-6 relative overflow-hidden">
    {/* Background Glow */}
    <div className="absolute top-0 left-1/2 -translate-x-1/2 w-[1000px] h-[600px] bg-purple-500/10 blur-[120px] rounded-full -z-10" />
    
    <div className="max-w-4xl mx-auto text-center">
      <motion.h1 
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        className="text-5xl md:text-7xl font-bold tracking-tight text-white mb-6"
      >
        Never Lose Your <br />
        <span className="bg-gradient-to-r from-purple-400 to-blue-500 bg-clip-text text-transparent">
          Config Files Again
        </span>
      </motion.h1>
      <motion.p 
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.1 }}
        className="text-lg text-zinc-400 mb-10 max-w-2xl mx-auto"
      >
        Store, version, and retrieve .env files, Docker configs, API keys, and project templates from anywhere.
      </motion.p>
      
      <div className="flex flex-col sm:flex-row items-center justify-center gap-4 mb-16">
        <button className="w-full sm:w-auto bg-white text-black px-8 py-3 rounded-lg font-semibold hover:shadow-[0_0_20px_rgba(255,255,255,0.3)] transition-all">
          Get Started
        </button>
        <button className="w-full sm:w-auto bg-white/5 border border-white/10 text-white px-8 py-3 rounded-lg font-semibold hover:bg-white/10 transition-all">
          View Documentation
        </button>
      </div>

      {/* Hero Code Editor Mockup */}
      <motion.div 
        initial={{ opacity: 0, scale: 0.95 }}
        animate={{ opacity: 1, scale: 1 }}
        transition={{ delay: 0.2 }}
        className="relative mx-auto max-w-5xl rounded-xl border border-white/10 bg-zinc-900/50 backdrop-blur-sm p-2 shadow-2xl"
      >
        <div className="flex items-center gap-2 px-4 py-2 border-b border-white/5">
          <div className="flex gap-1.5">
            <div className="w-3 h-3 rounded-full bg-red-500/20" />
            <div className="w-3 h-3 rounded-full bg-yellow-500/20" />
            <div className="w-3 h-3 rounded-full bg-green-500/20" />
          </div>
          <div className="text-[10px] text-zinc-500 font-mono ml-4">devvault — next.config.js</div>
        </div>
        <div className="p-6 text-left font-mono text-sm sm:text-base overflow-x-auto">
          <div className="flex gap-4">
            <div className="text-zinc-600 select-none">1<br/>2<br/>3<br/>4<br/>5</div>
            <div className="text-blue-300">
              <span className="text-purple-400">module</span>.exports = {'{'}<br/>
              &nbsp;&nbsp;reactStrictMode: <span className="text-blue-400">true</span>,<br/>
              &nbsp;&nbsp;env: {'{'} <span className="text-zinc-500">/* Pulling from DevVault */</span> {'}'},<br/>
              &nbsp;&nbsp;images: {'{'} domains: [<span className="text-green-300">'cdn.devvault.io'</span>] {'}'}<br/>
              {'}'}
            </div>
          </div>
        </div>
      </motion.div>
    </div>
  </section>
);

const Features = () => {
  const features = [
    { title: "Secure Storage", desc: "Store environment variables and project files safely.", icon: <ShieldCheck className="w-6 h-6 text-purple-400" /> },
    { title: "Version History", desc: "Restore previous versions instantly.", icon: <History className="w-6 h-6 text-blue-400" /> },
    { title: "CLI Support", desc: "Pull files directly into your project using our terminal tool.", icon: <Terminal className="w-6 h-6 text-purple-400" /> },
    { title: "Token Access", desc: "Generate secure tokens for automation.", icon: <Key className="w-6 h-6 text-blue-400" /> },
    // { title: "GitHub Integration", desc: "Sync files with repositories.", icon: <Github className="w-6 h-6 text-purple-400" /> },
    { title: "Team Collaboration", desc: "Share projects with your team.", icon: <Users className="w-6 h-6 text-blue-400" /> },
  ];

  return (
    <section className="py-24 px-6 bg-black relative">
      <div className="max-w-7xl mx-auto">
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {features.map((f, i) => (
            <div key={i} className="p-8 rounded-2xl border border-white/5 bg-zinc-900/30 hover:border-purple-500/30 transition-all group">
              <div className="mb-4 p-3 rounded-lg bg-white/5 w-fit group-hover:scale-110 transition-transform">
                {f.icon}
              </div>
              <h3 className="text-xl font-bold text-white mb-2">{f.title}</h3>
              <p className="text-zinc-400 leading-relaxed">{f.desc}</p>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
};

const Pricing = () => (
  <section className="py-24 px-6">
    <div className="max-w-7xl mx-auto">
      <h2 className="text-4xl font-bold text-center text-white mb-16">Simple Pricing</h2>
      <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
        {['Free', 'Pro', 'Team'].map((plan, i) => (
          <div key={plan} className={`p-8 rounded-2xl border ${i === 1 ? 'border-purple-500/50 bg-purple-500/5' : 'border-white/10 bg-zinc-900/20'} relative`}>
            {i === 1 && <span className="absolute -top-3 left-1/2 -translate-x-1/2 bg-purple-500 text-[10px] uppercase tracking-widest px-3 py-1 rounded-full font-bold">Most Popular</span>}
            <h3 className="text-2xl font-bold text-white mb-2">{plan}</h3>
            <div className="text-4xl font-bold text-white mb-6">${i === 0 ? '0' : i === 1 ? '19' : '49'}<span className="text-sm text-zinc-500">/mo</span></div>
            <ul className="space-y-4 mb-8">
              {[1, 2, 3, 4].map((item) => (
                <li key={item} className="flex items-center gap-2 text-zinc-400 text-sm">
                  <CheckCircle2 className="w-4 h-4 text-green-500" /> Feature item details
                </li>
              ))}
            </ul>
            <button className={`w-full py-3 rounded-lg font-bold transition-all ${i === 1 ? 'bg-white text-black' : 'bg-white/5 text-white border border-white/10 hover:bg-white/10'}`}>
              Get Started
            </button>
          </div>
        ))}
      </div>
    </div>
  </section>
);

// --- Main Page ---

export default function LandingPage() {
  return (
    <div className="min-h-screen bg-black text-zinc-300 font-sans selection:bg-purple-500/30">
      <Head>
        <title>DevVault | Never Lose Your Config Files</title>
      </Head>

      <Navbar />
      
      <main>
        <Hero />

        {/* Trusted By */}
        <section className="py-12 border-y border-white/5 bg-zinc-900/20 overflow-hidden">
          <div className="max-w-7xl mx-auto px-6">
            <p className="text-center text-xs uppercase tracking-widest text-zinc-500 mb-8 font-semibold">Trusted by builders at</p>
            <div className="flex flex-wrap justify-center items-center gap-10 opacity-40 grayscale hover:grayscale-0 transition-all">
              {['Next.js', 'Node.js', 'MongoDB', 'Redis', 'Docker', 'TypeScript'].map(logo => (
                <span key={logo} className="text-xl font-bold text-white tracking-tighter">{logo}</span>
              ))}
            </div>
          </div>
        </section>

        <Features />

        {/* CLI Section */}
        <section className="py-24 px-6">
          <div className="max-w-4xl mx-auto rounded-3xl border border-white/10 bg-gradient-to-b from-zinc-900 to-black p-1">
            <div className="bg-black rounded-[22px] p-8 md:p-12">
              <div className="flex flex-col md:flex-row gap-12 items-center">
                <div className="flex-1">
                  <h2 className="text-3xl font-bold text-white mb-4">Pull files instantly</h2>
                  <p className="text-zinc-400 mb-6">Our CLI allows you to sync your local environment with DevVault in a single command.</p>
                  <div className="flex gap-4">
                     <div className="flex items-center gap-2 text-xs text-zinc-500 bg-zinc-900 px-3 py-1.5 rounded-full border border-white/5">
                        <Lock className="w-3 h-3"/> End-to-end Encrypted
                     </div>
                  </div>
                </div>
                <div className="flex-1 w-full">
                  <div className="bg-zinc-900 rounded-xl p-4 font-mono text-sm border border-white/5 shadow-2xl">
                    <div className="flex items-center gap-2 mb-4">
                       <span className="w-2 h-2 rounded-full bg-zinc-700"/>
                       <span className="text-[10px] text-zinc-500 uppercase">Terminal</span>
                    </div>
                    <div className="text-green-400">$ npm install -g devvault</div>
                    <div className="text-white mt-1">$ devvault pull .env</div>
                    <div className="text-zinc-500 mt-2">✔ Found project 'konvoy-web'</div>
                    <div className="text-zinc-500">✔ Successfully pulled .env</div>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </section>

        {/* CTA */}
        <section className="py-32 px-6 relative">
          <div className="absolute inset-0 bg-blue-500/5 blur-[120px] pointer-events-none" />
          <div className="max-w-3xl mx-auto text-center relative z-10">
            <h2 className="text-4xl md:text-5xl font-bold text-white mb-6">Stop Copying Files Between Projects</h2>
            <p className="text-zinc-400 text-lg mb-10">Manage your configuration files and secrets from one secure, centralized place.</p>
            <button className="bg-white text-black px-10 py-4 rounded-full font-bold text-lg hover:scale-105 transition-transform">
              Start Building Now
            </button>
          </div>
        </section>
      </main>

      <footer className="py-20 px-6 border-t border-white/10 bg-zinc-950">
        <div className="max-w-7xl mx-auto grid grid-cols-2 md:grid-cols-4 gap-12">
          <div>
            <span className="text-white font-bold text-lg">DevVault</span>
            <p className="text-sm text-zinc-500 mt-4">Secure infrastructure for modern dev teams.</p>
          </div>
          <div>
             <h4 className="text-white font-semibold mb-4 text-sm uppercase tracking-wider">Product</h4>
             <ul className="text-sm space-y-2 text-zinc-500">
               <li>Features</li>
               <li>Pricing</li>
               <li>Changelog</li>
             </ul>
          </div>
          <div>
             <h4 className="text-white font-semibold mb-4 text-sm uppercase tracking-wider">Resources</h4>
             <ul className="text-sm space-y-2 text-zinc-500">
               <li>Docs</li>
               {/* <li>GitHub</li> */}
               <li>API Status</li>
             </ul>
          </div>
          <div>
             <h4 className="text-white font-semibold mb-4 text-sm uppercase tracking-wider">Legal</h4>
             <ul className="text-sm space-y-2 text-zinc-500">
               <li>Privacy</li>
               <li>Terms</li>
             </ul>
          </div>
        </div>
      </footer>
    </div>
  );
}