export interface Product {
  id: string;
  name: string;
  price: number;
  image: string;
  description?: string;
  dosage?: string;
  category?: string;
}

export interface CartItem {
  id: string;
  name: string;
  price: number;
  quantity: number;
  image: string;
}

export interface Order {
  id: string;
  orderNumber: string;
  date: string;
  status: 'Pending' | 'Processing' | 'In Transit' | 'Delivered' | 'Cancelled';
  total: number;
  items: number;
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
