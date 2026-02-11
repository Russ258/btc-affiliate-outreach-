import type { Metadata } from "next";
import Link from "next/link";
import "./globals.css";

export const metadata: Metadata = {
  title: "BTC Affiliate Outreach",
  description: "Affiliate outreach management system for The Bitcoin Conference",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en">
      <body>
        <div className="min-h-screen bg-gray-50">
          <nav className="bg-white shadow-sm border-b">
            <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
              <div className="flex justify-between h-16">
                <div className="flex">
                  <div className="flex-shrink-0 flex items-center">
                    <h1 className="text-xl font-bold text-orange-600">
                      BTC Affiliate Outreach
                    </h1>
                  </div>
                  <div className="hidden sm:ml-8 sm:flex sm:space-x-8">
                    <Link
                      href="/"
                      className="inline-flex items-center px-1 pt-1 text-sm font-medium text-gray-900 hover:text-orange-600"
                    >
                      Dashboard
                    </Link>
                    <Link
                      href="/daily-queue"
                      className="inline-flex items-center px-1 pt-1 text-sm font-medium text-gray-700 hover:text-orange-600"
                    >
                      Daily Queue
                    </Link>
                    <Link
                      href="/contacts"
                      className="inline-flex items-center px-1 pt-1 text-sm font-medium text-gray-700 hover:text-orange-600"
                    >
                      Contacts
                    </Link>
                    <Link
                      href="/calendar"
                      className="inline-flex items-center px-1 pt-1 text-sm font-medium text-gray-700 hover:text-orange-600"
                    >
                      Calendar
                    </Link>
                    <Link
                      href="/emails"
                      className="inline-flex items-center px-1 pt-1 text-sm font-medium text-gray-700 hover:text-orange-600"
                    >
                      Emails
                    </Link>
                    <Link
                      href="/settings"
                      className="inline-flex items-center px-1 pt-1 text-sm font-medium text-gray-700 hover:text-orange-600"
                    >
                      Settings
                    </Link>
                  </div>
                </div>
              </div>
            </div>
          </nav>
          <main className="max-w-7xl mx-auto py-6 sm:px-6 lg:px-8">
            {children}
          </main>
        </div>
      </body>
    </html>
  );
}
