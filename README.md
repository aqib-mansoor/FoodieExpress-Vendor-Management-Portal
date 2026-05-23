# FoodieExpress Vendor Portal

FoodieExpress is a comprehensive vendor management platform designed for restaurant owners and food service providers to manage their digital store presence, track orders, and monitor business performance in real-time.

## 🚀 Features

### 📊 Dashboard & Analytics
- **At-a-Glance Metrics**: Monitor total revenue, order count, active customers, and average order value.
- **Revenue Overview**: Interactive charts visualizing sales trends over time.
- **Real-time Alerts**: Automatic notifications for low-stock items and recent order activity.

### 🛍️ Order Management
- **Full Order Lifecycle**: Track orders from 'Pending' through 'Delivered' or 'Cancelled'.
- **Advanced Filtering**: Filter orders by status to prioritize preparation and delivery.
- **Export & Documentation**: One-click CSV export for order data and professional invoice printing.
- **Customer Updates**: Send SMS notification updates directly to customers.

### 🍔 Product & Inventory
- **Menu Management**: Add, update, and manage your product listings with ease.
- **Inventory Tracking**: Real-time stock counts with visual indicators for low or out-of-stock items.
- **Category Organization**: Group products for better customer navigation.

### ⚙️ Store Operations
- **Status Toggle**: Open or close your store to customers instantly.
- **Operating Hours**: Set flexible daily schedules for your business.
- **Delivery Configuration**: Define minimum order values and delivery radiuses.
- **Payment Flexibility**: Enable or disable Cash on Delivery and Online Card payments.

### 💰 Payments & Payouts
- **Earnings Tracking**: Detailed history of all transactions and payouts.
- **Early Payout System**: Request immediate funds with a secure confirmation flow and payment method selection.
- **Financial Statements**: Downloadable transaction records for accounting.

### 👥 Staff Management
- **Role-based Access**: Manage manager, chef, cashier, and delivery staff profiles.
- **Staff Status**: Track who is active, on leave, or inactive.

## 🛠️ Tech Stack

- **Frontend**: React 18 with TypeScript
- **Styling**: Tailwind CSS
- **Icons**: Lucide React
- **Charts**: Recharts
- **Routing**: React Router DOM 6
- **Notifications**: React Hot Toast
- **Animations**: Framer Motion
- **Data Persistence**: Local Storage (via specialized Data Service)

## 📂 Project Structure

- `/src/pages`: Individual feature screens (Orders, Payments, Products, etc.)
- `/src/components`: Reusable UI components (Header, Sidebar, Layout, Cards)
- `/src/services`: Data handling logic and persistence
- `/src/context`: Authentication and global state management
- `/src/lib`: Utility functions and styling helpers

## 🔑 Getting Started

The platform uses a default authentication setup for demonstration:
- **Default Username**: Any valid email format
- **Default Password**: `admin`

---
*Created with FoodieExpress Vendor Team*
