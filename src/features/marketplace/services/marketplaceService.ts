/**
 * Marketplace Service
 * Handles gift card listing, searching, and browsing
 */

import type {
  GiftCardListing,
  PaginatedResponse,
  MarketplaceFilters,
} from '@/types';

const API_BASE_URL = `${process.env.NEXT_PUBLIC_API_URL}`;

export const marketplaceService = {
  /**
   * Browse all available gift cards
   */
  async browseCards(
    filters?: MarketplaceFilters
  ): Promise<PaginatedResponse<GiftCardListing>> {
    try {
      const response = await fetch(`${API_BASE_URL}/cards`);
      if (!response.ok) throw new Error('Failed to fetch cards');
      
      const cards = await response.json();
      
      // Map backend response to GiftCardListing type
      const mappedCards: GiftCardListing[] = cards.map((card: any) => ({
        id: String(card.id),
        retailerId: card.retailer ? card.retailer.toLowerCase().replace(/ /g, '-') : 'unknown',
        retailerName: card.retailer || 'Unknown Retailer',
        retailer: card.retailer, // compatibility with page.tsx
        denomination: card.denomination || card.price,
        sellingPrice: card.price,
        price: card.price, // compatibility with page.tsx
        condition: 'new',
        status: card.status,
        region: card.region,
        currency: card.currency,
        seller_asking_price: card.seller_asking_price,
        createdAt: new Date().toISOString(),
        description: card.description,
        sellerId: 'anonymous',
        seller: {
          id: 'anonymous',
          rating: 4.9,
          successRate: 99,
        }
      }));

      // Apply frontend filters if any (search, sorting, etc.)
      let filteredCards = [...mappedCards];
      if (filters?.search) {
        const searchLower = filters.search.toLowerCase();
        filteredCards = filteredCards.filter(c => 
          c.retailerName.toLowerCase().includes(searchLower) ||
          c.description?.toLowerCase().includes(searchLower)
        );
      }

      // Pagination
      const page = filters?.page ?? 1;
      const limit = filters?.limit ?? 12;
      const start = (page - 1) * limit;
      const end = start + limit;
      const paginatedCards = filteredCards.slice(start, end);

      return {
        data: paginatedCards,
        total: filteredCards.length,
        page,
        limit,
        hasMore: end < filteredCards.length,
      };
    } catch (error) {
      console.error('Error fetching cards:', error);
      return {
        data: [],
        total: 0,
        page: 1,
        limit: 12,
        hasMore: false,
      };
    }
  },

  /**
   * Get single gift card details
   */
  async getCardDetails(cardId: string): Promise<GiftCardListing> {
    const response = await this.browseCards();
    const card = response.data.find((c) => c.id === cardId);
    if (!card) {
      throw new Error('Card not found');
    }
    return card;
  },

  /**
   * Get seller profile (anonymous)
   */
  async getSellerProfile(
    _sellerId: string
  ): Promise<{ id: string; rating: number; successRate: number }> {
    return {
      id: 'anonymous',
      rating: 4.9,
      successRate: 99,
    };
  },

  /**
   * Search cards with query
   */
  async searchCards(
    query: string,
    page: number = 1
  ): Promise<PaginatedResponse<GiftCardListing>> {
    return this.browseCards({ search: query, page, limit: 12 });
  },

  /**
   * Get trending cards
   */
  async getTrendingCards(): Promise<GiftCardListing[]> {
    const response = await this.browseCards();
    return response.data.slice(0, 6);
  },

  /**
   * Get filter options
   */
  async getFilterOptions(): Promise<{
    retailers: Array<{ id: string; name: string }>;
    conditions: string[];
    priceRange: { min: number; max: number };
  }> {
    const response = await this.browseCards();
    const cards = response.data;
    
    const retailers = Array.from(
      new Set(cards.map((c) => c.retailerId))
    ).map((id) => ({
      id,
      name: cards.find((c) => c.retailerId === id)?.retailerName || id,
    }));

    const conditions = ['new', 'used'];
    const prices = cards.length > 0 ? cards.map((c) => c.sellingPrice) : [0];
    const priceRange = {
      min: Math.min(...prices),
      max: Math.max(...prices),
    };

    return { retailers, conditions, priceRange };
  },
};
