'use client';

import { useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { AlertCircle } from 'lucide-react';

export default function SubmitClaimPage() {
  const router = useRouter();

  useEffect(() => {
    // Redirect to home page after showing message
    const timer = setTimeout(() => {
      router.push('/');
    }, 3000);

    return () => clearTimeout(timer);
  }, [router]);

  return (
    <div className="min-h-screen bg-gray-50 flex items-center justify-center px-4">
      <div className="max-w-md w-full bg-white rounded-lg shadow-lg p-8 text-center">
        <div className="flex justify-center mb-4">
          <AlertCircle className="w-16 h-16 text-yellow-500" />
        </div>
        <h1 className="text-2xl font-bold text-gray-900 mb-4">
          Service Temporarily Unavailable
        </h1>
        <p className="text-gray-600 mb-6">
          The claim submission service is currently under maintenance.
          Please contact our customer service team to submit your claim.
        </p>
        <div className="bg-blue-50 border border-blue-200 rounded-lg p-4 mb-6">
          <h3 className="font-semibold text-blue-900 mb-2">Contact Information</h3>
          <p className="text-blue-700 text-sm">
            Phone: +62-21-1500-123<br />
            Email: claims@insurance.com<br />
            Hours: Mon-Fri 9AM-5PM WIB
          </p>
        </div>
        <p className="text-sm text-gray-500">
          You will be redirected to the homepage in a few seconds...
        </p>
      </div>
    </div>
  );
}