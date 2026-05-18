'use client';
import React from 'react';
import Link from 'next/link';
import { Button } from '@/components/ui/Button';
import { Card, CardBody } from '@/components/ui/Card';
import { Lock, Zap, ShieldCheck, TrendingUp, Store, DollarSign, Users, Sparkles, Bitcoin } from 'lucide-react';
import HomePage from '@/components/Home/HomePage';

export default function Home() {

  return (
    <div className="min-h-screen bg-white">
      <HomePage/>
    </div>
  );
}