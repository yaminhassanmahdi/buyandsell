
"use client";
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Tags, PlusCircle } from 'lucide-react';

// Mock data for brands - in a real app, this would come from a state/DB
const mockBrands = [
  { id: 'apple', name: 'Apple', associatedCategories: ['Electronics'] },
  { id: 'samsung', name: 'Samsung', associatedCategories: ['Electronics', 'Home & Garden'] },
  { id: 'nike', name: 'Nike', associatedCategories: ['Fashion'] },
];

export default function AdminManageBrandsPage() {
  // Placeholder functions
  const handleAddBrand = () => alert("Add brand functionality to be implemented.");
  const handleEditBrand = (id: string) => alert(`Edit brand ${id} functionality to be implemented.`);
  const handleDeleteBrand = (id: string) => alert(`Delete brand ${id} functionality to be implemented.`);

  return (
    <div className="space-y-8 py-4">
      <div className="flex items-center justify-between">
        <h1 className="text-3xl font-bold flex items-center gap-3">
          <Tags className="h-8 w-8 text-primary"/>
          Manage Brands
        </h1>
        <Button onClick={handleAddBrand}>
          <PlusCircle className="mr-2 h-4 w-4" /> Add New Brand
        </Button>
      </div>
      
      <Card>
        <CardHeader>
          <CardTitle>Brand List</CardTitle>
          <CardDescription>View, add, edit, or delete product brands. Brands can be associated with categories.</CardDescription>
        </CardHeader>
        <CardContent>
           {mockBrands.length > 0 ? (
            <div className="space-y-4">
              {mockBrands.map(brand => (
                <div key={brand.id} className="flex items-center justify-between p-3 border rounded-md hover:shadow-sm">
                  <div>
                    <h3 className="font-semibold">{brand.name}</h3>
                    <p className="text-sm text-muted-foreground">Categories: {brand.associatedCategories.join(', ') || 'N/A'}</p>
                  </div>
                  <div className="flex gap-2">
                    <Button variant="outline" size="sm" onClick={() => handleEditBrand(brand.id)}>Edit</Button>
                    <Button variant="destructive" size="sm" onClick={() => handleDeleteBrand(brand.id)}>Delete</Button>
                  </div>
                </div>
              ))}
            </div>
          ) : (
            <p className="text-muted-foreground">No brands found. Add a new brand to get started.</p>
          )}
        </CardContent>
      </Card>
      <p className="text-sm text-muted-foreground">
        Note: Full CRUD functionality for brands and category association is a placeholder and needs backend integration.
      </p>
    </div>
  );
}
