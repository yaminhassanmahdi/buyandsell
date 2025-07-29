"use client";
import Image from 'next/image';
import Link from 'next/link';
import type { Product, BusinessSettings, CategoryAttributeType, CategoryAttributeValue } from '@/lib/types';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { CheckCircle, XCircle, User, Tag, DollarSign, Calendar, Layers, Info, Edit, Eye } from 'lucide-react';
import { format } from 'date-fns';
import { MOCK_CATEGORIES, MOCK_SUBCATEGORIES, MOCK_CATEGORY_ATTRIBUTE_TYPES, MOCK_CATEGORY_ATTRIBUTE_VALUES } from '@/lib/mock-data';
import useLocalStorage from '@/hooks/use-local-storage';
import { BUSINESS_SETTINGS_STORAGE_KEY, DEFAULT_BUSINESS_SETTINGS } from '@/lib/constants';

interface ProductApprovalCardProps {
  product: Product;
  onApprove: (productId: string) => void;
  onReject: (productId: string) => void;
  isProcessing?: boolean;
}

export function ProductApprovalCard({ product, onApprove, onReject, isProcessing }: ProductApprovalCardProps) {
  const categoryName = MOCK_CATEGORIES?.find(c => c.id === product.categoryId)?.name || 'N/A';
  const subCategoryName = product.subCategoryId ? MOCK_SUBCATEGORIES?.find(sc => sc.id === product.subCategoryId)?.name : null;
  
  const [settings] = useLocalStorage<BusinessSettings>(BUSINESS_SETTINGS_STORAGE_KEY, DEFAULT_BUSINESS_SETTINGS);
  const activeCurrency = settings?.availableCurrencies?.find(c => c.code === settings?.defaultCurrencyCode) || 
    settings?.availableCurrencies?.[0] || 
    { code: 'BDT', symbol: '৳', name: 'Bangladeshi Taka' };
  const currencySymbol = activeCurrency.symbol;

  const displayAttributes: {typeName: string, valueName: string}[] = [];
  if (product.selectedAttributes) {
    product.selectedAttributes.forEach(attr => {
      const type = MOCK_CATEGORY_ATTRIBUTE_TYPES?.find(t => t.id === attr.attributeTypeId);
      const value = MOCK_CATEGORY_ATTRIBUTE_VALUES?.find(v => v.id === attr.attributeValueId);
      if (type && value) {
        displayAttributes.push({ typeName: type.name, valueName: value.value });
      }
    });
  }

  const handleEditProduct = () => {
    window.open(`/sell/edit/${product.id}`, '_blank');
  };

  return (
    <Card className="overflow-hidden shadow-lg hover:shadow-xl transition-shadow">
      <div className="grid md:grid-cols-3 gap-0">
        <Link href={`/products/${product.id}`} target="_blank">
          <div className="md:col-span-1 aspect-[4/3] relative w-full overflow-hidden cursor-pointer hover:opacity-90 transition-opacity">
            <Image
              src={product.imageUrl}
              alt={product.name}
              fill
              sizes="(max-width: 768px) 100vw, (max-width: 1200px) 33vw, 25vw"
              className="object-cover"
              data-ai-hint={product.imageHint || "product item"}
            />
            <div className="absolute inset-0 bg-black/0 hover:bg-black/10 transition-colors flex items-center justify-center">
              <Eye className="h-8 w-8 text-white opacity-0 hover:opacity-100 transition-opacity" />
            </div>
          </div>
        </Link>
        <div className="md:col-span-2">
          <CardHeader>
            <Link href={`/products/${product.id}`} target="_blank">
              <CardTitle className="text-xl hover:text-primary transition-colors cursor-pointer">
                {product.name}
              </CardTitle>
            </Link>
            <div className="flex flex-wrap gap-2 mt-1">
              <Badge variant="secondary" className="flex items-center gap-1">
                <Layers className="h-3 w-3" /> {categoryName}
              </Badge>
              {subCategoryName && (
                <Badge variant="outline">{subCategoryName}</Badge>
              )}
              {/* Display dynamic attributes as badges */}
              {displayAttributes.slice(0, 2).map(attr => ( // Show first 2 attributes for brevity
                <Badge key={attr.typeName} variant="outline" className="flex items-center gap-1">
                  <Info className="h-3 w-3" /> {attr.typeName}: {attr.valueName}
                </Badge>
              ))}
            </div>
          </CardHeader>
          <CardContent>
            <CardDescription className="mb-3 text-sm text-foreground/80 line-clamp-3">{product.description}</CardDescription>
            <div className="space-y-1 text-sm text-muted-foreground">
              <p className="flex items-center"><User className="h-4 w-4 mr-2" /> Seller: {product.sellerName || product.sellerId}</p>
              <p className="flex items-center"><DollarSign className="h-4 w-4 mr-2" /> Price: {currencySymbol}{product.price.toFixed(2)}</p>
              <p className="flex items-center"><Calendar className="h-4 w-4 mr-2" /> Listed: {product.createdAt ? format(new Date(product.createdAt), 'PPpp') : 'Date not available'}</p>
            </div>
          </CardContent>
          <CardFooter className="gap-2">
            <Button
              size="sm"
              variant="outline"
              onClick={handleEditProduct}
              disabled={isProcessing}
            >
              <Edit className="mr-2 h-4 w-4" /> Edit
            </Button>
            <Button
              size="sm"
              variant="default"
              onClick={() => onApprove(product.id)}
              disabled={isProcessing}
              className="bg-green-600 hover:bg-green-700"
            >
              <CheckCircle className="mr-2 h-4 w-4" /> Approve
            </Button>
            <Button
              size="sm"
              variant="destructive"
              onClick={() => onReject(product.id)}
              disabled={isProcessing}
            >
              <XCircle className="mr-2 h-4 w-4" /> Reject
            </Button>
          </CardFooter>
        </div>
      </div>
    </Card>
  );
}
