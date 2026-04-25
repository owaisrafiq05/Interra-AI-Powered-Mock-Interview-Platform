"use client";

import { useId } from "react";
import { cn } from "@/lib/utils";
import type { FieldValues, Path, UseFormRegister } from "react-hook-form";

interface Props<T extends FieldValues = FieldValues>
  extends React.TextareaHTMLAttributes<HTMLTextAreaElement> {
  register?: UseFormRegister<T>;
  isError?: boolean;
  errorMessage?: string;
}

export function Textarea<T extends FieldValues = FieldValues>({
  rows = 5,
  name,
  id,
  placeholder,
  className,
  register,
  isError,
  errorMessage,
  ...rest
}: Props<T>) {
  const autoId = useId();
  const inputId = id ?? (typeof name === "string" && name ? name : autoId);
  const rhfProps =
    register != null && name != null
      ? register(name as Path<T>)
      : ({} as React.TextareaHTMLAttributes<HTMLTextAreaElement>);

  return (
    <div className="relative w-full">
      <textarea
        {...rest}
        {...rhfProps}
        rows={rows}
        id={inputId}
        className={cn(
          "z-[1] font-roboto relative px-2.5 pb-2.5 pt-2.5 w-full text-sm text-lightGray bg-transparent rounded-lg border border-borderCol dark:border-neutral-800 appearance-none focus:outline-none focus:ring-0 focus:border-primaryCol dark:focus:border-primaryCol peer",
          isError && "border-red-500 focus:border-red-500",
          className
        )}
        placeholder=""
        aria-invalid={isError || undefined}
      />
      <label
        htmlFor={inputId}
        className={cn(
          "z-[1] font-roboto absolute text-sm text-gray-400 duration-300 transform -translate-y-4 scale-75 top-2 origin-[0] bg-bg dark:bg-darkBg px-2 peer-focus:px-2 peer-focus:text-primaryCol peer-placeholder-shown:scale-100 peer-placeholder-shown:-translate-y-1/2 peer-placeholder-shown:top-5 peer-focus:top-2 peer-focus:scale-75 peer-focus:-translate-y-4 rtl:peer-focus:translate-x-1/4 rtl:peer-focus:left-auto start-1 pointer-events-none",
          isError && "text-red-500 peer-focus:text-red-500"
        )}
      >
        {isError ? errorMessage : placeholder}
      </label>
    </div>
  );
}
