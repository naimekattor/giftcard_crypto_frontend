'use client';

import React, { useState, useEffect, useMemo } from 'react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import * as z from 'zod';
import { Loader2, Plus, ArrowRight, ArrowLeft, Upload, ShieldCheck, Wallet, Globe, AlertCircle, Info } from 'lucide-react';
import { motion, AnimatePresence } from 'motion/react';
import { useAuth } from '@/features/auth/contexts/AuthContext';
import { RecaptchaField } from '@/components/shared/RecaptchaField';

const REGIONS = [
  { code: 'USA', label: 'United States', flag: '🇺🇸', currency: 'USD', symbol: '$' },
  { code: 'UK', label: 'United Kingdom', flag: '🇬🇧', currency: 'GBP', symbol: '£' },
  { code: 'Canada', label: 'Canada', flag: '🇨🇦', currency: 'CAD', symbol: 'CA$' },
];

const RETAILERS_BY_REGION: Record<string, string[]> = {
  USA: ['Amazon', 'Nike', 'Uber', 'DICK’S SPORTING GOODS', 'Steam', 'Door Dash', 'AMC', 'Best Buy', 'PlayStation', 'Xbox', 'Costco'],
  Canada: ['Amazon'],
  UK: ['Uber', 'Currys', 'John Lewis', 'Apple', 'Deliveroo', 'Just Eat', 'Halfords', 'ASDA', 'PlayStation'],
};

// Rates based on the requirement configuration
const RETAILER_RATES: Record<string, { sellerRate: number; buyerRate: number }> = {
  "Amazon": { sellerRate: 0.75, buyerRate: 0.85 },
  "Nike": { sellerRate: 0.70, buyerRate: 0.80 },
  "Uber": { sellerRate: 0.77, buyerRate: 0.86 },
  "DICK’S SPORTING GOODS": { sellerRate: 0.72, buyerRate: 0.82 },
  "Steam": { sellerRate: 0.70, buyerRate: 0.80 },
  "Door Dash": { sellerRate: 0.74, buyerRate: 0.84 },
  "AMC": { sellerRate: 0.65, buyerRate: 0.75 },
  "Best Buy": { sellerRate: 0.78, buyerRate: 0.88 },
  "PlayStation": { sellerRate: 0.67, buyerRate: 0.76 },
  "Xbox": { sellerRate: 0.67, buyerRate: 0.76 },
  "Costco": { sellerRate: 0.80, buyerRate: 0.90 },
  "Currys": { sellerRate: 0.76, buyerRate: 0.85 },
  "John Lewis": { sellerRate: 0.78, buyerRate: 0.87 },
  "Apple": { sellerRate: 0.79, buyerRate: 0.88 },
  "Deliveroo": { sellerRate: 0.75, buyerRate: 0.84 },
  "Just Eat": { sellerRate: 0.75, buyerRate: 0.84 },
  "Halfords": { sellerRate: 0.70, buyerRate: 0.79 },
  "ASDA": { sellerRate: 0.72, buyerRate: 0.81 },
};

