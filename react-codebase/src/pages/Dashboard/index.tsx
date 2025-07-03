import React, { useState, useEffect, useMemo } from 'react';
import {
  Card,
  CardContent,
  Typography,
  TextField,
  FormControl,
  InputLabel,
  Select,
  MenuItem,
  Chip,
  Box,
  Button,
  IconButton,
  Tooltip
} from '@mui/material';
import { 
  Refresh, 
  FilterList, 
  Visibility,
  TrendingUp,
  ShoppingCart,
  CheckCircle,
  Cancel
} from '@mui/icons-material';
import { Table, TableColumnType } from "antd";
import { useQuery } from "@tanstack/react-query";
import { toast } from "react-toastify";
import { useLongPolling } from "@/hooks/useLongPolling";
import { orderEvents } from "@/utils/eventBus";
import ApiOrder from "@/api/ApiOrder";
import QUERY_KEY from "@/api/QueryKey";
import { IOrder, EOrderStatus } from "@/types";
import { useNavigate } from "react-router-dom";

interface DashboardFilters {
  status: EOrderStatus | 'all';
  userId: string;
  dateFrom: Date | null;
  dateTo: Date | null;
  minAmount: string;
  maxAmount: string;
  searchTerm: string;
}

interface DashboardStats {
  totalOrders: number;
  pendingOrders: number;
  completedOrders: number;
  cancelledOrders: number;
  totalRevenue: number;
}

const PAGE_SIZE = 10;

