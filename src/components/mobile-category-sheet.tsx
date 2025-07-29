"use client";

import React, { useState, useEffect } from 'react';
import { Sheet, SheetContent, SheetHeader, SheetTitle, SheetClose } from '@/components/ui/sheet';
import { Button } from '@/components/ui/button';
import { ScrollArea } from '@/components/ui/scroll-area';
import { apiClient } from '@/lib/api-client';
import type { Category as CategoryType, SubCategory as SubCategoryType } from '@/lib/types';
import { X as CloseIcon, ArrowLeft } from 'lucide-react';
import { useRouter } from 'next/navigation';

interface MobileCategorySheetProps {
  isOpen: boolean;
  onOpenChange: (open: boolean) => void;
}

export function MobileCategorySheet({ isOpen, onOpenChange }: MobileCategorySheetProps) {
  const router = useRouter();
  const [view, setView] = useState<'categories' | 'subcategories'>('categories');
  const [selectedParentCategory, setSelectedParentCategory] = useState<CategoryType | null>(null);
  const [parentCategories, setParentCategories] = useState<CategoryType[]>([]);
  const [subCategories, setSubCategories] = useState<SubCategoryType[]>([]);
  const [subcategoriesToShow, setSubcategoriesToShow] = useState<SubCategoryType[]>([]);
  const [isLoading, setIsLoading] = useState(false);

  useEffect(() => {
    if (!isOpen) {
      const timer = setTimeout(() => {
        setView('categories');
        setSelectedParentCategory(null);
      }, 300);
      return () => clearTimeout(timer);
    }
  }, [isOpen]);

  useEffect(() => {
    const fetchCategories = async () => {
      setIsLoading(true);
      try {
        const categories = await apiClient.getCategories({ includeSubCategories: true });
        const parentCats = categories.filter((cat: any) => !cat.parent_id);
        const subCats = categories.filter((cat: any) => cat.parent_id);
        setParentCategories(parentCats);
        setSubCategories(subCats);
      } catch (error) {
        console.error('Error fetching categories:', error);
        setParentCategories([]);
        setSubCategories([]);
      } finally {
        setIsLoading(false);
      }
    };
    fetchCategories();
  }, []);

  useEffect(() => {
    if (view === 'subcategories' && selectedParentCategory) {
      setSubcategoriesToShow(subCategories.filter(sc => sc.parentCategoryId === selectedParentCategory.id));
    } else {
      setSubcategoriesToShow([]);
    }
  }, [view, selectedParentCategory, subCategories]);

  const handleParentCategorySelect = (category: CategoryType) => {
    setSelectedParentCategory(category);
    setView('subcategories');
  };

  const handleNavigation = (categoryId: string, subCategoryId?: string) => {
    let path = `/browse?categoryId=${encodeURIComponent(categoryId)}`;
    if (subCategoryId) {
      path += `&subCategoryId=${encodeURIComponent(subCategoryId)}`;
    }
    router.push(path);
    onOpenChange(false); 
  };

  const renderHeader = () => {
    return (
      <SheetHeader className="p-4 border-b sticky top-0 bg-background z-10">
        <div className="flex items-center justify-between">
          {view === 'subcategories' && (
            <Button variant="ghost" size="icon" onClick={() => setView('categories')} className="mr-2">
              <ArrowLeft className="h-5 w-5" />
              <span className="sr-only">Back to categories</span>
            </Button>
          )}
          <SheetTitle className={`text-lg font-semibold flex-grow ${view === 'categories' || !selectedParentCategory ? 'text-center' : 'text-left'}`}>
            {view === 'categories' ? 'Browse Categories' : selectedParentCategory?.name || 'Subcategories'}
          </SheetTitle>
          <SheetClose asChild>
            <Button variant="ghost" size="icon" aria-label="Close category browser">
              <CloseIcon className="h-5 w-5" />
            </Button>
          </SheetClose>
        </div>
      </SheetHeader>
    );
  };

  return (
    <Sheet open={isOpen} onOpenChange={onOpenChange}>
      <SheetContent
        side="bottom"
        className="p-0 flex flex-col max-h-[60vh] h-auto rounded-t-xl outline-none"
        onOpenAutoFocus={(e) => e.preventDefault()}
      >
        {renderHeader()}
        <ScrollArea className="flex-grow">
          <div className="p-4">
            {view === 'categories' ? (
              isLoading ? (
                <p className="text-muted-foreground text-center py-8">Loading...</p>
              ) : parentCategories.length > 0 ? (
                <div className="grid grid-cols-2 gap-3 sm:gap-4">
                  {parentCategories.map((category) => (
                    <Button
                      key={category.id}
                      variant="outline"
                      className="h-auto py-4 flex flex-col items-center justify-center text-center shadow-sm hover:shadow-md focus:ring-2 focus:ring-primary transition-all duration-150 ease-in-out"
                      onClick={() => handleParentCategorySelect(category)}
                    >
                      <span className="text-sm font-medium text-foreground">{category.name}</span>
                    </Button>
                  ))}
                </div>
              ) : (
                <p className="text-muted-foreground text-center py-8">No categories available.</p>
              )
            ) : selectedParentCategory && (
              <div className="space-y-2">
                <Button
                  variant="secondary"
                  className="w-full justify-start py-3 text-left text-sm h-auto focus:ring-2 focus:ring-primary"
                  onClick={() => handleNavigation(selectedParentCategory.id)}
                >
                  All {selectedParentCategory.name}
                </Button>
                {subcategoriesToShow.length > 0 ? (
                  subcategoriesToShow.map((subcategory) => (
                    <Button
                      key={subcategory.id}
                      variant="ghost"
                      className="w-full justify-start py-3 text-left text-sm h-auto text-muted-foreground hover:text-foreground focus:ring-2 focus:ring-primary"
                      onClick={() => handleNavigation(selectedParentCategory.id, subcategory.id)}
                    >
                      {subcategory.name}
                    </Button>
                  ))
                ) : (
                  <p className="text-sm text-muted-foreground text-center py-6">No subcategories found for {selectedParentCategory.name}.</p>
                )}
              </div>
            )}
          </div>
        </ScrollArea>
      </SheetContent>
    </Sheet>
  );
}
