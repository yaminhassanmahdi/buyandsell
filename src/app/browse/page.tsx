
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
  const searchParams = useSearchParams();
  const [isLoading, setIsLoading] = useState(true);
  const [filteredProducts, setFilteredProducts] = useState<Product[]>([]);
  
  const [currentCategory, setCurrentCategory] = useState<Category | undefined>(undefined);
  const [subCategoriesForFilter, setSubCategoriesForFilter] = useState<SubCategory[]>([]);
  const [attributeTypesForFilter, setAttributeTypesForFilter] = useState<CategoryAttributeType[]>([]);

  const categoryId = searchParams.get('categoryId');
  const selectedSubCategoryIds = searchParams.getAll('subCategoryId');
  const minPrice = searchParams.get('minPrice');
  const maxPrice = searchParams.get('maxPrice');

  const dynamicAttributeFilters: Record<string, string[]> = useMemo(() => {
    const attrs: Record<string, string[]> = {};
    MOCK_CATEGORY_ATTRIBUTE_TYPES.forEach(attrType => {
      const values = searchParams.getAll(attrType.id);
      if (values.length > 0) {
        attrs[attrType.id] = values;
      }
    });
    return attrs;
  }, [searchParams]);

  useEffect(() => {
    setIsLoading(true);
    if (categoryId) {
      const foundCategory = MOCK_CATEGORIES.find(c => c.id === categoryId);
      setCurrentCategory(foundCategory);
      if (foundCategory) {
        setSubCategoriesForFilter(MOCK_SUBCATEGORIES.filter(sc => sc.parentCategoryId === categoryId));
        setAttributeTypesForFilter(MOCK_CATEGORY_ATTRIBUTE_TYPES.filter(at => at.categoryId === categoryId));
      } else {
        setSubCategoriesForFilter([]);
        setAttributeTypesForFilter([]);
      }
    } else {
      setCurrentCategory(undefined);
      setSubCategoriesForFilter([]);
      setAttributeTypesForFilter([]);
    }

    let products = MOCK_PRODUCTS.filter(p => p.status === 'approved' && p.stock > 0);

    if (categoryId) {
      products = products.filter(p => p.categoryId === categoryId);
    }

    if (selectedSubCategoryIds.length > 0) {
      products = products.filter(p => p.subCategoryId && selectedSubCategoryIds.includes(p.subCategoryId));
    }
    
    if (minPrice) {
      products = products.filter(p => p.price >= parseFloat(minPrice));
    }
    if (maxPrice) {
      products = products.filter(p => p.price <= parseFloat(maxPrice));
    }

    Object.entries(dynamicAttributeFilters).forEach(([attrTypeId, valueIds]) => {
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
  }, [categoryId, selectedSubCategoryIds, minPrice, maxPrice, dynamicAttributeFilters]);

  const getPageTitle = () => {
    if (!currentCategory) return "Browse Products";
    if (selectedSubCategoryIds.length === 1) {
      const subCat = MOCK_SUBCATEGORIES.find(sc => sc.id === selectedSubCategoryIds[0]);
      return subCat ? `${subCat.name} in ${currentCategory.name}` : currentCategory.name;
    }
    return currentCategory.name;
  };
  
  const breadcrumbSubCategory = selectedSubCategoryIds.length === 1 ? MOCK_SUBCATEGORIES.find(sc => sc.id === selectedSubCategoryIds[0]) : null;

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
                  <Link href={`/category/${currentCategory.id}`}>{currentCategory.name}</Link>
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
               {!breadcrumbSubCategory && selectedSubCategoryIds.length > 0 && (
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
              <BreadcrumbPage>Browse</BreadcrumbPage>
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

