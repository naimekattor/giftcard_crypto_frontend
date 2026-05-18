'use client';

import React from 'react';

export default function PrivacyPolicyPage() {
  return (
    <div className="min-h-screen bg-[#f5f1e8] text-slate-900 font-sans">
      <main className="pt-24 pb-20">
        <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="bg-white rounded-[3rem] shadow-xl p-10 md:p-16 border border-slate-100">
            <h1 className="text-4xl md:text-5xl font-black text-slate-900 mb-6 tracking-tight">
              Privacy Policy
            </h1>
            <p className="text-slate-500 mb-10 font-medium">Last updated: May 2026</p>

            <div className="prose prose-slate max-w-none text-slate-600 space-y-8">
              <section>
                <h2 className="text-2xl font-black text-slate-900 mb-4">1. Information We Collect</h2>
                <p>
                  At GitCard Crypto, privacy is our priority. We collect only the minimum amount of information necessary to facilitate secure transactions. This may include email addresses (if voluntarily provided for support/notifications) and wallet addresses used for processing payouts and verifying transactions on the blockchain.
                </p>
              </section>

              <section>
                <h2 className="text-2xl font-black text-slate-900 mb-4">2. How We Use Your Information</h2>
                <p>
                  We use your information exclusively to:
                </p>
                <ul className="list-disc pl-6 space-y-2 mt-4">
                  <li>Process and confirm cryptocurrency transactions.</li>
                  <li>Deliver gift card codes and PINs securely.</li>
                  <li>Resolve transaction disputes and provide customer support.</li>
                  <li>Prevent fraud and ensure the integrity of our marketplace.</li>
                </ul>
              </section>

              <section>
                <h2 className="text-2xl font-black text-slate-900 mb-4">3. Data Sharing & Disclosure</h2>
                <p>
                  We do not sell, trade, or otherwise transfer your personal information to outside parties. Your data is strictly confidential. Transaction data recorded on public blockchains is inherently public, but we do not link your identity to these wallet addresses on our platform.
                </p>
              </section>

              <section>
                <h2 className="text-2xl font-black text-slate-900 mb-4">4. Security Measures</h2>
                <p>
                  We implement robust security measures, including end-to-end encryption and secure wallet integration, to maintain the safety of your digital assets and whatever minimal personal information you choose to share with us.
                </p>
              </section>

              <section>
                <h2 className="text-2xl font-black text-slate-900 mb-4">5. Cookies & Tracking</h2>
                <p>
                  We use essential cookies strictly for maintaining user sessions and securing the authentication process. We do not use third-party tracking or advertising cookies.
                </p>
              </section>
            </div>
          </div>
        </div>
      </main>
    </div>
  );
}
