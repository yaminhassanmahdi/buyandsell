
"use client";
import React, { useState, useEffect, useMemo } from 'react';
import { useParams, useSearchParams, useRouter } from 'next/navigation';
import { MOCK_PRODUCTS, MOCK_CATEGORIES, MOCK_SUBCATEGORIES } from '@/lib/mock-data';
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
  const searchParamsHook = useSearchParams(); // Keep this for potential future use
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
          router.push('/'); // Redirect if category not found
          return;
        }
        setCategory(foundCategory);

        const relatedSubCategories = MOCK_SUBCATEGORIES.filter(sc => sc.parentCategoryId === categoryId);
        setSubCategories(relatedSubCategories);

        const categoryProducts = MOCK_PRODUCTS.filter(p => p.categoryId === categoryId && p.status === 'approved' && p.stock > 0);
        setProducts(categoryProducts);
        setIsLoading(false);
      }, 300); // Simulate loading
    }
  }, [categoryId, router]);

  const handleSubCategorySelect = (subCategoryId: string | null) => {
    setSelectedSubCategoryIdForFilter(subCategoryId);
    // Scroll to the top of the product grid for the selected subcategory or all products
    const elementId = subCategoryId ? `subcategory-products-${subCategoryId}` : `all-products-section-for-category`;
    const element = document.getElementById(elementId);
    
    if (element) {
        const headerOffset = 80; // Adjust as needed for your sticky header height
        const elementPosition = element.getBoundingClientRect().top;
        const offsetPosition = elementPosition + window.pageYOffset - headerOffset;

        window.scrollTo({
            top: offsetPosition,
            behavior: "smooth"
        });
    } else if (!subCategoryId) { // If "All" is selected and its specific section doesn't exist, scroll to a general products area
        const generalProductsArea = document.getElementById('all-products-section-for-category');
        if (generalProductsArea) {
             const headerOffset = 80;
             const elementPosition = generalProductsArea.getBoundingClientRect().top;
             const offsetPosition = elementPosition + window.pageYOffset - headerOffset;
             window.scrollTo({ top: offsetPosition, behavior: "smooth"});
        } else {
            window.scrollTo({ top: 0, behavior: "smooth"}); // Fallback to top of page
        }
    }
  };


  if (isLoading) {
    return (
      <div className="container mx-auto px-4 py-8"> {/* Keep container for loading skeleton */}
        <Skeleton className="h-10 w-1/3 mb-6" />
        <Skeleton className="h-32 w-full mb-8" /> {/* Placeholder for SubCategoryScroller */}
        <Skeleton className="h-64 w-full mb-8" /> {/* Placeholder for HeroBanner */}
        <Skeleton className="h-40 w-full mb-8" /> {/* Placeholder for Shop by Style */}
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
    return products.filter(p => p.subCategoryId === subCatId && p.stock > 0).slice(0, PRODUCTS_PER_SUB_CATEGORY_ROW);
  };

  // Filtered products to display either all for the category or for a selected sub-category
  const displayedProducts = selectedSubCategoryIdForFilter
    ? products.filter(p => p.subCategoryId === selectedSubCategoryIdForFilter && p.stock > 0)
    : products.filter(p => p.stock > 0);

  return (
    <div className="py-2"> {/* Removed container from root, added basic py for spacing */}
      <div className="container mx-auto px-4"> {/* Container for the title */}
        <h1 className="text-3xl md:text-4xl font-bold my-6 text-center">{category.name}</h1>
      </div>

      {subCategories.length > 0 && (
        <SubCategoryScroller 
            subCategories={subCategories} 
            parentCategoryId={category.id} 
            onSubCategorySelect={handleSubCategorySelect}
        />
      )}

      <HeroBanner />

      <section className="my-8 md:my-12">
        <div className="container mx-auto px-4"> {/* Container for Shop by Style */}
          <h2 className="text-2xl md:text-3xl font-bold mb-4 md:mb-6 text-center">Shop by Style</h2>
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4 justify-items-center">
            {[1, 2, 3, 4].map(i => ( // Placeholder content for "Shop by Style"
              <Link key={i} href="#" className="group block">
                <div className="aspect-square w-full max-w-[200px] md:max-w-[250px] bg-muted rounded-lg overflow-hidden shadow-md hover:shadow-lg transition-shadow">
                  <Image src={`https://placehold.co/300x300.png`} alt={`Featured Style ${i}`} width={300} height={300} className="object-cover w-full h-full group-hover:scale-105 transition-transform" data-ai-hint="style fashion" />
                </div>
              </Link>
            ))}
          </div>
        </div>
      </section>

      {/* Display logic for products */}
      <section id="all-products-section-for-category" className="mb-10 md:mb-12 pt-6 -mt-6">
        <div className="container mx-auto px-4"> {/* Container for this section */}
          <div className="flex items-center justify-between mb-4 md:mb-6">
            <h2 className="text-2xl md:text-3xl font-bold">
              {selectedSubCategoryIdForFilter 
                ? subCategories.find(sc => sc.id === selectedSubCategoryIdForFilter)?.name || category.name 
                : `All Products in ${category.name}`}
            </h2>
          </div>
          {displayedProducts.length > 0 ? (
            <div className="grid grid-cols-2 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4 md:gap-6">
              {displayedProducts.map(product => (
                <ProductCard key={product.id} product={product} />
              ))}
            </div>
          ) : (
            <Alert variant="default" className="mt-4">
              <SearchX className="h-5 w-5" />
              <AlertTitle>No Products Yet</AlertTitle>
              <AlertDescription>
                There are currently no products listed for {selectedSubCategoryIdForFilter ? subCategories.find(sc => sc.id === selectedSubCategoryIdForFilter)?.name : category.name}. Check back soon!
              </AlertDescription>
            </Alert>
          )}
        </div>
      </section>

      {!selectedSubCategoryIdForFilter && subCategories.map(subCat => (
        <section key={subCat.id} id={`subcategory-products-${subCat.id}`} className="mb-10 md:mb-12 pt-6 -mt-6">
          <div className="container mx-auto px-4"> {/* Container for this section */}
            <div className="flex items-center justify-between mb-4 md:mb-6">
              <h2 className="text-2xl md:text-3xl font-bold">
                {subCat.name}
              </h2>
              {products.filter(p => p.subCategoryId === subCat.id && p.stock > 0).length > PRODUCTS_PER_SUB_CATEGORY_ROW && (
                <Button variant="outline" asChild>
                  <button onClick={() => handleSubCategorySelect(subCat.id)} className="flex items-center">
                    View All <ArrowRight className="ml-2 h-4 w-4" />
                  </button>
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
          </div>
        </section>
      ))}

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
