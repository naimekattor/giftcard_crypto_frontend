"use client";

import Link from "next/link";
import {
  Sparkles,
  ShieldCheck,
  Zap,
  Lock,
  Bitcoin,
  Store,
  Rocket,
  ArrowRight,
  CheckCircle2,
} from "lucide-react";
import { Button } from "../ui/Button";
import { useAuth } from '@/features/auth/contexts/AuthContext';

// ─── Types ────────────────────────────────────────────────────────────────────

interface HomePageProps {
  isAuthenticated?: boolean;
}

// ─── Data ────────────────────────────────────────────────────────────────────

const features = [
  {
    icon: Lock,
    color: "brand" as const,
    title: "Complete Anonymity",
    desc: "No email, no phone, no KYC. Create a username and start trading in seconds.",
  },
  {
    icon: Bitcoin,
    color: "brand" as const,
    title: "Over 50 Cryptocurrencies Accepted",
    desc: "Pay and receive with Bitcoin, Ethereum, USDT, USDC, Solana and many more.",
  },
  {
    icon: ShieldCheck,
    color: "brand" as const,
    title: "Verified Gift Cards",
    desc: "Every card is automatically validated for balance and authenticity before listing.",
  },
  {
    icon: Rocket,
    color: "brand" as const,
    title: "Fast Listing Times",
    desc: "Your gift card listing goes live quickly after submission, once validated.",
  },
  {
    icon: Store,
    color: "brand" as const,
    title: "Major Retailers",
    desc: "Amazon, Apple, Uber, Steam, PlayStation & many others across UK, USA, and Canada.",
  },
  {
    icon: Zap,
    color: "cta" as const,
    title: "Lightning Fast Payouts",
    desc: "Crypto is transferred into your wallet within as little as 30 minutes.",
  },
];

const howItWorks = [
  { step: "01", title: "Sign Up", desc: "Create an anonymous account instantly" },
  { step: "02", title: "Browse", desc: "Find gift cards at the best prices" },
  { step: "03", title: "Pay Securely", desc: "Complete payment with cryptocurrency" },
  { step: "04", title: "Redeem", desc: "Get your balance or funds instantly" },
];

// ─── Page ─────────────────────────────────────────────────────────────────────

