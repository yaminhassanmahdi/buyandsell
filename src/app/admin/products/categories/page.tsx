
"use client";
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { FolderTree, PlusCircle } from 'lucide-react';

// Mock data for categories - in a real app, this would come from a state/DB
const mockCategories = [
  { id: 'electronics', name: 'Electronics', description: 'Gadgets, devices, and more.' },
  { id: 'fashion', name: 'Fashion', description: 'Apparel, accessories, and footwear.' },
  { id: 'home-garden', name: 'Home & Garden', description: 'Furniture, decor, and tools.' },
];

export default function AdminManageCategoriesPage() {
  // Placeholder functions for CRUD operations
  const handleAddCategory = () => alert("Add category functionality to be implemented.");
  const handleEditCategory = (id: string) => alert(`Edit category ${id} functionality to be implemented.`);
  const handleDeleteCategory = (id: string) => alert(`Delete category ${id} functionality to be implemented.`);

  return (
    <div className="space-y-8 py-4">
      <div className="flex items-center justify-between">
        <h1 className="text-3xl font-bold flex items-center gap-3">
          <FolderTree className="h-8 w-8 text-primary"/>
          Manage Categories
        </h1>
        <Button onClick={handleAddCategory}>
          <PlusCircle className="mr-2 h-4 w-4" /> Add New Category
        </Button>
      </div>
      
      <Card>
        <CardHeader>
          <CardTitle>Category List</CardTitle>
          <CardDescription>View, add, edit, or delete product categories.</CardDescription>
        </CardHeader>
        <CardContent>
          {mockCategories.length > 0 ? (
            <div className="space-y-4">
              {mockCategories.map(category => (
                <div key={category.id} className="flex items-center justify-between p-3 border rounded-md hover:shadow-sm">
                  <div>
                    <h3 className="font-semibold">{category.name}</h3>
                    <p className="text-sm text-muted-foreground">{category.description}</p>
                  </div>
                  <div className="flex gap-2">
                    <Button variant="outline" size="sm" onClick={() => handleEditCategory(category.id)}>Edit</Button>
                    <Button variant="destructive" size="sm" onClick={() => handleDeleteCategory(category.id)}>Delete</Button>
                  </div>
                </div>
              ))}
            </div>
          ) : (
            <p className="text-muted-foreground">No categories found. Add a new category to get started.</p>
          )}
        </CardContent>
      </Card>
      <p className="text-sm text-muted-foreground">
        Note: Full CRUD functionality for categories (add, edit, delete) is a placeholder and needs backend integration.
      </p>
    </div>
  );
}
