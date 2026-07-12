import { Timestamp } from "firebase/firestore";

/**
 * Address representation for shipping and billing
 */
export interface Address {
  id: string;
  street: string;
  city: string;
  state: string;
  postalCode: string;
  country: string;
  isDefault: boolean;
}

export interface ProductVariant {
  name: string;
  price: number;
  isAvailable?: boolean;
}

export interface ProductSize {
  name: string;
  price: number;
  priceMultiplier?: number;
}

/**
 * Product model stored in Firestore under /products
 */
export interface Product {
  id: string;
  name: string;
  description: string;
  price: number;
  image: string;
  category: "Cake" | "Savory" | "Pastry" | "Cookie" | "Custom";
  badge?: string;
  rating: number;
  reviewsCount: number;
  isAvailable: boolean;
  ingredients: string[];
  careInstructions: string;
  createdAt: Timestamp;
  updatedAt: Timestamp;
  videoUrl?: string;
  variants?: ProductVariant[];
  sizes?: ProductSize[];
  flavors?: (string | { name: string; price: number })[];
  icings?: (string | { name: string; price: number })[];
  defaultSize?: string;
  defaultFlavor?: string;
  defaultIcing?: string;
}

/**
 * User profile model stored in Firestore under /users
 */
export interface UserProfile {
  uid: string;
  email: string;
  displayName?: string;
  phoneNumber?: string;
  photoURL?: string;
  role: "customer" | "admin" | "baker";
  shippingAddresses: Address[];
  createdAt: Timestamp;
  updatedAt: Timestamp;
}

/**
 * Individual item details inside an order
 */
export interface OrderItem {
  productId: string;
  name: string;
  price: number;
  quantity: number;
  image: string;
}

/**
 * Payment details status and method
 */
export interface PaymentDetails {
  method: "stripe" | "cod" | "card" | "bank_deposit";
  paymentId?: string;
  status: "unpaid" | "paid" | "refunded";
}

/**
 * Customer order model stored in Firestore under /orders
 */
export interface Order {
  id: string;
  userId: string;
  items: OrderItem[];
  subtotal: number;
  tax: number;
  shippingFee: number;
  total: number;
  status: "pending" | "processing" | "baked" | "out-for-delivery" | "delivered" | "cancelled";
  shippingAddress: Address;
  paymentDetails: PaymentDetails;
  createdAt: Timestamp;
  updatedAt: Timestamp;
  billingDetails?: {
    firstName: string;
    lastName: string;
    country: string;
    zipCode?: string;
    phone: string;
    email: string;
  };
  fulfillment?: {
    type: "pickup" | "delivery";
    pickupDetails?: {
      branch: string;
      date: string;
      time: string;
    };
    deliveryDetails?: {
      firstName: string;
      lastName: string;
      address: string;
      city: string;
      phone: string;
      recipientPhone: string;
    };
  };
  orderNote?: string;
}

/**
 * Product review model stored in Firestore under /reviews
 */
export interface Review {
  id: string;
  productId: string;
  userId: string;
  userName: string;
  rating: number; // 1 to 5
  comment: string;
  createdAt: Timestamp;
}
