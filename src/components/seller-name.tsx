"use client";

import Link from 'next/link';
import { User } from 'lucide-react';
import { cn } from '@/lib/utils';

interface SellerNameProps {
  sellerId: string;
  sellerName: string;
  className?: string;
  showIcon?: boolean;
  variant?: 'default' | 'subtle' | 'link';
}

export function SellerName({ 
  sellerId, 
  sellerName, 
  className = '',
  showIcon = false,
  variant = 'default'
}: SellerNameProps) {
  const baseClasses = "transition-colors hover:text-primary";
  
  const variantClasses = {
    default: "text-sm font-medium text-muted-foreground hover:text-primary",
    subtle: "text-xs text-muted-foreground/70 hover:text-primary/80",
    link: "text-sm text-primary hover:text-primary/80 underline decoration-dotted underline-offset-2"
  };

  const classes = cn(
    baseClasses,
    variantClasses[variant],
    className
  );

  // Validate sellerId before creating link
  if (!sellerId || sellerId === 'undefined' || sellerId.trim() === '') {
    return (
      <span className={cn(classes, "cursor-default opacity-50")}>
        {showIcon && <User className="inline h-3 w-3 mr-1" />}
        {sellerName || 'Unknown Seller'}
      </span>
    );
  }

  return (
    <Link 
      href={`/seller/${sellerId}`}
      className={classes}
      title={`View ${sellerName}'s profile`}
    >
      {showIcon && <User className="inline h-3 w-3 mr-1" />}
      {sellerName}
    </Link>
  );
}
