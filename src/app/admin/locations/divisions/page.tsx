
"use client";
import { useState, useEffect } from 'react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle, DialogTrigger, DialogClose, DialogFooter } from '@/components/ui/dialog';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { useToast } from '@/hooks/use-toast';
import useLocalStorage from '@/hooks/use-local-storage';
import type { Division } from '@/lib/types';
import { DEFAULT_DIVISIONS, DIVISIONS_STORAGE_KEY } from '@/lib/constants';
import { Loader2, PlusCircle, Trash2, Edit3, Library } from 'lucide-react';
import { ScrollArea } from '@/components/ui/scroll-area';

const generateId = () => `div-${Date.now()}-${Math.random().toString(36).substring(2, 7)}`;

export default function AdminDivisionsPage() {
  const { toast } = useToast();
  const [divisions, setDivisions] = useLocalStorage<Division[]>(
    DIVISIONS_STORAGE_KEY,
    DEFAULT_DIVISIONS
  );

  const [isDialogOpen, setIsDialogOpen] = useState(false);
  const [currentDivision, setCurrentDivision] = useState<Partial<Division> | null>(null);
  const [isEditing, setIsEditing] = useState(false);
  const [formSubmitting, setFormSubmitting] = useState(false);

  const openDialog = (division?: Division) => {
    if (division) {
      setCurrentDivision({ ...division });
      setIsEditing(true);
    } else {
      setCurrentDivision({ id: '', name: '' }); 
      setIsEditing(false);
    }
    setIsDialogOpen(true);
  };

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (!currentDivision) return;
    const { name, value } = e.target;
    setCurrentDivision(prev => ({ ...prev, [name]: value }));
  };

  const handleSubmit = async () => {
    if (!currentDivision || !currentDivision.name?.trim()) {
      toast({ title: "Error", description: "Division name cannot be empty.", variant: "destructive" });
      return;
    }
    setFormSubmitting(true);
    await new Promise(resolve => setTimeout(resolve, 500));

    if (isEditing && currentDivision.id) {
      setDivisions(prevDivisions => prevDivisions.map(d => d.id === currentDivision.id ? (currentDivision as Division) : d));
      toast({ title: "Division Updated", description: "The division has been updated." });
    } else {
      const newDivision: Division = {
        id: generateId(),
        name: currentDivision.name.trim(),
      };
      setDivisions(prevDivisions => [...prevDivisions, newDivision]);
      toast({ title: "Division Added", description: `Division "${newDivision.name}" has been added.` });
    }
    setFormSubmitting(false);
    setIsDialogOpen(false);
    setCurrentDivision(null);
  };

  const handleDelete = (divisionId: string) => {
    if (window.confirm("Are you sure you want to delete this division?")) {
      console.log("Attempting to delete division with ID:", divisionId);
      setDivisions(prevDivisions => {
        const updatedDivisions = prevDivisions.filter(d => d.id !== divisionId);
        if (prevDivisions.length === updatedDivisions.length) {
            console.warn(`Division with ID ${divisionId} not found. No changes made.`);
        } else {
            console.log(`Division deleted. Old count: ${prevDivisions.length}, New count: ${updatedDivisions.length}.`);
        }
        return updatedDivisions;
      });
      toast({ title: "Division Deleted", description: "The division has been deleted." });
    }
  };


  return (
    <div className="space-y-8 py-4">
      <div className="flex items-center justify-between">
        <h1 className="text-3xl font-bold flex items-center gap-3">
          <Library className="h-8 w-8 text-primary"/>
          Manage Divisions (Bangladesh)
        </h1>
        <Button onClick={() => openDialog()}>
          <PlusCircle className="mr-2 h-4 w-4" /> Add New Division
        </Button>
      </div>
      
      <Card>
        <CardHeader>
          <CardTitle>Administrative Divisions</CardTitle>
          <CardDescription>
            Manage administrative divisions in Bangladesh.
          </CardDescription>
        </CardHeader>
        <CardContent>
          {divisions.length === 0 ? (
            <p className="text-muted-foreground">No divisions configured yet.</p>
          ) : (
            <ScrollArea className="h-[400px] rounded-md border">
              <ul className="p-4 space-y-2">
                {divisions.map(division => (
                  <li key={division.id} className="flex items-center justify-between p-3 border rounded-md hover:bg-muted/50">
                    <div>
                      <span className="font-medium">{division.name}</span>
                      <p className="text-xs text-muted-foreground">ID: {division.id}</p>
                    </div>
                    <div className="flex gap-2">
                      <Button variant="outline" size="sm" onClick={() => openDialog(division)}>
                        <Edit3 className="h-4 w-4" />
                      </Button>
                      <Button variant="destructive" size="sm" onClick={() => handleDelete(division.id)}>
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

      {currentDivision && (
        <Dialog open={isDialogOpen} onOpenChange={setIsDialogOpen}>
          <DialogContent className="sm:max-w-md">
            <DialogHeader>
              <DialogTitle>{isEditing ? "Edit" : "Add New"} Division</DialogTitle>
            </DialogHeader>
            <div className="grid gap-4 py-4">
              <div className="space-y-2">
                <Label htmlFor="name">Division Name*</Label>
                <Input id="name" name="name" value={currentDivision.name || ''} onChange={handleInputChange} />
              </div>
            </div>
            <DialogFooter>
              <DialogClose asChild><Button type="button" variant="outline" disabled={formSubmitting}>Cancel</Button></DialogClose>
              <Button onClick={handleSubmit} disabled={formSubmitting || !currentDivision?.name?.trim()}>
                {formSubmitting && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
                {isEditing ? "Save Changes" : "Add Division"}
              </Button>
            </DialogFooter>
          </DialogContent>
        </Dialog>
      )}
    </div>
  );
}
