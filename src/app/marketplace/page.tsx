'use client';

import { useEffect, useState, useCallback } from 'react';
import { useBrowseCards } from '@/features/marketplace/hooks/useMarketplace';
import type { GiftCardListing } from '@/types';
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
  Sparkles ,
  Search ,
  Tag ,
  ShieldCheck 
} from 'lucide-react';
import { ethers } from 'ethers';
import Swal from 'sweetalert2';
import { useAuth } from '@/features/auth/hooks/useAuth';
import { buyerApi, type CardRecord } from '@/services/dashboardApi';

const REGIONS = [
  { code: 'USA', flag: '🇺🇸', label: 'USD', currency: 'USD', rateKey: 'USD', symbol: '$' },
  { code: 'UK',  flag: '🇬🇧', label: 'GBP', currency: 'GBP', rateKey: 'GBP', symbol: '£' },
  { code: 'CA',  flag: '🇨🇦', label: 'CAD', currency: 'CAD', rateKey: 'CAD', symbol: 'C$' },
];

const API_BASE = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:4000';

type PaymentStep = 'idle' | 'connecting' | 'paying' | 'confirming' | 'success';

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
  // {
  //   id: 'usdt-trc20',
  //   symbol: 'USDT',
  //   accent: '#26A17B',
  //   label: 'Tether',
  //   network: 'TRC20',
  //   rate: 1,
  //   wallet: 'TLt4t4VxKkY1demo7vF3n4m1kcrypto9',
  //   eta: '1 to 2 min',
  // },
  // {
  //   id: 'btc',
  //   symbol: 'BTC',
  //   accent: '#F7931A',
  //   label: 'Bitcoin',
  //   network: 'Bitcoin',
  //   rate: 64250,
  //   wallet: 'bc1qdemo5uq6r4j9u6x8f4lqytw0mockpay77',
  //   eta: '8 to 15 min',
  // },
  // {
  //   id: 'eth',
  //   symbol: 'ETH',
  //   accent: '#627EEA',
  //   label: 'Ethereum',
  //   network: 'ERC20',
  //   rate: 3180,
  //   wallet: '0xAbC1D3f0DemoWallet44D8f73c4b8674A3e2',
  //   eta: '2 to 5 min',
  // },
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
    halo: 'shadow-[0_24px_50px_rgba(19,25,33,0.35)]',
    icon: 'a',
  },
  steam: {
    brand: 'from-[#091a2c] via-[#0f3b67] to-[#1b73ba]',
    eyebrow: 'Gaming wallet',
    texture: 'bg-[radial-gradient(circle_at_top_right,_rgba(255,255,255,0.18),_transparent_35%)]',
    halo: 'shadow-[0_24px_50px_rgba(11,42,77,0.35)]',
    icon: 's',
  },
  netflix: {
    brand: 'from-[#150909] via-[#5b0909] to-[#e50914]',
    eyebrow: 'Streaming picks',
    texture: 'bg-[radial-gradient(circle_at_top_right,_rgba(255,255,255,0.16),_transparent_40%)]',
    halo: 'shadow-[0_24px_50px_rgba(112,10,14,0.35)]',
    icon: 'n',
  },
  'google-play': {
    brand: 'from-[#0f172a] via-[#123f87] to-[#34a853]',
    eyebrow: 'Apps and media',
    texture: 'bg-[radial-gradient(circle_at_top_right,_rgba(251,188,5,0.3),_transparent_35%)]',
    halo: 'shadow-[0_24px_50px_rgba(22,101,52,0.25)]',
    icon: 'g',
  },
  'apple-itunes': {
    brand: 'from-[#111827] via-[#374151] to-[#9ca3af]',
    eyebrow: 'Apple balance',
    texture: 'bg-[radial-gradient(circle_at_top_right,_rgba(255,255,255,0.22),_transparent_35%)]',
    halo: 'shadow-[0_24px_50px_rgba(75,85,99,0.28)]',
    icon: 'a',
  },
  playstation: {
    brand: 'from-[#002f6c] via-[#0057d8] to-[#1d9bf0]',
    eyebrow: 'Console wallet',
    texture: 'bg-[radial-gradient(circle_at_top_right,_rgba(255,255,255,0.24),_transparent_35%)]',
    halo: 'shadow-[0_24px_50px_rgba(0,87,216,0.3)]',
    icon: 'p',
  },
  xbox: {
    brand: 'from-[#0b2b1a] via-[#107c10] to-[#7fba00]',
    eyebrow: 'Game access',
    texture: 'bg-[radial-gradient(circle_at_top_right,_rgba(255,255,255,0.24),_transparent_35%)]',
    halo: 'shadow-[0_24px_50px_rgba(16,124,16,0.28)]',
    icon: 'x',
  },
  spotify: {
    brand: 'from-[#07120d] via-[#0d4028] to-[#1ed760]',
    eyebrow: 'Music pass',
    texture: 'bg-[radial-gradient(circle_at_top_right,_rgba(255,255,255,0.2),_transparent_35%)]',
    halo: 'shadow-[0_24px_50px_rgba(30,215,96,0.2)]',
    icon: 's',
  },
  walmart: {
    brand: 'from-[#0a1830] via-[#0053e2] to-[#ffc220]',
    eyebrow: 'Household savings',
    texture: 'bg-[radial-gradient(circle_at_top_right,_rgba(255,255,255,0.22),_transparent_35%)]',
    halo: 'shadow-[0_24px_50px_rgba(0,83,226,0.24)]',
    icon: 'w',
  },
  target: {
    brand: 'from-[#ffffff] via-[#fff5f5] to-[#cc0000]',
    eyebrow: 'Retail favorite',
    texture: 'bg-[radial-gradient(circle_at_top_right,_rgba(255,255,255,0.22),_transparent_35%)]',
    halo: 'shadow-[0_24px_50px_rgba(204,0,0,0.18)]',
    icon: 't',
  },
  'uber-eats': {
    brand: 'from-[#111827] via-[#0f5f57] to-[#06c167]',
    eyebrow: 'Food delivery',
    texture: 'bg-[radial-gradient(circle_at_top_right,_rgba(255,255,255,0.2),_transparent_35%)]',
    halo: 'shadow-[0_24px_50px_rgba(6,193,103,0.24)]',
    icon: 'u',
  },
  'disney-plus': {
    brand: 'from-[#06111d] via-[#0e2b60] to-[#113ccf]',
    eyebrow: 'Family streaming',
    texture: 'bg-[radial-gradient(circle_at_top_right,_rgba(255,255,255,0.2),_transparent_35%)]',
    halo: 'shadow-[0_24px_50px_rgba(17,60,207,0.24)]',
    icon: 'd',
  },
};

