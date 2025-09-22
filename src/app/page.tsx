import Link from 'next/link';
import { Search, Shield } from 'lucide-react';

export default function Home() {
  return (
    <div className="min-h-screen bg-gradient-to-b from-blue-50 to-white">
      <nav className="bg-white shadow-sm border-b">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between h-16 items-center">
            <div className="flex items-center">
              <Shield className="w-8 h-8 text-blue-600 mr-2" />
              <span className="text-xl font-bold text-gray-900">ClaimCare</span>
            </div>
            <div className="flex space-x-4">
              <Link href="/track-claim" className="text-gray-700 hover:text-blue-600 px-3 py-2 rounded-md text-sm font-medium">
                Track Status
              </Link>
              <Link href="/cms" className="text-gray-700 hover:text-blue-600 px-3 py-2 rounded-md text-sm font-medium">
                CMS Portal
              </Link>
            </div>
          </div>
        </div>
      </nav>

      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
        <div className="text-center mb-12">
          <h1 className="text-4xl font-bold text-gray-900 mb-4">
            Insurance Claim Management Portal
          </h1>
          <p className="text-xl text-gray-600">
            Submit and track your insurance claims with ease
          </p>
        </div>

        <div className="flex justify-center mb-12">
          <Link href="/track-claim" className="group">
            <div className="bg-white rounded-lg shadow-lg p-8 hover:shadow-xl transition-shadow max-w-md">
              <div className="flex items-center mb-4">
                <Search className="w-12 h-12 text-green-600 group-hover:scale-110 transition-transform" />
                <h2 className="text-2xl font-bold text-gray-900 ml-4">Track Your Claim</h2>
              </div>
              <p className="text-gray-600 mb-4">
                Check the status and progress of your submitted claims
              </p>
              <div className="text-green-600 font-medium group-hover:underline">
                Check Status →
              </div>
            </div>
          </Link>
        </div>

        <div className="bg-white rounded-lg shadow-lg p-8">
          <h3 className="text-xl font-bold text-gray-900 mb-4">Required Documents by Claim Type</h3>
          <div className="grid md:grid-cols-3 gap-6">
            <div>
              <h4 className="font-semibold text-gray-800 mb-2">Life Insurance</h4>
              <ul className="text-sm text-gray-600 space-y-1">
                <li>• Death Certificate</li>
                <li>• Policy Document</li>
                <li>• Beneficiary ID</li>
                <li>• Medical Records</li>
              </ul>
            </div>
            <div>
              <h4 className="font-semibold text-gray-800 mb-2">Critical Illness</h4>
              <ul className="text-sm text-gray-600 space-y-1">
                <li>• Medical Diagnosis</li>
                <li>• Hospital Records</li>
                <li>• Doctor's Statement</li>
                <li>• Lab Reports</li>
              </ul>
            </div>
            <div>
              <h4 className="font-semibold text-gray-800 mb-2">Accident</h4>
              <ul className="text-sm text-gray-600 space-y-1">
                <li>• Police Report</li>
                <li>• Medical Report</li>
                <li>• Accident Photos</li>
                <li>• Witness Statements</li>
              </ul>
            </div>
          </div>
        </div>
      </main>
    </div>
  );
}
