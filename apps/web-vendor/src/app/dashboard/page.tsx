import { DashboardLayout } from '@/components/layout/DashboardLayout';

export default function VendorDashboardPage() {
  return (
    <DashboardLayout>
      <div className="space-y-6">
        {/* Page Title */}
        <div>
          <h1 className="text-2xl font-bold text-gray-900">Vendor Dashboard</h1>
          <p className="text-sm text-gray-500 mt-1">
            Overview of your pharmacy performance
          </p>
        </div>

        {/* Stats Grid */}
        <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-4">
          <div className="rounded-lg border border-gray-200 bg-white p-6 shadow-sm">
            <div className="flex items-center justify-between">
              <div className="flex-1">
                <p className="text-sm font-medium text-gray-600">Monthly Revenue</p>
                <p className="mt-2 text-3xl font-bold text-gray-900">₦67,000</p>
                <div className="mt-2 flex items-center gap-1">
                  <span className="text-sm font-medium text-green-600">↑ 15.3%</span>
                  <span className="text-xs text-gray-500">vs last month</span>
                </div>
              </div>
              <div className="flex h-12 w-12 items-center justify-center rounded-lg bg-green-50 text-2xl">
                💰
              </div>
            </div>
          </div>

          <div className="rounded-lg border border-gray-200 bg-white p-6 shadow-sm">
            <div className="flex items-center justify-between">
              <div className="flex-1">
                <p className="text-sm font-medium text-gray-600">Total Orders</p>
                <p className="mt-2 text-3xl font-bold text-gray-900">156</p>
                <div className="mt-2 flex items-center gap-1">
                  <span className="text-sm font-medium text-green-600">↑ 8.2%</span>
                  <span className="text-xs text-gray-500">vs last month</span>
                </div>
              </div>
              <div className="flex h-12 w-12 items-center justify-center rounded-lg bg-green-50 text-2xl">
                🛒
              </div>
            </div>
          </div>

          <div className="rounded-lg border border-gray-200 bg-white p-6 shadow-sm">
            <div className="flex items-center justify-between">
              <div className="flex-1">
                <p className="text-sm font-medium text-gray-600">Products</p>
                <p className="mt-2 text-3xl font-bold text-gray-900">342</p>
                <div className="mt-2 flex items-center gap-1">
                  <span className="text-sm font-medium text-green-600">↑ 5.1%</span>
                  <span className="text-xs text-gray-500">vs last month</span>
                </div>
              </div>
              <div className="flex h-12 w-12 items-center justify-center rounded-lg bg-green-50 text-2xl">
                💊
              </div>
            </div>
          </div>

          <div className="rounded-lg border border-gray-200 bg-white p-6 shadow-sm">
            <div className="flex items-center justify-between">
              <div className="flex-1">
                <p className="text-sm font-medium text-gray-600">Low Stock Items</p>
                <p className="mt-2 text-3xl font-bold text-gray-900">12</p>
                <div className="mt-2 flex items-center gap-1">
                  <span className="text-sm font-medium text-red-600">Needs attention</span>
                </div>
              </div>
              <div className="flex h-12 w-12 items-center justify-center rounded-lg bg-red-50 text-2xl">
                ⚠️
              </div>
            </div>
          </div>
        </div>

        {/* Recent Activity */}
        <div className="rounded-lg border border-gray-200 bg-white shadow-sm">
          <div className="border-b border-gray-200 px-6 py-4">
            <h3 className="text-lg font-semibold text-gray-900">Recent Orders</h3>
          </div>
          <div className="p-6">
            <p className="text-sm text-gray-500">Your recent orders will appear here</p>
          </div>
        </div>
      </div>
    </DashboardLayout>
  );
}
