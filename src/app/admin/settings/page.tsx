
'use client';

import React, { useState, useEffect, useTransition } from 'react';
import { useForm, useForm as useUserForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import * as z from 'zod';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from '@/components/ui/form';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
  TableCaption,
} from '@/components/ui/table';
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from '@/components/ui/alert-dialog';
import {
  getRestaurantNameAction,
  updateRestaurantNameAction,
  getUsersAction,
  addUserAction,
  deleteUserAction,
} from '@/app/actions';
import { AddUserSchema, type AddUserFormValues } from '@/lib/schemas';
import type { User as AuthUser } from '@/types';
import { useToast } from '@/hooks/use-toast';
import { Loader2, Save, SettingsIcon, Users, UserPlus, Trash2 } from 'lucide-react';
import { useAuth } from '@/context/AuthContext';


const restaurantSettingsFormSchema = z.object({
  restaurantName: z.string().min(2, { message: "اسم المطعم يجب أن يتكون من حرفين على الأقل." }),
});
type RestaurantSettingsFormValues = z.infer<typeof restaurantSettingsFormSchema>;

export default function AdminSettingsPage() {
  const { toast } = useToast();
  const { currentUser } = useAuth();
  const [currentRestaurantName, setCurrentRestaurantName] = useState<string>('');
  const [isLoadingName, startLoadingNameTransition] = useTransition();
  const [isUpdatingName, startUpdatingNameTransition] = useTransition();

  const [users, setUsers] = useState<AuthUser[]>([]);
  const [isLoadingUsers, startLoadingUsersTransition] = useTransition();
  const [isAddingUser, startAddingUserTransition] = useTransition();
  const [isDeletingUser, startDeletingUserTransition] = useTransition();
  const [userToDelete, setUserToDelete] = useState<AuthUser | null>(null);

  const restaurantForm = useForm<RestaurantSettingsFormValues>({
    resolver: zodResolver(restaurantSettingsFormSchema),
    defaultValues: {
      restaurantName: '',
    },
  });

  const userForm = useUserForm<AddUserFormValues>({
    resolver: zodResolver(AddUserSchema),
    defaultValues: {
      username: '',
      password: '',
      role: 'cashier',
    },
  });

  const fetchCurrentRestaurantName = React.useCallback(() => {
    startLoadingNameTransition(async () => {
      try {
        const name = await getRestaurantNameAction();
        setCurrentRestaurantName(name);
        restaurantForm.reset({ restaurantName: name });
      } catch (error) {
        toast({
          title: 'خطأ في تحميل اسم المطعم',
          description: 'لم نتمكن من جلب اسم المطعم الحالي.',
          variant: 'destructive',
        });
      }
    });
  }, [toast, restaurantForm]);

  const fetchUsers = React.useCallback(() => {
    startLoadingUsersTransition(async () => {
      try {
        const fetchedUsers = await getUsersAction();
        setUsers(fetchedUsers);
      } catch (error) {
        toast({
          title: 'خطأ في تحميل المستخدمين',
          description: 'فشل تحميل قائمة المستخدمين.',
          variant: 'destructive',
        });
      }
    });
  }, [toast]);

  useEffect(() => {
    fetchCurrentRestaurantName();
    fetchUsers();
  }, [fetchCurrentRestaurantName, fetchUsers]);

  const onRestaurantNameSubmit = async (values: RestaurantSettingsFormValues) => {
    startUpdatingNameTransition(async () => {
      try {
        const result = await updateRestaurantNameAction(values.restaurantName);
        if ('error' in result) {
          toast({
            title: 'خطأ في تحديث الاسم',
            description: result.error,
            variant: 'destructive',
          });
        } else {
          toast({
            title: 'نجاح!',
            description: `تم تحديث اسم المطعم إلى "${result.restaurantName}".`,
          });
          setCurrentRestaurantName(result.restaurantName);
        }
      } catch (error) {
        toast({
          title: 'خطأ في تحديث الاسم',
          description: 'حدث خطأ غير متوقع أثناء تحديث اسم المطعم.',
          variant: 'destructive',
        });
      }
    });
  };

  const onAddUserSubmit = async (values: AddUserFormValues) => {
    startAddingUserTransition(async () => {
      try {
        const result = await addUserAction(values);
        if (result.success && result.user) {
          setUsers((prevUsers) => [...prevUsers, result.user!].sort((a,b) => a.username.localeCompare(b.username)));
          userForm.reset();
          toast({ title: 'نجاح!', description: `تمت إضافة المستخدم "${result.user.username}" بنجاح.` });
        } else {
          toast({ title: 'خطأ في إضافة المستخدم', description: result.error || 'فشل إضافة المستخدم.', variant: 'destructive' });
        }
      } catch (error) {
        toast({ title: 'خطأ', description: 'فشل إضافة المستخدم.', variant: 'destructive' });
      }
    });
  };

  const openDeleteUserDialog = (user: AuthUser) => {
    setUserToDelete(user);
  };

  const confirmDeleteUser = async () => {
    if (!userToDelete) return;
    startDeletingUserTransition(async () => {
      try {
        const result = await deleteUserAction(userToDelete.id);
        if (result.success) {
          setUsers((prevUsers) => prevUsers.filter((u) => u.id !== userToDelete.id));
          toast({ title: 'نجاح!', description: 'تم حذف المستخدم بنجاح.' });
        } else {
          toast({ title: 'خطأ في الحذف', description: result.error || 'فشل حذف المستخدم.', variant: 'destructive' });
        }
      } catch (error) {
        toast({ title: 'خطأ في الحذف', description: 'حدث خطأ غير متوقع.', variant: 'destructive' });
      } finally {
        setUserToDelete(null);
      }
    });
  };
  
  const getRoleDisplayName = (role: 'admin' | 'cashier') => {
    return role === 'admin' ? 'مدير' : 'كاشير';
  };

  return (
    <div className="container mx-auto py-8 px-4 md:px-6 dir-rtl space-y-8">
      <Card className="shadow-lg">
        <CardHeader>
          <CardTitle className="text-2xl font-headline flex items-center">
            <SettingsIcon className="ms-2 h-6 w-6 text-primary" />
            إعدادات التطبيق
          </CardTitle>
          <CardDescription>
            قم بتعديل الإعدادات العامة لنظام نقاط البيع الخاص بك.
          </CardDescription>
        </CardHeader>
        <CardContent>
          {isLoadingName ? (
            <div className="flex items-center justify-center py-8">
              <Loader2 className="h-8 w-8 animate-spin text-primary" />
              <p className="ms-3 text-muted-foreground">جاري تحميل الإعدادات...</p>
            </div>
          ) : (
            <Form {...restaurantForm}>
              <form onSubmit={restaurantForm.handleSubmit(onRestaurantNameSubmit)} className="space-y-6">
                <FormField
                  control={restaurantForm.control}
                  name="restaurantName"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>اسم المطعم</FormLabel>
                      <FormControl>
                        <Input placeholder="ادخل اسم المطعم هنا" {...field} />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />
                <Button type="submit" disabled={isUpdatingName} className="w-full md:w-auto">
                  {isUpdatingName ? (
                    <Loader2 className="ms-2 h-4 w-4 animate-spin" />
                  ) : (
                    <Save className="ms-2 h-4 w-4" />
                  )}
                  {isUpdatingName ? 'جاري الحفظ...' : 'حفظ اسم المطعم'}
                </Button>
              </form>
            </Form>
          )}
        </CardContent>
      </Card>

      <Card className="shadow-lg">
        <CardHeader>
          <CardTitle className="text-2xl font-headline flex items-center">
            <Users className="ms-2 h-6 w-6 text-primary" />
            إدارة المستخدمين
          </CardTitle>
          <CardDescription>إضافة مستخدمين جدد وتعديل صلاحياتهم.</CardDescription>
        </CardHeader>
        <CardContent className="space-y-6">
          <Form {...userForm}>
            <form onSubmit={userForm.handleSubmit(onAddUserSubmit)} className="p-4 border rounded-lg space-y-4 bg-muted/20">
              <h3 className="text-lg font-semibold flex items-center">
                <UserPlus className="ms-2 h-5 w-5 text-primary" />
                إضافة مستخدم جديد
              </h3>
              <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                <FormField
                  control={userForm.control}
                  name="username"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>اسم المستخدم</FormLabel>
                      <FormControl>
                        <Input placeholder="مثال: cashier1" {...field} />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />
                <FormField
                  control={userForm.control}
                  name="password"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>كلمة المرور</FormLabel>
                      <FormControl>
                        <Input type="password" placeholder="****" {...field} />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />
                <FormField
                  control={userForm.control}
                  name="role"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>الصلاحية</FormLabel>
                      <Select onValueChange={field.onChange} defaultValue={field.value}>
                        <FormControl>
                          <SelectTrigger>
                            <SelectValue placeholder="اختر صلاحية" />
                          </SelectTrigger>
                        </FormControl>
                        <SelectContent>
                          <SelectItem value="cashier">كاشير (نقطة بيع فقط)</SelectItem>
                          <SelectItem value="admin">مدير (كامل الصلاحيات)</SelectItem>
                        </SelectContent>
                      </Select>
                      <FormMessage />
                    </FormItem>
                  )}
                />
              </div>
              <Button type="submit" disabled={isAddingUser}>
                {isAddingUser ? <Loader2 className="ms-2 h-4 w-4 animate-spin" /> : <UserPlus className="ms-2 h-4 w-4" />}
                {isAddingUser ? 'جاري الإضافة...' : 'إضافة مستخدم'}
              </Button>
            </form>
          </Form>

          <div>
            <h3 className="text-lg font-semibold mb-2">قائمة المستخدمين الحاليين</h3>
            {isLoadingUsers ? (
              <div className="flex items-center justify-center py-8">
                <Loader2 className="h-8 w-8 animate-spin text-primary" />
                <p className="ms-3 text-muted-foreground">جاري تحميل المستخدمين...</p>
              </div>
            ) : users.length > 0 ? (
              <Table>
                <TableCaption>قائمة بجميع المستخدمين المسجلين في النظام.</TableCaption>
                <TableHeader>
                  <TableRow>
                    <TableHead>اسم المستخدم</TableHead>
                    <TableHead>الصلاحية</TableHead>
                    <TableHead className="text-center">إجراء</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {users.map((user) => (
                    <TableRow key={user.id}>
                      <TableCell>{user.username}</TableCell>
                      <TableCell>{getRoleDisplayName(user.role)}</TableCell>
                      <TableCell className="text-center">
                        <Button
                          variant="ghost"
                          size="icon"
                          onClick={() => openDeleteUserDialog(user)}
                          disabled={isDeletingUser && userToDelete?.id === user.id || user.id === currentUser?.id}
                          className="text-destructive hover:text-destructive/80"
                          aria-label={`حذف المستخدم ${user.username}`}
                        >
                          {isDeletingUser && userToDelete?.id === user.id ? (
                            <Loader2 className="h-4 w-4 animate-spin" />
                          ) : (
                            <Trash2 className="h-4 w-4" />
                          )}
                        </Button>
                      </TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            ) : (
              <p className="text-muted-foreground text-center py-6">لا يوجد مستخدمون مسجلون حاليًا (عدا المدير الافتراضي إذا كان هذا هو الحساب الوحيد).</p>
            )}
          </div>
        </CardContent>
      </Card>

      {userToDelete && (
        <AlertDialog open={!!userToDelete} onOpenChange={(open) => !open && setUserToDelete(null)}>
          <AlertDialogContent>
            <AlertDialogHeader>
              <AlertDialogTitle>هل أنت متأكد من الحذف؟</AlertDialogTitle>
              <AlertDialogDescription>
                سيتم حذف المستخدم "{userToDelete.username}" نهائياً. لا يمكن التراجع عن هذا الإجراء.
              </AlertDialogDescription>
            </AlertDialogHeader>
            <AlertDialogFooter>
              <AlertDialogCancel onClick={() => setUserToDelete(null)}>إلغاء</AlertDialogCancel>
              <AlertDialogAction onClick={confirmDeleteUser} disabled={isDeletingUser} className="bg-destructive hover:bg-destructive/90">
                {isDeletingUser ? <Loader2 className="ms-2 h-4 w-4 animate-spin" /> : <Trash2 className="ms-2 h-4 w-4" />}
                {isDeletingUser ? "جاري الحذف..." : "حذف المستخدم"}
              </AlertDialogAction>
            </AlertDialogFooter>
          </AlertDialogContent>
        </AlertDialog>
      )}
    </div>
  );
}
