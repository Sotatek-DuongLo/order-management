import React, { useState, useEffect } from 'react';
import { orderEvents, eventBus } from '@/utils/eventBus';

interface RealTimeIndicatorProps {
  isPolling?: boolean;
}

export const RealTimeIndicator: React.FC<RealTimeIndicatorProps> = ({ isPolling = false }) => {
  const [lastUpdate, setLastUpdate] = useState<Date | null>(null);
  const [eventCount, setEventCount] = useState(0);

  useEffect(() => {
    // Listen to all events để track activity
    const handleAnyEvent = () => {
      setLastUpdate(new Date());
      setEventCount(prev => prev + 1);
    };

    // Subscribe to các events chính
    const unsubscribeCreated = orderEvents.onCreated(handleAnyEvent);
    const unsubscribeUpdated = orderEvents.onUpdated(handleAnyEvent);
    const unsubscribeRefresh = orderEvents.onRefresh(handleAnyEvent);

    return () => {
      unsubscribeCreated();
      unsubscribeUpdated();
      unsubscribeRefresh();
    };
  }, []);

  const formatTime = (date: Date) => {
    return date.toLocaleTimeString('vi-VN', {
      hour: '2-digit',
      minute: '2-digit',
      second: '2-digit'
    });
  };

  return (
    <div className="fixed bottom-4 right-4 bg-white rounded-lg shadow-lg border p-3 text-sm">
      <div className="flex items-center gap-2 mb-2">
        <div className={`w-3 h-3 rounded-full ${isPolling ? 'bg-green-500 animate-pulse' : 'bg-gray-400'}`}></div>
        <span className="font-semibold">
          {isPolling ? 'Đang theo dõi real-time' : 'Không kết nối'}
        </span>
      </div>
      
      <div className="text-xs text-gray-600 space-y-1">
        <div>Events: {eventCount}</div>
        {lastUpdate && (
          <div>Cập nhật cuối: {formatTime(lastUpdate)}</div>
        )}
        <div className="flex items-center gap-1">
          <span>Status:</span>
          <span className={`px-2 py-0.5 rounded text-xs ${
            isPolling ? 'bg-green-100 text-green-800' : 'bg-gray-100 text-gray-800'
          }`}>
            {isPolling ? 'Active' : 'Inactive'}
          </span>
        </div>
      </div>
    </div>
  );
};

export default RealTimeIndicator; 