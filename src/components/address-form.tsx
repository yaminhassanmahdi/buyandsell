
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
import type { ShippingAddress, Division, District, Thana } from "@/lib/types";
import { 
    DEFAULT_DIVISIONS, DIVISIONS_STORAGE_KEY,
    DEFAULT_DISTRICTS, DISTRICTS_STORAGE_KEY,
    DEFAULT_THANAS, THANAS_STORAGE_KEY
} from "@/lib/constants";
import useLocalStorage from '@/hooks/use-local-storage';
import { Loader2 } from "lucide-react";
import { useState, useEffect } from "react";

const addressSchema = z.object({
  fullName: z.string().min(2, "Full name is required."),
  phoneNumber: z.string().optional(),
  country: z.string().default("Bangladesh"),
  division: z.string().min(1, "Please select a division."), // Stores selected division name
  district: z.string().min(1, "Please select a district."), // Stores selected district name
  thana: z.string().min(1, "Please select a thana."),       // Stores selected thana name
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
  const [divisions] = useLocalStorage<Division[]>(DIVISIONS_STORAGE_KEY, DEFAULT_DIVISIONS);
  const [districts] = useLocalStorage<District[]>(DISTRICTS_STORAGE_KEY, DEFAULT_DISTRICTS);
  const [thanas] = useLocalStorage<Thana[]>(THANAS_STORAGE_KEY, DEFAULT_THANAS);

  const [availableDistricts, setAvailableDistricts] = useState<District[]>([]);
  const [availableThanas, setAvailableThanas] = useState<Thana[]>([]);

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
      const selectedDivisionObj = divisions.find(d => d.name === initialData.division);
      if (selectedDivisionObj) {
        const newDistricts = districts.filter(dist => dist.divisionId === selectedDivisionObj.id);
        setAvailableDistricts(newDistricts);
        if (initialData.district) {
          const selectedDistrictObj = newDistricts.find(d => d.name === initialData.district);
          if (selectedDistrictObj) {
            setAvailableThanas(thanas.filter(th => th.districtId === selectedDistrictObj.id));
          } else {
            setAvailableThanas([]);
          }
        } else {
          setAvailableThanas([]);
        }
      } else {
        setAvailableDistricts([]);
        setAvailableThanas([]);
      }
    } else {
      setAvailableDistricts([]);
      setAvailableThanas([]);
    }
  // initialData, divisions, districts, thanas, form.reset are dependencies
  // eslint-disable-next-line react-hooks/exhaustive-deps 
  }, [initialData, divisions, districts, thanas]); 


  const watchedDivisionName = form.watch("division");
  const watchedDistrictName = form.watch("district");

  useEffect(() => {
    if (watchedDivisionName) {
      const selectedDivisionObj = divisions.find(d => d.name === watchedDivisionName);
      if (selectedDivisionObj) {
        const newDistricts = districts.filter(dist => dist.divisionId === selectedDivisionObj.id);
        setAvailableDistricts(newDistricts);
        
        const currentDistrictValue = form.getValues("district");
        if (currentDistrictValue && !newDistricts.some(d => d.name === currentDistrictValue)) {
          form.setValue("district", "");
          form.setValue("thana", "");
          setAvailableThanas([]);
        } else if (!currentDistrictValue && form.formState.dirtyFields.division) {
           form.setValue("district", "");
           form.setValue("thana", "");
           setAvailableThanas([]);
        }
      } else {
        setAvailableDistricts([]);
        form.setValue("district", "");
        form.setValue("thana", "");
        setAvailableThanas([]);
      }
    } else {
      setAvailableDistricts([]);
      form.setValue("district", "");
      form.setValue("thana", "");
      setAvailableThanas([]);
    }
  // form, divisions, districts are dependencies
  // eslint-disable-next-line react-hooks/exhaustive-deps 
  }, [watchedDivisionName, divisions, districts]); 

  useEffect(() => {
    if (watchedDistrictName && watchedDivisionName) {
        const selectedDivisionObj = divisions.find(d => d.name === watchedDivisionName);
        if (selectedDivisionObj) {
            const selectedDistrictObj = districts.find(d => d.name === watchedDistrictName && d.divisionId === selectedDivisionObj.id);
            if (selectedDistrictObj) {
                const newThanas = thanas.filter(th => th.districtId === selectedDistrictObj.id);
                setAvailableThanas(newThanas);

                const currentThanaValue = form.getValues("thana");
                if (currentThanaValue && !newThanas.some(t => t.name === currentThanaValue)) {
                    form.setValue("thana", "");
                } else if (!currentThanaValue && form.formState.dirtyFields.district) {
                    form.setValue("thana", "");
                }
            } else {
                setAvailableThanas([]);
                form.setValue("thana", "");
            }
        } else {
            setAvailableThanas([]);
            form.setValue("thana", "");
        }
    } else {
      setAvailableThanas([]);
      form.setValue("thana", "");
    }
  // form, divisions, districts, thanas are dependencies
  // eslint-disable-next-line react-hooks/exhaustive-deps 
  }, [watchedDistrictName, watchedDivisionName, divisions, districts, thanas]);


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
                  {divisions.map(division => (
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
                disabled={!watchedDivisionName || availableDistricts.length === 0}
              >
                <FormControl>
                  <SelectTrigger>
                    <SelectValue placeholder={!watchedDivisionName ? "Select a division first" : (availableDistricts.length === 0 && watchedDivisionName ? "No districts in division" : "Select District")} />
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
                disabled={!watchedDistrictName || availableThanas.length === 0}
              >
                <FormControl>
                  <SelectTrigger>
                    <SelectValue placeholder={!watchedDistrictName ? "Select a district first" : (availableThanas.length === 0 && watchedDistrictName ? "No thanas in district" : "Select Thana")} />
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
