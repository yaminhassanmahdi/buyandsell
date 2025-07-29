"use client";
import { useEffect, useState } from 'react';
import { useRouter, useParams } from 'next/navigation';
import { useAuth } from '@/contexts/auth-context';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Loader2, Edit, ArrowLeft } from 'lucide-react';
import { useToast } from '@/hooks/use-toast';
import { apiClient } from '@/lib/api-client';
import ImageUpload from '@/components/admin/image-upload';
import Link from 'next/link';
import type { Category, SubCategory } from '@/lib/types';

export default function ProductEditPage() {
  const params = useParams();
  const productId = params.productId as string;
  const { currentUser, isAuthenticated, loading: authLoading } = useAuth();
  const router = useRouter();
  const { toast } = useToast();
  
  const [product, setProduct] = useState<any>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [isSubmitting, setIsSubmitting] = useState(false);
  
  const [categories, setCategories] = useState<Category[]>([]);
  const [subCategories, setSubCategories] = useState<SubCategory[]>([]);
  const [availableSubCategories, setAvailableSubCategories] = useState<SubCategory[]>([]);
  
  const [formData, setFormData] = useState({
    name: '',
    description: '',
    price: '',
    stock: '',
    imageUrls: [] as string[],
    categoryId: '',
    subCategoryId: '',
    purchaseDate: '',
    weightKg: '',
    purchasePrice: '',
    expectedSellingPrice: '',
    quantityParameter: '',
  });

  useEffect(() => {
    if (!authLoading) {
      if (!isAuthenticated) {
        router.push('/login?redirect=/sell/edit/' + productId);
        return;
      }
      fetchInitialData();
    }
  }, [authLoading, isAuthenticated, productId, router]);

  const fetchInitialData = async () => {
    try {
      // Fetch categories and product data in parallel
      const [categoriesData, productData] = await Promise.all([
        apiClient.getCategories({ includeSubCategories: true }),
        apiClient.getProduct(productId)
      ]);
      
      // Check if user owns this product OR if user is admin
      if (currentUser && productData.sellerId !== currentUser.id && !currentUser.isAdmin) {
        toast({
          title: "Access Denied",
          description: "You can only edit your own products.",
          variant: "destructive"
        });
        router.push('/account/my-products');
        return;
      }
      
      // Set categories and subcategories
      const parentCats = categoriesData.filter((cat: any) => !cat.parent_id);
      const subCats = categoriesData.filter((cat: any) => cat.parent_id);
      setCategories(parentCats);
      setSubCategories(subCats);
      
      // Filter subcategories for selected category
      const filteredSubs = subCats.filter((sc: any) => sc.parent_id === productData.categoryId);
      setAvailableSubCategories(filteredSubs);
      
      setProduct(productData);
      setFormData({
        name: productData.name || '',
        description: productData.description || '',
        price: productData.price?.toString() || '',
        stock: productData.stock?.toString() || '',
        imageUrls: productData.imageUrl ? [productData.imageUrl] : [],
        categoryId: productData.categoryId || '',
        subCategoryId: productData.subCategoryId || 'none',
        purchaseDate: productData.purchaseDate ? new Date(productData.purchaseDate).toISOString().split('T')[0] : '',
        weightKg: productData.weightKg?.toString() || '',
        purchasePrice: productData.purchasePrice?.toString() || '',
        expectedSellingPrice: productData.expectedSellingPrice?.toString() || '',
        quantityParameter: productData.quantityParameter || 'PC',
      });
    } catch (error) {
      console.error('Error fetching data:', error);
      toast({
        title: "Error",
        description: "Failed to load product data. Please try again.",
        variant: "destructive"
      });
      router.push('/account/my-products');
    } finally {
      setIsLoading(false);
    }
  };

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
    const { name, value } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: value
    }));
  };

  const handleCategoryChange = (categoryId: string) => {
    setFormData(prev => ({ ...prev, categoryId, subCategoryId: 'none' }));
    const filteredSubs = subCategories.filter(sc => sc.parentCategoryId === categoryId);
    setAvailableSubCategories(filteredSubs);
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!formData.name || !formData.description || !formData.price || !formData.stock) {
      toast({
        title: "Error",
        description: "Please fill in all required fields.",
        variant: "destructive"
      });
      return;
    }

    setIsSubmitting(true);
    try {
      await apiClient.updateProduct(productId, {
        name: formData.name,
        description: formData.description,
        price: parseFloat(formData.price),
        stock: parseInt(formData.stock),
        imageUrl: formData.imageUrls[0] || '',
        imageHint: `${formData.name.substring(0,15)} product`,
        categoryId: formData.categoryId,
        subCategoryId: formData.subCategoryId || null,
        purchaseDate: formData.purchaseDate,
        weightKg: formData.weightKg ? parseFloat(formData.weightKg) : null,
        purchasePrice: formData.purchasePrice ? parseFloat(formData.purchasePrice) : null,
        expectedSellingPrice: formData.expectedSellingPrice ? parseFloat(formData.expectedSellingPrice) : null,
        quantityParameter: formData.quantityParameter,
      });

      toast({
        title: "Product Updated",
        description: "Your product has been updated successfully.",
      });
      
      router.push('/account/my-products');
    } catch (error) {
      console.error('Error updating product:', error);
      toast({
        title: "Error",
        description: "Failed to update product. Please try again.",
        variant: "destructive"
      });
    } finally {
      setIsSubmitting(false);
    }
  };

  if (authLoading || isLoading) {
    return (
      <div className="flex items-center justify-center min-h-[calc(100vh-200px)]">
        <Loader2 className="h-12 w-12 animate-spin text-primary" />
      </div>
    );
  }

  if (!product) {
    return (
      <div className="text-center py-12">
        <h1 className="text-2xl font-semibold mb-4">Product Not Found</h1>
        <p className="text-muted-foreground mb-6">The product you're looking for doesn't exist or you don't have permission to edit it.</p>
        <Button asChild>
          <Link href="/account/my-products">Back to My Products</Link>
        </Button>
      </div>
    );
  }

  return (
    <div className="max-w-4xl mx-auto">
      <div className="mb-6">
        <Button variant="ghost" asChild>
          <Link href="/account/my-products">
            <ArrowLeft className="mr-2 h-4 w-4" />
            Back to My Products
          </Link>
        </Button>
      </div>
      
      <Card className="shadow-xl">
        <CardHeader>
          <div className="flex items-center gap-3 mb-2">
            <Edit className="h-8 w-8 text-primary" />
            <CardTitle className="text-3xl font-bold">Edit Product</CardTitle>
          </div>
          <CardDescription>
            Update your product details. Changes will be saved to your listing.
          </CardDescription>
        </CardHeader>
        <CardContent>
          <form onSubmit={handleSubmit} className="space-y-6">
            <div>
              <Label htmlFor="name">Product Name *</Label>
              <Input
                id="name"
                name="name"
                value={formData.name}
                onChange={handleInputChange}
                placeholder="Enter product name"
                required
              />
            </div>
            
            <div>
              <Label htmlFor="description">Description *</Label>
              <Textarea
                id="description"
                name="description"
                value={formData.description}
                onChange={handleInputChange}
                placeholder="Describe your product"
                rows={4}
                required
              />
            </div>
            
            <div className="grid grid-cols-2 gap-4">
              <div>
                <Label htmlFor="price">Price *</Label>
                <Input
                  id="price"
                  name="price"
                  type="number"
                  step="0.01"
                  value={formData.price}
                  onChange={handleInputChange}
                  placeholder="0.00"
                  required
                />
              </div>
              
              <div>
                <Label htmlFor="stock">Stock Quantity *</Label>
                <Input
                  id="stock"
                  name="stock"
                  type="number"
                  value={formData.stock}
                  onChange={handleInputChange}
                  placeholder="0"
                  required
                />
              </div>
            </div>

            <div className="grid grid-cols-2 gap-4">
              <div>
                <Label htmlFor="weightKg">Weight (KG)</Label>
                <Input
                  id="weightKg"
                  name="weightKg"
                  type="number"
                  step="0.001"
                  value={formData.weightKg}
                  onChange={handleInputChange}
                  placeholder="0.5"
                />
              </div>
              
              <div>
                <Label htmlFor="quantityParameter">Quantity Parameter</Label>
                <Select onValueChange={(value) => setFormData(prev => ({ ...prev, quantityParameter: value }))} value={formData.quantityParameter}>
                  <SelectTrigger>
                    <SelectValue placeholder="Select quantity parameter" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="PC">PC (Piece)</SelectItem>
                    <SelectItem value="KG">KG (Kilogram)</SelectItem>
                    <SelectItem value="Pound">Pound</SelectItem>
                    <SelectItem value="Ounce">Ounce</SelectItem>
                  </SelectContent>
                </Select>
              </div>
            </div>

            <div className="grid grid-cols-2 gap-4">
              <div>
                <Label htmlFor="purchaseDate">Purchase Date</Label>
                <Input
                  id="purchaseDate"
                  name="purchaseDate"
                  type="date"
                  value={formData.purchaseDate}
                  onChange={handleInputChange}
                />
              </div>
              
              <div>
                <Label htmlFor="purchasePrice">Purchase Price</Label>
                <Input
                  id="purchasePrice"
                  name="purchasePrice"
                  type="number"
                  step="0.01"
                  value={formData.purchasePrice}
                  onChange={handleInputChange}
                  placeholder="25.00"
                />
              </div>
            </div>

            <div>
              <Label htmlFor="expectedSellingPrice">Expected Selling Price</Label>
              <Input
                id="expectedSellingPrice"
                name="expectedSellingPrice"
                type="number"
                step="0.01"
                value={formData.expectedSellingPrice}
                onChange={handleInputChange}
                placeholder="35.00"
              />
            </div>
            
            <div className="grid grid-cols-2 gap-4">
              <div>
                <Label htmlFor="categoryId">Category *</Label>
                <Select onValueChange={handleCategoryChange} value={formData.categoryId}>
                  <SelectTrigger>
                    <SelectValue placeholder="Select a category" />
                  </SelectTrigger>
                  <SelectContent>
                    {categories.map(cat => (
                      <SelectItem key={cat.id} value={cat.id}>{cat.name}</SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
              
              <div>
                <Label htmlFor="subCategoryId">Subcategory</Label>
                <Select 
                  onValueChange={(value) => setFormData(prev => ({ ...prev, subCategoryId: value === 'none' ? null : value }))} 
                  value={formData.subCategoryId}
                  disabled={!formData.categoryId || availableSubCategories.length === 0}
                >
                  <SelectTrigger>
                    <SelectValue placeholder={!formData.categoryId ? "Select category first" : "Select a subcategory (optional)"} />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="none">-- No Subcategory --</SelectItem>
                    {availableSubCategories.map(subCat => (
                      <SelectItem key={subCat.id} value={subCat.id}>{subCat.name}</SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
            </div>
            
            <div>
              <Label>Product Images</Label>
              <ImageUpload
                value={formData.imageUrls}
                onChange={(urls) => setFormData(prev => ({ ...prev, imageUrls: urls }))}
                maxFiles={5}
                maxSize={5}
              />
              <p className="text-sm text-muted-foreground mt-1">
                Upload up to 5 high-quality images. The first image will be used as the main display image.
              </p>
            </div>
            
            <div className="flex gap-4 pt-4">
              <Button
                type="submit"
                disabled={isSubmitting}
                className="flex-1"
              >
                {isSubmitting ? (
                  <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                ) : (
                  <Edit className="mr-2 h-4 w-4" />
                )}
                Update Product
              </Button>
              
              <Button
                type="button"
                variant="outline"
                onClick={() => router.push('/account/my-products')}
                className="flex-1"
              >
                Cancel
              </Button>
            </div>
          </form>
        </CardContent>
      </Card>
    </div>
  );
} 