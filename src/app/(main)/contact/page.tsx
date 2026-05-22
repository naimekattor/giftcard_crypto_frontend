'use client';

import React from 'react';
import { Mail, MessageCircle, Clock, MapPin } from 'lucide-react';

export default function ContactPage() {
  return (
    <div className="min-h-screen bg-[#f5f1e8] text-slate-900 font-sans">
      <main className="pt-24 pb-20">
        <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="bg-white rounded-[3rem] shadow-xl p-10 md:p-16 border border-slate-100">
            <h1 className="text-4xl md:text-5xl font-bold text-slate-900 mb-6 tracking-tight">
              Support & Contact
            </h1>
            <p className="text-lg text-slate-500 mb-12">
              Need help with a transaction or have a question about our platform? Our support team is available to assist you.
            </p>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-8 mb-16">
              <div className="bg-slate-50 rounded-3xl p-8 border border-slate-100">
                <Mail className="w-8 h-8 text-brand mb-4" />
                <h3 className="text-xl font-bold text-slate-900 mb-2">Email Support</h3>
                <p className="text-slate-500 mb-4">Send us an email anytime and we'll get back to you within 24 hours.</p>
                <a href="mailto:support@gitcardcrypto.com" className="font-bold text-brand hover:underline">
                  support@gitcardcrypto.com
                </a>
              </div>
              <div className="bg-slate-50 rounded-3xl p-8 border border-slate-100">
                <Clock className="w-8 h-8 text-brand mb-4" />
                <h3 className="text-xl font-bold text-slate-900 mb-2">Business Hours</h3>
                <p className="text-slate-500 mb-4">Our support team is online and reviewing tickets during the following times:</p>
                <div className="font-bold text-slate-700">Mon - Fri: 9:00 AM - 6:00 PM (EST)</div>
              </div>
            </div>

            
          </div>
        </div>
      </main>
    </div>
  );
}