export default function HomePage() {
    const { isAuthenticated } = useAuth();

  return (
    <div className="min-h-screen bg-white selection:bg-brand/10 selection:text-brand antialiased overflow-x-hidden">
      
      {/* ── Hero Section ── */}
      <section className="relative pt-24 pb-20 md:pt-32 md:pb-28 overflow-hidden">
        {/* Soft Modern Glow Background Accents */}
        <div className="absolute top-0 left-1/2 -translate-x-1/2 w-full max-w-7xl h-[500px] pointer-events-none opacity-60">
          <div className="absolute top-[-10%] left-[5%] w-[400px] h-[400px] rounded-full bg-brand/10 blur-[120px]" />
          <div className="absolute top-[10%] right-[5%] w-[350px] h-[350px] rounded-full bg-cta/10 blur-[100px]" />
        </div>

        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 relative z-10">
          <div className="text-center max-w-4xl mx-auto">
            
            {/* Pill Badge */}
            <div className="inline-flex items-center gap-2 rounded-full border border-slate-200/80 bg-slate-50/60 backdrop-blur-md px-4 py-1.5 shadow-xs mb-8 hover:border-slate-300 transition-colors cursor-default">
              <Sparkles className="h-3.5 w-3.5 text-brand animate-pulse" />
              <span className="text-xs font-semibold tracking-wider text-slate-600 uppercase">
                Buy gift cards with crypto
              </span>
            </div>

            {/* Main Headline */}
            <h1 className="text-4xl sm:text-5xl lg:text-6xl font-black text-slate-900 tracking-tight leading-[1.1] mb-6">
              Save more on your next purchase with{" "}
              <span className="relative inline-block text-brand">
                verified gift cards
                <span className="absolute bottom-1 left-0 w-full h-[6px] bg-brand/10 rounded-full -z-10" />
              </span>
            </h1>

            {/* Description Subtext */}
            <p className="text-lg sm:text-xl text-slate-600 max-w-2xl mx-auto mb-10 font-medium leading-relaxed">
              Purchase verified gift cards and enjoy instant digital delivery at discounted rates.
              <span className="block mt-2 text-base font-normal text-slate-500">
                Browse top retailers and pay securely using cryptocurrency.
              </span>
            </p>

            {/* CTAs */}
            {!isAuthenticated && (
              <div className="flex flex-col sm:flex-row gap-4 justify-center items-center mb-16">
                <Link href="/signup" className="w-full sm:w-auto">
                  <Button className="w-full sm:w-auto bg-brand hover:bg-brand/90 text-white text-base font-bold px-8 h-14 rounded-2xl shadow-xl shadow-brand/20 transition-all duration-300 hover:-translate-y-0.5 active:translate-y-0">
                    Start Trading Now
                  </Button>
                </Link>
                <Link href="/buy-gift-cards" className="w-full sm:w-auto">
                  <Button
                    variant="outline"
                    className="w-full sm:w-auto text-base font-semibold px-8 h-14 rounded-2xl border-slate-200 text-slate-700 bg-white hover:bg-slate-50 hover:border-slate-300 shadow-xs transition-all duration-300 hover:-translate-y-0.5 active:translate-y-0"
                  >
                    View Retailers
                  </Button>
                </Link>
              </div>
            )}

            {/* Interactive Trust Strip */}
            <div className="inline-flex flex-wrap items-center justify-center gap-x-8 gap-y-4 rounded-2xl border border-slate-100 bg-slate-50/50 p-4 sm:px-8 shadow-xs backdrop-blur-xs">
              <div className="flex items-center gap-2.5 text-sm font-semibold text-slate-600">
                <CheckCircle2 className="w-4 h-4 text-brand" />
                <span>Verified Cards</span>
              </div>
              <div className="w-1.5 h-1.5 rounded-full bg-slate-300 hidden sm:block" />
              <div className="flex items-center gap-2.5 text-sm font-semibold text-slate-600">
                <Zap className="w-4 h-4 text-cta fill-cta/10" />
                <span>Lightning Payouts</span>
              </div>
              <div className="w-1.5 h-1.5 rounded-full bg-slate-300 hidden sm:block" />
              <div className="flex items-center gap-2.5 text-sm font-semibold text-slate-600">
                <Lock className="w-4 h-4 text-brand" />
                <span>No KYC Required</span>
              </div>
            </div>

          </div>
        </div>
      </section>

      {/* ── Features Grid Section ── */}
      <section className="bg-slate-50/70 border-y border-slate-100 py-24 relative">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">

          <div className="text-center max-w-3xl mx-auto mb-20">
            <h2 className="text-3xl sm:text-4xl font-black text-slate-900 mb-4 tracking-tight">
              WHY TRADERS CHOOSE US
            </h2>
            <p className="text-slate-500 font-medium text-lg">
              Built for speed, privacy, and the best rates in the market.
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 lg:gap-8">
            {features.map((feature, index) => {
              const Icon = feature.icon;
              return (
                <div
                  key={index}
                  className="dark-card bg-white p-8 rounded-2xl border border-slate-200/60 shadow-xs hover:shadow-xl hover:border-brand/30 transition-all duration-300 group cursor-default"
                >
                  <div
                    className={`w-12 h-12 rounded-xl flex items-center justify-center mb-6 transition-transform duration-300 group-hover:scale-105
                      ${feature.color === "brand" ? "bg-brand/10 text-brand" : "bg-cta/10 text-cta"}`}
                  >
                    <Icon className="w-5 h-5" />
                  </div>
                  <h3 className="text-lg font-bold text-slate-900 mb-2.5 group-hover:text-brand transition-colors">
                    {feature.title}
                  </h3>
                  <p className="text-slate-600 text-sm leading-relaxed font-medium">
                    {feature.desc}
                  </p>
                </div>
              );
            })}
          </div>
        </div>
      </section>

      {/* ── How It Works Section ── */}
      <section className="bg-white py-24">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">

          <div className="text-center max-w-3xl mx-auto mb-20">
            <h2 className="text-3xl font-black text-slate-900 mb-4 tracking-tight">
              HOW IT WORKS
            </h2>
            <p className="text-slate-500 font-medium text-lg">
              Four simple steps to start trading assets securely.
            </p>
          </div>

          {/* Connected Step UI Cards */}
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6 relative">
            {howItWorks.map((item, idx) => (
              <div 
                key={idx} 
                className="relative bg-slate-50/50 border border-slate-100 rounded-2xl p-8 transition-all duration-300 hover:bg-slate-50"
              >
                <div className="absolute top-6 right-6 text-4xl font-black text-slate-200/70 select-none tracking-tighter">
                  {item.step}
                </div>
                <div className="inline-flex items-center justify-center w-10 h-10 rounded-xl bg-brand text-white text-sm font-bold mb-6 shadow-md shadow-brand/10">
                  {idx + 1}
                </div>
                <h3 className="font-bold text-slate-900 mb-2 text-lg">
                  {item.title}
                </h3>
                <p className="text-slate-500 text-sm font-medium leading-relaxed">
                  {item.desc}
                </p>
              </div>
            ))}
          </div>

          {/* Interactive Flow Button */}
          <div className="text-center mt-12">
            <Link href="/how-it-works" className="inline-block">
              <Button
                variant="outline"
                className="group border-slate-200 hover:border-slate-300 text-slate-600 hover:text-slate-800 bg-white hover:bg-slate-50 rounded-xl px-6 h-11 text-sm font-semibold transition-all duration-200"
              >
                See the full walkthrough 
                <ArrowRight className="w-4 h-4 ml-2 inline transition-transform duration-200 group-hover:translate-x-1" />
              </Button>
            </Link>
          </div>

        </div>
      </section>

      {/* ── Final CTA Section ── */}
      {!isAuthenticated && (
        <section className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 pb-24">
          <div className="bg-slate-900 rounded-[2rem] p-10 md:p-16 text-center text-white shadow-2xl relative overflow-hidden group">
            {/* Modern High-End Gradient Mesh Backgrounds */}
            <div className="absolute -top-24 -right-24 w-80 h-80 bg-brand/20 rounded-full blur-[100px] group-hover:bg-brand/30 transition-colors duration-500" />
            <div className="absolute -bottom-24 -left-24 w-80 h-80 bg-cta/15 rounded-full blur-[100px] group-hover:bg-cta/25 transition-colors duration-500" />

            <div className="relative z-10 max-w-2xl mx-auto">
              <h2 className="text-3xl md:text-5xl font-black mb-4 tracking-tight leading-tight">
                Ready to Trade Smarter?
              </h2>
              <p className="text-base md:text-lg text-slate-400 mb-10 font-medium max-w-lg mx-auto">
                Join thousands of users already buying and selling gift cards anonymously with crypto.
              </p>
              <Link href="/signup" className="inline-block w-full sm:w-auto">
                <Button className="w-full sm:w-auto bg-cta hover:bg-cta/90 text-white h-14 px-10 rounded-xl text-base font-bold shadow-xl shadow-cta/20 transition-transform duration-200 hover:scale-[1.02] active:scale-[0.98]">
                  Create Anonymous Account — Free
                </Button>
              </Link>
            </div>
          </div>
        </section>
      )}

    </div>
  );
}