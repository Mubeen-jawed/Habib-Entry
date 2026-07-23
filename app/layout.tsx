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
    default: "Imtehan — Habib entry test preparation, mocks, essay & interview",
    template: "%s",
  },
  description:
    "Free Habib University entry test preparation — Accuplacer mock tests, essay writing practice, mock interviews, and section-by-section practice for DSSE and AHSS applicants.",
  keywords: [
    "Habib entry test",
    "Habib mock test",
    "Habib test preparation",
    "Habib University DSSE entry test preparation",
    "Habib University AHSS test preparation",
    "Accuplacer practice test",
    "Accuplacer math practice",
    "Habib essay writing practice",
    "Habib admission interview preparation",
    "Habib scholarship test",
  ],
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
