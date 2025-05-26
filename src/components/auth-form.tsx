
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
import { useAuth } from "@/contexts/auth-context";
import { useRouter } from "next/navigation";
import { useState } from "react";
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert";
import { Loader2, AlertCircle } from "lucide-react";

const loginSchema = z.object({
  email: z.string().email({ message: "Invalid email address." }),
  password: z.string().min(6, { message: "Password must be at least 6 characters." }),
});

const registerSchema = z.object({
  name: z.string().min(2, { message: "Name must be at least 2 characters."}),
  email: z.string().email({ message: "Invalid email address." }),
  password: z.string().min(6, { message: "Password must be at least 6 characters." }),
});

type AuthFormProps = {
  mode: 'login' | 'register';
};

export function AuthForm({ mode }: AuthFormProps) {
  const { login, register } = useAuth();
  const router = useRouter();
  const [error, setError] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState(false);

  const formSchema = mode === 'login' ? loginSchema : registerSchema;
  type FormData = z.infer<typeof formSchema>;

  const form = useForm<FormData>({
    resolver: zodResolver(formSchema),
    defaultValues: mode === 'login' 
      ? { email: "", password: "" }
      : { name: "", email: "", password: "" },
  });

  async function onSubmit(values: FormData) {
    setIsLoading(true);
    setError(null);
    try {
      let user;
      if (mode === 'login') {
        user = await login(values.email, values.password);
      } else {
        // Ensure 'name' is present for registration
        const name = (values as z.infer<typeof registerSchema>).name;
        user = await register(name, values.email, values.password);
      }

      if (user) {
        router.push("/"); // Redirect to homepage on successful login/register
      } else {
        setError(mode === 'login' ? "Invalid email or password." : "Registration failed. User might already exist.");
      }
    } catch (err) {
      setError("An unexpected error occurred. Please try again.");
      console.error(err);
    } finally {
      setIsLoading(false);
    }
  }

  return (
    <Form {...form}>
      <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-6">
        {mode === 'register' && (
          <FormField
            control={form.control}
            name="name"
            render={({ field }) => (
              <FormItem>
                <FormLabel>Full Name</FormLabel>
                <FormControl>
                  <Input placeholder="John Doe" {...field} />
                </FormControl>
                <FormMessage />
              </FormItem>
            )}
          />
        )}
        <FormField
          control={form.control}
          name="email"
          render={({ field }) => (
            <FormItem>
              <FormLabel>Email</FormLabel>
              <FormControl>
                <Input type="email" placeholder="you@example.com" {...field} />
              </FormControl>
              <FormMessage />
            </FormItem>
          )}
        />
        <FormField
          control={form.control}
          name="password"
          render={({ field }) => (
            <FormItem>
              <FormLabel>Password</FormLabel>
              <FormControl>
                <Input type="password" placeholder="••••••••" {...field} />
              </FormControl>
              <FormMessage />
            </FormItem>
          )}
        />
        {error && (
          <Alert variant="destructive">
            <AlertCircle className="h-4 w-4" />
            <AlertTitle>Error</AlertTitle>
            <AlertDescription>{error}</AlertDescription>
          </Alert>
        )}
        <Button type="submit" className="w-full" disabled={isLoading}>
          {isLoading && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
          {mode === 'login' ? 'Log In' : 'Create Account'}
        </Button>
      </form>
    </Form>
  );
}
