"use client";
import { Suspense } from "react";
import { loginSchema } from "@/validations/auth.validation";
import { SubmitHandler, useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { loginUser } from "@/API/auth.api";
import { useMutation } from "@tanstack/react-query";
import { toast } from "sonner";
import { useAuth } from "@/store/AuthProvider";
import { useRouter, useSearchParams } from "next/navigation";
import { z } from "zod";
import Link from "next/link";
import { Button } from "@/components/ui/button";
import { FloatingInput } from "@/components/ui/FloatingInput";
import { PasswordInput } from "@/components/ui/PasswordInput";

function LoginForm() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const { setUser } = useAuth();

  const { mutateAsync } = useMutation({
    mutationFn: loginUser,
  });

  const {
    register,
    handleSubmit,
    formState: { errors, isSubmitting },
  } = useForm<z.infer<typeof loginSchema>>({
    resolver: zodResolver(loginSchema),
  });

  const onSubmit: SubmitHandler<z.infer<typeof loginSchema>> = async (data) => {
    const { response, success } = await mutateAsync(data);
    if (success) {
      setUser(response.user);
      if (response.token) {
        localStorage.setItem("token", response.token);
      }
      toast.success("Logged in");
      const next = searchParams.get("next");
      if (next && next.startsWith("/")) {
        router.push(next);
        return;
      }
      if (response.user?.role === "employer") {
        router.push("/employer/dashboard");
      } else {
        router.push("/candidate/dashboard");
      }
    } else toast.error(response as string);
  };

  return (
    <section className="z-10 mx-auto w-full max-w-lg max-xs:px-4">
      <h2 className="text-center text-4xl font-bold">Log in</h2>
      <p className="mt-4 text-center text-sm text-neutral-500">
        Access your Interra employer or candidate workspace
      </p>
      <form
        className="z-10 mt-8 flex max-w-md flex-col gap-y-6 rounded-3xl bg-bg p-2 sm:p-8 dark:bg-darkBg"
        onSubmit={handleSubmit(onSubmit)}
      >
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
        <Button
          type="submit"
          className="rounded-lg bg-primaryCol py-6 text-[16px] text-darkText hover:bg-primaryCol/90"
          size="lg"
          disabled={isSubmitting}
        >
          Log in
        </Button>
        <p className="text-center text-sm text-neutral-500">
          No account?{" "}
          <Link href="/register" className="text-primaryCol underline">
            Register
          </Link>
        </p>
      </form>
    </section>
  );
}

export default function LoginPage() {
  return (
    <Suspense
      fallback={
        <div className="flex justify-center py-20 text-sm text-neutral-500">
          Loading…
        </div>
      }
    >
      <LoginForm />
    </Suspense>
  );
}
