export type UserRole = 'buyer' | 'seller' | 'admin';

export interface User {
  uid: string;
  email: string;
  firstName: string;
  lastName: string;
  phone: string;
  role: UserRole;
  createdAt: Date;
  updatedAt: Date;
}

export interface Product {
  id: string;
  sellerId: string;
  name: string;
  category: 'Agric' | 'Livestock' | 'Clothes';
  price: number;
  unit: 'kg' | 'unit';
  imageUrl: string;
  availability: boolean;
  description: string;
  createdAt: Date;
}

export interface CartItem {
  productId: string;
  name: string;
  price: number;
  quantity: number;
  imageUrl: string;
  sellerId: string;
}

export interface Order {
  id: string;
  buyerId: string;
  sellerId: string;
  items: CartItem[];
  totalAmount: number;
  status: 'pending' | 'processing' | 'shipped' | 'delivered' | 'cancelled';
  trackingNumber: string;
  createdAt: Date;
  updatedAt: Date;
  deliveryTimeline: DeliveryEvent[];
}

export interface DeliveryEvent {
  status: string;
  timestamp: Date;
  location: string;
  description: string;
}