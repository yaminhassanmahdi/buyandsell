
"use client";
import { useState, useEffect } from 'react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle, DialogTrigger, DialogClose } from '@/components/ui/dialog';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { useToast } from '@/hooks/use-toast';
import { MOCK_BRANDS } from '@/lib/mock-data'; // Assuming MOCK_BRANDS is mutable
import type { Brand } from '@/lib/types';
import { Tags, PlusCircle, Trash2, Edit3, Loader2 } from 'lucide-react';

export default function AdminManageBrandsPage() {
  const [brands, setBrands] = useState<Brand[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [isAddDialogOpen, setIsAddDialogOpen] = useState(false);
  const [newBrandName, setNewBrandName] = useState('');
  const [formSubmitting, setFormSubmitting] = useState(false);
  const { toast } = useToast();

  useEffect(() => {
    setIsLoading(true);
    setTimeout(() => {
      setBrands([...MOCK_BRANDS]);
      setIsLoading(false);
    }, 300);
  }, []);

  const handleAddBrand = async () => {
    if (!newBrandName.trim()) {
      toast({ title: "Error", description: "Brand name cannot be empty.", variant: "destructive" });
      return;
    }
    setFormSubmitting(true);
    await new Promise(resolve => setTimeout(resolve, 500));

    const newBrand: Brand = {
      id: `brand-${Date.now()}-${Math.random().toString(36).substring(2, 7)}`,
      name: newBrandName.trim(),
    };
    MOCK_BRANDS.push(newBrand);
    setBrands([...MOCK_BRANDS]);

    toast({ title: "Brand Added", description: `Brand "${newBrand.name}" has been added.` });
    setNewBrandName('');
    setIsAddDialogOpen(false);
    setFormSubmitting(false);
  };

  const handleDeleteBrand = (brandId: string) => {
    if (window.confirm("Are you sure you want to delete this brand?")) {
      const brandToDelete = MOCK_BRANDS.find(b => b.id === brandId);
      const index = MOCK_BRANDS.findIndex(b => b.id === brandId);
      if (index > -1) {
        MOCK_BRANDS.splice(index, 1);
        setBrands([...MOCK_BRANDS]);
        toast({ title: "Brand Deleted", description: `Brand "${brandToDelete?.name}" has been deleted.` });
      }
    }
  };
  
  const handleEditBrand = (id: string) => {
    toast({ title: "Edit Action", description: `Edit brand ${id} (Not implemented).` });
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
          <Tags className="h-8 w-8 text-primary"/>
          Manage Brands
        </h1>
        <Dialog open={isAddDialogOpen} onOpenChange={setIsAddDialogOpen}>
          <DialogTrigger asChild>
            <Button>
              <PlusCircle className="mr-2 h-4 w-4" /> Add New Brand
            </Button>
          </DialogTrigger>
          <DialogContent className="sm:max-w-md">
            <DialogHeader>
              <DialogTitle>Add New Brand</DialogTitle>
              <DialogDescription>Enter the name for the new brand.</DialogDescription>
            </DialogHeader>
            <div className="grid gap-4 py-4">
              <div className="grid grid-cols-4 items-center gap-4">
                <Label htmlFor="brand-name" className="text-right">Name</Label>
                <Input 
                  id="brand-name" 
                  value={newBrandName}
                  onChange={(e) => setNewBrandName(e.target.value)}
                  className="col-span-3" 
                  placeholder="e.g., Apple"
                />
              </div>
            </div>
             <DialogClose asChild>
                <Button type="button" variant="outline" disabled={formSubmitting}>Cancel</Button>
            </DialogClose>
            <Button onClick={handleAddBrand} disabled={formSubmitting || !newBrandName.trim()}>
                {formSubmitting && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
                Add Brand
            </Button>
          </DialogContent>
        </Dialog>
      </div>
      
      <Card>
        <CardHeader>
          <CardTitle>Brand List</CardTitle>
          <CardDescription>View, add, edit, or delete product brands. Brands are currently global.</CardDescription>
        </CardHeader>
        <CardContent>
           {brands.length > 0 ? (
            <div className="space-y-3">
              {brands.map(brand => (
                <div key={brand.id} className="flex items-center justify-between p-3 border rounded-md hover:shadow-sm transition-shadow">
                  <div>
                    <h3 className="font-semibold">{brand.name}</h3>
                     <p className="text-xs text-muted-foreground">ID: {brand.id}</p>
                  </div>
                  <div className="flex gap-2">
                    <Button variant="outline" size="sm" onClick={() => handleEditBrand(brand.id)} className="hover:text-primary">
                        <Edit3 className="h-4 w-4"/>
                    </Button>
                    <Button variant="destructive" size="sm" onClick={() => handleDeleteBrand(brand.id)}>
                        <Trash2 className="h-4 w-4"/>
                    </Button>
                  </div>
                </div>
              ))}
            </div>
          ) : (
            <p className="text-muted-foreground">No brands found. Add a new brand to get started.</p>
          )}
        </CardContent>
      </Card>
    </div>
  );
}
