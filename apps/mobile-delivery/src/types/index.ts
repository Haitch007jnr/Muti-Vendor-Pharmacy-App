export interface Delivery {
  id: string;
  orderNumber: string;
  customerName: string;
  address: string;
  status: 'Assigned' | 'In Transit' | 'Delivered' | 'Failed';
  distance: string;
  customerPhone?: string;
  items?: DeliveryItem[];
  total?: number;
}

export interface DeliveryItem {
  id: string;
  name: string;
  quantity: number;
  price: number;
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
