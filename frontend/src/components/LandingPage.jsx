import React from "react";
import { Sparkles, ArrowRight, Zap, Cpu, Activity } from "lucide-react";
import { useReveal } from "../hooks/useReveal";

const FEATURE_CARDS = [
  {
    icon: Zap,
    label: "Fast",
    labelColor: "text-emerald-400",
    iconBg:
      "bg-emerald-500/10 border-emerald-500/20 text-emerald-400 group-hover:bg-emerald-500/20",
    shadow: "hover:shadow-emerald-500/5",
    title: "Transcription",
    desc: "FFmpeg + Whisper pipeline for lightning-fast transcript processing.",
  },
  {
    icon: Cpu,
    label: "AI-Powered",
    labelColor: "text-amber-400",
    iconBg:
      "bg-amber-500/10 border-amber-500/20 text-amber-400 group-hover:bg-amber-500/20",
    shadow: "hover:shadow-amber-500/5",
    title: "Summarization",
    desc: "Short + detailed summaries generated automatically from content context.",
  },
  {
    icon: Activity,
    label: "Tracked",
    labelColor: "text-indigo-400",
    iconBg:
      "bg-indigo-500/10 border-indigo-500/20 text-indigo-400 group-hover:bg-indigo-500/20",
    shadow: "hover:shadow-indigo-500/5",
    title: "Status Flow",
    desc: "Live processing states and real-time backend status feedback.",
  },
];

export default function LandingPage({ onGetStarted, onSignIn }) {
  const headerIn = useReveal(0);
  const badgeIn = useReveal(100);
  const headingIn = useReveal(200);
  const subIn = useReveal(320);
  const ctaIn = useReveal(420);

  return (
    <div className="relative min-h-screen bg-slate-950 text-slate-100 flex flex-col justify-between overflow-hidden">
      {/* Background Animated Glows */}
      <div className="absolute top-1/4 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[500px] h-[500px] bg-amber-500/10 rounded-full blur-[120px] pointer-events-none animate-pulse" />
      <div className="absolute top-1/3 left-1/3 w-[300px] h-[300px] bg-indigo-500/10 rounded-full blur-[100px] pointer-events-none" />

      {/* Top Navbar */}
      <header
        className={`relative z-10 flex items-center justify-between px-8 py-6 max-w-7xl mx-auto w-full transition-all duration-500 ease-out ${
          headerIn ? "opacity-100 translate-y-0" : "opacity-0 -translate-y-3"
        }`}
      >
        <div className="flex items-center gap-2">
          <Sparkles className="w-6 h-6 text-amber-400 animate-spin-slow" />
          <span className="font-bold text-xl tracking-tight text-white">
            ClipMind <span className="text-amber-400">AI</span>
          </span>
        </div>
        <div className="flex items-center gap-4">
          <button
            onClick={onSignIn}
            className="text-xs font-semibold text-slate-300 hover:text-white transition-colors duration-200 px-4 py-2"
          >
            Sign In
          </button>
          <button
            onClick={onGetStarted}
            className="text-xs font-semibold bg-amber-500 hover:bg-amber-400 text-slate-950 px-5 py-2.5 rounded-xl shadow-lg shadow-amber-500/20 hover:shadow-amber-500/40 hover:-translate-y-0.5 active:translate-y-0 active:scale-95 transition-all duration-200"
          >
            Get Started
          </button>
        </div>
      </header>

      {/* Hero Section */}
      <main className="relative z-10 max-w-5xl mx-auto px-6 pt-12 pb-16 text-center flex flex-col items-center">
        {/* Badge */}
        <div
          className={`inline-flex items-center gap-2 px-3.5 py-1.5 rounded-full bg-slate-900/90 border border-slate-800/80 text-amber-400 text-xs font-medium mb-8 backdrop-blur-md hover:border-amber-500/40 hover:scale-105 transition-all duration-300 cursor-default shadow-sm ${
            badgeIn ? "opacity-100 translate-y-0" : "opacity-0 translate-y-3"
          }`}
          style={{ transitionProperty: "opacity, transform" }}
        >
          <Sparkles size={14} className="text-amber-400 animate-bounce" />
          <span>ClipMind AI Video Intelligence</span>
        </div>

        {/* Main Heading */}
        <h1
          className={`text-4xl md:text-6xl font-black tracking-tight leading-tight max-w-4xl transition-all duration-700 ease-out ${
            headingIn ? "opacity-100 translate-y-0" : "opacity-0 translate-y-5"
          }`}
        >
          Transform Video Into{" "}
          <span className="bg-gradient-to-r from-amber-400 via-amber-300 to-amber-500 bg-clip-text text-transparent drop-shadow-sm">
            Actionable Intelligence
          </span>
        </h1>

        <p
          className={`mt-6 text-base md:text-lg text-slate-400 max-w-2xl leading-relaxed transition-all duration-700 ease-out ${
            subIn ? "opacity-100 translate-y-0" : "opacity-0 translate-y-5"
          }`}
        >
          Extract transcripts, instant summaries, and key moments from your
          videos using AI.
        </p>

        {/* Primary CTA */}
        <div
          className={`mt-8 flex items-center justify-center transition-all duration-700 ease-out ${
            ctaIn ? "opacity-100 translate-y-0" : "opacity-0 translate-y-5"
          }`}
        >
          <button
            onClick={onGetStarted}
            className="group relative flex items-center gap-2 bg-gradient-to-r from-amber-500 to-amber-400 text-slate-950 font-bold text-sm px-8 py-3.5 rounded-xl shadow-xl shadow-amber-500/20 hover:shadow-amber-500/40 hover:-translate-y-1 active:translate-y-0 active:scale-95 transition-all duration-200"
          >
            <span>Get Started Free</span>
            <ArrowRight
              size={16}
              className="group-hover:translate-x-1 transition-transform duration-200"
            />
          </button>
        </div>

        {/* Interactive Cards — staggered entrance */}
        <div className="mt-16 grid grid-cols-1 md:grid-cols-3 gap-6 w-full text-left">
          {FEATURE_CARDS.map((card, i) => (
            <FeatureCard key={card.title} {...card} delay={520 + i * 130} />
          ))}
        </div>
      </main>

      <footer className="relative z-10 py-6 text-center text-xs text-slate-600 border-t border-slate-900">
        © {new Date().getFullYear()} ClipMind AI. All rights reserved.
      </footer>
    </div>
  );
}

function FeatureCard({
  icon: Icon,
  label,
  labelColor,
  iconBg,
  shadow,
  title,
  desc,
  delay,
}) {
  const isIn = useReveal(delay);

  return (
    <div
      className={`group relative p-6 rounded-2xl bg-slate-900/60 border border-slate-800/80 hover:border-slate-700/80 hover:bg-slate-900/90 hover:-translate-y-1.5 shadow-lg hover:shadow-2xl ${shadow} transition-all duration-300 ${
        isIn ? "opacity-100 translate-y-0" : "opacity-0 translate-y-6"
      }`}
    >
      <div
        className={`w-10 h-10 rounded-xl border flex items-center justify-center mb-4 group-hover:scale-110 group-hover:rotate-6 transition-all duration-300 ${iconBg}`}
      >
        <Icon size={20} />
      </div>
      <span
        className={`text-xs font-bold uppercase tracking-wider ${labelColor}`}
      >
        {label}
      </span>
      <h3 className="text-lg font-bold text-white mt-1">{title}</h3>
      <p className="text-xs text-slate-400 mt-2 leading-relaxed">{desc}</p>
    </div>
  );
}
