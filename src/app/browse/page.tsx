"use client";

import React, { useState, useEffect, useMemo, Suspense } from 'react';
import { useSearchParams, useRouter } from 'next/navigation';
import { apiClient } from '@/lib/api-client';
import type { Product, Category, SubCategory, CategoryAttributeType, CategoryAttributeValue, SortByType } from '@/lib/types';
import { ProductCard } from '@/components/product-card';
import { ProductListFilters } from '@/components/product-list-filters';
import { Skeleton } from '@/components/ui/skeleton';
import { Alert, AlertDescription, AlertTitle } from '@/components/ui/alert';
import { SearchX, Filter as FilterIcon, ListFilter as SortIcon } from 'lucide-react';
import { Breadcrumb, BreadcrumbItem, BreadcrumbLink, BreadcrumbList, BreadcrumbPage, BreadcrumbSeparator } from '@/components/ui/breadcrumb';
import Link from 'next/link';
import { Button } from '@/components/ui/button';
import { Sheet, SheetContent, SheetTrigger, SheetHeader, SheetTitle, SheetClose } from '@/components/ui/sheet';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { SubCategoryScroller } from '@/components/sub-category-scroller'; // Import the scroller

const SORT_OPTIONS: { value: SortByType; label: string }[] = [
  { value: 'date_desc', label: 'Newest First' },
  { value: 'date_asc', label: 'Oldest First' },
  { value: 'price_asc', label: 'Price: Low to High' },
  { value: 'price_desc', label: 'Price: High to Low' },
  { value: 'name_asc', label: 'Name: A-Z' },
  { value: 'name_desc', label: 'Name: Z-A' },
];

