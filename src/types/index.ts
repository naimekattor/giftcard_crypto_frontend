/**
 * Global Type Definitions for Gift Card Marketplace
 * Anonymous and secure user data handling
 */

// ============ User & Auth Types ============
export type UserRole = 'buyer' | 'seller' | 'admin';

export interface User {
  id: string;
  userId: string; // Anonymous user ID (not email)
  role: UserRole;
  createdAt: string;
  updatedAt: string;
}

export interface AuthToken {
  accessToken: string;
  refreshToken?: string;
  expiresIn: number;
  tokenType: 'Bearer';
}

export interface AuthCredentials {
  username?: string; // Optional - can use generated ID
  password: string;
  role?: UserRole;
}

export interface AuthResponse {
  user: User;
  token: AuthToken;
}

// ============ Gift Card Types ============
export type CardStatus = 'pending' | 'verified' | 'listed' | 'sold' | 'rejected';
export type CardCondition = 'new' | 'used';

export interface GiftCard {
  id: string;
  retailerId: string;
  retailerName: string;
  denomination: number; // Original value
  sellingPrice: number; // Price seller is asking
  balance?: number; // Remaining balance if known
  condition: CardCondition;
  status: CardStatus;
  code?: string; // Encrypted or hidden until purchase
  sellerId: string; // Anonymous seller ID
  description?: string;
  images?: string[];
  file_path?: string;
  createdAt: string;
  updatedAt: string;
  expiryDate?: string;
}

export interface GiftCardListing extends GiftCard {
  seller?: {
    id: string;
    rating?: number;
    successRate?: number;
  };
}

// ============ Transaction Types ============
export type TransactionStatus =
  | 'pending'
  | 'payment_initiated'
  | 'payment_completed'
  | 'verified'
  | 'completed'
  | 'failed'
  | 'cancelled';

export type TransactionType = 'purchase' | 'sale' | 'refund';

export interface Transaction {
  id: string;
  type: TransactionType;
  status: TransactionStatus;
  giftCardId: string;
  buyerId: string;
  sellerId: string;
  amount: number; // Amount paid
  cryptoAmount?: string; // Amount in crypto
  cryptoType?: string; // BTC, ETH, etc.
  walletAddress?: string; // Buyer's wallet for crypto payment
  temporaryBalance?: number; // Balance received before verification
  verifiedBalance?: number; // Balance confirmed by admin
  verificationNotes?: string;
  completedAt?: string;
  failureReason?: string;
  createdAt: string;
  updatedAt: string;
}

// ============ Wallet Types ============
export interface Wallet {
  id: string;
  userId: string;
  balances: {
    temporary: number; // Pending balance from unverified transactions
    verified: number; // Confirmed balance
    available: number; // Can withdraw/use
  };
  totalEarnings: number; // For sellers
  totalSpent: number; // For buyers
  createdAt: string;
  updatedAt: string;
}

export interface WalletTransaction {
  id: string;
  walletId: string;
  type: 'credit' | 'debit';
  amount: number;
  description: string;
  relatedTransactionId?: string;
  balanceBefore: number;
  balanceAfter: number;
  createdAt: string;
}

// ============ Retailer Types ============
export interface Retailer {
  id: string;
  name: string;
  logo?: string;
  category: string; // e.g., 'Entertainment', 'Gaming', 'Shopping'
  isActive: boolean;
}

// ============ Admin & Verification Types ============
export interface VerificationRequest {
  id: string;
  giftCardId: string;
  sellerId: string;
  status: 'pending' | 'approved' | 'rejected';
  submittedBalance: number;
  verifiedBalance?: number;
  verificationMethod: 'api' | 'manual';
  notes?: string;
  verifiedBy?: string;
  verifiedAt?: string;
  createdAt: string;
  updatedAt: string;
}

export interface AdminStats {
  totalUsers: number;
  totalTransactions: number;
  totalVolume: number;
  pendingVerifications: number;
  fraudReports: number;
}

// ============ API Response Types ============
export interface ApiResponse<T = any> {
  success: boolean;
  data?: T;
  error?: string;
  message?: string;
  statusCode: number;
}

export interface PaginatedResponse<T> {
  data: T[];
  total: number;
  page: number;
  limit: number;
  hasMore: boolean;
}

// ============ Form Types ============
export interface LoginFormData {
  username?: string;
  password: string;
}

export interface SignupFormData {
  password: string;
  confirmPassword: string;
  role: UserRole;
  agreeToTerms: boolean;
}

export interface CreateGiftCardFormData {
  retailerId: string;
  denomination: number;
  sellingPrice: number;
  condition: CardCondition;
  description?: string;
  expiryDate?: string;
}

export interface BuyGiftCardFormData {
  giftCardId: string;
  cryptoType: string;
  walletAddress: string;
}

// ============ Filter & Search Types ============
export interface MarketplaceFilters {
  retailerId?: string;
  minPrice?: number;
  maxPrice?: number;
  condition?: CardCondition;
  sortBy?: 'price_asc' | 'price_desc' | 'newest' | 'rating';
  search?: string;
  page?: number;
  limit?: number;
}

// ============ Error Types ============
export class ApiError extends Error {
  constructor(
    public statusCode: number,
    public message: string,
    public code?: string
  ) {
    super(message);
    this.name = 'ApiError';
  }
}

export interface ValidationError {
  field: string;
  message: string;
}
