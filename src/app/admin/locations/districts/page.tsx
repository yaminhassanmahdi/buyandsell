
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
import type { Division, District } from '@/lib/types';
import { DEFAULT_DIVISIONS, DIVISIONS_STORAGE_KEY, DEFAULT_DISTRICTS, DISTRICTS_STORAGE_KEY } from '@/lib/constants';
import { Loader2, PlusCircle, Trash2, Edit3, MapPin } from 'lucide-react';
import { ScrollArea } from '@/components/ui/scroll-area';

const generateId = () => `dist-${Date.now()}-${Math.random().toString(36).substring(2, 7)}`;

export default function AdminDistrictsPage() {
  const { toast } = useToast();
  const [divisions] = useLocalStorage<Division[]>(DIVISIONS_STORAGE_KEY, DEFAULT_DIVISIONS);
  const [districts, setDistricts] = useLocalStorage<District[]>(DISTRICTS_STORAGE_KEY, DEFAULT_DISTRICTS);

  const [selectedDivisionId, setSelectedDivisionId] = useState<string | null>(null);
  const [filteredDistricts, setFilteredDistricts] = useState<District[]>([]);

  const [isDialogOpen, setIsDialogOpen] = useState(false);
  const [currentDistrict, setCurrentDistrict] = useState<Partial<District> | null>(null);
  const [isEditing, setIsEditing] = useState(false);
  const [formSubmitting, setFormSubmitting] = useState(false);

  useEffect(() => {
    if (selectedDivisionId) {
      setFilteredDistricts(districts.filter(d => d.divisionId === selectedDivisionId));
    } else {
      setFilteredDistricts([]);
    }
  }, [selectedDivisionId, districts]);

  const openDialog = (district?: District) => {
    if (district) {
      setCurrentDistrict({ ...district });
      setIsEditing(true);
    } else {
      setCurrentDistrict({ id: '', name: '', divisionId: selectedDivisionId || '' });
      setIsEditing(false);
    }
    setIsDialogOpen(true);
  };

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (!currentDistrict) return;
    const { name, value } = e.target;
    setCurrentDistrict(prev => ({ ...prev, [name]: value }));
  };

  const handleSubmit = async () => {
    if (!currentDistrict || !currentDistrict.name?.trim() || !currentDistrict.divisionId) {
      toast({ title: "Error", description: "District name and parent division are required.", variant: "destructive" });
      return;
    }
    setFormSubmitting(true);
    await new Promise(resolve => setTimeout(resolve, 500));

    if (isEditing && currentDistrict.id) {
      setDistricts(prevDistricts => prevDistricts.map(d => d.id === currentDistrict.id ? (currentDistrict as District) : d));
      toast({ title: "District Updated", description: "The district has been updated." });
    } else {
      const newDistrict: District = {
        id: generateId(),
        name: currentDistrict.name.trim(),
        divisionId: currentDistrict.divisionId,
      };
      setDistricts(prevDistricts => [...prevDistricts, newDistrict]);
      toast({ title: "District Added", description: `District "${newDistrict.name}" has been added.` });
    }
    setFormSubmitting(false);
    setIsDialogOpen(false);
    setCurrentDistrict(null);
  };

  const handleDelete = (districtId: string) => {
    if (window.confirm("Are you sure you want to delete this district? This might affect thanas that depend on it.")) {
      console.log("Attempting to delete district with ID:", districtId);
      setDistricts(prevDistricts => {
        const updatedDistricts = prevDistricts.filter(d => d.id !== districtId);
         if (prevDistricts.length === updatedDistricts.length) {
            console.warn(`District with ID ${districtId} not found for deletion. No changes made.`);
        } else {
            console.log(`District deleted. Old count: ${prevDistricts.length}, New count: ${updatedDistricts.length}.`);
        }
        return updatedDistricts;
      });
      toast({ title: "District Deleted", description: "The district has been deleted." });
    }
  };

  const getDivisionName = (divisionId: string | undefined) => {
    if (!divisionId) return 'N/A';
    return divisions.find(d => d.id === divisionId)?.name || 'Unknown Division';
  };

  return (
    <div className="space-y-8 py-4">
      <div className="flex items-center justify-between">
        <h1 className="text-3xl font-bold flex items-center gap-3">
          <MapPin className="h-8 w-8 text-primary"/>
          Manage Districts
        </h1>
        <Button onClick={() => openDialog()} disabled={!selectedDivisionId}>
          <PlusCircle className="mr-2 h-4 w-4" /> Add New District
        </Button>
      </div>
      
      <Card>
        <CardHeader>
          <CardTitle>Select Division to Manage Districts</CardTitle>
           <Select onValueChange={(value) => setSelectedDivisionId(value === 'none' ? null : value)} value={selectedDivisionId || 'none'}>
            <SelectTrigger className="w-full md:w-[300px]">
              <SelectValue placeholder="Select a division" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="none">-- Select Division --</SelectItem>
              {divisions.map(division => (
                <SelectItem key={division.id} value={division.id}>{division.name}</SelectItem>
              ))}
            </SelectContent>
          </Select>
          <CardDescription className="mt-2">
            Manage administrative districts within the selected division.
          </CardDescription>
        </CardHeader>
        <CardContent>
          {!selectedDivisionId ? (
             <p className="text-muted-foreground">Please select a division to view its districts.</p>
          ) : filteredDistricts.length === 0 ? (
            <p className="text-muted-foreground">No districts configured for {getDivisionName(selectedDivisionId)} yet.</p>
          ) : (
            <ScrollArea className="h-[400px] rounded-md border">
              <ul className="p-4 space-y-2">
                {filteredDistricts.map(district => (
                  <li key={district.id} className="flex items-center justify-between p-3 border rounded-md hover:bg-muted/50">
                    <div>
                      <span className="font-medium">{district.name}</span>
                      <p className="text-xs text-muted-foreground">ID: {district.id} | Division: {getDivisionName(district.divisionId)}</p>
                    </div>
                     <div className="flex gap-2">
                      <Button variant="outline" size="sm" onClick={() => openDialog(district)}>
                        <Edit3 className="h-4 w-4" />
                      </Button>
                      <Button variant="destructive" size="sm" onClick={() => handleDelete(district.id)}>
                        <Trash2 className="h-4 w-4" />
                      </Button>
                    </div>
                  </li>
                ))}
              </ul>
            </ScrollArea>
          )}
        </CardContent>
      </Card>

      {currentDistrict && (
        <Dialog open={isDialogOpen} onOpenChange={setIsDialogOpen}>
          <DialogContent className="sm:max-w-md">
            <DialogHeader>
              <DialogTitle>{isEditing ? "Edit" : "Add New"} District</DialogTitle>
              <DialogDescription>For Division: {getDivisionName(currentDistrict.divisionId)}</DialogDescription>
            </DialogHeader>
            <div className="grid gap-4 py-4">
              <div className="space-y-2">
                <Label htmlFor="name">District Name*</Label>
                <Input id="name" name="name" value={currentDistrict.name || ''} onChange={handleInputChange} />
              </div>
            </div>
            <DialogFooter>
              <DialogClose asChild><Button type="button" variant="outline" disabled={formSubmitting}>Cancel</Button></DialogClose>
              <Button onClick={handleSubmit} disabled={formSubmitting || !currentDistrict.name?.trim() || !currentDistrict.divisionId}>
                {formSubmitting && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
                {isEditing ? "Save Changes" : "Add District"}
              </Button>
            </DialogFooter>
          </DialogContent>
        </Dialog>
      )}
    </div>
  );
}
