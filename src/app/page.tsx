
"use client";
import React, { useState, useMemo, useEffect } from 'react';
import { ProductCard } from '@/components/product-card';
import { MOCK_PRODUCTS, MOCK_CATEGORIES, MOCK_SUBCATEGORIES } from '@/lib/mock-data';
import type { Product, Category as CategoryType } from '@/lib/types';
import { Alert, AlertDescription, AlertTitle } from '@/components/ui/alert';
import { SearchX, ArrowRight } from 'lucide-react';
import { Skeleton } from '@/components/ui/skeleton';
import { Card, CardContent, CardFooter } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import Link from 'next/link';
import { CategoryBar } from '@/components/category-bar';
import { HeroBanner } from '@/components/hero-banner';
import { useSearchParams } from 'next/navigation';

const PRODUCTS_PER_CATEGORY_HOME = 4;

interface ProductGroup {
  category: CategoryType;
  products: Product[];
  titleOverride?: string;
}

export default function HomePage() {
  const searchParams = useSearchParams();
  const selectedCategoryId = searchParams.get('category');
  const selectedSubCategoryId = searchParams.get('subcategory'); // New

  const [allApprovedProducts, setAllApprovedProducts] = useState<Product[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    setLoading(true);
    setTimeout(() => {
      const approved = MOCK_PRODUCTS
        .filter(p => p.status === 'approved')
        .sort((a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime());
      setAllApprovedProducts(approved);
      setLoading(false);
    }, 500);
  }, []);

  const productsByCategory: ProductGroup[] = useMemo(() => {
    let baseProducts = allApprovedProducts;

    if (selectedCategoryId) {
      const category = MOCK_CATEGORIES.find(c => c.id === selectedCategoryId);
      if (!category) return []; // No such category found

      let filteredProducts = baseProducts.filter(p => p.categoryId === selectedCategoryId);
      let title = `Products in ${category.name}`;

      if (selectedSubCategoryId) {
        filteredProducts = filteredProducts.filter(p => p.subCategoryId === selectedSubCategoryId);
        const subCategory = MOCK_SUBCATEGORIES.find(sc => sc.id === selectedSubCategoryId && sc.parentCategoryId === selectedCategoryId);
        if (subCategory) {
          title = `${subCategory.name} in ${category.name}`;
        } else {
           // Subcategory ID provided but not valid for this parent, or not found
           // Show all products from parent category as a fallback, or an empty list
           // For now, let's show parent category products if subcategory is invalid
           title = `All ${category.name} (Subcategory not found)`;
        }
      }
      
      return [{
        category,
        products: filteredProducts,
        titleOverride: title
      }];
    }

    // Default view: Group products by category for display
    return MOCK_CATEGORIES.map(category => ({
      category,
      products: baseProducts
        .filter(product => product.categoryId === category.id)
        .slice(0, PRODUCTS_PER_CATEGORY_HOME),
    })).filter(group => group.products.length > 0);
  }, [allApprovedProducts, selectedCategoryId, selectedSubCategoryId]);

  return (
    <div>
      <CategoryBar />
      <HeroBanner />
      
      <div className="container mx-auto px-4 mt-6 md:mt-8">
        {loading ? (
          MOCK_CATEGORIES.map(category => (
            <div key={category.id} className="mb-12">
              <Skeleton className="h-8 w-1/2 md:w-1/4 mb-6" />
              <div className="grid grid-cols-2 sm:grid-cols-2 lg:grid-cols-4 gap-4 md:gap-6">
                {[...Array(PRODUCTS_PER_CATEGORY_HOME)].map((_, i) => (
                  <Card key={i} className="flex flex-col overflow-hidden rounded-lg">
                    <Skeleton className="aspect-[4/3] w-full" />
                    <CardContent className="p-3 flex-grow">
                      <Skeleton className="h-5 w-3/4 mb-1" /> {/* Adjusted for smaller text */}
                      <Skeleton className="h-4 w-2/3 mb-2" /> {/* Adjusted for smaller text */}
                      <Skeleton className="h-7 w-1/3" /> {/* Price */}
                    </CardContent>
                    <CardFooter className="p-3 border-t">
                      <Skeleton className="h-9 w-full" />
                    </CardFooter>
                  </Card>
                ))}
              </div>
            </div>
          ))
        ) : productsByCategory.length > 0 ? (
          productsByCategory.map((group) => ( // Changed to 'group'
            <section key={group.category.id} className="mb-10 md:mb-12">
              <div className="flex items-center justify-between mb-4 md:mb-6">
                <h2 className="text-2xl md:text-3xl font-bold">
                  {group.titleOverride || (selectedCategoryId ? `Products in ${group.category.name}` : `Latest in ${group.category.name}`)}
                </h2>
                {!selectedCategoryId && group.products.length >= PRODUCTS_PER_CATEGORY_HOME && (
                   <Button variant="outline" asChild>
                    <Link href={`/?category=${group.category.id}`}>
                      View All <ArrowRight className="ml-2 h-4 w-4" />
                    </Link>
                  </Button>
                )}
              </div>
              {group.products.length > 0 ? (
                <div className="grid grid-cols-2 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4 md:gap-6">
                  {group.products.map(product => (
                    <ProductCard key={product.id} product={product} />
                  ))}
                </div>
              ) : (
                 <Alert variant="default">
                    <SearchX className="h-5 w-5" />
                    <AlertTitle>No Products Yet</AlertTitle>
                    <AlertDescription>
                      There are currently no products listed for {group.titleOverride || group.category.name}. Check back soon!
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
                  We couldn't find any products matching your criteria. Try exploring different categories or check back later!
                </AlertDescription>
             </Alert>
          </div>
        )}
      </div>
    </div>
  );
}
