import type { Metadata } from "next";
import Link from "next/link";
import { Home } from "lucide-react";
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
      <body className="min-h-screen antialiased">
        <header className="sticky top-0 z-10 border-b border-border bg-background">
          <div className="container mx-auto flex h-14 max-w-2xl items-center px-4">
            <Link
              href="/"
              className="inline-flex items-center gap-2 text-foreground transition-opacity hover:opacity-80"
            >
              <Home className="h-5 w-5" />
              <span className="font-medium">Quiz</span>
            </Link>
          </div>
        </header>
        {children}
      </body>
    </html>
  );
}
