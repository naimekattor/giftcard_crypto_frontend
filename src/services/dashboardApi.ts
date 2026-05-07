/**
 * Dashboard API service for buyer and seller endpoints
 */

const API_BASE = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:4000';

async function authFetch<T>(path: string, token: string, options: RequestInit = {}): Promise<T> {
  const res = await fetch(`${API_BASE}${path}`, {
    ...options,
    headers: {
      'Content-Type': 'application/json',
      Authorization: `Bearer ${token}`,
      ...options.headers,
    },
  });
  const json = await res.json();
  if (!res.ok) {
    const errorMessage = json.error || 'Request failed';
    const details = json.details ? ` (${json.details.join(', ')})` : '';
    throw new Error(errorMessage + details);
  }
  return json as T;
}

// ── Types ───────────────────────────────────────────────────────────────────
export interface CardRecord {
  id: number;
  name: string;
  retailer: string;
  denomination: number;
  price: number;
  status: string;
  region?: string;
  currency?: string;
  createdAt: string;
  card_code?: string;
  card_pin?: string;
  file_path?: string;
}

export interface PaymentRecord {
  id: number;
  card_id: number;
  amount: number;
  status: 'pending' | 'holding' | 'completed' | 'returned';
  complaint_status: 'none' | 'complained' | 'valid';
  external_id?: string;
  created_at?: string;
  card?: CardRecord;
}

// ── Buyer ────────────────────────────────────────────────────────────────────
export const buyerApi = {
  getPayments: (token: string) =>
    authFetch<PaymentRecord[]>('/buyer/payments', token),

  complain: (token: string, paymentId: number) =>
    authFetch<{ message: string; refund_tx_hash?: string }>(
      `/buyer/payments/${paymentId}/complain`,
      token,
      { method: 'POST' }
    ),

  confirm: (token: string, paymentId: number) =>
    authFetch<{ message: string }>(
      `/buyer/payments/${paymentId}/confirm`,
      token,
      { method: 'POST' }
    ),

  buyCard: (token: string, cardId: number, walletAddress?: string) =>
    authFetch<{ 
      payment_id: number; 
      amount?: number;
      eth_amount?: number;
      pay_to: string; 
      asset: string;
    }>(
      '/buy',
      token,
      { 
        method: 'POST',
        body: JSON.stringify({ card_id: cardId, wallet_address: walletAddress })
      }
    ),
};

// ── Seller ───────────────────────────────────────────────────────────────────
export const sellerApi = {
  getCards: (token: string) =>
    authFetch<CardRecord[]>('/seller/cards', token),

  cancelCard: (token: string, cardId: number) =>
    authFetch<{ message: string }>(
      `/seller/cards/${cardId}/cancel`,
      token,
      { method: 'POST' }
    ),
};

// ── Exchange rates ────────────────────────────────────────────────────────────
export interface ExchangeRates {
  GBP: number;
  USD: number;
  CAD: number;
  [key: string]: number;
}

export async function fetchExchangeRates(): Promise<ExchangeRates> {
  const res = await fetch(`${API_BASE}/exchange-rates`);
  if (!res.ok) throw new Error('Failed to load exchange rates');
  return res.json();
}
