"use client";
import { useEffect, useState } from 'react';
import type { Product } from '@/lib/types';
import { ProductApprovalCard } from '@/components/admin/product-approval-card';
import { useToast } from '@/hooks/use-toast';
import { Alert, AlertDescription, AlertTitle } from '@/components/ui/alert';
import { CheckSquare, Loader2, SearchX } from 'lucide-react';
import { apiClient } from '@/lib/api-client';

export default function AdminProductsPage() {
  const [pendingProducts, setPendingProducts] = useState<Product[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [processingProductId, setProcessingProductId] = useState<string | null>(null);
  const { toast } = useToast();

  const fetchPendingProducts = async () => {
    setIsLoading(true);
    try {
      const products = await apiClient.getProducts({ status: 'pending', sortBy: 'date_asc' });
      setPendingProducts(products);
    } catch (error) {
      console.error('Error fetching pending products:', error);
      toast({
        title: "Error",
        description: "Failed to fetch pending products. Please try again.",
        variant: "destructive"
      });
      setPendingProducts([]);
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    fetchPendingProducts();
  }, []);

  const handleApprove = async (productId: string) => {
    setProcessingProductId(productId);
    try {
      await apiClient.updateProduct(productId, { status: 'approved' });
      setPendingProducts(prev => prev.filter(p => p.id !== productId));
      toast({ title: "Product Approved", description: `Product ID ${productId} has been approved.` });
    } catch (error) {
      console.error('Error approving product:', error);
      toast({
        title: "Error",
        description: "Failed to approve product. Please try again.",
        variant: "destructive"
      });
    } finally {
      setProcessingProductId(null);
    }
  };

  const handleReject = async (productId: string) => {
    setProcessingProductId(productId);
    try {
      await apiClient.updateProduct(productId, { status: 'rejected' });
      setPendingProducts(prev => prev.filter(p => p.id !== productId));
      toast({ title: "Product Rejected", description: `Product ID ${productId} has been rejected.`, variant: "destructive" });
    } catch (error) {
      console.error('Error rejecting product:', error);
      toast({
        title: "Error", 
        description: "Failed to reject product. Please try again.",
        variant: "destructive"
      });
    } finally {
      setProcessingProductId(null);
    }
  };
  
  if (isLoading) {
    return (
      <div className="flex items-center justify-center min-h-[calc(100vh-200px)]">
        <Loader2 className="h-12 w-12 animate-spin text-primary" />
      </div>
    );
  }

  return (
    <div className="space-y-8 py-4">
      <h1 className="text-3xl font-bold flex items-center gap-3">
        <CheckSquare className="h-8 w-8 text-primary"/>
        Product Approval Queue
      </h1>
      {pendingProducts.length === 0 ? (
        <Alert>
          <SearchX className="h-5 w-5" />
          <AlertTitle>Queue Clear!</AlertTitle>
          <AlertDescription>There are no products currently pending approval.</AlertDescription>
        </Alert>
      ) : (
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          {pendingProducts.map(product => (
            <ProductApprovalCard 
              key={product.id} 
              product={product} 
              onApprove={handleApprove} 
              onReject={handleReject}
              isProcessing={processingProductId === product.id}
            />
          ))}
        </div>
      )}
    </div>
  );
}
