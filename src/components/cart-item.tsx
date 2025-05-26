
"use client";
import Image from 'next/image';
import type { CartItem as CartItemType } from '@/lib/types';
import { Button } from '@/components/ui/button';
import { useCart } from '@/contexts/cart-context';
import { X, Minus, Plus } from 'lucide-react';
import Link from 'next/link';
import { QuantitySelector } from './quantity-selector';

interface CartItemProps {
  item: CartItemType;
}

export function CartItem({ item }: CartItemProps) {
  const { removeFromCart, updateQuantity } = useCart();

  return (
    <div className="flex items-center gap-4 py-4 border-b last:border-b-0">
      <Link href={`/products/${item.id}`} className="shrink-0">
        <Image
          src={item.imageUrl}
          alt={item.name}
          width={80}
          height={80}
          className="rounded-md object-cover aspect-square"
          data-ai-hint="product item"
        />
      </Link>
      <div className="flex-grow">
        <Link href={`/products/${item.id}`}>
          <h3 className="font-semibold hover:text-primary transition-colors">{item.name}</h3>
        </Link>
        <p className="text-sm text-muted-foreground">Price: ${item.price.toFixed(2)}</p>
         <div className="mt-2">
          <QuantitySelector 
            quantity={item.quantity} 
            setQuantity={(q) => updateQuantity(item.id, q)}
          />
        </div>
      </div>
      <div className="text-right">
        <p className="font-semibold">${(item.price * item.quantity).toFixed(2)}</p>
        <Button
          variant="ghost"
          size="icon"
          className="mt-1 text-muted-foreground hover:text-destructive"
          onClick={() => removeFromCart(item.id)}
          aria-label="Remove item from cart"
        >
          <X className="h-4 w-4" />
        </Button>
      </div>
    </div>
  );
}