const RETAILER_VALIDATIONS: Record<string, { digits: number | number[]; startsWith: string[]; pinRequired: boolean; strictPrefix?: boolean }> = {
  // USA RETAILERS
  "Amazon": { digits: [14, 15, 16], startsWith: ["AQ"], pinRequired: true, strictPrefix: false },
  "Nike": { digits: [19], startsWith: ["6060"], pinRequired: true, strictPrefix: false },
  "Uber": { digits: [16], startsWith: ["6110"], pinRequired: false, strictPrefix: false },
  "DICK’S SPORTING GOODS": { digits: [19], startsWith: ["6006"], pinRequired: true, strictPrefix: false },
  "Steam": { digits: [15], startsWith: ["A", "B"], pinRequired: false, strictPrefix: false },
  "Door Dash": { digits: [16], startsWith: ["6109"], pinRequired: true, strictPrefix: false },
  "AMC": { digits: [19], startsWith: ["6036", "6366"], pinRequired: true, strictPrefix: false },
  "Best Buy": { digits: [15, 16], startsWith: ["6006", "6102"], pinRequired: true, strictPrefix: false },
  "PlayStation": { digits: [12], startsWith: [], pinRequired: false, strictPrefix: false },
  "Xbox": { digits: [25], startsWith: [], pinRequired: false, strictPrefix: false },
  "Costco": { digits: [16], startsWith: ["61"], pinRequired: true, strictPrefix: false },

  // UK RETAILERS
  "Uber_UK": { digits: 16, startsWith: ["NAAA"], pinRequired: false },
  "Currys": { digits: 19, startsWith: ["5045075659"], pinRequired: true },
  "John Lewis": { digits: 19, startsWith: ["63719600"], pinRequired: true },
  "Apple": { digits: 16, startsWith: ["X"], pinRequired: false },
  "Deliveroo": { digits: 16, startsWith: ["NAAQ"], pinRequired: false },
  "Just Eat": { digits: 12, startsWith: ["C"], pinRequired: false },
  "Halfords": { digits: 19, startsWith: ["50450758"], pinRequired: true },
  "ASDA": { digits: 16, startsWith: ["63"], pinRequired: true },
  "PlayStation_UK": { digits: 12, startsWith: [], pinRequired: false },

  // CANADA RETAILERS
  "Amazon_CA": { digits: 15, startsWith: [], pinRequired: true }
};

const formSchema = z.object({
  retailer: z.string().min(1, 'Please select a retailer'),
  region: z.string().min(1, 'Please select a region'),
  price: z.string().refine((val) => !isNaN(Number(val)) && Number(val) > 0, 'Enter a valid gift card value'),
  cardCode: z.string().min(5, 'Gift card code is too short'),
  pin: z.string().optional(),
  sellerWallet: z.string().startsWith('0x', 'Enter a valid ETH wallet address (starting with 0x)'),
});

type FormData = z.infer<typeof formSchema>;

const API_BASE = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:4000';

