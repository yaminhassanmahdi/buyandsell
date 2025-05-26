
"use client";
import Image from 'next/image';
import type { Product } from '@/lib/types';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { CheckCircle, XCircle, User, Tag, DollarSign, Calendar, Layers } from 'lucide-react'; // Added Layers
import { format } from 'date-fns';
import { MOCK_CATEGORIES, MOCK_SUBCATEGORIES, MOCK_BRANDS } from '@/lib/mock-data';

interface ProductApprovalCardProps {
  product: Product;
  onApprove: (productId: string) => void;
  onReject: (productId: string) => void;
  isProcessing?: boolean;
}

export function ProductApprovalCard({ product, onApprove, onReject, isProcessing }: ProductApprovalCardProps) {
  const categoryName = MOCK_CATEGORIES.find(c => c.id === product.categoryId)?.name || 'N/A';
  const subCategoryName = product.subCategoryId ? MOCK_SUBCATEGORIES.find(sc => sc.id === product.subCategoryId)?.name : null;
  const brandName = MOCK_BRANDS.find(b => b.id === product.brandId)?.name || 'N/A';

  return (
    <Card className="overflow-hidden shadow-lg">
      <div className="grid md:grid-cols-3 gap-0">
        <div className="md:col-span-1 aspect-[4/3] relative w-full overflow-hidden">
          <Image
            src={product.imageUrl}
            alt={product.name}
            fill
            sizes="(max-width: 768px) 100vw, (max-width: 1200px) 33vw, 25vw"
            className="object-cover"
            data-ai-hint={product.imageHint || "product item"}
          />
        </div>
        <div className="md:col-span-2">
          <CardHeader>
            <CardTitle className="text-xl">{product.name}</CardTitle>
            <div className="flex flex-wrap gap-2 mt-1">
              <Badge variant="secondary" className="flex items-center gap-1">
                <Layers className="h-3 w-3" /> {categoryName}
              </Badge>
              {subCategoryName && (
                <Badge variant="outline">{subCategoryName}</Badge>
              )}
              <Badge variant="outline" className="flex items-center gap-1">
                <Tag className="h-3 w-3" /> {brandName}
              </Badge>
            </div>
          </CardHeader>
          <CardContent>
            <CardDescription className="mb-3 text-sm text-foreground/80">{product.description}</CardDescription>
            <div className="space-y-1 text-sm text-muted-foreground">
              <p className="flex items-center"><User className="h-4 w-4 mr-2" /> Seller: {product.sellerName || product.sellerId}</p>
              <p className="flex items-center"><DollarSign className="h-4 w-4 mr-2" /> Price: ${product.price.toFixed(2)}</p>
              <p className="flex items-center"><Calendar className="h-4 w-4 mr-2" /> Listed: {format(new Date(product.createdAt), 'PPpp')}</p>
            </div>
          </CardContent>
          <CardFooter className="gap-2">
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
