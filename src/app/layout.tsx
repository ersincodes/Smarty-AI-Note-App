import type { Metadata } from "next";
import { Imprima, Inter } from "next/font/google";

import { ClerkProvider } from "@clerk/nextjs";

import "./globals.css";
import { ThemeProvider } from "./ThemeProvider";
import ThemeToggleButton from "@/components/ThemeToggleButton";

const inter = Inter({ subsets: ["latin"] });

export const metadata: Metadata = {
  title: "Smarty",
  description: "The intelligent self-development app",
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <ClerkProvider>
      <html lang="en">
        <body className={inter.className}>
          <ThemeProvider attribute="class">{children}</ThemeProvider>
        </body>
      </html>
    </ClerkProvider>
  );
}
