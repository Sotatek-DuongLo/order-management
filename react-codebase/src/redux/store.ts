import { configureStore, createSlice } from '@reduxjs/toolkit';

// Tạo một slice mặc định để tránh lỗi
const defaultSlice = createSlice({
  name: 'default',
  initialState: {
    value: 0,
  },
  reducers: {
    increment: (state) => {
      state.value += 1;
    },
  },
});

export const { increment } = defaultSlice.actions;

const store = configureStore({
  reducer: {
    default: defaultSlice.reducer,
  },
  middleware: (getDefaultMiddleware) =>
    getDefaultMiddleware({
      serializableCheck: false,
    }),
});

export default store;
export type IRootState = ReturnType<typeof store.getState>;
export type AppDispatch = typeof store.dispatch;
