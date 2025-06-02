
import { z } from 'zod';

export const LoginCredentialsSchema = z.object({
  username: z.string().min(1, "اسم المستخدم مطلوب"),
  password: z.string().min(1, "كلمة المرور مطلوبة"),
});
export type LoginCredentials = z.infer<typeof LoginCredentialsSchema>;

export const AddUserSchema = z.object({
  username: z.string().min(3, "اسم المستخدم يجب أن يكون 3 أحرف على الأقل."),
  password: z.string().min(4, "كلمة المرور يجب أن تكون 4 أحرف على الأقل."),
  role: z.enum(['admin', 'cashier'], {
    errorMap: () => ({ message: "الرجاء اختيار صلاحية صحيحة." }),
  }),
});
export type AddUserFormValues = z.infer<typeof AddUserSchema>;
