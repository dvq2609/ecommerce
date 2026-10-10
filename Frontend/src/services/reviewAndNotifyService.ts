import { authService } from './authService';

export interface NotificationItem {
  notificationId: number;
  receiverId: number;
  senderId?: number;
  senderName?: string;
  title: string;
  message: string;
  type: string;
  referenceId?: string;
  targetUrl?: string;
  isRead: boolean;
  createdAt: string;
}

export interface ReviewItem {
  reviewId: number;
  orderId: number;
  productId: number;
  productName: string;
  userId: number;
  userName: string;
  userAvatar?: string;
  sellerId: number;
  productVariantId?: number;
  variantInfo?: string;
  rating: number;
  comment: string;
  images: string[];
  sellerReply?: string;
  sellerRepliedAt?: string;
  createdAt: string;
  updatedAt?: string;
}

export interface CreateReviewRequest {
  orderId: number;
  productId: number;
  productVariantId?: number;
  rating: number;
  comment: string;
  images?: string[];
}

const API_BASE = 'http://localhost:5216/api';

export const reviewAndNotifyService = {
  // Review APIs
  async createReview(data: CreateReviewRequest): Promise<{ success: boolean; message: string; data?: ReviewItem }> {
    const token = authService.getToken();
    const res = await fetch(`${API_BASE}/reviews`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        Authorization: `Bearer ${token}`,
      },
      body: JSON.stringify(data),
    });
    return res.json();
  },

  async canUserReview(orderId: number, productId: number): Promise<boolean> {
    const token = authService.getToken();
    if (!token) return false;
    try {
      const res = await fetch(`${API_BASE}/reviews/can-review/${orderId}/${productId}`, {
        headers: { Authorization: `Bearer ${token}` },
      });
      if (!res.ok) return false;
      const data = await res.json();
      return !!data.canReview;
    } catch {
      return false;
    }
  },

  async getProductReviews(productId: number, pageNumber = 1, pageSize = 10) {
    const res = await fetch(`${API_BASE}/reviews/product/${productId}?pageNumber=${pageNumber}&pageSize=${pageSize}`);
    return res.json();
  },

  // Notification APIs
  async getNotifications(pageNumber = 1, pageSize = 20) {
    const token = authService.getToken();
    const res = await fetch(`${API_BASE}/notification?pageNumber=${pageNumber}&pageSize=${pageSize}`, {
      headers: { Authorization: `Bearer ${token}` },
    });
    return res.json();
  },

  async getUnreadCount(): Promise<number> {
    const token = authService.getToken();
    if (!token) return 0;
    try {
      const res = await fetch(`${API_BASE}/notification/unread-count`, {
        headers: { Authorization: `Bearer ${token}` },
      });
      if (!res.ok) return 0;
      const data = await res.json();
      return data.unreadCount || 0;
    } catch {
      return 0;
    }
  },

  async markAsRead(id: number): Promise<boolean> {
    const token = authService.getToken();
    const res = await fetch(`${API_BASE}/notification/${id}/read`, {
      method: 'PUT',
      headers: { Authorization: `Bearer ${token}` },
    });
    return res.ok;
  },

  async markAllAsRead(): Promise<boolean> {
    const token = authService.getToken();
    const res = await fetch(`${API_BASE}/notification/read-all`, {
      method: 'PUT',
      headers: { Authorization: `Bearer ${token}` },
    });
    return res.ok;
  },
};
