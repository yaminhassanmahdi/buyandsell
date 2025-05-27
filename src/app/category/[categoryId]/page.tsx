
"use client";
import React, { useState, useEffect, useMemo } from 'react';
import { useParams, useSearchParams, useRouter } from 'next/navigation';
import { MOCK_PRODUCTS, MOCK_CATEGORIES, MOCK_SUBCATEGORIES, MOCK_CATEGORY_ATTRIBUTE_TYPES, MOCK_CATEGORY_ATTRIBUTE_VALUES } from '@/lib/mock-data';
import type { Product, Category as CategoryType, SubCategory, BusinessSettings } from '@/lib/types';
import { ProductCard } from '@/components/product-card';
import { HeroBanner } from '@/components/hero-banner';
import { SubCategoryScroller } from '@/components/sub-category-scroller';
import { Button } from '@/components/ui/button';
import { Skeleton } from '@/components/ui/skeleton';
import { Alert, AlertDescription, AlertTitle } from '@/components/ui/alert';
import { ArrowRight, SearchX, Tag } from 'lucide-react';
import Link from 'next/link';
import Image from 'next/image';
import useLocalStorage from '@/hooks/use-local-storage';
import { BUSINESS_SETTINGS_STORAGE_KEY, DEFAULT_BUSINESS_SETTINGS } from '@/lib/constants';

const PRODUCTS_PER_SUB_CATEGORY_ROW = 4;

