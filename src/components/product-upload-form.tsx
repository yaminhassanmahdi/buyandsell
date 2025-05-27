
"use client";
import { zodResolver } from "@hookform/resolvers/zod";
import { useForm } from "react-hook-form";
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
import { Textarea } from "@/components/ui/textarea";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { MOCK_PRODUCTS, MOCK_CATEGORIES, MOCK_SUBCATEGORIES, MOCK_BRANDS } from "@/lib/mock-data";
import type { Product, Category, SubCategory, Brand as BrandType, BusinessSettings } from "@/lib/types";
import { useAuth } from "@/contexts/auth-context";
import { useRouter } from "next/navigation";
import { useToast } from "@/hooks/use-toast";
import { useState, useEffect } from "react";
import { Loader2, UploadCloud } from "lucide-react";
import useLocalStorage from '@/hooks/use-local-storage';
import { BUSINESS_SETTINGS_STORAGE_KEY, DEFAULT_BUSINESS_SETTINGS } from '@/lib/constants';

const productSchema = z.object({
  name: z.string().min(3, "Product name must be at least 3 characters.").max(100),
  description: z.string().min(10, "Description must be at least 10 characters.").max(1000),
  price: z.coerce.number().min(0.01, "Price must be a positive number."),
  categoryId: z.string().min(1, "Please select a parent category."),
  subCategoryId: z.string().optional(), 
  brandId: z.string().min(1, "Please select a brand."),
});

type ProductFormData = z.infer<typeof productSchema>;

const VALUE_FOR_NO_SUBCATEGORY_SELECTED = "__NONE__";

