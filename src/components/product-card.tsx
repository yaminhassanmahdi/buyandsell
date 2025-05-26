
"use client";
import Image from 'next/image';
import Link from 'next/link';
import type { Product } from '@/lib/types';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardFooter, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { ShoppingCart, Eye } from 'lucide-react';
import { useCart } from '@/contexts/cart-context';
import { Badge } from '@/components/ui/badge';

interface ProductCardProps {
  product: Product;
}

export function ProductCard({ product }: ProductCardProps) {
  const { addToCart } = useCart();

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
      <CardContent className="p-4 flex-grow">
        <div className="mb-2">
          <Badge variant="secondary" className="mr-2">{product.category.name}</Badge>
          <Badge variant="outline">{product.brand.name}</Badge>
        </div>
        <Link href={`/products/${product.id}`} className="block">
          <CardTitle className="text-lg font-semibold hover:text-primary transition-colors">
            {product.name}
          </CardTitle>
        </Link>
        <CardDescription className="mt-1 text-sm text-muted-foreground truncate">
          {product.description}
        </CardDescription>
        <p className="mt-2 text-xl font-bold text-primary">
          ${product.price.toFixed(2)}
        </p>
      </CardContent>
      <CardFooter className="p-4 border-t">
        <div className="flex w-full items-center justify-between gap-2">
          <Button variant="outline" size="sm" asChild>
            <Link href={`/products/${product.id}`}>
              <Eye className="mr-2 h-4 w-4" /> View
            </Link>
          </Button>
          <Button size="sm" onClick={() => addToCart(product)}>
            <ShoppingCart className="mr-2 h-4 w-4" /> Add to Cart
          </Button>
        </div>
      </CardFooter>
    </Card>
  );
}
