import type { Metadata } from "next";
import { Geist, Geist_Mono } from "next/font/google";
import { cookies } from "next/headers";
import { SessionTimeout } from "@/components/SessionTimeout";
import "./globals.css";

const geistSans = Geist({
  variable: "--font-geist-sans",
  subsets: ["latin"],
});

const geistMono = Geist_Mono({
  variable: "--font-geist-mono",
  subsets: ["latin"],
});

export const metadata: Metadata = {
  title: "Project Management",
  description: "Kanban board for project management",
};

export default async function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  const cookieStore = await cookies();
  const isAndroidApp = cookieStore.get("app_mode")?.value === "android";

  return (
    <html
      lang="en"
      className={`${geistSans.variable} ${geistMono.variable} h-full antialiased${isAndroidApp ? " app-android" : ""}`}
    >
      <body className="min-h-full flex flex-col">
        <SessionTimeout />
        {children}
      </body>
    </html>
  );
}
