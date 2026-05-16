"use client";

import Link from "next/link";
import {
  Upload,
  Tag,
  Bitcoin,
  Search,
  ShoppingCart,
  Zap,
  Shield,
  ArrowRight,
} from "lucide-react";
import { useAuth } from '@/features/auth/contexts/AuthContext';

// ─── Data ────────────────────────────────────────────────────────────────────

const sellingSteps = [
  {
    number: "01",
    icon: Upload,
    title: "Upload Gift Card Details",
    description:
      "Upload the gift card details, including any images of the gift card, whether physical or an eVoucher. Ensure images are clear and legible.",
  },
  {
    number: "02",
    icon: Tag,
    title: "Find Out What You'll Get Paid",
    description:
      "Pricing differs based on demand for different retailers. Our system instantly calculates the best rate you'll receive for your card.",
  },
  {
    number: "03",
    icon: Bitcoin,
    title: "Receive Crypto Payment",
    description:
      "Receive payment in as little as 30 minutes after your listing has successfully sold. Fast, secure, and straight to your wallet.",
    highlight: true,
  },
];

const buyingSteps = [
  {
    number: "01",
    icon: Search,
    title: "Search Gift Cards",
    description:
      "Buy gift cards through our online marketplace and save money on your next purchase. Browse hundreds of brands across various regions.",
  },
  {
    number: "02",
    icon: ShoppingCart,
    title: "Secure Purchase",
    description:
      "Add the gift cards of your choice to your basket, select which cryptocurrency you wish to pay with, and complete your purchase.",
  },
  {
    number: "03",
    icon: Zap,
    title: "Fast Delivery",
    description:
      "Our automated system will deliver your gift card on the same day — generally within an hour of your purchase being confirmed.",
    highlight: true,
  },
  {
    number: "04",
    icon: Shield,
    title: "Escrow Protection",
    description:
      "We use a sophisticated anti-abuse system to stop sellers from redeeming gift cards once listed. Our log-based system plus randomised delivery timing means sellers never know in real time when their card is sold — giving buyers complete peace of mind.",
  },
];

// ─── Sub-components ───────────────────────────────────────────────────────────

function SectionTag({ label }: { label: string }) {
  return (
    <div className="flex items-center gap-2 mb-3">
      <div className="w-6 h-0.5 bg-brand rounded-full" />
      <span className="text-xs font-semibold tracking-widest uppercase text-brand">
        {label}
      </span>
    </div>
  );
}

interface StepCardProps {
  step: {
    number: string;
    icon: React.ElementType;
    title: string;
    description: string;
    highlight?: boolean;
  };
  variant: "sell" | "buy";
  index: number;
}

function StepCard({ step, variant, index }: StepCardProps) {
  const Icon = step.icon;
  const isSell = variant === "sell";

  return (
    <div
      className={`
        group relative flex flex-col p-7 rounded-2xl border transition-all duration-300
        hover:-translate-y-1 cursor-default
        ${
          step.highlight
            ? isSell
              ? "border-brand bg-brand/5 hover:border-brand hover:shadow-lg hover:shadow-brand/10"
              : "border-cta bg-cta/5 hover:border-cta hover:shadow-lg hover:shadow-cta/10"
            : "border-slate-200 bg-white hover:border-slate-300 hover:shadow-lg hover:shadow-slate-100"
        }
      `}
      style={{ animationDelay: `${index * 80}ms` }}
    >
      {/* Step number */}
      <div
        className={`
          text-xs font-bold tracking-widest mb-5 flex items-center gap-3
          ${isSell ? "text-brand" : "text-cta"}
        `}
      >
        <span
          className={`
            inline-flex items-center justify-center w-7 h-7 rounded-lg text-white text-xs font-black
            ${isSell ? "bg-brand" : "bg-cta"}
          `}
        >
          {step.number.replace("0", "")}
        </span>
        <div
          className={`flex-1 h-px ${isSell ? "bg-brand/20" : "bg-cta/20"}`}
        />
      </div>

      {/* Icon */}
      <div
        className={`
          w-12 h-12 rounded-xl flex items-center justify-center mb-5
          ${
            step.highlight
              ? isSell
                ? "bg-brand text-white"
                : "bg-cta text-white"
              : "bg-slate-100 text-slate-500 group-hover:bg-slate-200"
          }
          transition-colors duration-200
        `}
      >
        <Icon className="w-5 h-5" />
      </div>

      {/* Content */}
      <h3 className="font-bold text-slate-900 text-base mb-2 leading-snug tracking-tight">
        {step.title}
      </h3>
      <p className="text-sm text-slate-500 leading-relaxed">
        {step.description}
      </p>

      {/* Highlight badge */}
      {step.highlight && (
        <div
          className={`
            absolute top-5 right-5 text-[10px] font-bold uppercase tracking-widest px-2.5 py-1 rounded-full
            ${isSell ? "bg-brand/10 text-brand" : "bg-cta/10 text-cta"}
          `}
        >
          {isSell ? "Fast payout" : "Same day"}
        </div>
      )}
    </div>
  );
}

// ─── Page ─────────────────────────────────────────────────────────────────────

