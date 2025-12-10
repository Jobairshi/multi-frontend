import type { Metadata } from "next";
import { Geist, Geist_Mono } from "next/font/google";
import "./globals.css";
import ReduxProvider from "@/components/providers/ReduxProvider";
import ReactQueryProvider from "@/components/providers/ReactQueryProvider";
import AuthInitializer from "@/components/providers/AuthInitializer";
import ServiceWorkerManager from "@/components/providers/ServiceWorkerManager";
import Navbar from "@/components/layout/Navbar";

const geistSans = Geist({
  variable: "--font-geist-sans",
  subsets: ["latin"],
});

const geistMono = Geist_Mono({
  variable: "--font-geist-mono",
  subsets: ["latin"],
});

export const metadata: Metadata = {
  title: "Multi-Layered Cache - News App",
  description: "News application with multi-layered caching",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en">
      <body
        className={`${geistSans.variable} ${geistMono.variable} antialiased`}
      >
        <ReduxProvider>
          <ReactQueryProvider>
            <AuthInitializer>
              <ServiceWorkerManager />
              <Navbar />
              <main className="min-h-screen bg-zinc-50 dark:bg-black">
                <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
                  {children}
                </div>
              </main>
            </AuthInitializer>
          </ReactQueryProvider>
        </ReduxProvider>
      </body>
    </html>
  );
}
