
"use client";
import type { SubCategory } from '@/lib/types';
import Image from 'next/image';
import Link from 'next/link'; // Or just buttons if filtering on same page
import { Tag } from 'lucide-react';

interface SubCategoryScrollerProps {
  subCategories: SubCategory[];
  parentCategoryId: string;
  onSubCategorySelect?: (subCategoryId: string | null) => void; // For same-page filtering
}

export function SubCategoryScroller({ subCategories, parentCategoryId, onSubCategorySelect }: SubCategoryScrollerProps) {
  if (!subCategories || subCategories.length === 0) {
    return null;
  }

  const handleSelect = (subCategoryId: string | null) => {
    if (onSubCategorySelect) {
      onSubCategorySelect(subCategoryId);
      // Scroll to relevant product section
      const elementId = subCategoryId ? `subcategory-${subCategoryId}` : `category-${parentCategoryId}-all`;
      const element = document.getElementById(elementId);
      if (element) {
        element.scrollIntoView({ behavior: 'smooth', block: 'start' });
      }
    }
  };

  return (
    <div className="py-4 bg-background">
      <div className="container mx-auto px-0 sm:px-4">
        <div className="flex items-start gap-4 overflow-x-auto scrollbar-hide py-3 px-4 sm:px-0">
          {/* "All" option for the parent category */}
          <button
            onClick={() => handleSelect(null)}
            className="flex flex-col items-center justify-start group w-24 min-w-[96px] text-center"
          >
            <div className="relative w-20 h-20 mb-1.5 rounded-full overflow-hidden border-2 border-border group-hover:border-primary transition-all duration-200 ease-in-out flex items-center justify-center bg-muted">
              <Tag className="h-10 w-10 text-muted-foreground" />
            </div>
            <span className="text-sm font-medium text-foreground group-hover:text-primary transition-colors line-clamp-2 break-words">
              All
            </span>
          </button>

          {subCategories.map((subCategory) => (
            <button
              key={subCategory.id}
              onClick={() => handleSelect(subCategory.id)}
              className="flex flex-col items-center justify-start group w-24 min-w-[96px] text-center"
            >
              <div className="relative w-20 h-20 mb-1.5 rounded-full overflow-hidden border-2 border-border group-hover:border-primary transition-all duration-200 ease-in-out">
                {subCategory.imageUrl ? (
                  <Image
                    src={subCategory.imageUrl}
                    alt={subCategory.name}
                    fill
                    sizes="80px"
                    className="object-cover group-hover:scale-105 transition-transform duration-200 ease-in-out"
                    data-ai-hint={subCategory.imageHint || subCategory.name.toLowerCase().split(" ")[0] || "subcategory"}
                  />
                ) : (
                  <div className="w-full h-full flex items-center justify-center bg-muted rounded-full">
                    <Tag className="h-10 w-10 text-muted-foreground" />
                  </div>
                )}
              </div>
              <span className="text-sm font-medium text-foreground group-hover:text-primary transition-colors line-clamp-2 break-words">
                {subCategory.name}
              </span>
            </button>
          ))}
        </div>
      </div>
    </div>
  );
}