export default function Dashboard(): JSX.Element {
  const navigate = useNavigate();
  const [currentPage, setCurrentPage] = useState(1);
  const [sortField, setSortField] = useState<string>('createdAt');
  const [sortOrder, setSortOrder] = useState<'asc' | 'desc'>('desc');
  const [showFilters, setShowFilters] = useState(false);
  
  const [filters, setFilters] = useState<DashboardFilters>({
    status: 'all',
    userId: '',
    dateFrom: null,
    dateTo: null,
    minAmount: '',
    maxAmount: '',
    searchTerm: ''
  });

  // Real-time data fetching
  const {
    data: orderData,
    isLoading,
    isError,
    refetch
  } = useQuery({
    queryKey: [QUERY_KEY.ORDER.LIST, currentPage, sortField, sortOrder, filters],
    queryFn: () => ApiOrder.getOrders({
      page: currentPage,
      limit: PAGE_SIZE,
      sortField,
      sortOrder,
      ...buildApiFilters(filters)
    }),
  });

  // Long polling for real-time updates
  const { isPolling } = useLongPolling({
    queryKey: [QUERY_KEY.ORDER.LIST, currentPage, sortField, sortOrder, JSON.stringify(filters)],
    enabled: true,
    interval: 5000, // 5 seconds for dashboard
  });

  // Listen to order events for instant updates
  useEffect(() => {
    const unsubscribeRefresh = orderEvents.onRefresh(() => {
      refetch();
    });

    const unsubscribeStatusChange = orderEvents.onStatusChanged((data) => {
      toast.info(`Đơn hàng ${data.orderId.slice(0, 8)}... cập nhật: ${data.newStatus}`, {
        position: "top-right",
        autoClose: 3000,
      });
      refetch(); // Refresh data immediately
    });

    return () => {
      unsubscribeRefresh();
      unsubscribeStatusChange();
    };
  }, [refetch]);

  // Build API filters from dashboard filters
  function buildApiFilters(dashboardFilters: DashboardFilters) {
    const apiFilters: any = {};
    
    if (dashboardFilters.status !== 'all') {
      apiFilters.status = dashboardFilters.status;
    }
    if (dashboardFilters.userId) {
      apiFilters.userId = dashboardFilters.userId;
    }
    if (dashboardFilters.dateFrom) {
      apiFilters.dateFrom = dashboardFilters.dateFrom.toISOString();
    }
    if (dashboardFilters.dateTo) {
      apiFilters.dateTo = dashboardFilters.dateTo.toISOString();
    }
    if (dashboardFilters.minAmount) {
      apiFilters.minAmount = parseFloat(dashboardFilters.minAmount);
    }
    if (dashboardFilters.maxAmount) {
      apiFilters.maxAmount = parseFloat(dashboardFilters.maxAmount);
    }
    if (dashboardFilters.searchTerm) {
      apiFilters.search = dashboardFilters.searchTerm;
    }

    return apiFilters;
  }

  // Calculate dashboard statistics
  const stats: DashboardStats = useMemo(() => {
    if (!orderData?.data) {
      return {
        totalOrders: 0,
        pendingOrders: 0,
        completedOrders: 0,
        cancelledOrders: 0,
        totalRevenue: 0
      };
    }

    const orders = orderData.data;
    return {
      totalOrders: orderData.meta?.totalItems || orders.length,
      pendingOrders: orders.filter(o => o.status === EOrderStatus.CREATED || o.status === EOrderStatus.CONFIRMED).length,
      completedOrders: orders.filter(o => o.status === EOrderStatus.DELIVERED).length,
      cancelledOrders: orders.filter(o => o.status === EOrderStatus.CANCELLED).length,
      totalRevenue: orders.reduce((sum, order) => sum + parseFloat(order.totalAmount), 0)
    };
  }, [orderData]);

  // Table columns with sorting
  const columns: TableColumnType<any>[] = [
    {
      title: 'STT',
      dataIndex: 'stt',
      key: 'stt',
      width: 60,
    },
    {
      title: 'Mã đơn hàng',
      dataIndex: 'id',
      key: 'id',
      width: 200,
      sorter: true,
      render: (value: string) => (
        <span className="font-mono text-sm cursor-pointer" 
              onClick={() => navigate(`/order-detail/${value}`)}>
          {value.slice(0, 8)}...
        </span>
      ),
    },
    {
      title: 'Khách hàng',
      dataIndex: 'userId',
      key: 'userId',
      width: 120,
      sorter: true,
    },
    {
      title: 'Tổng tiền',
      dataIndex: 'totalAmount',
      key: 'totalAmount',
      width: 120,
      sorter: true,
      render: (value: string) => (
        <span className="font-semibold">
          {new Intl.NumberFormat('vi-VN', {
            style: 'currency',
            currency: 'VND'
          }).format(parseFloat(value))}
        </span>
      ),
    },
    {
      title: 'Trạng thái',
      dataIndex: 'status',
      key: 'status',
      width: 120,
      filters: [
        { text: 'Đã tạo', value: EOrderStatus.CREATED },
        { text: 'Đã xác nhận', value: EOrderStatus.CONFIRMED },
        { text: 'Đã giao hàng', value: EOrderStatus.DELIVERED },
        { text: 'Đã hủy', value: EOrderStatus.CANCELLED },
      ],
      render: (status: EOrderStatus) => {
        const statusConfig = {
          [EOrderStatus.CREATED]: { text: "Đã tạo", color: "warning" as const },
          [EOrderStatus.CONFIRMED]: { text: "Đã xác nhận", color: "primary" as const },
          [EOrderStatus.DELIVERED]: { text: "Đã giao hàng", color: "success" as const },
          [EOrderStatus.CANCELLED]: { text: "Đã hủy", color: "error" as const }
        };
        
        const config = statusConfig[status];
        return <Chip label={config.text} color={config.color} size="small" />;
      },
    },
    {
      title: 'Ngày tạo',
      dataIndex: 'createdAt',
      key: 'createdAt',
      width: 150,
      sorter: true,
      render: (value: string) => new Date(value).toLocaleString("vi-VN"),
    },
    {
      title: 'Hành động',
      dataIndex: 'actions',
      key: 'actions',
      width: 100,
      render: (_: any, record: any) => (
        <Tooltip title="Xem chi tiết">
          <IconButton 
            size="small"
            onClick={() => navigate(`/order-detail/${record.id}`)}
          >
            <Visibility />
          </IconButton>
        </Tooltip>
      ),
    },
  ];

  // Table data with pagination info
  const tableData = orderData?.data?.map((order: IOrder, idx: number) => ({
    ...order,
    stt: (currentPage - 1) * PAGE_SIZE + idx + 1,
    key: order.id,
  })) || [];

  const handleFilterChange = (field: keyof DashboardFilters, value: any) => {
    setFilters(prev => ({
      ...prev,
      [field]: value
    }));
    setCurrentPage(1); // Reset to first page when filtering
  };

  const clearFilters = () => {
    setFilters({
      status: 'all',
      userId: '',
      dateFrom: null,
      dateTo: null,
      minAmount: '',
      maxAmount: '',
      searchTerm: ''
    });
  };

  const handleTableChange = (pagination: any, filters: any, sorter: any) => {
    if (sorter.field) {
      setSortField(sorter.field);
      setSortOrder(sorter.order === 'ascend' ? 'asc' : 'desc');
    }
  };

  return (
    <div className="p-6 space-y-6">
      {/* Header */}
      <div className="flex justify-between items-center">
        <div>
          <Typography variant="h4" className="font-bold">
            Dashboard Quản lý Đơn hàng
          </Typography>
          <div className="flex items-center gap-2 mt-2">
            {isPolling && (
              <>
                <div className="w-2 h-2 bg-green-500 rounded-full animate-pulse"></div>
                <Typography variant="body2" color="success">
                  Đang cập nhật real-time
                </Typography>
              </>
            )}
          </div>
        </div>
        
        <div className="flex gap-2">
          <Button
            variant="outlined"
            startIcon={<FilterList />}
            onClick={() => setShowFilters(!showFilters)}
          >
            Bộ lọc
          </Button>
          <Button
            variant="outlined"
            startIcon={<Refresh />}
            onClick={() => refetch()}
          >
            Làm mới
          </Button>
          <Button
            variant="contained"
            onClick={() => navigate('/create-order')}
          >
            Tạo đơn hàng
          </Button>
        </div>
      </div>

      {/* Statistics Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-4 gap-6">
        <Card>
          <CardContent>
            <Box display="flex" alignItems="center" justifyContent="space-between">
              <div>
                <Typography color="textSecondary" gutterBottom variant="body2">
                  Tổng đơn hàng
                </Typography>
                <Typography variant="h4">
                  {stats.totalOrders}
                </Typography>
              </div>
              <ShoppingCart color="primary" />
            </Box>
          </CardContent>
        </Card>
        
        <Card>
          <CardContent>
            <Box display="flex" alignItems="center" justifyContent="space-between">
              <div>
                <Typography color="textSecondary" gutterBottom variant="body2">
                  Đang xử lý
                </Typography>
                <Typography variant="h4" color="warning.main">
                  {stats.pendingOrders}
                </Typography>
              </div>
              <TrendingUp color="warning" />
            </Box>
          </CardContent>
        </Card>
        
        <Card>
          <CardContent>
            <Box display="flex" alignItems="center" justifyContent="space-between">
              <div>
                <Typography color="textSecondary" gutterBottom variant="body2">
                  Hoàn thành
                </Typography>
                <Typography variant="h4" color="success.main">
                  {stats.completedOrders}
                </Typography>
              </div>
              <CheckCircle color="success" />
            </Box>
          </CardContent>
        </Card>
        
        <Card>
          <CardContent>
            <Box display="flex" alignItems="center" justifyContent="space-between">
              <div>
                <Typography color="textSecondary" gutterBottom variant="body2">
                  Doanh thu
                </Typography>
                <Typography variant="h6">
                  {new Intl.NumberFormat('vi-VN', {
                    style: 'currency',
                    currency: 'VND'
                  }).format(stats.totalRevenue)}
                </Typography>
              </div>
              <Cancel color="error" />
            </Box>
          </CardContent>
        </Card>
      </div>

      {/* Advanced Filters */}
      {showFilters && (
        <Card>
          <CardContent>
            <Typography variant="h6" gutterBottom>
              Bộ lọc nâng cao
            </Typography>
            <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4">
              <TextField
                fullWidth
                label="Tìm kiếm"
                value={filters.searchTerm}
                onChange={(e) => handleFilterChange('searchTerm', e.target.value)}
                placeholder="Mã đơn hàng, khách hàng..."
              />
              
              <FormControl fullWidth>
                <InputLabel>Trạng thái</InputLabel>
                <Select
                  value={filters.status}
                  label="Trạng thái"
                  onChange={(e) => handleFilterChange('status', e.target.value)}
                >
                  <MenuItem value="all">Tất cả</MenuItem>
                  <MenuItem value={EOrderStatus.CREATED}>Đã tạo</MenuItem>
                  <MenuItem value={EOrderStatus.CONFIRMED}>Đã xác nhận</MenuItem>
                  <MenuItem value={EOrderStatus.DELIVERED}>Đã giao hàng</MenuItem>
                  <MenuItem value={EOrderStatus.CANCELLED}>Đã hủy</MenuItem>
                </Select>
              </FormControl>
              
              <TextField
                fullWidth
                label="Từ ngày"
                type="date"
                value={filters.dateFrom ? filters.dateFrom.toISOString().split('T')[0] : ''}
                onChange={(e) => handleFilterChange('dateFrom', e.target.value ? new Date(e.target.value) : null)}
                InputLabelProps={{
                  shrink: true,
                }}
              />
              
              <TextField
                fullWidth
                label="Đến ngày"
                type="date"
                value={filters.dateTo ? filters.dateTo.toISOString().split('T')[0] : ''}
                onChange={(e) => handleFilterChange('dateTo', e.target.value ? new Date(e.target.value) : null)}
                InputLabelProps={{
                  shrink: true,
                }}
              />
              
              <TextField
                fullWidth
                label="Số tiền tối thiểu"
                type="number"
                value={filters.minAmount}
                onChange={(e) => handleFilterChange('minAmount', e.target.value)}
              />
              
              <TextField
                fullWidth
                label="Số tiền tối đa"
                type="number"
                value={filters.maxAmount}
                onChange={(e) => handleFilterChange('maxAmount', e.target.value)}
              />
              
              <TextField
                fullWidth
                label="ID Khách hàng"
                value={filters.userId}
                onChange={(e) => handleFilterChange('userId', e.target.value)}
              />
              
              <Button
                variant="outlined"
                onClick={clearFilters}
                fullWidth
                className="h-14"
              >
                Xóa bộ lọc
              </Button>
            </div>
          </CardContent>
        </Card>
      )}

      {/* Orders Table */}
      <Card>
        <CardContent>
          <Typography variant="h6" gutterBottom>
            Danh sách đơn hàng
          </Typography>
          
          {isLoading ? (
            <div className="text-center py-8">Đang tải...</div>
          ) : isError ? (
            <div className="text-center py-8 text-red-500">
              Có lỗi khi tải dữ liệu
            </div>
          ) : (
            <Table
              dataSource={tableData}
              columns={columns}
              pagination={{
                current: currentPage,
                pageSize: PAGE_SIZE,
                total: orderData?.meta?.totalItems || 0,
                showSizeChanger: false,
                showQuickJumper: true,
                showTotal: (total, range) =>
                  `${range[0]}-${range[1]} của ${total} đơn hàng`,
                onChange: setCurrentPage,
              }}
              onChange={handleTableChange}
              size="small"
              scroll={{ x: 'max-content' }}
            />
          )}
        </CardContent>
      </Card>
    </div>
  );
} 