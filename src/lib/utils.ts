import { clsx, type ClassValue } from 'clsx';
import { twMerge } from 'tailwind-merge';

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs));
}

/**
 * Format currency with appropriate symbol
 */
export const formatCurrency = (
  amount: number,
  currency: string = 'USD',
  locale: string = 'en-US'
): string => {
  return new Intl.NumberFormat(locale, {
    style: 'currency',
    currency,
  }).format(amount);
};

/**
 * Format large numbers with compact notation
 */
export const formatCompactNumber = (num: number): string => {
  return new Intl.NumberFormat('en-US', {
    notation: 'compact',
    maximumFractionDigits: 1,
  }).format(num);
};

/**
 * Format date to readable string
 */
export const formatDate = (
  date: string | Date,
  format: 'short' | 'long' | 'full' = 'short'
): string => {
  const d = typeof date === 'string' ? new Date(date) : date;

  const formats = {
    short: {
      year: 'numeric' as const,
      month: '2-digit' as const,
      day: '2-digit' as const,
    },
    long: {
      year: 'numeric' as const,
      month: 'long' as const,
      day: 'numeric' as const,
    },
    full: {
      year: 'numeric' as const,
      month: 'long' as const,
      day: 'numeric' as const,
      hour: '2-digit' as const,
      minute: '2-digit' as const,
    },
  };

  return d.toLocaleDateString('en-US', formats[format]);
};

/**
 * Truncate string with ellipsis
 */
export const truncateString = (str: string, maxLength: number): string => {
  if (str.length <= maxLength) return str;
  return str.slice(0, maxLength - 3) + '...';
};

/**
 * Mask sensitive data (e.g., wallet address)
 */
export const maskSensitiveData = (
  data: string,
  visibleChars: number = 4
): string => {
  if (data.length <= visibleChars * 2) return data;
  const start = data.slice(0, visibleChars);
  const end = data.slice(-visibleChars);
  return `${start}${'*'.repeat(Math.max(4, data.length - visibleChars * 2))}${end}`;
};

/**
 * Generate anonymous user ID
 */
export const generateAnonymousId = (): string => {
  return `user_${Date.now()}_${Math.random().toString(36).substring(2, 9)}`;
};

/**
 * Check if user is authenticated
 */
export const isAuthenticated = (): boolean => {
  return !!getAuthToken();
};

/**
 * Get stored auth token
 */
export const getAuthToken = (): string | null => {
  if (typeof window === 'undefined') return null;
  
  // Try gc_jwt_user first (which contains the current logged-in user object)
  const saved = localStorage.getItem('gc_jwt_user');
  if (saved) {
    try {
      const user = JSON.parse(saved);
      if (user && user.token) return user.token;
    } catch (_) {}
  }
  
  // Fallback to legacy gc_auth_token
  return localStorage.getItem('gc_auth_token');
};

/**
 * Get Authorization header
 */
export const getAuthHeader = (): Record<string, string> => {
  const token = getAuthToken();
  if (!token) return {};
  return {
    Authorization: `Bearer ${token}`,
  };
};

/**
 * Clear auth tokens
 */
export const clearAuthTokens = (): void => {
  if (typeof window === 'undefined') return;
  localStorage.removeItem('gc_jwt_user');
  localStorage.removeItem('gc_auth_token');
  localStorage.removeItem('gc_refresh_token');
  localStorage.removeItem('gc_user');
  document.cookie = 'gc_jwt_user=; path=/; max-age=0; SameSite=Lax;';
};

/**
 * Sleep utility for async delays
 */
export const sleep = (ms: number): Promise<void> => {
  return new Promise((resolve) => setTimeout(resolve, ms));
};

/**
 * Debounce function
 */
export function debounce<T extends (...args: any[]) => any>(
  func: T,
  wait: number
): (...args: Parameters<T>) => void {
  let timeout: ReturnType<typeof setTimeout> | null = null;

  return function executedFunction(...args: Parameters<T>) {
    const later = () => {
      timeout = null;
      func(...args);
    };

    if (timeout) clearTimeout(timeout);
    timeout = setTimeout(later, wait);
  };
}

/**
 * Throttle function
 */
export function throttle<T extends (...args: any[]) => any>(
  func: T,
  limit: number
): (...args: Parameters<T>) => void {
  let inThrottle: boolean;

  return function (...args: Parameters<T>) {
    if (!inThrottle) {
      func(...args);
      inThrottle = true;
      setTimeout(() => (inThrottle = false), limit);
    }
  };
}

/**
 * Validate email format (basic)
 */
export const isValidEmail = (email: string): boolean => {
  const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
  return emailRegex.test(email);
};

/**
 * Validate wallet address format (basic)
 */
export const isValidWalletAddress = (address: string, cryptoType: string): boolean => {
  // Basic validation - enhance based on actual crypto requirements
  const minLength = cryptoType === 'BTC' ? 26 : cryptoType === 'ETH' ? 42 : 20;
  return address.length >= minLength && /^[a-zA-Z0-9]+$/.test(address);
};

/**
 * Calculate price difference
 */
export const calculateDiscount = (original: number, selling: number): number => {
  return Math.round(((original - selling) / original) * 100);
};

/**
 * Get status color for UI
 */
export const getStatusColor = (
  status: string
): 'green' | 'yellow' | 'red' | 'blue' | 'gray' => {
  const colorMap: Record<string, 'green' | 'yellow' | 'red' | 'blue' | 'gray'> = {
    completed: 'green',
    verified: 'green',
    pending: 'yellow',
    payment_initiated: 'blue',
    payment_completed: 'blue',
    failed: 'red',
    cancelled: 'red',
    rejected: 'red',
  };
  return colorMap[status] || 'gray';
};

/**
 * Deep clone object
 */
export const deepClone = <T>(obj: T): T => {
  return JSON.parse(JSON.stringify(obj));
};

/**
 * Check if object is empty
 */
export const isEmpty = (obj: Record<string, any>): boolean => {
  return Object.keys(obj).length === 0;
};
