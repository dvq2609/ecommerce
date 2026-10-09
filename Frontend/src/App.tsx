import React from 'react';
import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom';
import { LoginPage } from './pages/LoginPage';
import { RegisterPage } from './pages/RegisterPage';
import { ForgotPasswordPage } from './pages/ForgotPasswordPage';
import { VerifyNoticePage } from './pages/VerifyNoticePage';
import { HomePage } from './pages/HomePage';
import { ProductDetailPage } from './pages/ProductDetailPage';
import { AddProductPage } from './pages/AddProductPage';
import { ColorsManagePage } from './pages/ColorsManagePage';
import { SizesManagePage } from './pages/SizesManagePage';
import { AdminShippingPage } from './pages/AdminShippingPage';
import { CartPage } from './pages/CartPage';
import { CheckoutPage } from './pages/CheckoutPage';
import { OrderSuccessPage } from './pages/OrderSuccessPage';
import { OrdersHistoryPage } from './pages/OrdersHistoryPage';
import { MoMoCallbackPage } from './pages/MoMoCallbackPage';
import { ProfilePage } from './pages/ProfilePage';
import { ProtectedRoute } from './components/auth/ProtectedRoute';
import { CartProvider } from './context/CartContext';
import { CartDrawer } from './components/cart/CartDrawer';

export const App: React.FC = () => {
  return (
    <BrowserRouter>
      <CartProvider>
        <CartDrawer />
        <Routes>
        {/* Public Storefront Routes */}
        <Route path="/" element={<HomePage />} />
        <Route path="/cart" element={<CartPage />} />
        <Route path="/checkout" element={<CheckoutPage />} />
        <Route path="/order-success/:orderCode" element={<OrderSuccessPage />} />
        <Route path="/momo-callback" element={<MoMoCallbackPage />} />
        <Route path="/orders" element={<OrdersHistoryPage />} />
        <Route path="/profile" element={<ProfilePage />} />
        <Route path="/product/:id" element={<ProductDetailPage />} />
        <Route path="/product" element={<ProductDetailPage />} />

        {/* ADMIN ROUTES (Admin Only: System Standard Size Guide & Shipping Rules) */}
        <Route
          path="/admin/sizes"
          element={
            <ProtectedRoute allowedRoles={['admin']}>
              <SizesManagePage />
            </ProtectedRoute>
          }
        />
        <Route
          path="/admin/shipping"
          element={
            <ProtectedRoute allowedRoles={['admin']}>
              <AdminShippingPage />
            </ProtectedRoute>
          }
        />
        <Route path="/admin" element={<Navigate to="/admin/sizes" replace />} />

        {/* SELLER ROUTES (Seller Only: Product Creation & Color Palette) */}
        <Route
          path="/seller/products/new"
          element={
            <ProtectedRoute allowedRoles={['seller']}>
              <AddProductPage />
            </ProtectedRoute>
          }
        />
        <Route
          path="/seller/colors"
          element={
            <ProtectedRoute allowedRoles={['seller']}>
              <ColorsManagePage />
            </ProtectedRoute>
          }
        />
        <Route path="/seller" element={<Navigate to="/seller/products/new" replace />} />

        {/* Legacy / Direct Route Compatibility */}
        <Route path="/add-product" element={<Navigate to="/seller/products/new" replace />} />
        <Route path="/admin/products/new" element={<Navigate to="/seller/products/new" replace />} />

        {/* Auth Routes */}
        <Route path="/login" element={<LoginPage />} />
        <Route path="/register" element={<RegisterPage />} />
        <Route path="/forgot-password" element={<ForgotPasswordPage />} />
        <Route path="/verify-notice" element={<VerifyNoticePage />} />

        {/* Fallback to home */}
        <Route path="*" element={<Navigate to="/" replace />} />
      </Routes>
    </CartProvider>
  </BrowserRouter>
  );
};

export default App;
