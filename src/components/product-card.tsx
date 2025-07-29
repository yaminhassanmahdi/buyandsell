"use client";
import Image from 'next/image';
import { Card, CardContent, CardFooter, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { ShoppingCart, MapPin, User } from 'lucide-react';
import { useCart } from '@/contexts/cart-context';
import type { Product, BusinessSettings } from '@/lib/types';
import useLocalStorage from '@/hooks/use-local-storage';
import { BUSINESS_SETTINGS_STORAGE_KEY, DEFAULT_BUSINESS_SETTINGS } from '@/lib/constants';
import { useEffect, useState } from 'react';
import { apiClient } from '@/lib/api-client';
import { useRouter } from 'next/navigation';

interface ProductCardProps {
  product: Product;
  showAddToCart?: boolean;
}

export function ProductCard({ product, showAddToCart = true }: ProductCardProps) {
  const { addToCart } = useCart();
  const router = useRouter();
  const [sellerLocation, setSellerLocation] = useState<string>('');

  const [settings] = useLocalStorage<BusinessSettings>(BUSINESS_SETTINGS_STORAGE_KEY, DEFAULT_BUSINESS_SETTINGS);
  const activeCurrency = settings?.availableCurrencies?.find(c => c.code === settings?.defaultCurrencyCode) || 
    settings?.availableCurrencies?.[0] || 
    { code: 'BDT', symbol: '৳', name: 'Bangladeshi Taka' };
  const currencySymbol = activeCurrency.symbol;

  // Helper function to get seller name from multiple possible fields
  const getSellerName = () => {
    return (product as any).sellerName || (product as any).seller_name || null;
  };

  useEffect(() => {
    const fetchSellerLocation = async () => {
      if (product.sellerId && product.sellerId !== 'undefined' && product.sellerId.trim() !== '') {
        try {
          const sellerData = await apiClient.getUser(product.sellerId);
          if (sellerData?.defaultShippingAddress) {
            const { division, district, upazilla } = sellerData.defaultShippingAddress;
            setSellerLocation(`${upazilla}, ${district}, ${division}`);
          } else {
            setSellerLocation('Location not set');
          }
        } catch (error) {
          console.error('Error fetching seller location:', error);
          setSellerLocation('Location unavailable');
        }
      } else {
        setSellerLocation('Unknown location');
      }
    };

    fetchSellerLocation();
  }, [product.sellerId]);

  const handleProductClick = () => {
    router.push(`/products/${product.id}`);
  };

  const handleAddToCart = (e: React.MouseEvent) => {
    e.preventDefault();
    e.stopPropagation();
    
    if (product.stock > 0) {
      addToCart({
        id: product.id,
        name: product.name,
        price: product.price,
        imageUrl: product.imageUrl,
        sellerId: product.sellerId,
        sellerName: getSellerName(),
        stock: product.stock,
        quantity: 1
      });
    }
  };

  const handleSellerClick = (e: React.MouseEvent) => {
    e.preventDefault();
    e.stopPropagation();
    if (product.sellerId && product.sellerId !== 'undefined' && product.sellerId.trim() !== '') {
      router.push(`/seller/${product.sellerId}`);
    }
  };

  const isOutOfStock = product.stock === 0;
  const hasValidSeller = product.sellerId && product.sellerId !== 'undefined' && product.sellerId.trim() !== '';
  const sellerName = getSellerName();

  return (
    <Card className="h-full w-full flex flex-col rounded-lg shadow-sm hover:shadow-md transition-shadow group">
      <CardHeader className="p-0">
        <div 
          className="aspect-[3/4] relative overflow-hidden rounded-t-lg cursor-pointer"
          onClick={handleProductClick}
        >
          <Image
            src={product.imageUrl || '/placeholder-product.jpg'}
            alt={product.name}
            fill
            className="object-cover group-hover:scale-105 transition-transform duration-200"
            data-ai-hint={product.imageHint || "product photo"}
          />
          {isOutOfStock && (
            <div className="absolute inset-0 bg-black/50 flex items-center justify-center">
              <Badge variant="destructive" className="text-xs">
                Sold Out
              </Badge>
            </div>
          )}
          {product.status && product.status !== 'approved' && (
            <Badge 
              className="absolute top-2 right-2"
              variant={product.status === 'pending' ? 'secondary' : 'destructive'}
            >
              {product.status}
            </Badge>
          )}
        </div>
      </CardHeader>
      
      <CardContent className="p-3 flex-grow flex flex-col">
        <CardTitle 
          className="text-sm font-semibold line-clamp-2 mb-2 hover:text-primary transition-colors cursor-pointer min-h-[2.5rem]"
          onClick={handleProductClick}
        >
          {product.name}
        </CardTitle>
        
        <div className="flex items-center justify-between mt-2">
          <span className="text-lg font-bold text-primary">{currencySymbol}{product.price.toFixed(2)}</span>
          {!isOutOfStock && (
            <span className="text-xs text-muted-foreground whitespace-nowrap">
              {product.stock} in stock
            </span>
          )}
        </div>
        
        <div className="space-y-1 flex-grow">
          {hasValidSeller && sellerName ? (
            <div 
              className="flex items-center gap-1 text-xs text-primary hover:text-primary/80 hover:underline cursor-pointer transition-colors"
              onClick={handleSellerClick}
              title={`View ${sellerName}'s profile`}
            >
              <User className="h-3 w-3" />
              <span className="truncate">{sellerName}</span>
            </div>
          ) : (
            <div className="flex items-center gap-1 text-xs text-muted-foreground">
              <User className="h-3 w-3" />
              <span>Unknown Seller</span>
            </div>
          )}
          <div className="flex items-center gap-1 text-xs text-muted-foreground">
            <MapPin className="h-3 w-3" />
            <span className="truncate">{sellerLocation || 'Loading...'}</span>
          </div>
        </div>
        
        {/* Product Attributes - Only show featured/important attributes, max 2 */}
        {product.selectedAttributes && product.selectedAttributes.length > 0 && (
          <div className="space-y-1 pt-2 mt-2 border-t border-gray-100">
            {product.selectedAttributes
              .filter((attr: any) => attr.isFeatured || attr.isImportant)
              .slice(0, 2)
              .map((attr: any) => (
                <div key={attr.attributeTypeId} className="flex justify-between text-xs">
                  <span className="text-muted-foreground truncate max-w-[60%]">{attr.attributeTypeName}:</span>
                  <span className="font-medium text-foreground truncate max-w-[40%]">{attr.attributeValueName}</span>
                </div>
              ))}
            {/* If no featured attributes, show first 2 */}
            {product.selectedAttributes.filter((attr: any) => attr.isFeatured || attr.isImportant).length === 0 &&
              product.selectedAttributes.slice(0, 2).map((attr: any) => (
                <div key={attr.attributeTypeId} className="flex justify-between text-xs">
                  <span className="text-muted-foreground truncate max-w-[60%]">{attr.attributeTypeName}:</span>
                  <span className="font-medium text-foreground truncate max-w-[40%]">{attr.attributeValueName}</span>
                </div>
              ))
            }
          </div>
        )}
      </CardContent>
      
      {showAddToCart && !isOutOfStock && (
        <CardFooter className="p-3 pt-0 mt-auto">
          <Button 
            onClick={handleAddToCart}
            className="w-full"
            size="sm"
          >
            <ShoppingCart className="mr-2 h-4 w-4" />
            Add to Cart
          </Button>
        </CardFooter>
      )}
    </Card>
  );
}
