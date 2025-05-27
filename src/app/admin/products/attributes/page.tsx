
"use client";
import { useState, useEffect } from 'react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle, DialogTrigger, DialogClose, DialogFooter } from '@/components/ui/dialog';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { useToast } from '@/hooks/use-toast';
import useLocalStorage from '@/hooks/use-local-storage';
import { MOCK_CATEGORIES, MOCK_CATEGORY_ATTRIBUTE_TYPES as DEFAULT_ATTRIBUTE_TYPES } from '@/lib/mock-data';
import type { Category, CategoryAttributeType } from '@/lib/types';
import { CATEGORY_ATTRIBUTES_TYPES_STORAGE_KEY } from '@/lib/constants';
import { Loader2, PlusCircle, Trash2, ListFilter, Tag } from 'lucide-react';

export default function AdminManageAttributesPage() {
  const { toast } = useToast();
  const [parentCategories, setParentCategories] = useState<Category[]>([]);
  const [selectedCategoryId, setSelectedCategoryId] = useState<string | null>(null);
  
  const [attributeTypes, setAttributeTypes] = useLocalStorage<CategoryAttributeType[]>(
    CATEGORY_ATTRIBUTES_TYPES_STORAGE_KEY,
    DEFAULT_ATTRIBUTE_TYPES // Use initial mock data as default for localStorage
  );

  const [filteredAttributeTypes, setFilteredAttributeTypes] = useState<CategoryAttributeType[]>([]);
  const [isAddDialogOpen, setIsAddDialogOpen] = useState(false);
  const [newAttributeTypeName, setNewAttributeTypeName] = useState('');
  const [formSubmitting, setFormSubmitting] = useState(false);

  useEffect(() => {
    setParentCategories([...MOCK_CATEGORIES]); // Parent categories are static for now
  }, []);

  useEffect(() => {
    if (selectedCategoryId) {
      setFilteredAttributeTypes(attributeTypes.filter(attr => attr.categoryId === selectedCategoryId));
    } else {
      setFilteredAttributeTypes([]);
    }
  }, [selectedCategoryId, attributeTypes]);

  const handleAddAttributeType = async () => {
    if (!newAttributeTypeName.trim()) {
      toast({ title: "Error", description: "Attribute type name cannot be empty.", variant: "destructive" });
      return;
    }
    if (!selectedCategoryId) {
      toast({ title: "Error", description: "Please select a parent category first.", variant: "destructive" });
      return;
    }
    setFormSubmitting(true);
    await new Promise(resolve => setTimeout(resolve, 500)); // Simulate API call

    const newAttrType: CategoryAttributeType = {
      id: `attr_type-${Date.now()}-${Math.random().toString(36).substring(2, 7)}`,
      categoryId: selectedCategoryId,
      name: newAttributeTypeName.trim(),
    };

    setAttributeTypes(prev => [...prev, newAttrType]);
    toast({ title: "Attribute Type Added", description: `"${newAttrType.name}" added to the category.` });
    setNewAttributeTypeName('');
    setIsAddDialogOpen(false);
    setFormSubmitting(false);
  };

  const handleDeleteAttributeType = (attrTypeId: string) => {
    if (window.confirm("Are you sure you want to delete this attribute type? This may affect products using it and its values.")) {
      setAttributeTypes(prev => prev.filter(attr => attr.id !== attrTypeId));
      // Note: In a real app, you'd also need to handle associated CategoryAttributeValues
      // and how this impacts products that might be using this attribute type.
      toast({ title: "Attribute Type Deleted", description: "The attribute type has been deleted." });
    }
  };
  
  const selectedParentCategoryName = parentCategories.find(c => c.id === selectedCategoryId)?.name || "";

  return (
    <div className="space-y-8 py-4">
      <div className="flex items-center justify-between">
        <h1 className="text-3xl font-bold flex items-center gap-3">
          <ListFilter className="h-8 w-8 text-primary"/>
          Manage Attribute Types {selectedParentCategoryName && `for ${selectedParentCategoryName}`}
        </h1>
        <Dialog open={isAddDialogOpen} onOpenChange={setIsAddDialogOpen}>
          <DialogTrigger asChild>
            <Button disabled={!selectedCategoryId}>
              <PlusCircle className="mr-2 h-4 w-4" /> Add New Attribute Type
            </Button>
          </DialogTrigger>
          <DialogContent className="sm:max-w-md">
            <DialogHeader>
              <DialogTitle>Add Attribute Type to {selectedParentCategoryName || 'Category'}</DialogTitle>
              <DialogDescription>Define a new characteristic for products in this category (e.g., Author, Color, Material).</DialogDescription>
            </DialogHeader>
            <div className="grid gap-4 py-4">
              <div className="space-y-2">
                <Label htmlFor="attribute-type-name">Attribute Type Name*</Label>
                <Input
                  id="attribute-type-name"
                  value={newAttributeTypeName}
                  onChange={(e) => setNewAttributeTypeName(e.target.value)}
                  placeholder="e.g., Author, Screen Size"
                />
              </div>
            </div>
            <DialogFooter>
              <DialogClose asChild><Button type="button" variant="outline" disabled={formSubmitting}>Cancel</Button></DialogClose>
              <Button onClick={handleAddAttributeType} disabled={formSubmitting || !newAttributeTypeName.trim() || !selectedCategoryId}>
                {formSubmitting && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
                Add Type
              </Button>
            </DialogFooter>
          </DialogContent>
        </Dialog>
      </div>

      <Card>
        <CardHeader>
          <CardTitle>Select Parent Category</CardTitle>
          <Select onValueChange={(value) => setSelectedCategoryId(value === 'none' ? null : value)} value={selectedCategoryId || 'none'}>
            <SelectTrigger className="w-full md:w-[300px]">
              <SelectValue placeholder="Select a category to manage its attributes" />
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
            <CardDescription className="mb-4">These are the characteristics products in this category can have (e.g., Author for Books, Color for Fashion). You'll manage their specific values (e.g., "Mr. Rahim", "Red") in a separate section (coming soon).</CardDescription>
            {filteredAttributeTypes.length > 0 ? (
              <div className="space-y-3">
                {filteredAttributeTypes.map(attrType => (
                  <div key={attrType.id} className="flex items-center justify-between p-3 border rounded-md hover:shadow-sm">
                    <div className="flex items-center gap-3">
                      <Tag className="h-5 w-5 text-muted-foreground" />
                      <div>
                        <h3 className="font-semibold">{attrType.name}</h3>
                        <p className="text-xs text-muted-foreground">ID: {attrType.id}</p>
                      </div>
                    </div>
                    <Button variant="destructive" size="sm" onClick={() => handleDeleteAttributeType(attrType.id)}>
                      <Trash2 className="mr-2 h-4 w-4" /> Delete
                    </Button>
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
    </div>
  );
}

    