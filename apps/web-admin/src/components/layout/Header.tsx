'use client';

export function Header() {
  return (
    <header className="sticky top-0 z-40 flex h-16 items-center gap-4 border-b border-gray-200 bg-white px-6">
      <div className="flex flex-1 items-center justify-between">
        <div>
          <h2 className="text-lg font-semibold text-gray-900">
            Welcome back!
          </h2>
          <p className="text-sm text-gray-500">
            Here's what's happening with your pharmacy today.
          </p>
        </div>

        <div className="flex items-center gap-4">
          {/* Notifications */}
          <button className="relative rounded-lg p-2 text-gray-500 hover:bg-gray-100 hover:text-gray-900">
            <span className="text-xl">🔔</span>
            <span className="absolute right-1 top-1 h-2 w-2 rounded-full bg-red-500"></span>
          </button>

          {/* User menu */}
          <button className="flex items-center gap-2 rounded-lg px-3 py-2 text-sm font-medium text-gray-700 hover:bg-gray-100">
            <div className="flex h-8 w-8 items-center justify-center rounded-full bg-primary-100 text-primary-600 font-semibold text-xs">
              AD
            </div>
            <span>Admin</span>
          </button>
        </div>
      </div>
    </header>
  );
}
