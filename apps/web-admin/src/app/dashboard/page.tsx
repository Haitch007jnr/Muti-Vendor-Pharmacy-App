import { DashboardLayout } from '@/components/layout/DashboardLayout';
import { StatCard } from '@/components/dashboard/StatCard';
import { RecentOrders } from '@/components/dashboard/RecentOrders';
import { RevenueChart } from '@/components/dashboard/RevenueChart';

export default function DashboardPage() {
  return (
    <DashboardLayout>
      <div className="space-y-6">
        {/* Page Title */}
        <div>
          <h1 className="text-2xl font-bold text-gray-900">Dashboard</h1>
          <p className="text-sm text-gray-500 mt-1">
            Overview of your pharmacy platform performance
          </p>
        </div>

        {/* Stats Grid */}
        <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-4">
          <StatCard
            title="Total Revenue"
            value="₦328,000"
            change={12.5}
            icon="💰"
            trend="up"
          />
          <StatCard
            title="Total Orders"
            value="1,234"
            change={8.2}
            icon="📦"
            trend="up"
          />
          <StatCard
            title="Active Vendors"
            value="45"
            change={-2.4}
            icon="🏪"
            trend="down"
          />
          <StatCard
            title="Total Products"
            value="2,845"
            change={15.3}
            icon="💊"
            trend="up"
          />
        </div>

        {/* Charts and Tables */}
        <div className="grid gap-6 lg:grid-cols-3">
          <div className="lg:col-span-2">
            <RevenueChart />
          </div>
          <div>
            <RecentOrders />
          </div>
        </div>
      </div>
    </DashboardLayout>
  );
}
