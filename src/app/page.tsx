'use client';
import React from 'react';
import Link from 'next/link';
import { useAuth } from '@/features/auth/contexts/AuthContext';
import { Button } from '@/components/ui/Button';
import { Card, CardBody } from '@/components/ui/Card';
import { Lock, Zap, ShieldCheck, TrendingUp, Store, DollarSign, Users, Sparkles, Bitcoin } from 'lucide-react';
import { Footer } from '@/components/shared/Footer';

export default function HomePage() {
  const { isAuthenticated } = useAuth();

  return (
    <div className="min-h-screen bg-white">
      {/* Hero Section - Light Neutral Background */}
      <div className="bg-slate-50 border-b border-slate-100">
  <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 pt-20 pb-24">
    
    <div className="text-center max-w-4xl mx-auto">

      {/* Badge */}
      <div className="inline-flex items-center gap-2 rounded-full border border-slate-200 bg-white px-5 py-2 shadow-sm mb-8">
        <Sparkles className="h-4 w-4 text-brand animate-pulse" />
        <span className="text-xs sm:text-sm font-bold tracking-widest text-slate-600 uppercase">
          Buy gift cards with crypto
        </span>
      </div>

      {/* Heading */}
      <h1 className="text-4xl sm:text-5xl lg:text-6xl font-extrabold text-slate-900 leading-tight mb-6 tracking-tight">
        Save more on your next purchase with{" "}
        <span className="text-brand">verified gift cards</span>
      </h1>

      {/* Description */}
      <p className="text-lg sm:text-xl text-slate-600 max-w-3xl mx-auto mb-10 leading-relaxed">
        Purchase verified gift cards and enjoy instant digital delivery at discounted rates.
        <span className="block mt-4 text-base sm:text-lg text-slate-500">
          Browse top retailers and pay securely using cryptocurrency.
        </span>
      </p>

      {/* CTA */}
      {!isAuthenticated && (
        <div className="flex flex-col sm:flex-row gap-4 justify-center items-center">
          <Link href="/signup">
            <Button className="bg-brand hover:bg-brand/90 text-white text-base sm:text-lg px-8 sm:px-10 h-12 sm:h-14 rounded-xl shadow-lg shadow-brand/20 transition-all hover:scale-[1.03] active:scale-95">
              Start Trading Now
            </Button>
          </Link>

          <Link href="/buy-gift-cards">
            <Button
              variant="outline"
              className="text-base sm:text-lg px-6 sm:px-8 h-12 sm:h-14 rounded-xl border-slate-300 text-slate-700 hover:bg-slate-50 transition-all hover:scale-[1.03] active:scale-95"
            >
              View Retailers
            </Button>
          </Link>
        </div>
      )}

      {/* Features */}
      <div className="flex flex-wrap items-center justify-center gap-x-8 gap-y-4 mt-12 text-sm font-semibold text-slate-500">
        <div className="flex items-center gap-2 cursor-default">
          <ShieldCheck className="w-5 h-5 text-brand" />
          <span>Verified Cards</span>
        </div>

        <div className="flex items-center gap-2 cursor-default">
          <Zap className="w-5 h-5 text-cta" />
          <span>Lightning Fast Delivery</span>
        </div>
      </div>

    </div>
  </div>
</div>

      {/* Features Section */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-24">
          <div className="text-center mb-16">
            <h2 className="text-4xl font-black text-slate-900 mb-4 tracking-tight">
              WHY TRADERS CHOOSE US
            </h2>
            <p className="text-slate-500 text-lg">
              Built for speed, privacy, and the best rates in the market.
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
            {[
              {
                icon: Lock,
                color: "brand",
                title: "Complete Anonymity",
                desc: "No email, no phone, no KYC. Create a username and start trading in seconds.",
              },
              {
                icon: Bitcoin,
                color: "brand",
                title: "Over 50 Cryptocurrencies Accepted",
                desc: "Pay and receive with Bitcoin, Ethereum, USDT, USDC, Solana and many more.",
              },
              {
                icon: ShieldCheck,
                color: "brand",
                title: "Verified Gift Cards",
                desc: "Every card is automatically validated for balance and authenticity before listing.",
              },
              {
                icon: Zap,
                color: "brand",
                title: "Fast Listing Times",
                desc: "Your gift card listing goes live quickly after submission, once validated.",
              },
              {
                icon: Store,
                color: "brand",
                title: "Major Retailers",
                desc: "Amazon, Apple, Uber, Steam, PlayStation & many others across UK, USA, and Canada.",
              },
              {
                icon: Zap,
                color: "cta",
                title: "Lightning Fast Payouts",
                desc: "Crypto is transferred into your wallet within as little as 30 minutes.",
              },
            ].map((feature, index) => (
              <div key={index} className="dark-card p-8 rounded-2xl group hover:scale-[1.02] transition-all cursor-default">
                  <div className={`w-14 h-14 rounded-2xl flex items-center justify-center mb-6 
                    ${feature.color === 'brand' ? 'bg-brand/10 text-brand' : 'bg-cta/10 text-cta'} group-hover:scale-110 transition-transform`}>
                    <feature.icon className="w-7 h-7" />
                  </div>
                  
                  <h3 className="text-xl font-bold text-slate-900 mb-3">
                    {feature.title}
                  </h3>
                  
                  <p className="text-slate-600 leading-relaxed">
                    {feature.desc}
                  </p>
              </div>
            ))}
          </div>
        </div>

      {/* How It Works - Step Numbers use Primary Brand Color */}
      <div className="bg-slate-50 py-24 border-y border-slate-200">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-16">
            <h2 className="text-3xl font-black text-slate-900 mb-4 uppercase tracking-tight">
              How It Works
            </h2>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-4 gap-12">
            {[
              { step: "01", title: "Sign Up", desc: "Create an anonymous account instantly" },
              { step: "02", title: "Browse", desc: "Find gift cards at the best prices" },
              { step: "03", title: "Pay Securely", desc: "Complete payment with cryptocurrency" },
              { step: "04", title: "Redeem", desc: "Get your balance or funds instantly" },
            ].map((item, idx) => (
              <div key={idx} className="text-center">
                <div className="inline-flex items-center justify-center w-16 h-16 rounded-2xl bg-brand text-white text-2xl font-black mb-6 shadow-lg shadow-brand/20">
                  {item.step}
                </div>
                <h3 className="font-bold text-slate-900 mb-3 text-xl">
                  {item.title}
                </h3>
                <p className="text-slate-500 text-sm font-medium leading-relaxed">
                  {item.desc}
                </p>
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* Final CTA - Using CTA Orange for 'Urgent/Sell' Action */}
      {!isAuthenticated && (
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-24">
          <div className="bg-slate-900 rounded-[2.5rem] p-12 md:p-20 text-center text-white shadow-2xl relative overflow-hidden">
            <div className="absolute top-0 right-0 w-64 h-64 bg-brand/20 blur-[100px]" />
            
            <div className="relative z-10 max-w-2xl mx-auto">
              <h2 className="text-4xl md:text-5xl font-black mb-6 tracking-tight">
                Ready to Trade Smarter?
              </h2>
              <p className="text-xl text-slate-400 mb-10 font-medium">
                Join thousands of users already buying and selling gift cards anonymously with crypto.
              </p>

              <Link href="/signup">
                <Button
                  className="bg-cta hover:bg-cta/90 text-white h-16 px-12 rounded-xl text-xl font-bold shadow-xl shadow-cta/20"
                >
                  Create Anonymous Account — Free
                </Button>
              </Link>
            </div>
          </div>
        </div>
      )}

      {/* Footer */}
      <Footer/>
    </div>
  );
}