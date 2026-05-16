/**
 * App-wide Constants
 */

export const APP_NAME = 'GiftCard Market';
export const APP_VERSION = '1.0.0';

// API Configuration
export const API_BASE_URL = process.env.NEXT_PUBLIC_API_BASE_URL || 'http://localhost:3001/api';
export const API_TIMEOUT = 30000; // 30 seconds

// Authentication
export const TOKEN_STORAGE_KEY = 'gc_auth_token';
export const REFRESH_TOKEN_KEY = 'gc_refresh_token';
export const USER_STORAGE_KEY = 'gc_user';
export const TOKEN_EXPIRY_THRESHOLD = 5 * 60 * 1000; // 5 minutes before expiry

// Pagination
export const DEFAULT_PAGE_SIZE = 20;
export const MAX_PAGE_SIZE = 100;

// Transaction States
export const TRANSACTION_STATES = {
  PENDING: 'pending',
  PAYMENT_INITIATED: 'payment_initiated',
  PAYMENT_COMPLETED: 'payment_completed',
  VERIFIED: 'verified',
  COMPLETED: 'completed',
  FAILED: 'failed',
  CANCELLED: 'cancelled',
} as const;

// Gift Card States
export const CARD_STATES = {
  PENDING: 'pending',
  VERIFIED: 'verified',
  LISTED: 'listed',
  SOLD: 'sold',
  REJECTED: 'rejected',
} as const;

// Crypto Types
export const SUPPORTED_CRYPTOS = [
  { symbol: 'BTC', name: 'Bitcoin', minAmount: 0.001 },
  { symbol: 'ETH', name: 'Ethereum', minAmount: 0.05 },
  { symbol: 'USDT', name: 'Tether USD', minAmount: 10 },
  { symbol: 'USDC', name: 'USD Coin', minAmount: 10 },
  { symbol: 'SOL', name: 'Solana', minAmount: 0.1 },
] as const;

// Routes
export const ROUTES = {
  HOME: '/',
  LOGIN: '/login',
  SIGNUP: '/signup',
  MARKETPLACE: '/buy-gift-cards',
  DASHBOARD_BUYER: '/buyer/dashboard',
  DASHBOARD_SELLER: '/seller/dashboard',
  DASHBOARD_ADMIN: '/admin/dashboard',
  WALLET: '/wallet',
  TRANSACTIONS: '/transactions',
} as const;

// Error Messages
export const ERROR_MESSAGES = {
  UNAUTHORIZED: 'Unauthorized. Please log in.',
  FORBIDDEN: 'You do not have permission to access this resource.',
  NOT_FOUND: 'Resource not found.',
  VALIDATION_ERROR: 'Validation error. Please check your input.',
  SERVER_ERROR: 'Server error. Please try again later.',
  NETWORK_ERROR: 'Network error. Please check your connection.',
  INVALID_CREDENTIALS: 'Invalid credentials. Please try again.',
  PAYMENT_FAILED: 'Payment failed. Please try again.',
  INSUFFICIENT_BALANCE: 'Insufficient balance.',
} as const;

// Success Messages
export const SUCCESS_MESSAGES = {
  LOGIN_SUCCESS: 'Successfully logged in.',
  SIGNUP_SUCCESS: 'Account created successfully.',
  CARD_LISTED: 'Gift card listed successfully.',
  PURCHASE_INITIATED: 'Purchase initiated. Please complete payment.',
  VERIFICATION_SUBMITTED: 'Verification submitted successfully.',
} as const;

// Validation Rules
export const VALIDATION_RULES = {
  PASSWORD_MIN_LENGTH: 8,
  PASSWORD_REGEX: /^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)/,
  MAX_DESCRIPTION_LENGTH: 500,
  MAX_FILE_SIZE: 5 * 1024 * 1024, // 5MB
} as const;

// Time Constants (in milliseconds)
export const TIME_CONSTANTS = {
  VERIFICATION_TIMEOUT: 24 * 60 * 60 * 1000, // 24 hours
  PAYMENT_TIMEOUT: 30 * 60 * 1000, // 30 minutes
  SESSION_TIMEOUT: 12 * 60 * 60 * 1000, // 12 hours
} as const;

// UI Constants
export const TOAST_DURATION = 3000; // 3 seconds
export const MODAL_ANIMATION_DURATION = 300; // 300ms
