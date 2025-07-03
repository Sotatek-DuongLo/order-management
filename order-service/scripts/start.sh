#!/bin/bash

echo "🚀 Starting Orders Service..."

# Kiểm tra xem Docker có đang chạy không
if ! docker info > /dev/null 2>&1; then
    echo "❌ Docker is not running. Please start Docker first."
    exit 1
fi

# Khởi động database và mock payments service
echo "📦 Starting PostgreSQL database and mock payments service..."
docker-compose up -d postgres payments-mock

# Đợi database khởi động
echo "⏳ Waiting for database to be ready..."
sleep 10

# Cài đặt dependencies
echo "📦 Installing dependencies..."
yarn install

# Chạy migrations (nếu có)
echo "🗄️ Setting up database..."
# TypeORM sẽ tự động sync schema trong development mode

# Khởi động ứng dụng
echo "🎯 Starting Orders Service..."
yarn start:dev 