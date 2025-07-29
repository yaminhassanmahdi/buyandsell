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
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { DollarSign, Loader2, Save, Weight } from "lucide-react";
import { useToast } from "@/hooks/use-toast";
import { useEffect, useState } from "react";
import { apiClient } from "@/lib/api-client";

const deliveryChargeSchema = z.object({
  intraUpazillaCharge: z.coerce.number().min(0, "Charge must be non-negative."),
  intraDistrictCharge: z.coerce.number().min(0, "Charge must be non-negative."),
  interDistrictCharge: z.coerce.number().min(0, "Charge must be non-negative."),
  intraUpazillaExtraKgCharge: z.coerce.number().min(0, "Extra charge must be non-negative."),
  intraDistrictExtraKgCharge: z.coerce.number().min(0, "Extra charge must be non-negative."),
  interDistrictExtraKgCharge: z.coerce.number().min(0, "Extra charge must be non-negative."),
});

type DeliveryChargeFormData = z.infer<typeof deliveryChargeSchema>;

export default function AdminDeliveryChargesPage() {
  const { toast } = useToast();
  const [isLoading, setIsLoading] = useState(true);
  const [isSubmitting, setIsSubmitting] = useState(false);
  
  const form = useForm<DeliveryChargeFormData>({
    resolver: zodResolver(deliveryChargeSchema),
    defaultValues: {
      intraUpazillaCharge: 60,
      intraDistrictCharge: 110,
      interDistrictCharge: 130,
      intraUpazillaExtraKgCharge: 20,
      intraDistrictExtraKgCharge: 30,
      interDistrictExtraKgCharge: 40,
    },
  });

  useEffect(() => {
    const fetchSettings = async () => {
      try {
        const settings = await apiClient.getDeliveryCharges() as any;
        form.reset({
          intraUpazillaCharge: settings.intra_upazilla_charge || 60,
          intraDistrictCharge: settings.intra_district_charge || 110,
          interDistrictCharge: settings.inter_district_charge || 130,
          intraUpazillaExtraKgCharge: settings.intra_upazilla_extra_kg_charge || 20,
          intraDistrictExtraKgCharge: settings.intra_district_extra_kg_charge || 30,
          interDistrictExtraKgCharge: settings.inter_district_extra_kg_charge || 40,
        });
      } catch (error) {
        console.error('Error fetching delivery charges:', error);
        toast({
          title: "Error",
          description: "Failed to load delivery charges. Using default values.",
          variant: "destructive"
        });
      } finally {
        setIsLoading(false);
      }
    };

    fetchSettings();
  }, [form, toast]);

  const onSubmit = async (data: DeliveryChargeFormData) => {
    setIsSubmitting(true);
    try {
      await apiClient.updateDeliveryCharges({
        intraUpazillaCharge: data.intraUpazillaCharge,
        intraDistrictCharge: data.intraDistrictCharge,
        interDistrictCharge: data.interDistrictCharge,
        intraUpazillaExtraKgCharge: data.intraUpazillaExtraKgCharge,
        intraDistrictExtraKgCharge: data.intraDistrictExtraKgCharge,
        interDistrictExtraKgCharge: data.interDistrictExtraKgCharge,
      });
      
      toast({
        title: "Settings Updated",
        description: "Delivery charges have been successfully saved.",
      });
    } catch (error) {
      console.error('Error updating delivery charges:', error);
      toast({
        title: "Error",
        description: "Failed to update delivery charges. Please try again.",
        variant: "destructive"
      });
    } finally {
      setIsSubmitting(false);
    }
  };

  if (isLoading) {
    return (
      <div className="flex items-center justify-center min-h-[calc(100vh-200px)]">
        <Loader2 className="h-12 w-12 animate-spin text-primary" />
      </div>
    );
  }

  return (
    <div className="space-y-8 py-4">
      <h1 className="text-3xl font-bold flex items-center gap-3">
        <DollarSign className="h-8 w-8 text-primary"/>
        Manage Delivery Charges
      </h1>
      
      <Card>
        <CardHeader>
          <CardTitle>Set Base Delivery Fees</CardTitle>
          <CardDescription>
            Configure the delivery charges for different scenarios based on seller and buyer locations.
            These charges apply to products up to 1KG weight.
          </CardDescription>
        </CardHeader>
        <CardContent>
          <Form {...form}>
            <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-6">
              <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                <FormField
                  control={form.control}
                  name="intraUpazillaCharge"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Intra-Upazilla Charge</FormLabel>
                      <FormControl>
                        <Input type="number" placeholder="e.g., 60" {...field} />
                      </FormControl>
                      <FormDescription>
                        Seller and buyer are in the same Upazilla (Thana).
                      </FormDescription>
                      <FormMessage />
                    </FormItem>
                  )}
                />
                <FormField
                  control={form.control}
                  name="intraDistrictCharge"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Intra-District Charge</FormLabel>
                      <FormControl>
                        <Input type="number" placeholder="e.g., 110" {...field} />
                      </FormControl>
                      <FormDescription>
                        Seller and buyer are in the same District but different Upazillas.
                      </FormDescription>
                      <FormMessage />
                    </FormItem>
                  )}
                />
                <FormField
                  control={form.control}
                  name="interDistrictCharge"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Inter-District Charge</FormLabel>
                      <FormControl>
                        <Input type="number" placeholder="e.g., 130" {...field} />
                      </FormControl>
                      <FormDescription>
                        Seller and buyer are in different Districts.
                      </FormDescription>
                      <FormMessage />
                    </FormItem>
                  )}
                />
              </div>
            </form>
          </Form>
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Weight className="h-5 w-5" />
            Weight-Based Extra Charges
          </CardTitle>
          <CardDescription>
            Additional charges per KG for products weighing more than 1KG. 
            Weight is rounded up (e.g., 1.1KG = 2KG charge, 2.5KG = 3KG charge).
          </CardDescription>
        </CardHeader>
        <CardContent>
          <Form {...form}>
            <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-6">
              <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                <FormField
                  control={form.control}
                  name="intraUpazillaExtraKgCharge"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Extra Charge per KG (Intra-Upazilla)</FormLabel>
                      <FormControl>
                        <Input type="number" placeholder="e.g., 20" {...field} />
                      </FormControl>
                      <FormDescription>
                        Additional charge for every KG above 1KG within same Upazilla.
                      </FormDescription>
                      <FormMessage />
                    </FormItem>
                  )}
                />
                <FormField
                  control={form.control}
                  name="intraDistrictExtraKgCharge"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Extra Charge per KG (Intra-District)</FormLabel>
                      <FormControl>
                        <Input type="number" placeholder="e.g., 30" {...field} />
                      </FormControl>
                      <FormDescription>
                        Additional charge for every KG above 1KG within same District.
                      </FormDescription>
                      <FormMessage />
                    </FormItem>
                  )}
                />
                <FormField
                  control={form.control}
                  name="interDistrictExtraKgCharge"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Extra Charge per KG (Inter-District)</FormLabel>
                      <FormControl>
                        <Input type="number" placeholder="e.g., 40" {...field} />
                      </FormControl>
                      <FormDescription>
                        Additional charge for every KG above 1KG between different Districts.
                      </FormDescription>
                      <FormMessage />
                    </FormItem>
                  )}
                />
              </div>
              
              <div className="pt-4 border-t">
                <Button type="submit" disabled={isSubmitting}>
                  {isSubmitting ? (
                    <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                  ) : (
                    <Save className="mr-2 h-4 w-4" />
                  )}
                  Save All Charges
                </Button>
              </div>
            </form>
          </Form>
        </CardContent>
      </Card>

      {/* Example Calculation */}
      <Card className="bg-muted/50">
        <CardHeader>
          <CardTitle className="text-lg">Calculation Examples (Using Ceiling Logic)</CardTitle>
        </CardHeader>
        <CardContent className="text-sm space-y-2">
          <div>
            <strong>Example 1:</strong> 0.5KG product, Intra-Upazilla → Charge: {form.watch("intraUpazillaCharge")} BDT (base charge only)
          </div>
          <div>
            <strong>Example 2:</strong> 1.1KG product, Intra-Upazilla → Charge: {form.watch("intraUpazillaCharge")} + (1 × {form.watch("intraUpazillaExtraKgCharge")}) = {form.watch("intraUpazillaCharge") + form.watch("intraUpazillaExtraKgCharge")} BDT (rounded to 2KG)
          </div>
          <div>
            <strong>Example 3:</strong> 2.4KG product, Intra-District → Charge: {form.watch("intraDistrictCharge")} + (2 × {form.watch("intraDistrictExtraKgCharge")}) = {form.watch("intraDistrictCharge") + (2 * form.watch("intraDistrictExtraKgCharge"))} BDT (rounded to 3KG)
          </div>
          <div>
            <strong>Example 4:</strong> 5KG product, Inter-District → Charge: {form.watch("interDistrictCharge")} + (4 × {form.watch("interDistrictExtraKgCharge")}) = {form.watch("interDistrictCharge") + (4 * form.watch("interDistrictExtraKgCharge"))} BDT
          </div>
        </CardContent>
      </Card>
    </div>
  );
} 