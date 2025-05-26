
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
import { CATEGORIES, BRANDS } from "@/lib/constants";
import type { Product } from "@/lib/types";
import { MOCK_PRODUCTS } from "@/lib/mock-data"; // For adding the new product
import { useAuth } from "@/contexts/auth-context";
import { useRouter } from "next/navigation";
import { useToast } from "@/hooks/use-toast";
import { useState } from "react";
import { Loader2, UploadCloud } from "lucide-react";

const productSchema = z.object({
  name: z.string().min(3, "Product name must be at least 3 characters.").max(100),
  description: z.string().min(10, "Description must be at least 10 characters.").max(1000),
  price: z.coerce.number().min(0.01, "Price must be a positive number."),
  categoryId: z.string().min(1, "Please select a category."),
  brandId: z.string().min(1, "Please select a brand."),
  // imageUrl: z.string().url("Please enter a valid image URL.").optional(), // For simplicity, we'll auto-generate placeholder
});

type ProductFormData = z.infer<typeof productSchema>;

export function ProductUploadForm() {
  const { currentUser } = useAuth();
  const router = useRouter();
  const { toast } = useToast();
  const [isLoading, setIsLoading] = useState(false);

  const form = useForm<ProductFormData>({
    resolver: zodResolver(productSchema),
    defaultValues: {
      name: "",
      description: "",
      price: 0,
      categoryId: "",
      brandId: "",
    },
  });

  async function onSubmit(values: ProductFormData) {
    if (!currentUser) {
      toast({ title: "Error", description: "You must be logged in to sell a product.", variant: "destructive" });
      return;
    }
    setIsLoading(true);

    // Simulate API call
    await new Promise(resolve => setTimeout(resolve, 1000));

    const category = CATEGORIES.find(c => c.id === values.categoryId);
    const brand = BRANDS.find(b => b.id === values.brandId);

    if (!category || !brand) {
      toast({ title: "Error", description: "Invalid category or brand selected.", variant: "destructive" });
      setIsLoading(false);
      return;
    }
    
    const newProduct: Product = {
      id: `prod${MOCK_PRODUCTS.length + 1}`,
      name: values.name,
      description: values.description,
      price: values.price,
      // Use a placeholder image, in a real app this would be an upload
      imageUrl: `https://placehold.co/600x400.png`, 
      imageHint: `${values.name.substring(0,15)} product`, // Simple hint from name
      category,
      brand,
      sellerId: currentUser.id,
      sellerName: currentUser.name,
      status: 'pending', // Products go into pending status for admin approval
      createdAt: new Date(),
    };

    MOCK_PRODUCTS.push(newProduct); // Add to mock data store
    
    toast({
      title: "Product Submitted!",
      description: `${newProduct.name} has been submitted for approval.`,
    });
    setIsLoading(false);
    router.push('/'); // Redirect to home or a "my products" page
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
              <FormLabel>Price ($)</FormLabel>
              <FormControl>
                <Input type="number" step="0.01" placeholder="29.99" {...field} />
              </FormControl>
              <FormMessage />
            </FormItem>
          )}
        />
        <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
          <FormField
            control={form.control}
            name="categoryId"
            render={({ field }) => (
              <FormItem>
                <FormLabel>Category</FormLabel>
                <Select onValueChange={field.onChange} defaultValue={field.value}>
                  <FormControl>
                    <SelectTrigger>
                      <SelectValue placeholder="Select a category" />
                    </SelectTrigger>
                  </FormControl>
                  <SelectContent>
                    {CATEGORIES.map(cat => (
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
            name="brandId"
            render={({ field }) => (
              <FormItem>
                <FormLabel>Brand</FormLabel>
                <Select onValueChange={field.onChange} defaultValue={field.value}>
                  <FormControl>
                    <SelectTrigger>
                      <SelectValue placeholder="Select a brand" />
                    </SelectTrigger>
                  </FormControl>
                  <SelectContent>
                    {BRANDS.map(brand => (
                      <SelectItem key={brand.id} value={brand.id}>{brand.name}</SelectItem>
                    ))}
                  </SelectContent>
                </Select>
                <FormMessage />
              </FormItem>
            )}
          />
        </div>
        
        {/* Image upload can be added here. For now, placeholder is used. */}
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
