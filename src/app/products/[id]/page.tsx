"use client";

import Image from 'next/image';
import { useParams, useRouter } from 'next/navigation';
import { apiClient } from '@/lib/api-client';
import type { Product, BusinessSettings, CategoryAttributeType, CategoryAttributeValue } from '@/lib/types';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { useCart } from '@/contexts/cart-context';
import { ArrowLeft, ShoppingCart, UserCircle, CalendarDays, Tag, Layers, Info, PackageCheck, ChevronLeft, ChevronRight } from 'lucide-react';
import { QuantitySelector } from '@/components/quantity-selector';
import React, { useEffect, useState, useMemo } from 'react';
import { Skeleton } from '@/components/ui/skeleton';
import { format } from 'date-fns';
import useLocalStorage from '@/hooks/use-local-storage';
import { BUSINESS_SETTINGS_STORAGE_KEY, DEFAULT_BUSINESS_SETTINGS } from '@/lib/constants';
import { Alert, AlertTitle } from '@/components/ui/alert';
import { SellerName } from '@/components/seller-name';

interface DisplayAttribute {
  typeName: string;
  valueName: string;
}

export default function ProductDetailPage() {
  const params = useParams();
  const router = useRouter();
  const { cartItems, addToCart, updateQuantity } = useCart();
  const [product, setProduct] = useState<Product | null | undefined>(undefined);
  const [quantity, setQuantity] = useState(1);
  const [currentImageIndex, setCurrentImageIndex] = useState(0);
  const [images, setImages] = useState<string[]>([]);

  const [categoryName, setCategoryName] = useState<string>('');
  const [subCategoryName, setSubCategoryName] = useState<string | null>(null);
  const [displayAttributes, setDisplayAttributes] = useState<DisplayAttribute[]>([]);

  const [settings] = useLocalStorage<BusinessSettings>(BUSINESS_SETTINGS_STORAGE_KEY, DEFAULT_BUSINESS_SETTINGS);
  const activeCurrency = useMemo(() => settings?.availableCurrencies?.find(c => c.code === settings?.defaultCurrencyCode) || 
    settings?.availableCurrencies?.[0] || 
    { code: 'BDT', symbol: '৳', name: 'Bangladeshi Taka' }, [settings]);
  const currencySymbol = activeCurrency.symbol;

  useEffect(() => {
    const fetchProduct = async () => {
      if (params.id) {
        try {
          const [productData, categoriesData] = await Promise.all([
            apiClient.getProduct(params.id as string),
            apiClient.getCategories({ includeSubCategories: true, includeAttributes: true })
          ]);

          if (productData) {
            // Convert API format to component format
            const convertedProduct: Product = {
              ...productData,
              categoryId: productData.categoryId,
              subCategoryId: productData.subCategoryId,
              sellerId: productData.sellerId,
              sellerName: productData.sellerName,
              imageUrl: productData.imageUrl,
              imageHint: productData.imageHint,
              createdAt: new Date(productData.createdAt),
              price: parseFloat(productData.price)
            };

            setProduct(convertedProduct);

            // Set up image gallery - support multiple images
            const productImages = [];
            if (productData.imageUrl) {
              productImages.push(productData.imageUrl);
            }
            // Add additional images if they exist (from imageUrls array)
            if (productData.imageUrls && Array.isArray(productData.imageUrls)) {
              productData.imageUrls.forEach((url: string) => {
                if (url && !productImages.includes(url)) {
                  productImages.push(url);
                }
              });
            }
            setImages(productImages.length > 0 ? productImages : [productData.imageUrl || '/placeholder-product.jpg']);

            // Set category name
            const category = categoriesData.find((c: any) => c.id === productData.categoryId);
            setCategoryName(category?.name || 'N/A');

            // Set subcategory name
            let subCategory = null;
            if (productData.subCategoryId) {
              const allSubCategories = await apiClient.getSubCategories();
              subCategory = allSubCategories.find((sc: any) => sc.id === productData.subCategoryId);
            }
            setSubCategoryName(subCategory?.name || 'N/A');

            // Set display attributes
            const attributes: DisplayAttribute[] = [];
            if (productData.selectedAttributes) {
              productData.selectedAttributes.forEach((attr: any) => {
                if (attr.attributeTypeName && attr.attributeValueName) {
                  attributes.push({ typeName: attr.attributeTypeName, valueName: attr.attributeValueName });
                }
              });
            }
            setDisplayAttributes(attributes);
          } else {
            setProduct(null);
          }
        } catch (error) {
          console.error('Error fetching product:', error);
          setProduct(null);
        }
      }
    };

    fetchProduct();
  }, [params.id]);

  const cartItem = cartItems.find(item => item.id === product?.id);
  const currentQuantityInCart = cartItem ? cartItem.quantity : 0;

  const handleImageNavigation = (direction: 'prev' | 'next') => {
    if (direction === 'prev') {
      setCurrentImageIndex(currentImageIndex === 0 ? images.length - 1 : currentImageIndex - 1);
    } else {
      setCurrentImageIndex(currentImageIndex === images.length - 1 ? 0 : currentImageIndex + 1);
    }
  };

  const handleThumbnailClick = (index: number) => {
    setCurrentImageIndex(index);
  };

  if (product === undefined) {
    return (
      <div className="min-h-screen bg-gray-50">
        <div className="container mx-auto px-4 py-8">
          <Skeleton className="h-8 w-32 mb-6" />
          <div className="bg-white rounded-lg shadow-sm overflow-hidden">
            <div className="grid md:grid-cols-2 gap-6 lg:gap-12 items-start">
              <Skeleton className="aspect-square w-full" />
              <div className="p-6">
                <Skeleton className="h-10 w-3/4 mb-2" />
                <Skeleton className="h-6 w-1/4 mb-4" />
                <Skeleton className="h-24 w-full mb-4" />
                <Skeleton className="h-6 w-1/2 mb-2" />
                <Skeleton className="h-6 w-1/3 mb-6" />
                <Skeleton className="h-12 w-full" />
              </div>
            </div>
          </div>
        </div>
      </div>
    );
  }

  if (!product) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <h1 className="text-2xl font-semibold mb-4">Product not found</h1>
          <Button onClick={() => router.push('/')}>Go to Homepage</Button>
        </div>
      </div>
    );
  }

  const handleAddToCart = () => {
    if (product.stock > 0) {
        if (currentQuantityInCart > 0) {
            updateQuantity(product.id, currentQuantityInCart + quantity, product.stock);
        } else {
            addToCart({ ...product, stock: product.stock }, quantity);
        }
        setQuantity(1);
    }
  };

  const isSoldOut = product.stock <= 0;

  return (
    <div className="min-h-screen bg-gray-50">
      <div className="container mx-auto px-4 py-6">
        <Button variant="outline" onClick={() => router.back()} className="mb-6">
          <ArrowLeft className="mr-2 h-4 w-4" /> Back
        </Button>
        
        <div className="bg-white rounded-lg shadow-sm overflow-hidden">
          <div className="grid md:grid-cols-2 gap-8 lg:gap-12">
            {/* Image Gallery Section */}
            <div className="p-6">
              <div className="relative">
                {/* Main Image */}
                <div className="aspect-square relative overflow-hidden rounded-lg bg-gray-100 mb-4">
                  <Image
                    src={images[currentImageIndex]}
                    alt={product.name}
                    fill
                    priority
                    sizes="(max-width: 768px) 100vw, 50vw"
                    className="object-cover"
                    data-ai-hint={product.imageHint || "product item"}
                  />
                  {images.length > 1 && (
                    <>
                      <Button
                        variant="outline"
                        size="icon"
                        className="absolute left-2 top-1/2 transform -translate-y-1/2 bg-white/80 hover:bg-white"
                        onClick={() => handleImageNavigation('prev')}
                      >
                        <ChevronLeft className="h-4 w-4" />
                      </Button>
                      <Button
                        variant="outline"
                        size="icon"
                        className="absolute right-2 top-1/2 transform -translate-y-1/2 bg-white/80 hover:bg-white"
                        onClick={() => handleImageNavigation('next')}
                      >
                        <ChevronRight className="h-4 w-4" />
                      </Button>
                    </>
                  )}
                </div>
                
                {/* Thumbnail Images */}
                {images.length > 1 && (
                  <div className="flex gap-2 overflow-x-auto">
                    {images.map((image, index) => (
                      <button
                        key={index}
                        onClick={() => handleThumbnailClick(index)}
                        className={`flex-shrink-0 w-16 h-16 rounded-md overflow-hidden border-2 transition-colors ${
                          index === currentImageIndex ? 'border-primary' : 'border-gray-200'
                        }`}
                      >
                        <Image
                          src={image}
                          alt={`${product.name} ${index + 1}`}
                          width={64}
                          height={64}
                          className="object-cover w-full h-full"
                        />
                      </button>
                    ))}
                  </div>
                )}
              </div>
            </div>

            {/* Product Information Section */}
            <div className="p-6 md:p-8 flex flex-col">
              {/* Header */}
              <div className="mb-6">
                <div className="flex flex-wrap items-center gap-2 mb-3">
                  <Badge variant="secondary" className="flex items-center gap-1">
                      <Layers className="h-3 w-3" /> {categoryName}
                  </Badge>
                  {subCategoryName && subCategoryName !== 'N/A' && (
                    <Badge variant="outline" className="flex items-center gap-1">
                      {subCategoryName}
                    </Badge>
                  )}
                </div>
                <h1 className="text-3xl md:text-4xl font-bold text-gray-900 mb-4">
                  {product.name}
                </h1>
                <div className="text-3xl md:text-4xl font-bold text-primary mb-6">
                  {currencySymbol}{product.price.toFixed(2)}
                </div>
              </div>

              {/* Seller and Basic Info */}
              <div className="bg-gray-50 rounded-lg p-4 mb-6">
                <div className="space-y-3">
                  <div className="flex items-center gap-2 text-sm">
                    <UserCircle className="h-4 w-4 text-muted-foreground" />
                    <span className="text-muted-foreground">Sold by:</span>
                    {product.sellerName ? (
                      <SellerName sellerId={product.sellerId} sellerName={product.sellerName} variant="link" showIcon />
                    ) : (
                      <span>Unknown Seller</span>
                    )}
                  </div>
                  <div className="flex items-center gap-2 text-sm">
                    <CalendarDays className="h-4 w-4 text-muted-foreground" />
                    <span className="text-muted-foreground">Listed on:</span>
                    <span>{format(new Date(product.createdAt), 'MMMM d, yyyy')}</span>
                  </div>
                  <div className="flex items-center gap-2 text-sm">
                    <PackageCheck className="h-4 w-4 text-muted-foreground" />
                    <span className="text-muted-foreground">Stock:</span>
                    <span>{isSoldOut ? <span className="text-destructive font-semibold">Sold Out</span> : `${product.stock} ${product.quantityParameter || 'units'}`}</span>
                  </div>
                </div>
              </div>

              {/* Product Details */}
              <div className="border rounded-lg p-4 mb-6">
                <h3 className="text-lg font-semibold mb-3 flex items-center gap-2">
                  <Info className="h-4 w-4" />
                  Product Details
                </h3>
                <div className="space-y-2 text-sm">
                  {displayAttributes.length > 0 && (
                    <>
                      {displayAttributes.map(attr => (
                        <div key={attr.typeName} className="flex">
                          <span className="text-muted-foreground w-32 flex-shrink-0">{attr.typeName}:</span>
                          <span className="font-medium">{attr.valueName}</span>
                        </div>
                      ))}
                    </>
                  )}

                  {/* Additional Product Details */}
                  {product.purchaseDate && (
                    <div className="flex">
                      <span className="text-muted-foreground w-32 flex-shrink-0">Purchase Date:</span>
                      <span className="font-medium">{format(new Date(product.purchaseDate), 'MMMM d, yyyy')}</span>
                    </div>
                  )}
                  {product.purchasePrice !== undefined && product.purchasePrice !== null && (
                    <div className="flex">
                      <span className="text-muted-foreground w-32 flex-shrink-0">Original Price:</span>
                      <span className="font-medium">{currencySymbol}{product.purchasePrice?.toFixed(2)}</span>
                    </div>
                  )}
                  {product.weightKg !== undefined && product.weightKg !== null && (
                    <div className="flex">
                      <span className="text-muted-foreground w-32 flex-shrink-0">Weight:</span>
                      <span className="font-medium">{product.weightKg} kg</span>
                    </div>
                  )}
                </div>
              </div>

              {/* Add to Cart Section */}
              <div className="mb-6">
                {isSoldOut ? (
                  <Alert variant="destructive">
                    <AlertTitle className="text-center font-semibold">Sold Out</AlertTitle>
                    <CardDescription className="text-center">This item is currently unavailable.</CardDescription>
                  </Alert>
                ) : (
                  <div className="flex flex-col sm:flex-row gap-4">
                    <QuantitySelector quantity={quantity} setQuantity={setQuantity} maxQuantity={product.stock} />
                    <Button size="lg" onClick={handleAddToCart} className="flex-1">
                      <ShoppingCart className="mr-2 h-5 w-5" /> Add to Cart
                    </Button>
                  </div>
                )}
              </div>

              {/* Description */}
              <div>
                <h3 className="text-lg font-semibold mb-3">Description</h3>
                <div className="text-gray-700 leading-relaxed">
                  {product.description}
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
