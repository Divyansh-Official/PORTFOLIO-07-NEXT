import type { Metadata } from "next";
import { Geist, Geist_Mono } from "next/font/google";
import { anurati } from "./fonts";
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
  title: "Divyansh Tiwari — Software Engineer",
  description:
    "Divyansh Tiwari — software engineer building backends, native apps, and award-style web experiences. Spring Boot · React Native · Three.js.",
  metadataBase: new URL("https://divyansh.dev"),
  openGraph: {
    title: "Divyansh Tiwari — Software Engineer",
    description:
      "Backend-first full-stack engineer. Spring Boot · React Native · Three.js.",
    type: "website",
  },
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
<head>
  <link rel="preconnect" href="https://fonts.googleapis.com" />
  <link rel="preconnect" href="https://fonts.gstatic.com" crossOrigin="anonymous" />
  <link
    href="https://fonts.googleapis.com/css2?family=Barlow+Condensed:wght@800&family=Geist+Mono:wght@500&family=Instrument+Sans:wght@400..700&family=Instrument+Serif:ital@0;1&family=Shippori+Mincho+B1:wght@500;700;800&family=Noto+Sans+JP:wght@400;700&display=swap"
    rel="stylesheet"
  />
</head>
<body className={`${anurati.variable} ${geistSans.variable} ${geistMono.variable} min-h-full flex flex-col`}>
  {children}
</body>    </html>
  );
}
