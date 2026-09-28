import type { Metadata } from "next";
import "./globals.css";

export const metadata: Metadata = {
  title: "DHA Overstay Appeal | VFS Global",
  description: "Prototype: Department of Home Affairs Overstay Appeal Management System",
};

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="en">
      <body className="antialiased">{children}</body>
    </html>
  );
}
