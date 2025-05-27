
"use client";
import React, { useState, useEffect, useMemo } from 'react';
import { useSearchParams } from 'next/navigation';
import { MOCK_PRODUCTS, MOCK_CATEGORIES, MOCK_SUBCATEGORIES, MOCK_CATEGORY_ATTRIBUTE_TYPES, MOCK_CATEGORY_ATTRIBUTE_VALUES } from '@/lib/mock-data';
import type { Product, Category, SubCategory, CategoryAttributeType, CategoryAttributeValue } from '@/lib/types';
import { ProductCard } from '@/components/product-card';
import { ProductListFilters } from '@/components/product-list-filters';
import { Skeleton } from '@/components/ui/skeleton';
import { Alert, AlertDescription, AlertTitle } from '@/components/ui/alert';
import { SearchX } from 'lucide-react';
import { Breadcrumb, BreadcrumbItem, BreadcrumbLink, BreadcrumbList, BreadcrumbPage, BreadcrumbSeparator } from '@/components/ui/breadcrumb';
import Link from 'next/link';

export default function BrowsePage() {
  const searchParams = useSearchParams(); // Use the hook directly
  const [isLoading, setIsLoading] = useState(true);
  const [filteredProducts, setFilteredProducts] = useState<Product[]>([]);
  
  const [currentCategory, setCurrentCategory] = useState<Category | undefined>(undefined);
  
  const categoryId = searchParams.get('categoryId');

  // Memoize derived props for ProductListFilters
  const subCategoriesForFilter = useMemo(() => {
    if (!categoryId) return [];
    return MOCK_SUBCATEGORIES.filter(sc => sc.parentCategoryId === categoryId);
  }, [categoryId]);

  const attributeTypesForFilter = useMemo(() => {
    if (!categoryId) return [];
    // Ensure MOCK_CATEGORY_ATTRIBUTE_TYPES is treated as stable or memoize its derivation if complex
    return MOCK_CATEGORY_ATTRIBUTE_TYPES.filter(at => at.categoryId === categoryId);
  }, [categoryId]);

  // Effect to set currentCategory and then filter products
  useEffect(() => {
    setIsLoading(true);
    // searchParams from the hook is stable and will trigger effect when URL changes
    const activeCategoryId = searchParams.get('categoryId'); 
    const activeSubCategoryIds = searchParams.getAll('subCategoryId');
    const activeMinPrice = searchParams.get('minPrice');
    const activeMaxPrice = searchParams.get('maxPrice');

    const activeDynamicAttributeFilters: Record<string, string[]> = {};
    MOCK_CATEGORY_ATTRIBUTE_TYPES.forEach(attrType => {
      const values = searchParams.getAll(attrType.id);
      if (values.length > 0) {
        activeDynamicAttributeFilters[attrType.id] = values;
      }
    });

    if (activeCategoryId) {
      const foundCategory = MOCK_CATEGORIES.find(c => c.id === activeCategoryId);
      setCurrentCategory(foundCategory);
    } else {
      setCurrentCategory(undefined);
    }

    let products = MOCK_PRODUCTS.filter(p => p.status === 'approved' && p.stock > 0);

    if (activeCategoryId) {
      products = products.filter(p => p.categoryId === activeCategoryId);
    }

    if (activeSubCategoryIds.length > 0) {
      products = products.filter(p => p.subCategoryId && activeSubCategoryIds.includes(p.subCategoryId));
    }
    
    if (activeMinPrice) {
      products = products.filter(p => p.price >= parseFloat(activeMinPrice));
    }
    if (activeMaxPrice) {
      products = products.filter(p => p.price <= parseFloat(activeMaxPrice));
    }

    Object.entries(activeDynamicAttributeFilters).forEach(([attrTypeId, valueIds]) => {
      if (valueIds.length > 0) {
        products = products.filter(p => 
          p.selectedAttributes?.some(selAttr => 
            selAttr.attributeTypeId === attrTypeId && valueIds.includes(selAttr.attributeValueId)
          )
        );
      }
    });
    
    setFilteredProducts(products.sort((a,b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime()));
    setIsLoading(false);
  }, [searchParams]); // Depend directly on searchParams from the hook

  const getPageTitle = () => {
    const selectedSubCategoryIdsFromUrl = searchParams.getAll('subCategoryId');
    if (!currentCategory) return "Browse Products";
    if (selectedSubCategoryIdsFromUrl.length === 1) {
      const subCat = MOCK_SUBCATEGORIES.find(sc => sc.id === selectedSubCategoryIdsFromUrl[0]);
      return subCat ? `${subCat.name} in ${currentCategory.name}` : currentCategory.name;
    }
    return currentCategory.name;
  };
  
  const breadcrumbSubCategory = useMemo(() => {
    const subCategoryIds = searchParams.getAll('subCategoryId');
    if (subCategoryIds.length === 1) {
      return MOCK_SUBCATEGORIES.find(sc => sc.id === subCategoryIds[0]);
    }
    return null;
  }, [searchParams]);

  return (
    <div className="container mx-auto px-4 py-6">
      <Breadcrumb className="mb-6">
        <BreadcrumbList>
          <BreadcrumbItem>
            <BreadcrumbLink asChild><Link href="/">Home</Link></BreadcrumbLink>
          </BreadcrumbItem>
          <BreadcrumbSeparator />
          {currentCategory ? (
            <>
              <BreadcrumbItem>
                <BreadcrumbLink asChild>
                  {/* Link to /browse to allow filtering from parent category */}
                  <Link href={`/browse?categoryId=${currentCategory.id}`}>{currentCategory.name}</Link>
                </BreadcrumbLink>
              </BreadcrumbItem>
              {breadcrumbSubCategory && (
                <>
                  <BreadcrumbSeparator />
                  <BreadcrumbItem>
                    <BreadcrumbPage>{breadcrumbSubCategory.name}</BreadcrumbPage>
                  </BreadcrumbItem>
                </>
              )}
               {!breadcrumbSubCategory && searchParams.getAll('subCategoryId').length > 0 && (
                 <>
                  <BreadcrumbSeparator />
                  <BreadcrumbItem>
                    <BreadcrumbPage>Filtered Selection</BreadcrumbPage>
                  </BreadcrumbItem>
                 </>
               )}
            </>
          ) : (
            <BreadcrumbItem>
              <BreadcrumbPage>Browse All Products</BreadcrumbPage>
            </BreadcrumbItem>
          )}
        </BreadcrumbList>
      </Breadcrumb>

      <div className="flex flex-col md:flex-row gap-8">
        <div className="w-full md:w-72 lg:w-80 shrink-0">
          <ProductListFilters
            currentCategory={currentCategory} 
            subCategoriesForCurrentCategory={subCategoriesForFilter}
            attributeTypesForCurrentCategory={attributeTypesForFilter}
            allAttributeValues={MOCK_CATEGORY_ATTRIBUTE_VALUES}
          />
        </div>

        <main className="flex-1">
          <h1 className="text-2xl md:text-3xl font-bold mb-6">{getPageTitle()}</h1>
          {isLoading ? (
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
              {[...Array(6)].map((_, i) => <ProductCardSkeleton key={i} />)}
            </div>
          ) : filteredProducts.length > 0 ? (
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
              {filteredProducts.map(product => (
                <ProductCard key={product.id} product={product} />
              ))}
            </div>
          ) : (
            <Alert className="mt-8">
              <SearchX className="h-5 w-5" />
              <AlertTitle>No Products Found</AlertTitle>
              <AlertDescription>
                Try adjusting your filters or check back later.
              </AlertDescription>
            </Alert>
          )}
        </main>
      </div>
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