export function ProductUploadForm() {
  const { currentUser } = useAuth();
  const router = useRouter();
  const { toast } = useToast();
  const [isLoading, setIsLoading] = useState(false);

  const [parentCategories, setParentCategories] = useState<Category[]>([]);
  const [subCategories, setSubCategories] = useState<SubCategory[]>([]);
  const [availableSubCategories, setAvailableSubCategories] = useState<SubCategory[]>([]);
  const [brands, setBrands] = useState<BrandType[]>([]);
  
  const [settings] = useLocalStorage<BusinessSettings>(BUSINESS_SETTINGS_STORAGE_KEY, DEFAULT_BUSINESS_SETTINGS);
  const activeCurrency = settings.availableCurrencies.find(c => c.code === settings.defaultCurrencyCode) || settings.availableCurrencies[0] || { symbol: '?' };
  // const currencySymbol = activeCurrency.symbol; // Not directly used in form inputs, but good for consistency if needed

  const form = useForm<ProductFormData>({
    resolver: zodResolver(productSchema),
    defaultValues: {
      name: "",
      description: "",
      price: 0,
      categoryId: "",
      subCategoryId: VALUE_FOR_NO_SUBCATEGORY_SELECTED, 
      brandId: "",
    },
  });

  useEffect(() => {
    setParentCategories([...MOCK_CATEGORIES]);
    setSubCategories([...MOCK_SUBCATEGORIES]);
    setBrands([...MOCK_BRANDS]);
  }, []);

  const watchedCategoryId = form.watch("categoryId");

  useEffect(() => {
    if (watchedCategoryId) {
      const filteredSubs = subCategories.filter(sc => sc.parentCategoryId === watchedCategoryId);
      setAvailableSubCategories(filteredSubs);
      
      const currentSubCategoryId = form.getValues("subCategoryId");
      if (currentSubCategoryId && currentSubCategoryId !== VALUE_FOR_NO_SUBCATEGORY_SELECTED && !filteredSubs.some(sc => sc.id === currentSubCategoryId)) {
        form.setValue("subCategoryId", VALUE_FOR_NO_SUBCATEGORY_SELECTED); 
      }
    } else {
      setAvailableSubCategories([]);
      form.setValue("subCategoryId", VALUE_FOR_NO_SUBCATEGORY_SELECTED); 
    }
  }, [watchedCategoryId, subCategories, form]);


  async function onSubmit(values: ProductFormData) {
    if (!currentUser) {
      toast({ title: "Error", description: "You must be logged in to sell a product.", variant: "destructive" });
      return;
    }
    setIsLoading(true);

    await new Promise(resolve => setTimeout(resolve, 1000));

    const newProduct: Product = {
      id: `prod-${Date.now()}`,
      name: values.name,
      description: values.description,
      price: values.price,
      imageUrl: `https://placehold.co/600x400.png`, 
      imageHint: `${values.name.substring(0,15)} product`,
      categoryId: values.categoryId,
      subCategoryId: values.subCategoryId === VALUE_FOR_NO_SUBCATEGORY_SELECTED ? undefined : values.subCategoryId, 
      brandId: values.brandId,
      sellerId: currentUser.id,
      sellerName: currentUser.name,
      status: 'pending',
      createdAt: new Date(),
    };

    MOCK_PRODUCTS.push(newProduct);
    
    toast({
      title: "Product Submitted!",
      description: `${newProduct.name} has been submitted for approval.`,
    });
    setIsLoading(false);
    form.reset();
    setAvailableSubCategories([]); 
  }

  return (
    <Form {...form}>
      <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-8">
        <FormField
          control={form.control}
          name="name"
          render={({ field }) => (
            <FormItem>
              <FormLabel>Product Name</FormLabel>
              <FormControl>
                <Input placeholder="e.g., Vintage Leather Jacket" {...field} />
              </FormControl>
              <FormMessage />
            </FormItem>
          )}
        />
        <FormField
          control={form.control}
          name="description"
          render={({ field }) => (
            <FormItem>
              <FormLabel>Description</FormLabel>
              <FormControl>
                <Textarea placeholder="Describe your product in detail..." rows={5} {...field} />
              </FormControl>
              <FormMessage />
            </FormItem>
          )}
        />
        <FormField
          control={form.control}
          name="price"
          render={({ field }) => (
            <FormItem>
              <FormLabel>Price ({activeCurrency.code})</FormLabel>
              <FormControl>
                <Input type="number" step="0.01" placeholder="29.99" {...field} />
              </FormControl>
              <FormMessage />
            </FormItem>
          )}
        />
        
        <FormField
          control={form.control}
          name="categoryId"
          render={({ field }) => (
            <FormItem>
              <FormLabel>Parent Category</FormLabel>
              <Select onValueChange={field.onChange} value={field.value}>
                <FormControl>
                  <SelectTrigger>
                    <SelectValue placeholder="Select a parent category" />
                  </SelectTrigger>
                </FormControl>
                <SelectContent>
                  {parentCategories.map(cat => (
                    <SelectItem key={cat.id} value={cat.id}>{cat.name}</SelectItem>
                  ))}
                </SelectContent>
              </Select>
              <FormMessage />
            </FormItem>
          )}
        />

        <FormField
          control={form.control}
          name="subCategoryId"
          render={({ field }) => (
            <FormItem>
              <FormLabel>Sub-Category (Optional)</FormLabel>
              <Select 
                onValueChange={(value) => field.onChange(value)} 
                value={field.value || VALUE_FOR_NO_SUBCATEGORY_SELECTED} 
                disabled={!watchedCategoryId || availableSubCategories.length === 0}
              >
                <FormControl>
                  <SelectTrigger>
                    <SelectValue placeholder={!watchedCategoryId ? "Select parent category first" : "Select a sub-category (optional)"} />
                  </SelectTrigger>
                </FormControl>
                <SelectContent>
                  <SelectItem value={VALUE_FOR_NO_SUBCATEGORY_SELECTED}>-- No Sub-Category --</SelectItem>
                  {availableSubCategories.map(subCat => (
                    <SelectItem key={subCat.id} value={subCat.id}>{subCat.name}</SelectItem>
                  ))}
                </SelectContent>
              </Select>
              <FormMessage />
            </FormItem>
          )}
        />
        
        <FormField
          control={form.control}
          name="brandId"
          render={({ field }) => (
            <FormItem>
              <FormLabel>Brand</FormLabel>
              <Select onValueChange={field.onChange} value={field.value}>
                <FormControl>
                  <SelectTrigger>
                    <SelectValue placeholder="Select a brand" />
                  </SelectTrigger>
                </FormControl>
                <SelectContent>
                  {brands.map(brand => (
                    <SelectItem key={brand.id} value={brand.id}>{brand.name}</SelectItem>
                  ))}
                </SelectContent>
              </Select>
              <FormMessage />
            </FormItem>
          )}
        />
        
        <FormItem>
            <FormLabel>Product Image</FormLabel>
            <div className="flex items-center justify-center w-full">
                <label htmlFor="dropzone-file" className="flex flex-col items-center justify-center w-full h-40 border-2 border-dashed rounded-lg cursor-pointer bg-muted hover:bg-muted/80">
                    <div className="flex flex-col items-center justify-center pt-5 pb-6">
                        <UploadCloud className="w-10 h-10 mb-3 text-muted-foreground" />
                        <p className="mb-2 text-sm text-muted-foreground"><span className="font-semibold">Click to upload</span> or drag and drop</p>
                        <p className="text-xs text-muted-foreground">SVG, PNG, JPG or GIF (MAX. 800x400px)</p>
                        <p className="text-xs text-blue-500 mt-1">(Image upload is mocked for this demo)</p>
                    </div>
                    <Input id="dropzone-file" type="file" className="hidden" disabled />
                </label>
            </div> 
            <FormDescription>
                Upload an image of your product. For this demo, a placeholder will be used.
            </FormDescription>
        </FormItem>

        <Button type="submit" className="w-full" size="lg" disabled={isLoading}>
          {isLoading && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
          Submit Product for Approval
        </Button>
      </form>
    </Form>
  );
}
