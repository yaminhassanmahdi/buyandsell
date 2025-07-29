"use client";

import { useEffect, useState, Suspense } from 'react';
import { useSearchParams } from 'next/navigation';
import { ProductCard } from '@/components/product-card';
import { SearchBox } from '@/components/search-box';
import { Button } from '@/components/ui/button';
import { Card, CardContent } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Loader2, Search, Package } from 'lucide-react';
import { Product } from '@/lib/types';

function SearchContent() {
  const searchParams = useSearchParams();
  const query = searchParams.get('q') || '';
  const categoryId = searchParams.get('categoryId') || '';
  
  const [products, setProducts] = useState<Product[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [totalResults, setTotalResults] = useState(0);
  const [categoryName, setCategoryName] = useState<string>('');

  useEffect(() => {
    const fetchCategoryName = async () => {
      if (categoryId) {
        try {
          const response = await fetch('/api/categories');
          if (response.ok) {
            const categories = await response.json();
            const category = categories.find((c: any) => c.id === categoryId);
            setCategoryName(category?.name || '');
          }
        } catch (error) {
          console.error('Error fetching category name:', error);
        }
      }
    };

    fetchCategoryName();
  }, [categoryId]);

  useEffect(() => {
    const fetchSearchResults = async () => {
      if (!query.trim()) {
        setProducts([]);
        setIsLoading(false);
        return;
      }

      try {
        setIsLoading(true);
        const params = new URLSearchParams({
          q: query,
          limit: '50'
        });
        
        if (categoryId) {
          params.append('categoryId', categoryId);
        }

        const response = await fetch(`/api/search?${params}`);
        if (response.ok) {
          const data = await response.json();
          setProducts(data.products || []);
          setTotalResults(data.products?.length || 0);
        }
      } catch (error) {
        console.error('Search error:', error);
        setProducts([]);
      } finally {
        setIsLoading(false);
      }
    };

    fetchSearchResults();
  }, [query, categoryId]);

  if (isLoading) {
    return (
      <div className="container mx-auto px-4 py-8">
        <div className="flex items-center justify-center min-h-[400px]">
          <Loader2 className="h-12 w-12 animate-spin text-primary" />
        </div>
      </div>
    );
  }

  return (
    <div className="container mx-auto px-4 py-8">
      {/* Search Header */}
      <div className="mb-8">
        <div className="flex items-center gap-2">
          <Badge variant="secondary" className="flex items-center gap-1">
            <Package className="h-3 w-3" />
            {totalResults} results
          </Badge>
        </div>
        {query && (
          <div className="flex items-center gap-2 text-lg mt-4">
            <Search className="h-5 w-5 text-muted-foreground" />
            <span className="font-medium">Search results for:</span>
            <span className="text-primary font-semibold">"{query}"</span>
            {categoryId && categoryName && (
              <>
                <span className="text-muted-foreground">in</span>
                <Badge variant="outline">{categoryName}</Badge>
              </>
            )}
          </div>
        )}
      </div>

      {/* Results */}
      {products.length > 0 ? (
        <div className="grid grid-cols-2 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 2xl:grid-cols-5 gap-4 md:gap-6">
          {products.map((product) => (
            <ProductCard key={product.id} product={product} />
          ))}
        </div>
      ) : query ? (
        <Card className="text-center py-12">
          <CardContent>
            <Search className="h-12 w-12 text-muted-foreground mx-auto mb-4" />
            <h3 className="text-lg font-semibold mb-2">No products found</h3>
            <p className="text-muted-foreground mb-4">
              We couldn't find any products matching "{query}"
              {categoryId && categoryName && ` in ${categoryName}`}
            </p>
            <Button onClick={() => window.history.back()}>
              Go Back
            </Button>
          </CardContent>
        </Card>
      ) : (
        <Card className="text-center py-12">
          <CardContent>
            <Search className="h-12 w-12 text-muted-foreground mx-auto mb-4" />
            <h3 className="text-lg font-semibold mb-2">Search for products</h3>
            <p className="text-muted-foreground">
              Enter a search term to find products
            </p>
          </CardContent>
        </Card>
      )}
    </div>
  );
}

function SearchPageInner() {
  return (
    <Suspense fallback={
      <div className="container mx-auto px-4 py-8">
        <div className="flex items-center justify-center min-h-[400px]">
          <Loader2 className="h-12 w-12 animate-spin text-primary" />
        </div>
      </div>
    }>
      <SearchContent />
    </Suspense>
  );
}

export default function SearchPage() {
  return (
    <Suspense fallback={<div>Loading...</div>}>
      <SearchPageInner />
    </Suspense>
  );
}
