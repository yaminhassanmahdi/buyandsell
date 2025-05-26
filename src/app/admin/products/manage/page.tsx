
"use client";
import { useEffect, useState } from 'react';
import { MOCK_PRODUCTS } from '@/lib/mock-data';
import type { Product, Category, Brand } from '@/lib/types';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Badge } from '@/components/ui/badge';
import { Alert, AlertDescription, AlertTitle } from '@/components/ui/alert';
import { Loader2, ListChecks, PlusCircle, Search, Filter, Edit3, Trash2 } from 'lucide-react';
import Image from 'next/image';
import { CATEGORIES, BRANDS } from '@/lib/constants'; // For filter dropdowns
import { format } from 'date-fns';

type ProductStatus = Product['status'] | 'all';

export default function AdminManageProductsPage() {
  const [allProducts, setAllProducts] = useState<Product[]>([]);
  const [filteredProducts, setFilteredProducts] = useState<Product[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  
  const [searchTerm, setSearchTerm] = useState('');
  const [statusFilter, setStatusFilter] = useState<ProductStatus>('all');
  const [categoryFilter, setCategoryFilter] = useState<string>('all');
  const [brandFilter, setBrandFilter] = useState<string>('all');

  useEffect(() => {
    setIsLoading(true);
    // Simulate fetching products
    setTimeout(() => {
      const sortedProducts = [...MOCK_PRODUCTS].sort((a,b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime());
      setAllProducts(sortedProducts);
      setFilteredProducts(sortedProducts);
      setIsLoading(false);
    }, 300);
  }, []);

  useEffect(() => {
    let tempProducts = [...allProducts];
    if (searchTerm) {
      tempProducts = tempProducts.filter(product =>
        product.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
        product.id.toLowerCase().includes(searchTerm.toLowerCase()) ||
        product.sellerName?.toLowerCase().includes(searchTerm.toLowerCase())
      );
    }
    if (statusFilter !== 'all') {
      tempProducts = tempProducts.filter(product => product.status === statusFilter);
    }
    if (categoryFilter !== 'all') {
      tempProducts = tempProducts.filter(product => product.category.id === categoryFilter);
    }
    if (brandFilter !== 'all') {
      tempProducts = tempProducts.filter(product => product.brand.id === brandFilter);
    }
    setFilteredProducts(tempProducts);
  }, [searchTerm, statusFilter, categoryFilter, brandFilter, allProducts]);

  // Placeholder functions for edit/delete
  const handleEditProduct = (productId: string) => {
    console.log("Edit product:", productId);
    // alert("Edit functionality to be implemented.");
  };

  const handleDeleteProduct = (productId: string) => {
    console.log("Delete product:", productId);
    // Simulate deletion
    // setAllProducts(prev => prev.filter(p => p.id !== productId));
    // alert("Delete functionality to be implemented (mock).");
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
      <div className="flex items-center justify-between">
        <h1 className="text-3xl font-bold flex items-center gap-3">
          <ListChecks className="h-8 w-8 text-primary"/>
          Manage All Products
        </h1>
        <Button>
          <PlusCircle className="mr-2 h-4 w-4" /> Add New Product
        </Button>
      </div>

      <div className="p-4 border rounded-lg bg-card shadow grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4 items-end">
        <div>
          <label htmlFor="search-product" className="text-sm font-medium">Search</label>
          <Input 
            id="search-product"
            placeholder="ID, Name, Seller..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="h-10 mt-1"
          />
        </div>
        <div>
          <label htmlFor="filter-status" className="text-sm font-medium">Status</label>
          <Select value={statusFilter} onValueChange={(value) => setStatusFilter(value as ProductStatus)}>
            <SelectTrigger className="h-10 mt-1">
              <SelectValue placeholder="Filter by status" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="all">All Statuses</SelectItem>
              <SelectItem value="pending">Pending</SelectItem>
              <SelectItem value="approved">Approved</SelectItem>
              <SelectItem value="rejected">Rejected</SelectItem>
              <SelectItem value="sold">Sold</SelectItem>
            </SelectContent>
          </Select>
        </div>
        <div>
          <label htmlFor="filter-category" className="text-sm font-medium">Category</label>
          <Select value={categoryFilter} onValueChange={setCategoryFilter}>
            <SelectTrigger className="h-10 mt-1">
              <SelectValue placeholder="Filter by category" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="all">All Categories</SelectItem>
              {CATEGORIES.map(cat => <SelectItem key={cat.id} value={cat.id}>{cat.name}</SelectItem>)}
            </SelectContent>
          </Select>
        </div>
        <div>
          <label htmlFor="filter-brand" className="text-sm font-medium">Brand</label>
          <Select value={brandFilter} onValueChange={setBrandFilter}>
            <SelectTrigger className="h-10 mt-1">
              <SelectValue placeholder="Filter by brand" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="all">All Brands</SelectItem>
              {BRANDS.map(brand => <SelectItem key={brand.id} value={brand.id}>{brand.name}</SelectItem>)}
            </SelectContent>
          </Select>
        </div>
      </div>

      {filteredProducts.length === 0 ? (
        <Alert>
          <Search className="h-5 w-5" />
          <AlertTitle>No Products Found</AlertTitle>
          <AlertDescription>
            No products match your current filters. Try adjusting your search or filter criteria.
          </AlertDescription>
        </Alert>
      ) : (
        <div className="border rounded-lg shadow-sm">
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead className="w-[80px]">Image</TableHead>
                <TableHead>Name & ID</TableHead>
                <TableHead>Seller</TableHead>
                <TableHead>Price</TableHead>
                <TableHead>Category</TableHead>
                <TableHead>Brand</TableHead>
                <TableHead>Status</TableHead>
                <TableHead>Listed On</TableHead>
                <TableHead className="text-right">Actions</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {filteredProducts.map((product) => (
                <TableRow key={product.id}>
                  <TableCell>
                    <Image src={product.imageUrl} alt={product.name} width={50} height={50} className="rounded aspect-square object-cover" data-ai-hint={product.imageHint || "product photo"} />
                  </TableCell>
                  <TableCell>
                    <div className="font-medium">{product.name}</div>
                    <div className="text-xs text-muted-foreground">ID: {product.id}</div>
                  </TableCell>
                  <TableCell>{product.sellerName || product.sellerId}</TableCell>
                  <TableCell>${product.price.toFixed(2)}</TableCell>
                  <TableCell>{product.category.name}</TableCell>
                  <TableCell>{product.brand.name}</TableCell>
                  <TableCell><Badge variant={product.status === 'approved' ? 'default' : product.status === 'pending' ? 'secondary' : 'destructive'}>{product.status}</Badge></TableCell>
                  <TableCell>{format(new Date(product.createdAt), 'dd MMM yyyy')}</TableCell>
                  <TableCell className="text-right">
                    <Button variant="ghost" size="icon" onClick={() => handleEditProduct(product.id)} className="mr-1 hover:text-primary">
                      <Edit3 className="h-4 w-4" />
                    </Button>
                    <Button variant="ghost" size="icon" onClick={() => handleDeleteProduct(product.id)} className="hover:text-destructive">
                      <Trash2 className="h-4 w-4" />
                    </Button>
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </div>
      )}
    </div>
  );
}
