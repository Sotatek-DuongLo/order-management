import React, { useState, useEffect } from 'react';
import {
  Card,
  CardContent,
  Typography,
  Button,
  Box,
  CircularProgress,
  Alert,
  Chip,
  IconButton,
  Tooltip,
  LinearProgress
} from '@mui/material';
import {
  Payment,
  Refresh,
  CheckCircle,
  Error,
  Schedule,
  RestartAlt
} from '@mui/icons-material';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { toast } from 'react-toastify';
import ApiOrder from '@/api/ApiOrder';
import { EPaymentStatus, IPayment } from '@/types';

interface PaymentStatusMonitorProps {
  orderId: string;
  onPaymentSuccess?: (payment: IPayment) => void;
  onPaymentFailed?: (error: any) => void;
}

interface RetryConfig {
  maxRetries: number;
  retryDelay: number;
  backoffMultiplier: number;
}

const DEFAULT_RETRY_CONFIG: RetryConfig = {
  maxRetries: 3,
  retryDelay: 2000, // 2 seconds
  backoffMultiplier: 1.5
};

export const PaymentStatusMonitor: React.FC<PaymentStatusMonitorProps> = ({
  orderId,
  onPaymentSuccess,
  onPaymentFailed
}) => {
  const queryClient = useQueryClient();
  const [retryCount, setRetryCount] = useState(0);
  const [isRetrying, setIsRetrying] = useState(false);
  const [retryProgress, setRetryProgress] = useState(0);
  const [retryTimeout, setRetryTimeout] = useState<NodeJS.Timeout | null>(null);

  // Fetch payment status
  const {
    data: payments,
    isLoading,
    isError,
    refetch
  } = useQuery({
    queryKey: ['payments', orderId],
    queryFn: () => ApiOrder.getPaymentsByOrder(orderId),
    enabled: !!orderId,
    refetchInterval: (data) => {
      // Stop polling if payment is successful or failed
      const latestPayment = data?.[0];
      if (latestPayment?.status === EPaymentStatus.SUCCESS || 
          latestPayment?.status === EPaymentStatus.FAILED) {
        return false;
      }
      return 3000; // Poll every 3 seconds for pending payments
    }
  });

  // Process payment mutation with retry logic
  const processPaymentMutation = useMutation({
    mutationFn: (paymentData: any) => ApiOrder.processPayment(paymentData),
    onSuccess: (payment) => {
      toast.success('Thanh toán thành công!', {
        position: "top-right",
        autoClose: 3000,
      });
      setRetryCount(0);
      setIsRetrying(false);
      onPaymentSuccess?.(payment);
      queryClient.invalidateQueries({ queryKey: ['payments', orderId] });
    },
    onError: (error: any) => {
      const errorMessage = error?.response?.data?.message || 'Thanh toán thất bại';
      
      if (retryCount < DEFAULT_RETRY_CONFIG.maxRetries) {
        // Auto retry with exponential backoff
        startRetry(errorMessage);
      } else {
        // Max retries reached
        toast.error(`${errorMessage}. Đã thử ${DEFAULT_RETRY_CONFIG.maxRetries} lần.`, {
          position: "top-right",
          autoClose: 5000,
        });
        setIsRetrying(false);
        onPaymentFailed?.(error);
      }
    },
  });

  const startRetry = (errorMessage: string) => {
    setIsRetrying(true);
    const delay = DEFAULT_RETRY_CONFIG.retryDelay * Math.pow(DEFAULT_RETRY_CONFIG.backoffMultiplier, retryCount);
    
    toast.warning(`${errorMessage}. Thử lại sau ${delay/1000}s... (${retryCount + 1}/${DEFAULT_RETRY_CONFIG.maxRetries})`, {
      position: "top-right",
      autoClose: delay,
    });

    // Show progress bar during retry delay
    setRetryProgress(0);
    const progressInterval = setInterval(() => {
      setRetryProgress(prev => {
        if (prev >= 100) {
          clearInterval(progressInterval);
          return 100;
        }
        return prev + (100 / (delay / 100));
      });
    }, 100);

    const timeout = setTimeout(() => {
      clearInterval(progressInterval);
      setRetryCount(prev => prev + 1);
      setRetryProgress(0);
      
      // Retry the payment
      processPaymentMutation.mutate({
        orderId,
        userId: 'duonglv', // This should come from context/props
        amount: 100000, // This should come from order data
        authToken: 'dummy-token',
        pin: '1234'
      });
    }, delay);

    setRetryTimeout(timeout);
  };

  const handleManualRetry = () => {
    if (retryTimeout) {
      clearTimeout(retryTimeout);
      setRetryTimeout(null);
    }
    setRetryCount(0);
    setIsRetrying(false);
    setRetryProgress(0);
    
    processPaymentMutation.mutate({
      orderId,
      userId: 'duonglv',
      amount: 100000,
      authToken: 'dummy-token',
      pin: '1234'
    });
  };

  const handleCancelRetry = () => {
    if (retryTimeout) {
      clearTimeout(retryTimeout);
      setRetryTimeout(null);
    }
    setIsRetrying(false);
    setRetryCount(0);
    setRetryProgress(0);
    toast.info('Đã hủy thử lại thanh toán');
  };

  const formatTimestamp = (timestamp: string) => {
    return new Date(timestamp).toLocaleString('vi-VN');
  };

  const getStatusConfig = (status: EPaymentStatus) => {
    switch (status) {
      case EPaymentStatus.SUCCESS:
        return {
          label: 'Thành công',
          color: 'success' as const,
          icon: <CheckCircle color="success" />
        };
      case EPaymentStatus.FAILED:
        return {
          label: 'Thất bại',
          color: 'error' as const,
          icon: <Error color="error" />
        };
      default:
        return {
          label: 'Đang xử lý',
          color: 'warning' as const,
          icon: <Schedule color="warning" />
        };
    }
  };

  // Cleanup timeout on unmount
  useEffect(() => {
    return () => {
      if (retryTimeout) {
        clearTimeout(retryTimeout);
      }
    };
  }, [retryTimeout]);

  const latestPayment = payments?.[0];

  return (
    <Card>
      <CardContent>
        <Box display="flex" alignItems="center" justifyContent="space-between" mb={2}>
          <Typography variant="h6" className="flex items-center gap-2">
            <Payment />
            Trạng thái thanh toán
          </Typography>
          
          <Box display="flex" gap={1}>
            <Tooltip title="Làm mới">
              <IconButton size="small" onClick={() => refetch()}>
                <Refresh />
              </IconButton>
            </Tooltip>
            
            {latestPayment?.status === EPaymentStatus.FAILED && !isRetrying && (
              <Button
                size="small"
                variant="outlined"
                startIcon={<RestartAlt />}
                onClick={handleManualRetry}
                disabled={processPaymentMutation.isPending}
              >
                Thử lại
              </Button>
            )}
          </Box>
        </Box>

        {isLoading ? (
          <Box display="flex" alignItems="center" gap={2}>
            <CircularProgress size={20} />
            <Typography>Đang kiểm tra trạng thái thanh toán...</Typography>
          </Box>
        ) : isError ? (
          <Alert severity="error">
            Không thể tải thông tin thanh toán
          </Alert>
        ) : !latestPayment ? (
          <Alert severity="info">
            Chưa có thông tin thanh toán cho đơn hàng này
          </Alert>
        ) : (
          <Box>
            {/* Payment Status */}
            <Box display="flex" alignItems="center" gap={2} mb={2}>
              {getStatusConfig(latestPayment.status).icon}
              <Chip 
                label={getStatusConfig(latestPayment.status).label}
                color={getStatusConfig(latestPayment.status).color}
              />
              <Typography variant="body2" color="textSecondary">
                ID: {latestPayment.id.slice(0, 8)}...
              </Typography>
            </Box>

            {/* Payment Details */}
            <Box className="grid grid-cols-2 gap-4 mb-3">
              <div>
                <Typography variant="caption" color="textSecondary">
                  Số tiền
                </Typography>
                <Typography variant="body2" className="font-semibold">
                  {new Intl.NumberFormat('vi-VN', {
                    style: 'currency',
                    currency: 'VND'
                  }).format(latestPayment.amount)}
                </Typography>
              </div>
              
              <div>
                <Typography variant="caption" color="textSecondary">
                  Phương thức
                </Typography>
                <Typography variant="body2">
                  {latestPayment.paymentMethod || 'Không xác định'}
                </Typography>
              </div>
              
              <div>
                <Typography variant="caption" color="textSecondary">
                  Thời gian tạo
                </Typography>
                <Typography variant="body2">
                  {formatTimestamp(latestPayment.createdAt)}
                </Typography>
              </div>
              
              <div>
                <Typography variant="caption" color="textSecondary">
                  Cập nhật cuối
                </Typography>
                <Typography variant="body2">
                  {formatTimestamp(latestPayment.updatedAt)}
                </Typography>
              </div>
            </Box>

            {/* Transaction ID */}
            {latestPayment.transactionId && (
              <Box mb={2}>
                <Typography variant="caption" color="textSecondary">
                  Mã giao dịch
                </Typography>
                <Typography variant="body2" className="font-mono">
                  {latestPayment.transactionId}
                </Typography>
              </Box>
            )}

            {/* Error Message */}
            {latestPayment.message && latestPayment.status === EPaymentStatus.FAILED && (
              <Alert severity="error" className="mb-2">
                {latestPayment.message}
              </Alert>
            )}

            {/* Retry Progress */}
            {isRetrying && (
              <Box>
                <Box display="flex" alignItems="center" justifyContent="space-between" mb={1}>
                  <Typography variant="body2">
                    Đang thử lại... ({retryCount + 1}/{DEFAULT_RETRY_CONFIG.maxRetries})
                  </Typography>
                  <Button size="small" onClick={handleCancelRetry}>
                    Hủy
                  </Button>
                </Box>
                <LinearProgress 
                  variant="determinate" 
                  value={retryProgress} 
                  className="mb-2"
                />
              </Box>
            )}

            {/* Processing Status */}
            {processPaymentMutation.isPending && (
              <Box display="flex" alignItems="center" gap={2}>
                <CircularProgress size={16} />
                <Typography variant="body2">
                  Đang xử lý thanh toán...
                </Typography>
              </Box>
            )}
          </Box>
        )}
      </CardContent>
    </Card>
  );
};

export default PaymentStatusMonitor; 