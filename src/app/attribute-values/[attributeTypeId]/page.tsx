"use client";
import React, { useState, useEffect, useMemo } from 'react';
import { useParams, useRouter } from 'next/navigation';
import { apiClient } from '@/lib/api-client';
import type { CategoryAttributeType, CategoryAttributeValue } from '@/lib/types';
import { Button } from '@/components/ui/button';
import { Skeleton } from '@/components/ui/skeleton';
import { Alert, AlertDescription, AlertTitle } from '@/components/ui/alert';
import { ArrowLeft, SearchX, Tag, User, Palette } from 'lucide-react';
import Link from 'next/link';
import Image from 'next/image';
import { Card } from '@/components/ui/card';
import { Breadcrumb, BreadcrumbItem, BreadcrumbLink, BreadcrumbList, BreadcrumbPage, BreadcrumbSeparator } from '@/components/ui/breadcrumb';

// Icon mapping for different attribute types
const getAttributeIcon = (attributeName: string) => {
  const name = attributeName.toLowerCase();
  if (name.includes('author') || name.includes('writer')) return User;
  if (name.includes('color') || name.includes('colour')) return Palette;
  return Tag;
};

export default function AttributeValuesPage() {
  const params = useParams();
  const router = useRouter();
  const attributeTypeId = params.attributeTypeId as string;

  const [attributeType, setAttributeType] = useState<CategoryAttributeType | null>(null);
  const [attributeValues, setAttributeValues] = useState<CategoryAttributeValue[]>([]);
  const [categoryName, setCategoryName] = useState<string>('');
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    const fetchAttributeData = async () => {
      setIsLoading(true);
      try {
        // Fetch categories with attributes and values
        const categoriesData = await apiClient.getCategories({ 
          includeAttributes: true, 
          includeAttributeValues: true 
        });

        // Find the attribute type and its values
        let foundAttributeType: CategoryAttributeType | null = null;
        let foundCategoryName = '';

        for (const category of categoriesData) {
          const attrType = category.attributeTypes?.find((attr: any) => attr.id === attributeTypeId);
          if (attrType) {
            foundAttributeType = attrType;
            foundCategoryName = category.name;
            break;
          }
        }

        if (!foundAttributeType) {
          router.push('/');
          return;
        }

        setAttributeType(foundAttributeType);
        setAttributeValues(foundAttributeType.values || []);
        setCategoryName(foundCategoryName);
      } catch (error) {
        console.error('Error fetching attribute data:', error);
        router.push('/');
      } finally {
        setIsLoading(false);
      }
    };

    if (attributeTypeId) {
      fetchAttributeData();
    }
  }, [attributeTypeId, router]);

  if (isLoading) {
    return (
      <div className="container mx-auto px-4 py-6">
        <Skeleton className="h-8 w-1/3 mb-6" />
        <Skeleton className="h-10 w-1/2 mb-8" />
        <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 xl:grid-cols-6 gap-6">
          {[...Array(12)].map((_, i) => (
            <div key={i} className="space-y-3">
              <Skeleton className="aspect-square w-full rounded-full" />
              <Skeleton className="h-4 w-full" />
            </div>
          ))}
        </div>
      </div>
    );
  }

  if (!attributeType) {
    return (
      <div className="container mx-auto px-4 py-8 text-center">
        <Alert variant="destructive">
          <SearchX className="h-5 w-5" />
          <AlertTitle>Attribute Not Found</AlertTitle>
          <AlertDescription>The attribute you are looking for does not exist.</AlertDescription>
        </Alert>
        <Button asChild className="mt-6">
          <Link href="/">Go to Homepage</Link>
        </Button>
      </div>
    );
  }

  const IconComponent = getAttributeIcon(attributeType.name);

  return (
    <div className="container mx-auto px-4 py-6">
      {/* Breadcrumb */}
      <Breadcrumb className="mb-6">
        <BreadcrumbList>
          <BreadcrumbItem>
            <BreadcrumbLink asChild><Link href="/">Home</Link></BreadcrumbLink>
          </BreadcrumbItem>
          <BreadcrumbSeparator />
          <BreadcrumbItem>
            <BreadcrumbLink asChild>
              <Link href={`/category/${attributeType.categoryId}`}>{categoryName}</Link>
            </BreadcrumbLink>
          </BreadcrumbItem>
          <BreadcrumbSeparator />
          <BreadcrumbItem>
            <BreadcrumbPage>{attributeType.name}</BreadcrumbPage>
          </BreadcrumbItem>
        </BreadcrumbList>
      </Breadcrumb>

      {/* Header */}
      <div className="text-center mb-8">
        <h1 className="text-3xl md:text-4xl font-bold mb-4 flex items-center justify-center gap-2">
          <IconComponent className="h-8 w-8 text-primary" />
          Browse by {attributeType.name}
        </h1>
        <p className="text-lg text-muted-foreground">
          Choose a {attributeType.name.toLowerCase()} to see related products
        </p>
      </div>

      {/* Attribute Values Grid */}
      {attributeValues.length > 0 ? (
        <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 xl:grid-cols-6 gap-6">
          {attributeValues.map((value) => (
            <Link
              key={value.id}
              href={`/browse?categoryId=${attributeType.categoryId}&${attributeType.id}=${value.id}`}
              className="group block"
            >
              <Card className="p-6 text-center hover:shadow-lg transition-all duration-300 hover:-translate-y-1">
                <div className="w-20 h-20 md:w-24 md:h-24 mx-auto mb-4 relative rounded-full overflow-hidden border-3 border-primary/20 group-hover:border-primary/60 transition-colors duration-300">
                  {value.imageUrl ? (
                    <Image
                      src={value.imageUrl}
                      alt={value.value}
                      fill
                      className="object-cover group-hover:scale-110 transition-transform duration-500"
                      data-ai-hint={value.imageHint || `${attributeType.name.toLowerCase()} ${value.value.toLowerCase()}`}
                    />
                  ) : (
                    <div className="w-full h-full flex items-center justify-center bg-gradient-to-br from-gray-100 to-gray-200 group-hover:from-primary/20 group-hover:to-primary/10 transition-all duration-300">
                      <IconComponent className="h-8 w-8 text-muted-foreground group-hover:text-primary group-hover:scale-110 transition-all duration-300" />
                    </div>
                  )}
                  
                  {/* Shine effect */}
                  <div className="absolute inset-0 opacity-0 group-hover:opacity-100 transition-opacity duration-300">
                    <div className="absolute inset-0 bg-gradient-to-r from-transparent via-white/20 to-transparent transform -skew-x-12 -translate-x-full group-hover:translate-x-full transition-transform duration-700" />
                  </div>
                </div>
                
                <h3 className="font-medium text-sm group-hover:text-primary transition-colors duration-300 line-clamp-2">
                  {value.value}
                </h3>
              </Card>
            </Link>
          ))}
        </div>
      ) : (
        <div className="text-center py-12">
          <SearchX className="h-12 w-12 text-gray-400 mx-auto mb-4" />
          <p className="text-gray-500">No {attributeType.name.toLowerCase()} values available yet.</p>
        </div>
      )}

      {/* Back Button */}
      <div className="mt-12 text-center">
        <Button variant="outline" asChild>
          <Link href={`/category/${attributeType.categoryId}`}>
            <ArrowLeft className="mr-2 h-4 w-4" />
            Back to {categoryName}
          </Link>
        </Button>
      </div>
    </div>
  );
} 