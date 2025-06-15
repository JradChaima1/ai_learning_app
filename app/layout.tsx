import type { Metadata } from "next";
import { Geist, Geist_Mono } from "next/font/google";
import "./globals.css";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import Link from "next/link";
import { Toaster } from "react-hot-toast";
import { Providers } from "./providers";
import SignOutButton from "./components/SignOutButton";

const geistSans = Geist({
  variable: "--font-geist-sans",
  subsets: ["latin"],
});

const geistMono = Geist_Mono({
  variable: "--font-geist-mono",
  subsets: ["latin"],
});

export const metadata: Metadata = {
  title: "AI Learning Platform",
  description: "Learn with AI-generated courses and voice quizzes",
};

export default async function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  const session = await getServerSession(authOptions);

  return (
    <html lang="en">
      <body className={`${geistSans.variable} ${geistMono.variable} antialiased`}>
        <Providers>
          <header className="bg-white shadow-sm">
            <nav className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-4 flex justify-between items-center">
              <Link href="/" className="text-xl font-bold">
                AI Learning Platform
              </Link>
              <div className="flex items-center space-x-4">
                {session?.user ? (
                  <>
                    <Link href="/courses" className="text-gray-700 hover:text-gray-900">
                      My Courses
                    </Link>
                    <Link href="/courses/create" className="text-gray-700 hover:text-gray-900">
                      Create Course
                    </Link>
                    <div className="flex items-center space-x-3">
                      <span className="text-sm text-gray-600">
                        Welcome, {session.user.name || session.user.email}
                      </span>
                      <SignOutButton />
                    </div>
                  </>
                ) : (
                  <Link href="/auth/signin" className="text-gray-700 hover:text-gray-900">
                    Sign In
                  </Link>
                )}
              </div>
            </nav>
          </header>
          <Toaster position="top-center" />
          {children}
        </Providers>
      </body>
    </html>
  );
}
