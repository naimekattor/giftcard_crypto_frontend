'use client';

import React from 'react';
import { Gift, Sparkles, Trophy, Coins } from 'lucide-react';

export default function GiveawayComingSoon() {
  return (
    <main className="relative min-h-screen w-full overflow-hidden bg-[#050506] text-white flex items-center justify-center px-4 py-20">
      
      {/* Ambient Background */}
      <div className="absolute inset-0 overflow-hidden pointer-events-none">
        
        {/* Main Glow */}
        <div className="absolute top-1/2 left-1/2 w-[700px] h-[700px] -translate-x-1/2 -translate-y-1/2 rounded-full bg-[#E86F24]/10 blur-[140px]" />

        {/* Secondary Glow */}
        <div className="absolute top-20 right-10 w-[280px] h-[280px] rounded-full bg-[#01aa88]/10 blur-[120px]" />

        {/* Grid Texture */}
        <div
          className="absolute inset-0 opacity-[0.03]"
          style={{
            backgroundImage:
              'radial-gradient(rgba(255,255,255,0.18) 1px, transparent 0)',
            backgroundSize: '26px 26px',
          }}
        />
      </div>

      {/* Floating Decorative Icons */}
      <div className="absolute inset-0 overflow-hidden pointer-events-none">
        
        <div className="absolute top-[18%] left-[12%] animate-pulse">
          <Gift className="w-10 h-10 text-[#E86F24]/20" />
        </div>

        <div className="absolute bottom-[20%] right-[15%] animate-bounce">
          <Coins className="w-10 h-10 text-[#01aa88]/20" />
        </div>

        <div className="absolute top-[30%] right-[22%] animate-pulse">
          <Sparkles className="w-8 h-8 text-white/10" />
        </div>

        <div className="absolute bottom-[25%] left-[18%] animate-pulse">
          <Trophy className="w-9 h-9 text-[#E86F24]/20" />
        </div>
      </div>

      {/* Content */}
      <div className="relative z-10 max-w-5xl w-full flex flex-col items-center text-center">
        
        {/* Coming Soon Badge */}
        <div className="mb-6 inline-flex items-center gap-2 rounded-full border border-[#E86F24]/20 bg-[#E86F24]/10 px-5 py-2 backdrop-blur-sm">
          <span className="w-2 h-2 rounded-full bg-[#E86F24] animate-pulse" />
          <span className="text-xs tracking-[0.25em] uppercase font-semibold text-[#E86F24]">
            Coming Soon
          </span>
        </div>

        {/* Hero Text */}
        <div className="relative w-full flex flex-col items-center justify-center py-10">
          
          {/* Background Text */}
          <h1 className="text-[16vw] sm:text-8xl md:text-9xl lg:text-[10rem] font-black uppercase tracking-[-0.08em] leading-none text-[#121214] select-none">
            GIVEAWAY
          </h1>

          {/* Overlay Text */}
          <div className="absolute flex flex-col items-center">
            
            <span
              className="text-[11vw] sm:text-6xl md:text-7xl lg:text-8xl leading-none text-transparent bg-clip-text bg-gradient-to-b from-white via-gray-200 to-gray-500 drop-shadow-[0_15px_35px_rgba(0,0,0,0.8)]"
              style={{
                fontFamily: "'Great Vibes', cursive",
              }}
            >
              Monthly
            </span>

            <span className="mt-2 text-lg sm:text-xl md:text-2xl font-semibold tracking-[0.35em] uppercase text-white/80">
              GIVEAWAY EVENT
            </span>
          </div>
        </div>

        {/* Decorative Divider */}
        <div className="mt-2 mb-8 flex items-center gap-3">
          <div className="w-14 h-[2px] bg-[#E86F24]" />
          <div className="w-2 h-2 rounded-full bg-[#E86F24]" />
          <div className="w-14 h-[2px] bg-[#E86F24]" />
        </div>

        {/* Description */}
        <p className="max-w-2xl text-sm sm:text-base md:text-lg text-gray-400 leading-relaxed font-light">
          We’re preparing exciting monthly giveaways, exclusive promotions,
          and crypto reward opportunities for our community.
          Stay tuned for upcoming announcements and special campaigns.
        </p>

        {/* Feature Cards */}
        <div className="mt-14 grid grid-cols-1 md:grid-cols-3 gap-5 w-full max-w-4xl">
          
          <div className="rounded-3xl border border-white/5 bg-white/[0.03] backdrop-blur-xl p-6 text-left">
            <Gift className="w-7 h-7 text-[#E86F24] mb-4" />
            <h3 className="text-lg font-semibold mb-2">
              Monthly Rewards
            </h3>
            <p className="text-sm text-gray-400 leading-relaxed">
              Participate in future monthly reward campaigns and exclusive community giveaways.
            </p>
          </div>

          <div className="rounded-3xl border border-white/5 bg-white/[0.03] backdrop-blur-xl p-6 text-left">
            <Coins className="w-7 h-7 text-[#01aa88] mb-4" />
            <h3 className="text-lg font-semibold mb-2">
              Crypto Bonuses
            </h3>
            <p className="text-sm text-gray-400 leading-relaxed">
              Earn exciting crypto-based rewards and promotional bonuses during events.
            </p>
          </div>

          <div className="rounded-3xl border border-white/5 bg-white/[0.03] backdrop-blur-xl p-6 text-left">
            <Trophy className="w-7 h-7 text-[#E86F24] mb-4" />
            <h3 className="text-lg font-semibold mb-2">
              Exclusive Campaigns
            </h3>
            <p className="text-sm text-gray-400 leading-relaxed">
              Access limited-time campaigns, special retailer promotions, and community competitions.
            </p>
          </div>
        </div>

        {/* Footer Indicator */}
        <div className="mt-16 flex items-center gap-3 text-[11px] uppercase tracking-[0.35em] text-gray-500">
          <span className="w-2 h-2 rounded-full bg-[#E86F24] animate-ping" />
          Stay Tuned
        </div>
      </div>
    </main>
  );
}