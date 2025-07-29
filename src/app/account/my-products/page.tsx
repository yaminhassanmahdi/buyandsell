"use client";
import { useEffect, useState, Suspense } from 'react';
import { useRouter } from 'next/navigation';
import type { Product } from '@/lib/types';
import { useAuth } from '@/contexts/auth-context';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Alert, AlertDescription, AlertTitle } from '@/components/ui/alert';
import { Loader2, Package, PlusCircle, Edit3, Trash2, SearchX, RefreshCw } from 'lucide-react';
import Image from 'next/image';
import { format } from 'date-fns';
import { useToast } from '@/hooks/use-toast';
import { apiClient } from '@/lib/api-client';
import Link from 'next/link';

function MyProductsPageInner() {
  const { currentUser, isAuthenticated, loading: authLoading } = useAuth();
  const router = useRouter();
  const { toast } = useToast();
  const [userProducts, setUserProducts] = useState<Product[]>([]);
  const [pageLoading, setPageLoading] = useState(true);

  const fetchUserProducts = async () => {
    if (!currentUser) return;
    
    setPageLoading(true);
    try {
      // Include out of stock products for seller's own view
      const products = await apiClient.getProducts({ 
        sellerId: currentUser.id,
        sortBy: 'date_desc',
        limit: 100,
        includeOutOfStock: true
      });
      setUserProducts(products);
    } catch (error) {
      console.error('Error fetching user products:', error);
      toast({
        title: "Error",
        description: "Failed to fetch your products. Please try again.",
        variant: "destructive"
      });
    } finally {
      setPageLoading(false);
    }
  };

  useEffect(() => {
    if (!authLoading) {
      if (!isAuthenticated) {
        router.push('/login?redirect=/account/my-products');
        return;
      }
      if (currentUser) {
        fetchUserProducts();
      }
    }
  }, [isAuthenticated, authLoading, router, currentUser]);

  const handleDeleteProduct = async (productId: string) => {
    if (!window.confirm('Are you sure you want to delete this product?')) {
      return;
    }

    try {
      await apiClient.deleteProduct(productId);
      setUserProducts(prev => prev.filter(p => p.id !== productId));
      toast({
        title: "Product Deleted",
        description: "Your product has been deleted successfully."
      });
    } catch (error) {
      console.error('Error deleting product:', error);
      toast({
        title: "Error",
        description: "Failed to delete product. Please try again.",
        variant: "destructive"
      });
    }
  };

  const getStatusBadge = (product: Product) => {
    if (product.stock === 0) {
      return <Badge variant="secondary" className="bg-gray-100 text-gray-800">SOLD</Badge>;
    }
    
    switch (product.status) {
      case 'pending':
        return <Badge variant="secondary" className="bg-yellow-100 text-yellow-800">Pending Review</Badge>;
      case 'approved':
        return <Badge variant="default" className="bg-green-100 text-green-800">Active</Badge>;
      case 'rejected':
        return <Badge variant="destructive">Rejected</Badge>;
      default:
        return <Badge variant="outline">{product.status}</Badge>;
    }
  };

  const getStatusColor = (product: Product) => {
    if (product.stock === 0) return 'border-l-gray-500';
    
    switch (product.status) {
      case 'pending': return 'border-l-yellow-500';
      case 'approved': return 'border-l-green-500';
      case 'rejected': return 'border-l-red-500';
      default: return 'border-l-gray-300';
    }
  };

  if (authLoading || pageLoading) {
    return (
      <div className="flex items-center justify-center min-h-[calc(100vh-200px)]">
        <Loader2 className="h-12 w-12 animate-spin text-primary" />
      </div>
    );
  }

  if (!isAuthenticated) {
    return null;
  }

  const activeProducts = userProducts.filter(p => p.stock > 0 && p.status === 'approved');
  const soldProducts = userProducts.filter(p => p.stock === 0);
  const pendingProducts = userProducts.filter(p => p.status === 'pending');
  const rejectedProducts = userProducts.filter(p => p.status === 'rejected');

  return (
    <div className="space-y-8">
      <div className="flex items-center justify-between">
        <h1 className="text-3xl font-bold flex items-center gap-3">
          <Package className="h-8 w-8 text-primary"/>
          My Products
        </h1>
        <Button asChild>
          <Link href="/sell">
            <PlusCircle className="mr-2 h-4 w-4" />
            Add New Product
          </Link>
        </Button>
      </div>

      {/* Summary Cards */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
        <Card>
          <CardContent className="p-4">
            <div className="text-2xl font-bold text-green-600">{activeProducts.length}</div>
            <div className="text-sm text-muted-foreground">Active</div>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="p-4">
            <div className="text-2xl font-bold text-gray-600">{soldProducts.length}</div>
            <div className="text-sm text-muted-foreground">Sold</div>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="p-4">
            <div className="text-2xl font-bold text-yellow-600">{pendingProducts.length}</div>
            <div className="text-sm text-muted-foreground">Pending</div>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="p-4">
            <div className="text-2xl font-bold text-red-600">{rejectedProducts.length}</div>
            <div className="text-sm text-muted-foreground">Rejected</div>
          </CardContent>
        </Card>
      </div>

      {userProducts.length === 0 ? (
        <Card>
          <CardContent className="py-16">
            <div className="text-center">
              <SearchX className="mx-auto h-12 w-12 text-gray-400 mb-4" />
              <h3 className="text-lg font-semibold text-gray-900 mb-2">No products yet</h3>
              <p className="text-gray-500 mb-6">Start selling by adding your first product!</p>
              <Button asChild>
                <Link href="/sell">
                  <PlusCircle className="mr-2 h-4 w-4" />
                  Add Your First Product
                </Link>
              </Button>
            </div>
          </CardContent>
        </Card>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          {userProducts.map((product) => (
            <Card key={product.id} className={`border-l-4 ${getStatusColor(product)}`}>
              <CardContent className="p-4">
                <div className="flex gap-3">
                  <div className="w-20 h-20 relative rounded-lg overflow-hidden bg-gray-100 flex-shrink-0">
                    <Image
                      src={product.imageUrl || '/placeholder-product.jpg'}
                      alt={product.name}
                      fill
                      className="object-cover"
                    />
                  </div>
                  
                  <div className="flex-grow">
                    <div className="flex items-start justify-between mb-2">
                      <div>
                        <h3 className="text-lg font-semibold">{product.name}</h3>
                        <p className="text-gray-600 text-sm line-clamp-2">{product.description}</p>
                      </div>
                      <div className="flex items-center gap-2 ml-4">
                        {getStatusBadge(product)}
                        <div className="flex gap-1">
                          <Button
                            variant="outline"
                            size="sm"
                            asChild
                          >
                            <Link href={`/sell/edit/${product.id}`}>
                              <Edit3 className="h-4 w-4" />
                            </Link>
                          </Button>
                          <Button
                            variant="outline"
                            size="sm"
                            onClick={() => handleDeleteProduct(product.id)}
                            className="text-red-600 hover:text-red-700"
                          >
                            <Trash2 className="h-4 w-4" />
                          </Button>
                        </div>
                      </div>
                    </div>

                    <div className="grid grid-cols-2 md:grid-cols-4 gap-4 text-sm">
                      <div>
                        <span className="text-gray-500">Price:</span>
                        <div className="font-semibold">৳{product.price.toFixed(2)}</div>
                      </div>
                      <div>
                        <span className="text-gray-500">Stock:</span>
                        <div className="font-semibold">
                          {product.stock === 0 ? (
                            <span className="text-red-600">Sold Out</span>
                          ) : (
                            `${product.stock} available`
                          )}
                        </div>
                      </div>
                      <div>
                        <span className="text-gray-500">Listed:</span>
                        <div className="font-semibold">{format(new Date(product.createdAt), 'MMM d, yyyy')}</div>
                      </div>
                      <div>
                        <span className="text-gray-500">Category:</span>
                        <div className="font-semibold">{product.categoryName || 'Uncategorized'}</div>
                      </div>
                    </div>

                    {product.stock === 0 && (
                      <Alert className="mt-4">
                        <RefreshCw className="h-4 w-4" />
                        <AlertTitle>Product Sold</AlertTitle>
                        <AlertDescription>
                          This product has been sold and is not visible in listings. You can edit it to update the stock and make it available again.
                        </AlertDescription>
                      </Alert>
                    )}

                    {product.status === 'rejected' && (
                      <Alert variant="destructive" className="mt-4">
                        <AlertTitle>Product Rejected</AlertTitle>
                        <AlertDescription>
                          This product was rejected during review. Please edit and resubmit with the required changes.
                        </AlertDescription>
                      </Alert>
                    )}

                    {product.status === 'pending' && (
                      <Alert className="mt-4">
                        <AlertTitle>Under Review</AlertTitle>
                        <AlertDescription>
                          This product is being reviewed by our team. It will be published once approved.
                        </AlertDescription>
                      </Alert>
                    )}
                  </div>
                </div>
              </CardContent>
            </Card>
          ))}
        </div>
      )}
    </div>
  );
}

export default function MyProductsPage() {
  return (
    <Suspense fallback={<div>Loading...</div>}>
      <MyProductsPageInner />
    </Suspense>
  );
}