export default function CategoryPage() {
  const params = useParams();
  const searchParamsHook = useSearchParams(); 
  const router = useRouter();
  const categoryId = params.categoryId as string;

  const [category, setCategory] = useState<CategoryType | null>(null);
  const [subCategories, setSubCategories] = useState<SubCategory[]>([]);
  const [products, setProducts] = useState<Product[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [selectedSubCategoryIdForFilter, setSelectedSubCategoryIdForFilter] = useState<string | null>(null);

  const [settings] = useLocalStorage<BusinessSettings>(BUSINESS_SETTINGS_STORAGE_KEY, DEFAULT_BUSINESS_SETTINGS);
  const activeCurrency = useMemo(() => {
    const safeAvailableCurrencies = settings?.availableCurrencies && Array.isArray(settings.availableCurrencies) && settings.availableCurrencies.length > 0
      ? settings.availableCurrencies
      : DEFAULT_BUSINESS_SETTINGS.availableCurrencies;
    const safeDefaultCurrencyCode = settings?.defaultCurrencyCode || DEFAULT_BUSINESS_SETTINGS.defaultCurrencyCode;
    return safeAvailableCurrencies.find(c => c.code === safeDefaultCurrencyCode) || safeAvailableCurrencies[0] || { symbol: '?' };
  }, [settings]);
  const currencySymbol = activeCurrency.symbol;

  useEffect(() => {
    setIsLoading(true);
    if (categoryId) {
      setTimeout(() => { 
        const foundCategory = MOCK_CATEGORIES.find(c => c.id === categoryId);
        if (!foundCategory) {
          router.push('/'); 
          return;
        }
        setCategory(foundCategory);

        const relatedSubCategories = MOCK_SUBCATEGORIES.filter(sc => sc.parentCategoryId === categoryId);
        setSubCategories(relatedSubCategories);

        const categoryProducts = MOCK_PRODUCTS.filter(p => p.categoryId === categoryId && p.status === 'approved');
        setProducts(categoryProducts);
        setIsLoading(false);
      }, 500);
    }
  }, [categoryId, router]);

  const handleSubCategorySelect = (subCategoryId: string | null) => {
    setSelectedSubCategoryIdForFilter(subCategoryId);
    const elementId = subCategoryId ? `subcategory-products-${subCategoryId}` : `category-products-all`;
    const element = document.getElementById(elementId);
    if (element) {
        const headerOffset = 80; 
        const elementPosition = element.getBoundingClientRect().top;
        const offsetPosition = elementPosition + window.pageYOffset - headerOffset;

        window.scrollTo({
            top: offsetPosition,
            behavior: "smooth"
        });
    }
  };


  if (isLoading) {
    return (
      <div className="container mx-auto px-4 py-8">
        <Skeleton className="h-10 w-1/3 mb-6" />
        <Skeleton className="h-32 w-full mb-8" /> 
        <Skeleton className="h-64 w-full mb-8" /> 
        <Skeleton className="h-40 w-full mb-8" /> 
        {[1, 2].map(i => (
          <div key={i} className="mb-12">
            <Skeleton className="h-8 w-1/4 mb-6" />
            <div className="grid grid-cols-2 sm:grid-cols-2 lg:grid-cols-4 gap-4 md:gap-6">
              {[...Array(4)].map((_, j) => <ProductCardSkeleton key={j} />)}
            </div>
          </div>
        ))}
      </div>
    );
  }

  if (!category) {
    return (
      <div className="container mx-auto px-4 py-8 text-center">
        <Alert variant="destructive">
          <SearchX className="h-5 w-5" />
          <AlertTitle>Category Not Found</AlertTitle>
          <AlertDescription>The category you are looking for does not exist.</AlertDescription>
        </Alert>
        <Button asChild className="mt-6">
          <Link href="/">Go to Homepage</Link>
        </Button>
      </div>
    );
  }

  const productsBySubCategory = (subCatId: string) => {
    return products.filter(p => p.subCategoryId === subCatId).slice(0, PRODUCTS_PER_SUB_CATEGORY_ROW);
  };

  const allCategoryProducts = products.filter(p => !selectedSubCategoryIdForFilter || p.subCategoryId === selectedSubCategoryIdForFilter);


  return (
    <div className="container mx-auto px-4 py-2">
      <h1 className="text-3xl md:text-4xl font-bold my-6 text-center">{category.name}</h1>

      {subCategories.length > 0 && (
        <SubCategoryScroller subCategories={subCategories} parentCategoryId={category.id} onSubCategorySelect={handleSubCategorySelect} />
      )}

      <HeroBanner />

      <section className="my-8 md:my-12">
        <h2 className="text-2xl font-semibold mb-6 text-center">Shop by Style</h2>
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4 justify-items-center">
          {[1, 2, 3, 4].map(i => (
            <Link key={i} href="#" className="group block">
              <div className="aspect-square w-full max-w-[200px] md:max-w-[250px] bg-muted rounded-lg overflow-hidden shadow-md hover:shadow-lg transition-shadow">
                <Image src={`https://placehold.co/300x300.png`} alt={`Featured Style ${i}`} width={300} height={300} className="object-cover w-full h-full group-hover:scale-105 transition-transform" data-ai-hint="style fashion" />
              </div>
            </Link>
          ))}
        </div>
      </section>

      {subCategories.map(subCat => (
        <section key={subCat.id} id={`subcategory-products-${subCat.id}`} className="mb-10 md:mb-12 pt-6 -mt-6"> 
          <div className="flex items-center justify-between mb-4 md:mb-6">
            <h2 className="text-2xl md:text-3xl font-bold">
              {subCat.name}
            </h2>
            {products.filter(p => p.subCategoryId === subCat.id).length > PRODUCTS_PER_SUB_CATEGORY_ROW && (
              <Button variant="outline" asChild>
                <Link href={`/?category=${category.id}&subcategory=${subCat.id}`}>
                  View All <ArrowRight className="ml-2 h-4 w-4" />
                </Link>
              </Button>
            )}
          </div>
          {productsBySubCategory(subCat.id).length > 0 ? (
            <div className="grid grid-cols-2 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4 md:gap-6">
              {productsBySubCategory(subCat.id).map(product => (
                <ProductCard key={product.id} product={product} />
              ))}
            </div>
          ) : (
             <Alert variant="default" className="mt-4">
                <SearchX className="h-5 w-5" />
                <AlertTitle>No Products Yet</AlertTitle>
                <AlertDescription>
                  There are currently no products listed for {subCat.name}. Check back soon!
                </AlertDescription>
              </Alert>
          )}
        </section>
      ))}

      {subCategories.length === 0 && (
         <section id={`category-products-all`} className="mb-10 md:mb-12 pt-6 -mt-6">
            <h2 className="text-2xl md:text-3xl font-bold mb-4 md:mb-6">All Products in {category.name}</h2>
             {allCategoryProducts.length > 0 ? (
                 <div className="grid grid-cols-2 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4 md:gap-6">
                 {allCategoryProducts.map(product => (
                     <ProductCard key={product.id} product={product} />
                 ))}
                 </div>
             ) : (
                 <Alert variant="default">
                     <SearchX className="h-5 w-5" />
                     <AlertTitle>No Products Yet</AlertTitle>
                     <AlertDescription>
                     There are currently no products listed for {category.name}. Check back soon!
                     </AlertDescription>
                 </Alert>
             )}
         </section>
      )}

      {/* Removed global "Shop by Brand" section */}
    </div>
  );
}

const ProductCardSkeleton = () => (
  <div className="flex flex-col overflow-hidden rounded-lg border shadow-lg">
    <Skeleton className="aspect-[4/3] w-full" />
    <div className="p-3 flex-grow">
      <Skeleton className="h-5 w-3/4 mb-1" />
      <Skeleton className="h-7 w-1/3" />
    </div>
    <div className="p-3 border-t mt-auto">
      <Skeleton className="h-9 w-full" />
    </div>
  </div>
);