export function SellerCardForm() {
  const { user } = useAuth();
  const [step, setStep] = useState(1);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [success, setSuccess] = useState(false);
  const [selectedFile, setSelectedFile] = useState<File | null>(null);
  const [apiError, setApiError] = useState<string | null>(null);
  const [captchaToken, setCaptchaToken] = useState<string | null>(null);
  const [rates, setRates] = useState<Record<string, number>>({ USD: 1, GBP: 0.79, CAD: 1.36, ETH: 2650 });
  const [codeWarning, setCodeWarning] = useState<string | null>(null);

  useEffect(() => {
    fetch(`${API_BASE}/exchange-rates`)
      .then(res => res.json())
      .then(data => {
        if (data) {
          setRates({
            USD: data.USD ?? 1,
            GBP: data.GBP ?? 0.79,
            CAD: data.CAD ?? 1.36,
            ETH: data.ETH ?? 2650
          });
        }
      })
      .catch(err => console.error('Error fetching exchange rates for seller form:', err));
  }, []);

  const { register, handleSubmit, formState: { errors }, watch, trigger, setValue, setError, clearErrors } = useForm<FormData>({
    resolver: zodResolver(formSchema),
    defaultValues: { region: 'USA', retailer: '' },
  });

  const watchedCardCode = watch('cardCode');
  useEffect(() => {
    setCodeWarning(null);
  }, [watchedCardCode]);

  const selectedRegion = watch('region');
  const selectedRetailer = watch('retailer');
  const cardValueStr = watch('price');
  
  const regionMeta = useMemo(() => REGIONS.find(r => r.code === selectedRegion) || REGIONS[0], [selectedRegion]);
  const availableRetailers = useMemo(() => RETAILERS_BY_REGION[selectedRegion] || [], [selectedRegion]);

  useEffect(() => {
    // Reset retailer if not in the available list for the new region
    if (!availableRetailers.includes(selectedRetailer)) {
      setValue('retailer', '');
    }
  }, [selectedRegion, availableRetailers, selectedRetailer, setValue]);

  const pricing = useMemo(() => {
    const val = Number(cardValueStr);
    if (isNaN(val) || val <= 0 || !selectedRetailer) return null;
    
    const rates = RETAILER_RATES[selectedRetailer] || { sellerRate: 0.75, buyerRate: 0.85 };
    const sellerReceives = val * rates.sellerRate;
    const buyerPays = val * rates.buyerRate;
    const charge = buyerPays - sellerReceives;
    
    return {
      sellerReceives,
      buyerPays,
      charge,
      rateLabel: `${Math.round(rates.sellerRate * 100)}% of value`
    };
  }, [cardValueStr, selectedRetailer]);

  const validateStep1 = (data: { retailer: string; region: string; cardCode: string; pin?: string }) => {
    const { retailer, region, cardCode, pin } = data;
    const code = (cardCode || '').trim();
    const pinVal = (pin || '').trim();

    if (!retailer) return { error: { field: 'retailer' as const, message: 'Please select a retailer' } };
    if (!region) return { error: { field: 'region' as const, message: 'Please select a region' } };
    if (!code) return { error: { field: 'cardCode' as const, message: 'Gift card code is required' } };

    const configKey = region === "UK" 
      ? (retailer === "Uber" ? "Uber_UK" : (retailer === "PlayStation" ? "PlayStation_UK" : retailer)) 
      : (region === "Canada" && retailer === "Amazon" ? "Amazon_CA" : retailer);

    const config = RETAILER_VALIDATIONS[configKey];

    if (config) {
      // Validate digits (supporting single value or array of values)
      const digitsArray = Array.isArray(config.digits) ? config.digits : [config.digits];
      if (!digitsArray.includes(code.length)) {
        return { error: { field: 'cardCode' as const, message: `Invalid card code. Must be exactly ${digitsArray.join(' or ')} characters for ${retailer} (${region}).` } };
      }

      // Validate prefix (case-insensitive)
      let hasWarning = false;
      if (config.startsWith.length > 0) {
        const upperCode = code.toUpperCase();
        const matchesPrefix = config.startsWith.some(prefix => upperCode.startsWith(prefix.toUpperCase()));
        if (!matchesPrefix) {
          const isStrict = config.strictPrefix !== false;
          if (isStrict) {
            return { error: { field: 'cardCode' as const, message: `Invalid card code. For ${retailer} in ${region}, it must start with: ${config.startsWith.join(', ')}` } };
          } else {
            hasWarning = true;
          }
        }
      }

      // Validate PIN
      if (config.pinRequired && !pinVal) {
        return { error: { field: 'pin' as const, message: `Security PIN is required for ${retailer} (${region}).` } };
      }

      if (hasWarning) {
        return { warning: "This gift card format appears unusual. Please double-check your details." };
      }
    }

    return null;
  };

  const nextStep = async () => {
    clearErrors(['retailer', 'region', 'price', 'cardCode', 'pin']);
    setCodeWarning(null);
    const isValid = await trigger(['retailer', 'region', 'price', 'cardCode']);
    if (!isValid) return;

    const retailer = watch('retailer');
    const region = watch('region');
    const cardCode = watch('cardCode');
    const pin = watch('pin');

    const result = validateStep1({ retailer, region, cardCode, pin });
    if (result) {
      if (result.error) {
        setError(result.error.field, { type: 'manual', message: result.error.message });
        return;
      }
      if (result.warning) {
        setCodeWarning(result.warning);
      }
    }

    // Image upload is optional, so no validation is needed.
    setApiError(null);
    setStep(2);
  };
  const prevStep = () => setStep(1);

  const onSubmit = async (data: FormData) => {
    if (!user) {
      setApiError('You must be logged in as a seller to list a card.');
      return;
    }
    if (!captchaToken) {
      setApiError('Please complete the reCAPTCHA verification.');
      return;
    }
    
    setIsSubmitting(true);
    setApiError(null);

    try {
      const formData = new FormData();
      formData.append('retailer', data.retailer);
      formData.append('price', data.price);
      formData.append('card_code', data.cardCode);
      formData.append('card_pin', data.pin || '');
      formData.append('seller_wallet_address', data.sellerWallet);
      formData.append('region', data.region);
      formData.append('currency', regionMeta.currency);
      formData.append('captcha_token', captchaToken);
      if (selectedFile) formData.append('file', selectedFile);

      const response = await fetch(`${API_BASE}/seller/cards/sell`, {
        method: 'POST',
        headers: { Authorization: `Bearer ${user.token}` },
        body: formData,
      });

      const json = await response.json();
      if (!response.ok) throw new Error(json.error || 'Submission failed');

      if (json.isValid === false) {
        throw new Error('This card code appears to be invalid. Please double check the code.');
      }

      setSuccess(true);
    } catch (e: any) {
      setApiError(e.message || 'Error listing card. Please try again.');
    } finally {
      setIsSubmitting(false);
    }
  };

  if (success) {
    return (
      <motion.div initial={{ opacity: 0, scale: 0.9 }} animate={{ opacity: 1, scale: 1 }} className="text-center py-16 px-8 bg-white rounded-[3rem] shadow-2xl border border-slate-100">
        <div className="w-24 h-24 bg-emerald-50 rounded-full flex items-center justify-center mx-auto mb-8 shadow-inner">
          <ShieldCheck className="w-12 h-12 text-emerald-500" />
        </div>
        <h2 className="text-4xl font-bold text-slate-900 mb-4 ">Listing Submitted!</h2>
        <p className="text-slate-500 mb-10 max-w-sm mx-auto font-medium">
          Your card has been submitted and is <span className="text-brand font-bold uppercase">Pending Admin Approval</span>. 
          It will be live in the marketplace once approved. You will receive <span className="text-slate-900 font-bold">{regionMeta.symbol}{pricing?.sellerReceives.toFixed(2)}</span> to your wallet once sold.
        </p>
        <div className="flex flex-col gap-3 justify-center">
          <button onClick={() => { setSuccess(false); setStep(1); setCaptchaToken(null); }} className="w-full h-16 cursor-pointer bg-brand hover:bg-brand/90 text-white rounded-2xl font-bold uppercase tracking-widest transition-all shadow-xl shadow-brand/20">
            List Another Card
          </button>
          <a href="/dashboard/seller" className="w-full h-16 border-2 border-slate-100 text-slate-600 rounded-2xl font-bold uppercase tracking-widest hover:bg-slate-50 transition-all flex items-center justify-center">
            Go to Dashboard
          </a>
        </div>
      </motion.div>
    );
  }

  return (
    <div className="max-w-2xl mx-auto">
      {/* Progress */}
      <div className="flex justify-between items-center mb-12 px-6">
        {[1, 2].map((s) => (
          <React.Fragment key={s}>
            <div className={`w-12 h-12 rounded-2xl flex items-center justify-center font-bold text-sm transition-all ${
              step >= s ? 'bg-slate-900 text-white shadow-xl shadow-slate-900/20' : 'bg-slate-100 text-slate-400'
            }`}>
              {step > s ? '✓' : s}
            </div>
            {s === 1 && <div className={`flex-1 mx-4 h-1.5 rounded-full transition-all duration-700 ${step > 1 ? 'bg-slate-900' : 'bg-slate-100'}`} />}
          </React.Fragment>
        ))}
      </div>

      <form onSubmit={handleSubmit(onSubmit)} className="bg-white rounded-[3rem] p-10 shadow-2xl border border-slate-100 overflow-hidden">
        

        <AnimatePresence mode="wait">
          {step === 1 ? (
            <motion.div key="step1" initial={{ x: 20, opacity: 0 }} animate={{ x: 0, opacity: 1 }} exit={{ x: -20, opacity: 0 }} className="space-y-8">
              <div>
                <h2 className="text-3xl font-bold text-slate-900 mb-2 tracking-tight">Card Information</h2>
                <p className="text-slate-500 font-medium">Verify your region and retailer details.</p>
              </div>

              {/* Region */}
              <div className="space-y-3">
                <label className="text-[10px] font-bold text-slate-400 uppercase tracking-widest flex items-center gap-2">
                  <Globe className="w-4 h-4" /> 01. Select Region
                </label>
                <div className="grid grid-cols-3 gap-3">
                  {REGIONS.map(r => (
                    <label key={r.code} className={`cursor-pointer group flex flex-col items-center gap-2 p-5 rounded-3xl border-2 transition-all active:scale-95 ${
                      selectedRegion === r.code ? 'border-brand bg-brand/5' : 'border-slate-50 bg-slate-50 hover:border-slate-200'
                    }`}>
                      <input type="radio" {...register('region')} value={r.code} className="sr-only" />
                      <span className="text-3xl group-hover:scale-110 transition-transform">{r.flag}</span>
                      <span className="text-[10px] font-bold text-slate-900 uppercase tracking-widest">{r.code}</span>
                    </label>
                  ))}
                </div>
              </div>

              {/* Retailer & Price */}
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div className="space-y-3">
                  <label className="text-[10px] font-bold text-slate-400 uppercase tracking-widest">02. Retailer</label>
                  <select {...register('retailer')} className="w-full h-16 rounded-2xl border-2 border-slate-50 bg-slate-50 px-5 text-sm font-bold text-slate-900 outline-none focus:border-brand focus:bg-white transition-all appearance-none cursor-pointer">
                    <option value="">Select retailer…</option>
                    {availableRetailers.map(r => <option key={r} value={r}>{r}</option>)}
                  </select>
                </div>

                <div className="space-y-3">
                  <label className="text-[10px] font-bold text-slate-400 uppercase tracking-widest">03. Gift Card Value</label>
                  <div className="relative">
                    <span className="absolute left-5 top-1/2 -translate-y-1/2 text-slate-400 font-bold text-sm">{regionMeta.symbol}</span>
                    <input type="text" placeholder="50.00" {...register('price')} className="w-full h-16 rounded-2xl border-2 border-slate-50 bg-slate-50 pl-12 pr-5 text-sm font-bold text-slate-900 outline-none focus:border-brand focus:bg-white transition-all" />
                  </div>
                </div>
              </div>

              {/* Payout View */}
              {pricing && (
                <div className="bg-slate-900 rounded-3xl p-8 text-white space-y-6 shadow-xl shadow-slate-900/20">
                  <div className="flex items-center justify-between">
                    <div>
                      <div className="text-[10px] font-bold text-white/40 uppercase tracking-widest mb-1">You will receive</div>
                      <div className="text-4xl font-bold text-brand tracking-tight">{regionMeta.symbol}{pricing.sellerReceives.toFixed(2)}</div>
                    </div>
                    {/* <div className="text-right">
                      <div className="text-[10px] font-bold text-white/40 uppercase tracking-widest mb-1">Platform Charge</div>
                      <div className="text-sm font-bold text-white/80">{regionMeta.symbol}{pricing.charge.toFixed(2)} ({pricing.rateLabel})</div>
                    </div> */}
                  </div>
                  <div className="flex items-center gap-3 p-4 bg-white/5 rounded-2xl border border-white/5">
                    <Info className="w-4 h-4 text-brand" />
                    <p className="text-[10px] font-bold text-white/60 uppercase tracking-widest leading-relaxed">
                      Rates are dynamic based on retailer demand. Your payout is locked once listed.
                    </p>
                  </div>
                </div>
              )}

              {/* Code & PIN */}
              <div className="space-y-6">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  <div className="space-y-3">
                    <label className="text-[10px] font-bold text-slate-400 uppercase tracking-widest">04. Gift Card Code</label>
                    <input
                      type="text"
                      placeholder="XXXX-XXXX-XXXX"
                      {...register('cardCode')}
                      className={`w-full h-16 rounded-2xl border-2 px-5 text-sm font-mono font-bold text-slate-900 outline-none focus:border-brand transition-all ${
                        errors.cardCode ? 'border-red-500 bg-red-50/50 focus:border-red-500' :
                        codeWarning ? 'border-amber-500 bg-amber-50/50 focus:border-amber-500' :
                        'border-slate-50 bg-slate-50 focus:bg-white'
                      }`}
                    />
                    {errors.cardCode ? (
                      <p className="text-xs text-red-500 font-bold mt-1.5 flex items-center gap-1.5">
                        <AlertCircle className="w-4 h-4 shrink-0" />
                        {errors.cardCode.message}
                      </p>
                    ) : codeWarning ? (
                      <p className="text-xs text-amber-600 font-bold mt-1.5 flex items-center gap-1.5">
                        <AlertCircle className="w-4 h-4 shrink-0 text-amber-500" />
                        {codeWarning}
                      </p>
                    ) : (
                      (() => {
                        const configKey = selectedRegion === "UK" 
                          ? (selectedRetailer === "Uber" ? "Uber_UK" : (selectedRetailer === "PlayStation" ? "PlayStation_UK" : selectedRetailer)) 
                          : (selectedRegion === "Canada" && selectedRetailer === "Amazon" ? "Amazon_CA" : selectedRetailer);
                        const config = RETAILER_VALIDATIONS[configKey];
                        if (config) {
                          const digitsArray = Array.isArray(config.digits) ? config.digits : [config.digits];
                          return (
                            <span className="text-[10px] text-slate-400 font-bold uppercase tracking-widest mt-1 block">
                              Expected: {digitsArray.join(' or ')} characters{config.startsWith.length > 0 ? ` (must start with: ${config.startsWith.join(', ')})` : ''}
                            </span>
                          );
                        }
                        return null;
                      })()
                    )}
                  </div>
                  <div className="space-y-3">
                    <label className="text-[10px] font-bold text-slate-400 uppercase tracking-widest">05. Security PIN (If any)</label>
                    <input
                      type="text"
                      placeholder="1234"
                      {...register('pin')}
                      className={`w-full h-16 rounded-2xl border-2 px-5 text-sm font-mono font-bold text-slate-900 outline-none focus:border-brand transition-all ${
                        errors.pin ? 'border-red-500 bg-red-50/50 focus:border-red-500' : 'border-slate-50 bg-slate-50 focus:bg-white'
                      }`}
                    />
                    {errors.pin ? (
                      <p className="text-xs text-red-500 font-bold mt-1.5 flex items-center gap-1.5">
                        <AlertCircle className="w-4 h-4 shrink-0" />
                        {errors.pin.message}
                      </p>
                    ) : (
                      (() => {
                        const configKey = selectedRegion === "UK" 
                          ? (selectedRetailer === "Uber" ? "Uber_UK" : (selectedRetailer === "PlayStation" ? "PlayStation_UK" : selectedRetailer)) 
                          : (selectedRegion === "Canada" && selectedRetailer === "Amazon" ? "Amazon_CA" : selectedRetailer);
                        const config = RETAILER_VALIDATIONS[configKey];
                        if (config) {
                          return (
                            <span className="text-[10px] text-slate-400 font-bold uppercase tracking-widest mt-1 block">
                              {config.pinRequired ? '⚠ Security PIN is required' : 'Optional'}
                            </span>
                          );
                        }
                        return null;
                      })()
                    )}
                  </div>
                </div>

                <div className="p-8 border-2 border-dashed border-slate-100 rounded-[2.5rem] bg-slate-50/30 text-center group hover:border-brand transition-all cursor-pointer relative">
                  <input type="file" id="card-upload" className="hidden" onChange={(e) => setSelectedFile(e.target.files?.[0] || null)} />
                  <label htmlFor="card-upload" className="cursor-pointer flex flex-col items-center">
                    <div className="w-16 h-16 bg-white rounded-[1.5rem] shadow-xl shadow-slate-200/50 flex items-center justify-center mb-4 group-hover:scale-110 transition-transform">
                      <Upload className="w-7 h-7 text-slate-300 group-hover:text-brand" />
                    </div>
                    <p className="text-sm font-bold text-slate-900 uppercase tracking-widest">{selectedFile ? selectedFile.name : 'Upload Card Screenshot (Optional)'}</p>
                    <p className="text-[10px] text-slate-400 font-bold uppercase tracking-widest mt-1">PNG or JPG up to 10MB</p>
                  </label>
                </div>
              </div>

              <button type="button" onClick={nextStep} className="w-full h-16 bg-slate-900 hover:bg-slate-800 text-white rounded-2xl font-bold uppercase tracking-widest flex items-center justify-center gap-3 transition-all active:scale-95 shadow-xl shadow-slate-900/20">
                Continue to Payout <ArrowRight className="w-5 h-5" />
              </button>
            </motion.div>
          ) : (
            <motion.div key="step2" initial={{ x: 20, opacity: 0 }} animate={{ x: 0, opacity: 1 }} exit={{ x: -20, opacity: 0 }} className="space-y-8">
              <div>
                <h2 className="text-3xl font-bold text-slate-900 mb-2 tracking-tight">Payout Wallet</h2>
                <p className="text-slate-500 font-medium">Where should we send your {regionMeta.currency} earnings?</p>
              </div>
              {/* Summary */}
              <div className="bg-slate-50 border border-slate-200 rounded-2xl p-4">
                <p className="text-xs font-bold text-slate-500 uppercase tracking-wider mb-3">Listing Summary</p>
                <div className="grid grid-cols-2 gap-2 text-sm">
                  <span className="text-slate-500">Region</span>
                  <span className="font-semibold text-slate-800">{regionMeta.flag} {regionMeta.label}</span>
                  <span className="text-slate-500">Currency</span>
                  <span className="font-semibold text-slate-800">{regionMeta.currency} ({regionMeta.symbol})</span>
                  <span className="text-slate-500">Amount you will receive</span>
                  <span className="font-bold text-brand flex items-center gap-1">
                    {regionMeta.symbol}{pricing?.sellerReceives.toFixed(2)}
                    {regionMeta.currency !== 'USD' && (
                      <span className="text-xs text-slate-500 font-medium normal-case">
                        (~${(pricing ? pricing.sellerReceives / (rates[regionMeta.currency] || 1) : 0).toFixed(2)} USD)
                      </span>
                    )}
                  </span>
                </div>
              </div>

              <div className="bg-blue-50 rounded-[2.5rem] p-10 text-white space-y-8 ">
                <div className="flex items-center gap-5">
                  <div className="w-14 h-14 bg-brand rounded-2xl flex items-center justify-center shadow-lg shadow-brand/40">
                    <Wallet className="w-7 h-7 text-white" />
                  </div>
                  <div>
                    <h3 className="text-xl font-semibold text-black tracking-wide">ERC-20 Wallet</h3>
                    <p className="text-xs font-semibold text-black/80 uppercase tracking-widest">ETH or USDC </p>
                  </div>
                </div>
                
                <div className="space-y-3">
                  <input type="text" placeholder="0x..." {...register('sellerWallet')} className="w-full h-16 rounded-2xl bg-white border-2 border-white px-6 text-sm font-mono font-bold text-black outline-none focus:border-brand transition-all" />
                  <p className="text-[10px] font-bold text-black uppercase tracking-widest px-1">Ensure this is a personal wallet, not an exchange deposit.</p>
                </div>
              </div>
              <div className="flex items-start gap-3 p-4 bg-amber-50 rounded-xl border border-amber-100">
                <ShieldCheck className="w-5 h-5 text-amber-600 shrink-0 mt-0.5" />
                <p className="text-xs text-amber-700 leading-relaxed font-medium">
                  Funds are held in an escrow for up to 24 hours, buyers have to confirm the purchase within 24 hours, otherwise the funds are released to the seller. If any issues arise, an investigation will be conducted.
                </p>
              </div>

              <div className="space-y-6">
                <div className="text-center">
                   <div className="text-[10px] font-bold text-slate-400 uppercase tracking-widest mb-4">Verification Required</div>
                   <RecaptchaField onVerify={setCaptchaToken} />
                </div>

                <div className="flex gap-4">
                  <button type="button" onClick={prevStep} className="flex-1 h-16 border-2 border-slate-100 text-slate-600 rounded-2xl font-bold uppercase tracking-widest hover:bg-slate-50 transition-all">
                    Back
                  </button>
                  <button type="submit" disabled={isSubmitting || !captchaToken} className="flex-[2] h-16 bg-brand hover:bg-brand/90 text-white rounded-2xl font-bold uppercase tracking-widest flex items-center justify-center gap-3 transition-all disabled:opacity-30 shadow-xl shadow-brand/20">
                    {isSubmitting ? <Loader2 className="w-6 h-6 animate-spin" /> : <>Finalise Listing <Plus className="w-5 h-5" /></>}
                  </button>
                </div>
              </div>

            </motion.div>
          )}
        </AnimatePresence>
        {apiError && (
          <div className="mt-8 bg-red-50 border-2 border-red-100 text-red-700 rounded-2xl p-5 text-sm font-bold flex items-center gap-3">
            <AlertCircle className="w-5 h-5 shrink-0" />
            {apiError}
          </div>
        )}
      </form>
    </div>
  );
}
