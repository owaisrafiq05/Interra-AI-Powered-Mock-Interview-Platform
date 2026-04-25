import Image from "next/image";
import { Mic } from "lucide-react";

export default function AuthLayout({
  children,
}: Readonly<{ children: React.ReactNode }>) {
  return (
    <div className="grid min-h-screen w-full md:grid-cols-2">
      <div className="relative hidden max-h-screen min-h-screen bg-neutral-900 md:block">
        <Image
          src="/images/auth-image.jpg"
          alt=""
          fill
          className="object-cover object-center"
          priority
          sizes="50vw"
        />
        <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-black/40 to-transparent" />
        <div className="absolute bottom-10 left-10 right-10 text-white">
          <Mic className="mb-4 size-10 opacity-90" />
          <p className="text-sm font-medium uppercase tracking-widest text-white/80">
            Interra
          </p>
          <h1 className="mt-2 text-3xl font-semibold leading-tight">
            AI interviews from your job description
          </h1>
        </div>
      </div>
      <div className="relative flex min-h-screen items-center justify-center bg-bg px-4 py-10 dark:bg-darkBg">
        <div className="absolute right-5 top-5 md:right-10 md:top-10">
          <Mic className="size-9 text-primaryCol" />
        </div>
        {children}
      </div>
    </div>
  );
}
