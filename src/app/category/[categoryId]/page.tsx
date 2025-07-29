"use client";
import React, { useState, useEffect, useMemo } from 'react';
import { useParams, useRouter } from 'next/navigation';
import { apiClient } from '@/lib/api-client';
import type { Product, Category as CategoryType, SubCategory, BusinessSettings, HeroBannerSlide, FeaturedImage } from '@/lib/types';
import { ProductCard } from '@/components/product-card';
import { HeroBanner } from '@/components/hero-banner';
import { SubCategoryScroller } from '@/components/sub-category-scroller';
import { Button } from '@/components/ui/button';
import { Skeleton } from '@/components/ui/skeleton';
import { Alert, AlertDescription, AlertTitle } from '@/components/ui/alert';
import { ArrowRight, SearchX, Tag, BookOpen, Palette, Store, Users, Star, TrendingUp, Sparkles } from 'lucide-react';
import Link from 'next/link';
import Image from 'next/image';
import { useSettings } from '@/contexts/settings-context';
import { SearchBox } from '@/components/search-box';
import { FeaturedAttributesSection } from '@/components/featured-attributes-section';

const PRODUCTS_PER_SUB_CATEGORY_ROW = 4;

// Icon mapping for different attribute types
const getAttributeIcon = (attributeName: string) => {
  const name = attributeName.toLowerCase();
  if (name.includes('author')) return BookOpen;
  if (name.includes('color') || name.includes('colour')) return Palette;
  if (name.includes('brand')) return Star;
  if (name.includes('publisher')) return Store;
  return Tag;
};

