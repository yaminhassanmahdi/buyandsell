"use client";
import type { SubCategory } from '@/lib/types';
import Image from 'next/image';
import { Tag, ChevronLeft, ChevronRight } from 'lucide-react';
import Link from 'next/link';
import { Button } from '@/components/ui/button';
import { useRef, useState, useEffect } from 'react';

interface SubCategoryScrollerProps {
  subCategories: SubCategory[];
  parentCategoryId: string;
}

export function SubCategoryScroller({ subCategories, parentCategoryId }: SubCategoryScrollerProps) {
  const scrollContainerRef = useRef<HTMLDivElement>(null);
  const [canScrollLeft, setCanScrollLeft] = useState(false);
  const [canScrollRight, setCanScrollRight] = useState(false);


  const checkScrollButtons = () => {
    if (scrollContainerRef.current) {
      const { scrollLeft, scrollWidth, clientWidth } = scrollContainerRef.current;
      setCanScrollLeft(scrollLeft > 0);
      setCanScrollRight(scrollLeft < scrollWidth - clientWidth - 1);
    }
  };

  useEffect(() => {
    checkScrollButtons();
    const handleResize = () => checkScrollButtons();
    window.addEventListener('resize', handleResize);
    return () => window.removeEventListener('resize', handleResize);
  }, [subCategories]);

  const scroll = (direction: 'left' | 'right') => {
    if (scrollContainerRef.current) {
      const scrollAmount = 200;
      const newScrollLeft = scrollContainerRef.current.scrollLeft + (direction === 'left' ? -scrollAmount : scrollAmount);
      scrollContainerRef.current.scrollTo({
        left: newScrollLeft,
        behavior: 'smooth'
      });
    }
  };

  return (
    <div className="relative py-6 bg-gradient-to-r from-background via-primary/5 to-background border-y border-border/50">
      <div className="container mx-auto px-4">
        <div className="relative">
          {/* Left scroll button */}
          {canScrollLeft && (
            <Button
              variant="outline"
              size="sm"
              className="absolute left-0 top-1/2 -translate-y-1/2 z-10 bg-background/80 backdrop-blur-sm border-primary/20 hover:bg-primary hover:text-primary-foreground shadow-lg"
              onClick={() => scroll('left')}
            >
              <ChevronLeft className="h-4 w-4" />
            </Button>
          )}

          {/* Right scroll button */}
          {canScrollRight && (
            <Button
              variant="outline"
              size="sm"
              className="absolute right-0 top-1/2 -translate-y-1/2 z-10 bg-background/80 backdrop-blur-sm border-primary/20 hover:bg-primary hover:text-primary-foreground shadow-lg"
              onClick={() => scroll('right')}
            >
              <ChevronRight className="h-4 w-4" />
            </Button>
          )}

          {/* Scrollable content */}
          <div 
            ref={scrollContainerRef}
            className="flex items-center gap-6 overflow-x-auto scrollbar-hide py-4 px-8"
            onScroll={checkScrollButtons}
          >
            {/* "All" option for the parent category */}
            <Link
              href={`/browse?categoryId=${parentCategoryId}`}
              className="flex flex-col items-center justify-center group min-w-[100px] text-center"
              aria-label={`View all products in this category`}
            >
              <div className="relative w-20 h-20 mb-3 rounded-2xl overflow-hidden border-2 border-primary/20 group-hover:border-primary transition-all duration-300 ease-out flex items-center justify-center bg-gradient-to-br from-primary/10 to-primary/5 group-hover:from-primary/20 group-hover:to-primary/10 shadow-lg group-hover:shadow-xl transform group-hover:-translate-y-1">
                <Tag className="h-10 w-10 text-primary group-hover:scale-110 transition-transform duration-300" />
                <div className="absolute inset-0 bg-gradient-to-t from-primary/20 via-transparent to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-300" />
              </div>
              <span className="text-sm font-semibold text-foreground group-hover:text-primary transition-colors duration-300">
                All Products
              </span>
            </Link>

            {subCategories.map((subCategory, index) => (
              <Link
                key={subCategory.id}
                href={`/browse?categoryId=${parentCategoryId}&subCategoryId=${subCategory.id}`}
                className="flex flex-col items-center justify-center group min-w-[100px] text-center"
                aria-label={`View products in ${subCategory.name}`}
                style={{ animationDelay: `${index * 100}ms` }}
              >
                <div className="relative w-20 h-20 mb-3 rounded-2xl overflow-hidden border-2 border-border group-hover:border-primary transition-all duration-300 ease-out shadow-lg group-hover:shadow-xl transform group-hover:-translate-y-1">
                  {subCategory.imageUrl ? (
                    <>
                      <Image
                        src={subCategory.imageUrl}
                        alt={subCategory.name}
                        fill
                        sizes="80px"
                        className="object-cover group-hover:scale-110 transition-transform duration-500 ease-out"
                        data-ai-hint={subCategory.imageHint || subCategory.name.toLowerCase().split(" ")[0] || "subcategory"}
                      />
                      <div className="absolute inset-0 bg-gradient-to-t from-black/40 via-transparent to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-300" />
                    </>
                  ) : (
                    <div className="w-full h-full flex items-center justify-center bg-gradient-to-br from-gray-100 to-gray-200 group-hover:from-primary/20 group-hover:to-primary/10 transition-all duration-300">
                      <Tag className="h-10 w-10 text-muted-foreground group-hover:text-primary group-hover:scale-110 transition-all duration-300" />
                    </div>
                  )}
                  
                  {/* Shine effect on hover */}
                  <div className="absolute inset-0 opacity-0 group-hover:opacity-100 transition-opacity duration-300">
                    <div className="absolute inset-0 bg-gradient-to-r from-transparent via-white/20 to-transparent transform -skew-x-12 -translate-x-full group-hover:translate-x-full transition-transform duration-700" />
                  </div>
                </div>
                <span className="text-sm font-medium text-foreground group-hover:text-primary transition-colors duration-300 line-clamp-2 leading-tight">
                  {subCategory.name}
                </span>
              </Link>
            ))}
          </div>

          {/* Fade effects for better visual */}
          <div className="absolute left-0 top-0 bottom-0 w-8 bg-gradient-to-r from-background to-transparent pointer-events-none" />
          <div className="absolute right-0 top-0 bottom-0 w-8 bg-gradient-to-l from-background to-transparent pointer-events-none" />
        </div>
      </div>
    </div>
  );
}
