import {Table, TableColumnType, Button as AntdButton} from "antd";
import {Eye} from "lucide-react";
import {useNavigate} from "react-router-dom";
import {Button} from "@mui/material";
import {useQuery} from "@tanstack/react-query";
import {useState, useEffect} from "react";
import ApiOrder from "@/api/ApiOrder";
import QUERY_KEY from "@/api/QueryKey";
import {IOrder} from "@/types";
import { useLongPolling } from "@/hooks/useLongPolling";
import { orderEvents, notificationEvents } from "@/utils/eventBus";
import { toast } from "react-toastify";

const PAGE_SIZE = 10;

export default function Home(): JSX.Element {
  const navigate = useNavigate();
  const [currentPage, setCurrentPage] = useState(1);

  const {
    data: orderData,
    isLoading,
    isError,
    refetch
  } = useQuery({
    queryKey: [QUERY_KEY.ORDER.LIST, currentPage],
    queryFn: () => ApiOrder.getOrders({page: currentPage, limit: PAGE_SIZE}),
  });

  // Long polling để theo dõi thay đổi đơn hàng
  const { isPolling } = useLongPolling({
    queryKey: [QUERY_KEY.ORDER.LIST, currentPage],
    enabled: true,
    interval: 10000, // Poll mỗi 10 giây
  });

  // Subscribe to order events
  useEffect(() => {
    // Listen for order refresh events
    const unsubscribeRefresh = orderEvents.onRefresh(() => {
      refetch();
    });

    // Listen for order status changes
    const unsubscribeStatusChange = orderEvents.onStatusChanged((data) => {
      toast.info(`Đơn hàng ${data.orderId.slice(0, 8)}... đã chuyển trạng thái thành ${data.newStatus}`, {
        position: "top-right",
        autoClose: 5000,
      });
    });

    // Listen for notifications
    const unsubscribeNotifications = notificationEvents.onShow((data) => {
      switch (data.type) {
        case 'success':
          toast.success(data.message);
          break;
        case 'error':
          toast.error(data.message);
          break;
        case 'warning':
          toast.warn(data.message);
          break;
        default:
          toast.info(data.message);
      }
    });

    return () => {
      unsubscribeRefresh();
      unsubscribeStatusChange();
      unsubscribeNotifications();
    };
  }, [refetch]);

  // Chuẩn hóa dữ liệu cho Table
  const tableData =
    orderData?.data?.map((order: IOrder, idx: number) => ({
      stt: (currentPage - 1) * PAGE_SIZE + idx + 1,
      id: order.id,
      userId: order.userId,
      totalAmount: order.totalAmount,
      status: order.status,
      createdAt: order.createdAt,
      updatedAt: order.updatedAt,
    })) || [];

  const columns: TableColumnType<any>[] = [
    {
      title: "STT",
      dataIndex: "stt",
      key: "stt",
      width: 80,
    },
    {
      title: "Mã đơn hàng",
      dataIndex: "id",
      key: "id",
      width: 250,
      render: (value: string) => (
        <span className="font-mono text-sm">{value.slice(0, 8)}...</span>
      ),
    },
    {
      title: "UserId",
      dataIndex: "userId",
      key: "userId",
      width: 150,
    },
    {
      title: "Tổng tiền",
      dataIndex: "totalAmount",
      key: "totalAmount",
      width: 120,
      render: (value: string) => {
        const amount = parseFloat(value);
        return new Intl.NumberFormat('vi-VN', {
          style: 'currency',
          currency: 'VND'
        }).format(amount);
      },
    },
    {
      title: "Trạng thái",
      dataIndex: "status",
      key: "status",
      width: 120,
      render: (status: string) => {
        const statusConfig = {
          created: { text: "Đã tạo", color: "text-yellow-600 bg-yellow-100" },
          confirmed: { text: "Đã xác nhận", color: "text-blue-600 bg-blue-100" },
          delivered: { text: "Đã giao hàng", color: "text-green-600 bg-green-100" },
          cancelled: { text: "Đã hủy", color: "text-red-600 bg-red-100" }
        };
        
        const config = statusConfig[status as keyof typeof statusConfig] || { text: status, color: "text-gray-600 bg-gray-100" };
        
        return (
          <span className={`px-2 py-1 rounded-full text-xs font-semibold ${config.color}`}>
            {config.text}
          </span>
        );
      },
    },
    {
      title: "Ngày tạo",
      dataIndex: "createdAt",
      key: "createdAt",
      width: 180,
      render: (value: string) => new Date(value).toLocaleString("vi-VN"),
    },
    {
      title: "Ngày cập nhật",
      dataIndex: "updatedAt",
      key: "updatedAt",
      width: 180,
      render: (value: string) => new Date(value).toLocaleString("vi-VN"),
    },
    {
      title: "Hành động",
      dataIndex: "action",
      key: "action",
      width: 120,
      render: (_: any, record: any) => (
        <AntdButton
        icon={<Eye size={16} />}
          onClick={() => navigate(`/order-detail/${record.id}`)}
        >
          Xem
        </AntdButton>
      ),
    },
  ];

  const handlePageChange = (page: number) => {
    setCurrentPage(page);
  };

  return (
    <div className="flex flex-col items-center justify-center w-full h-full gap-4 mb-10">
      <div className="text-4xl font-bold text-center">Các order của bạn</div>
      <div className="text-2xl text-center">Quản lý đơn hàng</div>
      
      {/* Indicator cho long polling */}
      {isPolling && (
        <div className="flex items-center gap-2 text-green-600 text-sm">
          <div className="w-2 h-2 bg-green-500 rounded-full animate-pulse"></div>
          <span>Đang theo dõi cập nhật real-time</span>
        </div>
      )}
      
      <div className="container flex flex-col gap-4">
        <div className="flex justify-end w-full px-10">
          <Button
            variant="contained"
            color="primary"
            onClick={() => navigate("/create-order")}
          >
            Tạo đơn hàng
          </Button>
        </div>
        {isLoading ? (
          <div className="text-center text-lg">Đang tải đơn hàng...</div>
        ) : isError ? (
          <div className="text-center text-red-500">
            Không thể tải danh sách đơn hàng
          </div>
        ) : (
          <div className="px-10">
            <Table
              dataSource={tableData}
              columns={columns as any}
              rowKey="id"
              pagination={{
                current: currentPage,
                pageSize: PAGE_SIZE,
                total: orderData?.meta?.totalItems || 0,
                showSizeChanger: false,
                showQuickJumper: true,
                showTotal: (total, range) =>
                  `${range[0]}-${range[1]} của ${total} đơn hàng`,
                onChange: handlePageChange,
                position: ['bottomRight'],
              }}
              scroll={{ x: 'max-content' }}
              size="middle"
            />
          </div>
        )}
      </div>
    </div>
  );
}