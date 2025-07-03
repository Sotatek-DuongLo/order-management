
import {Breadcrumbs, Button, Link, Typography} from "@mui/material";
import { EOrderStatus, IOrder } from "@/types";

export default function OrderDetail(): JSX.Element {
  // Dữ liệu mẫu cho order detail
  const mockOrder: IOrder = {
    id: "order-1-123456789",
    userId: "user-1",
    totalAmount: 150000,
    status: EOrderStatus.DELIVERED,
    items: [
      {
        id: 1,
        name: "Sản phẩm 1",
        quantity: 2,
        price: 75000,
      },
    ],
    deliveryAddress: "123 Nguyễn Văn A, Quận 1, TP.HCM",
    notes: "Giao hàng vào buổi sáng, gọi điện trước khi giao",
    createdAt: "2024-01-15T08:00:00.000Z",
    updatedAt: "2024-01-15T10:30:00.000Z",
  };

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString("vi-VN");
  };

  const formatCurrency = (amount: number) => {
    return new Intl.NumberFormat("vi-VN", {
      style: "currency",
      currency: "VND",
    }).format(amount);
  };

  const getStatusText = (status: EOrderStatus) => {
    const statusMap = {
      [EOrderStatus.CREATED]: "Đã tạo",
      [EOrderStatus.CONFIRMED]: "Đã xác nhận",
      [EOrderStatus.DELIVERED]: "Đã giao hàng",
      [EOrderStatus.CANCELLED]: "Đã hủy",
    };
    return statusMap[status] || status;
  };

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
              {getStatusText(mockOrder.status)}
            </div>
          </div>
          <div className="flex flex-col gap-3">
            <div className="text-md font-bold">Mã đơn hàng:</div>
            <div className="text-md font-medium">{mockOrder.id}</div>
          </div>
          <div className="flex flex-col gap-3">
            <div className="text-md font-bold">ID khách hàng:</div>
            <div className="text-md font-medium">{mockOrder.userId}</div>
          </div>
          <div className="flex flex-col gap-3">
            <div className="text-md font-bold">Địa chỉ giao hàng:</div>
            <div className="text-md font-medium">
              {mockOrder.deliveryAddress}
            </div>
          </div>
          <div className="flex flex-col gap-3">
            <div className="text-md font-bold">Ngày đặt hàng:</div>
            <div className="text-md font-medium">
              {formatDate(mockOrder.createdAt)}
            </div>
          </div>
          <div className="flex flex-col gap-3">
            <div className="text-md font-bold">Ghi chú:</div>
            <div className="text-md font-normal mb-4 text-justify">
              {mockOrder.notes}
            </div>
          </div>
        </div>
        <div className="w-1/3 h-full">
          <div className="border border-gray-300 rounded-lg p-5 flex flex-col shadow-md justify-center gap-4 mb-4">
            <div className="text-2xl font-bold">Sản phẩm:</div>
            {mockOrder.items?.map((item: any, index: number) => (
              <div key={index} className="flex flex-col gap-3">
                <div className="text-md font-bold">Sản phẩm {index + 1}:</div>
                <div className="text-md font-medium">ID: {item.productId}</div>
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
                {formatCurrency(mockOrder.totalAmount)}
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
