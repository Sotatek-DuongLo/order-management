import {Breadcrumbs, Button, Link, Typography} from "@mui/material";
import {useParams} from "react-router-dom";
import {useQuery} from "@tanstack/react-query";
import ApiOrder from "@/api/ApiOrder";
import {EOrderStatus, IOrder} from "@/types";

export default function OrderDetail(): JSX.Element {
  const { id } = useParams<{ id: string }>();
  const {
    data: orderData,
    isLoading,
    isError,
  } = useQuery({
    queryKey: ["order-detail", id],
    queryFn: () => ApiOrder.getOrderById(id!),
    enabled: !!id,
  });

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
    <div className="container flex flex-col w-full h-full gap-6 mx-auto">
      <div className="flex flex-row">
        <Breadcrumbs maxItems={2} aria-label="breadcrumb">
          <Link underline="hover" color="inherit" href="/">
            Home
          </Link>
          <Typography sx={{color: "text.primary"}}>Order Detail</Typography>
        </Breadcrumbs>
      </div>
      <div className="flex flex-row justify-center gap-4">
        <div className="flex flex-col shadow-md w-2/3 h-full gap-4 border border-gray-300 rounded-lg p-5">
          <div className="flex flex-row justify-between items-center mb-5">
            <div className="text-4xl font-bold">Chi tiết đơn hàng</div>
            <div className="text-md font-bold">
              {getStatusText(order.status)}
            </div>
          </div>
          <div className="flex flex-col gap-3">
            <div className="text-md font-bold">Mã đơn hàng:</div>
            <div className="text-md font-medium">{order.id}</div>
          </div>
          <div className="flex flex-col gap-3">
            <div className="text-md font-bold">ID khách hàng:</div>
            <div className="text-md font-medium">{order.userId}</div>
          </div>
          <div className="flex flex-col gap-3">
            <div className="text-md font-bold">Địa chỉ giao hàng:</div>
            <div className="text-md font-medium">
              {order.deliveryAddress}
            </div>
          </div>
          <div className="flex flex-col gap-3">
            <div className="text-md font-bold">Ngày đặt hàng:</div>
            <div className="text-md font-medium">
              {formatDate(order.createdAt)}
            </div>
          </div>
          <div className="flex flex-col gap-3">
            <div className="text-md font-bold">Ghi chú:</div>
            <div className="text-md font-normal mb-4 text-justify">
              {order.notes}
            </div>
          </div>
        </div>
        <div className="w-1/3 h-full">
          <div className="border border-gray-300 rounded-lg p-5 flex flex-col shadow-md justify-center gap-4 mb-4">
            <div className="text-2xl font-bold">Sản phẩm:</div>
            {order.items?.map((item: any, index: number) => (
              <div key={index} className="flex flex-col gap-3">
                <div className="text-md font-bold">Sản phẩm {index + 1}:</div>
                <div className="text-md font-medium">ID: {item.productId || item.id}</div>
                <div className="text-md font-medium">
                  Số lượng: {item.quantity}
                </div>
                <div className="text-md font-medium">
                  Giá: {formatCurrency(item.price)}
                </div>
                <hr className="w-full" />
              </div>
            ))}
            <div className="flex flex-row justify-between gap-3">
              <div className="text-md font-bold">Tổng tiền:</div>
              <div className="text-md font-medium">
                {formatCurrency(order.totalAmount)}
              </div>
            </div>
          </div>
          <div className="flex flex-row justify-center gap-3">
            <Button variant="contained" color="error">
              Hủy bỏ
            </Button>
            <Button className="h-10" variant="contained" color="primary">
              Xác nhận đã giao hàng
            </Button>
          </div>
        </div>
      </div>
    </div>
  );
}
