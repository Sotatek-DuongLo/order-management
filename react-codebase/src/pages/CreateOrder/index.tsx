import { useEffect } from 'react';
import { useFormik } from 'formik';
import * as Yup from 'yup';
import {
  Breadcrumbs,
  Button,
  Link,
  Typography,
  TextField,
  Card,
  CardContent,
  IconButton,
  Autocomplete,
} from '@mui/material';
import { Add as AddIcon, Delete as DeleteIcon } from '@mui/icons-material';
import { useNavigate } from 'react-router-dom';
import { toast, ToastContainer } from 'react-toastify';
import { useQuery, useMutation } from '@tanstack/react-query';
import 'react-toastify/dist/ReactToastify.css';
import ApiOrder from '@/api/ApiOrder';
import { IProduct } from '@/types';
import { orderEvents } from '@/utils/eventBus';

interface OrderItem {
  productId: number;
  quantity: number;
  price: number;
}

const validationSchema = Yup.object({
  userId: Yup.string().required('ID khách hàng là bắt buộc'),
  totalAmount: Yup.number()
    .min(0, 'Tổng tiền phải lớn hơn hoặc bằng 0')
    .required('Tổng tiền là bắt buộc'),
  deliveryAddress: Yup.string().required('Địa chỉ giao hàng là bắt buộc'),
  notes: Yup.string(),
  items: Yup.array().of(
    Yup.object({
      productId: Yup.number().required('Sản phẩm là bắt buộc'),
      quantity: Yup.number()
        .min(1, 'Số lượng phải lớn hơn 0')
        .required('Số lượng là bắt buộc'),
      price: Yup.number()
        .min(0, 'Giá phải lớn hơn hoặc bằng 0')
        .required('Giá là bắt buộc'),
    })
  ).min(1, 'Phải có ít nhất 1 sản phẩm'),
});

