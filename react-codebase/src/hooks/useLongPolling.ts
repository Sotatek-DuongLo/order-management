import { useEffect, useRef, useCallback } from 'react';
import { useQueryClient } from '@tanstack/react-query';

interface UseLongPollingOptions {
  queryKey: (string | number)[];
  enabled?: boolean;
  interval?: number;
  maxRetries?: number;
}

export const useLongPolling = ({
  queryKey,
  enabled = true,
  interval = 5000, // 5 seconds
  maxRetries = 3
}: UseLongPollingOptions) => {
  const queryClient = useQueryClient();
  const retryCountRef = useRef(0);
  const intervalRef = useRef<NodeJS.Timeout | null>(null);

  const poll = useCallback(async () => {
    try {
      await queryClient.invalidateQueries({ queryKey });
      retryCountRef.current = 0; // Reset retry count on success
    } catch {
      // Silent error handling - log to external service in production
      retryCountRef.current += 1;
      
      if (retryCountRef.current >= maxRetries) {
        // Stop polling after max retries
        return;
      }
    }
  }, [queryClient, queryKey, maxRetries]);

  const startPolling = useCallback(() => {
    if (!enabled) return;
    
    intervalRef.current = setInterval(poll, interval);
  }, [enabled, interval, poll]);

  const stopPolling = useCallback(() => {
    if (intervalRef.current) {
      clearInterval(intervalRef.current);
      intervalRef.current = null;
    }
  }, []);

  useEffect(() => {
    if (enabled) {
      startPolling();
    } else {
      stopPolling();
    }

    return () => {
      stopPolling();
    };
  }, [enabled, startPolling, stopPolling]);

  return {
    startPolling,
    stopPolling,
    isPolling: intervalRef.current !== null
  };
}; 