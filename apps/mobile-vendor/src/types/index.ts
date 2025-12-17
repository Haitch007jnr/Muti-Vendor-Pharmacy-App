export interface Order {
  id: string;
  orderNumber: string;
  status: 'Pending' | 'Processing' | 'Completed' | 'Cancelled';
  total: number;
  items?: number;
  customerId?: string;
  customerName?: string;
  createdAt?: string;
}

export interface InventoryItem {
  id: string;
  name: string;
  stock: number;
  lowStock: boolean;
  price?: number;
  sku?: string;
  category?: string;
}

export interface ScreenProps {
  navigation: {
    navigate: (screen: string, params?: Record<string, unknown>) => void;
    goBack: () => void;
  };
  route?: {
    params?: Record<string, unknown>;
  };
}