export default function CategoryPage() {
  const params = useParams();
  const router = useRouter();
  const categoryId = params.categoryId as string;
  const { settings } = useSettings();

  const [category, setCategory] = useState<CategoryType | null>(null);
  const [subCategories, setSubCategories] = useState<SubCategory[]>([]);
  const [products, setProducts] = useState<Product[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  
  const activeCurrency = useMemo(() => {
    const safeAvailableCurrencies = settings?.availableCurrencies && Array.isArray(settings.availableCurrencies) && settings.availableCurrencies.length > 0
      ? settings.availableCurrencies
      : [{ code: 'BDT', symbol: '৳', name: 'Bangladeshi Taka' }];
    const safeDefaultCurrencyCode = settings?.defaultCurrencyCode || 'BDT';
    return safeAvailableCurrencies.find(c => c.code === safeDefaultCurrencyCode) || safeAvailableCurrencies[0] || { symbol: '৳' };
  }, [settings]);

  useEffect(() => {
    const fetchCategoryData = async () => {
    setIsLoading(true);
    if (categoryId) {
        try {
          const [categoriesData, productsData] = await Promise.all([
            apiClient.getCategories({ includeSubCategories: true, includeAttributes: true, includeAttributeValues: true }),
            apiClient.getProducts({ categoryId, status: 'approved', limit: 100 })
          ]);

          const foundCategory = categoriesData.find((c: any) => c.id === categoryId);
        if (!foundCategory) {
          router.push('/'); 
          return;
        }

          // Convert category data format
          const convertedCategory: CategoryType = {
            ...foundCategory,
            featuredImages: foundCategory.featuredImages || [],
            categorySlides: foundCategory.categorySlides || [],
            attributeTypes: foundCategory.attributeTypes || []
          };
          setCategory(convertedCategory);

          // Set subcategories
          setSubCategories(foundCategory.subCategories || []);

          // Convert and filter products
          const convertedProducts = productsData
            .filter((p: any) => p.stock > 0)
            .map((p: any) => ({
              ...p,
              categoryId: p.categoryId,
              subCategoryId: p.subCategoryId,
              sellerId: p.sellerId,
              sellerName: p.sellerName,
              imageUrl: p.imageUrl,
              imageHint: p.imageHint,
              createdAt: new Date(p.createdAt),
              price: parseFloat(p.price)
            }));
          setProducts(convertedProducts);
        } catch (error) {
          console.error('Error fetching category data:', error);
          router.push('/');
        }
      }
      setIsLoading(false);
    };

    fetchCategoryData();
  }, [categoryId, router]);

  const featuredShopByAttributes = useMemo(() => {
    return category?.attributeTypes?.filter(attr => attr.isButtonFeatured) || [];
  }, [category]);

  const featuredSectionAttributes = useMemo(() => {
    return category?.attributeTypes?.filter(attr => attr.isFeaturedSection) || [];
  }, [category]);

  if (isLoading) {
    return (
      <div className="py-2">
        <div className="container mx-auto px-4">
          <Skeleton className="h-10 w-1/3 my-6" />
        </div>
        <Skeleton className="h-32 w-full mb-8" />
        <Skeleton className="h-64 w-full mb-8" />
        <div className="container mx-auto px-4">
           <Skeleton className="h-8 w-1/4 my-6 md:my-12 text-center" />
           <div className="grid grid-cols-2 md:grid-cols-4 gap-4 justify-items-center mb-8">
             {[...Array(4)].map((_,j) => <Skeleton key={j} className="aspect-square w-full max-w-[200px] md:max-w-[250px] rounded-lg"/>)}
           </div>
          {[1, 2].map(i => (
            <div key={i} className="mb-12">
              <Skeleton className="h-8 w-1/4 mb-6" />
              <div className="grid grid-cols-2 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4 md:gap-6">
                {[...Array(PRODUCTS_PER_SUB_CATEGORY_ROW)].map((_, j) => <ProductCardSkeleton key={j} />)}
              </div>
            </div>
          ))}
        </div>
      </div>
    );
  }

  if (!category) {
    return (
      <div className="container mx-auto px-4 py-8 text-center">
        <Alert variant="destructive">
          <SearchX className="h-5 w-5" />
          <AlertTitle>Category Not Found</AlertTitle>
          <AlertDescription>The category you are looking for does not exist.</AlertDescription>
        </Alert>
        <Button asChild className="mt-6">
          <Link href="/">Go to Homepage</Link>
        </Button>
      </div>
    );
  }

  const productsBySubCategory = (subCatId: string) => {
    return products.filter(p => p.subCategoryId === subCatId && p.stock > 0).slice(0, PRODUCTS_PER_SUB_CATEGORY_ROW);
  };
  
  const validFeaturedImages = category.featuredImages?.filter(
      img => img.imageUrl && img.imageUrl !== 'https://placehold.co/300x300.png'
  ) || [];

  return (
    <div className="py-2">
      {/* Category Header */}
      <div className="bg-gradient-to-b from-primary/5 to-background">
        <div className="container mx-auto px-4 py-8">
          <div className="text-center">
            <h1 className="text-4xl md:text-5xl font-bold mb-4 bg-gradient-to-r from-primary to-primary/70 bg-clip-text text-transparent">
              {category.name}
            </h1>
            <p className="text-lg text-muted-foreground max-w-2xl mx-auto">
              Discover amazing {category.name.toLowerCase()} products from trusted sellers
            </p>
            <div className="flex items-center justify-center gap-4 mt-4 text-sm text-muted-foreground">
              <span className="flex items-center gap-1">
                <TrendingUp className="h-4 w-4" />
                {products.length} products available
              </span>
              <span className="flex items-center gap-1">
                <Users className="h-4 w-4" />
                {new Set(products.map(p => p.sellerId)).size} sellers
              </span>
            </div>
          </div>
        </div>

      {/* Search Box - Moved to top */}
      <div className="container mx-auto px-4 py-6">
        <div className="flex justify-center">
          <SearchBox 
            placeholder={`Search in ${category?.name || 'this category'}...`}
            categoryId={category?.id}
            showContextLabel={true}
            className="max-w-md w-full"
          />
        </div>
      </div>
      </div>

      {/* Always show subcategory section */}
      <div className="relative py-6 bg-gradient-to-r from-background via-primary/5 to-background border-y border-border/50">
        <div className="container mx-auto px-4">
          <div className="flex items-center gap-6 overflow-x-auto scrollbar-hide py-4 px-8">
            {/* "All" option for the parent category */}
            <Link
              href={`/browse?categoryId=${categoryId}`}
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
                href={`/browse?categoryId=${categoryId}&subCategoryId=${subCategory.id}`}
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
        </div>
      </div>

      {/* Hero Banner */}
      <HeroBanner slides={category.categorySlides?.filter(s => s.isActive) || []} />

      {/* Featured Images Section */}
      {validFeaturedImages.length > 0 && (
        <section className="my-12">
          <div className="container mx-auto px-4">
            <div className="text-center mb-8">
              <h2 className="text-3xl md:text-4xl font-bold mb-4 flex items-center justify-center gap-2">
                <Sparkles className="h-8 w-8 text-primary" />
                Featured Styles
            </h2>
              <p className="text-lg text-muted-foreground">
                Explore our curated collection of trending styles
              </p>
            </div>
            <div className="grid grid-cols-2 md:grid-cols-4 gap-6 justify-items-center">
              {validFeaturedImages.map((img, i) => ( 
                <Link key={img.id || i} href={img.linkUrl || '#'} className="group block w-full">
                  <div className="relative aspect-square w-full max-w-[250px] bg-gradient-to-br from-gray-100 to-gray-200 rounded-2xl overflow-hidden shadow-lg hover:shadow-xl transition-all duration-300 transform hover:-translate-y-2">
                    <Image 
                      src={img.imageUrl} 
                      alt={img.title || `Featured Style ${i + 1}`} 
                      fill
                      className="object-cover group-hover:scale-110 transition-transform duration-500" 
                      data-ai-hint={img.imageHint || "style fashion"} 
                    />
                    <div className="absolute inset-0 bg-gradient-to-t from-black/60 via-transparent to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-300" />
                    {img.title && (
                      <div className="absolute bottom-4 left-4 right-4 text-white opacity-0 group-hover:opacity-100 transition-opacity duration-300">
                        <p className="font-semibold text-lg">{img.title}</p>
                      </div>
                    )}
                  </div>
                  {img.title && (
                    <p className="mt-3 text-center font-medium group-hover:text-primary transition-colors">
                      {img.title}
                    </p>
                  )}
                </Link>
              ))}
            </div>
          </div>
        </section>
      )}



      {/* Featured Attributes Section */}
      <div className="container mx-auto px-4 my-12">
        <FeaturedAttributesSection 
          categoryId={categoryId} 
          featuredAttributes={featuredSectionAttributes} 
        />
      </div>

      {/* Shop By Attribute Buttons */}
      {featuredShopByAttributes.length > 0 && (
        <section className="my-12 bg-gradient-to-r from-primary/5 via-background to-primary/5">
          <div className="container mx-auto px-4 py-12">
            <div className="text-center mb-8">
              <h2 className="text-3xl md:text-4xl font-bold mb-4">
                Shop by Category
              </h2>
              <p className="text-lg text-muted-foreground">
                Find exactly what you're looking for
              </p>
            </div>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6 max-w-4xl mx-auto">
              {featuredShopByAttributes.map(attr => {
                const IconComponent = getAttributeIcon(attr.name);
                return (
                  <button
                    key={attr.id}
                    className="group relative bg-white rounded-2xl shadow-lg hover:shadow-xl p-6 text-center transition-all duration-300 transform hover:-translate-y-1 border border-gray-100 hover:border-primary/20"
                    onClick={() => router.push(`/attribute-values/${attr.id}`)}
                  >
                    <div className="relative">
                      <div className="inline-flex items-center justify-center w-16 h-16 bg-gradient-to-br from-primary to-primary/80 rounded-full mb-4 group-hover:scale-110 transition-transform duration-300">
                        <IconComponent className="h-8 w-8 text-white" />
                      </div>
                      <h3 className="text-xl font-bold mb-2 group-hover:text-primary transition-colors">
                        Shop by {attr.name}
                      </h3>
                      <p className="text-muted-foreground text-sm">
                        Browse all {attr.name.toLowerCase()}s
                      </p>
                      <div className="absolute inset-0 bg-gradient-to-r from-primary/5 to-transparent opacity-0 group-hover:opacity-100 rounded-2xl transition-opacity duration-300" />
                    </div>
                  </button>
                );
              })}
            </div>
          </div>
        </section>
      )}

      {/* Products by Subcategory */}
      {subCategories.map(subCat => (
        <section key={subCat.id} id={`subcategory-products-${subCat.id}`} className="mb-16">
          <div className="container mx-auto px-4">
            <div className="flex items-center justify-between mb-6">
              <h2 className="text-2xl md:text-3xl font-bold">
                {subCat.name}
              </h2>
              {products.filter(p => p.subCategoryId === subCat.id && p.stock > 0).length > PRODUCTS_PER_SUB_CATEGORY_ROW && (
                <Button variant="outline" asChild className="group">
                  <Link href={`/category/${category.id}?subcategory=${subCat.id}`}>
                    View All 
                    <ArrowRight className="ml-2 h-4 w-4 group-hover:translate-x-1 transition-transform" />
                  </Link>
                </Button>
              )}
            </div>
            
            {productsBySubCategory(subCat.id).length > 0 ? (
              <div className="grid grid-cols-2 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4 md:gap-6">
                {productsBySubCategory(subCat.id).map(product => (
                  <ProductCard key={product.id} product={product} />
                ))}
              </div>
            ) : (
              <div className="text-center py-12 bg-gray-50 rounded-lg">
                <SearchX className="h-12 w-12 text-gray-400 mx-auto mb-4" />
                <p className="text-gray-500">No products available in {subCat.name} yet.</p>
              </div>
            )}
          </div>
        </section>
      ))}

      {/* All Products Section (if no subcategories) */}
      {subCategories.length === 0 && products.length > 0 && (
        <section className="mb-16">
          <div className="container mx-auto px-4">
            <h2 className="text-2xl md:text-3xl font-bold mb-6">
              All {category.name} Products
                </h2>
             <div className="grid grid-cols-2 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4 md:gap-6">
              {products.slice(0, 12).map(product => (
                <ProductCard key={product.id} product={product} />
              ))}
            </div>
            {products.length > 12 && (
              <div className="text-center mt-8">
                <Button asChild variant="outline" size="lg">
                  <Link href={`/search?category=${category.id}`}>
                    View All {products.length} Products
                    <ArrowRight className="ml-2 h-4 w-4" />
                  </Link>
                </Button>
              </div>
            )}
          </div>
        </section>
      )}
    </div>
  );
}

const ProductCardSkeleton = () => (
  <div className="space-y-3">
    <Skeleton className="aspect-square w-full rounded-lg" />
    <Skeleton className="h-4 w-full" />
    <Skeleton className="h-4 w-2/3" />
    <Skeleton className="h-6 w-1/2" />
  </div>
);
