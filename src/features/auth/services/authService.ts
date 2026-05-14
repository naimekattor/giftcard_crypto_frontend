/**
 * Authentication Service
 * Email/password JWT auth against our Express backend
 */

const API_BASE = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:4000';

export interface LoginPayload { email: string; password: string; }
export interface RegisterPayload { email: string; password: string; role: 'buyer' | 'seller'; }
export interface AuthResult { token: string; role: string; email: string; }

async function request<T>(path: string, options: RequestInit): Promise<T> {
  const res = await fetch(`${API_BASE}${path}`, {
    headers: { 'Content-Type': 'application/json' },
    ...options,
  });
  const json = await res.json();
  if (!res.ok) throw new Error(json.error || 'Request failed');
  return json as T;
}

export const authService = {
  async login(payload: LoginPayload): Promise<AuthResult> {
    return request<AuthResult>('/auth/login', {
      method: 'POST',
      body: JSON.stringify(payload),
    });
  },

  async register(payload: RegisterPayload): Promise<{ message: string; id: number }> {
    return request('/auth/register', {
      method: 'POST',
      body: JSON.stringify(payload),
    });
  },

  async verifyEmail(email: string, code: string): Promise<{ message: string }> {
    return request('/auth/verify', {
      method: 'POST',
      body: JSON.stringify({ email, code }),
    });
  },

  async resendVerification(email: string): Promise<{ message: string }> {
    return request('/auth/resend-verification', {
      method: 'POST',
      body: JSON.stringify({ email }),
    });
  },

  async forgotPassword(email: string): Promise<{ message: string }> {
    return request('/auth/forgot-password', {
      method: 'POST',
      body: JSON.stringify({ email }),
    });
  },

  async resetPassword(payload: { email: string; code: string; newPassword: string }): Promise<{ message: string }> {
    return request('/auth/reset-password', {
      method: 'POST',
      body: JSON.stringify(payload),
    });
  },
};
