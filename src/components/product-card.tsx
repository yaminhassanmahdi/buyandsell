
"use client";
import Image from 'next/image';
import Link from 'next/link';
import type { Product } from '@/lib/types';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardFooter, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { ShoppingCart, Minus, Plus } from 'lucide-react'; // Added Minus and Plus
import { useCart } from '@/contexts/cart-context';
import { Badge } from '@/components/ui/badge';

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
      {/* Removed flex-grow to prevent excessive height, content will determine its height */}
      <CardContent className="p-4">
        <div className="mb-2">
          <Badge variant="secondary" className="mr-2">{product.category.name}</Badge>
          <Badge variant="outline">{product.brand.name}</Badge>
        </div>
        <Link href={`/products/${product.id}`} className="block">
          <CardTitle className="text-lg font-semibold hover:text-primary transition-colors">
            {product.name}
          </CardTitle>
        </Link>
        {/* Using line-clamp to control description height and maintain consistency */}
        <CardDescription className="mt-1 text-sm text-muted-foreground line-clamp-2">
          {product.description}
        </CardDescription>
        <p className="mt-2 text-xl font-bold text-primary">
          ${product.price.toFixed(2)}
        </p>
      </CardContent>
      {/* Added mt-auto to push footer to bottom if card is in a flex column and has space */}
      <CardFooter className="p-4 border-t mt-auto">
        <div className="flex w-full items-center">
          {currentQuantity === 0 ? (
            <Button size="sm" onClick={() => addToCart(product, 1)} className="w-full">
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
                disabled={currentQuantity <= 0} // Technically handled by updateQuantity, but good for UI
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
