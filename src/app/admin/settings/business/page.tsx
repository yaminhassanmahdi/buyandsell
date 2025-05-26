
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
import { Briefcase, Palette, Image as ImageIcon, Loader2, Save } from "lucide-react";
import { useToast } from "@/hooks/use-toast";
import useLocalStorage from "@/hooks/use-local-storage";
import type { BusinessSettings } from "@/lib/types";
import { DEFAULT_BUSINESS_SETTINGS, BUSINESS_SETTINGS_STORAGE_KEY, APP_NAME } from "@/lib/constants";
import { useEffect } from "react";

const businessSettingsSchema = z.object({
  appName: z.string().min(2, "App name is required."),
  logoUrl: z.string().url({ message: "Please enter a valid URL for the logo." }).or(z.literal("")).optional(),
  primaryColor: z.string().regex(/^(\d{1,3}\s\d{1,3}%\s\d{1,3}%|#[0-9a-fA-F]{6})$/, "Enter a valid HSL (e.g., 217 91% 60%) or HEX color (e.g., #3B82F6).").optional(),
  secondaryColor: z.string().regex(/^(\d{1,3}\s\d{1,3}%\s\d{1,3}%|#[0-9a-fA-F]{6})$/, "Enter a valid HSL (e.g., 216 34% 90%) or HEX color (e.g., #E0E7FF).").optional(),
  faviconUrl: z.string().url({ message: "Please enter a valid URL for the favicon." }).or(z.literal("")).optional(),
});

type BusinessSettingsFormData = z.infer<typeof businessSettingsSchema>;

export default function AdminBusinessSettingsPage() {
  const { toast } = useToast();
  const [settings, setSettings] = useLocalStorage<BusinessSettings>(
    BUSINESS_SETTINGS_STORAGE_KEY,
    DEFAULT_BUSINESS_SETTINGS
  );
  
  const form = useForm<BusinessSettingsFormData>({
    resolver: zodResolver(businessSettingsSchema),
    defaultValues: settings,
  });

  useEffect(() => {
    form.reset(settings);
    // Update document title and global APP_NAME constant if appName changes in settings
    if (settings.appName && settings.appName !== APP_NAME) {
        document.title = `${settings.appName} - Admin`; // Or a more generic title update
        // Note: Directly mutating imported APP_NAME is not a good practice for reactivity.
        // This would ideally be handled via context or a more dynamic configuration system.
        // For this mock, we acknowledge the setting but its global effect is limited.
    }

  }, [settings, form]);

  const onSubmit = (data: BusinessSettingsFormData) => {
    const newSettings: BusinessSettings = {
        appName: data.appName || DEFAULT_BUSINESS_SETTINGS.appName,
        logoUrl: data.logoUrl || DEFAULT_BUSINESS_SETTINGS.logoUrl,
        primaryColor: data.primaryColor || DEFAULT_BUSINESS_SETTINGS.primaryColor,
        secondaryColor: data.secondaryColor || DEFAULT_BUSINESS_SETTINGS.secondaryColor,
        faviconUrl: data.faviconUrl || DEFAULT_BUSINESS_SETTINGS.faviconUrl,
    };
    setSettings(newSettings);

    // Dynamically update CSS variables for colors if they are HSL
    // This is a simplified approach. A more robust solution might involve a theme context.
    if (newSettings.primaryColor && newSettings.primaryColor.includes(' ')) { // Basic HSL check
        document.documentElement.style.setProperty('--primary', newSettings.primaryColor);
    }
    if (newSettings.secondaryColor && newSettings.secondaryColor.includes(' ')) {
        document.documentElement.style.setProperty('--secondary', newSettings.secondaryColor);
    }

    toast({
      title: "Settings Updated",
      description: "Business settings have been successfully saved.",
    });
  };

  return (
    <div className="space-y-8 py-4">
      <h1 className="text-3xl font-bold flex items-center gap-3">
        <Briefcase className="h-8 w-8 text-primary"/>
        Business Settings
      </h1>
      <Card>
        <CardHeader>
          <CardTitle>Customize Your Platform</CardTitle>
          <CardDescription>
            Update your application's name, logo, colors, and favicon.
            Color changes (HSL format) will attempt to update live. Other changes may require a refresh.
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
                    <FormControl>
                      <Input placeholder="e.g., My Awesome Shop" {...field} />
                    </FormControl>
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
                    <FormLabel>Logo URL</FormLabel>
                    <FormControl>
                      <Input placeholder="https://example.com/logo.png" {...field} />
                    </FormControl>
                     <FormDescription>Full URL to your site logo. Leave blank for default.</FormDescription>
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
                    <FormControl>
                      <Input placeholder="e.g., 217 91% 60% or #3B82F6" {...field} />
                    </FormControl>
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
                    <FormControl>
                      <Input placeholder="e.g., 216 34% 90% or #E0E7FF" {...field} />
                    </FormControl>
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
                    <FormLabel>Favicon URL</FormLabel>
                    <FormControl>
                      <Input placeholder="https://example.com/favicon.ico" {...field} />
                    </FormControl>
                    <FormDescription>Full URL to your site favicon. Leave blank for default. (May require browser refresh to see changes)</FormDescription>
                    <FormMessage />
                  </FormItem>
                )}
              />
              <Button type="submit" disabled={form.formState.isSubmitting}>
                {form.formState.isSubmitting ? (
                  <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                ) : (
                  <Save className="mr-2 h-4 w-4" />
                )}
                Save Settings
              </Button>
            </form>
          </Form>
        </CardContent>
      </Card>
    </div>
  );
}
