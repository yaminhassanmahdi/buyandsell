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
import type { ShippingAddress, Division, District, Thana as Upazilla } from "@/lib/types";
import { Loader2 } from "lucide-react";
import { useState, useEffect } from "react";

const addressSchema = z.object({
  fullName: z.string().min(2, "Full name is required."),
  phoneNumber: z.string().optional(),
  country: z.string().default("Bangladesh"),
  division: z.string().min(1, "Please select a division."), 
  district: z.string().min(1, "Please select a district."), 
  upazilla: z.string().optional(), // Made optional
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
  const [divisions, setDivisions] = useState<Division[]>([]);
  const [availableDistricts, setAvailableDistricts] = useState<District[]>([]);
  const [availableUpazillas, setAvailableUpazillas] = useState<Upazilla[]>([]);
  const [isLoadingLocations, setIsLoadingLocations] = useState(true);
  const [isInitialDataLoaded, setIsInitialDataLoaded] = useState(false);
  const [initialDivision, setInitialDivision] = useState(initialData?.division || "");
  const [initialDistrict, setInitialDistrict] = useState(initialData?.district || "");

  const form = useForm<AddressFormValues>({
    resolver: zodResolver(addressSchema),
    defaultValues: {
      fullName: initialData?.fullName || "",
      phoneNumber: initialData?.phoneNumber || "",
      country: "Bangladesh",
      division: initialData?.division || "",
      district: initialData?.district || "",
      upazilla: initialData?.upazilla || "",
      houseAddress: initialData?.houseAddress || "",
      roadNumber: initialData?.roadNumber || "",
    },
  });

  // Fetch divisions on component mount
  useEffect(() => {
    const fetchDivisions = async () => {
      try {
        const response = await fetch('/api/locations?type=divisions');
        if (response.ok) {
          const data = await response.json();
          setDivisions(data);
        }
      } catch (error) {
        console.error('Error fetching divisions:', error);
      } finally {
        setIsLoadingLocations(false);
      }
    };

    fetchDivisions();
  }, []);

  // Fetch districts when division changes
  const fetchDistricts = async (divisionName: string) => {
    console.log('[DEBUG] Fetching districts for division:', divisionName);
    try {
      const url = `/api/locations?type=districts&divisionId=${encodeURIComponent(divisionName)}`;
      console.log('[DEBUG] API URL:', url);
      const response = await fetch(url);
      console.log('[DEBUG] Response status:', response.status);
      if (response.ok) {
        const data = await response.json();
        console.log('[DEBUG] Districts data:', data);
        setAvailableDistricts(data);
        return data;
      } else {
        console.error('[DEBUG] API error:', response.status, response.statusText);
      }
    } catch (error) {
      console.error('[DEBUG] Error fetching districts:', error);
    }
    return [];
  };

  // Fetch upazillas when district changes
  const fetchUpazillas = async (districtName: string) => {
    try {
      const response = await fetch(`/api/locations?type=upazillas&districtId=${encodeURIComponent(districtName)}`);
      if (response.ok) {
        const data = await response.json();
        setAvailableUpazillas(data);
        return data;
      }
    } catch (error) {
      console.error('Error fetching upazillas:', error);
    }
    return [];
  };

  // Initial data load: only run once and only if form is empty
  useEffect(() => {
    const currentDivision = form.getValues("division");
    const currentDistrict = form.getValues("district");
    const currentUpazilla = form.getValues("upazilla");
    
    console.log('[DEBUG] Initial data effect:', {
      currentDivision,
      currentDistrict,
      currentUpazilla,
      hasInitialData: !!(initialData && (initialData.division || initialData.district || initialData.upazilla)),
      formIsEmpty: !currentDivision && !currentDistrict && !currentUpazilla,
      isInitialDataLoaded,
      isLoadingLocations,
      initialData
    });
    
    // Check if we have initial data to load
    const hasInitialData = initialData && (initialData.division || initialData.district || initialData.upazilla);
    const formIsEmpty = !currentDivision && !currentDistrict && !currentUpazilla;
    // If we have initial data, we should always load it (either form is empty or we're editing)
    const shouldLoadInitialData = hasInitialData && !isInitialDataLoaded;
    
    console.log('[DEBUG] Initial data decision:', {
      hasInitialData,
      formIsEmpty,
      shouldLoadInitialData,
      isLoadingLocations
    });
    
    if (!isLoadingLocations && shouldLoadInitialData) {
      console.log('[DEBUG] Loading initial data');
      const loadInitialData = async () => {
        // Only reset if the form is actually empty or the data has changed
        const shouldReset = formIsEmpty || 
          currentDivision !== initialData?.division ||
          currentDistrict !== initialData?.district ||
          currentUpazilla !== initialData?.upazilla;
        
        if (shouldReset) {
          // Reset form with initial data
          form.reset({
            fullName: initialData?.fullName || "",
            phoneNumber: initialData?.phoneNumber || "",
            country: "Bangladesh",
            division: initialData?.division || "",
            district: initialData?.district || "",
            upazilla: initialData?.upazilla || "",
            houseAddress: initialData?.houseAddress || "",
            roadNumber: initialData?.roadNumber || "",
          });
        }
        
        // Load districts and upazillas for the initial data
        if (initialData?.division) {
          const districts = await fetchDistricts(initialData.division);
          if (initialData?.district && districts.length > 0) {
            await fetchUpazillas(initialData.district);
          }
        }
        
        setIsInitialDataLoaded(true);
      };
      loadInitialData();
    } else if (!isLoadingLocations && !hasInitialData && !isInitialDataLoaded) {
      // If no initial data and not loaded yet, mark as loaded so division changes work
      console.log('[DEBUG] No initial data, marking as loaded');
      setIsInitialDataLoaded(true);
    }
  }, [isLoadingLocations, initialData, isInitialDataLoaded, form]);

  const watchedDivisionName = form.watch("division");
  const watchedDistrictName = form.watch("district");

  // Handle division changes (only after initial data is loaded and only on user changes)
  useEffect(() => {
    console.log('[DEBUG] Division change effect:', {
      watchedDivisionName,
      isInitialDataLoaded,
      initialDivision,
      shouldTrigger: isInitialDataLoaded && watchedDivisionName && watchedDivisionName !== initialDivision
    });
    
    if (isInitialDataLoaded && watchedDivisionName && watchedDivisionName !== initialDivision) {
      console.log('[DEBUG] User changed division to:', watchedDivisionName);
      fetchDistricts(watchedDivisionName);
      form.setValue("district", "");
      form.setValue("upazilla", "");
      setAvailableUpazillas([]);
      setInitialDivision(watchedDivisionName);
    }
  }, [watchedDivisionName, isInitialDataLoaded, initialDivision, form]);

  // Handle district changes (only after initial data is loaded and only on user changes)
  useEffect(() => {
    if (isInitialDataLoaded && watchedDistrictName && watchedDistrictName !== initialDistrict) {
      fetchUpazillas(watchedDistrictName);
      form.setValue("upazilla", "");
      setInitialDistrict(watchedDistrictName);
    }
  }, [watchedDistrictName, isInitialDataLoaded, initialDistrict, form]);

  const handleFormSubmit = (values: AddressFormValues) => {
    const fullAddress: ShippingAddress = {
      fullName: values.fullName,
      phoneNumber: values.phoneNumber,
      country: "Bangladesh",
      division: values.division,
      district: values.district,
      upazilla: values.upazilla || "", // Handle empty upazilla
      houseAddress: values.houseAddress,
      roadNumber: values.roadNumber,
    };
    onSubmit(fullAddress);
  };

  if (isLoadingLocations) {
    return (
      <div className="flex items-center justify-center p-8">
        <Loader2 className="h-6 w-6 animate-spin" />
        <span className="ml-2">Loading location data...</span>
      </div>
    );
  }

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
                <Input placeholder="John M. Doe" {...field} value={field.value || ''} />
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
                <Input type="tel" placeholder="01XXXXXXXXX" {...field} value={field.value || ''} />
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
              <Select onValueChange={field.onChange} value={field.value || ''}>
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
          render={({ field }) => {
            console.log('[DEBUG] District dropdown render:', {
              watchedDivisionName,
              availableDistricts: availableDistricts.length,
              fieldValue: field.value,
              isDisabled: !watchedDivisionName || availableDistricts.length === 0
            });
            
            return (
              <FormItem>
                <FormLabel>District</FormLabel>
                <Select 
                  onValueChange={field.onChange} 
                  value={field.value || ''} 
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
            );
          }}
        />

        <FormField
          control={form.control}
          name="upazilla"
          render={({ field }) => (
            <FormItem>
              <FormLabel>Upazilla (Optional)</FormLabel>
              <Select
                onValueChange={field.onChange}
                value={field.value || ''}
                disabled={!watchedDistrictName}
              >
                <FormControl>
                  <SelectTrigger>
                    <SelectValue placeholder={
                      !watchedDistrictName
                        ? "Select a district first"
                        : (availableUpazillas.length === 0
                            ? "No upazillas available (optional)"
                            : "Select Upazilla (optional)")
                    } />
                  </SelectTrigger>
                </FormControl>
                <SelectContent>
                  {availableUpazillas.length > 0 &&
                    availableUpazillas.map(upazilla => (
                      <SelectItem key={upazilla.id} value={upazilla.name}>
                        {upazilla.name}
                      </SelectItem>
                    ))
                  }
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
                <Input placeholder="e.g., House 123, Flat B4" {...field} value={field.value || ''} />
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
                <Input placeholder="e.g., Road 5, Block C" {...field} value={field.value || ''} />
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
