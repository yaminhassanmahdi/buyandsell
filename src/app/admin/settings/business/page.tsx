"use client";
import { zodResolver } from "@hookform/resolvers/zod";
import { useForm, useFieldArray } from "react-hook-form";
import * as z from "zod";
import { Button } from "@/components/ui/button";
import {
  Form,
  FormControl,
  FormDescription,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from "@/components/ui/form";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label"; 
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger, DialogClose, DialogFooter } from "@/components/ui/dialog";
import { Briefcase, Palette, Image as ImageIcon, Loader2, Save, PlusCircle, Trash2, Landmark } from "lucide-react";
import ImageUpload from "@/components/admin/image-upload";
import { useToast } from "@/hooks/use-toast";
import { apiClient } from "@/lib/api-client";
import type { BusinessSettings, Currency } from "@/lib/types";
import { DEFAULT_BUSINESS_SETTINGS, DEFAULT_CURRENCIES } from "@/lib/constants";
import { useEffect, useState } from "react";

const currencySchema = z.object({
  code: z.string().min(3, "Code must be 3 characters").max(3, "Code must be 3 characters").toUpperCase(),
  symbol: z.string().min(1, "Symbol is required.").max(5),
  name: z.string().min(3, "Name is required."),
});

const businessSettingsSchema = z.object({
  appName: z.string().min(2, "App name is required."),
  logoUrl: z.string().optional(),
  logoUrlHorizontal: z.string().optional(),
  logoUrlVertical: z.string().optional(),
  primaryColor: z.string().regex(/^(\d{1,3}\s\d{1,3}%\s\d{1,3}%|#[0-9a-fA-F]{6})$/, "Enter a valid HSL (e.g., 217 91% 60%) or HEX color (e.g., #3B82F6).").optional(),
  secondaryColor: z.string().regex(/^(\d{1,3}\s\d{1,3}%\s\d{1,3}%|#[0-9a-fA-F]{6})$/, "Enter a valid HSL (e.g., 216 34% 90%) or HEX color (e.g., #E0E7FF).").optional(),
  faviconUrl: z.string().optional(),
  availableCurrencies: z.array(currencySchema).min(1, "At least one currency is required."),
  defaultCurrencyCode: z.string().min(1, "Default currency is required."),
});

type BusinessSettingsFormData = z.infer<typeof businessSettingsSchema>;

export default function AdminBusinessSettingsPage() {
  const { toast } = useToast();
  const [settings, setSettings] = useState<BusinessSettings>(DEFAULT_BUSINESS_SETTINGS);
  const [isLoading, setIsLoading] = useState(true);
  const [isSaving, setIsSaving] = useState(false);
  
  const form = useForm<BusinessSettingsFormData>({
    resolver: zodResolver(businessSettingsSchema),
    defaultValues: DEFAULT_BUSINESS_SETTINGS,
  });

  const { fields: currencyFields, append: appendCurrency, remove: removeCurrency } = useFieldArray({
    control: form.control,
    name: "availableCurrencies",
  });

  const [isCurrencyDialogOpen, setIsCurrencyDialogOpen] = useState(false);
  const [newCurrency, setNewCurrency] = useState<Currency>({ code: '', symbol: '', name: '' });

  // Load settings from API
  useEffect(() => {
    const loadSettings = async () => {
      try {
        setIsLoading(true);
        const apiSettings = await apiClient.getSettings('business');
        const mergedSettings = {
          ...DEFAULT_BUSINESS_SETTINGS,
          ...apiSettings,
          availableCurrencies: apiSettings?.availableCurrencies && Array.isArray(apiSettings.availableCurrencies) 
                               ? apiSettings.availableCurrencies 
                               : DEFAULT_BUSINESS_SETTINGS.availableCurrencies,
        };
        setSettings(mergedSettings);
        form.reset(mergedSettings);
        if (mergedSettings.appName) {
          document.title = `${mergedSettings.appName} - Admin Business Settings`;
        }
      } catch (error) {
        console.error('Error loading settings:', error);
        // Use defaults if API fails
        setSettings(DEFAULT_BUSINESS_SETTINGS);
        form.reset(DEFAULT_BUSINESS_SETTINGS);
      } finally {
        setIsLoading(false);
      }
    };

    loadSettings();
  }, [form]);

  const onSubmit = async (data: BusinessSettingsFormData) => {
    // Ensure defaultCurrencyCode is valid among availableCurrencies
    if (!data.availableCurrencies.some(c => c.code === data.defaultCurrencyCode)) {
      toast({ title: "Error", description: "Default currency must be one of the available currencies.", variant: "destructive" });
      return;
    }

    try {
      setIsSaving(true);
      await apiClient.updateSettings(data, 'business');
      setSettings(data);

      if (data.primaryColor && data.primaryColor.includes(' ')) { 
        document.documentElement.style.setProperty('--primary', data.primaryColor);
      }
      if (data.secondaryColor && data.secondaryColor.includes(' ')) {
        document.documentElement.style.setProperty('--secondary', data.secondaryColor);
      }

      toast({
        title: "Settings Updated",
        description: "Business settings have been successfully saved to the database.",
      });
    } catch (error) {
      console.error('Error saving settings:', error);
      toast({
        title: "Error",
        description: "Failed to save settings. Please try again.",
        variant: "destructive"
      });
    } finally {
      setIsSaving(false);
    }
  };

  const handleAddNewCurrency = () => {
    if (!newCurrency.code || !newCurrency.symbol || !newCurrency.name) {
      toast({ title: "Error", description: "All currency fields are required.", variant: "destructive" });
      return;
    }
    // Ensure currencyFields is an array before checking .some()
    const currentFormCurrencies = form.getValues("availableCurrencies") || [];
    if (currentFormCurrencies.some(c => c.code === newCurrency.code.toUpperCase())) {
      toast({ title: "Error", description: "Currency code already exists.", variant: "destructive" });
      return;
    }
    appendCurrency({ ...newCurrency, code: newCurrency.code.toUpperCase() });
    setNewCurrency({ code: '', symbol: '', name: '' });
    setIsCurrencyDialogOpen(false);
  };

  const watchedCurrencies = form.watch("availableCurrencies") || [];

  if (isLoading) {
    return (
      <div className="space-y-8 py-4">
        <h1 className="text-3xl font-bold flex items-center gap-3">
          <Briefcase className="h-8 w-8 text-primary"/>
          Business Settings
        </h1>
        <div className="flex items-center justify-center py-8">
          <Loader2 className="h-8 w-8 animate-spin" />
          <span className="ml-2">Loading settings...</span>
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-8 py-4">
      <h1 className="text-3xl font-bold flex items-center gap-3">
        <Briefcase className="h-8 w-8 text-primary"/>
        Business Settings
      </h1>
      <Card>
        <CardHeader>
          <CardTitle>Branding & Appearance</CardTitle>
          <CardDescription>
            Update your application's name, logo, colors, and favicon.
          </CardDescription>
        </CardHeader>
        <CardContent>
          <Form {...form}>
            <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-6 max-w-lg">
              <FormField
                control={form.control}
                name="appName"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Application Name</FormLabel>
                    <FormControl><Input placeholder="e.g., My Awesome Shop" {...field} /></FormControl>
                    <FormDescription>This name will appear in the site title and logo area.</FormDescription>
                    <FormMessage />
                  </FormItem>
                )}
              />
              <FormField
                control={form.control}
                name="logoUrl"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Site Logo</FormLabel>
                    <FormControl>
                      <ImageUpload
                        value={field.value ? [field.value] : []}
                        onChange={(urls) => field.onChange(urls[0] || '')}
                        maxFiles={1}
                        maxSize={2}
                      />
                    </FormControl>
                    <FormDescription>Upload your site logo (recommended: 200x50px or similar aspect ratio).</FormDescription>
                    <FormMessage />
                  </FormItem>
                )}
              />
              <FormField
                control={form.control}
                name="logoUrlHorizontal"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Horizontal Logo (for headers, desktop)</FormLabel>
                    <FormControl>
                      <ImageUpload
                        value={field.value ? [field.value] : []}
                        onChange={(urls) => field.onChange(urls[0] || "")}
                        maxFiles={1}
                        maxSize={2}
                      />
                    </FormControl>
                    <FormDescription>Upload horizontal logo for desktop headers (recommended: 200x50px).</FormDescription>
                    <FormMessage />
                  </FormItem>
                )}
              />
              <FormField
                control={form.control}
                name="logoUrlVertical"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Vertical Logo (for mobile, sidebar)</FormLabel>
                    <FormControl>
                      <ImageUpload
                        value={field.value ? [field.value] : []}
                        onChange={(urls) => field.onChange(urls[0] || "")}
                        maxFiles={1}
                        maxSize={2}
                      />
                    </FormControl>
                    <FormDescription>Upload vertical logo for mobile and sidebars (recommended: 50x200px).</FormDescription>
                    <FormMessage />
                  </FormItem>
                )}
              />
              <FormField
                control={form.control}
                name="primaryColor"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Primary Color (HSL or HEX)</FormLabel>
                    <FormControl><Input placeholder="e.g., 217 91% 60% or #3B82F6" {...field} /></FormControl>
                    <FormDescription>Used for main buttons, links, and accents. </FormDescription>
                    <FormMessage />
                  </FormItem>
                )}
              />
              <FormField
                control={form.control}
                name="secondaryColor"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Secondary Color (HSL or HEX)</FormLabel>
                    <FormControl><Input placeholder="e.g., 216 34% 90% or #E0E7FF" {...field} /></FormControl>
                     <FormDescription>Used for secondary elements and backgrounds.</FormDescription>
                    <FormMessage />
                  </FormItem>
                )}
              />
              <FormField
                control={form.control}
                name="faviconUrl"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Site Favicon</FormLabel>
                    <FormControl>
                      <ImageUpload
                        value={field.value ? [field.value] : []}
                        onChange={(urls) => field.onChange(urls[0] || '')}
                        maxFiles={1}
                        maxSize={1}
                        accept="image/x-icon,image/png,image/jpeg,image/gif"
                      />
                    </FormControl>
                    <FormDescription>Upload your site favicon (recommended: 32x32px ICO or PNG file).</FormDescription>
                    <FormMessage />
                  </FormItem>
                )}
              />

              <Card className="pt-4">
                <CardHeader className="pt-0">
                  <CardTitle className="text-xl flex items-center justify-between">
                    <span>Manage Currencies</span>
                    <Dialog open={isCurrencyDialogOpen} onOpenChange={setIsCurrencyDialogOpen}>
                      <DialogTrigger asChild>
                        <Button type="button" size="sm" variant="outline"><PlusCircle className="mr-2 h-4 w-4" /> Add Currency</Button>
                      </DialogTrigger>
                      <DialogContent>
                        <DialogHeader>
                          <DialogTitle>Add New Currency</DialogTitle>
                        </DialogHeader>
                        <div className="space-y-4 py-4">
                          <div><Label htmlFor="new-code">Code (3 letters, e.g., USD)</Label><Input id="new-code" value={newCurrency.code} onChange={(e) => setNewCurrency(p => ({...p, code: e.target.value.toUpperCase()}))} maxLength={3} /></div>
                          <div><Label htmlFor="new-symbol">Symbol (e.g., $)</Label><Input id="new-symbol" value={newCurrency.symbol} onChange={(e) => setNewCurrency(p => ({...p, symbol: e.target.value}))} /></div>
                          <div><Label htmlFor="new-name">Name (e.g., US Dollar)</Label><Input id="new-name" value={newCurrency.name} onChange={(e) => setNewCurrency(p => ({...p, name: e.target.value}))} /></div>
                        </div>
                        <DialogFooter>
                          <DialogClose asChild><Button type="button" variant="outline">Cancel</Button></DialogClose>
                          <Button type="button" onClick={handleAddNewCurrency}>Add Currency</Button>
                        </DialogFooter>
                      </DialogContent>
                    </Dialog>
                  </CardTitle>
                  <CardDescription>Add or remove currencies available on your platform.</CardDescription>
                </CardHeader>
                <CardContent className="space-y-3">
                  {currencyFields.map((field, index) => (
                    <div key={field.id} className="flex items-center gap-2 p-2 border rounded-md">
                      <FormField control={form.control} name={`availableCurrencies.${index}.code`} render={({ field: f }) => <Input {...f} className="w-20" placeholder="Code" readOnly />}/>
                      <FormField control={form.control} name={`availableCurrencies.${index}.symbol`} render={({ field: f }) => <Input {...f} className="w-16" placeholder="Symbol" readOnly />}/>
                      <FormField control={form.control} name={`availableCurrencies.${index}.name`} render={({ field: f }) => <Input {...f} className="flex-1" placeholder="Name" readOnly />}/>
                      <Button type="button" variant="ghost" size="icon" onClick={() => removeCurrency(index)} disabled={field.code === form.getValues("defaultCurrencyCode")} className="text-destructive hover:text-destructive">
                        <Trash2 className="h-4 w-4" />
                      </Button>
                    </div>
                  ))}
                  {currencyFields.length === 0 && <p className="text-sm text-muted-foreground">No currencies added. Add at least one.</p>}
                </CardContent>
              </Card>
              
              <FormField
                control={form.control}
                name="defaultCurrencyCode"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Default Currency</FormLabel>
                    <Select onValueChange={field.onChange} value={field.value} disabled={watchedCurrencies.length === 0}>
                      <FormControl>
                        <SelectTrigger>
                          <SelectValue placeholder="Select default currency" />
                        </SelectTrigger>
                      </FormControl>
                      <SelectContent>
                        {watchedCurrencies.map(currency => (
                          <SelectItem key={currency.code} value={currency.code}>
                            {currency.name} ({currency.symbol})
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                    <FormDescription>This currency will be used for all pricing by default.</FormDescription>
                    <FormMessage />
                  </FormItem>
                )}
              />

              <Button type="submit" disabled={isSaving}>
                {isSaving ? <Loader2 className="mr-2 h-4 w-4 animate-spin" /> : <Save className="mr-2 h-4 w-4" />}
                Save Settings
              </Button>
            </form>
          </Form>
        </CardContent>
      </Card>
    </div>
  );
}
