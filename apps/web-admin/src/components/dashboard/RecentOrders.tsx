'use client';

interface RecentOrder {
  id: string;
  orderNumber: string;
  customer: string;
  amount: number;
  status: 'pending' | 'completed' | 'cancelled';
  date: string;
}

const mockOrders: RecentOrder[] = [
  {
    id: '1',
    orderNumber: 'ORD-001',
    customer: 'John Doe',
    amount: 15000,
    status: 'completed',
    date: '2024-12-17',
  },
  {
    id: '2',
    orderNumber: 'ORD-002',
    customer: 'Jane Smith',
    amount: 25000,
    status: 'pending',
    date: '2024-12-17',
  },
  {
    id: '3',
    orderNumber: 'ORD-003',
    customer: 'Bob Johnson',
    amount: 18000,
    status: 'completed',
    date: '2024-12-16',
  },
  {
    id: '4',
    orderNumber: 'ORD-004',
    customer: 'Alice Williams',
    amount: 32000,
    status: 'pending',
    date: '2024-12-16',
  },
];

const statusStyles = {
  pending: 'bg-yellow-100 text-yellow-800',
  completed: 'bg-green-100 text-green-800',
  cancelled: 'bg-red-100 text-red-800',
};

export function RecentOrders() {
  return (
    <div className="rounded-lg border border-gray-200 bg-white shadow-sm">
      <div className="border-b border-gray-200 px-6 py-4">
        <h3 className="text-lg font-semibold text-gray-900">Recent Orders</h3>
      </div>
      
      <div className="divide-y divide-gray-200">
        {mockOrders.map((order) => (
          <div key={order.id} className="px-6 py-4">
            <div className="flex items-center justify-between">
              <div className="flex-1">
                <div className="flex items-center gap-3">
                  <span className="font-medium text-gray-900">
                    {order.orderNumber}
                  </span>
                  <span
                    className={`inline-flex items-center rounded-full px-2.5 py-0.5 text-xs font-medium ${
                      statusStyles[order.status]
                    }`}
                  >
                    {order.status}
                  </span>
                </div>
                <p className="mt-1 text-sm text-gray-500">{order.customer}</p>
              </div>
              
              <div className="text-right">
                <p className="font-semibold text-gray-900">
                  ₦{order.amount.toLocaleString()}
                </p>
                <p className="text-xs text-gray-500">{order.date}</p>
              </div>
            </div>
          </div>
        ))}
      </div>
      
      <div className="border-t border-gray-200 px-6 py-4">
        <a
          href="/dashboard/orders"
          className="text-sm font-medium text-primary-600 hover:text-primary-700"
        >
          View all orders →
        </a>
      </div>
    </div>
  );
}
