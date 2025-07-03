import { IOrder, IProduct } from '@/types';

interface OfflineAction {
  id: string;
  type: 'CREATE_ORDER' | 'UPDATE_ORDER' | 'CANCEL_ORDER';
  data: any;
  timestamp: number;
  retryCount: number;
}

interface CacheData {
  orders: IOrder[];
  products: IProduct[];
  lastSync: number;
}

class OfflineStorageManager {
  private readonly CACHE_KEY = 'orderApp_cache';
  private readonly ACTIONS_KEY = 'orderApp_offline_actions';
  private readonly CACHE_EXPIRY = 24 * 60 * 60 * 1000; // 24 hours

  // Check if we're online
  public isOnline(): boolean {
    return navigator.onLine;
  }

  // Store data in local cache
  public setCacheData(data: Partial<CacheData>): void {
    try {
      const existingCache = this.getCacheData();
      const newCache: CacheData = {
        ...existingCache,
        ...data,
        lastSync: Date.now()
      };
      localStorage.setItem(this.CACHE_KEY, JSON.stringify(newCache));
    } catch (error) {
      console.warn('Failed to cache data:', error);
    }
  }

  // Get cached data
  public getCacheData(): CacheData {
    try {
      const cached = localStorage.getItem(this.CACHE_KEY);
      if (cached) {
        const data = JSON.parse(cached);
        
        // Check if cache is expired
        if (Date.now() - data.lastSync > this.CACHE_EXPIRY) {
          this.clearCache();
          return this.getDefaultCacheData();
        }
        
        return data;
      }
    } catch (error) {
      console.warn('Failed to read cache:', error);
    }
    return this.getDefaultCacheData();
  }

  private getDefaultCacheData(): CacheData {
    return {
      orders: [],
      products: [],
      lastSync: 0
    };
  }

  // Clear all cached data
  public clearCache(): void {
    localStorage.removeItem(this.CACHE_KEY);
  }

  // Store offline action for later sync
  public addOfflineAction(type: OfflineAction['type'], data: any): string {
    try {
      const actionId = `${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;
      const action: OfflineAction = {
        id: actionId,
        type,
        data,
        timestamp: Date.now(),
        retryCount: 0
      };

      const actions = this.getOfflineActions();
      actions.push(action);
      localStorage.setItem(this.ACTIONS_KEY, JSON.stringify(actions));
      
      return actionId;
    } catch (error) {
      console.warn('Failed to store offline action:', error);
      return '';
    }
  }

  // Get all pending offline actions
  public getOfflineActions(): OfflineAction[] {
    try {
      const actions = localStorage.getItem(this.ACTIONS_KEY);
      return actions ? JSON.parse(actions) : [];
    } catch (error) {
      console.warn('Failed to read offline actions:', error);
      return [];
    }
  }

  // Remove offline action after successful sync
  public removeOfflineAction(actionId: string): void {
    try {
      const actions = this.getOfflineActions();
      const filteredActions = actions.filter(action => action.id !== actionId);
      localStorage.setItem(this.ACTIONS_KEY, JSON.stringify(filteredActions));
    } catch (error) {
      console.warn('Failed to remove offline action:', error);
    }
  }

  // Increment retry count for failed actions
  public incrementRetryCount(actionId: string): void {
    try {
      const actions = this.getOfflineActions();
      const updatedActions = actions.map(action => 
        action.id === actionId 
          ? { ...action, retryCount: action.retryCount + 1 }
          : action
      );
      localStorage.setItem(this.ACTIONS_KEY, JSON.stringify(updatedActions));
    } catch (error) {
      console.warn('Failed to update retry count:', error);
    }
  }

  // Clear all offline actions
  public clearOfflineActions(): void {
    localStorage.removeItem(this.ACTIONS_KEY);
  }

  // Get storage statistics
  public getStorageStats(): {
    cacheSize: string;
    actionsCount: number;
    lastSync: Date | null;
    isExpired: boolean;
  } {
    const cache = this.getCacheData();
    const actions = this.getOfflineActions();
    
    let cacheSize = '0 KB';
    try {
      const cacheString = localStorage.getItem(this.CACHE_KEY) || '';
      cacheSize = `${Math.round(new Blob([cacheString]).size / 1024)} KB`;
    } catch (error) {
      // Ignore error
    }

    return {
      cacheSize,
      actionsCount: actions.length,
      lastSync: cache.lastSync > 0 ? new Date(cache.lastSync) : null,
      isExpired: Date.now() - cache.lastSync > this.CACHE_EXPIRY
    };
  }

  // Optimistic updates for offline operations
  public addOptimisticOrder(order: Partial<IOrder>): void {
    const cache = this.getCacheData();
    const optimisticOrder: IOrder = {
      id: `temp_${Date.now()}`,
      userId: order.userId || 'unknown',
      totalAmount: order.totalAmount || '0',
      status: order.status || 'created' as any,
      items: order.items || [],
      deliveryAddress: order.deliveryAddress || '',
      notes: order.notes || '',
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
      ...order
    };

    cache.orders.unshift(optimisticOrder);
    this.setCacheData({ orders: cache.orders });
  }

  public updateOptimisticOrder(orderId: string, updates: Partial<IOrder>): void {
    const cache = this.getCacheData();
    const updatedOrders = cache.orders.map(order => 
      order.id === orderId 
        ? { ...order, ...updates, updatedAt: new Date().toISOString() }
        : order
    );
    this.setCacheData({ orders: updatedOrders });
  }

  public removeOptimisticOrder(orderId: string): void {
    const cache = this.getCacheData();
    const filteredOrders = cache.orders.filter(order => order.id !== orderId);
    this.setCacheData({ orders: filteredOrders });
  }
}

// Singleton instance
export const offlineStorage = new OfflineStorageManager();

// Hook to monitor online status
export const useOnlineStatus = () => {
  const [isOnline, setIsOnline] = React.useState(navigator.onLine);

  React.useEffect(() => {
    const handleOnline = () => setIsOnline(true);
    const handleOffline = () => setIsOnline(false);

    window.addEventListener('online', handleOnline);
    window.addEventListener('offline', handleOffline);

    return () => {
      window.removeEventListener('online', handleOnline);
      window.removeEventListener('offline', handleOffline);
    };
  }, []);

  return isOnline;
};

export default offlineStorage; 