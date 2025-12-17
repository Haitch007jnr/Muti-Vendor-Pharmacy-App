import Link from 'next/link';

export default function Home() {
  return (
    <div className="flex min-h-screen flex-col items-center justify-center bg-gradient-to-b from-green-50 to-white">
      <div className="text-center">
        <div className="mb-8 text-6xl">🏪</div>
        <h1 className="mb-4 text-4xl font-bold text-gray-900">
          Pharmacy Vendor Portal
        </h1>
        <p className="mb-8 text-lg text-gray-600">
          Multi-Vendor Pharmacy Platform - Manage Your Store
        </p>
        
        <div className="flex gap-4 justify-center">
          <Link
            href="/dashboard"
            className="rounded-lg bg-green-600 px-6 py-3 text-base font-medium text-white hover:bg-green-700 transition-colors"
          >
            Go to Dashboard
          </Link>
          <Link
            href="/login"
            className="rounded-lg border border-gray-300 bg-white px-6 py-3 text-base font-medium text-gray-700 hover:bg-gray-50 transition-colors"
          >
            Login
          </Link>
        </div>

        <div className="mt-12 text-sm text-gray-500">
          <p>Version 1.0.0 | Phase 8: Web Applications</p>
        </div>
      </div>
    </div>
  );
}
