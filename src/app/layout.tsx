import type { Metadata } from "next";
import "./globals.css";

export const metadata: Metadata = {
  title: "AI-Powered Knowledge Quiz Builder",
  description: "Generate and take AI-powered quizzes on any topic",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en">
      <body className="min-h-screen antialiased">{children}</body>
    </html>
  );
}
