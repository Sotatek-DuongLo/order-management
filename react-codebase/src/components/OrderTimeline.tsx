import React from 'react';
import {
  Stepper,
  Step,
  StepLabel,
  StepContent,
  Typography,
  Paper,
  Box,
  Chip
} from '@mui/material';
import {
  ShoppingCart,
  CheckCircle,
  LocalShipping,
  Cancel,
  Schedule,
  Done
} from '@mui/icons-material';
import { EOrderStatus } from '@/types';

interface OrderTimelineProps {
  currentStatus: EOrderStatus;
  statusHistory?: Array<{
    status: EOrderStatus;
    timestamp: string;
    note?: string;
  }>;
  createdAt: string;
  updatedAt: string;
}

interface StepConfig {
  label: string;
  icon: React.ReactNode;
  description: string;
  color: 'primary' | 'success' | 'error' | 'warning';
}

const statusSteps: Record<EOrderStatus, StepConfig> = {
  [EOrderStatus.CREATED]: {
    label: 'Đơn hàng được tạo',
    icon: <ShoppingCart />,
    description: 'Đơn hàng đã được tạo và đang chờ xác nhận',
    color: 'warning'
  },
  [EOrderStatus.CONFIRMED]: {
    label: 'Đã xác nhận',
    icon: <CheckCircle />,
    description: 'Đơn hàng đã được xác nhận và đang chuẩn bị giao hàng',
    color: 'primary'
  },
  [EOrderStatus.DELIVERED]: {
    label: 'Đã giao hàng',
    icon: <LocalShipping />,
    description: 'Đơn hàng đã được giao thành công',
    color: 'success'
  },
  [EOrderStatus.CANCELLED]: {
    label: 'Đã hủy',
    icon: <Cancel />,
    description: 'Đơn hàng đã bị hủy',
    color: 'error'
  }
};

// Define the normal flow progression
const normalFlow = [
  EOrderStatus.CREATED,
  EOrderStatus.CONFIRMED,
  EOrderStatus.DELIVERED
];

export const OrderTimeline: React.FC<OrderTimelineProps> = ({
  currentStatus,
  statusHistory = [],
  createdAt,
  updatedAt
}) => {
  // Determine active step and completed steps
  const getStepStatus = (stepStatus: EOrderStatus) => {
    if (currentStatus === EOrderStatus.CANCELLED) {
      if (stepStatus === EOrderStatus.CANCELLED) return 'active';
      return 'disabled';
    }

    const currentIndex = normalFlow.indexOf(currentStatus);
    const stepIndex = normalFlow.indexOf(stepStatus);
    
    if (stepIndex <= currentIndex) return 'completed';
    return 'pending';
  };

  const formatTimestamp = (timestamp: string) => {
    return new Date(timestamp).toLocaleString('vi-VN', {
      year: 'numeric',
      month: '2-digit',
      day: '2-digit',
      hour: '2-digit',
      minute: '2-digit'
    });
  };

  // Create timeline steps
  const timelineSteps = () => {
    if (currentStatus === EOrderStatus.CANCELLED) {
      // Show path to cancellation
      return [
        {
          status: EOrderStatus.CREATED,
          config: statusSteps[EOrderStatus.CREATED],
          timestamp: createdAt,
          completed: true
        },
        {
          status: EOrderStatus.CANCELLED,
          config: statusSteps[EOrderStatus.CANCELLED],
          timestamp: updatedAt,
          completed: true
        }
      ];
    }

    // Normal flow
    return normalFlow.map(status => ({
      status,
      config: statusSteps[status],
      timestamp: status === EOrderStatus.CREATED ? createdAt : 
                 status === currentStatus ? updatedAt : '',
      completed: getStepStatus(status) === 'completed'
    }));
  };

  const steps = timelineSteps();
  const activeStep = steps.findIndex(step => step.status === currentStatus);

  return (
    <Paper elevation={1} className="p-4">
      <Typography variant="h6" gutterBottom className="flex items-center gap-2">
        <Schedule />
        Tiến trình đơn hàng
      </Typography>

      <Stepper activeStep={activeStep} orientation="vertical">
        {steps.map((step) => {
          const isActive = step.status === currentStatus;
          const isCompleted = step.completed;
          
          return (
            <Step key={step.status} completed={isCompleted}>
              <StepLabel
                icon={
                  <Box
                    className={`p-2 rounded-full ${
                      isActive ? 'bg-primary-100' :
                      isCompleted ? 'bg-success-100' : 'bg-gray-100'
                    }`}
                  >
                    {React.cloneElement(step.config.icon as React.ReactElement, {
                      className: `${
                        isActive ? 'text-primary-600' :
                        isCompleted ? 'text-success-600' : 'text-gray-400'
                      }`
                    })}
                  </Box>
                }
              >
                <Box className="flex items-center gap-2">
                  <Typography variant="subtitle1" className="font-semibold">
                    {step.config.label}
                  </Typography>
                  {isActive && (
                    <Chip 
                      label="Hiện tại" 
                      color={step.config.color} 
                      size="small" 
                    />
                  )}
                  {isCompleted && !isActive && (
                    <Done className="text-success-600" fontSize="small" />
                  )}
                </Box>
              </StepLabel>
              
              <StepContent>
                <Box className="pb-4">
                  <Typography variant="body2" color="textSecondary" className="mb-2">
                    {step.config.description}
                  </Typography>
                  
                  {step.timestamp && (
                    <Typography variant="caption" color="textSecondary">
                      📅 {formatTimestamp(step.timestamp)}
                    </Typography>
                  )}

                  {/* Show additional history if available */}
                  {statusHistory.length > 0 && (
                    <Box className="mt-2">
                      {statusHistory
                        .filter(history => history.status === step.status)
                        .map((history, historyIndex) => (
                          <Box key={historyIndex} className="mt-1 p-2 bg-gray-50 rounded">
                            <Typography variant="caption" color="textSecondary">
                              📝 {history.note || 'Cập nhật trạng thái'}
                            </Typography>
                            <br />
                            <Typography variant="caption" color="textSecondary">
                              🕒 {formatTimestamp(history.timestamp)}
                            </Typography>
                          </Box>
                        ))}
                    </Box>
                  )}
                </Box>
              </StepContent>
            </Step>
          );
        })}
      </Stepper>

      {/* Status Summary */}
      <Box className="mt-4 p-3 bg-blue-50 rounded-lg">
        <Typography variant="subtitle2" className="font-semibold mb-2">
          📊 Tóm tắt trạng thái
        </Typography>
        <Box className="grid grid-cols-2 gap-2 text-sm">
          <div>
            <span className="text-gray-600">Trạng thái hiện tại:</span>{' '}
            <Chip 
              label={statusSteps[currentStatus].label} 
              color={statusSteps[currentStatus].color} 
              size="small" 
            />
          </div>
          <div>
            <span className="text-gray-600">Cập nhật lần cuối:</span>{' '}
            <span className="font-medium">{formatTimestamp(updatedAt)}</span>
          </div>
          <div>
            <span className="text-gray-600">Thời gian tạo:</span>{' '}
            <span className="font-medium">{formatTimestamp(createdAt)}</span>
          </div>
          <div>
            <span className="text-gray-600">Số bước hoàn thành:</span>{' '}
            <span className="font-medium">
              {steps.filter(s => s.completed).length}/{steps.length}
            </span>
          </div>
        </Box>
      </Box>
    </Paper>
  );
};

export default OrderTimeline; 