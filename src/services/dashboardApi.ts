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
  if (!res.ok) throw new Error(json.error || 'Request failed');
  return json as T;
}

// ── Types ───────────────────────────────────────────────────────────────────
export interface CardRecord {
  id: number;
  name: string;
  retailer: string;
  denomination: number;
  price: number;
  status: 'active' | 'sold' | 'cancelled';
  region: string;
  currency: string;
  created_at?: string;
}

export interface PaymentRecord {
  id: number;
  amount: number;
  status: 'pending' | 'holding' | 'completed' | 'returned';
  complaint_status: 'none' | 'complained' | 'valid';
  created_at: string;
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
