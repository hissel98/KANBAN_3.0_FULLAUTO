import type { Metadata } from "next";
import { Geist, Geist_Mono } from "next/font/google";
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

const appModeScript = `
(() => {
  const isAndroidQuery = new URLSearchParams(window.location.search).get('app') === 'android';
  const isNative = typeof window.Capacitor?.isNativePlatform === 'function' && window.Capacitor.isNativePlatform();
  if (isAndroidQuery || isNative) {
    document.documentElement.classList.add('app-android');
  }
})();
`;

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html
      lang="en"
      className={`${geistSans.variable} ${geistMono.variable} h-full antialiased`}
      suppressHydrationWarning
    >
      <head>
        <script dangerouslySetInnerHTML={{ __html: appModeScript }} />
      </head>
      <body className="min-h-full flex flex-col">
        <SessionTimeout />
        {children}
      </body>
    </html>
  );
}
