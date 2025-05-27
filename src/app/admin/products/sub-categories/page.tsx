
"use client";
import { useState, useEffect } from 'react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle, DialogTrigger, DialogClose, DialogFooter } from '@/components/ui/dialog';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { useToast } from '@/hooks/use-toast';
import { MOCK_CATEGORIES, MOCK_SUBCATEGORIES } from '@/lib/mock-data';
import type { Category, SubCategory } from '@/lib/types';
import { FolderTree, PlusCircle, Trash2, Edit3, Loader2, Image as ImageIcon } from 'lucide-react';
import Image from 'next/image';

export default function AdminManageSubCategoriesPage() {
  const [parentCategories, setParentCategories] = useState<Category[]>([]);
  const [subCategories, setSubCategories] = useState<SubCategory[]>([]);
  const [selectedParentCategoryId, setSelectedParentCategoryId] = useState<string | null>(null);
  const [filteredSubCategories, setFilteredSubCategories] = useState<SubCategory[]>([]);

  const [isLoading, setIsLoading] = useState(true);
  const [isAddDialogOpen, setIsAddDialogOpen] = useState(false);
  const [newSubCategoryName, setNewSubCategoryName] = useState('');
  const [newSubCategoryImageUrl, setNewSubCategoryImageUrl] = useState('');
  const [newSubCategoryImageHint, setNewSubCategoryImageHint] = useState('');
  const [formSubmitting, setFormSubmitting] = useState(false);
  const { toast } = useToast();

  useEffect(() => {
    setIsLoading(true);
    setTimeout(() => {
      setParentCategories([...MOCK_CATEGORIES]);
      setSubCategories([...MOCK_SUBCATEGORIES]);
      setIsLoading(false);
    }, 300);
  }, []);

  useEffect(() => {
    if (selectedParentCategoryId) {
      setFilteredSubCategories(subCategories.filter(sc => sc.parentCategoryId === selectedParentCategoryId));
    } else {
      setFilteredSubCategories([]);
    }
  }, [selectedParentCategoryId, subCategories]);

  const handleAddSubCategory = async () => {
    if (!newSubCategoryName.trim()) {
      toast({ title: "Error", description: "Sub-category name cannot be empty.", variant: "destructive" });
      return;
    }
    if (!selectedParentCategoryId) {
      toast({ title: "Error", description: "Please select a parent category.", variant: "destructive" });
      return;
    }
    setFormSubmitting(true);
    await new Promise(resolve => setTimeout(resolve, 500));

    const newSubCategory: SubCategory = {
      id: `subcat-${Date.now()}-${Math.random().toString(36).substring(2, 7)}`,
      name: newSubCategoryName.trim(),
      parentCategoryId: selectedParentCategoryId,
      imageUrl: newSubCategoryImageUrl.trim() || undefined,
      imageHint: newSubCategoryImageHint.trim() || undefined,
    };
    MOCK_SUBCATEGORIES.push(newSubCategory);
    setSubCategories([...MOCK_SUBCATEGORIES]);

    toast({ title: "Sub-Category Added", description: `Sub-category "${newSubCategory.name}" has been added.` });
    setNewSubCategoryName('');
    setNewSubCategoryImageUrl('');
    setNewSubCategoryImageHint('');
    setIsAddDialogOpen(false);
    setFormSubmitting(false);
  };

  const handleDeleteSubCategory = (subCategoryId: string) => {
    if (window.confirm("Are you sure you want to delete this sub-category?")) {
      const subCategoryToDelete = MOCK_SUBCATEGORIES.find(sc => sc.id === subCategoryId);
      const index = MOCK_SUBCATEGORIES.findIndex(sc => sc.id === subCategoryId);
      if (index > -1) {
        MOCK_SUBCATEGORIES.splice(index, 1);
        setSubCategories([...MOCK_SUBCATEGORIES]);
        toast({ title: "Sub-Category Deleted", description: `Sub-category "${subCategoryToDelete?.name}" has been deleted.` });
      }
    }
  };

  const handleEditSubCategory = (id: string) => {
    toast({ title: "Edit Action", description: `Edit sub-category ${id} (Not implemented for images in this step).` });
  };

  if (isLoading) {
    return (
      <div className="flex items-center justify-center min-h-[calc(100vh-200px)]">
        <Loader2 className="h-12 w-12 animate-spin text-primary" />
      </div>
    );
  }

  const selectedParentCategoryName = parentCategories.find(c => c.id === selectedParentCategoryId)?.name || "";

  return (
    <div className="space-y-8 py-4">
      <div className="flex items-center justify-between">
        <h1 className="text-3xl font-bold flex items-center gap-3">
          <FolderTree className="h-8 w-8 text-primary"/>
          Manage Sub-Categories {selectedParentCategoryName && `for ${selectedParentCategoryName}`}
        </h1>
        <Dialog open={isAddDialogOpen} onOpenChange={setIsAddDialogOpen}>
          <DialogTrigger asChild>
            <Button disabled={!selectedParentCategoryId}>
              <PlusCircle className="mr-2 h-4 w-4" /> Add New Sub-Category
            </Button>
          </DialogTrigger>
          <DialogContent className="sm:max-w-lg">
            <DialogHeader>
              <DialogTitle>Add New Sub-Category {selectedParentCategoryName && `under ${selectedParentCategoryName}`}</DialogTitle>
              <DialogDescription>Enter the details for the new sub-category.</DialogDescription>
            </DialogHeader>
            <div className="grid gap-4 py-4">
              <div className="space-y-2">
                <Label htmlFor="subcategory-name">Name*</Label>
                <Input
                  id="subcategory-name"
                  value={newSubCategoryName}
                  onChange={(e) => setNewSubCategoryName(e.target.value)}
                  placeholder="e.g., Smartphones"
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="subcategory-image-url">Image URL</Label>
                <Input
                  id="subcategory-image-url"
                  value={newSubCategoryImageUrl}
                  onChange={(e) => setNewSubCategoryImageUrl(e.target.value)}
                  placeholder="https://placehold.co/80x80.png"
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="subcategory-image-hint">Image Hint (for AI)</Label>
                <Input
                  id="subcategory-image-hint"
                  value={newSubCategoryImageHint}
                  onChange={(e) => setNewSubCategoryImageHint(e.target.value)}
                  placeholder="e.g., mobile phones"
                />
              </div>
            </div>
            <DialogFooter>
              <DialogClose asChild><Button type="button" variant="outline" disabled={formSubmitting}>Cancel</Button></DialogClose>
              <Button onClick={handleAddSubCategory} disabled={formSubmitting || !newSubCategoryName.trim() || !selectedParentCategoryId}>
                  {formSubmitting && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
                  Add Sub-Category
              </Button>
            </DialogFooter>
          </DialogContent>
        </Dialog>
      </div>

      <Card>
        <CardHeader>
          <CardTitle>Select Parent Category</CardTitle>
          <Select onValueChange={(value) => setSelectedParentCategoryId(value === 'none' ? null : value)} value={selectedParentCategoryId || 'none'}>
            <SelectTrigger className="w-full md:w-[300px]">
              <SelectValue placeholder="Select a parent category to manage its sub-categories" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="none">-- Select Parent Category --</SelectItem>
              {parentCategories.map(category => (
                <SelectItem key={category.id} value={category.id}>{category.name}</SelectItem>
              ))}
            </SelectContent>
          </Select>
        </CardHeader>
        {selectedParentCategoryId && (
          <CardContent>
            <CardTitle className="text-xl mt-4 mb-2">Sub-Categories for {selectedParentCategoryName}</CardTitle>
            {filteredSubCategories.length > 0 ? (
              <div className="space-y-3">
                {filteredSubCategories.map(subCategory => (
                  <div key={subCategory.id} className="flex items-center justify-between p-3 border rounded-md hover:shadow-sm transition-shadow">
                    <div className="flex items-center gap-3">
                       {subCategory.imageUrl ? (
                        <Image src={subCategory.imageUrl} alt={subCategory.name} width={40} height={40} className="rounded-md object-cover" data-ai-hint={subCategory.imageHint || subCategory.name.toLowerCase()} />
                      ) : (
                        <ImageIcon className="h-10 w-10 text-muted-foreground" />
                      )}
                      <div>
                          <h3 className="font-semibold">{subCategory.name}</h3>
                          <p className="text-xs text-muted-foreground">ID: {subCategory.id}</p>
                      </div>
                    </div>
                    <div className="flex gap-2">
                      <Button variant="outline" size="sm" onClick={() => handleEditSubCategory(subCategory.id)} className="hover:text-primary">
                        <Edit3 className="h-4 w-4"/>
                      </Button>
                      <Button variant="destructive" size="sm" onClick={() => handleDeleteSubCategory(subCategory.id)}>
                        <Trash2 className="h-4 w-4"/>
                      </Button>
                    </div>
                  </div>
                ))}
              </div>
            ) : (
              <p className="text-muted-foreground">No sub-categories found for "{selectedParentCategoryName}". Add a new one to get started.</p>
            )}
          </CardContent>
        )}
         {!selectedParentCategoryId && (
            <CardContent>
                <p className="text-muted-foreground py-4">Please select a parent category to view or manage its sub-categories.</p>
            </CardContent>
         )}
      </Card>
    </div>
  );
}
