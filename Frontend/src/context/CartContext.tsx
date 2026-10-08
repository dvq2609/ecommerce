import React, { createContext, useContext, useState, useEffect, useCallback } from 'react';
import type { CartData } from '../types/cart';
import { cartService } from '../services/cartService';

interface CartContextType {
  cart: CartData | null;
  itemCount: number;
  totalAmount: number;
  loading: boolean;
  isDrawerOpen: boolean;
  openDrawer: () => void;
  closeDrawer: () => void;
  toggleDrawer: () => void;
  refreshCart: () => Promise<void>;
  addToCart: (
    productId: number,
    productVariantId?: number | null,
    quantity?: number
  ) => Promise<{ success: boolean; message?: string }>;
  updateQuantity: (
    cartItemId: number,
    quantity: number
  ) => Promise<{ success: boolean; message?: string }>;
  removeItem: (
    cartItemId: number
  ) => Promise<{ success: boolean; message?: string }>;
  clearCart: () => Promise<{ success: boolean; message?: string }>;
}

const CartContext = createContext<CartContextType | undefined>(undefined);

export const CartProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [cart, setCart] = useState<CartData | null>(null);
  const [loading, setLoading] = useState<boolean>(false);
  const [isDrawerOpen, setIsDrawerOpen] = useState<boolean>(false);

  const isAuthenticated = () => !!localStorage.getItem('accessToken');

  const refreshCart = useCallback(async () => {
    if (!isAuthenticated()) {
      setCart(null);
      return;
    }

    try {
      setLoading(true);
      const data = await cartService.getCart();
      setCart(data);
    } catch (error) {
      console.warn('Không thể tải giỏ hàng:', error);
      // Nếu lỗi 401 thì xóa giỏ hàng
      if (error instanceof Error && error.message.includes('đăng nhập')) {
        setCart(null);
      }
    } finally {
      setLoading(false);
    }
  }, []);

  // Tải giỏ hàng khi khởi tạo hoặc khi đăng nhập thay đổi
  useEffect(() => {
    refreshCart();

    const handleStorageChange = (e: StorageEvent) => {
      if (e.key === 'accessToken') {
        refreshCart();
      }
    };
    window.addEventListener('storage', handleStorageChange);
    return () => window.removeEventListener('storage', handleStorageChange);
  }, [refreshCart]);

  const openDrawer = () => setIsDrawerOpen(true);
  const closeDrawer = () => setIsDrawerOpen(false);
  const toggleDrawer = () => setIsDrawerOpen((prev) => !prev);

  const addToCart = async (
    productId: number,
    productVariantId?: number | null,
    quantity = 1
  ): Promise<{ success: boolean; message?: string }> => {
    if (!isAuthenticated()) {
      return {
        success: false,
        message: 'Vui lòng đăng nhập để thêm sản phẩm vào giỏ hàng.',
      };
    }

    try {
      setLoading(true);
      const updatedCart = await cartService.addToCart({
        productId,
        productVariantId,
        quantity,
      });
      setCart(updatedCart);
      setIsDrawerOpen(true); // Tự động mở drawer sau khi thêm thành công
      return { success: true };
    } catch (error) {
      const msg = error instanceof Error ? error.message : 'Lỗi thêm vào giỏ hàng';
      return { success: false, message: msg };
    } finally {
      setLoading(false);
    }
  };

  const updateQuantity = async (
    cartItemId: number,
    quantity: number
  ): Promise<{ success: boolean; message?: string }> => {
    try {
      setLoading(true);
      const updatedCart = await cartService.updateQuantity(cartItemId, quantity);
      setCart(updatedCart);
      return { success: true };
    } catch (error) {
      const msg = error instanceof Error ? error.message : 'Không thể cập nhật số lượng';
      return { success: false, message: msg };
    } finally {
      setLoading(false);
    }
  };

  const removeItem = async (
    cartItemId: number
  ): Promise<{ success: boolean; message?: string }> => {
    try {
      setLoading(true);
      const updatedCart = await cartService.removeItem(cartItemId);
      setCart(updatedCart);
      return { success: true };
    } catch (error) {
      const msg = error instanceof Error ? error.message : 'Không thể xóa món hàng';
      return { success: false, message: msg };
    } finally {
      setLoading(false);
    }
  };

  const clearCart = async (): Promise<{ success: boolean; message?: string }> => {
    try {
      setLoading(true);
      const updatedCart = await cartService.clearCart();
      setCart(updatedCart);
      return { success: true };
    } catch (error) {
      const msg = error instanceof Error ? error.message : 'Không thể dọn sạch giỏ hàng';
      return { success: false, message: msg };
    } finally {
      setLoading(false);
    }
  };

  const itemCount = cart?.totalItems ?? 0;
  const totalAmount = cart?.totalAmount ?? 0;

  return (
    <CartContext.Provider
      value={{
        cart,
        itemCount,
        totalAmount,
        loading,
        isDrawerOpen,
        openDrawer,
        closeDrawer,
        toggleDrawer,
        refreshCart,
        addToCart,
        updateQuantity,
        removeItem,
        clearCart,
      }}
    >
      {children}
    </CartContext.Provider>
  );
};

export const useCart = (): CartContextType => {
  const context = useContext(CartContext);
  if (!context) {
    throw new Error('useCart phải được sử dụng bên trong CartProvider');
  }
  return context;
};
