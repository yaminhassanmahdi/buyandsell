
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
import type { ShippingAddress, Division, District, Upazilla, Union } from "@/lib/types";
import { Loader2 } from "lucide-react";
import { useState, useEffect } from "react";

const addressSchema = z.object({
  fullName: z.string().min(2, "Full name is required."),
  phoneNumber: z.string().optional(),
  country: z.string().default("Bangladesh"),
  divisionId: z.string().min(1, "Please select a division."),
  districtId: z.string().min(1, "Please select a district."),
  upazillaId: z.string().min(1, "Please select an upazilla."),
  unionId: z.string().min(1, "Please select a union."),
  houseAddress: z.string().min(3, "House address is required."),
  roadNumber: z.string().optional(),
  // Hidden fields for names, to be populated internally
  divisionName: z.string().optional(),
  districtName: z.string().optional(),
  upazillaName: z.string().optional(),
  unionName: z.string().optional(),
});

type AddressFormValues = Omit<ShippingAddress, 'divisionName' | 'districtName' | 'upazillaName' | 'unionName'> & {
  divisionName?: string;
  districtName?: string;
  upazillaName?: string;
  unionName?: string;
};


type AddressFormProps = {
  onSubmit: (data: ShippingAddress) => void;
  isLoading?: boolean;
  initialData?: Partial<ShippingAddress>;
};

