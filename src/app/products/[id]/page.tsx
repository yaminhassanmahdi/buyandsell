
"use client";
import Image from 'next/image';
import { useParams, useRouter } from 'next/navigation';
import { MOCK_PRODUCTS } from '@/lib/mock-data';
import type { Product } from '@/lib/types';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { useCart } from '@/contexts/cart-context';
import { ArrowLeft, ShoppingCart, UserCircle, CalendarDays } from 'lucide-react';
import { QuantitySelector } from '@/components/quantity-selector';
import React, { useEffect, useState } from 'react';
import { Skeleton } from '@/components/ui/skeleton';
import { format } from 'date-fns';


export default function ProductDetailPage() {
  const params = useParams();
  const router = useRouter();
  const { addToCart } = useCart();
  const [product, setProduct] = useState<Product | null | undefined>(undefined); // undefined for loading state
  const [quantity, setQuantity] = useState(1);

  useEffect(() => {
    if (params.id) {
      // Simulate API call
      setTimeout(() => {
        const foundProduct = MOCK_PRODUCTS.find(p => p.id === params.id);
        setProduct(foundProduct || null); // null if not found
      }, 300);
    }
  }, [params.id]);

  if (product === undefined) { // Loading state
    return (
      <div className="container mx-auto px-4 py-8">
        <Skeleton className="h-8 w-32 mb-6" />
        <Card className="overflow-hidden">
          <div className="grid md:grid-cols-2 gap-6 lg:gap-12 items-start">
            <Skeleton className="aspect-square w-full rounded-lg" />
            <div className="p-6">
              <Skeleton className="h-10 w-3/4 mb-2" />
              <Skeleton className="h-6 w-1/4 mb-4" />
              <Skeleton className="h-24 w-full mb-4" />
              <Skeleton className="h-6 w-1/2 mb-2" />
              <Skeleton className="h-6 w-1/3 mb-6" />
              <Skeleton className="h-12 w-full" />
            </div>
          </div>
        </Card>
      </div>
    );
  }

  if (!product) {
    return (
      <div className="container mx-auto px-4 py-8 text-center">
        <h1 className="text-2xl font-semibold">Product not found</h1>
        <Button onClick={() => router.push('/')} className="mt-4">Go to Homepage</Button>
      </div>
    );
  }
  
  const handleAddToCart = () => {
    addToCart(product, quantity);
  };

  return (
    <div className="container mx-auto px-4 py-8">
      <Button variant="outline" onClick={() => router.back()} className="mb-6">
        <ArrowLeft className="mr-2 h-4 w-4" /> Back
      </Button>
      <Card className="overflow-hidden shadow-xl rounded-xl">
        <div className="grid md:grid-cols-2 gap-0 items-start">
          <div className="aspect-square relative w-full overflow-hidden md:rounded-l-xl">
            <Image
              src={product.imageUrl}
              alt={product.name}
              fill
              priority
              sizes="(max-width: 768px) 100vw, 50vw"
              className="object-cover"
              data-ai-hint={product.imageHint || "product item"}
            />
          </div>
          <div className="p-6 md:p-8 flex flex-col h-full">
            <CardHeader className="p-0 mb-4">
              <div className="flex items-center gap-2 mb-2">
                <Badge variant="secondary">{product.category.name}</Badge>
                <Badge variant="outline">{product.brand.name}</Badge>
              </div>
              <CardTitle className="text-3xl font-bold">{product.name}</CardTitle>
            </CardHeader>
            
            <CardContent className="p-0 flex-grow">
              <CardDescription className="text-base text-foreground/80 mb-4">
                {product.description}
              </CardDescription>
              
              <div className="flex items-center gap-2 text-sm text-muted-foreground mb-1">
                <UserCircle className="h-4 w-4" />
                <span>Sold by: {product.sellerName || 'Unknown Seller'}</span>
              </div>
              <div className="flex items-center gap-2 text-sm text-muted-foreground mb-4">
                <CalendarDays className="h-4 w-4" />
                <span>Listed on: {format(new Date(product.createdAt), 'MMMM d, yyyy')}</span>
              </div>

              <p className="text-4xl font-extrabold text-primary mb-6">
                ${product.price.toFixed(2)}
              </p>
            </CardContent>

            <CardFooter className="p-0 mt-auto">
              <div className="flex flex-col sm:flex-row gap-4 w-full">
                <QuantitySelector quantity={quantity} setQuantity={setQuantity} maxQuantity={10} />
                <Button size="lg" onClick={handleAddToCart} className="w-full sm:w-auto flex-grow">
                  <ShoppingCart className="mr-2 h-5 w-5" /> Add to Cart
                </Button>
              </div>
            </CardFooter>
          </div>
        </div>
      </Card>
    </div>
  );
}
