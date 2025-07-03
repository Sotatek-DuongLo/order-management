import mitt, { Emitter } from 'mitt';
import { EOrderStatus } from '@/types';

// Define event types
export interface EventMap {
  'order:created': { orderId: string; userId: string };
  'order:updated': { orderId: string; status: EOrderStatus; previousStatus: EOrderStatus };
  'order:cancelled': { orderId: string; userId: string };
  'order:confirmed': { orderId: string; userId: string };
  'order:delivered': { orderId: string; userId: string };
  'order:status-changed': { orderId: string; newStatus: EOrderStatus; oldStatus: EOrderStatus };
  'orders:refresh': void;
  'notification:show': { message: string; type: 'success' | 'error' | 'info' | 'warning' };
}

// Create event bus instance
export const eventBus: Emitter<EventMap> = mitt<EventMap>();

// Helper functions for common events
export const orderEvents = {
  // Emit events
  created: (orderId: string, userId: string) => {
    eventBus.emit('order:created', { orderId, userId });
    eventBus.emit('orders:refresh');
  },

  updated: (orderId: string, status: EOrderStatus, previousStatus: EOrderStatus) => {
    eventBus.emit('order:updated', { orderId, status, previousStatus });
    eventBus.emit('order:status-changed', { orderId, newStatus: status, oldStatus: previousStatus });
    eventBus.emit('orders:refresh');
  },

  cancelled: (orderId: string, userId: string) => {
    eventBus.emit('order:cancelled', { orderId, userId });
    eventBus.emit('orders:refresh');
  },

  confirmed: (orderId: string, userId: string) => {
    eventBus.emit('order:confirmed', { orderId, userId });
    eventBus.emit('orders:refresh');
  },

  delivered: (orderId: string, userId: string) => {
    eventBus.emit('order:delivered', { orderId, userId });
    eventBus.emit('orders:refresh');
  },

  // Subscribe to events
  onCreated: (handler: (data: { orderId: string; userId: string }) => void) => {
    eventBus.on('order:created', handler);
    return () => eventBus.off('order:created', handler);
  },

  onUpdated: (handler: (data: { orderId: string; status: EOrderStatus; previousStatus: EOrderStatus }) => void) => {
    eventBus.on('order:updated', handler);
    return () => eventBus.off('order:updated', handler);
  },

  onStatusChanged: (handler: (data: { orderId: string; newStatus: EOrderStatus; oldStatus: EOrderStatus }) => void) => {
    eventBus.on('order:status-changed', handler);
    return () => eventBus.off('order:status-changed', handler);
  },

  onRefresh: (handler: () => void) => {
    eventBus.on('orders:refresh', handler);
    return () => eventBus.off('orders:refresh', handler);
  }
};

// Notification events
export const notificationEvents = {
  show: (message: string, type: 'success' | 'error' | 'info' | 'warning' = 'info') => {
    eventBus.emit('notification:show', { message, type });
  },

  onShow: (handler: (data: { message: string; type: 'success' | 'error' | 'info' | 'warning' }) => void) => {
    eventBus.on('notification:show', handler);
    return () => eventBus.off('notification:show', handler);
  }
};

// Export default event bus
export default eventBus; 