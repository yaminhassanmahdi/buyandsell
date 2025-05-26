
"use client";
import React, { useState, useMemo, useEffect }
from 'react';
import { ProductCard } from '@/components/product-card';
import { ProductFilters } from '@/components/product-filters';
import { MOCK_PRODUCTS } from '@/lib/mock-data';
import type { Product, FilterValues } from '@/lib/types';
import { Alert, AlertDescription, AlertTitle } from '@/components/ui/alert';
import { SearchX } from 'lucide-react';
import { Skeleton } from '@/components/ui/skeleton';
import { Card, CardContent, CardFooter } from '@/components/ui/card';

export default function HomePage() {
  const [allProducts, setAllProducts] = useState<Product[]>([]);
  const [filteredProducts, setFilteredProducts] = useState<Product[]>([]);
  const [filters, setFilters] = useState<FilterValues>({});
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    // Simulate API call
    setTimeout(() => {
      const approvedProducts = MOCK_PRODUCTS.filter(p => p.status === 'approved');
      setAllProducts(approvedProducts);
      setFilteredProducts(approvedProducts);
      setLoading(false);
    }, 500);
  }, []);

  const handleFilterChange = (newFilters: FilterValues) => {
    setFilters(newFilters);
    let products = [...allProducts];

    if (newFilters.searchTerm) {
      const searchTermLower = newFilters.searchTerm.toLowerCase();
      products = products.filter(
        p => p.name.toLowerCase().includes(searchTermLower) || p.description.toLowerCase().includes(searchTermLower)
      );
    }
    if (newFilters.category) {
      products = products.filter(p => p.category.id === newFilters.category);
    }
    if (newFilters.brand) {
      products = products.filter(p => p.brand.id === newFilters.brand);
    }
    if (newFilters.minPrice) {
      products = products.filter(p => p.price >= Number(newFilters.minPrice));
    }
    if (newFilters.maxPrice) {
      products = products.filter(p => p.price <= Number(newFilters.maxPrice));
    }
    
    if (newFilters.sortBy) {
      switch (newFilters.sortBy) {
        case 'price_asc':
          products.sort((a, b) => a.price - b.price);
          break;
        case 'price_desc':
          products.sort((a, b) => b.price - a.price);
          break;
        case 'date_newest':
          products.sort((a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime());
          break;
        case 'date_oldest':
          products.sort((a, b) => new Date(a.createdAt).getTime() - new Date(b.createdAt).getTime());
          break;
      }
    }


    setFilteredProducts(products);
  };

  return (
    <div className="grid grid-cols-1 md:grid-cols-4 gap-8">
      <div className="md:col-span-1">
        <ProductFilters onFilterChange={handleFilterChange} />
      </div>
      <div className="md:col-span-3">
        {loading ? (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
            {[...Array(6)].map((_, i) => (
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
        ) : filteredProducts.length > 0 ? (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
            {filteredProducts.map(product => (
              <ProductCard key={product.id} product={product} />
            ))}
          </div>
        ) : (
          <Alert variant="default" className="col-span-full">
            <SearchX className="h-5 w-5" />
            <AlertTitle>No Products Found</AlertTitle>
            <AlertDescription>
              We couldn't find any products matching your current filters. Try adjusting your search criteria.
            </AlertDescription>
          </Alert>
        )}
      </div>
    </div>
  );
}
