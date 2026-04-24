import { Schema, models, model, Model } from "mongoose";
import validator from "validator";
import bcrypt from "bcrypt";
import jwt from "jsonwebtoken";
import { ROLES } from "../utils/constants";
import { IUser } from "../types/type";
import mongoosePaginate from "mongoose-paginate-v2";

const UserSchema = new Schema<IUser>(
  {
    email: {
      type: String,
      required: [true, "Email is required"],
      unique: true as any,
      validate: validator.isEmail,
      trim: true,
      lowercase: true,
    },
    password: {
      type: String,
      required: [true, "Password is required"],
      minlength: [6, "Password must be at least 6 characters"],
    },
    phone: {
      type: String,
      trim: true,
    },
    name: {
      type: String,
      required: [true, "Name is required"],
      trim: true,
    },
    address: String,
    role: {
      type: String,
      enum: Object.values(ROLES),
      required: [true, "Role is required"],
    },
    avatar: String,
    hasNotifications: {
      type: Boolean,
      default: false,
    },
    isEmailVerified: {
      type: Boolean,
      default: false,
    },
  },
  {
    timestamps: true,
  }
);

UserSchema.pre<IUser>("save", async function (next) {
  if (!this.isModified("password")) return next();
  this.password = await bcrypt.hash(this.password, 10);
  next();
});

UserSchema.methods.comparePassword = async function (
  password: string
): Promise<boolean> {
  return await bcrypt.compare(password, this.password);
};

UserSchema.methods.generateAccessToken = async function (): Promise<string> {
  const secret =
    process.env.ACCESS_TOKEN_SECRET || process.env.JWT_SECRET;
  if (!secret) throw new Error("ACCESS_TOKEN_SECRET or JWT_SECRET must be set");
  return jwt.sign(
    {
      _id: this._id,
      email: this.email,
      role: this.role,
    },
    secret,
    {
      expiresIn: process.env.ACCESS_TOKEN_EXPIRY || "15d",
    }
  );
};

UserSchema.plugin(mongoosePaginate);

export const User: Model<IUser> =
  models.User || model<IUser>("User", UserSchema);
