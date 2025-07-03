import { IOrder, EOrderStatus } from "@/types";
import {Button, Card, CardActions, CardContent} from "@mui/material";

export default function OrderCard({
  id,
  totalAmount,
  status,
  deliveryAddress,
  items,
  notes,
  createdAt,
  onClick,
}: IOrder) {
  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString('vi-VN');
  };

  const formatCurrency = (amount: number) => {
    return new Intl.NumberFormat('vi-VN', {
      style: 'currency',
      currency: 'VND'
    }).format(amount);
  };

  const getStatusText = (status: EOrderStatus) => {
    const statusMap = {
      [EOrderStatus.CREATED]: 'Đã tạo',
      [EOrderStatus.CONFIRMED]: 'Đã xác nhận',
      [EOrderStatus.DELIVERED]: 'Đã giao hàng',
      [EOrderStatus.CANCELLED]: 'Đã hủy'
    };
    return statusMap[status] || status;
  };

  return (
    <div className="cursor-pointer" onClick={onClick}>
      <Card sx={{padding: 1, boxShadow: 3, height: 280, display: 'flex', flexDirection: 'column'}}>
        <CardContent sx={{flexGrow: 1, display: 'flex', flexDirection: 'column'}}>
          <div className="flex flex-row justify-between items-center mb-4">
            <div className="text-xl font-bold">Order #{id.slice(0, 8)}</div>
            <div className="text-sm font-semibold">{getStatusText(status)}</div>
          </div>
          <div className="text-sm font-normal mb-4 flex flex-row gap-2">
            <div>Ngày đặt: {formatDate(createdAt)}</div>
          </div>
          <div className="text-sm text-normal mb-4 flex-shrink-0">
            Đơn hàng: {items?.map((item) => item?.name).join(', ')}
          </div>
          <div className="flex-grow flex flex-col justify-between">
            <div>
              {deliveryAddress && (
                <div className="text-sm font-normal mb-2">
                  <div>Địa chỉ: {deliveryAddress}</div>
                </div>
              )}
              <div className="text-sm font-normal mb-2 text-justify overflow-hidden line-clamp-2">
                <div>Ghi chú: {notes || 'Không có ghi chú'}</div>
              </div>
            </div>
            <div className="flex flex-row gap-1 items-center mt-auto">
              <div className="text-sm font-semibold">Tổng tiền:</div>
              <div className="text-sm font-normal">{formatCurrency(parseFloat(totalAmount))}</div>
            </div>
          </div>
        </CardContent>
        <CardActions className="flex justify-between">
          <Button
            color="error"
            onClick={(e) => {
              e.stopPropagation();
            }}
          >
            Huỷ
          </Button>
          <Button color="success">Xem chi tiết</Button>
        </CardActions>
      </Card>
    </div>
  );
}