const defaultTheme = {
  brand: 'from-[#0f172a] via-[#1e293b] to-[#334155]',
  eyebrow: 'Digital delivery',
  texture: 'bg-[radial-gradient(circle_at_top_right,_rgba(255,255,255,0.18),_transparent_35%)]',
  halo: 'shadow-[0_24px_50px_rgba(15,23,42,0.28)]',
  icon: 'g',
};

function getRetailerTheme(retailerId: string) {
  return retailerThemes[retailerId] ?? defaultTheme;
}

function formatMoney(value: number) {
  return new Intl.NumberFormat('en-US', {
    style: 'currency',
    currency: 'USD',
    maximumFractionDigits: value % 1 === 0 ? 0 : 2,
  }).format(value);
}

function makeGiftCode(card: GiftCardListing) {
  const seed = card.retailerId.replace(/[^a-z]/gi, '').toUpperCase().slice(0, 4);
  return `${seed}-${card.id.slice(-3).toUpperCase()}${Math.round(card.sellingPrice)}-X9Q2`;
}

export default function MarketplacePage() {
  const [filters, setFilters] = useState({ page: 1, limit: 24 });
  const [searchQuery, setSearchQuery] = useState('');
  const [category, setCategory] = useState('All');
  const [sortBy, setSortBy] = useState('featured');
  const [selectedCard, setSelectedCard] = useState<GiftCardListing | null>(null);
  const [paymentStep, setPaymentStep] = useState<PaymentStep>('idle');
  const [selectedCrypto, setSelectedCrypto] = useState<CryptoMethod>(cryptoMethods[0]);
  const [copiedWallet, setCopiedWallet] = useState(false);
  const { user } = useAuth();
  const { data: cardsData, isLoading } = useBrowseCards(filters);
  const [txHash, setTxHash] = useState<string | null>(null);
  const [activePaymentId, setActivePaymentId] = useState<number | null>(null);
  const [polling, setPolling] = useState(false);
  const [walletAddress, setWalletAddress] = useState<string | null>(null);
  const [purchasedCard, setPurchasedCard] = useState<CardRecord | null>(null);
  const [codeCopied, setCodeCopied] = useState(false);
  const [pinCopied, setPinCopied] = useState(false);

  // ── Live exchange rate region switcher ───────────────────────────────────
  const [selectedRegion, setSelectedRegion] = useState(REGIONS[0]);
  const [rates, setRates] = useState<Record<string, number>>({ USD: 1, GBP: 0.79, CAD: 1.36, ETH: 2650 });
  const [ratesSource, setRatesSource] = useState<'default' | 'live'>('default');
  const [ratesLoading, setRatesLoading] = useState(true);

  const fetchRates = useCallback(async () => {
    setRatesLoading(true);
    try {
      const res = await fetch(`${API_BASE}/exchange-rates`);
      if (res.ok) {
        const data = await res.json();
        console.log('[Marketplace] Exchange rates fetched successfully:', data);
        setRates({ 
          USD: data.USD ?? 1, 
          GBP: data.GBP ?? 0.79, 
          CAD: data.CAD ?? 1.36,
          ETH: data.ETH ?? 2650
        });
        setRatesSource('live');
      } else {
        console.warn('[Marketplace] Failed to fetch exchange rates, using defaults.');
        setRatesSource('default');
      }
    } catch (err) {
      console.error('[Marketplace] Error fetching exchange rates:', err);
      setRatesSource('default');
      /* keep defaults */ 
    }
    finally { setRatesLoading(false); }
  }, []);

  useEffect(() => { fetchRates(); }, [fetchRates]);

  // Convert a USD price to the selected region's currency
  const convertPrice = (usdPrice: number) => {
    const rate = rates[selectedRegion.rateKey] ?? 1;
    return usdPrice * rate;
  };

  const formatRegionMoney = (usdPrice: number) => {
    const converted = convertPrice(usdPrice);
    return `${selectedRegion.symbol}${converted.toLocaleString('en', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}`;
  };

  const estimateEth = (fiatPrice: number) => {
    // We assume sellingPrice is in USD for now, but we should handle the card's specific currency
    const ethPriceInUsd = rates.ETH || 2650;
    return fiatPrice / ethPriceInUsd;
  };
  // ────────────────────────────────────────────────────────────────────────

  const cards = (cardsData?.data ?? []).filter((card) => {
    const searchValue = searchQuery.trim().toLowerCase();
    const matchesSearch =
      !searchValue ||
      card.retailerName.toLowerCase().includes(searchValue) ||
      card.description?.toLowerCase().includes(searchValue);

    const matchesCategory = category === 'All' || card.retailerId === category;
    return matchesSearch && matchesCategory;
  });

  const sortedCards = [...cards].sort((a, b) => {
    if (sortBy === 'price-low') return a.sellingPrice - b.sellingPrice;
    if (sortBy === 'price-high') return b.sellingPrice - a.sellingPrice;
    return new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime();

    return new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime();
  });

  useEffect(() => {
    if (!copiedWallet) {
      return;
    }

    const timer = window.setTimeout(() => setCopiedWallet(false), 1400);
    return () => window.clearTimeout(timer);
  }, [copiedWallet]);

  const categories = [
    { id: 'All', label: 'All cards' },
    { id: 'amazon', label: 'Amazon' },
    { id: 'steam', label: 'Steam' },
    { id: 'apple-itunes', label: 'Apple' },
    { id: 'netflix', label: 'Netflix' },
    { id: 'walmart', label: 'Walmart' },
  ];

  const featuredStats = [
    { label: 'Live listings', value: cardsData?.total ?? 0 },
    { label: 'Average savings', value: '11.8%' },
    { label: 'Crypto rails', value: 'BTC / ETH / USDT' },
  ];

  const openCheckout = (card: GiftCardListing) => {
    setSelectedCard(card);
    setPaymentStep('idle');
    setSelectedCrypto(cryptoMethods[0]);
    setCopiedWallet(false);
  };

  const closeCheckout = () => {
    setSelectedCard(null);
    setPaymentStep('idle');
  };

  const connectWallet = async () => {
    if (typeof window === 'undefined' || !(window as any).ethereum) {
      throw new Error('MetaMask not detected. Please install the MetaMask extension.');
    }
    const provider = new ethers.BrowserProvider((window as any).ethereum);
    
    try {
      await (window as any).ethereum.request({
        method: 'wallet_switchEthereumChain',
        params: [{ chainId: '0xaa36a7' }], 
      });
    } catch (switchError: any) {
      if (switchError.code === 4902) {
        await (window as any).ethereum.request({
          method: 'wallet_addEthereumChain',
          params: [{
            chainId: '0xaa36a7',
            chainName: 'Sepolia Test Network',
            nativeCurrency: { name: 'SepoliaETH', symbol: 'ETH', decimals: 18 },
            rpcUrls: ['https://rpc.sepolia.org'],
            blockExplorerUrls: ['https://sepolia.etherscan.io'],
          }],
        });
      } else {
        throw switchError;
      }
    }

    const accounts = await provider.send("eth_requestAccounts", []);
    setWalletAddress(accounts[0]);
    return { provider, address: accounts[0] };
  };

  const handleRealPayment = async () => {
    if (!selectedCard || !user) {
      Swal.fire('Auth Required', 'Please log in to complete your purchase.', 'warning');
      return;
    }
    
    if (selectedCrypto.id !== 'eth-sepolia') {
      Swal.fire('Demo Mode', 'For this demo, only real MetaMask payments are enabled for ETH (Sepolia).', 'info');
      return;
    }

    setPaymentStep('connecting');
    try {
      const { provider, address } = await connectWallet();
      
      setPaymentStep('paying');
      // Step 1: POST /buy
      const intent = await buyerApi.buyCard(user.token, Number(selectedCard.id), address);
      
      const intentAmount = intent?.amount ?? intent?.eth_amount;

      // Validate intent response
      if (!intent || !intent.payment_id || !intentAmount || !intent.pay_to) {
        throw new Error('Invalid payment intent: missing required fields (payment_id, amount, or pay_to)');
      }
      
      setActivePaymentId(intent.payment_id);

      // Step 2: MetaMask Transaction
      const signer = await provider.getSigner();
      const amountStr = String(intentAmount);
      
      if (!amountStr || amountStr === 'undefined' || amountStr === 'null') {
        throw new Error('Invalid payment amount received from server');
      }
      
      const tx = await signer.sendTransaction({
        to: intent.pay_to,
        value: ethers.parseEther(amountStr),
      });

      setTxHash(tx.hash);
      setPaymentStep('confirming');

      // Step 3: Start Polling
      setPolling(true);

    } catch (e: any) {
      console.error('Payment error:', e);
      let msg = e.message || 'Something went wrong';
      if (e.code === 'ACTION_REJECTED') msg = 'Transaction rejected in MetaMask.';
      if (msg.includes('undefined') || msg.includes('null')) {
        msg = 'Payment server error: incomplete payment data. Please try again.';
      }
      
      Swal.fire({
        title: 'Payment Error',
        text: msg,
        icon: 'error',
        background: '#16110c',
        color: '#fff',
        confirmButtonColor: '#f59f0b'
      });
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
            Swal.fire({
              title: 'Success!',
              text: 'Blockchain payment confirmed. Your gift card is ready.',
              icon: 'success',
              background: '#16110c',
              color: '#fff'
            });
          }
        } catch (e) {
          console.error('Polling error:', e);
        }
      }, 3500);
    }
    return () => clearInterval(interval);
  }, [polling, user, activePaymentId]);

  const copyWalletAddress = async () => {
    if (!navigator?.clipboard) {
      return;
    }

    await navigator.clipboard.writeText(selectedCrypto.wallet);
    setCopiedWallet(true);
  };

  const currentEthRate = rates['ETH'] || 2650;
  const paymentAmount = selectedCard ? selectedCard.sellingPrice / currentEthRate : 0;

  return (
    <div className="min-h-screen bg-[#f6f1e8] text-slate-950">
      <div className="mx-auto max-w-7xl px-4 py-8 sm:px-6 lg:px-8">
        <section className="overflow-hidden rounded-[32px] bg-[#16110c] text-white shadow-[0_30px_80px_rgba(15,10,8,0.18)]">
          <div className="grid gap-10 px-6 py-8 sm:px-8 lg:grid-cols-[1.2fr_0.8fr] lg:px-12 lg:py-12">
            <div className="space-y-8">
              <div className="inline-flex items-center gap-2 rounded-full border border-white/20 bg-white/10 px-4 py-2 text-xs font-semibold uppercase tracking-[0.28em] text-white/80">
                <Sparkles className="h-4 w-4 text-[#f6a623]" />
                Gift cards with crypto checkout
              </div>

              <div className="max-w-2xl space-y-4">
                <h1 className="font-serif text-4xl leading-tight sm:text-5xl lg:text-6xl">
                  Explore authentic-style gift card deals with a simulated crypto checkout experience.
                </h1>
                <p className="max-w-xl text-base leading-7 text-white/80 sm:text-lg">
                  Browse branded cards inspired by Amazon, Steam, and Apple, then complete a wallet-style payment flow that mimics real crypto transactions and instantly reveals a demo redemption code.
                </p>
              </div>

              <div className="grid gap-3 sm:grid-cols-3">
                {featuredStats.map((stat) => (
                  <div key={stat.label} className="rounded-2xl border border-white/15 bg-white/10 px-4 py-4 backdrop-blur">
                    <div className="text-xs uppercase tracking-[0.22em] text-white/60">{stat.label}</div>
                    <div className="mt-2 text-xl font-semibold text-white">{stat.value}</div>
                  </div>
                ))}
              </div>
            </div>

            <div className="grid gap-4">
              {sortedCards.slice(0, 2).map((card) => {
                const theme = getRetailerTheme(card.retailerId);

                return (
                  <div
                    key={card.id}
                    className={`relative overflow-hidden rounded-[28px] bg-gradient-to-br ${theme.brand} p-6 text-white ${theme.halo}`}
                  >
                    <div className={`absolute inset-0 ${theme.texture}`} />
                    <div className="absolute inset-0 bg-[linear-gradient(135deg,rgba(255,255,255,0.16),transparent_38%,rgba(255,255,255,0.08)_80%,transparent)]" />
                    <div className="relative flex h-full min-h-[188px] flex-col justify-between">
                      <div className="flex items-start justify-between">
                        <div>
                          <div className="text-[11px] uppercase tracking-[0.28em] text-white/70">{theme.eyebrow}</div>
                          <div className="mt-3 text-2xl font-semibold">{card.retailerName}</div>
                        </div>
                      </div>

                      <div className="flex items-end justify-between">
                        <div>
                          <div className="text-xs uppercase tracking-[0.22em] text-white/70">Price </div>
                          <div className="mt-1 text-4xl font-semibold">{card.sellingPrice} </div>
                        </div>
                        <div className="rounded-full border border-white/20 bg-black/10 px-4 py-2 text-sm font-medium backdrop-blur">
                          Instant reveal
                        </div>
                      </div>
                    </div>
                  </div>
                );
              })}
            </div>
          </div>
        </section>

        {/* ── Region / Currency Switcher ─────────────────────────────────────── */}
        <section className="mt-6 rounded-[24px] border border-black/5 bg-white/90 px-5 py-4 shadow-sm backdrop-blur">
          <div className="flex flex-wrap items-center gap-3">
            <div className="flex items-center gap-2 text-sm font-semibold text-slate-600">
              <Globe className="h-4 w-4 text-slate-400" />
              View prices in:
            </div>
            <div className="flex gap-2">
              {REGIONS.map((r) => (
                <button
                  key={r.code}
                  id={`region-${r.code}`}
                  onClick={() => setSelectedRegion(r)}
                  className={`flex items-center gap-2 rounded-full px-4 py-2 text-sm font-semibold transition-all ${
                    selectedRegion.code === r.code
                      ? 'bg-slate-950 text-white shadow-md'
                      : 'bg-slate-100 text-slate-600 hover:bg-slate-200'
                  }`}
                >
                  <span>{r.flag}</span>
                  <span>{r.label}</span>
                </button>
              ))}
            </div>
            {ratesLoading ? (
              <span className="ml-2 text-xs text-slate-400 flex items-center gap-1">
                <span className="inline-block w-3 h-3 border-2 border-slate-300 border-t-slate-600 rounded-full animate-spin" />
                Fetching live rates…
              </span>
            ) : (
              <span className={`ml-2 text-xs flex items-center gap-1 ${ratesSource === 'live' ? 'text-emerald-500' : 'text-slate-400'}`}>
                <span className={`w-1.5 h-1.5 rounded-full ${ratesSource === 'live' ? 'bg-emerald-500 animate-pulse' : 'bg-slate-400'}`} />
                1 USD = {selectedRegion.symbol}{(rates[selectedRegion.rateKey] ?? 1).toFixed(4)} {selectedRegion.currency} · {ratesSource === 'live' ? 'Live Rates' : 'Default Rates (Offline)'}
              </span>
            )}
          </div>
        </section>

        {/* ── Search / Filter Bar ──────────────────────────────────────────────── */}
        <section className="mt-4 rounded-[28px] border border-black/5 bg-white/80 p-5 shadow-[0_18px_40px_rgba(15,23,42,0.06)] backdrop-blur">
          <div className="grid gap-4 lg:grid-cols-[1.4fr_0.8fr_0.8fr]">
            <label className="relative block">
              <Search className="pointer-events-none absolute left-4 top-1/2 h-4 w-4 -translate-y-1/2 text-slate-400" />
              <input
                type="text"
                value={searchQuery}
                onChange={(event) => setSearchQuery(event.target.value)}
                placeholder="Search Amazon, Apple, Steam..."
                className="h-14 w-full rounded-2xl border border-slate-200 bg-slate-50 pl-11 pr-4 text-sm text-slate-900 outline-none transition focus:border-slate-900 focus:bg-white"
              />
            </label>

            <select
              value={category}
              onChange={(event) => setCategory(event.target.value)}
              className="h-14 rounded-2xl border border-slate-200 bg-slate-50 px-4 text-sm text-slate-900 outline-none transition focus:border-slate-900 focus:bg-white"
            >
              {categories.map((item) => (
                <option key={item.id} value={item.id}>
                  {item.label}
                </option>
              ))}
            </select>

            <select
              value={sortBy}
              onChange={(event) => setSortBy(event.target.value)}
              className="h-14 rounded-2xl border border-slate-200 bg-slate-50 px-4 text-sm text-slate-900 outline-none transition focus:border-slate-900 focus:bg-white"
            >
              <option value="featured">Newest first</option>
              <option value="discount">Best discount</option>
              <option value="price-low">Price low to high</option>
              <option value="price-high">Price high to low</option>
            </select>
          </div>
        </section>

        <section className="mt-8">
          {isLoading ? (
            <div className="grid gap-6 md:grid-cols-2 xl:grid-cols-3">
              {[1, 2, 3, 4, 5, 6].map((item) => (
                <div key={item} className="h-[320px] animate-pulse rounded-[28px] bg-white/60" />
              ))}
            </div>
          ) : (
            <>
              <div className="mb-5 flex items-center justify-between">
                <div>
                  <h2 className="text-2xl font-semibold text-slate-950">Marketplace picks</h2>
                  <p className="mt-1 text-sm text-slate-600">
                    {sortedCards.length} cards ready for instant mock crypto checkout
                  </p>
                </div>
                <div className="hidden items-center gap-2 rounded-full bg-white px-4 py-2 text-sm text-slate-500 shadow-sm sm:flex">
                  <ShieldCheck className="h-4 w-4 text-emerald-500" />
                  Verified sellers
                </div>
              </div>

              <div className="grid gap-6 md:grid-cols-2 xl:grid-cols-3">
                {sortedCards.map((card) => {
                  const theme = getRetailerTheme(card.retailerId);
                  const discount = Math.round(((card.denomination - card.sellingPrice) / card.denomination) * 100);
                  const textColor = card.retailerId === 'target' ? 'text-slate-950' : 'text-white';
                  const subTextColor = card.retailerId === 'target' ? 'text-slate-700' : 'text-white/70';

                  return (
                    <article
                      key={card.id}
                      className="overflow-hidden rounded-[30px] border border-black/6 bg-white shadow-[0_18px_40px_rgba(15,23,42,0.08)]"
                    >
                      <div className={`relative overflow-hidden bg-gradient-to-br ${theme.brand} px-6 py-6 ${theme.halo}`}>
                        <div className={`absolute inset-0 ${theme.texture}`} />
                        {card.file_path && (
                          <div className="absolute inset-0 overflow-hidden">
                            <img 
                              src={`${API_BASE}/${card.file_path}`} 
                              alt={card.retailerName}
                              className="w-full h-full object-cover opacity-40 mix-blend-overlay"
                            />
                            <div className="absolute inset-0 bg-gradient-to-br from-black/20 to-transparent" />
                          </div>
                        )}
                        <div className="absolute inset-0 bg-[linear-gradient(135deg,rgba(255,255,255,0.18),transparent_42%,rgba(255,255,255,0.06)_72%,transparent)]" />
                        <div className={`relative flex min-h-[220px] flex-col justify-between ${textColor}`}>
                            <div className="rounded-full border border-white/25 bg-white/12 px-3 py-1 text-[11px] font-semibold uppercase tracking-[0.22em] text-inherit backdrop-blur">
                              {theme.eyebrow}
                            </div>

                          <div className="space-y-4">
                            <div className="flex items-center justify-between">
                              <div>
                                <div className={`text-sm uppercase tracking-[0.22em] ${subTextColor}`}>Gift card</div>
                                <h3 className="mt-2 text-3xl font-semibold">{card.retailerName}</h3>
                              </div>
                              <div className="flex h-14 w-14 items-center justify-center rounded-2xl border border-white/20 bg-white/14 text-2xl font-semibold uppercase backdrop-blur">
                                {theme.icon}
                              </div>
                            </div>

                            <div className="flex items-end justify-between">
                              <div>
                                <div className={`text-xs uppercase tracking-[0.22em] ${subTextColor}`}>Asking Price</div>
                                <div className="mt-1 text-5xl font-semibold leading-none">${card.sellingPrice.toFixed(0)} <span className="text-2xl">USD</span></div>
                                <div className={`text-xs mt-1 ${subTextColor}`}>≈ {estimateEth(card.sellingPrice).toFixed(6)} ETH</div>
                              </div>
                              <div className={`rounded-full border border-white/20 px-4 py-2 text-sm font-semibold ${card.retailerId === 'target' ? 'bg-white/70 text-slate-950' : 'bg-black/10 text-white'} backdrop-blur`}>
                                Instant Reveal
                              </div>
                            </div>
                          </div>
                        </div>
                      </div>

                        <div className="space-y-5 p-6">
                         <div className="flex items-center justify-between">
                           <div>
                             <div className="text-xs uppercase tracking-[0.22em] text-slate-400">
                               Price · {selectedRegion.flag} {selectedRegion.currency}
                             </div>
                             <div className="mt-1 text-2xl font-semibold text-slate-950">{formatRegionMoney(card.sellingPrice)}</div>
                             <div className="text-xs text-slate-400 mt-0.5">(≈ {formatMoney(card.sellingPrice)} USD)</div>
                           </div>
                          <div className="rounded-2xl bg-[#f6f1e8] px-4 py-3 text-right">
                            <div className="text-xs uppercase tracking-[0.22em] text-slate-500">Seller score</div>
                            <div className="mt-1 text-sm font-semibold text-slate-900">
                              {card.seller?.rating?.toFixed(1) ?? '4.8'} / 5
                            </div>
                          </div>
                        </div>

                        <div className="grid grid-cols-3 gap-3 text-sm">
                          <div className="rounded-2xl bg-slate-50 px-3 py-3">
                            <div className="text-[11px] uppercase tracking-[0.18em] text-slate-400">Condition</div>
                            <div className="mt-2 font-medium text-slate-900">{card.condition}</div>
                          </div>
                          <div className="rounded-2xl bg-slate-50 px-3 py-3">
                            <div className="text-[11px] uppercase tracking-[0.18em] text-slate-400">Balance</div>
                            <div className="mt-2 font-medium text-slate-900">Verified</div>
                          </div>
                          <div className="rounded-2xl bg-slate-50 px-3 py-3">
                            <div className="text-[11px] uppercase tracking-[0.18em] text-slate-400">Success</div>
                            <div className="mt-2 font-medium text-slate-900">{card.seller?.successRate ?? 98}%</div>
                          </div>
                        </div>

                        <button
                          onClick={() => openCheckout(card)}
                          className="flex h-14 w-full items-center justify-between rounded-2xl bg-slate-950 px-5 text-sm font-semibold text-white transition hover:bg-slate-800"
                        >
                          Buy with crypto
                          <ArrowRight className="h-4 w-4" />
                        </button>
                      </div>
                    </article>
                  );
                })}
              </div>

              <div className="mt-10 flex items-center justify-center gap-4">
                <button
                  onClick={() =>
                    setFilters((current) => ({ ...current, page: Math.max(1, current.page - 1) }))
                  }
                  className="flex h-11 w-11 items-center justify-center rounded-full border border-black/8 bg-white text-slate-700 shadow-sm transition hover:bg-slate-50"
                >
                  <ChevronLeft className="h-4 w-4" />
                </button>
                <div className="rounded-full bg-white px-5 py-2 text-sm text-slate-500 shadow-sm">
                  Page {filters.page}
                </div>
                <button
                  onClick={() =>
                    setFilters((current) => ({ ...current, page: current.page + 1 }))
                  }
                  className="flex h-11 w-11 items-center justify-center rounded-full border border-black/8 bg-white text-slate-700 shadow-sm transition hover:bg-slate-50"
                >
                  <ChevronRight className="h-4 w-4" />
                </button>
              </div>
            </>
          )}
        </section>

        <section className="mt-10 rounded-[28px] bg-[#f59f0b] px-6 py-6 text-slate-950 shadow-[0_18px_40px_rgba(245,159,11,0.25)] sm:px-8">
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
            <button className="inline-flex h-12 items-center justify-center rounded-2xl bg-slate-950 px-5 text-sm font-semibold text-white transition hover:bg-slate-800">
              List a card
            </button>
          </div>
        </section>
      </div>

      {selectedCard ? (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 p-4 backdrop-blur-sm">
          <div className="max-h-[92vh] w-full max-w-5xl overflow-auto rounded-[32px] bg-[#fcfaf6] shadow-[0_30px_90px_rgba(15,23,42,0.32)]">
            <div className="grid lg:grid-cols-[0.9fr_1.1fr]">
              <div className={`relative overflow-hidden bg-gradient-to-br ${getRetailerTheme(selectedCard.retailerId).brand} p-8 text-white`}>
                <div className={`absolute inset-0 ${getRetailerTheme(selectedCard.retailerId).texture}`} />
                {selectedCard.file_path && (
                  <div className="absolute inset-0 overflow-hidden">
                    <img 
                      src={`${API_BASE}/${selectedCard.file_path}`} 
                      alt={selectedCard.retailerName}
                      className="w-full h-full object-cover opacity-40 mix-blend-overlay"
                    />
                    <div className="absolute inset-0 bg-gradient-to-br from-black/40 to-transparent" />
                  </div>
                )}
                <div className="absolute inset-0 bg-[linear-gradient(135deg,rgba(255,255,255,0.16),transparent_42%,rgba(255,255,255,0.06)_72%,transparent)]" />
                <button
                  onClick={closeCheckout}
                  className="absolute right-5 top-5 z-10 flex h-10 w-10 items-center justify-center rounded-full border border-white/20 bg-black/10 text-white backdrop-blur"
                >
                  <X className="h-4 w-4" />
                </button>

                <div className="relative flex min-h-[380px] flex-col justify-between">
                  <div>
                    <div className="text-xs uppercase tracking-[0.3em] text-white/80">Real crypto checkout</div>
                    <h2 className="mt-4 text-4xl font-semibold">{selectedCard.retailerName}</h2>
                    <p className="mt-3 max-w-sm text-sm leading-6 text-white/80">
                      Connect your MetaMask, pay with Sepolia ETH, and receive your gift card code instantly after blockchain confirmation.
                    </p>
                  </div>

                  <div className="rounded-[28px] border border-white/18 bg-black/10 p-5 backdrop-blur">
                    <div className="text-xs uppercase tracking-[0.22em] text-white/70">Card summary</div>
                    <div className="mt-4 grid grid-cols-1 gap-4">
                      <div>
                        <div className="text-xs text-white/60">Asking price</div>
                        <div className="mt-1 text-3xl font-semibold">${selectedCard.sellingPrice.toFixed(2)} USD</div>
                        <div className="text-xs text-white/40 mt-1">≈ {estimateEth(selectedCard.sellingPrice).toFixed(6)} ETH</div>
                      </div>
                    </div>
                    <div className="mt-4 flex items-center gap-2 text-sm text-white/80">
                      <ShieldCheck className="h-4 w-4 text-emerald-300" />
                      Seller success rate {selectedCard.seller?.successRate ?? 98}%
                    </div>
                  </div>
                </div>
              </div>

              <div className="p-6 sm:p-8">
                <div className="flex items-center justify-between">
                  <div>
                    <div className="text-xs uppercase tracking-[0.26em] text-slate-400">Payment rail</div>
                    <h3 className="mt-2 text-2xl font-semibold text-slate-950">Choose a crypto method</h3>
                  </div>
                  <div className="rounded-full bg-blue-50 px-4 py-2 text-xs font-semibold text-blue-700">
                    Sepolia Network
                  </div>
                </div>

                <div className="mt-6 grid gap-3 sm:grid-cols-3">
                  {cryptoMethods.map((method) => (
                    <button
                      key={method.id}
                      onClick={() => setSelectedCrypto(method)}
                      className={`rounded-2xl border px-4 py-4 text-left transition ${
                        selectedCrypto.id === method.id
                          ? 'border-slate-950 bg-slate-950 text-white'
                          : 'border-slate-200 bg-white text-slate-900 hover:border-slate-400'
                      }`}
                    >
                      <div className="flex items-center gap-2">
                        <div
                          className="flex h-9 w-9 items-center justify-center rounded-full text-white"
                          style={{ backgroundColor: method.accent }}
                        >
                          {method.symbol === 'BTC' ? (
                            <Bitcoin className="h-4 w-4" />
                          ) : (
                            <CircleDollarSign className="h-4 w-4" />
                          )}
                        </div>
                        <div>
                          <div className="text-sm font-semibold">{method.symbol}</div>
                          <div className={`text-xs ${selectedCrypto.id === method.id ? 'text-white/70' : 'text-slate-500'}`}>
                            {method.network}
                          </div>
                        </div>
                      </div>
                    </button>
                  ))}
                </div>

                <div className="mt-6 rounded-[28px] border border-slate-200 bg-white p-5 shadow-sm">
                  <div className="flex items-center justify-between">
                    <div>
                      <div className="text-xs uppercase tracking-[0.22em] text-slate-400">Send exactly</div>
                      <div className="mt-2 text-3xl font-semibold text-slate-950">
                        {paymentAmount.toFixed(selectedCrypto.symbol === 'USDT' ? 2 : 6)} {selectedCrypto.symbol}
                      </div>
                    </div>
                    <div className="rounded-2xl bg-slate-50 px-4 py-3 text-right">
                      <div className="text-xs uppercase tracking-[0.18em] text-slate-400">ETA</div>
                      <div className="mt-1 text-sm font-medium text-slate-900">{selectedCrypto.eta}</div>
                    </div>
                  </div>

                  <div className="mt-5 grid gap-4 sm:grid-cols-2">
                    <div className="rounded-2xl bg-slate-50 p-4">
                      <div className="flex items-center gap-2 text-sm font-medium text-slate-800">
                        <Wallet className="h-4 w-4" />
                        Deposit wallet
                      </div>
                      <p className="mt-3 break-all font-mono text-xs leading-6 text-slate-600">
                        {selectedCrypto.wallet}
                      </p>
                      <button
                        onClick={copyWalletAddress}
                        className="mt-4 inline-flex items-center gap-2 rounded-full border border-slate-200 bg-white px-3 py-2 text-xs font-semibold text-slate-700 transition hover:border-slate-400"
                      >
                        <Copy className="h-3.5 w-3.5" />
                        {copiedWallet ? 'Copied' : 'Copy address'}
                      </button>
                    </div>

                    <div className="rounded-2xl bg-slate-50 p-4">
                      <div className="text-sm font-medium text-slate-800">What happens next</div>
                      <ul className="mt-3 space-y-2 text-sm leading-6 text-slate-600">
                        <li>1. Send the funds from your crypto wallet.</li>
                        <li>2. Press the payment confirmation button below.</li>
                        <li>3. We simulate network verification and unlock the demo code.</li>
                      </ul>
                    </div>
                  </div>
                </div>

                <div className="mt-6 rounded-[28px] border border-slate-200 bg-[#f6f1e8] p-5">
                  {paymentStep === 'idle' ? (
                    <>
                      <div className="flex items-start justify-between gap-4">
                        <div>
                          <div className="text-xs uppercase tracking-[0.22em] text-slate-400">Order breakdown</div>
                          <div className="mt-3 space-y-2 text-sm text-slate-700">
                            <div className="flex items-center justify-between gap-6">
                              <span>Card price (USD)</span>
                              <span>${selectedCard.sellingPrice.toFixed(2)}</span>
                            </div>
                            <div className="flex items-center justify-between gap-6 font-bold text-slate-900 border-t border-slate-100 pt-2">
                              <span>Payment amount</span>
                              <span>{estimateEth(selectedCard.sellingPrice).toFixed(6)} ETH</span>
                            </div>
                            <div className="flex items-center justify-between gap-6">
                              <span>Network fee</span>
                              <span>{selectedCrypto.symbol === 'USDT' ? '$0.00' : '$1.25'}</span>
                            </div>
                          </div>
                        </div>
                        <div className="rounded-2xl bg-white px-4 py-3 text-right shadow-sm">
                          <div className="text-xs uppercase tracking-[0.18em] text-slate-400">Paying with</div>
                          <div className="mt-1 text-sm font-semibold text-slate-950">
                            {selectedCrypto.label} {selectedCrypto.symbol}
                          </div>
                        </div>
                      </div>

                      <button
                        onClick={handleRealPayment}
                        className="mt-6 flex h-14 w-full items-center justify-center rounded-2xl bg-slate-950 text-sm font-semibold text-white transition hover:bg-slate-800"
                      >
                        {paymentStep === 'idle' ? `Pay with MetaMask (${selectedCrypto.symbol})` : 'Processing...'}
                      </button>
                    </>
                  ) : null}

                  {['connecting', 'paying', 'confirming'].includes(paymentStep) && (
                    <div className="py-10 text-center">
                      <Loader2 className="mx-auto h-14 w-14 animate-spin text-slate-950" />
                      <h4 className="mt-5 text-xl font-semibold text-slate-950">
                        {paymentStep === 'connecting' && 'Connecting Wallet...'}
                        {paymentStep === 'paying' && 'Confirm Payment in MetaMask...'}
                        {paymentStep === 'confirming' && 'Confirming on Blockchain...'}
                      </h4>
                      <p className="mt-2 text-sm text-slate-600">
                        {paymentStep === 'confirming' 
                          ? 'Waiting for Sepolia network confirmation (~15-30s)...' 
                          : 'Please follow the instructions in your MetaMask popup.'}
                      </p>
                      {txHash && (
                        <a 
                          href={`https://sepolia.etherscan.io/tx/${txHash}`}
                          target="_blank"
                          rel="noopener noreferrer"
                          className="mt-4 inline-flex items-center gap-2 text-sm font-medium text-blue-600 hover:text-blue-500 transition"
                        >
                          View Transaction <ExternalLink className="h-4 w-4" />
                        </a>
                      )}
                    </div>
                  )}

                  {paymentStep === 'success' ? (
                    <div className="py-2">
                      <div className="flex items-center gap-3 text-emerald-700">
                        <CheckCircle2 className="h-6 w-6" />
                        <h4 className="text-xl font-semibold">Payment Confirmed!</h4>
                      </div>
                      <p className="mt-2 text-sm text-slate-600">
                        Your transaction was successfully verified on the blockchain. Your gift card code is now unlocked.
                      </p>

                      <div className="mt-5 space-y-4 rounded-2xl border border-emerald-100 bg-white p-5 shadow-sm">
                        <div>
                          <div className="flex items-center justify-between">
                            <div className="text-xs uppercase tracking-[0.22em] text-slate-400">Gift card code</div>
                            <button 
                              onClick={() => {
                                const code = purchasedCard?.card_code || '';
                                navigator.clipboard.writeText(code);
                                setCodeCopied(true);
                                setTimeout(() => setCodeCopied(false), 2000);
                              }}
                              className="text-[10px] font-bold text-emerald-600 uppercase hover:text-emerald-500 transition"
                            >
                              {codeCopied ? 'Copied!' : 'Copy Full Code'}
                            </button>
                          </div>
                          <div className="mt-2 flex items-center gap-3">
                            <div className="flex-1 font-mono text-xl font-bold tracking-wider text-slate-950 bg-slate-50 px-4 py-3 rounded-xl border border-slate-100">
                              {purchasedCard?.card_code 
                                ? `•••• •••• •••• ${purchasedCard.card_code.slice(-4)}`
                                : '•••• •••• •••• ••••'}
                            </div>
                          </div>
                        </div>

                        {purchasedCard?.card_pin && (
                          <div className="pt-4 border-t border-slate-50">
                            <div className="flex items-center justify-between">
                              <div className="text-xs uppercase tracking-[0.22em] text-slate-400">Security PIN</div>
                              <button 
                                onClick={() => {
                                  navigator.clipboard.writeText(purchasedCard.card_pin || '');
                                  setPinCopied(true);
                                  setTimeout(() => setPinCopied(false), 2000);
                                }}
                                className="text-[10px] font-bold text-emerald-600 uppercase hover:text-emerald-500 transition"
                              >
                                {pinCopied ? 'Copied!' : 'Copy PIN'}
                              </button>
                            </div>
                            <div className="mt-2 font-mono text-lg font-bold text-slate-950 bg-slate-50 px-4 py-2 rounded-xl border border-slate-100 inline-block min-w-[100px]">
                              {purchasedCard.card_pin}
                            </div>
                          </div>
                        )}
                      </div>

                      <div className="mt-4 flex flex-col gap-2 rounded-2xl border border-slate-200 bg-white p-4 text-sm text-slate-700">
                        <div className="flex justify-between">
                          <span className="text-slate-400">Status:</span>
                          <span className="font-medium text-emerald-600">Verified</span>
                        </div>
                        <div className="flex justify-between">
                          <span className="text-slate-400">TX Hash:</span>
                          <a 
                            href={`https://sepolia.etherscan.io/tx/${txHash}`}
                            target="_blank"
                            rel="noopener noreferrer"
                            className="font-mono text-xs text-blue-600 hover:underline truncate ml-4"
                          >
                            {txHash}
                          </a>
                        </div>
                      </div>

                      <button
                        onClick={closeCheckout}
                        className="mt-6 flex h-14 w-full items-center justify-center rounded-2xl bg-emerald-600 text-sm font-semibold text-white transition hover:bg-emerald-500"
                      >
                        Finish & Close
                      </button>
                    </div>
                  ) : null}
                </div>
              </div>
            </div>
          </div>
        </div>
      ) : null}
    </div>
  );
}
