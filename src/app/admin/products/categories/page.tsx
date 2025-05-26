
"use client";
import { useState, useEffect } from 'react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle, DialogTrigger, DialogClose } from '@/components/ui/dialog';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { useToast } from '@/hooks/use-toast';
import { MOCK_CATEGORIES } from '@/lib/mock-data'; // Assuming MOCK_CATEGORIES is now mutable
import type { Category } from '@/lib/types';
import { FolderTree, PlusCircle, Trash2, Edit3, Loader2 } from 'lucide-react';

export default function AdminManageCategoriesPage() {
  const [categories, setCategories] = useState<Category[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [isAddDialogOpen, setIsAddDialogOpen] = useState(false);
  const [newCategoryName, setNewCategoryName] = useState('');
  const [formSubmitting, setFormSubmitting] = useState(false);
  const { toast } = useToast();

  useEffect(() => {
    // Simulate fetching categories
    setIsLoading(true);
    setTimeout(() => {
      setCategories([...MOCK_CATEGORIES]); // Use a copy to allow local state updates
      setIsLoading(false);
    }, 300);
  }, []);

  const handleAddCategory = async () => {
    if (!newCategoryName.trim()) {
      toast({ title: "Error", description: "Category name cannot be empty.", variant: "destructive" });
      return;
    }
    setFormSubmitting(true);
    await new Promise(resolve => setTimeout(resolve, 500)); // Simulate API call

    const newCategory: Category = {
      id: `cat-${Date.now()}-${Math.random().toString(36).substring(2, 7)}`, // More unique ID
      name: newCategoryName.trim(),
    };
    MOCK_CATEGORIES.push(newCategory); // Directly mutate the mock data array
    setCategories([...MOCK_CATEGORIES]); // Update local state

    toast({ title: "Category Added", description: `Category "${newCategory.name}" has been added.` });
    setNewCategoryName('');
    setIsAddDialogOpen(false);
    setFormSubmitting(false);
  };

  const handleDeleteCategory = (categoryId: string) => {
    // In a real app, check for sub-categories or products associated with this category.
    // For this mock, we'll just show an alert.
    // If confirmed, filter out the category.
    if (window.confirm("Are you sure you want to delete this category? This action cannot be undone.")) {
      const categoryToDelete = MOCK_CATEGORIES.find(cat => cat.id === categoryId);
      // Basic check: are there subcategories for this parent?
      // const hasSubcategories = MOCK_SUBCATEGORIES.some(sub => sub.parentCategoryId === categoryId);
      // if (hasSubcategories) {
      //   toast({ title: "Cannot Delete", description: "This category has sub-categories. Delete them first.", variant: "destructive"});
      //   return;
      // }
      
      const index = MOCK_CATEGORIES.findIndex(cat => cat.id === categoryId);
      if (index > -1) {
        MOCK_CATEGORIES.splice(index, 1);
        setCategories([...MOCK_CATEGORIES]);
        toast({ title: "Category Deleted", description: `Category "${categoryToDelete?.name}" has been deleted.` });
      }
    }
  };
  
  const handleEditCategory = (id: string) => {
    toast({ title: "Edit Action", description: `Edit category ${id} (Not implemented).` });
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
          <FolderTree className="h-8 w-8 text-primary"/>
          Manage Parent Categories
        </h1>
        <Dialog open={isAddDialogOpen} onOpenChange={setIsAddDialogOpen}>
          <DialogTrigger asChild>
            <Button>
              <PlusCircle className="mr-2 h-4 w-4" /> Add New Category
            </Button>
          </DialogTrigger>
          <DialogContent className="sm:max-w-md">
            <DialogHeader>
              <DialogTitle>Add New Parent Category</DialogTitle>
              <DialogDescription>Enter the name for the new parent category.</DialogDescription>
            </DialogHeader>
            <div className="grid gap-4 py-4">
              <div className="grid grid-cols-4 items-center gap-4">
                <Label htmlFor="category-name" className="text-right">Name</Label>
                <Input 
                  id="category-name" 
                  value={newCategoryName}
                  onChange={(e) => setNewCategoryName(e.target.value)}
                  className="col-span-3" 
                  placeholder="e.g., Electronics"
                />
              </div>
            </div>
            <DialogClose asChild>
              <Button type="button" variant="outline" disabled={formSubmitting}>Cancel</Button>
            </DialogClose>
            <Button onClick={handleAddCategory} disabled={formSubmitting || !newCategoryName.trim()}>
              {formSubmitting && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
              Add Category
            </Button>
          </DialogContent>
        </Dialog>
      </div>
      
      <Card>
        <CardHeader>
          <CardTitle>Category List</CardTitle>
          <CardDescription>View, add, edit, or delete parent product categories.</CardDescription>
        </CardHeader>
        <CardContent>
           {categories.length > 0 ? (
            <div className="space-y-3">
              {categories.map(category => (
                <div key={category.id} className="flex items-center justify-between p-3 border rounded-md hover:shadow-sm transition-shadow">
                  <div>
                    <h3 className="font-semibold">{category.name}</h3>
                    <p className="text-xs text-muted-foreground">ID: {category.id}</p>
                  </div>
                  <div className="flex gap-2">
                    <Button variant="outline" size="sm" onClick={() => handleEditCategory(category.id)} className="hover:text-primary">
                        <Edit3 className="h-4 w-4"/>
                    </Button>
                    <Button variant="destructive" size="sm" onClick={() => handleDeleteCategory(category.id)}>
                        <Trash2 className="h-4 w-4"/>
                    </Button>
                  </div>
                </div>
              ))}
            </div>
          ) : (
            <p className="text-muted-foreground">No parent categories found. Add a new category to get started.</p>
          )}
        </CardContent>
      </Card>
    </div>
  );
}
