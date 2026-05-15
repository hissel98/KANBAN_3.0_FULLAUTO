import type { Metadata } from "next";
import "./globals.css";

export const metadata: Metadata = {
  title: "Kanban 3.0",
  description: "Full-Auto Kanban Board",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en">
      <body className="antialiased">
        {children}
      </body>
    </html>
  );
}