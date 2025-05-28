
"use client";
import { useState, useEffect } from 'react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle, DialogTrigger, DialogClose, DialogFooter } from '@/components/ui/dialog';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { useToast } from '@/hooks/use-toast';
import type { Category } from '@/lib/types';
import { FolderTree, PlusCircle, Trash2, Edit3, Loader2, Image as ImageIcon, ArrowUpDown } from 'lucide-react';
import Image from 'next/image';
import useLocalStorage from '@/hooks/use-local-storage';
import { CATEGORIES_STORAGE_KEY, INITIAL_CATEGORIES } from '@/lib/constants';

const generateId = () => `cat-${Date.now()}-${Math.random().toString(36).substring(2, 7)}`;

export default function AdminManageCategoriesPage() {
  const [categories, setCategories] = useLocalStorage<Category[]>(
    CATEGORIES_STORAGE_KEY,
    INITIAL_CATEGORIES
  );
  const [isLoading, setIsLoading] = useState(true);
  const [isDialogOpen, setIsDialogOpen] = useState(false);
  const [currentCategory, setCurrentCategory] = useState<Partial<Category>>({});
  const [isEditing, setIsEditing] = useState(false);
  const [formSubmitting, setFormSubmitting] = useState(false);
  const { toast } = useToast();

  useEffect(() => {
    setIsLoading(false); 
  }, []);

  const openDialog = (category?: Category) => {
    if (category) {
      setCurrentCategory({ ...category });
      setIsEditing(true);
    } else {
      setCurrentCategory({ name: '', imageUrl: 'https://placehold.co/80x80.png', imageHint: '', sortOrder: (categories.length + 1) * 10 });
      setIsEditing(false);
    }
    setIsDialogOpen(true);
  };

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value, type } = e.target;
    setCurrentCategory(prev => ({ ...prev, [name]: type === 'number' ? parseInt(value, 10) || 0 : value }));
  };

  const handleSaveCategory = async () => {
    if (!currentCategory.name?.trim()) {
      toast({ title: "Error", description: "Category name cannot be empty.", variant: "destructive" });
      return;
    }
    setFormSubmitting(true);
    await new Promise(resolve => setTimeout(resolve, 500));

    if (isEditing && currentCategory.id) {
      setCategories(prev => prev.map(cat => cat.id === currentCategory.id ? (currentCategory as Category) : cat)
                                .sort((a,b) => (a.sortOrder || 999) - (b.sortOrder || 999) || a.name.localeCompare(b.name)));
      toast({ title: "Category Updated", description: `Category "${currentCategory.name}" has been updated.` });
    } else {
      const newCategory: Category = {
        id: generateId(),
        name: currentCategory.name.trim(),
        imageUrl: currentCategory.imageUrl?.trim() || 'https://placehold.co/80x80.png',
        imageHint: currentCategory.imageHint?.trim() || currentCategory.name.toLowerCase(),
        sortOrder: currentCategory.sortOrder === undefined ? (categories.length + 1) * 10 : currentCategory.sortOrder,
      };
      setCategories(prev => [...prev, newCategory]
                                .sort((a,b) => (a.sortOrder || 999) - (b.sortOrder || 999) || a.name.localeCompare(b.name)));
      toast({ title: "Category Added", description: `Category "${newCategory.name}" has been added.` });
    }
    setIsDialogOpen(false);
    setCurrentCategory({});
    setFormSubmitting(false);
  };

  const handleDeleteCategory = (categoryId: string) => {
    if (window.confirm("Are you sure you want to delete this category? This may affect sub-categories and products.")) {
      setCategories(prev => prev.filter(cat => cat.id !== categoryId));
      toast({ title: "Category Deleted", description: "The category has been deleted." });
    }
  };
  
  const sortedCategories = [...categories].sort((a,b) => (a.sortOrder || 999) - (b.sortOrder || 999) || a.name.localeCompare(b.name));


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
        <Button onClick={() => openDialog()}>
          <PlusCircle className="mr-2 h-4 w-4" /> Add New Category
        </Button>
      </div>

      <Card>
        <CardHeader>
          <CardTitle>Category List</CardTitle>
          <CardDescription>View, add, edit, or delete parent product categories. Lower sort order appears first.</CardDescription>
        </CardHeader>
        <CardContent>
           {sortedCategories.length > 0 ? (
            <div className="space-y-3">
              {sortedCategories.map(category => (
                <div key={category.id} className="flex items-center justify-between p-3 border rounded-md hover:shadow-sm transition-shadow">
                  <div className="flex items-center gap-3">
                    {category.imageUrl ? (
                      <Image src={category.imageUrl} alt={category.name} width={40} height={40} className="rounded-md object-cover" data-ai-hint={category.imageHint || category.name.toLowerCase()} />
                    ) : (
                      <ImageIcon className="h-10 w-10 text-muted-foreground" />
                    )}
                    <div>
                      <h3 className="font-semibold">{category.name} <span className="text-xs text-muted-foreground">(SO: {category.sortOrder === undefined ? 'N/A' : category.sortOrder})</span></h3>
                      <p className="text-xs text-muted-foreground">ID: {category.id}</p>
                    </div>
                  </div>
                  <div className="flex gap-2">
                    <Button variant="outline" size="sm" onClick={() => openDialog(category)} className="hover:text-primary">
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

      <Dialog open={isDialogOpen} onOpenChange={setIsDialogOpen}>
        <DialogContent className="sm:max-w-lg max-h-[80vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle>{isEditing ? "Edit" : "Add New"} Parent Category</DialogTitle>
            <DialogDescription>Enter the details for the parent category.</DialogDescription>
          </DialogHeader>
          <div className="grid gap-4 py-4">
            <div className="space-y-2">
              <Label htmlFor="category-name">Name*</Label>
              <Input
                id="category-name"
                name="name"
                value={currentCategory.name || ''}
                onChange={handleInputChange}
                placeholder="e.g., Electronics"
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="category-image-url">Image URL</Label>
              <Input
                id="category-image-url"
                name="imageUrl"
                value={currentCategory.imageUrl || ''}
                onChange={handleInputChange}
                placeholder="https://placehold.co/80x80.png"
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="category-image-hint">Image Hint (for AI)</Label>
              <Input
                id="category-image-hint"
                name="imageHint"
                value={currentCategory.imageHint || ''}
                onChange={handleInputChange}
                placeholder="e.g., electronics gadget"
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="category-sort-order">Sort Order</Label>
              <Input
                id="category-sort-order"
                name="sortOrder"
                type="number"
                value={currentCategory.sortOrder === undefined ? '' : currentCategory.sortOrder}
                onChange={handleInputChange}
                placeholder="e.g., 10, 20 (lower is first)"
              />
            </div>
          </div>
          <DialogFooter>
            <DialogClose asChild><Button type="button" variant="outline" disabled={formSubmitting}>Cancel</Button></DialogClose>
            <Button onClick={handleSaveCategory} disabled={formSubmitting || !currentCategory.name?.trim()}>
              {formSubmitting && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
              {isEditing ? "Save Changes" : "Add Category"}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}

