/**
 * GiftCardCard Component
 * Card displaying a single gift card listing
 */

'use client';

import React from 'react';
import Link from 'next/link';
import { Card, CardBody, CardFooter } from '@/components/ui/Card';
import { Badge } from '@/components/ui/Badge';
import { Button } from '@/components/ui/Button';
import {
  formatCurrency,
  calculateDiscount,
  getStatusColor,
} from '@/lib/utils';
import { getRetailerName } from '@/constants/retailers';
import type { GiftCardListing } from '@/types';

interface GiftCardCardProps {
  card: GiftCardListing;
  onBuy?: (cardId: string) => void;
}

export const GiftCardCard: React.FC<GiftCardCardProps> = ({ card, onBuy }) => {
  const discount = calculateDiscount(card.denomination, card.sellingPrice);
  const statusColor = getStatusColor(card.status);

  return (
    <Card variant="elevated" className="h-full flex flex-col">
      <CardBody>
        {/* Header */}
        <div className="flex justify-between items-start mb-3">
          <div>
            <h3 className="font-bold text-lg text-foreground">
              {getRetailerName(card.retailerId)}
            </h3>
            <p className="text-sm text-muted-foreground">
              {card.denomination} {card.condition === 'used' ? '(Used)' : '(New)'}
            </p>
          </div>
          <Badge variant={statusColor === 'green' ? 'success' : statusColor === 'yellow' ? 'warning' : 'error'}>
            {card.status}
          </Badge>
        </div>

        {/* Pricing */}
        <div className="mb-3">
          <div className="flex items-baseline gap-2">
            <span className="text-2xl font-bold text-brand">
              {formatCurrency(card.sellingPrice)}
            </span>
            <span className="text-sm text-muted-foreground line-through">
              {formatCurrency(card.denomination)}
            </span>
            <Badge variant="success" className="text-xs">
              {discount}% off
            </Badge>
          </div>
        </div>

        {/* Description */}
        {card.description && (
          <p className="text-sm text-muted-foreground mb-3 line-clamp-2">
            {card.description}
          </p>
        )}

        {/* Seller Info */}
        {card.seller && (
          <div className="text-xs text-muted-foreground mb-3">
            <p>
              Seller Rating: ⭐ {card.seller.rating || 'N/A'} ({card.seller.successRate || 0}% success rate)
            </p>
          </div>
        )}
      </CardBody>

      <CardFooter className="mt-auto">
        {card.status === 'listed' ? (
          <Link href={`/buy-gift-cards/${card.id}`} className="w-full">
            <Button fullWidth>View Details</Button>
          </Link>
        ) : (
          <Button fullWidth disabled>
            {card.status === 'sold' ? 'Sold' : 'Unavailable'}
          </Button>
        )}
      </CardFooter>
    </Card>
  );
};
