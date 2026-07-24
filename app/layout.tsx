import type { Metadata } from "next";
import { Geist, Geist_Mono } from "next/font/google";
import "./globals.css";
import { ProfileWidget } from "@/components/profile-widget";
import { AdminViewToggle } from "@/components/admin-view-toggle";

const geistSans = Geist({
  variable: "--font-geist-sans",
  subsets: ["latin"],
});

const geistMono = Geist_Mono({
  variable: "--font-geist-mono",
  subsets: ["latin"],
});

export const metadata: Metadata = {
  metadataBase: new URL("https://imtehan.pk"),
  title: {
    default: "Imtehan, the free Habib University admissions app",
    template: "%s",
  },
  description:
    "Imtehan is the free Habib University admissions app, built and maintained by current Habib students.",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html
      lang="en"
      className={`${geistSans.variable} ${geistMono.variable} h-full antialiased`}
    >
      <body className="min-h-full flex flex-col">
        {children}
        <ProfileWidget />
        <AdminViewToggle />
      </body>
    </html>
  );
}
