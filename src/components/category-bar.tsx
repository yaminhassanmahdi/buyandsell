"use client";
import Link from 'next/link';
import { apiClient } from '@/lib/api-client';
import Image from 'next/image';
import { Tag, Grid3X3 } from 'lucide-react';
import type { Category } from '@/lib/types';
import { useEffect, useState } from 'react';
import useLocalStorage from '@/hooks/use-local-storage';
import { CATEGORIES_STORAGE_KEY, INITIAL_CATEGORIES } from '@/lib/constants';


export function CategoryBar() {
  const [storedCategories] = useLocalStorage<Category[]>(CATEGORIES_STORAGE_KEY, INITIAL_CATEGORIES);
  const [sortedCategories, setSortedCategories] = useState<Category[]>([]);

  useEffect(() => {
    const fetchCategories = async () => {
      try {
        const categoriesData = await apiClient.getCategories();
        const sorted = [...categoriesData].sort((a, b) => 
          (a.sort_order ?? 999) - (b.sort_order ?? 999) || a.name.localeCompare(b.name)
        );
        
        // Convert API format to component format
        const convertedCategories = sorted.map((cat: any) => ({
          ...cat,
          imageUrl: cat.imageUrl,
          imageHint: cat.imageHint,
          sortOrder: cat.sort_order
        }));
        
        setSortedCategories(convertedCategories);
      } catch (error) {
        console.error('Error fetching categories:', error);
        // Fallback to stored or initial categories
        const categoriesToDisplay = Array.isArray(storedCategories) && storedCategories.length > 0 ? storedCategories : INITIAL_CATEGORIES;
        const sorted = [...categoriesToDisplay].sort((a, b) => 
          (a.sortOrder ?? 999) - (b.sortOrder ?? 999) || a.name.localeCompare(b.name)
        );
        setSortedCategories(sorted);
      }
    };

    fetchCategories();
  }, [storedCategories]);


  return (
    <div className="bg-background shadow-sm">
      <div className="container mx-auto px-0 sm:px-4">
        <div className="flex items-start gap-3 sm:gap-4 overflow-x-auto scrollbar-hide py-3 px-4 sm:px-0">
          {/* All Products Circle */}
          <Link
            href="/browse"
            className="flex flex-col items-center justify-start group w-20 min-w-[80px] text-center"
          >
            <div className="relative w-16 h-16 mb-1.5 rounded-full overflow-hidden border-2 border-primary bg-primary/10 group-hover:border-primary/80 transition-all duration-200 ease-in-out">
              <div className="w-full h-full flex items-center justify-center">
                <Grid3X3 className="h-8 w-8 text-primary" />
              </div>
            </div>
            <span className="text-xs font-medium text-foreground group-hover:text-primary transition-colors line-clamp-2 break-words">
              All Products
            </span>
          </Link>
          
          {/* Regular Categories */}
          {sortedCategories.map((category) => (
            <Link
              key={category.id}
              href={`/category/${category.id}`} 
              className="flex flex-col items-center justify-start group w-20 min-w-[80px] text-center"
            >
              <div className="relative w-16 h-16 mb-1.5 rounded-full overflow-hidden border-2 border-border group-hover:border-primary transition-all duration-200 ease-in-out">
                {category.imageUrl ? (
                  <Image
                    src={category.imageUrl}
                    alt={category.name}
                    fill
                    sizes="64px"
                    className="object-cover group-hover:scale-105 transition-transform duration-200 ease-in-out"
                    data-ai-hint={category.imageHint || category.name.toLowerCase().split(" ")[0] || "category"}
                  />
                ) : (
                  <div className="w-full h-full flex items-center justify-center bg-muted rounded-full">
                    <Tag className="h-8 w-8 text-muted-foreground" />
                  </div>
                )}
              </div>
              <span className="text-xs font-medium text-foreground group-hover:text-primary transition-colors line-clamp-2 break-words">
                {category.name}
              </span>
            </Link>
          ))}
        </div>
      </div>
    </div>
  );
}
