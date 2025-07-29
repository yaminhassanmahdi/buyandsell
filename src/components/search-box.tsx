"use client";
import { useState, useEffect, useRef, Suspense } from 'react';
import { Search, X, Loader2 } from 'lucide-react';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import { Card, CardContent } from '@/components/ui/card';
import { useRouter, useSearchParams } from 'next/navigation';
import { Product } from '@/lib/types';
import Image from 'next/image';
import { useDebounce } from '@/hooks/use-debounce';

interface SearchBoxProps {
  className?: string;
  placeholder?: string;
  categoryId?: string;
  showContextLabel?: boolean;
}

function SearchBoxInner({ 
  className = '', 
  placeholder = 'Search products...', 
  categoryId,
  showContextLabel = false 
}: SearchBoxProps) {
  const [query, setQuery] = useState('');
  const [suggestions, setSuggestions] = useState<Product[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const [showSuggestions, setShowSuggestions] = useState(false);
  const [selectedIndex, setSelectedIndex] = useState(-1);
  const [categoryName, setCategoryName] = useState<string>('');
  const searchRef = useRef<HTMLDivElement>(null);
  const inputRef = useRef<HTMLInputElement>(null);
  const router = useRouter();
  const searchParams = useSearchParams();
  
  const debouncedQuery = useDebounce(query, 200);

  // Load initial query from URL
  useEffect(() => {
    const urlQuery = searchParams.get('q') || '';
    setQuery(urlQuery);
  }, [searchParams]);

  // Fetch category name for context
  useEffect(() => {
    if (categoryId && showContextLabel) {
      const fetchCategoryName = async () => {
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
      };
      fetchCategoryName();
    }
  }, [categoryId, showContextLabel]);

  // Fetch suggestions when query changes
  useEffect(() => {
    if (debouncedQuery.trim().length < 2) {
      setSuggestions([]);
      setShowSuggestions(false);
      return;
    }

    const fetchSuggestions = async () => {
      try {
        setIsLoading(true);
        const params = new URLSearchParams({
          q: debouncedQuery,
          limit: '6'
        });
        
        if (categoryId) {
          params.append('categoryId', categoryId);
        }

        const response = await fetch(`/api/search?${params}`);
        if (response.ok) {
          const data = await response.json();
          setSuggestions(data.products || []);
          setShowSuggestions(true);
        }
      } catch (error) {
        console.error('Search error:', error);
        setSuggestions([]);
      } finally {
        setIsLoading(false);
      }
    };

    fetchSuggestions();
  }, [debouncedQuery, categoryId]);

  // Handle keyboard navigation
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (!showSuggestions) return;

      switch (e.key) {
        case 'ArrowDown':
          e.preventDefault();
          setSelectedIndex(prev => 
            prev < suggestions.length - 1 ? prev + 1 : prev
          );
          break;
        case 'ArrowUp':
          e.preventDefault();
          setSelectedIndex(prev => prev > 0 ? prev - 1 : -1);
          break;
        case 'Enter':
          e.preventDefault();
          if (selectedIndex >= 0 && suggestions[selectedIndex]) {
            handleProductClick(suggestions[selectedIndex]);
          } else {
            handleSearch();
          }
          break;
        case 'Escape':
          setShowSuggestions(false);
          setSelectedIndex(-1);
          break;
      }
    };

    document.addEventListener('keydown', handleKeyDown);
    return () => document.removeEventListener('keydown', handleKeyDown);
  }, [showSuggestions, suggestions, selectedIndex]);

  // Close suggestions when clicking outside
  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (searchRef.current && !searchRef.current.contains(event.target as Node)) {
        setShowSuggestions(false);
        setSelectedIndex(-1);
      }
    };

    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  const handleSearch = () => {
    if (query.trim()) {
      const params = new URLSearchParams({ q: query.trim() });
      if (categoryId) {
        params.append('categoryId', categoryId);
      }
      router.push(`/search?${params}`);
      setShowSuggestions(false);
      inputRef.current?.blur();
    }
  };

  const handleProductClick = (product: Product) => {
    router.push(`/products/${product.id}`);
    setShowSuggestions(false);
    setQuery('');
    inputRef.current?.blur();
  };

  const clearQuery = () => {
    setQuery('');
    setSuggestions([]);
    setShowSuggestions(false);
    setSelectedIndex(-1);
    inputRef.current?.focus();
  };

  const getEffectivePlaceholder = () => {
    if (categoryId && categoryName) {
      return `Search in ${categoryName}...`;
    }
    return placeholder;
  };

  return (
    <div ref={searchRef} className={`relative ${className}`}>
      {showContextLabel && categoryId && categoryName && (
        <div className="text-xs text-muted-foreground mb-1">
          Searching in: <span className="font-medium">{categoryName}</span>
        </div>
      )}
      
      <div className="relative">
        <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-muted-foreground" />
        <Input
          ref={inputRef}
          type="text"
          placeholder={getEffectivePlaceholder()}
          value={query}
          onChange={(e) => setQuery(e.target.value)}
          onFocus={() => {
            if (suggestions.length > 0) {
              setShowSuggestions(true);
            }
          }}
          onKeyDown={(e) => {
            if (e.key === 'Enter') {
              e.preventDefault();
              handleSearch();
            }
          }}
          className="pl-10 pr-10"
        />
        
        {query && (
          <Button
            variant="ghost"
            size="sm"
            className="absolute right-1 top-1/2 transform -translate-y-1/2 h-8 w-8 p-0"
            onClick={clearQuery}
          >
            <X className="h-4 w-4" />
          </Button>
        )}
      </div>

      {/* Search Suggestions */}
      {showSuggestions && (
        <Card className="absolute top-full left-0 right-0 mt-1 z-50 max-h-96 overflow-y-auto">
          <CardContent className="p-0">
            {isLoading ? (
              <div className="p-4 text-center">
                <Loader2 className="h-4 w-4 animate-spin mx-auto" />
                <p className="text-sm text-muted-foreground mt-2">Searching...</p>
              </div>
            ) : suggestions.length > 0 ? (
              <div className="py-2">
                {suggestions.map((product, index) => (
                  <div
                    key={product.id}
                    className={`flex items-center gap-3 p-3 hover:bg-muted cursor-pointer ${
                      index === selectedIndex ? 'bg-muted' : ''
                    }`}
                    onClick={() => handleProductClick(product)}
                  >
                    <div className="w-12 h-12 relative rounded overflow-hidden bg-gray-100 flex-shrink-0">
                      <Image
                        src={product.imageUrl || '/placeholder-product.jpg'}
                        alt={product.name}
                        fill
                        className="object-cover"
                      />
                    </div>
                    <div className="flex-1 min-w-0">
                      <h4 className="font-medium text-sm truncate">{product.name}</h4>
                      <p className="text-xs text-muted-foreground">
                        ৳{product.price.toLocaleString()}
                      </p>
                    </div>
                  </div>
                ))}
                <div className="border-t p-3">
                  <Button 
                    variant="ghost" 
                    size="sm" 
                    className="w-full justify-start"
                    onClick={handleSearch}
                  >
                    <Search className="mr-2 h-4 w-4" />
                    Search for "{query}"
                  </Button>
                </div>
              </div>
            ) : (
              <div className="p-4 text-center">
                <p className="text-sm text-muted-foreground">No products found</p>
              </div>
            )}
          </CardContent>
        </Card>
      )}
    </div>
  );
}

export function SearchBox(props: SearchBoxProps) {
  return (
    <Suspense fallback={
      <div className={`relative ${props.className || ''}`}>
        <div className="relative">
          <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-muted-foreground" />
          <Input
            type="text"
            placeholder={props.placeholder || 'Search products...'}
            className="pl-10"
            disabled
          />
        </div>
      </div>
    }>
      <SearchBoxInner {...props} />
    </Suspense>
  );
}
