'use client';

import { useEffect, useState, useCallback, useMemo } from 'react';
import { useBrowseCards } from '@/features/marketplace/hooks/useMarketplace';
import type { GiftCardListing } from '@/types';
import Link from "next/link";
import {
  ArrowRight,
  Bitcoin,
  CheckCircle2,
  ChevronLeft,
  ChevronRight,
  CircleDollarSign,
  Copy,
  Globe,
  Wallet,
  X,
  ExternalLink,
  Loader2,
  Sparkles,
  Search,
  Tag,
  ShieldCheck,
  ChevronDown,
  AlertTriangle,
  Lock
} from 'lucide-react';
import { ethers } from 'ethers';
import Swal from 'sweetalert2';
import { useAuth } from '@/features/auth/hooks/useAuth';
import { buyerApi, type CardRecord } from '@/services/dashboardApi';
import { RecaptchaField } from '@/components/shared/RecaptchaField';
import { motion, AnimatePresence } from 'motion/react';

const REGIONS = [
  { code: 'USA', flag: '🇺🇸', flagUrl: 'https://flagcdn.com/us.svg', label: 'United States', currency: 'USD', rateKey: 'USD', symbol: '$', warning: '⚠ NOTE – THESE CARDS WILL ONLY WORK IN THE USA' },
  { code: 'UK',  flag: '🇬🇧', flagUrl: 'https://flagcdn.com/gb.svg', label: 'United Kingdom', currency: 'GBP', rateKey: 'GBP', symbol: '£', warning: '⚠ NOTE – THESE CARDS WILL ONLY WORK IN THE UK' },
  { code: 'Canada',  flag: '🇨🇦', flagUrl: 'https://flagcdn.com/ca.svg', label: 'Canada', currency: 'CAD', rateKey: 'CAD', symbol: 'CA$', warning: '⚠ NOTE – THESE CARDS WILL ONLY WORK IN CANADA' },
];

const RETAILERS_BY_REGION: Record<string, string[]> = {
  USA: ['Amazon', 'Nike', 'Uber', 'DICK’S SPORTING GOODS', 'Steam', 'Door Dash', 'AMC', 'Best Buy', 'PlayStation', 'Xbox', 'Costco'],
  Canada: ['Amazon'],
  UK: ['Uber', 'Currys', 'John Lewis', 'Apple', 'Deliveroo', 'Just Eat', 'Halfords', 'ASDA', 'PlayStation'],
};

const API_BASE = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:4000';

type PaymentStep = 'idle' | 'captcha' | 'connecting' | 'paying' | 'confirming' | 'success';

type CryptoMethod = {
  id: string;
  symbol: string;
  accent: string;
  label: string;
  network: string;
  rate: number;
  wallet: string;
  eta: string;
};

const cryptoMethods: CryptoMethod[] = [
  {
    id: 'eth-sepolia',
    symbol: 'ETH',
    accent: '#627EEA',
    label: 'Ethereum',
    network: 'Sepolia',
    rate: 2650.0,
    wallet: 'MetaMask Required',
    eta: '~30s',
  },
];

const retailerThemes: Record<
  string,
  {
    brand: string;
    eyebrow: string;
    texture: string;
    halo: string;
    icon: string;
  }
> = {
  amazon: {
    brand: 'from-[#131921] via-[#232f3e] to-[#37475a]',
    eyebrow: 'Everyday essentials',
    texture: 'bg-[radial-gradient(circle_at_top_right,_rgba(255,153,0,0.35),_transparent_40%)]',
    halo: 'shadow-[0_24px_50px_rgba(13,25,33,0.35)]',
    icon: 'a',
  },
  nike: {
    brand: 'from-[#111] via-[#333] to-[#555]',
    eyebrow: 'Just do it',
    texture: 'bg-[radial-gradient(circle_at_top_right,_rgba(255,255,255,0.1),_transparent_40%)]',
    halo: 'shadow-[0_24px_50px_rgba(0,0,0,0.35)]',
    icon: 'n',
  },
  uber: {
    brand: 'from-[#000] via-[#333] to-[#06c167]',
    eyebrow: 'Ride & Eat',
    texture: 'bg-[radial-gradient(circle_at_top_right,_rgba(6,193,103,0.3),_transparent_40%)]',
    halo: 'shadow-[0_24px_50px_rgba(0,0,0,0.35)]',
    icon: 'u',
  },
  currys: {
    brand: 'from-[#4e148c] via-[#6a1b9a] to-[#8e24aa]',
    eyebrow: 'Electronics',
    texture: 'bg-[radial-gradient(circle_at_top_right,_rgba(255,255,255,0.15),_transparent_40%)]',
    halo: 'shadow-[0_24px_50px_rgba(78,20,140,0.35)]',
    icon: 'c',
  },
  'john-lewis': {
    brand: 'from-[#333] via-[#444] to-[#000]',
    eyebrow: 'Quality Home',
    texture: 'bg-[radial-gradient(circle_at_top_right,_rgba(255,255,255,0.1),_transparent_40%)]',
    halo: 'shadow-[0_24px_50px_rgba(0,0,0,0.35)]',
    icon: 'j',
  },
  apple: {
    brand: 'from-[#000] via-[#333] to-[#999]',
    eyebrow: 'Apps & Media',
    texture: 'bg-[radial-gradient(circle_at_top_right,_rgba(255,255,255,0.2),_transparent_40%)]',
    halo: 'shadow-[0_24px_50px_rgba(0,0,0,0.35)]',
    icon: 'a',
  },
  deliveroo: {
    brand: 'from-[#00ccbc] via-[#00b2a9] to-[#008f8a]',
    eyebrow: 'Food Delivery',
    texture: 'bg-[radial-gradient(circle_at_top_right,_rgba(255,255,255,0.2),_transparent_40%)]',
    halo: 'shadow-[0_24px_50px_rgba(0,204,188,0.35)]',
    icon: 'd',
  },
  'just-eat': {
    brand: 'from-[#f36e21] via-[#d05d1c] to-[#b04b15]',
    eyebrow: 'Order Food',
    texture: 'bg-[radial-gradient(circle_at_top_right,_rgba(255,255,255,0.2),_transparent_40%)]',
    halo: 'shadow-[0_24px_50px_rgba(243,110,33,0.35)]',
    icon: 'j',
  },
  playstation: {
    brand: 'from-[#002f6c] via-[#0057d8] to-[#1d9bf0]',
    eyebrow: 'Console wallet',
    texture: 'bg-[radial-gradient(circle_at_top_right,_rgba(255,255,255,0.24),_transparent_35%)]',
    halo: 'shadow-[0_24px_50px_rgba(0,87,216,0.3)]',
    icon: 'p',
  },
  steam: {
    brand: 'from-[#091a2c] via-[#0f3b67] to-[#1b73ba]',
    eyebrow: 'Gaming wallet',
    texture: 'bg-[radial-gradient(circle_at_top_right,_rgba(255,255,255,0.18),_transparent_35%)]',
    halo: 'shadow-[0_24px_50px_rgba(11,42,77,0.35)]',
    icon: 's',
  },
  xbox: {
    brand: 'from-[#0b2b1a] via-[#107c10] to-[#7fba00]',
    eyebrow: 'Game access',
    texture: 'bg-[radial-gradient(circle_at_top_right,_rgba(255,255,255,0.24),_transparent_35%)]',
    halo: 'shadow-[0_24px_50px_rgba(16,124,16,0.28)]',
    icon: 'x',
  },
};

