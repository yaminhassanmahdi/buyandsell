
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
import type { Division, District, Thana } from '@/lib/types';
import { 
  DEFAULT_DIVISIONS, DIVISIONS_STORAGE_KEY, 
  DEFAULT_DISTRICTS, DISTRICTS_STORAGE_KEY,
  DEFAULT_THANAS, THANAS_STORAGE_KEY
} from '@/lib/constants';
import { Loader2, PlusCircle, Trash2, Edit3, Home as HomeIcon } from 'lucide-react';
import { ScrollArea } from '@/components/ui/scroll-area';

const generateId = () => `thana-${Date.now()}-${Math.random().toString(36).substring(2, 7)}`;

export default function AdminThanasPage() {
  const { toast } = useToast();
  const [divisions] = useLocalStorage<Division[]>(DIVISIONS_STORAGE_KEY, DEFAULT_DIVISIONS);
  const [districts] = useLocalStorage<District[]>(DISTRICTS_STORAGE_KEY, DEFAULT_DISTRICTS);
  const [thanas, setThanas] = useLocalStorage<Thana[]>(THANAS_STORAGE_KEY, DEFAULT_THANAS);

  const [selectedDivisionId, setSelectedDivisionId] = useState<string | null>(null);
  const [availableDistricts, setAvailableDistricts] = useState<District[]>([]);
  const [selectedDistrictId, setSelectedDistrictId] = useState<string | null>(null);
  const [filteredThanas, setFilteredThanas] = useState<Thana[]>([]);

  const [isDialogOpen, setIsDialogOpen] = useState(false);
  const [currentThana, setCurrentThana] = useState<Partial<Thana> | null>(null);
  const [isEditing, setIsEditing] = useState(false);
  const [formSubmitting, setFormSubmitting] = useState(false);

  useEffect(() => {
    if (selectedDivisionId) {
      setAvailableDistricts(districts.filter(d => d.divisionId === selectedDivisionId));
      setSelectedDistrictId(null); // Reset district when division changes
      setFilteredThanas([]);
    } else {
      setAvailableDistricts([]);
      setSelectedDistrictId(null);
      setFilteredThanas([]);
    }
  }, [selectedDivisionId, districts]);

  useEffect(() => {
    if (selectedDistrictId) {
      setFilteredThanas(thanas.filter(t => t.districtId === selectedDistrictId));
    } else {
      setFilteredThanas([]);
    }
  }, [selectedDistrictId, thanas]);

  const openDialog = (thana?: Thana) => {
    if (thana) {
      setCurrentThana({ ...thana });
      setIsEditing(true);
    } else {
      setCurrentThana({ id: '', name: '', districtId: selectedDistrictId || '' });
      setIsEditing(false);
    }
    setIsDialogOpen(true);
  };

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (!currentThana) return;
    const { name, value } = e.target;
    setCurrentThana(prev => ({ ...prev, [name]: value }));
  };

  const handleSubmit = async () => {
    if (!currentThana || !currentThana.name?.trim() || !currentThana.districtId) {
      toast({ title: "Error", description: "Thana/Upazilla name and parent district are required.", variant: "destructive" });
      return;
    }
    setFormSubmitting(true);
    await new Promise(resolve => setTimeout(resolve, 500));

    if (isEditing && currentThana.id) {
      setThanas(thanas.map(t => t.id === currentThana.id ? (currentThana as Thana) : t));
      toast({ title: "Thana/Upazilla Updated", description: "The Thana/Upazilla has been updated." });
    } else {
      const newThana: Thana = {
        id: generateId(),
        name: currentThana.name.trim(),
        districtId: currentThana.districtId,
      };
      setThanas([...thanas, newThana]);
      toast({ title: "Thana/Upazilla Added", description: `"${newThana.name}" has been added.` });
    }
    setFormSubmitting(false);
    setIsDialogOpen(false);
    setCurrentThana(null);
  };

  const handleDelete = (thanaId: string) => {
    if (window.confirm("Are you sure you want to delete this Thana/Upazilla?")) {
      setThanas(thanas.filter(t => t.id !== thanaId));
      toast({ title: "Thana/Upazilla Deleted", description: "The Thana/Upazilla has been deleted." });
    }
  };
  
  const getDivisionName = (divisionId: string | null) => {
    if (!divisionId) return '';
    return divisions.find(d => d.id === divisionId)?.name || 'Unknown Division';
  };
  const getDistrictName = (districtId: string | undefined) => {
    if (!districtId) return 'N/A';
    return districts.find(d => d.id === districtId)?.name || 'Unknown District';
  };

  return (
    <div className="space-y-8 py-4">
      <div className="flex items-center justify-between">
        <h1 className="text-3xl font-bold flex items-center gap-3">
          <HomeIcon className="h-8 w-8 text-primary"/>
          Manage Thanas/Upazillas
        </h1>
        <Button onClick={() => openDialog()} disabled={!selectedDistrictId}>
          <PlusCircle className="mr-2 h-4 w-4" /> Add New Thana/Upazilla
        </Button>
      </div>
      
      <Card>
        <CardHeader className="space-y-3">
          <CardTitle>Select Division and District</CardTitle>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div className="space-y-1">
              <Label htmlFor="division-select">Division</Label>
              <Select onValueChange={(value) => setSelectedDivisionId(value === 'none' ? null : value)} value={selectedDivisionId || 'none'}>
                <SelectTrigger id="division-select">
                  <SelectValue placeholder="Select a division" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="none">-- Select Division --</SelectItem>
                  {divisions.map(division => (
                    <SelectItem key={division.id} value={division.id}>{division.name}</SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
            <div className="space-y-1">
              <Label htmlFor="district-select">District</Label>
              <Select 
                onValueChange={(value) => setSelectedDistrictId(value === 'none' ? null : value)} 
                value={selectedDistrictId || 'none'}
                disabled={!selectedDivisionId || availableDistricts.length === 0}
              >
                <SelectTrigger id="district-select">
                  <SelectValue placeholder={!selectedDivisionId ? "Select division first" : "Select a district"} />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="none">-- Select District --</SelectItem>
                  {availableDistricts.map(district => (
                    <SelectItem key={district.id} value={district.id}>{district.name}</SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
          </div>
          <CardDescription className="mt-2">
            Manage administrative Thanas/Upazillas within the selected district.
          </CardDescription>
        </CardHeader>
        <CardContent>
          {!selectedDistrictId ? (
             <p className="text-muted-foreground">Please select a division and district to view Thanas/Upazillas.</p>
          ) : filteredThanas.length === 0 ? (
            <p className="text-muted-foreground">No Thanas/Upazillas configured for {getDistrictName(selectedDistrictId)} yet.</p>
          ) : (
            <ScrollArea className="h-[400px] rounded-md border">
              <ul className="p-4 space-y-2">
                {filteredThanas.map(thana => (
                  <li key={thana.id} className="flex items-center justify-between p-3 border rounded-md hover:bg-muted/50">
                     <div>
                      <span className="font-medium">{thana.name}</span>
                      <p className="text-xs text-muted-foreground">ID: {thana.id} | District: {getDistrictName(thana.districtId)}</p>
                    </div>
                    <div className="flex gap-2">
                      <Button variant="outline" size="sm" onClick={() => openDialog(thana)}>
                        <Edit3 className="h-4 w-4" />
                      </Button>
                      <Button variant="destructive" size="sm" onClick={() => handleDelete(thana.id)}>
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

      {currentThana && (
        <Dialog open={isDialogOpen} onOpenChange={setIsDialogOpen}>
          <DialogContent className="sm:max-w-md">
            <DialogHeader>
              <DialogTitle>{isEditing ? "Edit" : "Add New"} Thana/Upazilla</DialogTitle>
              <DialogDescription>For District: {getDistrictName(currentThana.districtId)} ({getDivisionName(selectedDivisionId)})</DialogDescription>
            </DialogHeader>
            <div className="grid gap-4 py-4">
              <div className="space-y-2">
                <Label htmlFor="name">Thana/Upazilla Name*</Label>
                <Input id="name" name="name" value={currentThana.name || ''} onChange={handleInputChange} />
              </div>
            </div>
            <DialogFooter>
              <DialogClose asChild><Button type="button" variant="outline" disabled={formSubmitting}>Cancel</Button></DialogClose>
              <Button onClick={handleSubmit} disabled={formSubmitting || !currentThana.name?.trim() || !currentThana.districtId}>
                {formSubmitting && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
                {isEditing ? "Save Changes" : "Add Thana/Upazilla"}
              </Button>
            </DialogFooter>
          </DialogContent>
        </Dialog>
      )}
    </div>
  );
}
