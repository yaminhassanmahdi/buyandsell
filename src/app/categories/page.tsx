"use client";
import { useEffect, useState } from 'react';
import { apiClient } from '@/lib/api-client';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Breadcrumb, BreadcrumbItem, BreadcrumbLink, BreadcrumbList, BreadcrumbPage, BreadcrumbSeparator } from '@/components/ui/breadcrumb';
import { Badge } from '@/components/ui/badge';
import { Loader2, Tag, ArrowRight } from 'lucide-react';
import Link from 'next/link';
import Image from 'next/image';
import type { Category } from '@/lib/types';

export default function CategoriesPage() {
  const [categories, setCategories] = useState<Category[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [selectedCategory, setSelectedCategory] = useState<Category | null>(null);
  const [subCategories, setSubCategories] = useState<any[]>([]);

  useEffect(() => {
    const fetchCategories = async () => {
      try {
        setIsLoading(true);
        const categoriesData = await apiClient.getCategories({ includeSubCategories: true });
        setCategories(categoriesData);
      } catch (error) {
        console.error('Error fetching categories:', error);
      } finally {
        setIsLoading(false);
      }
    };

    fetchCategories();
  }, []);

  const handleCategoryClick = (category: Category) => {
    setSelectedCategory(category);
    setSubCategories((category as any).subCategories || []);
  };

  const handleBackToCategories = () => {
    setSelectedCategory(null);
    setSubCategories([]);
  };

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
      {/* Breadcrumb */}
      <Breadcrumb className="mb-6">
        <BreadcrumbList>
          <BreadcrumbItem>
            <BreadcrumbLink asChild><Link href="/">Home</Link></BreadcrumbLink>
          </BreadcrumbItem>
          <BreadcrumbSeparator />
          {selectedCategory ? (
            <>
              <BreadcrumbItem>
                <BreadcrumbLink 
                  href="#" 
                  onClick={(e) => { e.preventDefault(); handleBackToCategories(); }} 
                  className="hover:text-primary"
                >
                  Categories
                </BreadcrumbLink>
              </BreadcrumbItem>
              <BreadcrumbSeparator />
              <BreadcrumbItem>
                <BreadcrumbPage>{selectedCategory.name}</BreadcrumbPage>
              </BreadcrumbItem>
            </>
          ) : (
            <BreadcrumbItem>
              <BreadcrumbPage>All Categories</BreadcrumbPage>
            </BreadcrumbItem>
          )}
        </BreadcrumbList>
      </Breadcrumb>

      {/* Page Header */}
      <div className="mb-8">
        <h1 className="text-3xl font-bold mb-2">
          {selectedCategory ? `${selectedCategory.name} - Subcategories` : 'All Categories'}
        </h1>
        <p className="text-muted-foreground">
          {selectedCategory 
            ? `Explore subcategories within ${selectedCategory.name}` 
            : 'Browse all product categories and find what you\'re looking for'
          }
        </p>
      </div>

      {/* Categories or Subcategories Grid */}
      {selectedCategory ? (
        // Subcategories View
        <div className="space-y-6">
          {/* All Products in Category Card */}
          <Link href={`/category/${selectedCategory.id}`}>
            <Card className="hover:shadow-lg transition-shadow cursor-pointer">
              <CardHeader className="pb-4">
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-3">
                    <div className="w-12 h-12 rounded-lg bg-primary/10 flex items-center justify-center">
                      <Tag className="h-6 w-6 text-primary" />
                    </div>
                    <div>
                      <CardTitle className="text-xl">All {selectedCategory.name}</CardTitle>
                      <CardDescription>View all products in this category</CardDescription>
                    </div>
                  </div>
                  <ArrowRight className="h-5 w-5 text-muted-foreground" />
                </div>
              </CardHeader>
            </Card>
          </Link>

          {/* Subcategories */}
          {subCategories.length > 0 ? (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {subCategories.map((subCategory: any) => (
                <Link key={subCategory.id} href={`/browse?categoryId=${selectedCategory.id}&subCategoryId=${subCategory.id}`}>
                  <Card className="hover:shadow-lg transition-shadow cursor-pointer">
                    <CardHeader>
                      <div className="flex items-center justify-between">
                        <div className="flex items-center gap-3">
                          <div className="w-10 h-10 rounded-lg bg-muted flex items-center justify-center">
                            {subCategory.imageUrl ? (
                              <Image
                                src={subCategory.imageUrl}
                                alt={subCategory.name}
                                width={40}
                                height={40}
                                className="object-cover rounded-lg"
                              />
                            ) : (
                              <Tag className="h-5 w-5 text-muted-foreground" />
                            )}
                          </div>
                          <div>
                            <CardTitle className="text-lg">{subCategory.name}</CardTitle>
                            <CardDescription>Browse {subCategory.name.toLowerCase()}</CardDescription>
                          </div>
                        </div>
                        <ArrowRight className="h-4 w-4 text-muted-foreground" />
                      </div>
                    </CardHeader>
                  </Card>
                </Link>
              ))}
            </div>
          ) : (
            <Card>
              <CardContent className="text-center py-12">
                <Tag className="h-12 w-12 text-muted-foreground mx-auto mb-4" />
                <h3 className="text-lg font-semibold mb-2">No Subcategories</h3>
                <p className="text-muted-foreground">
                  This category doesn't have any subcategories. View all products directly.
                </p>
              </CardContent>
            </Card>
          )}
        </div>
      ) : (
        // Main Categories View
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {categories.map((category) => (
            <Card 
              key={category.id} 
              className="hover:shadow-lg transition-shadow cursor-pointer"
              onClick={() => handleCategoryClick(category)}
            >
              <CardHeader>
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-3">
                    <div className="w-12 h-12 rounded-lg overflow-hidden">
                      {category.imageUrl ? (
                        <Image
                          src={category.imageUrl}
                          alt={category.name}
                          width={48}
                          height={48}
                          className="object-cover w-full h-full"
                        />
                      ) : (
                        <div className="w-full h-full bg-muted flex items-center justify-center">
                          <Tag className="h-6 w-6 text-muted-foreground" />
                        </div>
                      )}
                    </div>
                    <div>
                      <CardTitle className="text-xl">{category.name}</CardTitle>
                      <CardDescription>
                        {(category as any).subCategories?.length > 0 
                          ? `${(category as any).subCategories.length} subcategories`
                          : 'Browse products'
                        }
                      </CardDescription>
                    </div>
                  </div>
                  <ArrowRight className="h-5 w-5 text-muted-foreground" />
                </div>
              </CardHeader>
            </Card>
          ))}
        </div>
      )}
    </div>
  );
}
