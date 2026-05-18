'use client';

import React from 'react';
import { SellerCardForm } from '@/features/giftcards/components/SellerCardForm';
import { ShieldCheck, Zap, Lock } from 'lucide-react';
import Link from 'next/link';

export default function SellerPage() {
  return (
    <div className="min-h-screen bg-slate-50">
      {/* Hero Section */}
      <div className="bg-white border-b border-slate-200 pt-16 pb-12">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
          <h1 className="text-4xl md:text-5xl font-black text-slate-900 mb-4 tracking-tight">
            Sell Your Gift Cards <span className="text-brand">Anonymously</span>
          </h1>
          <p className="text-lg text-slate-500 max-w-2xl mx-auto font-medium">
            Convert your unused gift cards into cryptocurrency instantly. No account, no KYC, no hassle.
          </p>
        </div>
      </div>

      {/* Form Section */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-16">
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-16 items-start">
          
          {/* Sidebar Info - Hidden on mobile, shown on large screens */}
          <div className="hidden lg:flex lg:col-span-4 flex-col gap-8 sticky top-32">
            <div className="space-y-6">
              <div className="flex gap-4">
                <div className="w-12 h-12 bg-brand/10 rounded-2xl flex items-center justify-center shrink-0">
                  <Lock className="w-6 h-6 text-brand" />
                </div>
                <div>
                  <h3 className="font-bold text-slate-900">Total Anonymity</h3>
                  <p className="text-sm text-slate-500 font-medium leading-relaxed">No registration needed. Your privacy is our priority.</p>
                </div>
              </div>

              <div className="flex gap-4">
                <div className="w-12 h-12 bg-cta/10 rounded-2xl flex items-center justify-center shrink-0">
                  <Zap className="w-6 h-6 text-cta" />
                </div>
                <div>
                  <h3 className="font-bold text-slate-900">Fast listing times</h3>
                  <p className="text-sm text-slate-500 font-medium leading-relaxed">Your gift card listing goes live quickly after submission, once validated </p>
                </div>
              </div>

              <div className="flex gap-4">
                <div className="w-12 h-12 bg-success-completed/10 rounded-2xl flex items-center justify-center shrink-0" style={{ backgroundColor: 'rgba(1, 170, 136, 0.1)' }}>
                  <ShieldCheck className="w-6 h-6" style={{ color: '#01aa88' }} />
                </div>
                <div>
                  <h3 className="font-bold text-slate-900">Lightning fast payoutss</h3>
                  <p className="text-sm text-slate-500 font-medium leading-relaxed">Crypto is transferred into your wallet within as little as 30 minutes. </p>
                </div>
              </div>
            </div>

            <div className="p-8 bg-slate-900 rounded-[2rem] text-white">
              <h4 className="font-black mb-2 tracking-tight">NEED HELP?</h4>
              <p className="text-sm text-slate-400 font-medium mb-6">Our support team is available 24/7 via Telegram.</p>
              <Link href={"/contact"}>
              <button className=" cursor-pointer w-full bg-white/10 hover:bg-white/20 text-white font-bold py-3 rounded-xl transition-colors text-sm">
                Contact Support
              </button>
              </Link>
            </div>
          </div>

          {/* Main Form */}
          <div className="lg:col-span-8">
            <SellerCardForm />
          </div>
        </div>
      </div>
    </div>
  );
}
