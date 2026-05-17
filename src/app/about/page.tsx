'use client';

import React from 'react';
import { Footer } from '@/components/shared/Footer';
import { ShieldCheck, Zap, Lock } from 'lucide-react';

export default function AboutPage() {
  return (
    <div className="min-h-screen bg-[#f5f1e8] text-slate-900 font-sans flex flex-col">
      <main className="flex-1 pt-24 pb-20">
        <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="bg-white rounded-[3rem] shadow-xl p-10 md:p-16 border border-slate-100">
            <h1 className="text-4xl md:text-5xl font-black text-slate-900 mb-6 tracking-tight">
              About Us
            </h1>
            <div className="prose prose-slate max-w-none text-slate-600">
              <p className="text-lg leading-relaxed mb-8">
                Welcome to GitCard Crypto, the premier marketplace for buying and selling gift cards anonymously using cryptocurrency. We built this platform to bridge the gap between digital assets and real-world spending power.
              </p>

              <h2 className="text-2xl font-black text-slate-900 mb-4 mt-12">Our Mission</h2>
              <p className="mb-8">
                Our mission is to provide a fast, secure, and privacy-focused platform where users can seamlessly exchange cryptocurrency for gift cards from the world's leading retailers, without sacrificing their personal data.
              </p>

              <div className="grid grid-cols-1 md:grid-cols-3 gap-6 my-12">
                <div className="bg-slate-50 p-6 rounded-2xl border border-slate-100 text-center">
                  <ShieldCheck className="w-8 h-8 text-brand mx-auto mb-4" />
                  <h3 className="font-bold text-slate-900 mb-2">Secure</h3>
                  <p className="text-sm">Every gift card is verified and every transaction is protected by blockchain technology.</p>
                </div>
                <div className="bg-slate-50 p-6 rounded-2xl border border-slate-100 text-center">
                  <Zap className="w-8 h-8 text-cta mx-auto mb-4" />
                  <h3 className="font-bold text-slate-900 mb-2">Fast</h3>
                  <p className="text-sm">Enjoy instant digital delivery upon payment confirmation.</p>
                </div>
                <div className="bg-slate-50 p-6 rounded-2xl border border-slate-100 text-center">
                  <Lock className="w-8 h-8 text-brand mx-auto mb-4" />
                  <h3 className="font-bold text-slate-900 mb-2">Anonymous</h3>
                  <p className="text-sm">No KYC required. Trade freely while protecting your personal identity.</p>
                </div>
              </div>

              <h2 className="text-2xl font-black text-slate-900 mb-4 mt-12">How We Operate</h2>
              <p>
                We partner with verified sellers worldwide to bring you an extensive inventory of gift cards at discounted rates. Our automated rate-locking technology ensures that you always get the exact value you pay for, completely insulated from market volatility during the checkout process.
              </p>
            </div>
          </div>
        </div>
      </main>
      <Footer />
    </div>
  );
}
