import React from 'react';
import Link from 'next/link';
import Image from 'next/image';
import { Twitter, Disc as Discord, ShieldCheck, Mail } from 'lucide-react';

export const Footer = () => {
  return (
    <footer className="bg-white border-t border-slate-200 pt-20 pb-10">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="grid grid-cols-2 md:grid-cols-4 lg:grid-cols-5 gap-12 mb-16">
          
          {/* Brand Column */}
          <div className="col-span-2 lg:col-span-2">
            <Link href="/" className="inline-block mb-6">
              <Image src="/logo.png" alt="GiftCard Market" width={150} height={40} />
            </Link>
            <p className="text-slate-500 text-sm leading-relaxed max-w-sm mb-8 font-medium">
              The world's most secure, anonymous peer-to-peer gift card marketplace. 
              Buy at a discount, or sell for instant crypto payouts.
            </p>
            <div className="flex gap-4">
              <Link href="#" className="w-10 h-10 rounded-full bg-slate-50 flex items-center justify-center text-slate-400 hover:text-brand hover:bg-brand/5 transition-all">
                <Twitter size={18} />
              </Link>
              <Link href="#" className="w-10 h-10 rounded-full bg-slate-50 flex items-center justify-center text-slate-400 hover:text-brand hover:bg-brand/5 transition-all">
                <Discord size={18} />
              </Link>
              <Link href="mailto:support@giftcard.market" className="w-10 h-10 rounded-full bg-slate-50 flex items-center justify-center text-slate-400 hover:text-brand hover:bg-brand/5 transition-all">
                <Mail size={18} />
              </Link>
            </div>
          </div>

          {/* Top Retailers */}
          <div>
            <h3 className="font-bold text-brand uppercase text-[11px] tracking-[0.15em] mb-7">Shop Brands</h3>
            <ul className="space-y-4 text-sm font-bold text-slate-600">
              <li><Link href="/buy-gift-cards?brand=amazon" className="hover:text-brand transition-colors">Amazon Cards</Link></li>
              <li><Link href="/buy-gift-cards?brand=apple" className="hover:text-brand transition-colors">Apple & iTunes</Link></li>
              <li><Link href="/buy-gift-cards?brand=steam" className="hover:text-brand transition-colors">Steam Wallet</Link></li>
              <li><Link href="/buy-gift-cards?brand=razor" className="hover:text-brand transition-colors">Razor Gold</Link></li>
              <li><Link href="/buy-gift-cards?brand=playstation" className="hover:text-brand transition-colors">PlayStation</Link></li>
            </ul>
          </div>

          {/* Platform & Selling */}
          <div>
            <h3 className="font-bold text-brand uppercase text-[11px] tracking-[0.15em] mb-7">Platform</h3>
            <ul className="space-y-4 text-sm font-bold">
              <li><Link href="/buy-gift-cards" className="text-slate-600 hover:text-brand transition-colors">Browse All</Link></li>
              <li><Link href="/wallet" className="text-slate-600 hover:text-brand transition-colors">My Wallet</Link></li>
              <li>
                {/* CTA Orange used for the Sell action to create urgency */}
                <Link href="/sell" className="text-cta hover:opacity-80 transition-opacity flex items-center gap-1.5">
                  Sell Your Cards <span className="text-[10px]">🔥</span>
                </Link>
              </li>
              <li><Link href="/faq" className="text-slate-600 hover:text-brand transition-colors">Help Center</Link></li>
            </ul>
          </div>

          {/* Trust & Legal */}
          <div>
            <h3 className="font-bold text-brand uppercase text-[11px] tracking-[0.15em] mb-7">Safety</h3>
            <ul className="space-y-4 text-sm font-bold text-slate-600">
              <li><Link href="/terms" className="hover:text-brand transition-colors">Terms of Service</Link></li>
              <li><Link href="/privacy" className="hover:text-brand transition-colors">Privacy Policy</Link></li>
              <li className="pt-4 flex items-center gap-2 text-status-completed text-xs uppercase tracking-wider">
                <ShieldCheck size={16} strokeWidth={3} />
                Escrow Protected
              </li>
            </ul>
          </div>

        </div>

        {/* Bottom Bar */}
        <div className="pt-10 border-t border-slate-100 flex flex-col md:flex-row justify-between items-center gap-4">
          <p className="text-[11px] font-bold text-slate-400 uppercase tracking-widest">
            © 2026 GiftCard Market. Decentralized Peer-to-Peer Trading.
          </p>
          <div className="flex items-center gap-6">
            <div className="flex items-center gap-2 text-[10px] font-black text-slate-400 uppercase">
              <span className="w-1.5 h-1.5 rounded-full bg-status-completed" /> 
              Global Infrastructure Active
            </div>
          </div>
        </div>
      </div>
    </footer>
  );
};