import OrderCard from "@/components/OrderCard";
import { useNavigate } from "react-router-dom";
import { Button } from "@mui/material";
import { useInfiniteQuery } from "@tanstack/react-query";
import { useEffect, useRef } from "react";
import ApiOrder from "@/api/ApiOrder";
import QUERY_KEY from "@/api/QueryKey";
import { IDataWithMeta } from "@/api/Fetcher";
import { IOrder } from "@/types";

const PAGE_SIZE = 9; // hoặc 10, tuỳ bạn

export default function Home(): JSX.Element {
  const navigate = useNavigate();
  const observer = useRef<IntersectionObserver | null>(null);
  const lastElementRef = useRef<HTMLDivElement | null>(null);

  const {
    data,
    fetchNextPage,
    hasNextPage,
    isLoading,
    isError,
  } = useInfiniteQuery<IDataWithMeta<IOrder[]>, Error>({
    queryKey: [QUERY_KEY.ORDER.LIST],
    queryFn: ({ pageParam = 1 }) =>
      ApiOrder.getOrders({ page: pageParam, limit: PAGE_SIZE }),
    getNextPageParam: (lastPage) =>
      lastPage?.meta?.totalPage > lastPage?.meta?.currentPage
        ? (lastPage?.meta?.currentPage || 1) + 1
        : undefined,
    initialPageParam: 1,
  });

  useEffect(() => {
    if (isLoading || isError) return;
    if (observer.current) observer.current.disconnect();
    observer.current = new IntersectionObserver((entries) => {
      if (entries[0].isIntersecting && hasNextPage) {
        fetchNextPage();
      }
    });
    if (lastElementRef.current) {
      observer.current.observe(lastElementRef.current);
    }
    return () => {
      if (observer.current) observer.current.disconnect();
    };
  }, [isLoading, isError, data, hasNextPage]);

  return (
    <div className="flex flex-col items-center justify-center w-full h-full gap-4 mb-10">
      <div className="text-4xl font-bold text-center">Các order của bạn</div>
      <div className="text-2xl text-center">Quản lý đơn hàng</div>
      <div className="container flex flex-col gap-4">
        <div className="flex justify-end w-full px-10">
          <Button variant="contained" color="primary" onClick={() => navigate("/create-order")}>Tạo đơn hàng</Button>
        </div>
        {isLoading ? (
          <div className="text-center text-lg">Đang tải đơn hàng...</div>
        ) : isError ? (
          <div className="text-center text-red-500">Không thể tải danh sách đơn hàng</div>
        ) : (
          <div className="grid grid-cols-3 justify-center gap-9 px-10">
            {data?.pages?.flatMap(page =>
              (page.data ?? []).map(order => (
                <OrderCard
                  key={order.id}
                  {...order}
                  onClick={() => navigate(`/order-detail/${order.id}`)}
                />
              ))
            )}
          </div>
        )}
        {!isLoading && <div ref={lastElementRef} className="h-1"></div>}
      </div>
    </div>
  );
}
