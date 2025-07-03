import {Breadcrumbs, Button, Link, Typography} from "@mui/material";
import {useParams} from "react-router-dom";
import {useQuery, useMutation, useQueryClient} from "@tanstack/react-query";
import { toast } from "react-toastify";
import { useEffect, useMemo } from "react";
import ApiOrder from "@/api/ApiOrder";
import {EOrderStatus, IOrder} from "@/types";
import { OrderStateMachine } from "@/utils/orderStateMachine";
import { orderEvents } from "@/utils/eventBus";
import { useLongPolling } from "@/hooks/useLongPolling";
import OrderTimeline from "@/components/OrderTimeline";
import PaymentStatusMonitor from "@/components/PaymentStatusMonitor";

export default function OrderDetail(): JSX.Element {
  const { id } = useParams<{ id: string }>();
  const queryClient = useQueryClient();
  
  const {
    data: orderData,
    isLoading,
    isError,
  } = useQuery({
    queryKey: ["order-detail", id || ""],
    queryFn: () => ApiOrder.getOrderById(id!),
    enabled: !!id,
  });

  // Long polling cho order detail
  useLongPolling({
    queryKey: ["order-detail", id || ""],
    enabled: !!id,
    interval: 15000, // Poll mỗi 15 giây cho detail
  });

  // Tạo state machine instance cho order hiện tại
  const orderStateMachine = useMemo(() => {
    if (orderData?.status) {
      return new OrderStateMachine(orderData.status);
    }
    return null;
  }, [orderData?.status]);

  // Mutation để hủy đơn hàng
  const cancelOrderMutation = useMutation({
    mutationFn: (orderId: string) => ApiOrder.cancelOrder(orderId),
    onSuccess: (updatedOrder) => {
      toast.success('Đơn hàng đã được hủy thành công!', {
        position: "top-right",
        autoClose: 3000,
      });
      
      // Emit events
      if (orderData) {
        orderEvents.cancelled(updatedOrder.id, updatedOrder.userId);
        orderEvents.updated(updatedOrder.id, EOrderStatus.CANCELLED, orderData.status);
      }
      
      // Invalidate và refetch data
      queryClient.invalidateQueries({ queryKey: ["order-detail", id] });
    },
    onError: (error: any) => {
      toast.error(error?.response?.data?.message || 'Có lỗi xảy ra khi hủy đơn hàng!', {
        position: "top-right",
        autoClose: 5000,
      });
    },
  });

  // Mutation để xác nhận giao hàng
  const confirmDeliveryMutation = useMutation({
    mutationFn: (orderId: string) => ApiOrder.updateOrder(orderId, { status: EOrderStatus.DELIVERED }),
    onSuccess: (updatedOrder) => {
      toast.success('Đã xác nhận giao hàng thành công!', {
        position: "top-right",
        autoClose: 3000,
      });
      
      // Emit events
      if (orderData) {
        orderEvents.delivered(updatedOrder.id, updatedOrder.userId);
        orderEvents.updated(updatedOrder.id, EOrderStatus.DELIVERED, orderData.status);
      }
      
      queryClient.invalidateQueries({ queryKey: ["order-detail", id] });
    },
    onError: (error: any) => {
      toast.error(error?.response?.data?.message || 'Có lỗi xảy ra khi xác nhận giao hàng!', {
        position: "top-right",
        autoClose: 5000,
      });
    },
  });

  // Subscribe to order events
  useEffect(() => {
    if (!id) return;

    const unsubscribeStatusChange = orderEvents.onStatusChanged((data) => {
      if (data.orderId === id) {
        toast.info(`Trạng thái đơn hàng đã được cập nhật thành: ${data.newStatus}`, {
          position: "top-right",
          autoClose: 5000,
        });
      }
    });

    return () => {
      unsubscribeStatusChange();
    };
  }, [id]);

  const handleCancelOrder = () => {
    if (!id || !orderStateMachine) return;
    
    // Kiểm tra với state machine
    if (!orderStateMachine.canCancel()) {
      toast.error('Không thể hủy đơn hàng ở trạng thái hiện tại!', {
        position: "top-right",
        autoClose: 5000,
      });
      return;
    }
    
    if (window.confirm('Bạn có chắc chắn muốn hủy đơn hàng này?')) {
      cancelOrderMutation.mutate(id);
    }
  };

  const handleConfirmDelivery = () => {
    if (!id || !orderStateMachine) return;
    
    // Kiểm tra với state machine
    if (!orderStateMachine.canDeliver()) {
      toast.error('Không thể xác nhận giao hàng ở trạng thái hiện tại!', {
        position: "top-right",
        autoClose: 5000,
      });
      return;
    }
    
    if (window.confirm('Bạn có chắc chắn muốn xác nhận đã giao hàng?')) {
      confirmDeliveryMutation.mutate(id);
    }
  };

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString("vi-VN");
  };

  const formatCurrency = (amount: string | number) => {
    const num = typeof amount === "string" ? parseFloat(amount) : amount;
    return new Intl.NumberFormat("vi-VN", {
      style: "currency",
      currency: "VND",
    }).format(num);
  };

  const getStatusText = (status: EOrderStatus | string) => {
    const statusMap: Record<string, string> = {
      [EOrderStatus.CREATED]: "Đã tạo",
      [EOrderStatus.CONFIRMED]: "Đã xác nhận",
      [EOrderStatus.DELIVERED]: "Đã giao hàng",
      [EOrderStatus.CANCELLED]: "Đã hủy",
    };
    return statusMap[status] || status;
  };

  if (isLoading) {
    return <div className="text-center text-lg mt-10">Đang tải chi tiết đơn hàng...</div>;
  }
  if (isError || !orderData) {
    return <div className="text-center text-red-500 mt-10">Không thể tải chi tiết đơn hàng</div>;
  }

  const order: IOrder = orderData;

  return (
    <div className="container flex flex-col w-full h-full gap-6 mx-auto p-6">
      <div className="flex flex-row">
        <Breadcrumbs maxItems={2} aria-label="breadcrumb">
          <Link underline="hover" color="inherit" href="/">
            Home
          </Link>
          <Typography sx={{color: "text.primary"}}>Order Detail</Typography>
        </Breadcrumbs>
      </div>
      
      <div className="flex flex-row">
        <div className="flex flex-col shadow-md h-full gap-4 border border-gray-300 rounded-lg p-5 mx-auto">
          <div className="flex flex-row justify-between items-center mb-5">
            <div className="text-4xl font-bold">Chi tiết đơn hàng</div>
            <div className={`text-md font-bold px-3 py-1 rounded-lg ${
              order.status === EOrderStatus.CANCELLED ? 'bg-red-100 text-red-600' :
              order.status === EOrderStatus.DELIVERED ? 'bg-green-100 text-green-600' :
              order.status === EOrderStatus.CONFIRMED ? 'bg-blue-100 text-blue-600' :
              'bg-yellow-100 text-yellow-600'
            }`}>
              {getStatusText(order.status)}
            </div>
          </div>
          
          {/* State Machine Info */}
          {orderStateMachine && (
            <div className="mb-4 p-3 bg-blue-50 rounded-lg">
              <div className="text-sm font-semibold text-blue-800 mb-2">Thông tin trạng thái:</div>
              <div className="text-sm text-blue-700">
                <div>Trạng thái hiện tại: <span className="font-medium">{getStatusText(orderStateMachine.getCurrentState())}</span></div>
                <div>Hành động có thể thực hiện: 
                  {orderStateMachine.getAvailableActions().length > 0 ? (
                    <span className="font-medium"> {orderStateMachine.getAvailableActions().join(', ')}</span>
                  ) : (
                    <span className="italic"> Không có</span>
                  )}
                </div>
              </div>
            </div>
          )}
          
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div className="flex flex-col gap-3">
              <div className="text-md font-bold">Mã đơn hàng:</div>
              <div className="text-md font-medium">{order.id}</div>
            </div>
            
            <div className="flex flex-col gap-3">
              <div className="text-md font-bold">ID khách hàng:</div>
              <div className="text-md font-medium">{order.userId}</div>
            </div>
            
            <div className="flex flex-col gap-3">
              <div className="text-md font-bold">Ngày đặt hàng:</div>
              <div className="text-md font-medium">
                {formatDate(order.createdAt)}
              </div>
            </div>
            
            <div className="flex flex-col gap-3">
              <div className="text-md font-bold">Tổng tiền:</div>
              <div className="text-md font-medium text-green-600 text-lg font-semibold">
                {formatCurrency(order.totalAmount)}
              </div>
            </div>
          </div>
          
          <div className="flex flex-col gap-3">
            <div className="text-md font-bold">Địa chỉ giao hàng:</div>
            <div className="text-md font-medium">
              {order.deliveryAddress}
            </div>
          </div>
          
          <div className="flex flex-col gap-3">
            <div className="text-md font-bold">Ghi chú:</div>
            <div className="text-md font-normal mb-4 text-justify">
              {order.notes}
            </div>
          </div>

          {/* Product List */}
          <div className="border-t pt-4">
            <div className="text-xl font-bold mb-4">Sản phẩm trong đơn hàng:</div>
            {order.items?.map((item: any, index: number) => (
              <div key={index} className="flex justify-between items-center py-3 border-b">
                <div>
                  <div className="text-md font-medium">Sản phẩm #{item.productId || item.id}</div>
                  <div className="text-sm text-gray-600">Số lượng: {item.quantity}</div>
                </div>
                <div className="text-right">
                  <div className="text-md font-medium">{formatCurrency(item.price)}</div>
                  <div className="text-sm text-gray-600">
                    Tổng: {formatCurrency(item.quantity * item.price)}
                  </div>
                </div>
              </div>
            ))}
          </div>

          {/* Action Buttons */}
          <div className="flex flex-row justify-center gap-3 mt-6">
            {orderStateMachine?.canCancel() && (
              <Button 
                variant="contained" 
                color="error"
                onClick={handleCancelOrder}
                disabled={cancelOrderMutation.isPending}
              >
                {cancelOrderMutation.isPending ? 'Đang hủy...' : 'Hủy đơn hàng'}
              </Button>
            )}
            {orderStateMachine?.canDeliver() && (
              <Button 
                variant="contained" 
                color="primary"
                onClick={handleConfirmDelivery}
                disabled={confirmDeliveryMutation.isPending}
              >
                {confirmDeliveryMutation.isPending ? 'Đang xác nhận...' : 'Xác nhận đã giao hàng'}
              </Button>
            )}
          </div>
        </div>
      </div>

      {/* Timeline and Payment Status */}
      <div className="space-y-4">
        {/* Order Timeline */}
        <OrderTimeline
          currentStatus={order.status}
          createdAt={order.createdAt}
          updatedAt={order.updatedAt}
        />
        
        {/* Payment Status Monitor */}
        <PaymentStatusMonitor
          orderId={order.id}
          onPaymentSuccess={() => {
            toast.success('Thanh toán thành công!');
            queryClient.invalidateQueries({ queryKey: ["order-detail", id] });
          }}
          onPaymentFailed={() => {
            toast.error('Thanh toán thất bại!');
          }}
        />
      </div>
    </div>
  );
}
