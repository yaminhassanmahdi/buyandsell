
"use client";
import { zodResolver } from "@hookform/resolvers/zod";
import { useForm } from "react-hook-form";
import * as z from "zod";
import { Button } from "@/components/ui/button";
import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from "@/components/ui/form";
import { Input } from "@/components/ui/input";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import type { ShippingAddress, StaticDistrict, StaticThana } from "@/lib/types";
import { DIVISIONS_BD, DISTRICTS_BD, THANAS_BD } from "@/lib/constants";
import { Loader2 } from "lucide-react";
import { useState, useEffect, useRef } from "react";

const addressSchema = z.object({
  fullName: z.string().min(2, "Full name is required."),
  phoneNumber: z.string().optional(),
  country: z.string().default("Bangladesh"),
  division: z.string().min(1, "Please select a division."),
  district: z.string().min(1, "Please select a district."),
  thana: z.string().min(1, "Please select a thana."),
  houseAddress: z.string().min(3, "House address is required."),
  roadNumber: z.string().optional(),
});

type AddressFormValues = Omit<ShippingAddress, 'country'> & { country?: string };

type AddressFormProps = {
  onSubmit: (data: ShippingAddress) => void;
  isLoading?: boolean;
  initialData?: Partial<ShippingAddress>;
};

export function AddressForm({ onSubmit, isLoading = false, initialData = {} }: AddressFormProps) {
  const [availableDistricts, setAvailableDistricts] = useState<StaticDistrict[]>([]);
  const [availableThanas, setAvailableThanas] = useState<StaticThana[]>([]);

  const form = useForm<AddressFormValues>({
    resolver: zodResolver(addressSchema),
    defaultValues: {
      fullName: initialData?.fullName || "",
      phoneNumber: initialData?.phoneNumber || "",
      country: "Bangladesh",
      division: initialData?.division || "",
      district: initialData?.district || "",
      thana: initialData?.thana || "",
      houseAddress: initialData?.houseAddress || "",
      roadNumber: initialData?.roadNumber || "",
    },
  });

  // Effect to reset form and populate dropdowns when initialData changes
  useEffect(() => {
    form.reset({
      fullName: initialData?.fullName || "",
      phoneNumber: initialData?.phoneNumber || "",
      country: "Bangladesh",
      division: initialData?.division || "",
      district: initialData?.district || "",
      thana: initialData?.thana || "",
      houseAddress: initialData?.houseAddress || "",
      roadNumber: initialData?.roadNumber || "",
    });

    if (initialData?.division) {
      const division = DIVISIONS_BD.find(d => d.name === initialData.division);
      if (division) {
        const newDistricts = DISTRICTS_BD.filter(dist => dist.divisionId === division.id);
        setAvailableDistricts(newDistricts);
        if (initialData.district) {
          const district = newDistricts.find(d => d.name === initialData.district);
          if (district) {
            setAvailableThanas(THANAS_BD.filter(th => th.districtId === district.id));
          } else {
            setAvailableThanas([]); // Initial district not valid for initial division
          }
        } else {
          setAvailableThanas([]); // No initial district
        }
      } else { // Initial division not found
        setAvailableDistricts([]);
        setAvailableThanas([]);
      }
    } else { // No initial division
      setAvailableDistricts([]);
      setAvailableThanas([]);
    }
  }, [initialData, form.reset]);


  const watchedDivision = form.watch("division");
  const watchedDistrict = form.watch("district");

  // Effect to update available districts and reset child fields if division changes
  useEffect(() => {
    if (watchedDivision) {
      const division = DIVISIONS_BD.find(d => d.name === watchedDivision);
      if (division) {
        const newDistricts = DISTRICTS_BD.filter(dist => dist.divisionId === division.id);
        setAvailableDistricts(newDistricts);
        
        // Check if current district is valid for the new division
        const currentDistrictValue = form.getValues("district");
        if (currentDistrictValue && !newDistricts.some(d => d.name === currentDistrictValue)) {
          form.setValue("district", "");
          form.setValue("thana", ""); // Reset thana as well
          setAvailableThanas([]);
        } else if (!currentDistrictValue && form.formState.dirtyFields.division) {
          // If division was changed by user and district is now empty, clear it.
           form.setValue("district", "");
           form.setValue("thana", "");
           setAvailableThanas([]);
        }

      } else { // Invalid division selected
        setAvailableDistricts([]);
        form.setValue("district", "");
        form.setValue("thana", "");
        setAvailableThanas([]);
      }
    } else { // No division selected
      setAvailableDistricts([]);
      form.setValue("district", "");
      form.setValue("thana", "");
      setAvailableThanas([]);
    }
  // form.getValues and form.setValue are stable, formState.dirtyFields helps detect user interaction
  }, [watchedDivision, form]); 

  // Effect to update available thanas and reset thana field if district changes
  useEffect(() => {
    if (watchedDistrict && watchedDivision) {
      const division = DIVISIONS_BD.find(d => d.name === watchedDivision); // Need to ensure division is valid
      if (division) {
        const district = DISTRICTS_BD.find(d => d.name === watchedDistrict && d.divisionId === division.id);
        if (district) {
          const newThanas = THANAS_BD.filter(th => th.districtId === district.id);
          setAvailableThanas(newThanas);

          // Check if current thana is valid for the new district
          const currentThanaValue = form.getValues("thana");
          if (currentThanaValue && !newThanas.some(t => t.name === currentThanaValue)) {
            form.setValue("thana", "");
          } else if (!currentThanaValue && form.formState.dirtyFields.district) {
             form.setValue("thana", "");
          }
        } else { // Invalid district selected
          setAvailableThanas([]);
          form.setValue("thana", "");
        }
      } else { // Parent division became invalid
         setAvailableThanas([]);
         form.setValue("thana", "");
      }
    } else { // No district selected or no division
      setAvailableThanas([]);
      form.setValue("thana", "");
    }
  }, [watchedDistrict, watchedDivision, form]);


  const handleFormSubmit = (values: AddressFormValues) => {
    const fullAddress: ShippingAddress = {
      fullName: values.fullName,
      phoneNumber: values.phoneNumber,
      country: "Bangladesh",
      division: values.division,
      district: values.district,
      thana: values.thana,
      houseAddress: values.houseAddress,
      roadNumber: values.roadNumber,
    };
    onSubmit(fullAddress);
  };

  return (
    <Form {...form}>
      <form onSubmit={form.handleSubmit(handleFormSubmit)} className="space-y-4">
        <FormField
          control={form.control}
          name="fullName"
          render={({ field }) => (
            <FormItem>
              <FormLabel>Full Name</FormLabel>
              <FormControl>
                <Input placeholder="John M. Doe" {...field} />
              </FormControl>
              <FormMessage />
            </FormItem>
          )}
        />
        <FormField
          control={form.control}
          name="phoneNumber"
          render={({ field }) => (
            <FormItem>
              <FormLabel>Phone Number (Optional)</FormLabel>
              <FormControl>
                <Input type="tel" placeholder="01XXXXXXXXX" {...field} />
              </FormControl>
              <FormMessage />
            </FormItem>
          )}
        />

        <FormItem>
            <FormLabel>Country</FormLabel>
            <FormControl>
                <Input value="Bangladesh" disabled />
            </FormControl>
        </FormItem>

        <FormField
          control={form.control}
          name="division"
          render={({ field }) => (
            <FormItem>
              <FormLabel>Division</FormLabel>
              <Select onValueChange={field.onChange} value={field.value}>
                <FormControl>
                  <SelectTrigger>
                    <SelectValue placeholder="Select Division" />
                  </SelectTrigger>
                </FormControl>
                <SelectContent>
                  {DIVISIONS_BD.map(division => (
                    <SelectItem key={division.id} value={division.name}>{division.name}</SelectItem>
                  ))}
                </SelectContent>
              </Select>
              <FormMessage />
            </FormItem>
          )}
        />

        <FormField
          control={form.control}
          name="district"
          render={({ field }) => (
            <FormItem>
              <FormLabel>District</FormLabel>
              <Select 
                onValueChange={field.onChange} 
                value={field.value} 
                disabled={!watchedDivision || availableDistricts.length === 0}
              >
                <FormControl>
                  <SelectTrigger>
                    <SelectValue placeholder={!watchedDivision ? "Select a division first" : (availableDistricts.length === 0 && watchedDivision ? "No districts in division" : "Select District")} />
                  </SelectTrigger>
                </FormControl>
                <SelectContent>
                  {availableDistricts.map(district => (
                    <SelectItem key={district.id} value={district.name}>{district.name}</SelectItem>
                  ))}
                </SelectContent>
              </Select>
              <FormMessage />
            </FormItem>
          )}
        />

        <FormField
          control={form.control}
          name="thana"
          render={({ field }) => (
            <FormItem>
              <FormLabel>Thana / Upazilla</FormLabel>
              <Select 
                onValueChange={field.onChange} 
                value={field.value} 
                disabled={!watchedDistrict || availableThanas.length === 0}
              >
                <FormControl>
                  <SelectTrigger>
                    <SelectValue placeholder={!watchedDistrict ? "Select a district first" : (availableThanas.length === 0 && watchedDistrict ? "No thanas in district" : "Select Thana")} />
                  </SelectTrigger>
                </FormControl>
                <SelectContent>
                  {availableThanas.map(thana => (
                    <SelectItem key={thana.id} value={thana.name}>{thana.name}</SelectItem>
                  ))}
                </SelectContent>
              </Select>
              <FormMessage />
            </FormItem>
          )}
        />
        
        <FormField
          control={form.control}
          name="houseAddress"
          render={({ field }) => (
            <FormItem>
              <FormLabel>House Address</FormLabel>
              <FormControl>
                <Input placeholder="e.g., House 123, Flat B4" {...field} />
              </FormControl>
              <FormMessage />
            </FormItem>
          )}
        />
        <FormField
          control={form.control}
          name="roadNumber"
          render={({ field }) => (
            <FormItem>
              <FormLabel>Road Number / Name (Optional)</FormLabel>
              <FormControl>
                <Input placeholder="e.g., Road 5, Block C" {...field} />
              </FormControl>
              <FormMessage />
            </FormItem>
          )}
        />
        <Button type="submit" className="w-full" disabled={isLoading}>
          {isLoading && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
          Save Address & Continue
        </Button>
      </form>
    </Form>
  );
}
