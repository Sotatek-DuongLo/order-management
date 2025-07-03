export interface IOrder {
  id: string;
  userId: string;
  totalAmount: string;
  status: EOrderStatus;
  items?: Array<{
    id: number;
    name: string;
    quantity: number;
    price: number;
  }> | null;
  paymentId?: string | null;
  deliveryAddress?: string | null;
  notes?: string | null;
  createdAt: string;
  updatedAt: string;
  onClick?: () => void;
}

export interface IProduct {
  id: number;
  name: string;
  price: number;
  description?: string;
  createdAt: string;
  updatedAt: string;
}

export interface IPayment {
  id: string;
  orderId: string;
  userId: string;
  amount: number;
  status: EPaymentStatus;
  transactionId?: string;
  paymentMethod?: string;
  message?: string;
  createdAt: string;
  updatedAt: string;
}

export interface ICreateOrderDto {
  userId: string;
  totalAmount: number;
  items?: Array<{
    productId: string;
    quantity: number;
    price: number;
  }>;
  deliveryAddress?: string;
  notes?: string;
}

export interface IUpdateOrderDto {
  status?: EOrderStatus;
  deliveryAddress?: string;
  notes?: string;
}

export interface ICreateProductDto {
  name: string;
  price: number;
  description?: string;
}

export interface IUpdateProductDto {
  name?: string;
  price?: number;
  description?: string;
}

export interface IProcessPaymentDto {
  orderId: string;
  userId: string;
  amount: number;
  authToken: string;
  pin: string;
}

export interface IPaymentResponse {
  paymentId: string;
  status: EPaymentStatus;
  message?: string;
  transactionId?: string;
}

export interface IOrderStatus {
  id: string;
  status: EOrderStatus;
  updatedAt: string;
}

export interface IApiResponse<T> {
  success: boolean;
  data?: T;
  message?: string;
  errorCode?: string;
}

export interface IDataWithMeta<T> {
  data: T;
  meta: {
    totalPage: number;
    totalItems: number;
    currentPage: number;
    pageSize?: number;
  };
}

export enum EOrderStatus {
  CREATED = "created",
  CONFIRMED = "confirmed", 
  DELIVERED = "delivered",
  CANCELLED = "cancelled"
}

export enum EPaymentStatus {
  SUCCESS = 'success',
  FAILED = 'failed'
}
