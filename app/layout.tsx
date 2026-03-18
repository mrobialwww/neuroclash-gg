import type { Metadata } from "next";
import { Baloo_2 } from "next/font/google";
import { Toaster } from "sonner";
import Image from "next/image";
import "./globals.css";

const baloo2 = Baloo_2({
  variable: "--font-baloo-2",
  subsets: ["latin"],
  weight: ["400", "500", "600", "700", "800"],
  display: "swap",
});

export const metadata: Metadata = {
  title: "NeuroClash GG",
  description: "NeuroClash GG - AI-powered quiz platform",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en">
      <body className={`${baloo2.variable} antialiased relative min-h-screen`}>
        {/* Scrolling Background Container */}
        <div className="absolute inset-0 -z-50 w-full h-full overflow-hidden">
          <Image
            src="/background.webp"
            alt="Background"
            fill
            priority
            sizes="100vw"
            className="object-cover"
          />
        </div>

        {/* Konten Utama */}
        <div className="relative z-0">
          {children}
        </div>

        <Toaster richColors position="top-right" />
      </body>
    </html>
  );
}