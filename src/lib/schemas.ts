
import { z } from 'zod';

export const LoginCredentialsSchema = z.object({
  username: z.string().min(1, "اسم المستخدم مطلوب"),
  password: z.string().min(1, "كلمة المرور مطلوبة"),
});
export type LoginCredentials = z.infer<typeof LoginCredentialsSchema>;
