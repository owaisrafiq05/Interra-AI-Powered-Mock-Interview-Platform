import { z } from "zod";

export const loginSchema = z.object({
  email: z
    .string({ message: "Email is required*" })
    .min(1, { message: "Email is required*" })
    .email({ message: "Invalid email address" }),
  password: z
    .string({ message: "Password is required" })
    .min(1, { message: "Password is required*" })
    .min(6, { message: "Password must be atleast 6 characters" }),
});

export const registerSchema = z.object({
  name: z.string().min(1, "Name is required"),
  email: z.string().email("Invalid email"),
  password: z.string().min(6, "Password must be at least 6 characters"),
  role: z.enum(["employer", "candidate"], {
    required_error: "Choose employer or candidate",
  }),
  phone: z.string().optional(),
});
