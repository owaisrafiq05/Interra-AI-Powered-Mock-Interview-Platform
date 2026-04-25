import type { Metadata } from "next";
import "./globals.css";
import { Poppins, Roboto } from "next/font/google";
import { Toaster } from "sonner";
import { ThemeProvider } from "@/store/ThemeProvider";
import { AuthProvider } from "@/store/AuthProvider";
import ReactQueryProvider from "@/store/ReactQueryProvider";

const poppins = Poppins({
  weight: ["300", "400", "500", "600", "700"],
  subsets: ["latin"],
  display: "swap",
  variable: "--font-poppins",
});

const roboto = Roboto({
  subsets: ["latin"],
  weight: ["300", "400", "500", "700"],
  display: "swap",
  variable: "--font-roboto",
});

export const metadata: Metadata = {
  title: "Interra — AI mock interviews",
  description:
    "Practice and screen with AI-driven interviews from a job description.",
};

export default function RootLayout({
  children,
}: Readonly<{ children: React.ReactNode }>) {
  return (
    <html lang="en" suppressHydrationWarning>
      <body
        className={`${poppins.className} ${roboto.variable} min-h-screen bg-bg text-text antialiased dark:bg-darkBg dark:text-darkText`}
      >
        <ReactQueryProvider>
          <AuthProvider>
            <ThemeProvider
              attribute="class"
              defaultTheme="system"
              enableSystem
              disableTransitionOnChange
            >
              <Toaster richColors position="top-right" />
              {children}
            </ThemeProvider>
          </AuthProvider>
        </ReactQueryProvider>
      </body>
    </html>
  );
}
