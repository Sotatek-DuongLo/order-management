export default () => ({
  port: parseInt(process.env.PORT || '3000', 10),
  database: {
    host: process.env.DB_HOST || 'localhost',
    port: parseInt(process.env.DB_PORT || '5432', 10),
    username: process.env.DB_USERNAME || 'postgres',
    password: process.env.DB_PASSWORD || 'password',
    database: process.env.DB_DATABASE || 'orders_db',
  },
  payments: {
    apiUrl: process.env.PAYMENTS_API_URL || 'http://localhost:3001',
  },
  nodeEnv: process.env.NODE_ENV || 'development',
});
