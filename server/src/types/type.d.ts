import { Document } from "mongoose";
import { ROLES } from "../utils/constants";

export type Role = (typeof ROLES)[keyof typeof ROLES];

export interface IUser extends Document {
  email: string;
  password: string;
  phone: string;
  address?: string;
  name: string;
  role: "user" | "admin";
  avatar?: string;
  hasNotifications: boolean;
  isEmailVerified: boolean;
  comparePassword(candidatePassword: string): Promise<boolean>;
  generateAccessToken(): Promise<string>;
}
