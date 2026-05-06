'use client';

import React, { useState } from 'react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import * as z from 'zod';
import { RETAILERS } from '@/constants/retailers';
import { Loader2, Plus, ArrowRight, ArrowLeft, Upload, ShieldCheck, Wallet, Globe } from 'lucide-react';
import { motion, AnimatePresence } from 'motion/react';
import { useAuth } from '@/features/auth/contexts/AuthContext';

const REGIONS = [
  { code: 'UK', label: 'United Kingdom', flag: '🇬🇧', currency: 'GBP', symbol: '£' },
  { code: 'USA', label: 'United States', flag: '🇺🇸', currency: 'USD', symbol: '$' },
  { code: 'CA', label: 'Canada', flag: '🇨🇦', currency: 'CAD', symbol: 'C$' },
];

const formSchema = z.object({
  retailer: z.string().min(1, 'Please select a retailer'),
  region: z.string().min(1, 'Please select a region'),
  price: z.string().min(1, 'Enter asking price'),
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

  const { register, handleSubmit, formState: { errors }, watch, trigger } = useForm<FormData>({
    resolver: zodResolver(formSchema),
    defaultValues: { region: 'USA' },
  });

  const selectedRegion = watch('region');
  const regionMeta = REGIONS.find(r => r.code === selectedRegion) || REGIONS[1];

  const nextStep = async () => {
    const isValid = await trigger(['retailer', 'region', 'price', 'cardCode']);
    if (isValid) setStep(2);
  };
  const prevStep = () => setStep(1);

  const onSubmit = async (data: FormData) => {
    if (!user) {
      setApiError('You must be logged in as a seller to list a card.');
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
      formData.append('region', regionMeta.code);
      formData.append('currency', regionMeta.currency);
      if (selectedFile) formData.append('file', selectedFile);

      const response = await fetch(`${API_BASE}/cards/sell`, {
        method: 'POST',
        headers: { Authorization: `Bearer ${user.token}` },
        body: formData,
      });

      const json = await response.json();
      if (!response.ok) throw new Error(json.error || 'Submission failed');

      setSuccess(true);
    } catch (e: any) {
      setApiError(e.message || 'Error listing card. Please try again.');
    } finally {
      setIsSubmitting(false);
    }
  };

  if (success) {
    return (
      <motion.div
        initial={{ opacity: 0, scale: 0.9 }}
        animate={{ opacity: 1, scale: 1 }}
        className="text-center py-12 px-6 bg-white rounded-[2rem] shadow-xl border border-slate-100"
      >
        <div className="w-20 h-20 bg-blue-50 rounded-full flex items-center justify-center mx-auto mb-6">
          <ShieldCheck className="w-10 h-10 text-blue-600" />
        </div>
        <h2 className="text-3xl font-black text-slate-900 mb-4">Card Listed Successfully!</h2>
        <p className="text-slate-600 mb-8 max-w-md mx-auto">
          Your gift card is now active in the marketplace. You will receive payment automatically to your wallet after the 24-hour hold period once sold.
        </p>
        <div className="flex flex-col sm:flex-row gap-3 justify-center">
          <button
            onClick={() => { setSuccess(false); setStep(1); }}
            className="px-6 py-3 bg-blue-600 hover:bg-blue-500 text-white rounded-xl font-bold transition-all"
          >
            List Another Card
          </button>
          <a href="/dashboard/seller" className="px-6 py-3 border border-slate-200 text-slate-700 rounded-xl font-bold hover:bg-slate-50 transition-all">
            Go to Dashboard →
          </a>
        </div>
      </motion.div>
    );
  }

  return (
    <div className="max-w-2xl mx-auto">
      {/* Progress bar */}
      <div className="flex justify-between items-center mb-10 px-2">
        {[1, 2].map((s) => (
          <React.Fragment key={s}>
            <div className={`w-10 h-10 rounded-full flex items-center justify-center font-bold text-sm transition-all ${
              step >= s ? 'bg-blue-600 text-white shadow-lg shadow-blue-600/30' : 'bg-slate-100 text-slate-400'
            }`}>
              {step > s ? '✓' : s}
            </div>
            {s === 1 && (
              <div className="flex-1 mx-4">
                <div className={`h-1 rounded-full transition-all duration-500 ${step > 1 ? 'bg-blue-600' : 'bg-slate-100'}`} />
              </div>
            )}
          </React.Fragment>
        ))}
      </div>

      <form onSubmit={handleSubmit(onSubmit)} className="bg-white rounded-[2rem] p-8 shadow-2xl border border-slate-100 overflow-hidden">
        {apiError && (
          <div className="mb-6 bg-red-50 border border-red-200 text-red-700 rounded-xl px-4 py-3 text-sm font-medium">
            {apiError}
          </div>
        )}

        <AnimatePresence mode="wait">
          {step === 1 ? (
            <motion.div key="step1" initial={{ x: 20, opacity: 0 }} animate={{ x: 0, opacity: 1 }} exit={{ x: -20, opacity: 0 }} className="space-y-6">
              <div>
                <h2 className="text-2xl font-black text-slate-900 mb-1">Card Details</h2>
                <p className="text-slate-500 text-sm">Provide details for the gift card you want to sell</p>
              </div>

              {/* Region selector */}
              <div className="space-y-2">
                <label className="text-xs font-bold text-slate-500 uppercase tracking-wider flex items-center gap-1.5">
                  <Globe className="w-3.5 h-3.5" /> Region & Currency
                </label>
                <div className="grid grid-cols-3 gap-2">
                  {REGIONS.map(r => (
                    <label key={r.code} className={`cursor-pointer flex flex-col items-center gap-1 p-3 rounded-xl border-2 transition-all ${
                      selectedRegion === r.code
                        ? 'border-blue-500 bg-blue-50'
                        : 'border-slate-200 bg-slate-50 hover:border-slate-300'
                    }`}>
                      <input type="radio" {...register('region')} value={r.code} className="sr-only" />
                      <span className="text-2xl">{r.flag}</span>
                      <span className="text-xs font-bold text-slate-700">{r.label}</span>
                      <span className="text-xs text-slate-500">{r.symbol} {r.currency}</span>
                    </label>
                  ))}
                </div>
                {errors.region && <p className="text-xs text-red-500 mt-1">{errors.region.message}</p>}
              </div>

              {/* Retailer */}
              <div className="space-y-2">
                <label className="text-xs font-bold text-slate-500 uppercase tracking-wider">Retailer</label>
                <select
                  {...register('retailer')}
                  className="w-full rounded-xl border border-slate-200 bg-slate-50 px-4 py-3 text-sm font-medium outline-none transition-all focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                >
                  <option value="">Select retailer…</option>
                  {RETAILERS.map(r => <option key={r.id} value={r.name}>{r.name}</option>)}
                </select>
                {errors.retailer && <p className="text-xs text-red-500 mt-1">{errors.retailer.message}</p>}
              </div>

                <div className="space-y-2 col-span-2">
                  <label className="text-xs font-bold text-slate-500 uppercase tracking-wider">Asking Price ({regionMeta.currency})</label>
                  <div className="relative">
                    <span className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400 font-bold text-sm">{regionMeta.symbol}</span>
                    <input
                      type="text" placeholder={`e.g. ${regionMeta.currency === 'GBP' ? '40' : '50'}`}
                      {...register('price')}
                      className="w-full rounded-xl border border-slate-200 bg-slate-50 pl-8 pr-4 py-3 text-sm font-medium outline-none focus:ring-2 focus:ring-blue-500"
                    />
                  </div>
                  {errors.price && <p className="text-xs text-red-500 mt-1">{errors.price.message}</p>}
                </div>

              {/* Upload */}
              <div className="p-6 border-2 border-dashed border-slate-200 rounded-2xl bg-slate-50/50 text-center group hover:border-blue-400 transition-colors">
                <input type="file" id="card-upload" className="hidden" onChange={(e) => setSelectedFile(e.target.files?.[0] || null)} />
                <label htmlFor="card-upload" className="cursor-pointer flex flex-col items-center">
                  <div className="w-12 h-12 bg-white rounded-xl shadow-sm flex items-center justify-center mb-3 group-hover:scale-110 transition-transform">
                    <Upload className="w-6 h-6 text-slate-400 group-hover:text-blue-600" />
                  </div>
                  <p className="text-sm font-bold text-slate-700">{selectedFile ? selectedFile.name : 'Upload card image (optional)'}</p>
                  <p className="text-xs text-slate-500 mt-1">PNG, JPG up to 100MB</p>
                </label>
              </div>

              <div className="relative py-2">
                <div className="absolute inset-0 flex items-center"><div className="w-full border-t border-slate-100" /></div>
                <div className="relative flex justify-center text-xs uppercase"><span className="bg-white px-3 text-slate-400 font-bold">Enter card details manually</span></div>
              </div>

              {/* Code & PIN */}
              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-2">
                  <label className="text-xs font-bold text-slate-500 uppercase tracking-wider">Gift Card Code *</label>
                  <input type="text" placeholder="Enter code" {...register('cardCode')}
                    className="w-full rounded-xl border border-slate-200 bg-slate-50 px-4 py-3 text-sm font-mono outline-none focus:ring-2 focus:ring-blue-500" />
                  {errors.cardCode && <p className="text-xs text-red-500 mt-1">{errors.cardCode.message}</p>}
                </div>
                <div className="space-y-2">
                  <label className="text-xs font-bold text-slate-500 uppercase tracking-wider">PIN (if any)</label>
                  <input type="text" placeholder="Enter PIN" {...register('pin')}
                    className="w-full rounded-xl border border-slate-200 bg-slate-50 px-4 py-3 text-sm font-mono outline-none focus:ring-2 focus:ring-blue-500" />
                </div>
              </div>

              <button type="button" onClick={nextStep}
                className="w-full bg-slate-900 hover:bg-slate-700 text-white h-14 rounded-xl text-base font-bold flex items-center justify-center gap-2 transition-all mt-2">
                Continue to Payout
                <ArrowRight className="w-5 h-5" />
              </button>
            </motion.div>

          ) : (
            <motion.div key="step2" initial={{ x: 20, opacity: 0 }} animate={{ x: 0, opacity: 1 }} exit={{ x: -20, opacity: 0 }} className="space-y-6">
              <div>
                <h2 className="text-2xl font-black text-slate-900 mb-1">Payout Information</h2>
                <p className="text-slate-500 text-sm">Where should we send your crypto payment?</p>
              </div>

              {/* Summary */}
              <div className="bg-slate-50 border border-slate-200 rounded-2xl p-4">
                <p className="text-xs font-bold text-slate-500 uppercase tracking-wider mb-3">Listing Summary</p>
                <div className="grid grid-cols-2 gap-2 text-sm">
                  <span className="text-slate-500">Region</span>
                  <span className="font-semibold text-slate-800">{regionMeta.flag} {regionMeta.label}</span>
                  <span className="text-slate-500">Currency</span>
                  <span className="font-semibold text-slate-800">{regionMeta.currency} ({regionMeta.symbol})</span>
                </div>
              </div>

              <div className="bg-blue-50 p-6 rounded-2xl border border-blue-100">
                <div className="flex items-center gap-3 mb-4">
                  <div className="w-10 h-10 bg-blue-600 rounded-xl flex items-center justify-center">
                    <Wallet className="w-5 h-5 text-white" />
                  </div>
                  <div>
                    <h3 className="font-bold text-slate-900">ETH / USDC Wallet Address</h3>
                    <p className="text-xs text-slate-500">ERC-20 compatible</p>
                  </div>
                </div>
                <input
                  type="text" placeholder="0x..."
                  {...register('sellerWallet')}
                  className="w-full rounded-xl border border-slate-200 bg-white px-4 py-4 text-sm font-mono outline-none focus:ring-2 focus:ring-blue-500"
                />
                {errors.sellerWallet && <p className="text-xs text-red-500 mt-2">{errors.sellerWallet.message}</p>}
              </div>

              <div className="flex items-start gap-3 p-4 bg-amber-50 rounded-xl border border-amber-100">
                <ShieldCheck className="w-5 h-5 text-amber-600 shrink-0 mt-0.5" />
                <p className="text-xs text-amber-700 leading-relaxed font-medium">
                  Funds are held in escrow for 24 hours after purchase to ensure buyer safety. Payouts are processed automatically after the hold period.
                </p>
              </div>

              <div className="flex gap-4 pt-2">
                <button type="button" onClick={prevStep}
                  className="flex-1 border border-slate-200 text-slate-600 h-14 rounded-xl font-bold flex items-center justify-center gap-2 hover:bg-slate-50 transition-all">
                  <ArrowLeft className="w-5 h-5" /> Back
                </button>
                <button type="submit" disabled={isSubmitting}
                  className="flex-[2] bg-blue-600 hover:bg-blue-500 text-white h-14 rounded-xl text-base font-bold flex items-center justify-center gap-2 transition-all shadow-lg shadow-blue-600/20 disabled:opacity-50">
                  {isSubmitting ? <Loader2 className="w-5 h-5 animate-spin" /> : (<>List Card for Sale <Plus className="w-5 h-5" /></>)}
                </button>
              </div>
            </motion.div>
          )}
        </AnimatePresence>
      </form>
    </div>
  );
}
