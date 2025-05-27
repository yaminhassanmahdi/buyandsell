
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
import { 
  MOCK_CATEGORIES, 
  MOCK_CATEGORY_ATTRIBUTE_TYPES as DEFAULT_ATTRIBUTE_TYPES,
  MOCK_CATEGORY_ATTRIBUTE_VALUES as DEFAULT_ATTRIBUTE_VALUES
} from '@/lib/mock-data';
import type { Category, CategoryAttributeType, CategoryAttributeValue } from '@/lib/types';
import { 
  CATEGORY_ATTRIBUTES_TYPES_STORAGE_KEY, 
  CATEGORY_ATTRIBUTE_VALUES_STORAGE_KEY 
} from '@/lib/constants';
import { Loader2, PlusCircle, Trash2, Tags, ListFilter } from 'lucide-react';

export default function AdminManageAttributeValuesPage() {
  const { toast } = useToast();
  
  const [parentCategories, setParentCategories] = useState<Category[]>([]);
  const [selectedParentCategoryId, setSelectedParentCategoryId] = useState<string | null>(null);
  
  const [attributeTypes, setAttributeTypes] = useLocalStorage<CategoryAttributeType[]>(
    CATEGORY_ATTRIBUTES_TYPES_STORAGE_KEY,
    DEFAULT_ATTRIBUTE_TYPES
  );
  const [availableAttributeTypes, setAvailableAttributeTypes] = useState<CategoryAttributeType[]>([]);
  const [selectedAttributeTypeId, setSelectedAttributeTypeId] = useState<string | null>(null);

  const [attributeValues, setAttributeValues] = useLocalStorage<CategoryAttributeValue[]>(
    CATEGORY_ATTRIBUTE_VALUES_STORAGE_KEY,
    DEFAULT_ATTRIBUTE_VALUES
  );
  const [filteredAttributeValues, setFilteredAttributeValues] = useState<CategoryAttributeValue[]>([]);

  const [isAddDialogOpen, setIsAddDialogOpen] = useState(false);
  const [newAttributeValue, setNewAttributeValue] = useState('');
  const [formSubmitting, setFormSubmitting] = useState(false);

  useEffect(() => {
    setParentCategories([...MOCK_CATEGORIES]);
  }, []);

  useEffect(() => {
    if (selectedParentCategoryId) {
      const filteredTypes = attributeTypes.filter(attrType => attrType.categoryId === selectedParentCategoryId);
      setAvailableAttributeTypes(filteredTypes);
      setSelectedAttributeTypeId(null); // Reset selected type when parent category changes
      setFilteredAttributeValues([]); // Clear values list
    } else {
      setAvailableAttributeTypes([]);
      setSelectedAttributeTypeId(null);
      setFilteredAttributeValues([]);
    }
  }, [selectedParentCategoryId, attributeTypes]);

  useEffect(() => {
    if (selectedAttributeTypeId) {
      setFilteredAttributeValues(attributeValues.filter(val => val.attributeTypeId === selectedAttributeTypeId));
    } else {
      setFilteredAttributeValues([]);
    }
  }, [selectedAttributeTypeId, attributeValues]);

  const handleAddAttributeValue = async () => {
    if (!newAttributeValue.trim()) {
      toast({ title: "Error", description: "Attribute value cannot be empty.", variant: "destructive" });
      return;
    }
    if (!selectedAttributeTypeId) {
      toast({ title: "Error", description: "Please select an attribute type first.", variant: "destructive" });
      return;
    }
    setFormSubmitting(true);
    await new Promise(resolve => setTimeout(resolve, 500)); 

    const newAttrValue: CategoryAttributeValue = {
      id: `attr_val-${Date.now()}-${Math.random().toString(36).substring(2, 7)}`,
      attributeTypeId: selectedAttributeTypeId,
      value: newAttributeValue.trim(),
    };

    setAttributeValues(prev => [...prev, newAttrValue]);
    toast({ title: "Attribute Value Added", description: `Value "${newAttrValue.value}" added.` });
    setNewAttributeValue('');
    setIsAddDialogOpen(false);
    setFormSubmitting(false);
  };

  const handleDeleteAttributeValue = (attrValueId: string) => {
    if (window.confirm("Are you sure you want to delete this attribute value? This may affect products using it.")) {
      setAttributeValues(prev => prev.filter(val => val.id !== attrValueId));
      toast({ title: "Attribute Value Deleted", description: "The attribute value has been deleted." });
    }
  };
  
  const selectedParentCategoryName = parentCategories.find(c => c.id === selectedParentCategoryId)?.name || "";
  const selectedAttributeTypeName = availableAttributeTypes.find(t => t.id === selectedAttributeTypeId)?.name || "";

  return (
    <div className="space-y-8 py-4">
      <div className="flex items-center justify-between">
        <h1 className="text-3xl font-bold flex items-center gap-3">
          <Tags className="h-8 w-8 text-primary"/>
          Manage Attribute Values
        </h1>
         <Dialog open={isAddDialogOpen} onOpenChange={setIsAddDialogOpen}>
          <DialogTrigger asChild>
            <Button disabled={!selectedAttributeTypeId}>
              <PlusCircle className="mr-2 h-4 w-4" /> Add New Value
            </Button>
          </DialogTrigger>
          <DialogContent className="sm:max-w-md">
            <DialogHeader>
              <DialogTitle>Add Value for {selectedAttributeTypeName || 'Attribute Type'}</DialogTitle>
              <DialogDescription>Enter a new possible value for this attribute (e.g., for "Color", add "Red").</DialogDescription>
            </DialogHeader>
            <div className="grid gap-4 py-4">
              <div className="space-y-2">
                <Label htmlFor="attribute-value-name">Value*</Label>
                <Input
                  id="attribute-value-name"
                  value={newAttributeValue}
                  onChange={(e) => setNewAttributeValue(e.target.value)}
                  placeholder="e.g., Red, Mr. Rahim"
                />
              </div>
            </div>
            <DialogFooter>
              <DialogClose asChild><Button type="button" variant="outline" disabled={formSubmitting}>Cancel</Button></DialogClose>
              <Button onClick={handleAddAttributeValue} disabled={formSubmitting || !newAttributeValue.trim() || !selectedAttributeTypeId}>
                {formSubmitting && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
                Add Value
              </Button>
            </DialogFooter>
          </DialogContent>
        </Dialog>
      </div>

      <Card>
        <CardHeader className="space-y-3">
          <CardTitle>Select Category and Attribute Type</CardTitle>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div className="space-y-1">
              <Label htmlFor="parent-category-select">Parent Category</Label>
              <Select onValueChange={(value) => setSelectedParentCategoryId(value === 'none' ? null : value)} value={selectedParentCategoryId || 'none'}>
                <SelectTrigger id="parent-category-select">
                  <SelectValue placeholder="Select a category" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="none">-- Select Parent Category --</SelectItem>
                  {parentCategories.map(category => (
                    <SelectItem key={category.id} value={category.id}>{category.name}</SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
            <div className="space-y-1">
              <Label htmlFor="attribute-type-select">Attribute Type</Label>
              <Select 
                onValueChange={(value) => setSelectedAttributeTypeId(value === 'none' ? null : value)} 
                value={selectedAttributeTypeId || 'none'}
                disabled={!selectedParentCategoryId || availableAttributeTypes.length === 0}
              >
                <SelectTrigger id="attribute-type-select">
                  <SelectValue placeholder={!selectedParentCategoryId ? "Select category first" : (availableAttributeTypes.length === 0 ? "No types for category" : "Select attribute type")} />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="none">-- Select Attribute Type --</SelectItem>
                  {availableAttributeTypes.map(attrType => (
                    <SelectItem key={attrType.id} value={attrType.id}>{attrType.name}</SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
          </div>
        </CardHeader>
        {selectedAttributeTypeId && selectedParentCategoryId && (
          <CardContent>
            <CardTitle className="text-xl mt-4 mb-2">Values for "{selectedAttributeTypeName}" (in {selectedParentCategoryName})</CardTitle>
            <CardDescription className="mb-4">These are the specific options users can pick for the selected attribute type.</CardDescription>
            {filteredAttributeValues.length > 0 ? (
              <div className="space-y-3">
                {filteredAttributeValues.map(attrVal => (
                  <div key={attrVal.id} className="flex items-center justify-between p-3 border rounded-md hover:shadow-sm">
                    <div className="flex items-center gap-3">
                      <Tags className="h-5 w-5 text-muted-foreground" />
                      <div>
                        <h3 className="font-semibold">{attrVal.value}</h3>
                        <p className="text-xs text-muted-foreground">ID: {attrVal.id}</p>
                      </div>
                    </div>
                    <Button variant="destructive" size="sm" onClick={() => handleDeleteAttributeValue(attrVal.id)}>
                      <Trash2 className="mr-2 h-4 w-4" /> Delete
                    </Button>
                  </div>
                ))}
              </div>
            ) : (
              <p className="text-muted-foreground">No values defined for "{selectedAttributeTypeName}" yet. Add one to get started.</p>
            )}
          </CardContent>
        )}
         {(!selectedParentCategoryId || !selectedAttributeTypeId) && (
            <CardContent>
                <p className="text-muted-foreground py-4">Please select a parent category and then an attribute type to manage its values.</p>
            </CardContent>
         )}
      </Card>
    </div>
  );
}
