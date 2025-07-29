"use client";
import { useState, useEffect } from 'react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle, DialogClose, DialogFooter } from '@/components/ui/dialog';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { useToast } from '@/hooks/use-toast';
import type { Category, FeaturedImage } from '@/lib/types';
import { FolderTree, PlusCircle, Trash2, Edit3, Loader2, Image as ImageIcon, ArrowUpDown } from 'lucide-react';
import Image from 'next/image';
import { ScrollArea } from '@/components/ui/scroll-area';
import ImageUpload from '@/components/admin/image-upload';
import { apiClient } from '@/lib/api-client';

const generateId = () => `cat-${Date.now()}-${Math.random().toString(36).substring(2, 7)}`;
const generateFeaturedImageId = (index: number) => `feat-img-${index + 1}`;

const MAX_FEATURED_IMAGES = 4;

export default function AdminManageCategoriesPage() {
  const [categories, setCategories] = useState<Category[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [isDialogOpen, setIsDialogOpen] = useState(false);
  const [currentCategory, setCurrentCategory] = useState<Partial<Category>>({});
  const [isEditing, setIsEditing] = useState(false);
  const [formSubmitting, setFormSubmitting] = useState(false);
  const { toast } = useToast();

  // Fetch categories from API
  const fetchCategories = async () => {
    try {
      setIsLoading(true);
      const categoriesData = await apiClient.getCategories();
      setCategories(categoriesData);
    } catch (error) {
      console.error('Error fetching categories:', error);
      toast({
        title: "Error",
        description: "Failed to load categories.",
        variant: "destructive",
      });
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    fetchCategories();
  }, []);

  const openDialog = (category?: Category) => {
    if (category) {
      // Ensure featuredImages is an array of up to 4, padding with defaults if necessary
      const currentFeatured = Array.isArray(category.featuredImages) ? category.featuredImages : [];
      const featuredImages = Array.from({ length: MAX_FEATURED_IMAGES }).map((_, i) => ({
        id: generateFeaturedImageId(i),
        imageUrl: currentFeatured[i]?.imageUrl || '',
        imageHint: currentFeatured[i]?.imageHint || '',
        linkUrl: currentFeatured[i]?.linkUrl || '',
        title: currentFeatured[i]?.title || '',
      }));
      setCurrentCategory({ ...category, featuredImages });
      setIsEditing(true);
    } else {
      const featuredImages = Array.from({ length: MAX_FEATURED_IMAGES }).map((_, i) => ({
        id: generateFeaturedImageId(i),
        imageUrl: '',
        imageHint: '',
        linkUrl: '',
        title: '',
      }));
      setCurrentCategory({
        name: '',
        imageUrl: '',
        imageHint: '',
        sortOrder: (categories.length + 1) * 10,
        featuredImages,
        categorySlides: []
      });
      setIsEditing(false);
    }
    setIsDialogOpen(true);
  };

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
    const { name, value, type } = e.target;
    setCurrentCategory(prev => ({ ...prev, [name]: type === 'number' ? parseInt(value, 10) || 0 : value }));
  };

  const handleCategoryImageChange = (urls: string[]) => {
    setCurrentCategory(prev => ({ 
      ...prev, 
      imageUrl: urls[0] || '',
      imageHint: prev.imageHint || prev.name?.toLowerCase() || ''
    }));
  };

  const handleFeaturedImageChange = (index: number, field: keyof FeaturedImage, value: string) => {
    setCurrentCategory(prev => {
      if (!prev || !Array.isArray(prev.featuredImages)) return prev;
      const updatedFeaturedImages = [...prev.featuredImages];
      if (updatedFeaturedImages[index]) {
        // @ts-ignore
        updatedFeaturedImages[index][field] = value;
      }
      return { ...prev, featuredImages: updatedFeaturedImages };
    });
  };

  const handleFeaturedImageUpload = (index: number, urls: string[]) => {
    setCurrentCategory(prev => {
      if (!prev || !Array.isArray(prev.featuredImages)) return prev;
      const updatedFeaturedImages = [...prev.featuredImages];
      if (updatedFeaturedImages[index]) {
        updatedFeaturedImages[index].imageUrl = urls[0] || '';
      }
      return { ...prev, featuredImages: updatedFeaturedImages };
    });
  };

  const handleSaveCategory = async () => {
    if (!currentCategory.name?.trim()) {
      toast({ title: "Error", description: "Category name cannot be empty.", variant: "destructive" });
      return;
    }
    setFormSubmitting(true);

    try {
      // Filter out featured images that don't have a real imageUrl unless a title or link is set
      const finalFeaturedImages = currentCategory.featuredImages?.filter(
        img => img.imageUrl || img.linkUrl || img.title
      ).map(img => ({
          id: img.id || generateFeaturedImageId(0),
          imageUrl: img.imageUrl || '',
          imageHint: img.imageHint || '',
          linkUrl: img.linkUrl || '',
          title: img.title || ''
      })) || [];

      const categoryDataToSave: Category = {
        id: currentCategory.id || generateId(),
        name: currentCategory.name.trim(),
        imageUrl: currentCategory.imageUrl?.trim() || '',
        imageHint: currentCategory.imageHint?.trim() || currentCategory.name.toLowerCase(),
        sortOrder: currentCategory.sortOrder === undefined ? (categories.length + 1) * 10 : currentCategory.sortOrder,
        featuredImages: finalFeaturedImages,
        categorySlides: currentCategory.categorySlides || [],
      };

      if (isEditing && currentCategory.id) {
        // Update existing category
        await apiClient.updateCategory(currentCategory.id, categoryDataToSave);
        toast({ title: "Category Updated", description: `Category "${categoryDataToSave.name}" has been updated.` });
      } else {
        // Create new category
        await apiClient.createCategory(categoryDataToSave);
        toast({ title: "Category Added", description: `Category "${categoryDataToSave.name}" has been added.` });
      }

      // Refresh categories list
      await fetchCategories();
      setIsDialogOpen(false);
      setCurrentCategory({});
    } catch (error) {
      console.error('Error saving category:', error);
      toast({
        title: "Error",
        description: "Failed to save category. Please try again.",
        variant: "destructive",
      });
    } finally {
      setFormSubmitting(false);
    }
  };

  const handleDeleteCategory = async (categoryId: string) => {
    if (window.confirm("Are you sure you want to delete this category? This may affect sub-categories and products.")) {
      try {
        await apiClient.deleteCategory(categoryId);
        toast({ title: "Category Deleted", description: "The category has been deleted." });
        await fetchCategories(); // Refresh the list
      } catch (error) {
        console.error('Error deleting category:', error);
        toast({
          title: "Error",
          description: "Failed to delete category. Please try again.",
          variant: "destructive",
        });
      }
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
                  <div className="flex items-center gap-2">
                    <Button variant="outline" size="sm" onClick={() => openDialog(category)}>
                      <Edit3 className="h-4 w-4" />
                    </Button>
                    <Button variant="outline" size="sm" onClick={() => handleDeleteCategory(category.id)}>
                      <Trash2 className="h-4 w-4" />
                    </Button>
                  </div>
                </div>
              ))}
            </div>
          ) : (
            <div className="text-center py-8 text-muted-foreground">
              <FolderTree className="h-12 w-12 mx-auto mb-4 opacity-50" />
              <p>No categories found. Create your first category to get started.</p>
            </div>
          )}
        </CardContent>
      </Card>

      {/* Add/Edit Category Dialog */}
      <Dialog open={isDialogOpen} onOpenChange={setIsDialogOpen}>
        <DialogContent className="max-w-2xl max-h-[90vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle>{isEditing ? 'Edit Category' : 'Add New Category'}</DialogTitle>
            <DialogDescription>
              {isEditing ? 'Update the category information below.' : 'Fill in the details to create a new category.'}
            </DialogDescription>
          </DialogHeader>
          
          <div className="space-y-6">
            {/* Basic Information */}
            <div className="space-y-4">
              <div>
                <Label htmlFor="name">Category Name *</Label>
                <Input
                  id="name"
                  name="name"
                  value={currentCategory.name || ''}
                  onChange={handleInputChange}
                  placeholder="e.g., Electronics"
                  required
                />
              </div>
              
              <div>
                <Label htmlFor="imageHint">Image Hint</Label>
                <Input
                  id="imageHint"
                  name="imageHint"
                  value={currentCategory.imageHint || ''}
                  onChange={handleInputChange}
                  placeholder="e.g., electronics gadgets"
                />
              </div>
              
              <div>
                <Label htmlFor="sortOrder">Sort Order</Label>
                <Input
                  id="sortOrder"
                  name="sortOrder"
                  type="number"
                  value={currentCategory.sortOrder || ''}
                  onChange={handleInputChange}
                  placeholder="e.g., 1"
                />
              </div>
            </div>

            {/* Category Image */}
            <div>
              <Label>Category Image</Label>
              <ImageUpload
                value={currentCategory.imageUrl ? [currentCategory.imageUrl] : []}
                onChange={handleCategoryImageChange}
                maxFiles={1}
                className="mt-2"
              />
            </div>

            {/* Featured Images */}
            <div>
              <Label>Featured Images (Optional)</Label>
              <p className="text-sm text-muted-foreground mb-3">
                Add up to 4 featured images that will be displayed on the category page.
              </p>
              <ScrollArea className="h-64">
                <div className="space-y-4">
                  {Array.from({ length: MAX_FEATURED_IMAGES }).map((_, index) => (
                    <div key={index} className="border rounded-lg p-4 space-y-3">
                      <div className="flex items-center gap-2">
                        <ImageIcon className="h-4 w-4" />
                        <span className="text-sm font-medium">Featured Image {index + 1}</span>
                      </div>
                      
                      <ImageUpload
                        onChange={(urls) => handleFeaturedImageUpload(index, urls)}
                        value={currentCategory.featuredImages?.[index]?.imageUrl ? [currentCategory.featuredImages[index].imageUrl] : []}
                        maxFiles={1}
                        className="mb-3"
                      />
                      
                      <div className="grid grid-cols-2 gap-2">
                        <div>
                          <Label htmlFor={`title-${index}`}>Title</Label>
                          <Input
                            id={`title-${index}`}
                            value={currentCategory.featuredImages?.[index]?.title || ''}
                            onChange={(e) => handleFeaturedImageChange(index, 'title', e.target.value)}
                            placeholder="e.g., Latest Smartphones"
                          />
                        </div>
                        <div>
                          <Label htmlFor={`link-${index}`}>Link URL</Label>
                          <Input
                            id={`link-${index}`}
                            value={currentCategory.featuredImages?.[index]?.linkUrl || ''}
                            onChange={(e) => handleFeaturedImageChange(index, 'linkUrl', e.target.value)}
                            placeholder="e.g., /category/smartphones"
                          />
                        </div>
                      </div>
                      
                      <div>
                        <Label htmlFor={`hint-${index}`}>Image Hint</Label>
                        <Input
                          id={`hint-${index}`}
                          value={currentCategory.featuredImages?.[index]?.imageHint || ''}
                          placeholder="e.g., smartphone showcase"
                          onChange={(e) => handleFeaturedImageChange(index, 'imageHint', e.target.value)}
                        />
                      </div>
                    </div>
                  ))}
                </div>
              </ScrollArea>
            </div>
          </div>

          <DialogFooter>
            <DialogClose asChild>
              <Button variant="outline">Cancel</Button>
            </DialogClose>
            <Button onClick={handleSaveCategory} disabled={formSubmitting}>
              {formSubmitting ? (
                <Loader2 className="mr-2 h-4 w-4 animate-spin" />
              ) : (
                <FolderTree className="mr-2 h-4 w-4" />
              )}
              {isEditing ? 'Update Category' : 'Create Category'}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}
