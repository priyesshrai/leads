import { z } from "zod"

export const loginSchema = z.object({
  email: z
    .string({ message: "Email is required" })
    .trim()
    .email("Please enter a valid email address")
    .min(5, "Email must be at least 5 characters")
    .max(100, "Email too long"),
  password: z.string().optional()
})

export const createAccountUserSchema = z.object({
  name: z
    .string({ message: "Contact person name is required" })
    .trim()
    .min(2, "Name must be at least 2 characters long")
    .max(50, "Name too long"),

  email: z
    .string({ message: "Email is required" })
    .trim()
    .email("Please enter a valid email address")
    .min(5, "Email must be at least 5 characters")
    .max(100, "Email too long"),

  password: z
    .string({ message: "Password is required" })
    .trim()
    .min(8, "Password must be at least 8 characters long")
    .max(64, "Password too long")
    .regex(/[A-Z]/, "Password must contain an uppercase letter")
    .regex(/[a-z]/, "Password must contain a lowercase letter")
    .regex(/[0-9]/, "Password must contain a number"),

  businessName: z
    .string({ message: "Business name is required" })
    .trim()
    .min(2, "Business name must be at least 2 characters"),

  phone: z
    .string()
    .trim()
    .max(15, "Phone number too long")
    .optional(),

  location: z
    .string()
    .trim()
    .max(200, "Location too long")
    .optional(),
});

export type LoginSchema = z.infer<typeof loginSchema>
export type UserSchema = z.infer<typeof createAccountUserSchema>

export type LoginReturn = {
  success: boolean;
  token: string;
}

export const resetPasswordSchema = z.object({
  password: z
    .string({ message: "Password is required" })
    .trim()
    .min(8, "Password must be at least 8 characters long")
    .max(64, "Password too long")
    .regex(/[A-Z]/, "Password must contain an uppercase letter")
    .regex(/[a-z]/, "Password must contain a lowercase letter")
    .regex(/[0-9]/, "Password must contain a number")
})

export const forgetPasswordEMail = z.object({
  email: z
    .string({ message: "Email is required" })
    .trim()
    .email("Please enter a valid email address")
    .min(5, "Email must be at least 5 characters")
    .max(100, "Email too long"),
})

export interface Account {
  id: string;
  businessName: string | null;
  phone: string | null;
  location: string | null;
  email: string;
  createdAt: Date;
}

export interface AuthUser {
  id: string;
  name: string;
  email: string;
  accountId: string;
  account: Account;
  initials: string;
}