function BrowsePageInner() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const [isLoading, setIsLoading] = useState(true);
  const [displayedProducts, setDisplayedProducts] = useState<Product[]>([]);
  
  const [currentCategory, setCurrentCategory] = useState<Category | undefined>(undefined);
  const [isFilterSheetOpen, setIsFilterSheetOpen] = useState(false);
  const [sortBy, setSortBy] = useState<SortByType>(
    (searchParams.get('sortBy') as SortByType) || 'date_desc'
  );
  
  // API data state
  const [allProducts, setAllProducts] = useState<any[]>([]);
  const [categories, setCategories] = useState<any[]>([]);
  const [subCategories, setSubCategories] = useState<any[]>([]);
  const [attributeTypes, setAttributeTypes] = useState<any[]>([]);
  const [attributeValues, setAttributeValues] = useState<any[]>([]);

  const categoryId = searchParams.get('categoryId');
  const activeSubCategoryIdsFromUrl = searchParams.getAll('subCategoryId'); // Used to check if a sub-category is active

  const subCategoriesForFilter = useMemo(() => {
    if (!categoryId) return [];
    return subCategories.filter(sc => sc.parentCategoryId === categoryId);
  }, [categoryId, subCategories]);

  const attributeTypesForFilter = useMemo(() => {
    if (!categoryId) return [];
    return attributeTypes.filter(at => at.categoryId === categoryId);
  }, [categoryId, attributeTypes]);

  // Load initial data from API
  useEffect(() => {
    const loadInitialData = async () => {
      try {
        const [productsData, categoriesData] = await Promise.all([
          apiClient.getProducts({ status: 'approved', limit: 100 }),
          apiClient.getCategories({ includeSubCategories: true, includeAttributes: true, includeAttributeValues: true })
        ]);

        setAllProducts(productsData.filter((p: any) => p.stock > 0));
        setCategories(categoriesData);
        
        // Extract subcategories and attributes
        const allSubCategories = categoriesData.flatMap((cat: any) => cat.subCategories || []);
        const allAttributeTypes = categoriesData.flatMap((cat: any) => cat.attributeTypes || []);
        const allAttributeValues = allAttributeTypes.flatMap((attr: any) => attr.values || []);
        
        setSubCategories(allSubCategories);
        setAttributeTypes(allAttributeTypes);
        setAttributeValues(allAttributeValues);
      } catch (error) {
        console.error('Error loading browse page data:', error);
      }
    };

    loadInitialData();
  }, []);

  useEffect(() => {
    if (allProducts.length === 0) return; // Wait for data to load
    
    setIsLoading(true);
    const activeCategoryIdFromUrl = searchParams.get('categoryId');
    const currentActiveSubCategoryIds = searchParams.getAll('subCategoryId');
    const activeMinPrice = searchParams.get('minPrice');
    const activeMaxPrice = searchParams.get('maxPrice');
    const currentSortBy = (searchParams.get('sortBy') as SortByType) || 'date_desc';
    setSortBy(currentSortBy);

    const activeDynamicAttributeFilters: Record<string, string[]> = {};
    attributeTypes.forEach(attrType => {
      const values = searchParams.getAll(attrType.id);
      if (values.length > 0) {
        activeDynamicAttributeFilters[attrType.id] = values;
      }
    });

    if (activeCategoryIdFromUrl) {
      const foundCategory = categories.find(c => c.id === activeCategoryIdFromUrl);
      setCurrentCategory(foundCategory);
    } else {
      setCurrentCategory(undefined);
    }

    let products = allProducts.slice(); // Copy the array

    if (activeCategoryIdFromUrl) {
      products = products.filter(p => p.categoryId === activeCategoryIdFromUrl);
    }

    if (activeSubCategoryIdsFromUrl.length > 0) {
      products = products.filter(p => p.subCategoryId && currentActiveSubCategoryIds.includes(p.subCategoryId));
    }
    
    if (activeMinPrice) {
      products = products.filter(p => parseFloat(p.price) >= parseFloat(activeMinPrice));
    }
    if (activeMaxPrice) {
      products = products.filter(p => parseFloat(p.price) <= parseFloat(activeMaxPrice));
    }

    Object.entries(activeDynamicAttributeFilters).forEach(([attrTypeId, valueIds]) => {
      if (valueIds.length > 0) {
        products = products.filter(p => 
          p.selectedAttributes?.some((selAttr: any) => 
            selAttr.attributeTypeId === attrTypeId && valueIds.includes(selAttr.attributeValueId)
          )
        );
      }
    });

    // Apply sorting
    products.sort((a, b) => {
      switch (currentSortBy) {
        case 'price_asc':
          return parseFloat(a.price) - parseFloat(b.price);
        case 'price_desc':
          return parseFloat(b.price) - parseFloat(a.price);
        case 'name_asc':
          return a.name.localeCompare(b.name);
        case 'name_desc':
          return b.name.localeCompare(a.name);
        case 'date_asc':
          return new Date(a.createdAt).getTime() - new Date(b.createdAt).getTime();
        case 'date_desc':
        default:
          return new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime();
      }
    });
    
    // Convert API format to component format
    const convertedProducts = products.map(p => ({
      ...p,
      categoryId: p.categoryId,
      subCategoryId: p.subCategoryId,
      sellerId: p.seller_id,
      sellerName: p.sellerName,
      imageUrl: p.imageUrl,
      imageHint: p.imageHint,
      createdAt: new Date(p.createdAt),
      price: parseFloat(p.price)
    }));
    
    setDisplayedProducts(convertedProducts);
    setIsLoading(false);
  }, [searchParams, allProducts, categories, attributeTypes]);

  const handleSortChange = (newSortBy: SortByType) => {
    setSortBy(newSortBy);
    const newParams = new URLSearchParams(searchParams.toString());
    newParams.set('sortBy', newSortBy);
    router.push(`/browse?${newParams.toString()}`, { scroll: false });
  };

  const getPageTitle = () => {
    const selectedSubCategoryIdsFromUrl = searchParams.getAll('subCategoryId');
    if (!currentCategory) return "Browse All Products";
    if (selectedSubCategoryIdsFromUrl.length === 1) {
      const subCat = subCategories.find(sc => sc.id === selectedSubCategoryIdsFromUrl[0]);
      return subCat ? `${subCat.name} in ${currentCategory.name}` : currentCategory.name;
    }
    if (selectedSubCategoryIdsFromUrl.length > 1) {
        return `Filtered Products in ${currentCategory.name}`;
    }
    return currentCategory.name;
  };
  
  const breadcrumbSubCategory = useMemo(() => {
    const subCategoryIds = searchParams.getAll('subCategoryId');
    if (subCategoryIds.length === 1) {
      return subCategories.find(sc => sc.id === subCategoryIds[0]);
    }
    return null;
  }, [searchParams, subCategories]);

  const showSubCategoryScroller = categoryId && activeSubCategoryIdsFromUrl.length === 0 && subCategoriesForFilter.length > 0;

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

      {showSubCategoryScroller && (
        <div className="mb-6">
          <SubCategoryScroller 
            subCategories={subCategoriesForFilter} 
            parentCategoryId={categoryId}
          />
        </div>
      )}

      <div className="flex flex-col md:flex-row gap-8">
        {/* Desktop Filters Sidebar */}
        <div className="hidden md:block w-full md:w-72 lg:w-80 shrink-0 relative"> {/* Added relative for sticky button */}
          <ProductListFilters
            currentCategory={currentCategory} 
            subCategoriesForCurrentCategory={subCategoriesForFilter}
            attributeTypesForCurrentCategory={attributeTypesForFilter}
            allAttributeValues={attributeValues}
          />
        </div>

        <main className="flex-1">
          <div className="flex flex-col sm:flex-row justify-between items-center mb-6 gap-4">
            <h1 className="text-2xl md:text-3xl font-bold">{getPageTitle()}</h1>
            <div className="flex items-center gap-2 w-full sm:w-auto">
              {/* Mobile Filter Button */}
              <div className="md:hidden flex-grow sm:flex-grow-0">
                <Sheet open={isFilterSheetOpen} onOpenChange={setIsFilterSheetOpen}>
                  <SheetTrigger asChild>
                    <Button variant="outline" className="w-full">
                      <FilterIcon className="mr-2 h-4 w-4" /> Filter
                    </Button>
                  </SheetTrigger>
                  <SheetContent side="right" className="w-[300px] p-0 flex flex-col"> {/* Added flex flex-col */}
                     <SheetHeader className="p-4 border-b">
                        <SheetTitle>Filter Products</SheetTitle>
                         <SheetClose className="absolute right-4 top-4 rounded-sm opacity-70 ring-offset-background transition-opacity hover:opacity-100 focus:outline-none focus:ring-2 focus:ring-ring focus:ring-offset-2 disabled:pointer-events-none data-[state=open]:bg-secondary" />
                     </SheetHeader>
                     {/* ScrollArea will be inside ProductListFilters if needed */}
                     <div className="flex-grow overflow-y-auto p-4"> {/* Make this area scrollable */}
                        <ProductListFilters
                            currentCategory={currentCategory} 
                            subCategoriesForCurrentCategory={subCategoriesForFilter}
                            attributeTypesForCurrentCategory={attributeTypesForFilter}
                            allAttributeValues={attributeValues}
                            onApplyFilters={() => setIsFilterSheetOpen(false)} // Close sheet on apply
                        />
                     </div>
                  </SheetContent>
                </Sheet>
              </div>
              {/* Sorting Dropdown */}
              <div className="flex-grow sm:flex-grow-0 sm:w-[200px]">
                <Select value={sortBy} onValueChange={(value) => handleSortChange(value as SortByType)}>
                  <SelectTrigger className="w-full">
                    <SortIcon className="mr-2 h-4 w-4" />
                    <SelectValue placeholder="Sort by..." />
                  </SelectTrigger>
                  <SelectContent>
                    {SORT_OPTIONS.map(option => (
                      <SelectItem key={option.value} value={option.value}>
                        {option.label}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
            </div>
          </div>

          {isLoading ? (
            <div className="grid grid-cols-2 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 2xl:grid-cols-5 gap-4 md:gap-6">
              {[...Array(8)].map((_, i) => <ProductCardSkeleton key={i} />)}
            </div>
          ) : displayedProducts.length > 0 ? (
            <div className="grid grid-cols-2 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 2xl:grid-cols-5 gap-4 md:gap-6">
              {displayedProducts.map(product => (
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

export default function BrowsePage() {
  return (
    <Suspense fallback={<div>Loading...</div>}>
      <BrowsePageInner />
    </Suspense>
  );
}
