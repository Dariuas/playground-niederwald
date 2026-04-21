import type { Metadata } from "next";
import { Geist } from "next/font/google";
import "./globals.css";
import Navbar from "@/components/Navbar";
import Footer from "@/components/Footer";
import { CartProvider } from "@/context/CartContext";
import { ThemeProvider } from "@/context/ThemeContext";
import ThemeToggle from "@/components/ThemeToggle";

const geist = Geist({ subsets: ["latin"] });

export const metadata: Metadata = {
  title: "The Playground @niederwald",
  description:
    "All the fun in one place. Train rides, jumping blob, food trucks, live music, pavilion rentals, and more — Niederwald, TX.",
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="en">
      <body className={`${geist.className} bg-amber-50 text-stone-900`}>
        <ThemeProvider>
          <CartProvider>
            <Navbar />
            <main>{children}</main>
            <Footer />
            <ThemeToggle />
          </CartProvider>
        </ThemeProvider>
      </body>
    </html>
  );
}