export default function HowItWorksPage() {
        const { isAuthenticated } = useAuth();

  return (
    <div className="min-h-screen bg-white">
      {/* ── Hero ── */}
      <section className="bg-slate-50 border-b border-slate-100 py-20 px-4">
        <div className="max-w-3xl mx-auto text-center">
          <div className="inline-flex items-center gap-2 rounded-full border border-slate-200 bg-white px-5 py-2 shadow-sm mb-6">
            <span className="w-2 h-2 rounded-full bg-brand animate-pulse" />
            <span className="text-xs font-bold tracking-widest text-slate-500 uppercase">
              Simple. Fast. Anonymous.
            </span>
          </div>

          <h1 className="text-4xl sm:text-5xl font-extrabold text-slate-900 leading-tight mb-5 tracking-tight">
            How It{" "}
            <span className="text-brand">Works</span>
          </h1>

          <p className="text-lg text-slate-500 leading-relaxed max-w-xl mx-auto">
            Whether you're selling an unwanted gift card for crypto or buying
            one at a discount — we've made it effortless.
          </p>
        </div>
      </section>

      {/* ── YouTube Video ── */}
      <section className="py-16 px-4">
        <div className="max-w-4xl mx-auto">
          <div className="relative rounded-2xl overflow-hidden border border-slate-200 shadow-xl shadow-slate-100 aspect-video">
            <iframe
              className="absolute inset-0 w-full h-full"
              src="https://www.youtube.com/embed/UngxdJ9kxh4"
              title="How CardSwap Works"
              allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture; web-share"
              allowFullScreen
            />
          </div>
        </div>
      </section>

      {/* ── Selling Section ── */}
      <section className="py-20 px-4 bg-slate-50 border-y border-slate-100">
        <div className="max-w-5xl mx-auto">
          {/* Header */}
          <div className="max-w-2xl mb-14">
            <SectionTag label="Selling" />
            <h2 className="text-3xl sm:text-4xl font-extrabold text-slate-900 tracking-tight mb-4">
              Sell your gift card,{" "}
              <span className="text-brand">get crypto</span>
            </h2>
            <p className="text-lg text-slate-500 leading-relaxed">
              Turn your unwanted gift cards into cryptocurrency in a few simple
              steps. No hassle, no waiting around.
            </p>
          </div>

          {/* Steps grid */}
          <div className="grid grid-cols-1 md:grid-cols-3 gap-5">
            {sellingSteps.map((step, i) => (
              <StepCard key={step.number} step={step} variant="sell" index={i} />
            ))}
          </div>

          {/* CTA */}
          <div className="mt-10 flex items-center gap-4 flex-wrap">
            <Link href="/seller">
              <button className="inline-flex items-center gap-2 bg-brand hover:bg-brand/90 text-white font-semibold text-sm px-6 h-11 rounded-xl transition-all hover:scale-[1.02] active:scale-95 shadow-lg shadow-brand/20">
                Start selling
                <ArrowRight className="w-4 h-4" />
              </button>
            </Link>
            <span className="text-sm text-slate-400">
              Paid in as little as 30 minutes
            </span>
          </div>
        </div>
      </section>

      {/* ── Buying Section ── */}
      <section className="py-20 px-4">
        <div className="max-w-5xl mx-auto">
          {/* Header */}
          <div className="max-w-2xl mb-14">
            <SectionTag label="Buying" />
            <h2 className="text-3xl sm:text-4xl font-extrabold text-slate-900 tracking-tight mb-4">
              Save money on{" "}
              <span className="text-cta">top brands</span>
            </h2>
            <p className="text-lg text-slate-500 leading-relaxed">
              Browse verified discounted gift cards across a variety of brands
              and regions. Pay with crypto, receive instantly.
            </p>
          </div>

          {/* Steps — 2×2 grid on md+ */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-5">
            {buyingSteps.map((step, i) => (
              <StepCard key={step.number} step={step} variant="buy" index={i} />
            ))}
          </div>

          {/* CTA */}
          <div className="mt-10 flex items-center gap-4 flex-wrap">
            <Link href="/buy-gift-cards">
              <button className="inline-flex items-center gap-2 bg-cta hover:bg-cta/90 text-white font-semibold text-sm px-6 h-11 rounded-xl transition-all hover:scale-[1.02] active:scale-95 shadow-lg shadow-cta/20">
                Browse gift cards
                <ArrowRight className="w-4 h-4" />
              </button>
            </Link>
            <span className="text-sm text-slate-400">
              Delivered same day · Escrow protected
            </span>
          </div>
        </div>
      </section>

      {/* ── Bottom CTA ── */}
      {!isAuthenticated && (
        <section className="py-16 px-4 bg-slate-900">
        <div className="max-w-2xl mx-auto text-center">
          <h2 className="text-3xl font-extrabold text-white mb-4 tracking-tight">
            Ready to get started?
          </h2>
          <p className="text-slate-400 mb-8 text-lg">
            Create a free anonymous account and start trading in seconds.
          </p>
          <Link href="/signup">
            <button className="inline-flex items-center gap-2 bg-cta hover:bg-cta/90 text-white font-bold text-base px-8 h-13 rounded-xl transition-all hover:scale-[1.02] active:scale-95 shadow-xl shadow-cta/20">
              Create Free Account
              <ArrowRight className="w-5 h-5" />
            </button>
          </Link>
        </div>
      </section>
      )}
      
    </div>
  );
}