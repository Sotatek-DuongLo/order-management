import { fetcher, fetcherWithMetadata } from "./Fetcher";
import {
  IOrder,
  IProduct,
  IPayment,
  ICreateOrderDto,
  IUpdateOrderDto,
  ICreateProductDto,
  IUpdateProductDto,
  IProcessPaymentDto,
  IPaymentResponse,
  IOrderStatus,
  IDataWithMeta,
} from "../types";

// Order Service API paths
const orderPaths = {
  orders: "/orders",
  orderById: (id: string) => `/orders/${id}`,
  orderStatus: (id: string) => `/orders/${id}/status`,
  orderCancel: (id: string) => `/orders/${id}/cancel`,
  ordersByUser: (userId: string) => `/orders/user/${userId}`,
  products: "/products",
  productById: (id: number) => `/products/${id}`,
};

// Payment Service API paths
const paymentPaths = {
  processPayment: "/payments/process",
  payments: "/payments",
  paymentById: (id: string) => `/payments/${id}`,
  paymentStatus: (id: string) => `/payments/${id}/status`,
  paymentsByOrder: (orderId: string) => `/payments/order/${orderId}`,
  paymentsByUser: (userId: string) => `/payments/user/${userId}`,
};

// Order API functions
function getOrders(params?: any): Promise<IDataWithMeta<IOrder[]>> {
  return fetcherWithMetadata({
    url: orderPaths.orders,
    method: "GET",
    params,
  });
}

function getOrderById(id: string): Promise<IOrder> {
  return fetcher({
    url: orderPaths.orderById(id),
    method: "GET",
  });
}

function createOrder(orderData: ICreateOrderDto): Promise<IOrder> {
  return fetcher({
    url: orderPaths.orders,
    method: "POST",
    data: orderData,
  });
}

function updateOrder(id: string, orderData: IUpdateOrderDto): Promise<IOrder> {
  return fetcher({
    url: orderPaths.orderById(id),
    method: "PATCH",
    data: orderData,
  });
}

function cancelOrder(id: string): Promise<IOrder> {
  return fetcher({
    url: orderPaths.orderCancel(id),
    method: "PATCH",
  });
}

function deleteOrder(id: string): Promise<void> {
  return fetcher({
    url: orderPaths.orderById(id),
    method: "DELETE",
  });
}

function getOrderStatus(id: string): Promise<IOrderStatus> {
  return fetcher({
    url: orderPaths.orderStatus(id),
    method: "GET",
  });
}

function getOrdersByUser(userId: string): Promise<IOrder[]> {
  return fetcher({
    url: orderPaths.ordersByUser(userId),
    method: "GET",
  });
}

// Product API functions
function getProducts(params?: any): Promise<IProduct[]> {
  return fetcher({
    url: orderPaths.products,
    method: "GET",
    params,
  });
}

function getProductById(id: number): Promise<IProduct> {
  return fetcher({
    url: orderPaths.productById(id),
    method: "GET",
  });
}

function createProduct(productData: ICreateProductDto): Promise<IProduct> {
  return fetcher({
    url: orderPaths.products,
    method: "POST",
    data: productData,
  });
}

function updateProduct(id: number, productData: IUpdateProductDto): Promise<IProduct> {
  return fetcher({
    url: orderPaths.productById(id),
    method: "PATCH",
    data: productData,
  });
}

function deleteProduct(id: number): Promise<void> {
  return fetcher({
    url: orderPaths.productById(id),
    method: "DELETE",
  });
}

// Payment API functions
function processPayment(paymentData: IProcessPaymentDto): Promise<IPaymentResponse> {
  return fetcher({
    url: paymentPaths.processPayment,
    method: "POST",
    data: paymentData,
  });
}

function getPayments(params?: any): Promise<IPayment[]> {
  return fetcher({
    url: paymentPaths.payments,
    method: "GET",
    params,
  });
}

function getPaymentById(id: string): Promise<IPayment> {
  return fetcher({
    url: paymentPaths.paymentById(id),
    method: "GET",
  });
}

function getPaymentStatus(id: string): Promise<IPaymentResponse> {
  return fetcher({
    url: paymentPaths.paymentStatus(id),
    method: "GET",
  });
}

function getPaymentsByOrder(orderId: string): Promise<IPayment[]> {
  return fetcher({
    url: paymentPaths.paymentsByOrder(orderId),
    method: "GET",
  });
}

function getPaymentsByUser(userId: string): Promise<IPayment[]> {
  return fetcher({
    url: paymentPaths.paymentsByUser(userId),
    method: "GET",
  });
}

export default {
  // Order functions
  getOrders,
  getOrderById,
  createOrder,
  updateOrder,
  cancelOrder,
  deleteOrder,
  getOrderStatus,
  getOrdersByUser,
  
  // Product functions
  getProducts,
  getProductById,
  createProduct,
  updateProduct,
  deleteProduct,
  
  // Payment functions
  processPayment,
  getPayments,
  getPaymentById,
  getPaymentStatus,
  getPaymentsByOrder,
  getPaymentsByUser,
};
