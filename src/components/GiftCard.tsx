'use client';

import React, { useState } from 'react';
import { ShieldCheck, Zap, ShoppingCart, CheckCircle2, Loader2 } from 'lucide-react';

interface GiftCardProps {
  card: {
    id: string;
    retailer: { name: string; color?: string };
    value: number;
    price: number;
    discount: number;
  };
}

export const GiftCard = ({ card }: GiftCardProps) => {
  // Functional State for the Buy Button
  const [purchaseStatus, setPurchaseStatus] = useState<'idle' | 'processing' | 'completed'>('idle');

  const handlePurchase = async () => {
    setPurchaseStatus('processing');
    
    // Simulate API / Blockchain Transaction Delay
    await new Promise((resolve) => setTimeout(resolve, 1800));
    
    setPurchaseStatus('completed');

    // Reset after 3 seconds to return to marketplace view
    setTimeout(() => setPurchaseStatus('idle'), 3000);
  };

  return (
    <div className="bg-white border border-slate-200 rounded-[2.5rem] p-5 transition-all duration-300 hover:border-[#007bfb] hover:shadow-xl hover:shadow-[#007bfb]/5 group">
      
      {/* 🎨 REALISTIC CARD VISUAL */}
      <div 
        className="relative h-44 w-full rounded-2xl overflow-hidden mb-5 shadow-lg flex flex-col justify-between p-6 transition-transform duration-500 group-hover:scale-[1.02]"
        style={{ 
          background: `linear-gradient(135deg, ${card.retailer.color || '#1e293b'} 0%, #0f172a 100%)` 
        }}
      >
        {/* Glossy Card Texture Overlay */}
        <div className="absolute inset-0 bg-gradient-to-tr from-white/5 to-transparent pointer-events-none" />
        <div className="absolute -top-12 -right-12 w-40 h-40 bg-white/5 rounded-full blur-3xl" />

        {/* Card Top: Retailer & Security */}
        <div className="relative flex justify-between items-start">
          <div className="px-3 py-1 bg-white/10 backdrop-blur-md border border-white/20 rounded-lg">
            <span className="text-[10px] font-bold text-white uppercase tracking-widest">
              {card.retailer.name}
            </span>
          </div>
          <ShieldCheck size={20} className="text-[#05f2ab]" />
        </div>

        {/* Card Bottom: Value & Chip Simulation */}
        <div className="relative flex justify-between items-end">
          <div>
            <p className="text-[9px] font-bold text-white/50 uppercase tracking-[0.2em] mb-1">Face Value</p>
            <h3 className="text-3xl font-bold text-white tracking-tighter">${card.value}</h3>
          </div>
          {/* Golden Security Chip */}
          <div className="w-12 h-9 bg-gradient-to-br from-amber-300 via-amber-500 to-amber-600 rounded-md opacity-90 border border-white/20 shadow-inner" />
        </div>
      </div>

      {/* 📊 INFO & PRICING */}
      <div className="px-1 mb-5">
        <div className="flex justify-between items-end">
          <div>
            <div className="flex items-center gap-2 mb-1">
              <span className="text-2xl font-bold text-slate-900">${card.price}</span>
              <span className="bg-[#01aa88]/10 text-[#01aa88] px-2 py-0.5 rounded text-[10px] font-bold uppercase">
                -{card.discount}% OFF
              </span>
            </div>
            <p className="text-[10px] font-bold text-slate-400 uppercase tracking-widest">Instant Crypto Price</p>
          </div>
          <div className="text-right">
            <div className="flex items-center justify-end gap-1 text-[#01aa88] mb-0.5">
              <Zap size={14} fill="currentColor" />
              <span className="text-[10px] font-bold uppercase">Instant</span>
            </div>
            <p className="text-[10px] font-bold text-slate-400 uppercase">Verification</p>
          </div>
        </div>
      </div>

      {/* ⚡ FUNCTIONAL BUY BUTTON */}
      <button
        onClick={handlePurchase}
        disabled={purchaseStatus !== 'idle'}
        className={`w-full h-14 rounded-2xl font-bold text-sm uppercase tracking-widest transition-all duration-300 flex items-center justify-center gap-2
          ${purchaseStatus === 'idle' ? 'bg-[#007bfb] text-white hover:brightness-110 active:scale-95 shadow-lg shadow-[#007bfb]/20' : ''}
          ${purchaseStatus === 'processing' ? 'bg-slate-100 text-slate-400 cursor-wait' : ''}
          ${purchaseStatus === 'completed' ? 'bg-gradient-to-r from-[#01aa88] to-[#05f2ab] text-white animate-in zoom-in-95' : ''}
        `}
      >
        {purchaseStatus === 'idle' && (
          <>
            <ShoppingCart size={18} strokeWidth={2.5} />
            Buy Card Now
          </>
        )}

        {purchaseStatus === 'processing' && (
          <>
            <Loader2 size={18} className="animate-spin text-[#007bfb]" />
            Verifying Funds...
          </>
        )}

        {purchaseStatus === 'completed' && (
          <>
            <CheckCircle2 size={18} strokeWidth={3} />
            Successfully Purchased!
          </>
        )}
      </button>
    </div>
  );
};