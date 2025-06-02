
'use client';

import React from 'react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
// import * as z from 'zod'; // z is imported via LoginCredentialsSchema
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from '@/components/ui/form';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { useAuth } from '@/context/AuthContext';
import { LoginCredentialsSchema, type LoginCredentials } from '@/lib/schemas'; // Updated import path
import { Loader2, LogInIcon } from 'lucide-react';

export default function LoginPage() {
  const { login, isLoading: isAuthLoading } = useAuth();

  const form = useForm<LoginCredentials>({
    resolver: zodResolver(LoginCredentialsSchema),
    defaultValues: {
      username: '',
      password: '',
    },
  });

  const onSubmit = async (values: LoginCredentials) => {
    await login(values);
  };

  return (
    <div className="flex items-center justify-center min-h-[calc(100vh-150px)] dir-rtl">
      <Card className="w-full max-w-md shadow-xl">
        <CardHeader className="text-center">
          <CardTitle className="text-3xl font-headline flex items-center justify-center">
            <LogInIcon className="ms-2 h-7 w-7 text-primary" />
            تسجيل الدخول
          </CardTitle>
          <CardDescription>الرجاء إدخال بيانات الاعتماد الخاصة بك للوصول إلى لوحة الإدارة.</CardDescription>
        </CardHeader>
        <CardContent>
          <Form {...form}>
            <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-6">
              <FormField
                control={form.control}
                name="username"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>اسم المستخدم</FormLabel>
                    <FormControl>
                      <Input placeholder="admin" {...field} />
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
                    <FormLabel>كلمة المرور</FormLabel>
                    <FormControl>
                      <Input type="password" placeholder="admin" {...field} />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
              <Button type="submit" disabled={isAuthLoading} className="w-full text-lg py-3">
                {isAuthLoading ? (
                  <Loader2 className="ms-2 h-5 w-5 animate-spin" />
                ) : (
                  <LogInIcon className="ms-2 h-5 w-5" />
                )}
                {isAuthLoading ? 'جاري التحقق...' : 'دخول'}
              </Button>
            </form>
          </Form>
        </CardContent>
      </Card>
    </div>
  );
}