export function AddressForm({ onSubmit, isLoading = false, initialData = {} }: AddressFormProps) {
  const [divisions, setDivisions] = useState<Division[]>([]);
  const [districts, setDistricts] = useState<District[]>([]);
  const [upazillas, setUpazillas] = useState<Upazilla[]>([]);
  const [unions, setUnions] = useState<Union[]>([]);

  const [loadingDivisions, setLoadingDivisions] = useState(false);
  const [loadingDistricts, setLoadingDistricts] = useState(false);
  const [loadingUpazillas, setLoadingUpazillas] = useState(false);
  const [loadingUnions, setLoadingUnions] = useState(false);

  const form = useForm<AddressFormValues>({
    resolver: zodResolver(addressSchema),
    defaultValues: {
      fullName: initialData?.fullName || "",
      phoneNumber: initialData?.phoneNumber || "",
      country: "Bangladesh",
      divisionId: initialData?.divisionId || "",
      districtId: initialData?.districtId || "",
      upazillaId: initialData?.upazillaId || "",
      unionId: initialData?.unionId || "",
      houseAddress: initialData?.houseAddress || "",
      roadNumber: initialData?.roadNumber || "",
    },
  });

  const selectedDivisionId = form.watch("divisionId");
  const selectedDistrictId = form.watch("districtId");
  const selectedUpazillaId = form.watch("upazillaId");

  useEffect(() => {
    const fetchDivisions = async () => {
      setLoadingDivisions(true);
      try {
        const response = await fetch('https://bdapi.vercel.app/api/v1/divisions'); // corrected endpoint
        const data = await response.json();
        if (data && data.data) { // API nests data under 'data' key
             setDivisions(data.data);
        } else {
            setDivisions([]); // handle case where data.data is not present
        }
      } catch (error) {
        console.error("Failed to fetch divisions:", error);
        setDivisions([]);
      }
      setLoadingDivisions(false);
    };
    fetchDivisions();
  }, []);

  useEffect(() => {
    if (selectedDivisionId) {
      const fetchDistricts = async () => {
        setLoadingDistricts(true);
        setDistricts([]);
        form.setValue("districtId", "");
        setUpazillas([]);
        form.setValue("upazillaId", "");
        setUnions([]);
        form.setValue("unionId", "");
        try {
          const response = await fetch(`https://bdapi.vercel.app/api/v1/districts/${selectedDivisionId}`); // corrected endpoint
          const data = await response.json();
           if (data && data.data) {
             setDistricts(data.data);
           } else {
             setDistricts([]);
           }
        } catch (error) {
          console.error("Failed to fetch districts:", error);
          setDistricts([]);
        }
        setLoadingDistricts(false);
      };
      fetchDistricts();
    } else {
      setDistricts([]);
      form.setValue("districtId", "");
    }
  }, [selectedDivisionId, form]);

  useEffect(() => {
    if (selectedDistrictId) {
      const fetchUpazillas = async () => {
        setLoadingUpazillas(true);
        setUpazillas([]);
        form.setValue("upazillaId", "");
        setUnions([]);
        form.setValue("unionId", "");
        try {
          // The API `https://bdapi.vercel.app/api/v1/upazilas` (all upazilas)
          // Each upazila object has a `district_id`
          const response = await fetch(`https://bdapi.vercel.app/api/v1/upazilas`); // corrected endpoint
          const data = await response.json();
          if (data && data.data) {
            const filteredUpazillas = data.data.filter((upazilla: Upazilla) => upazilla.district_id === selectedDistrictId);
            setUpazillas(filteredUpazillas);
          } else {
            setUpazillas([]);
          }
        } catch (error) {
          console.error("Failed to fetch upazillas:", error);
          setUpazillas([]);
        }
        setLoadingUpazillas(false);
      };
      fetchUpazillas();
    } else {
      setUpazillas([]);
      form.setValue("upazillaId", "");
    }
  }, [selectedDistrictId, form]);

  useEffect(() => {
    if (selectedUpazillaId) {
      const fetchUnions = async () => {
        setLoadingUnions(true);
        setUnions([]);
        form.setValue("unionId", "");
        try {
           // The API `https://bdapi.vercel.app/api/v1/unions` (all unions)
          // Each union object has an `upazila_id` (note: API uses 'upazila_id')
          const response = await fetch(`https://bdapi.vercel.app/api/v1/unions`); // corrected endpoint
          const data = await response.json();
          if (data && data.data) {
            const filteredUnions = data.data.filter((union: Union) => union.upazilla_id === selectedUpazillaId); // map 'upazila_id' from API
            setUnions(filteredUnions);
          } else {
             setUnions([]);
          }
        } catch (error) {
          console.error("Failed to fetch unions:", error);
          setUnions([]);
        }
        setLoadingUnions(false);
      };
      fetchUnions();
    } else {
      setUnions([]);
      form.setValue("unionId", "");
    }
  }, [selectedUpazillaId, form]);


  const handleFormSubmit = (values: AddressFormValues) => {
    const divisionName = divisions.find(d => d._id === values.divisionId)?.name || "";
    const districtName = districts.find(d => d._id === values.districtId)?.name || "";
    const upazillaName = upazillas.find(u => u._id === values.upazillaId)?.name || "";
    const unionName = unions.find(u => u._id === values.unionId)?.name || "";

    const fullAddress: ShippingAddress = {
      ...values,
      country: "Bangladesh",
      divisionName,
      districtName,
      upazillaName,
      unionName,
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
          name="divisionId"
          render={({ field }) => (
            <FormItem>
              <FormLabel>Division</FormLabel>
              <Select onValueChange={field.onChange} value={field.value} disabled={loadingDivisions}>
                <FormControl>
                  <SelectTrigger>
                    <SelectValue placeholder={loadingDivisions ? "Loading..." : "Select Division"} />
                  </SelectTrigger>
                </FormControl>
                <SelectContent>
                  {divisions.map(division => (
                    <SelectItem key={division._id} value={division._id}>{division.name}</SelectItem>
                  ))}
                </SelectContent>
              </Select>
              <FormMessage />
            </FormItem>
          )}
        />

        <FormField
          control={form.control}
          name="districtId"
          render={({ field }) => (
            <FormItem>
              <FormLabel>District</FormLabel>
              <Select onValueChange={field.onChange} value={field.value} disabled={!selectedDivisionId || loadingDistricts || districts.length === 0}>
                <FormControl>
                  <SelectTrigger>
                    <SelectValue placeholder={loadingDistricts ? "Loading..." : (districts.length === 0 && selectedDivisionId && !loadingDistricts ? "No districts found" : "Select District")} />
                  </SelectTrigger>
                </FormControl>
                <SelectContent>
                  {districts.map(district => (
                    <SelectItem key={district._id} value={district._id}>{district.name}</SelectItem>
                  ))}
                </SelectContent>
              </Select>
              <FormMessage />
            </FormItem>
          )}
        />

        <FormField
          control={form.control}
          name="upazillaId"
          render={({ field }) => (
            <FormItem>
              <FormLabel>Upazilla / Thana</FormLabel>
              <Select onValueChange={field.onChange} value={field.value} disabled={!selectedDistrictId || loadingUpazillas || upazillas.length === 0}>
                <FormControl>
                  <SelectTrigger>
                    <SelectValue placeholder={loadingUpazillas ? "Loading..." : (upazillas.length === 0 && selectedDistrictId && !loadingUpazillas ? "No upazillas found" : "Select Upazilla")} />
                  </SelectTrigger>
                </FormControl>
                <SelectContent>
                  {upazillas.map(upazilla => (
                    <SelectItem key={upazilla._id} value={upazilla._id}>{upazilla.name}</SelectItem>
                  ))}
                </SelectContent>
              </Select>
              <FormMessage />
            </FormItem>
          )}
        />

        <FormField
          control={form.control}
          name="unionId"
          render={({ field }) => (
            <FormItem>
              <FormLabel>Union / Ward</FormLabel>
              <Select onValueChange={field.onChange} value={field.value} disabled={!selectedUpazillaId || loadingUnions || unions.length === 0}>
                <FormControl>
                  <SelectTrigger>
                    <SelectValue placeholder={loadingUnions ? "Loading..." : (unions.length === 0 && selectedUpazillaId && !loadingUnions ? "No unions found" : "Select Union")} />
                  </SelectTrigger>
                </FormControl>
                <SelectContent>
                  {unions.map(unionItem => (
                    <SelectItem key={unionItem._id} value={unionItem._id}>{unionItem.name}</SelectItem>
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
