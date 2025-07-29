"use client";
import { useState, useEffect } from 'react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle, DialogTrigger, DialogClose, DialogFooter } from '@/components/ui/dialog';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Checkbox } from '@/components/ui/checkbox';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { useToast } from '@/hooks/use-toast';
import { apiClient } from '@/lib/api-client';
import type { Category, CategoryAttributeType } from '@/lib/types';
import { Loader2, PlusCircle, Trash2, ListFilter, Tag, Edit3, Store, User } from 'lucide-react';

const generateId = () => `attr_type-${Date.now()}-${Math.random().toString(36).substring(2, 7)}`;

export default function AdminManageAttributesPage() {
  const { toast } = useToast();
  const [parentCategories, setParentCategories] = useState<Category[]>([]);
  const [selectedCategoryId, setSelectedCategoryId] = useState<string | null>(null);
  const [attributeTypes, setAttributeTypes] = useState<CategoryAttributeType[]>([]);
  const [filteredAttributeTypes, setFilteredAttributeTypes] = useState<CategoryAttributeType[]>([]);
  const [isDialogOpen, setIsDialogOpen] = useState(false);
  const [currentAttributeType, setCurrentAttributeType] = useState<Partial<CategoryAttributeType>>({});
  const [isEditing, setIsEditing] = useState(false);
  const [formSubmitting, setFormSubmitting] = useState(false);
  const [isLoading, setIsLoading] = useState(true);

  // Fetch categories and attributes from API
  const fetchData = async () => {
    try {
      setIsLoading(true);
      const [categoriesData, attributeTypesData] = await Promise.all([
        apiClient.getCategories(),
        fetch('/api/attribute-types').then(res => res.json())
      ]);
      
      setParentCategories(categoriesData);
      setAttributeTypes(attributeTypesData);
    } catch (error) {
      console.error('Error fetching data:', error);
      toast({
        title: "Error",
        description: "Failed to load categories and attributes.",
        variant: "destructive",
      });
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    fetchData();
  }, []);

  useEffect(() => {
    if (selectedCategoryId) {
      setFilteredAttributeTypes(attributeTypes.filter(attr => attr.categoryId === selectedCategoryId));
    } else {
      setFilteredAttributeTypes([]);
    }
  }, [selectedCategoryId, attributeTypes]);

  const openDialog = (attributeType?: CategoryAttributeType) => {
    if (attributeType) {
      setCurrentAttributeType({ ...attributeType });
      setIsEditing(true);
    } else {
      setCurrentAttributeType({ 
        categoryId: selectedCategoryId || '', 
        name: '',
        isButtonFeatured: false,
        isFeaturedSection: false
      });
      setIsEditing(false);
    }
    setIsDialogOpen(true);
  };

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target;
    setCurrentAttributeType(prev => ({ ...prev, [name]: value }));
  };

  const handleCheckboxChange = (field: 'isButtonFeatured' | 'isFeaturedSection') => (checked: boolean) => {
    setCurrentAttributeType(prev => ({ ...prev, [field]: checked }));
  };

  const handleSaveAttributeType = async () => {
    if (!currentAttributeType.name?.trim()) {
      toast({ title: "Error", description: "Attribute type name cannot be empty.", variant: "destructive" });
      return;
    }
    if (!currentAttributeType.categoryId) {
      toast({ title: "Error", description: "Parent category must be selected.", variant: "destructive" });
      return;
    }
    setFormSubmitting(true);

    try {
      const attributeData = {
        id: currentAttributeType.id || generateId(),
        categoryId: currentAttributeType.categoryId,
        name: currentAttributeType.name.trim(),
        isButtonFeatured: !!currentAttributeType.isButtonFeatured,
        isFeaturedSection: !!currentAttributeType.isFeaturedSection
      };

      if (isEditing && currentAttributeType.id) {
        await fetch('/api/attribute-types', {
          method: 'PUT',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify(attributeData)
        });
        toast({ title: "Attribute Type Updated", description: `"${attributeData.name}" has been updated.` });
      } else {
        await fetch('/api/attribute-types', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify(attributeData)
        });
        toast({ title: "Attribute Type Added", description: `"${attributeData.name}" added to the category.` });
      }

      // Refresh data
      await fetchData();
      setIsDialogOpen(false);
      setCurrentAttributeType({});
    } catch (error) {
      console.error('Error saving attribute type:', error);
      toast({
        title: "Error",
        description: "Failed to save attribute type. Please try again.",
        variant: "destructive",
      });
    } finally {
      setFormSubmitting(false);
    }
  };

  const handleDeleteAttributeType = async (attrTypeId: string) => {
    if (window.confirm("Are you sure you want to delete this attribute type? This may affect attribute values and products using it.")) {
      try {
        const response = await fetch(`/api/attribute-types?id=${attrTypeId}`, { method: 'DELETE' });
        if (!response.ok) {
          const error = await response.json();
          throw new Error(error.error || 'Failed to delete');
        }
        toast({ title: "Attribute Type Deleted", description: "The attribute type has been deleted." });
        await fetchData();
      } catch (error) {
        console.error('Error deleting attribute type:', error);
        toast({
          title: "Error",
          description: error instanceof Error ? error.message : "Failed to delete attribute type. Please try again.",
          variant: "destructive",
        });
      }
    }
  };

  const selectedParentCategoryName = parentCategories?.find(c => c.id === selectedCategoryId)?.name || "";

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
          <ListFilter className="h-8 w-8 text-primary"/>
          Manage Attribute Types {selectedParentCategoryName && `for ${selectedParentCategoryName}`}
        </h1>
        <Button onClick={() => openDialog()} disabled={!selectedCategoryId}>
          <PlusCircle className="mr-2 h-4 w-4" /> Add New Attribute Type
        </Button>
      </div>

      <Card>
        <CardHeader>
          <CardTitle>Select Parent Category</CardTitle>
          <Select onValueChange={(value) => setSelectedCategoryId(value === 'none' ? null : value)} value={selectedCategoryId || 'none'}>
            <SelectTrigger className="w-full md:w-[300px]">
              <SelectValue placeholder="Select a category" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="none">-- Select Parent Category --</SelectItem>
              {parentCategories.map(category => (
                <SelectItem key={category.id} value={category.id}>{category.name}</SelectItem>
              ))}
            </SelectContent>
          </Select>
        </CardHeader>
        {selectedCategoryId && (
          <CardContent>
            <CardTitle className="text-xl mt-4 mb-2">Attribute Types for "{selectedParentCategoryName}"</CardTitle>
            <CardDescription className="mb-4">Define characteristics products in this category can have (e.g., Author for Books, Color for Fashion).</CardDescription>
            {filteredAttributeTypes.length > 0 ? (
              <div className="space-y-3">
                {filteredAttributeTypes.map(attrType => (
                  <div key={attrType.id} className="flex items-center justify-between p-3 border rounded-md hover:shadow-sm">
                    <div className="flex items-center gap-3">
                      <div className="flex flex-col items-center">
                        <Tag className="h-5 w-5 text-muted-foreground" />
                        {attrType.isButtonFeatured && (
                          <Store className="h-3 w-3 text-green-600 mt-1" title="Shop By Button Featured" />
                        )}
                        {attrType.isFeaturedSection && (
                          <User className="h-3 w-3 text-purple-600 mt-1" title="Featured Section Enabled" />
                        )}
                      </div>
                      <div>
                        <h3 className="font-semibold flex items-center gap-2">
                          {attrType.name}
                          {attrType.isButtonFeatured && (
                            <span className="text-xs bg-green-100 text-green-800 px-2 py-1 rounded-full">Shop By Button</span>
                          )}
                          {attrType.isFeaturedSection && (
                            <span className="text-xs bg-purple-100 text-purple-800 px-2 py-1 rounded-full">Featured Section</span>
                          )}
                        </h3>
                        <p className="text-xs text-muted-foreground">ID: {attrType.id}</p>
                      </div>
                    </div>
                    <div className="flex gap-2">
                      <Button variant="outline" size="sm" onClick={() => openDialog(attrType)} className="hover:text-primary">
                        <Edit3 className="h-4 w-4" />
                      </Button>
                      <Button variant="destructive" size="sm" onClick={() => handleDeleteAttributeType(attrType.id)}>
                        <Trash2 className="mr-2 h-4 w-4" /> Delete
                      </Button>
                    </div>
                  </div>
                ))}
              </div>
            ) : (
              <p className="text-muted-foreground">No attribute types defined for "{selectedParentCategoryName}" yet. Add one to get started.</p>
            )}
          </CardContent>
        )}
         {!selectedCategoryId && (
            <CardContent>
                <p className="text-muted-foreground py-4">Please select a parent category to view or manage its attribute types.</p>
            </CardContent>
         )}
      </Card>

      <Dialog open={isDialogOpen} onOpenChange={setIsDialogOpen}>
        <DialogContent className="sm:max-w-md max-h-[80vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle>{isEditing ? "Edit" : "Add New"} Attribute Type {selectedParentCategoryName && `to ${selectedParentCategoryName}`}</DialogTitle>
            <DialogDescription>Define a new characteristic for products in this category.</DialogDescription>
          </DialogHeader>
          <div className="grid gap-4 py-4">
            <div className="space-y-2">
              <Label htmlFor="attribute-type-name">Attribute Type Name*</Label>
              <Input
                id="attribute-type-name"
                name="name"
                value={currentAttributeType.name || ''}
                onChange={handleInputChange}
                placeholder="e.g., Author, Screen Size"
              />
            </div>
            
            <div className="flex items-center space-x-2">
              <Checkbox
                id="isButtonFeatured"
                checked={!!currentAttributeType.isButtonFeatured}
                onCheckedChange={handleCheckboxChange('isButtonFeatured')}
              />
              <Label 
                htmlFor="isButtonFeatured" 
                className="text-sm font-medium leading-none peer-disabled:cursor-not-allowed peer-disabled:opacity-70"
              >
                Show as "Shop By" Button on Category Page
              </Label>
            </div>
            
            <div className="flex items-center space-x-2">
              <Checkbox
                id="isFeaturedSection"
                checked={!!currentAttributeType.isFeaturedSection}
                onCheckedChange={handleCheckboxChange('isFeaturedSection')}
              />
              <Label 
                htmlFor="isFeaturedSection" 
                className="text-sm font-medium leading-none peer-disabled:cursor-not-allowed peer-disabled:opacity-70"
              >
                Show in Featured Section with Value Images
              </Label>
            </div>
            
            {currentAttributeType.isButtonFeatured && (
              <div className="text-sm text-muted-foreground bg-blue-50 p-3 rounded-md">
                <Store className="h-4 w-4 inline mr-2 text-blue-600" />
                This attribute will appear as a "Shop by {currentAttributeType.name || 'Attribute'}" button on the category page.
              </div>
            )}
            
            {currentAttributeType.isFeaturedSection && (
              <div className="text-sm text-muted-foreground bg-purple-50 p-3 rounded-md">
                <Tag className="h-4 w-4 inline mr-2 text-purple-600" />
                This attribute values will appear as a featured image slider section (e.g., Authors with their photos).
              </div>
            )}
          </div>
          <DialogFooter>
            <DialogClose asChild><Button type="button" variant="outline" disabled={formSubmitting}>Cancel</Button></DialogClose>
            <Button onClick={handleSaveAttributeType} disabled={formSubmitting || !currentAttributeType.name?.trim() || !selectedCategoryId}>
              {formSubmitting && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
              {isEditing ? "Save Changes" : "Add Type"}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}
