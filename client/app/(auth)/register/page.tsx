"use client";
import { registerSchema } from "@/validations/auth.validation";
import { SubmitHandler, useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { registerUser } from "@/API/auth.api";
import { useMutation } from "@tanstack/react-query";
import { toast } from "sonner";
import { useRouter } from "next/navigation";
import { z } from "zod";
import Link from "next/link";
import { Button } from "@/components/ui/button";
import { FloatingInput } from "@/components/ui/FloatingInput";
import { PasswordInput } from "@/components/ui/PasswordInput";
const RegisterPage = () => {
  const router = useRouter();
  const { mutateAsync, isPending } = useMutation({
    mutationFn: registerUser,
  });

  const {
    register,
    handleSubmit,
    formState: { errors, isSubmitting },
  } = useForm<z.infer<typeof registerSchema>>({
    resolver: zodResolver(registerSchema),
    defaultValues: { role: "candidate" },
  });

  const onSubmit: SubmitHandler<z.infer<typeof registerSchema>> = async (
    data
  ) => {
    const { success, response } = await mutateAsync(data);
    if (success) {
      toast.success("Account created — log in to continue");
      router.push("/login");
    } else toast.error(response as string);
  };

  return (
    <section className="z-10 mx-auto w-full max-w-lg max-xs:px-4">
      <h2 className="text-center text-4xl font-bold">Register</h2>
      <p className="mt-4 text-center text-sm text-neutral-500">
        Choose whether you are hiring or practicing interviews
      </p>
      <form
        className="z-10 mt-8 flex max-w-md flex-col gap-y-5 rounded-3xl bg-bg p-2 sm:p-8 dark:bg-darkBg"
        onSubmit={handleSubmit(onSubmit)}
      >
        <div className="space-y-2">
          <label className="text-sm font-medium text-text dark:text-darkText">
            I am a
          </label>
          <select
            {...register("role")}
            className="w-full rounded-lg border border-neutral-300 bg-transparent px-3 py-3 text-sm dark:border-neutral-700"
          >
            <option value="candidate">Candidate — practice interviews</option>
            <option value="employer">Employer — screen applicants</option>
          </select>
          {errors.role && (
            <p className="text-[12px] text-red-500">{errors.role.message}</p>
          )}
        </div>

        <div className="relative">
          <FloatingInput
            placeholder="Full name"
            type="text"
            name="name"
            register={register}
          />
          {errors.name && (
            <span className="absolute mt-1 text-[12px] text-red-500">
              {errors.name.message}
            </span>
          )}
        </div>
        <div className="relative">
          <FloatingInput
            placeholder="Email"
            type="email"
            name="email"
            register={register}
          />
          {errors.email && (
            <span className="absolute mt-1 text-[12px] text-red-500">
              {errors.email.message}
            </span>
          )}
        </div>
        <div className="relative mb-1 w-full">
          <PasswordInput
            placeholder="Password"
            type="password"
            name="password"
            register={register}
          />
          {errors.password && (
            <span className="absolute mt-1 text-[12px] text-red-500">
              {errors.password.message}
            </span>
          )}
        </div>
        <div className="relative">
          <FloatingInput
            placeholder="Phone (optional)"
            type="text"
            name="phone"
            register={register}
          />
        </div>
        <Button
          type="submit"
          className="rounded-lg bg-primaryCol py-6 text-[16px] text-darkText hover:bg-primaryCol/90"
          size="lg"
          disabled={isSubmitting || isPending}
        >
          Create account
        </Button>
        <p className="text-center text-sm text-neutral-500">
          Already registered?{" "}
          <Link href="/login" className="text-primaryCol underline">
            Log in
          </Link>
        </p>
      </form>
    </section>
  );
};

export default RegisterPage;
