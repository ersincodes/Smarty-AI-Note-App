import type { Metadata } from "next";
import { Imprima, Montserrat } from "next/font/google";

import { ClerkProvider } from "@clerk/nextjs";

import "./globals.css";
import { ThemeProvider } from "./ThemeProvider";
import ThemeToggleButton from "@/components/ThemeToggleButton";

const montserrat = Montserrat({
  weight: ["400", "500", "600", "700"],
  style: ["normal", "italic"],
  subsets: ["latin"],
});
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
        <body className={montserrat.className}>
          <ThemeProvider attribute="class">{children}</ThemeProvider>
        </body>
      </html>
    </ClerkProvider>
  );
}
