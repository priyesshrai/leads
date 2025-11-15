"use client";

import Link from "next/link";
import { ShieldAlert } from "lucide-react";

export default function UnauthorizedPage() {
  return (
    <div className="min-h-screen flex items-center justify-center bg-gray-100 dark:bg-gray-900 px-6">
      <div className="max-w-md w-full bg-white dark:bg-gray-800 shadow-lg rounded-2xl p-8 text-center">
        
        <div className="flex justify-center mb-4">
          <ShieldAlert className="h-16 w-16 text-red-500" />
        </div>

        <h1 className="text-3xl font-semibold text-gray-900 dark:text-white mb-2">
          Unauthorized Access
        </h1>

        <p className="text-gray-600 dark:text-gray-300 mb-6">
          You do not have permission to view this page.  
          Please contact your administrator if you believe this is a mistake.
        </p>

        <div className="space-y-3">
          <Link
            href="/login"
            className="block bg-red-600 hover:bg-red-700 text-white font-medium py-2 rounded-lg transition"
          >
            Go to Login
          </Link>

          <Link
            href="/"
            className="block bg-gray-200 dark:bg-gray-700 dark:text-white hover:bg-gray-300 dark:hover:bg-gray-600 font-medium py-2 rounded-lg transition"
          >
            Back to Home
          </Link>
        </div>
      </div>
    </div>
  );
}
