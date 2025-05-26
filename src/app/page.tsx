
"use client";
import React, { useState, useMemo, useEffect } from 'react';
import { ProductCard } from '@/components/product-card';
import { MOCK_PRODUCTS, MOCK_CATEGORIES } from '@/lib/mock-data'; // Updated import
import type { Product, Category as CategoryType } from '@/lib/types';
// import { CATEGORIES } from '@/lib/constants'; // Old import removed
import { Alert, AlertDescription, AlertTitle } from '@/components/ui/alert';
import { SearchX, ArrowRight } from 'lucide-react';
import { Skeleton } from '@/components/ui/skeleton';
import { Card, CardContent, CardFooter } from '@/components/ui/card'; // Card import was missing here too
import { Button } from '@/components/ui/button';
import Link from 'next/link';
import { CategoryBar } from '@/components/category-bar';
import { HeroBanner } from '@/components/hero-banner';
import { useSearchParams } from 'next/navigation';

const PRODUCTS_PER_CATEGORY_HOME = 4; // Number of products to show per category section

export default function HomePage() {
  const searchParams = useSearchParams();
  const selectedCategoryId = searchParams.get('category');

  const [allApprovedProducts, setAllApprovedProducts] = useState<Product[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    setLoading(true);
    // Simulate API call to fetch all approved products initially
    setTimeout(() => {
      const approved = MOCK_PRODUCTS
        .filter(p => p.status === 'approved')
        .sort((a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime()); // Sort newest first
      setAllApprovedProducts(approved);
      setLoading(false);
    }, 500);
  }, []);

  const productsByCategory = useMemo(() => {
    if (selectedCategoryId) {
      const category = MOCK_CATEGORIES.find(c => c.id === selectedCategoryId); // Use MOCK_CATEGORIES
      if (category) {
        return [{
          category,
          products: allApprovedProducts.filter(p => p.categoryId === selectedCategoryId) // Use p.categoryId
        }];
      }
    }
    // Group products by category for display
    return MOCK_CATEGORIES.map(category => ({ // Use MOCK_CATEGORIES
      category,
      products: allApprovedProducts
        .filter(product => product.categoryId === category.id) // Use product.categoryId
        .slice(0, PRODUCTS_PER_CATEGORY_HOME), // Take limited products per category
    })).filter(group => group.products.length > 0); // Only show categories that have products
  }, [allApprovedProducts, selectedCategoryId]);

  return (
    <div>
      <CategoryBar />
      <HeroBanner />
      
      <div className="container mx-auto px-4 mt-6 md:mt-8">
        {loading ? (
          MOCK_CATEGORIES.map(category => ( // Use MOCK_CATEGORIES
            <div key={category.id} className="mb-12">
              <Skeleton className="h-8 w-1/2 md:w-1/4 mb-6" />
              <div className="grid grid-cols-2 sm:grid-cols-2 lg:grid-cols-4 gap-6">
                {[...Array(PRODUCTS_PER_CATEGORY_HOME)].map((_, i) => (
                  <Card key={i} className="flex flex-col overflow-hidden rounded-lg">
                    <Skeleton className="aspect-[4/3] w-full" />
                    <CardContent className="p-4 flex-grow">
                      <Skeleton className="h-6 w-3/4 mb-2" />
                      <Skeleton className="h-4 w-full mb-1" />
                      <Skeleton className="h-4 w-2/3 mb-2" />
                      <Skeleton className="h-8 w-1/3" />
                    </CardContent>
                    <CardFooter className="p-4 border-t">
                      <Skeleton className="h-9 w-full" />
                    </CardFooter>
                  </Card>
                ))}
              </div>
            </div>
          ))
        ) : productsByCategory.length > 0 ? (
          productsByCategory.map(({ category, products }) => (
            <section key={category.id} className="mb-10 md:mb-12">
              <div className="flex items-center justify-between mb-4 md:mb-6">
                <h2 className="text-2xl md:text-3xl font-bold">{selectedCategoryId ? `Products in ${category.name}` : `Latest in ${category.name}`}</h2>
                {!selectedCategoryId && products.length >= PRODUCTS_PER_CATEGORY_HOME && (
                   <Button variant="outline" asChild>
                    <Link href={`/?category=${category.id}`}>
                      View All <ArrowRight className="ml-2 h-4 w-4" />
                    </Link>
                  </Button>
                )}
              </div>
              {products.length > 0 ? (
                <div className="grid grid-cols-2 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4 md:gap-6">
                  {products.map(product => (
                    <ProductCard key={product.id} product={product} />
                  ))}
                </div>
              ) : (
                 <Alert variant="default">
                    <SearchX className="h-5 w-5" />
                    <AlertTitle>No Products Yet</AlertTitle>
                    <AlertDescription>
                      There are currently no products listed in the {category.name} category. Check back soon!
                    </AlertDescription>
                  </Alert>
              )}
            </section>
          ))
        ) : (
          <div className="py-12 text-center">
             <Alert variant="default" className="col-span-full max-w-lg mx-auto">
                <SearchX className="h-5 w-5" />
                <AlertTitle>No Products Found</AlertTitle>
                <AlertDescription>
                  We couldn't find any products. Try exploring different categories or check back later!
                </AlertDescription>
             </Alert>
          </div>
        )}
      </div>
    </div>
  );
}