export default function CreateOrder(): JSX.Element {
  const navigate = useNavigate();

  // Lấy danh sách sản phẩm từ API
  const {
    data: products,
    isLoading: isLoadingProducts,
    isError: isErrorProducts,
  } = useQuery({
    queryKey: ['products'],
    queryFn: () => ApiOrder.getProducts(),
  });

  // Mutation để tạo order
  const createOrderMutation = useMutation({
    mutationFn: (orderData: any) => ApiOrder.createOrder(orderData),
    onSuccess: (createdOrder) => {
      toast.success('Đơn hàng đã được tạo thành công! Đang chuyển về trang chủ...', {
        position: "top-right",
        autoClose: 2000,
        hideProgressBar: false,
        closeOnClick: true,
        pauseOnHover: true,
        draggable: true,
      });
      
      // Emit order creation event
      orderEvents.created(createdOrder.id, createdOrder.userId);
      
      setTimeout(() => {
        navigate('/');
      }, 2000);
    },
    onError: () => {
      toast.error('Có lỗi xảy ra khi tạo đơn hàng. Vui lòng thử lại!', {
        position: "top-right",
        autoClose: 5000,
        hideProgressBar: false,
        closeOnClick: true,
        pauseOnHover: true,
        draggable: true,
      });
    },
  });

  const formik = useFormik({
    initialValues: {
      userId: 'duonglv',
      totalAmount: 0,
      deliveryAddress: '',
      notes: '',
      items: [
        {
          productId: 0,
          quantity: 1,
          price: 0,
        },
      ] as OrderItem[],
    },
    validationSchema,
    onSubmit: async (values) => {
      const orderData = {
        userId: values.userId,
        totalAmount: values.totalAmount,
        items: values.items.map(item => ({
          productId: item.productId,
          quantity: item.quantity,
          price: item.price,
        })),
        deliveryAddress: values.deliveryAddress,
        notes: values.notes,
      };

      createOrderMutation.mutate(orderData);
    },
  });

  // Hiển thị toast cho validation errors
  useEffect(() => {
    if (formik.touched.items && formik.errors.items) {
      toast.error(formik.errors.items as string, {
        position: "top-right",
        autoClose: 5000,
        hideProgressBar: false,
        closeOnClick: true,
        pauseOnHover: true,
        draggable: true,
      });
    }
  }, [formik.touched.items, formik.errors.items]);

  const addItem = () => {
    formik.setFieldValue('items', [
      ...formik.values.items,
      { productId: 0, quantity: 1, price: 0 },
    ]);
  };

  const removeItem = (index: number) => {
    const newItems = formik.values.items.filter((_, i) => i !== index);
    formik.setFieldValue('items', newItems);
    
    // Recalculate total amount
    const newTotal = newItems.reduce((sum, item) => sum + (item.quantity * item.price), 0);
    formik.setFieldValue('totalAmount', newTotal);
  };

  const updateItem = (index: number, field: keyof OrderItem, value: string | number) => {
    const newItems = [...formik.values.items];
    newItems[index] = { ...newItems[index], [field]: value };
    formik.setFieldValue('items', newItems);
    
    // Recalculate total amount
    const newTotal = newItems.reduce((sum, item) => sum + (item.quantity * item.price), 0);
    formik.setFieldValue('totalAmount', newTotal);
  };

  const handleProductChange = (index: number, product: IProduct | null) => {
    const newItems = [...formik.values.items];
    
    if (product) {
      newItems[index] = { 
        ...newItems[index], 
        productId: product.id, 
        price: product.price 
      };
    } else {
      newItems[index] = { 
        ...newItems[index], 
        productId: 0, 
        price: 0 
      };
    }
    
    formik.setFieldValue('items', newItems);
    formik.setFieldTouched(`items.${index}.productId`, true);
    
    // Recalculate total amount
    const newTotal = newItems.reduce((sum, item) => sum + (item.quantity * item.price), 0);
    formik.setFieldValue('totalAmount', newTotal);
  };
  const getProductById = (productId: number): IProduct | undefined => {
    return products?.find((p: IProduct) => p.id === productId);
  };

  if (isLoadingProducts) {
    return <div className="text-center text-lg mt-10">Đang tải danh sách sản phẩm...</div>;
  }

  if (isErrorProducts) {
    return <div className="text-center text-red-500 mt-10">Không thể tải danh sách sản phẩm</div>;
  }

  return (
    <div className="container flex flex-col w-full h-full gap-6 mx-auto">
      <ToastContainer />
      <div className="flex flex-row">
        <Breadcrumbs maxItems={2} aria-label="breadcrumb">
          <Link underline="hover" color="inherit" href="/">
            Home
          </Link>
          <Typography sx={{ color: 'text.primary' }}>Tạo đơn hàng</Typography>
        </Breadcrumbs>
      </div>

      <div className="flex flex-row justify-center gap-4">
        <Card className="w-2/3 shadow-md">
          <CardContent className="p-6">
            <Typography variant="h4" className="mb-6 font-bold">
              Tạo đơn hàng mới
            </Typography>

            <form onSubmit={formik.handleSubmit}>
              <div className="space-y-6">
                {/* Thông tin khách hàng */}
                <div>
                  <Typography variant="h6" className="mb-3">
                    Thông tin khách hàng
                  </Typography>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-1 gap-4">
                  <TextField
                    fullWidth
                    id="userId"
                    name="userId"
                    label="ID Khách hàng"
                    value={formik.values.userId}
                    onChange={formik.handleChange}
                    error={formik.touched.userId && Boolean(formik.errors.userId)}
                    helperText={formik.touched.userId && formik.errors.userId}
                    InputProps={{
                      readOnly: true,
                    }}
                    disabled
                  />
                </div>

                <div>
                  <TextField
                    fullWidth
                    id="deliveryAddress"
                    name="deliveryAddress"
                    label="Địa chỉ giao hàng"
                    multiline
                    rows={3}
                    value={formik.values.deliveryAddress}
                    onChange={formik.handleChange}
                    error={formik.touched.deliveryAddress && Boolean(formik.errors.deliveryAddress)}
                    helperText={formik.touched.deliveryAddress && formik.errors.deliveryAddress}
                  />
                </div>

                <div>
                  <TextField
                    fullWidth
                    id="notes"
                    name="notes"
                    label="Ghi chú"
                    multiline
                    rows={2}
                    value={formik.values.notes}
                    onChange={formik.handleChange}
                    error={formik.touched.notes && Boolean(formik.errors.notes)}
                    helperText={formik.touched.notes && formik.errors.notes}
                  />
                </div>

                {/* Danh sách sản phẩm */}
                <div>
                  <div className="flex justify-between items-center mb-3">
                    <Typography variant="h6">Danh sách sản phẩm</Typography>
                    <Button
                      variant="outlined"
                      startIcon={<AddIcon />}
                      onClick={addItem}
                      size="small"
                    >
                      Thêm sản phẩm
                    </Button>
                  </div>
                </div>

                {formik.values.items.map((item, index) => (
                  <div key={index} className="mb-4">
                    <Card variant="outlined" className="p-4">
                      <div className="grid grid-cols-1 md:grid-cols-12 gap-4 items-center">
                        <div className="md:col-span-4">
                          <Autocomplete
                            options={products || []}
                            getOptionLabel={(option: IProduct) => `${option.name} - ${new Intl.NumberFormat('vi-VN', {
                              style: 'currency',
                              currency: 'VND'
                            }).format(option.price)}`}
                            value={getProductById(item.productId) || null}
                            onChange={(_, newValue) => handleProductChange(index, newValue)}
                            renderInput={(params) => (
                              <TextField
                                {...params}
                                label="Chọn sản phẩm"
                                error={
                                  formik.touched.items?.[index]?.productId &&
                                  Boolean((formik.errors.items?.[index] as any)?.productId)
                                }
                                helperText={
                                  formik.touched.items?.[index]?.productId &&
                                  (formik.errors.items?.[index] as any)?.productId
                                }
                              />
                            )}
                          />
                        </div>
                        <div className="md:col-span-2">
                          <TextField
                            fullWidth
                            label="Số lượng"
                            type="number"
                            value={item.quantity}
                            onChange={(e) => updateItem(index, 'quantity', parseInt(e.target.value) || 0)}
                            error={
                              formik.touched.items?.[index]?.quantity &&
                              Boolean((formik.errors.items?.[index] as any)?.quantity)
                            }
                            helperText={
                              formik.touched.items?.[index]?.quantity &&
                              (formik.errors.items?.[index] as any)?.quantity
                            }
                          />
                        </div>
                        <div className="md:col-span-3">
                          <TextField
                            fullWidth
                            label="Giá (VND)"
                            type="number"
                            value={item.price}
                            InputProps={{
                              readOnly: true,
                            }}
                          />
                        </div>
                        <div className="md:col-span-2">
                          <Typography variant="body2" className="font-semibold">
                            Thành tiền: {new Intl.NumberFormat('vi-VN', {
                              style: 'currency',
                              currency: 'VND'
                            }).format(item.quantity * item.price)}
                          </Typography>
                        </div>
                        <div className="md:col-span-1 flex justify-center">
                          <IconButton
                            color="error"
                            onClick={() => removeItem(index)}
                            disabled={formik.values.items.length === 1}
                          >
                            <DeleteIcon />
                          </IconButton>
                        </div>
                      </div>
                    </Card>
                  </div>
                ))}

                {formik.touched.items && formik.errors.items && (
                  <div>
                    <Typography color="error" variant="body2">
                      {formik.errors.items as string}
                    </Typography>
                  </div>
                )}

                {/* Buttons */}
                <div className="flex justify-end gap-3 mt-6">
                  <Button
                    variant="outlined"
                    onClick={() => navigate('/')}
                    disabled={createOrderMutation.isPending}
                  >
                    Hủy
                  </Button>
                  <Button
                    type="submit"
                    variant="contained"
                    color="primary"
                    disabled={createOrderMutation.isPending || !formik.isValid}
                  >
                    {createOrderMutation.isPending ? 'Đang tạo...' : 'Tạo đơn hàng'}
                  </Button>
                </div>
              </div>
            </form>
          </CardContent>
        </Card>

        {/* Summary Card */}
        <Card className="w-1/3 h-fit shadow-md">
          <CardContent className="p-6">
            <Typography variant="h6" className="mb-4 font-bold">
              Tóm tắt đơn hàng
            </Typography>
            
            <div className="space-y-3">
              <div className="flex justify-between">
                <Typography>Số sản phẩm:</Typography>
                <Typography className="font-semibold">
                  {formik.values.items.length}
                </Typography>
              </div>
              
              <div className="flex justify-between">
                <Typography>Tổng số lượng:</Typography>
                <Typography className="font-semibold">
                  {formik.values.items.reduce((sum, item) => sum + item.quantity, 0)}
                </Typography>
              </div>
              
              <hr />
              
              <div className="flex justify-between">
                <Typography variant="h6">Tổng tiền:</Typography>
                <Typography variant="h6" className="font-bold text-primary">
                  {new Intl.NumberFormat('vi-VN', {
                    style: 'currency',
                    currency: 'VND'
                  }).format(formik.values.totalAmount)}
                </Typography>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
