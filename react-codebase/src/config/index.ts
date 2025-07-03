// NAME
const STORE_NAME = "state";

// NETWORK
const NETWORK_CONFIG = {
  API_BASE_URL: (import.meta.env.VITE_API_BASE_URL || "http://localhost:3000") + "/api",
  TIMEOUT: 30000,
  RETRY: false,
  USE_TOKEN: true,
  WITH_METADATA: false,
  DISPLAY_ERROR: true,
};

// PATHNAME
const PATHNAME = {
  HOME: "/",
  LOGIN: "/login",
  CREATE_ORDER: "/create-order",
  ORDER_DETAIL: "/order-detail",
};

// LANGUAGE
const LANGUAGE = {
  DEFAULT: "vi",
};

// APP CONFIG
const APP_CONFIG = {
  NAME: import.meta.env.VITE_APP_NAME || "Order Management System",
  VERSION: import.meta.env.VITE_APP_VERSION || "1.0.0",
  ENV: import.meta.env.VITE_NODE_ENV || "development",
};

export default {
  STORE_NAME,
  NETWORK_CONFIG,
  PATHNAME,
  LANGUAGE,
  APP_CONFIG,
};
