'use client';

import React from 'react';

export default function TermsPage() {
  return (
    <div className="min-h-screen bg-[#f5f1e8] text-slate-900 font-sans">
      <main className="pt-24 pb-20">
        <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="bg-white rounded-[3rem] shadow-xl p-10 md:p-16 border border-slate-100">
            <h1 className="text-4xl md:text-5xl font-bold text-slate-900 mb-6 tracking-tight">
              Terms of Service
            </h1>
            <p className="text-slate-500 mb-10 font-medium">Last updated: May 2026</p>

            <div className="prose prose-slate max-w-none text-slate-600 space-y-8">
              <section>
                <h2 className="text-2xl font-bold text-slate-900 mb-4">1. Acceptance of Terms</h2>
                <p>
                  By accessing and using GitCard Crypto ("the Platform"), you agree to be bound by these Terms of Service. If you do not agree to these terms, please do not use our services. We reserve the right to modify these terms at any time.
                </p>
              </section>

              <section>
                <h2 className="text-2xl font-bold text-slate-900 mb-4">2. Description of Service</h2>
                <p>
                  GitCard Crypto operates as a peer-to-peer marketplace facilitating the exchange of gift cards for cryptocurrency. We act as an intermediary to ensure secure transactions but do not directly issue the gift cards listed on the platform.
                </p>
              </section>

              <section>
                <h2 className="text-2xl font-bold text-slate-900 mb-4">3. User Accounts</h2>
                <p>
                  While we prioritize privacy and do not mandate strict KYC procedures, users must maintain the security of their account credentials. You are responsible for all activities that occur under your account. We reserve the right to suspend accounts suspected of fraudulent activity.
                </p>
              </section>

              <section>
                <h2 className="text-2xl font-bold text-slate-900 mb-4">4. Transactions & Cryptocurrency</h2>
                <p>
                  All cryptocurrency payments are final. We utilize a rate-locking mechanism to protect buyers from extreme volatility during the checkout window. If a payment is received after the rate lock expires, the transaction may be marked as expired and subject to manual review or refund minus network fees.
                </p>
              </section>

              <section>
                <h2 className="text-2xl font-bold text-slate-900 mb-4">5. Dispute Resolution</h2>
                <p>
                  If you receive a defective or invalid gift card, you must open a dispute within 24 hours of purchase. Our admin team will investigate the complaint. If the seller is found at fault, the buyer will be refunded. False disputes may result in account termination.
                </p>
              </section>
            </div>
          </div>
        </div>
      </main>
    </div>
  );
}
