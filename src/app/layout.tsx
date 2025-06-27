import type { Metadata } from "next";
import { Geist, Geist_Mono } from "next/font/google";
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
  title: "Dion Snoeijen – Senior Software Engineer / Tech Lead",
  description: "Technisch leider en full-stack developer met 20+ jaar ervaring. Gespecialiseerd in backend, DevOps en AI/no-code systemen.",
  openGraph: {
    title: "Dion Snoeijen – Senior Software Engineer",
    description: "Full-stack developer & tech lead met expertise in Python, Laravel, AWS en AI-integraties. Bekijk CV, projecten en contactinformatie.",
    url: "https://dionsnoeijen.nl",
    siteName: "Dion Snoeijen",
    locale: "nl_NL",
    type: "website",
  },
  twitter: {
    card: "summary_large_image",
    title: "Dion Snoeijen – Senior Software Engineer",
    description: "Technisch leider en full-stack developer met 20+ jaar ervaring. Bekijk CV, tech stack en projecten.",
  },
  metadataBase: new URL("https://dionsnoeijen.nl"),
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
        {children}
      </body>
    </html>
  );
}