const defaultTheme = {
  brand: 'from-[#0f172a] via-[#1e293b] to-[#334155]',
  eyebrow: 'Verified Card',
  texture: 'bg-[radial-gradient(circle_at_top_right,_rgba(255,255,255,0.18),_transparent_35%)]',
  halo: 'shadow-[0_24px_50px_rgba(15,23,42,0.28)]',
  icon: 'g',
};

function getRetailerTheme(retailerName: string) {
  const slug = retailerName.toLowerCase().replace(/[^a-z0-9]/g, '-');
  return retailerThemes[slug] ?? defaultTheme;
}

export default function BuyGiftCardsPage() {
  const [filters, setFilters] = useState({ page: 1, limit: 24 });
  const [searchQuery, setSearchQuery] = useState('');
  const [sortBy, setSortBy] = useState('featured');
  const [selectedCard, setSelectedCard] = useState<GiftCardListing | null>(null);
  const [paymentStep, setPaymentStep] = useState<PaymentStep>('idle');
  const [selectedCrypto, setSelectedCrypto] = useState<CryptoMethod>(cryptoMethods[0]);
  const [captchaToken, setCaptchaToken] = useState<string | null>(null);
  const { user, isAuthenticated } = useAuth();
  const { data: cardsData, isLoading } = useBrowseCards(filters);
  const [txHash, setTxHash] = useState<string | null>(null);
  const [activePaymentId, setActivePaymentId] = useState<number | null>(null);
  const [polling, setPolling] = useState(false);
  const [purchasedCard, setPurchasedCard] = useState<CardRecord | null>(null);
  const [codeCopied, setCodeCopied] = useState(false);
  const [pinCopied, setPinCopied] = useState(false);
  const [expiryTime, setExpiryTime] = useState<Date | null>(null);
  const [timeLeft, setTimeLeft] = useState<string>('');

  // ── Region / Currency Switcher ───────────────────────────────────────
  const [selectedRegion, setSelectedRegion] = useState(REGIONS[0]);
  const [isRegionDropdownOpen, setIsRegionDropdownOpen] = useState(false);
  const [rates, setRates] = useState<Record<string, number>>({ USD: 1, GBP: 0.79, CAD: 1.36, ETH: 2650 });
  const [ratesLoading, setRatesLoading] = useState(true);
  const [totalActive, setTotalActive] = useState<number>(0);
  const [totalSold, setTotalSold] = useState<number>(0);

  const fetchRates = useCallback(async () => {
    setRatesLoading(true);
    try {
      const res = await fetch(`${API_BASE}/exchange-rates`);
      if (res.ok) {
        const data = await res.json();
        setRates({ 
          USD: data.USD ?? 1, 
          GBP: data.GBP ?? 0.79, 
          CAD: data.CAD ?? 1.36,
          ETH: data.ETH ?? 2650
        });
      }
    } catch (err) {
      console.error('Error fetching rates:', err);
    } finally { setRatesLoading(false); }
  }, []);

  const fetchStats = useCallback(async () => {
    try {
      const res = await fetch(`${process.env.NEXT_PUBLIC_API_URL || 'http://localhost:4000'}/stats`);
      if (res.ok) {
        const data = await res.json();
        setTotalActive(data.totalActive || 0);
        setTotalSold(data.totalSold || 0);
      }
    } catch (err) {
      console.error('Error fetching stats:', err);
    }
  }, []);

  useEffect(() => { 
    fetchRates(); 
    fetchStats();
  }, [fetchRates, fetchStats]);

  const formatRegionMoney = (fiatPrice: number, currency: string) => {
    const symbol = REGIONS.find(r => r.currency === currency)?.symbol || '$';
    return `${symbol}${fiatPrice.toLocaleString('en', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}`;
  };

  const estimateEth = (fiatPrice: number, currency: string) => {
    const rateToUsd = rates[currency] || 1;
    const priceInUsd = fiatPrice / rateToUsd;
    const ethPriceInUsd = rates.ETH || 2650;
    return priceInUsd / ethPriceInUsd;
  };
  // ────────────────────────────────────────────────────────────────────────

  const filteredCards = useMemo(() => {
    const baseCards = cardsData?.data ?? [];
    return baseCards.filter((card) => {
      const matchesRegion = card.region === selectedRegion.code;
      
      const searchValue = searchQuery.trim().toLowerCase();
      const matchesSearch = !searchValue || 
        (card.retailer?.toLowerCase().includes(searchValue)) ||
        (card.retailerName?.toLowerCase().includes(searchValue));

      return matchesRegion && matchesSearch;
    });
  }, [cardsData, selectedRegion, searchQuery]);

  const sortedCards = useMemo(() => {
    return [...filteredCards].sort((a, b) => {
      if (sortBy === 'price-low') return (a.price ?? 0) - (b.price ?? 0);
      if (sortBy === 'price-high') return (b.price ?? 0) - (a.price ?? 0);
      return new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime();
    });
  }, [filteredCards, sortBy]);

  const openCheckout = (card: GiftCardListing) => {
    if (!isAuthenticated) {
      Swal.fire({
        title: 'Login Required',
        text: 'Please log in to purchase gift cards.',
        icon: 'info',
        confirmButtonText: 'Login',
        showCancelButton: true,
        confirmButtonColor: '#0f172a'
      }).then((result) => {
        if (result.isConfirmed) window.location.href = '/login';
      });
      return;
    }
    setSelectedCard(card);
    setPaymentStep('captcha');
    setCaptchaToken(null);
  };

  const handleCaptchaVerify = (token: string | null) => {
    setCaptchaToken(token);
    if (token) setPaymentStep('idle');
  };

  const handlePayment = async () => {
    if (!selectedCard || !user || !captchaToken) return;

    setPaymentStep('connecting');
    try {
      if (typeof window === 'undefined' || !(window as any).ethereum) {
        throw new Error('MetaMask not detected.');
      }
      const provider = new ethers.BrowserProvider((window as any).ethereum);
      
      // Request chain switch to Sepolia
      try {
        await (window as any).ethereum.request({
          method: 'wallet_switchEthereumChain',
          params: [{ chainId: '0xaa36a7' }], 
        });
      } catch (e) {}

      const accounts = await provider.send("eth_requestAccounts", []);
      const address = accounts[0];
      
      setPaymentStep('paying');
      const intent = await buyerApi.buyCard(user.token, Number(selectedCard.id), address);
      
      if (intent.expires_at) {
        setExpiryTime(new Date(intent.expires_at));
      }

      const signer = await provider.getSigner();
      const tx = await signer.sendTransaction({
        to: intent.pay_to,
        value: ethers.parseEther(String(intent.eth_amount)),
      });

      setTxHash(tx.hash);
      setActivePaymentId(intent.payment_id);
      setPaymentStep('confirming');
      setPolling(true);

    } catch (e: any) {
      console.error('Payment error:', e);
      Swal.fire('Payment Error', e.message || 'Transaction failed', 'error');
      setPaymentStep('idle');
    }
  };

  useEffect(() => {
    let interval: NodeJS.Timeout;
    if (polling && user && activePaymentId) {
      interval = setInterval(async () => {
        try {
          const payments = await buyerApi.getPayments(user.token);
          const current = payments.find(p => p.id === activePaymentId);
          if (current && ['holding', 'completed'].includes(current.status)) {
            setPolling(false);
            setPurchasedCard(current.card || null);
            setPaymentStep('success');
            setExpiryTime(null);
            Swal.fire('Confirmed!', 'Your payment was successful.', 'success');
          }
        } catch (e) {}
      }, 4000);
    }
    return () => clearInterval(interval);
  }, [polling, user, activePaymentId]);

  useEffect(() => {
    let interval: NodeJS.Timeout;
    if (expiryTime) {
      interval = setInterval(() => {
        const now = new Date().getTime();
        const distance = expiryTime.getTime() - now;
        if (distance < 0) {
          clearInterval(interval);
          setTimeLeft('EXPIRED');
          setPaymentStep('idle');
          setExpiryTime(null);
          Swal.fire('Reservation Expired', 'Your 30-minute reservation for this gift card has expired. Please try again — the card has been released back to the marketplace.', 'warning');
        } else {
          const minutes = Math.floor((distance % (1000 * 60 * 60)) / (1000 * 60));
          const seconds = Math.floor((distance % (1000 * 60)) / 1000);
          setTimeLeft(`${minutes}:${seconds < 10 ? '0' : ''}${seconds}`);
        }
      }, 1000);
    }
    return () => clearInterval(interval);
  }, [expiryTime]);

  return (
    <div className="min-h-screen bg-[#f5f1e8] text-slate-900 pb-20 font-sans">
      {/* Hero Section */}
      <div className="pt-10 pb-6 mb-10">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <motion.div 
            initial={{ opacity: 0, y: 30 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6, ease: "easeOut" }}
            className="bg-[#1a1512] rounded-[3.5rem] p-12 md:p-20 text-white relative overflow-hidden"
          >
            {/* Badge */}
            <motion.div 
              initial={{ opacity: 0, scale: 0.95 }}
              animate={{ opacity: 1, scale: 1 }}
              transition={{ duration: 0.5, delay: 0.2 }}
              className="inline-flex items-center gap-4 py-2.5 pl-3 pr-5 rounded-full bg-[#2a2420] border border-white/10 mb-12"
            >
              <svg 
                xmlns="http://www.w3.org/2000/svg" 
                viewBox="40 20 320 200" 
                className="w-24 h-auto shrink-0 drop-shadow-[0_4px_8px_rgba(0,0,0,0.5)]"
              >
                <defs>
                  <linearGradient id="signBgPremium" x1="0%" y1="0%" x2="100%" y2="100%">
                    <stop offset="0%" stopColor="#ffffff" />
                    <stop offset="100%" stopColor="#f3f4f6" />
                  </linearGradient>

                  <linearGradient id="borderGradPremium" x1="0%" y1="0%" x2="0%" y2="100%">
                    <stop offset="0%" stopColor="#374151" />
                    <stop offset="100%" stopColor="#030712" />
                  </linearGradient>
                </defs>

                <g stroke="#d1d5db" strokeWidth="3" fill="none" strokeLinecap="round" strokeLinejoin="round">
                  <circle cx="200" cy="30" r="4" fill="#f9fafb" stroke="none" />
                  <path d="M 200,30 L 105,100 M 200,30 L 295,100" />
                </g>

                <g transform="rotate(-3, 200, 140)">
                  <rect x="50" y="100" width="300" height="110" rx="10" fill="url(#borderGradPremium)" />
                  <rect x="55" y="105" width="290" height="100" rx="7" fill="url(#signBgPremium)" />
                  <circle cx="105" cy="100" r="3" fill="#030712" />
                  <circle cx="295" cy="100" r="3" fill="#030712" />

                  <g transform="translate(66, 121)">
                    <circle cx="28" cy="32" r="23" fill="#f2a900" />
                    <circle cx="28" cy="32" r="19" fill="#ffffff" />
                    <path 
                      d="M 32,21 
                         A 11,11 0 1,0 32,43 
                         M 24,15 L 24,20 
                         M 28,15 L 28,20 
                         M 24,44 L 24,49 
                         M 28,44 L 28,49" 
                      fill="none" 
                      stroke="#f2a900" 
                      strokeWidth="4" 
                      strokeLinecap="round" 
                    />
                  </g>

                  <g fontFamily="system-ui, -apple-system, sans-serif" fontWeight="900">
                    <text x="132" y="152" fontSize="33" fill="#030712" letterSpacing="0.5">CRYPTO</text>
                    <text x="134" y="182" fontSize="14.5" fontWeight="900" fill="#374151" letterSpacing="0.2">ACCEPTED HERE</text>
                  </g>
                </g>
              </svg>

              <span className="text-[11px] font-bold uppercase tracking-wider text-white/90">
                Buy gift cards with crypto
              </span>
            </motion.div>

            {/* Content */}
            <div className="max-w-4xl">
              <motion.h1 
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.6, delay: 0.2, ease: "easeOut" }}
                className="font-serif text-4xl leading-tight sm:text-5xl lg:text-6xl"
              >
                Save money on your next shop by purchasing our <span className="text-blue-500">verified gift cards</span>, with fast delivery times.
              </motion.h1>
              <motion.p 
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.6, delay: 0.3, ease: "easeOut" }}
                className="text-lg text-white/60 max-w-xl font-medium leading-relaxed mb-16"
              >
                Browse our store for great discounts on major retailers using cryptocurrency, no questions asked.
              </motion.p>
            </div>

            {/* Stats Row */}
            <motion.div 
              initial={{ opacity: 0, y: 15 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.5, delay: 0.4 }}
              className="flex flex-wrap gap-4 mt-auto"
            >
              <div className="bg-[#2a2420] rounded-3xl p-6 min-w-[180px] hover:bg-[#352e2a] transition-all group cursor-default">
                <div className="text-[10px] font-bold text-white/30 uppercase tracking-widest mb-4 group-hover:text-brand transition-colors">Total Listings</div>
                <div className="text-4xl font-bold text-white">{totalActive > 0 ? totalActive : (cardsData?.total || 0)}</div>
              </div>
              <div className="bg-[#2a2420] rounded-3xl p-6 min-w-[180px] hover:bg-[#352e2a] transition-all group cursor-default">
                <div className="text-[10px] font-bold text-white/30 uppercase tracking-widest mb-4 group-hover:text-brand transition-colors">Total Sold</div>
                <div className="text-4xl font-bold text-white">{totalSold}</div>
              </div>
              
              <div className="bg-[#2a2420] rounded-3xl p-6 min-w-[240px] cursor-default">
                <div className="text-[10px] font-bold text-white/30 uppercase tracking-widest mb-4">Crypto Rails</div>
                <div className="text-lg font-semibold text-white ">Over 50 crypto<br/>currencies accepted</div>
              </div>
            </motion.div>

            {/* Decorative element */}
            <div className="absolute top-1/2 right-0 -translate-y-1/2 w-64 h-64 bg-brand/5 blur-[100px] pointer-events-none" />
          </motion.div>
        </div>
      </div>

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 -mt-8 relative z-10">
        {/* Region Selector Card */}
        <motion.div 
          initial={{ opacity: 0, y: 15 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5, delay: 0.3 }}
          className="bg-white rounded-[2rem] shadow-2xl shadow-slate-200/50 p-6 border border-slate-100 flex flex-col md:flex-row items-center justify-between gap-6"
        >
          <div className="flex items-center gap-6 w-full md:w-auto">
            <div className="space-y-1.5 w-full md:w-64 relative z-50">
              <label className="text-[10px] font-bold uppercase tracking-widest text-slate-400 px-1">Select Region</label>
              <div className="relative">
                <button 
                  type="button"
                  onClick={() => setIsRegionDropdownOpen(!isRegionDropdownOpen)}
                  className="w-full h-14 bg-slate-50 border border-slate-200 rounded-2xl px-5 pr-10 text-sm font-bold text-slate-900 outline-none flex items-center justify-between transition-all cursor-pointer hover:bg-slate-100/50 focus:border-brand"
                >
                  <div className="flex items-center gap-3">
                    <img 
                      src={selectedRegion.flagUrl} 
                      alt="" 
                      className="w-6 h-4 object-cover rounded-sm shadow-sm animate-fade-in"
                    />
                    <span>{selectedRegion.label}</span>
                  </div>
                  <ChevronDown className={`w-4 h-4 text-slate-400 transition-transform ${isRegionDropdownOpen ? 'rotate-180' : ''}`} />
                </button>

                <AnimatePresence>
                  {isRegionDropdownOpen && (
                    <>
                      <div 
                        className="fixed inset-0 z-40" 
                        onClick={() => setIsRegionDropdownOpen(false)}
                      />
                      <motion.div 
                        initial={{ opacity: 0, y: -10, scale: 0.98 }}
                        animate={{ opacity: 1, y: 0, scale: 1 }}
                        exit={{ opacity: 0, y: -10, scale: 0.98 }}
                        transition={{ duration: 0.2, ease: "easeOut" }}
                        className="absolute left-0 right-0 mt-2 bg-white border border-slate-100 rounded-2xl shadow-xl shadow-slate-200/50 py-2 z-50 overflow-hidden"
                      >
                        {REGIONS.map(r => (
                          <button
                            key={r.code}
                            type="button"
                            onClick={() => {
                              setSelectedRegion(r);
                              setIsRegionDropdownOpen(false);
                            }}
                            className={`w-full px-5 py-3 text-left text-sm font-bold flex items-center gap-3 transition-colors cursor-pointer ${
                              selectedRegion.code === r.code 
                                ? 'bg-slate-50 text-brand' 
                                : 'text-slate-700 hover:bg-slate-50'
                            }`}
                          >
                            <img 
                              src={r.flagUrl} 
                              alt="" 
                              className="w-6 h-4 object-cover rounded-sm shadow-sm"
                            />
                            <span>{r.label}</span>
                          </button>
                        ))}
                      </motion.div>
                    </>
                  )}
                </AnimatePresence>
              </div>
            </div>

            <div className="hidden lg:flex flex-col gap-1">
              <div className="text-[10px] font-bold uppercase tracking-widest text-slate-400">Live Rates</div>
              <div className="flex items-center gap-2 text-sm font-bold text-emerald-600 bg-emerald-50 px-3 py-1.5 rounded-xl border border-emerald-100">
                <span className="w-2 h-2 bg-emerald-500 rounded-full animate-pulse" />
                1 USD = {selectedRegion.symbol}{(rates[selectedRegion.rateKey] || 1).toFixed(3)}
              </div>
            </div>
          </div>

          <div className="flex-1 w-full relative">
            <Search className="absolute left-5 top-1/2 -translate-y-1/2 w-5 h-5 text-slate-400" />
            <input 
              type="text" 
              placeholder={`Search ${selectedRegion.label} Retailers...`}
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="w-full h-14 bg-slate-50 border border-slate-200 rounded-2xl pl-12 pr-5 text-sm font-bold outline-none focus:border-brand transition-all"
            />
          </div>
        </motion.div>

        {/* Warning Banner */}
        <motion.div 
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.4, delay: 0.35 }}
          className="mt-6 flex items-center gap-4 bg-red-50 border-2 border-red-100 p-4 rounded-2xl text-red-700"
        >
          <AlertTriangle className="w-6 h-6 shrink-0" />
          <p className="font-bold tracking-tight text-sm uppercase">{selectedRegion.warning}</p>
        </motion.div>

        {/* Grid */}
        <div id="listings-grid" className="mt-12">
          <div className="flex items-center justify-between mb-8">
            <div>
              <h2 className="text-3xl font-bold text-slate-900 tracking-tight">Available Retailers</h2>
              <p className="text-slate-500 font-medium">Verified gift cards for {selectedRegion.label}</p>
            </div>
            
            <div className="flex items-center gap-3">
              <span className="text-xs font-bold text-slate-400 uppercase tracking-widest">Sort by</span>
              <select 
                value={sortBy}
                onChange={(e) => setSortBy(e.target.value)}
                className="bg-white border border-slate-200 rounded-xl px-4 py-2 text-xs font-bold text-slate-700 outline-none focus:border-brand cursor-pointer"
              >
                <option value="featured">Newest first</option>
                <option value="price-low">Price: Low to High</option>
                <option value="price-high">Price: High to Low</option>
              </select>
            </div>
          </div>

          {isLoading ? (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
              {[1, 2, 3, 4, 5, 6].map(i => <div key={i} className="h-80 bg-slate-100 rounded-[2.5rem] animate-pulse" />)}
            </div>
          ) : sortedCards.length > 0 ? (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
              {sortedCards.map((card, idx) => {
                const theme = getRetailerTheme(card.retailer || '');
                return (
                  <motion.div 
                    key={card.id} 
                    initial={{ opacity: 0, y: 25 }}
                    whileInView={{ opacity: 1, y: 0 }}
                    viewport={{ once: true, margin: "-50px" }}
                    transition={{ duration: 0.5, delay: Math.min(idx * 0.06, 0.3), ease: "easeOut" }}
                    className="group relative flex flex-col bg-white rounded-[2.5rem] border border-slate-100 shadow-xl shadow-slate-200/40 hover:shadow-2xl hover:shadow-slate-300/50 hover:-translate-y-1.5 transition-all cursor-default overflow-hidden"
                  >
                    {/* Card Top */}
                    <div className={`relative h-56 bg-gradient-to-br ${theme.brand} p-8 flex flex-col justify-between text-white overflow-hidden`}>
                      <div className={`absolute inset-0 ${theme.texture}`} />
                      <div className="relative flex justify-between items-start">
                        <div className="px-3 py-1.5 rounded-full bg-white/10 border border-white/20 text-[10px] font-bold uppercase tracking-[0.2em] backdrop-blur-md">
                          {theme.eyebrow}
                        </div>
                        <div className="w-12 h-12 rounded-2xl bg-white/10 border border-white/20 backdrop-blur-md flex items-center justify-center font-bold text-xl uppercase">
                          {theme.icon}
                        </div>
                      </div>
                      
                      <div className="relative">
                        <div className="text-xs font-bold text-white/60 uppercase tracking-widest mb-1">Gift Card Value</div>
                        <div className="text-4xl font-bold tracking-tight">{formatRegionMoney(card.seller_asking_price || card.price || 0, card.currency || 'USD')}</div>
                      </div>
                    </div>

                    {/* Card Bottom */}
                    <div className="p-8 space-y-6">
                      <div className="flex items-center justify-between">
                        <div>
                          <h3 className="text-2xl font-bold text-slate-900 tracking-tight">{card.retailer}</h3>
                          <div className="flex items-center gap-1.5 mt-1">
                            <ShieldCheck className="w-4 h-4 text-emerald-500" />
                            <span className="text-xs font-bold text-slate-400 uppercase tracking-widest">Verified Seller</span>
                          </div>
                        </div>
                        <div className="text-right">
                          <div className="text-[10px] font-bold text-slate-400 uppercase tracking-widest mb-1">You Pay</div>
                          <div className="text-xl font-bold text-brand">{formatRegionMoney(card.price || 0, card.currency || 'USD')}</div>
                        </div>
                      </div>

                      <div className="grid grid-cols-2 gap-3">
                        <div className="bg-slate-50 p-4 rounded-2xl border border-slate-100">
                          <div className="text-[10px] font-bold text-slate-400 uppercase tracking-widest mb-1">Region</div>
                          <div className="flex items-center gap-2 mt-0.5">
                            <img 
                              src={selectedRegion.flagUrl} 
                              alt="" 
                              className="w-5 h-3.5 object-cover rounded-sm shadow-sm"
                            />
                            <span className="text-sm font-bold text-slate-700">{selectedRegion.code}</span>
                          </div>
                        </div>
                        <div className="bg-slate-50 p-4 rounded-2xl border border-slate-100">
                          <div className="text-[10px] font-bold text-slate-400 uppercase tracking-widest mb-1">Delivery</div>
                          <div className="text-sm font-bold text-slate-700">Instant</div>
                        </div>
                      </div>

                      <button 
                        onClick={() => openCheckout(card)}
                        className="w-full cursor-pointer h-14 bg-slate-900 hover:bg-slate-800 text-white rounded-2xl font-bold uppercase tracking-widest text-sm flex items-center justify-center gap-3 transition-all active:scale-95 shadow-xl shadow-slate-900/20"
                      >
                        Buy with Crypto <ArrowRight className="w-4 h-4" />
                      </button>
                    </div>
                  </motion.div>
                );
              })}
            </div>
          ) : (
            <div className="text-center py-20 bg-white rounded-[3rem] border border-slate-100 shadow-sm">
              <Tag className="w-16 h-16 text-slate-200 mx-auto mb-6" />
              <h3 className="text-2xl font-bold text-slate-900 mb-2">No cards available</h3>
              <p className="text-slate-400 font-medium">Try changing the region or search term.</p>
            </div>
          )}
        </div>
      </div>

      {/* Checkout Modal */}
      <AnimatePresence>
        {selectedCard && (
          <div className="fixed inset-0 z-[100] flex items-center justify-center p-4 sm:p-6">
            <motion.div 
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              transition={{ duration: 0.25 }}
              className="absolute inset-0 bg-slate-950/80 backdrop-blur-sm" 
              onClick={() => setSelectedCard(null)} 
            />
            <motion.div 
              initial={{ opacity: 0, y: 30, scale: 0.98 }}
              animate={{ opacity: 1, y: 0, scale: 1 }}
              exit={{ opacity: 0, y: 30, scale: 0.98 }}
              transition={{ duration: 0.35, ease: "easeOut" }}
              className="relative w-full max-w-4xl bg-white rounded-[3rem] shadow-2xl overflow-hidden z-10"
            >
              <button 
                onClick={() => setSelectedCard(null)} 
                className="absolute right-6 top-6 z-10 w-10 h-10 rounded-full bg-white/10 hover:bg-white/20 backdrop-blur-md flex items-center justify-center text-white lg:text-slate-900 lg:bg-slate-100 transition-all cursor-pointer"
              >
                <X className="w-5 h-5" />
              </button>

              <div className="grid lg:grid-cols-[0.8fr_1.2fr]">
                {/* Modal Side */}
                <div className={`relative p-10 flex flex-col justify-between text-white bg-gradient-to-br ${getRetailerTheme(selectedCard.retailer || '').brand}`}>
                  <div className={`absolute inset-0 ${getRetailerTheme(selectedCard.retailer || '').texture}`} />
                  <div className="relative">
                    <div className="inline-flex items-center gap-2 px-3 py-1.5 rounded-full bg-white/10 border border-white/20 text-[10px] font-bold uppercase tracking-widest mb-8">
                      <ShieldCheck className="w-3 h-3 text-emerald-400" /> Secure Checkout
                    </div>
                    <h2 className="text-5xl font-bold tracking-tight mb-4">{selectedCard.retailer}</h2>
                    <p className="text-white/60 font-medium leading-relaxed">Verified gift card for {selectedCard.region}. Instant revelation after confirmation.</p>
                  </div>

                  <div className="relative space-y-8">
                    <div className="bg-white/10 border border-white/10 rounded-3xl p-6 backdrop-blur-md">
                      <div className="text-[10px] font-bold text-white/40 uppercase tracking-widest mb-4">Order Summary</div>
                      <div className="space-y-4">
                        <div className="flex justify-between items-end">
                          <span className="text-sm font-bold text-white/60">Gift Card Value</span>
                          <span className="text-2xl font-bold">{formatRegionMoney(selectedCard.seller_asking_price || selectedCard.price || 0, selectedCard.currency || 'USD')}</span>
                        </div>
                        <div className="flex justify-between items-end border-t border-white/10 pt-4">
                          <span className="text-sm font-bold text-white/60">You Pay (ETH)</span>
                          <span className="text-2xl font-bold text-emerald-400">≈ {estimateEth(selectedCard.price || 0, selectedCard.currency || 'USD').toFixed(6)} ETH</span>
                        </div>
                      </div>
                    </div>

                    {expiryTime && (
                      <div className="bg-cta/20 border border-cta/30 rounded-3xl p-6 backdrop-blur-md animate-pulse">
                        <div className="text-[10px] font-bold text-cta uppercase tracking-widest mb-1">Reservation Locked</div>
                        <div className="flex items-center justify-between">
                          <div className="text-3xl font-bold text-white">{timeLeft}</div>
                          <div className="text-[10px] font-bold text-white/60 uppercase text-right">This card is<br/>reserved for you</div>
                        </div>
                      </div>
                    )}
                  </div>
                </div>

                {/* Modal Content */}
                <div className="p-10">
                  {paymentStep === 'captcha' && (
                    <div className="h-full flex flex-col justify-center text-center">
                      <Lock className="w-16 h-16 text-slate-100 mx-auto mb-6" />
                      <h3 className="text-3xl font-bold text-slate-900 mb-2">Bot Protection</h3>
                      <p className="text-slate-500 font-medium mb-8">Please complete the captcha to proceed with your order.</p>
                      <RecaptchaField onVerify={handleCaptchaVerify} />
                    </div>
                  )}

                  {paymentStep === 'idle' && (
                    <div className="space-y-8">
                      <div>
                        <h3 className="text-3xl font-bold text-slate-900 mb-2">Payment Details</h3>
                        <p className="text-slate-500 font-medium">Complete payment via MetaMask to reveal code.</p>
                      </div>

                      <div className="space-y-4">
                        <div className="p-6 rounded-[2rem] bg-slate-50 border border-slate-100 flex items-center justify-between">
                          <div className="flex items-center gap-4">
                            <div className="w-12 h-12 bg-blue-600 rounded-2xl flex items-center justify-center text-white">
                              <Bitcoin className="w-6 h-6" />
                            </div>
                            <div>
                              <div className="font-bold text-slate-900">Ethereum</div>
                              <div className="text-xs font-bold text-slate-400 uppercase tracking-widest">Sepolia Network</div>
                            </div>
                          </div>
                          <div className="text-right">
                            <div className="text-[10px] font-bold text-slate-400 uppercase tracking-widest">ETA</div>
                            <div className="font-bold text-slate-700">~30s</div>
                          </div>
                        </div>

                        <div className="bg-[#fcfaf7] border border-slate-200 rounded-[2rem] p-6 space-y-4">
                          <div className="flex justify-between items-center text-sm font-bold">
                            <span className="text-slate-400 uppercase tracking-widest">Total ETH</span>
                            <span className="text-slate-900">{estimateEth(selectedCard.price || 0, selectedCard.currency || 'USD').toFixed(6)} ETH</span>
                          </div>
                          <div className="flex justify-between items-center text-sm font-bold">
                            <span className="text-slate-400 uppercase tracking-widest">Network Fee</span>
                            <span className="text-emerald-600">Included</span>
                          </div>
                        </div>
                      </div>

                      <button 
                        onClick={handlePayment}
                        className="w-full h-16 bg-brand hover:bg-brand/90 text-white rounded-2xl font-bold uppercase tracking-widest flex items-center justify-center gap-3 transition-all shadow-xl shadow-brand/20 cursor-pointer"
                      >
                        Pay with MetaMask <Wallet className="w-5 h-5" />
                      </button>
                    </div>
                  )}

                  {['connecting', 'paying', 'confirming'].includes(paymentStep) && (
                    <div className="h-full flex flex-col items-center justify-center text-center space-y-6">
                      <div className="relative">
                        <div className="w-24 h-24 border-4 border-slate-100 border-t-brand rounded-full animate-spin" />
                        <div className="absolute inset-0 flex items-center justify-center">
                          <Loader2 className="w-8 h-8 text-brand animate-pulse" />
                        </div>
                      </div>
                      <div>
                        <h3 className="text-3xl font-bold text-slate-900 mb-2">
                          {paymentStep === 'connecting' && 'Connecting...'}
                          {paymentStep === 'paying' && 'Confirm Payment'}
                          {paymentStep === 'confirming' && 'Processing...'}
                        </h3>
                        <p className="text-slate-500 font-medium max-w-xs mx-auto">
                          {paymentStep === 'confirming' ? 'Waiting for blockchain confirmation...' : 'Please follow instructions in MetaMask.'}
                        </p>
                      </div>
                    </div>
                  )}

                  {paymentStep === 'success' && (
                    <div className="space-y-8 animate-in slide-in-from-bottom-4 duration-500">
                      <div className="text-center">
                        <div className="w-20 h-20 bg-emerald-50 rounded-full flex items-center justify-center mx-auto mb-6">
                          <CheckCircle2 className="w-10 h-10 text-emerald-500" />
                        </div>
                        <h3 className="text-3xl font-bold text-slate-900 mb-2">Code Unlocked!</h3>
                        <p className="text-slate-500 font-medium">Your payment has been verified on the blockchain.</p>
                      </div>

                      <div className="bg-slate-50 border border-slate-100 rounded-[2rem] p-8 space-y-6">
                        <div className="space-y-2">
                          <div className="text-[10px] font-bold text-slate-400 uppercase tracking-widest">Card Code</div>
                          <div className="flex items-center gap-3">
                            <div className="flex-1 h-14 bg-white border border-slate-200 rounded-xl px-5 flex items-center font-mono text-xl font-bold tracking-widest text-slate-900">
                              {purchasedCard?.card_code || '•••• •••• •••• ••••'}
                            </div>
                            <button 
                              onClick={() => {
                                navigator.clipboard.writeText(purchasedCard?.card_code || '');
                                setCodeCopied(true);
                                setTimeout(() => setCodeCopied(false), 2000);
                              }}
                              className="h-14 px-5 bg-white border border-slate-200 rounded-xl hover:bg-slate-50 transition-all cursor-pointer"
                            >
                              <Copy className={`w-5 h-5 ${codeCopied ? 'text-emerald-500' : 'text-slate-400'}`} />
                            </button>
                          </div>
                        </div>

                        {purchasedCard?.card_pin && (
                          <div className="space-y-2">
                            <div className="text-[10px] font-bold text-slate-400 uppercase tracking-widest">Security PIN</div>
                            <div className="flex items-center gap-3">
                              <div className="flex-1 h-14 bg-white border border-slate-200 rounded-xl px-5 flex items-center font-mono text-xl font-bold tracking-widest text-slate-900">
                                {purchasedCard.card_pin}
                              </div>
                              <button 
                                onClick={() => {
                                  navigator.clipboard.writeText(purchasedCard.card_pin || '');
                                  setPinCopied(true);
                                  setTimeout(() => setPinCopied(false), 2000);
                                }}
                                className="h-14 px-5 bg-white border border-slate-200 rounded-xl hover:bg-slate-50 transition-all cursor-pointer"
                              >
                                <Copy className={`w-5 h-5 ${pinCopied ? 'text-emerald-500' : 'text-slate-400'}`} />
                              </button>
                            </div>
                          </div>
                        )}
                      </div>

                      <button 
                        onClick={() => setSelectedCard(null)}
                        className="w-full h-16 bg-slate-900 hover:bg-slate-800 text-white rounded-2xl font-bold uppercase tracking-widest transition-all cursor-pointer"
                      >
                        Close Order
                      </button>
                    </div>
                  )}
                </div>
              </div>
            </motion.div>
          </div>
        )}
      </AnimatePresence>

      <section className="max-w-7xl mx-auto mt-10 rounded-[28px] bg-[#f59f0b] px-6 py-6 text-slate-950 shadow-[0_18px_40px_rgba(245,159,11,0.25)] sm:px-8">
        <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
          <div className="flex items-start gap-4">
            <div className="rounded-2xl bg-white/60 p-3">
              <Tag className="h-5 w-5" />
            </div>
            <div>
              <h3 className="text-xl font-semibold">Sell your gift cards for crypto</h3>
              <p className="mt-1 max-w-2xl text-sm text-slate-800">
                Ready to cash out? List your cards and receive crypto payments directly to your wallet.
              </p>
            </div>
          </div>
          <Link href={"/seller"}>
            <button className="cursor-pointer inline-flex h-12 items-center justify-center rounded-2xl bg-slate-950 px-5 text-sm font-semibold text-white transition hover:bg-slate-800">
              List a card
            </button>
          </Link>
        </div>
      </section>
    </div>
  );
}
