"use client";

import { useState } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import * as z from "zod";
import { apiClient } from "@/lib/api-client";
import { useAuthStore } from "@/stores/use-auth-store";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";

const loginSchema = z.object({
  email: z.string().email("Invalid email address"),
  password: z.string().min(6, "Password is too short"),
});

export default function LoginPage() {
  const { setUser } = useAuthStore();
  const [error, setError] = useState("");

  const { register, handleSubmit, formState: { isSubmitting } } = useForm<z.infer<typeof loginSchema>>({
    resolver: zodResolver(loginSchema),
  });

  const onSubmit = async (data: z.infer<typeof loginSchema>) => {
    setError("");
    try {
      const res = await apiClient.post("/auth/login", data);
      setUser(res.data.user);
      
      // Redirect based on role
      if (res.data.user.role === 'TEAM_MEMBER') {
        window.location.href = "/team";
      } else {
        window.location.href = "/admin";
      }
    } catch (err: any) {
      setError(err.response?.data?.message || "Invalid credentials. Have you seeded the database?");
    }
  };

  return (
    <div className="flex items-center justify-center min-h-screen bg-muted/40 p-4">
      <Card className="w-full max-w-md">
        <CardHeader className="text-center">
          <CardTitle className="text-2xl font-bold">Welcome Back</CardTitle>
          <CardDescription>Enter your credentials to access your account</CardDescription>
        </CardHeader>
        <CardContent>
          <div className="space-y-4">
            {error && <div className="p-3 text-sm text-destructive-foreground bg-destructive/10 border border-destructive/20 rounded-md">{error}</div>}
            <div className="space-y-2">
              <label className="text-sm font-medium">Email</label>
              <Input type="email" placeholder="admin@hexapixora.com" {...register("email")} required />
            </div>
            <div className="space-y-2">
              <div className="flex items-center justify-between">
                <label className="text-sm font-medium">Password</label>
              </div>
              <Input type="password" placeholder="••••••••" {...register("password")} required />
            </div>
            <Button type="button" className="w-full" disabled={isSubmitting} onClick={handleSubmit(onSubmit)}>
              {isSubmitting ? "Signing in..." : "Sign in"}
            </Button>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
