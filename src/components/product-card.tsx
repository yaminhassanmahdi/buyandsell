
"use client";
import Image from 'next/image';
import Link from 'next/link';
import type { Product } from '@/lib/types';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardFooter, CardHeader, CardTitle } from '@/components/ui/card';
import { ShoppingCart, Minus, Plus } from 'lucide-react';
import { useCart } from '@/contexts/cart-context';
import { CURRENCY_SYMBOL } from '@/lib/constants';

interface ProductCardProps {
  product: Product;
}

export function ProductCard({ product }: ProductCardProps) {
  const { cartItems, addToCart, updateQuantity } = useCart();

  const cartItem = cartItems.find(item => item.id === product.id);
  const currentQuantity = cartItem ? cartItem.quantity : 0;

  return (
    <Card className="flex flex-col overflow-hidden rounded-lg shadow-lg hover:shadow-xl transition-shadow duration-300">
      <Link href={`/products/${product.id}`} className="block">
        <CardHeader className="p-0">
          <div className="aspect-[4/3] relative w-full overflow-hidden">
            <Image
              src={product.imageUrl}
              alt={product.name}
              fill
              sizes="(max-width: 768px) 100vw, (max-width: 1200px) 50vw, 33vw"
              className="object-cover transition-transform duration-300 group-hover:scale-105"
              data-ai-hint={product.imageHint || "product image"}
            />
          </div>
        </CardHeader>
      </Link>
      <CardContent className="p-3">
        <Link href={`/products/${product.id}`} className="block">
          <CardTitle className="text-md font-semibold hover:text-primary transition-colors line-clamp-2 mb-1">
            {product.name}
          </CardTitle>
        </Link>
        <p className="text-lg font-bold text-primary">
          {CURRENCY_SYMBOL}{product.price.toFixed(2)}
        </p>
      </CardContent>
      <CardFooter className="p-3 border-t mt-auto">
        <div className="flex w-full items-center">
          {currentQuantity === 0 ? (
            <Button size="sm" onClick={() => addToCart(product, 1)} className="w-full h-9">
              <ShoppingCart className="mr-2 h-4 w-4" /> Add to Cart
            </Button>
          ) : (
            <div className="flex items-center justify-between w-full">
              <Button
                variant="outline"
                size="icon"
                onClick={() => updateQuantity(product.id, currentQuantity - 1)}
                className="h-9 w-9"
                aria-label="Decrease quantity"
                disabled={currentQuantity <= 0}
              >
                <Minus className="h-4 w-4" />
              </Button>
              <span className="text-base font-medium tabular-nums mx-2">
                {currentQuantity}
              </span>
              <Button
                variant="outline"
                size="icon"
                onClick={() => updateQuantity(product.id, currentQuantity + 1)}
                className="h-9 w-9"
                aria-label="Increase quantity"
              >
                <Plus className="h-4 w-4" />
              </Button>
            </div>
          )}
        </div>
      </CardFooter>
    </Card>
  );
}

    