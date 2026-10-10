import React, { useState, useEffect, useRef } from 'react';
import { signalRService, type RealtimeNotification } from '../../services/signalRService';
import { reviewAndNotifyService, type NotificationItem } from '../../services/reviewAndNotifyService';
import { authService } from '../../services/authService';

interface NotificationBellProps {
  buttonStyle?: React.CSSProperties;
  icon?: React.ReactNode;
}

export const NotificationBell: React.FC<NotificationBellProps> = ({ buttonStyle, icon }) => {
  const [unreadCount, setUnreadCount] = useState<number>(0);
  const [isOpen, setIsOpen] = useState<boolean>(false);
  const [notifications, setNotifications] = useState<NotificationItem[]>([]);
  const [loading, setLoading] = useState<boolean>(false);
  const [toastNotification, setToastNotification] = useState<RealtimeNotification | null>(null);
  const dropdownRef = useRef<HTMLDivElement>(null);

  // Khởi tạo kết nối SignalR & Tải số lượng ban đầu
  useEffect(() => {
    const token = authService.getToken();
    if (!token) return;

    // Lấy số lượng unread ban đầu
    reviewAndNotifyService.getUnreadCount().then((count) => setUnreadCount(count));

    // Khởi động kết nối SignalR
    signalRService.startConnection(token);

    // Lắng nghe thông báo Realtime từ Backend
    const unsubscribeNotification = signalRService.onNotification((notif) => {
      // 1. Tự động tăng số đếm chưa đọc
      setUnreadCount((prev) => prev + 1);

      // 2. Chèn vào đầu danh sách nếu dropdown đang mở
      setNotifications((prev) => [
        {
          notificationId: notif.notificationId,
          receiverId: notif.receiverId,
          senderId: notif.senderId,
          senderName: notif.senderName,
          title: notif.title,
          message: notif.message,
          type: notif.type,
          referenceId: notif.referenceId,
          targetUrl: notif.targetUrl,
          isRead: false,
          createdAt: notif.createdAt,
        },
        ...prev,
      ]);

      // 3. Bật Toast popup nổi bật không cần F5
      setToastNotification(notif);
      setTimeout(() => {
        setToastNotification((curr) => (curr?.notificationId === notif.notificationId ? null : curr));
      }, 6000);
    });

    const unsubscribeUnread = signalRService.onUnreadCount((count) => {
      setUnreadCount(count);
    });

    return () => {
      unsubscribeNotification();
      unsubscribeUnread();
    };
  }, []);

  // Đóng dropdown khi click bên ngoài
  useEffect(() => {
    const handleClickOutside = (e: MouseEvent) => {
      if (dropdownRef.current && !dropdownRef.current.contains(e.target as Node)) {
        setIsOpen(false);
      }
    };
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  const handleToggle = async () => {
    if (!isOpen) {
      setLoading(true);
      try {
        const res = await reviewAndNotifyService.getNotifications(1, 15);
        if (res.success) {
          setNotifications(res.data.items || []);
          setUnreadCount(res.data.unreadCount || 0);
        }
      } catch (err) {
        console.error('Lỗi khi tải thông báo:', err);
      } finally {
        setLoading(false);
      }
    }
    setIsOpen(!isOpen);
  };

  const handleMarkAsRead = async (id: number) => {
    await reviewAndNotifyService.markAsRead(id);
    setNotifications((prev) =>
      prev.map((n) => (n.notificationId === id ? { ...n, isRead: true } : n))
    );
    setUnreadCount((prev) => Math.max(0, prev - 1));
  };

  const handleMarkAllAsRead = async () => {
    await reviewAndNotifyService.markAllAsRead();
    setNotifications((prev) => prev.map((n) => ({ ...n, isRead: true })));
    setUnreadCount(0);
  };

  return (
    <div style={styles.container} ref={dropdownRef}>
      {/* Nút Chuông */}
      <button
        type="button"
        style={{
          ...styles.bellButton,
          ...buttonStyle,
        }}
        onClick={handleToggle}
        aria-label="Thông báo"
        title="Thông báo Real-time"
      >
        {icon || <span style={styles.bellIcon}>🔔</span>}
        {unreadCount > 0 && (
          <span style={styles.badge}>
            {unreadCount > 99 ? '99+' : unreadCount}
          </span>
        )}
      </button>

      {/* Dropdown danh sách thông báo */}
      {isOpen && (
        <div style={styles.dropdown}>
          <div style={styles.dropdownHeader}>
            <div style={styles.dropdownTitle}>Thông Báo</div>
            {unreadCount > 0 && (
              <button
                type="button"
                style={styles.markAllBtn}
                onClick={handleMarkAllAsRead}
              >
                Đánh dấu đã đọc tất cả
              </button>
            )}
          </div>

          <div style={styles.list}>
            {loading ? (
              <div style={styles.loadingBox}>Đang tải thông báo...</div>
            ) : notifications.length === 0 ? (
              <div style={styles.emptyBox}>
                <div style={{ fontSize: '28px', marginBottom: '6px' }}>📭</div>
                <div>Chưa có thông báo nào</div>
              </div>
            ) : (
              notifications.map((item) => (
                <div
                  key={item.notificationId}
                  style={{
                    ...styles.notificationItem,
                    backgroundColor: item.isRead ? '#ffffff' : '#f0fdf4',
                  }}
                  onClick={() => !item.isRead && handleMarkAsRead(item.notificationId)}
                >
                  <div style={styles.itemIcon}>
                    {item.type === 'Review' ? '⭐' : '📦'}
                  </div>
                  <div style={styles.itemContent}>
                    <div style={styles.itemHeader}>
                      <span style={styles.itemTitle}>{item.title}</span>
                      {!item.isRead && <span style={styles.unreadDot} />}
                    </div>
                    <div style={styles.itemMessage}>{item.message}</div>
                    <div style={styles.itemTime}>
                      {new Date(
                        item.createdAt.endsWith('Z') || item.createdAt.includes('+')
                          ? item.createdAt
                          : `${item.createdAt}Z`
                      ).toLocaleString('vi-VN', {
                        timeZone: 'Asia/Ho_Chi_Minh',
                        hour: '2-digit',
                        minute: '2-digit',
                        day: '2-digit',
                        month: '2-digit',
                      })}
                    </div>
                  </div>
                </div>
              ))
            )}
          </div>
        </div>
      )}

      {/* Toast Popup khi có thông báo mới tức thì */}
      {toastNotification && (
        <div style={styles.toast}>
          <div style={styles.toastIcon}>🔔</div>
          <div style={styles.toastBody}>
            <strong style={styles.toastTitle}>{toastNotification.title}</strong>
            <p style={styles.toastMessage}>{toastNotification.message}</p>
          </div>
          <button
            type="button"
            style={styles.toastClose}
            onClick={() => setToastNotification(null)}
          >
            ✕
          </button>
        </div>
      )}
    </div>
  );
};

const styles: Record<string, React.CSSProperties> = {
  container: {
    position: 'relative',
    display: 'inline-block',
  },
  bellButton: {
    position: 'relative',
    background: '#ffffff',
    border: '1px solid #e5e7eb',
    borderRadius: '50%',
    width: '40px',
    height: '40px',
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    cursor: 'pointer',
    boxShadow: '0 1px 3px rgba(0, 0, 0, 0.05)',
    transition: 'all 0.2s ease',
  },
  bellIcon: {
    fontSize: '18px',
  },
  badge: {
    position: 'absolute',
    top: '-4px',
    right: '-4px',
    backgroundColor: '#ef4444',
    color: '#ffffff',
    borderRadius: '10px',
    padding: '1px 6px',
    fontSize: '11px',
    fontWeight: 700,
    border: '2px solid #ffffff',
    boxShadow: '0 2px 4px rgba(239, 68, 68, 0.3)',
  },
  dropdown: {
    position: 'absolute',
    top: '48px',
    right: 0,
    width: '360px',
    maxHeight: '480px',
    backgroundColor: '#ffffff',
    borderRadius: '14px',
    boxShadow: '0 10px 25px -5px rgba(0, 0, 0, 0.15), 0 8px 10px -6px rgba(0, 0, 0, 0.1)',
    border: '1px solid #f3f4f6',
    zIndex: 10000,
    overflow: 'hidden',
    display: 'flex',
    flexDirection: 'column',
  },
  dropdownHeader: {
    display: 'flex',
    justifyContent: 'space-between',
    alignItems: 'center',
    padding: '14px 16px',
    borderBottom: '1px solid #f3f4f6',
    backgroundColor: '#ffffff',
  },
  dropdownTitle: {
    fontSize: '15px',
    fontWeight: 700,
    color: '#111827',
  },
  markAllBtn: {
    background: 'none',
    border: 'none',
    fontSize: '12px',
    color: '#2563eb',
    cursor: 'pointer',
    fontWeight: 500,
  },
  list: {
    overflowY: 'auto',
    flex: 1,
    maxHeight: '400px',
  },
  loadingBox: {
    padding: '30px',
    textAlign: 'center',
    color: '#9ca3af',
    fontSize: '13px',
  },
  emptyBox: {
    padding: '40px 20px',
    textAlign: 'center',
    color: '#9ca3af',
    fontSize: '13px',
  },
  notificationItem: {
    display: 'flex',
    gap: '12px',
    padding: '12px 16px',
    borderBottom: '1px solid #f9fafb',
    cursor: 'pointer',
    transition: 'background 0.15s ease',
  },
  itemIcon: {
    fontSize: '20px',
    marginTop: '2px',
  },
  itemContent: {
    flex: 1,
  },
  itemHeader: {
    display: 'flex',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  itemTitle: {
    fontSize: '13px',
    fontWeight: 700,
    color: '#1f2937',
  },
  unreadDot: {
    width: '8px',
    height: '8px',
    borderRadius: '50%',
    backgroundColor: '#10b981',
  },
  itemMessage: {
    fontSize: '13px',
    color: '#4b5563',
    marginTop: '3px',
    lineHeight: '1.4',
  },
  itemTime: {
    fontSize: '11px',
    color: '#9ca3af',
    marginTop: '5px',
  },
  toast: {
    position: 'fixed',
    bottom: '24px',
    right: '24px',
    backgroundColor: '#1f2937',
    color: '#ffffff',
    borderRadius: '12px',
    padding: '14px 18px',
    boxShadow: '0 20px 25px -5px rgba(0, 0, 0, 0.3)',
    display: 'flex',
    alignItems: 'flex-start',
    gap: '12px',
    maxWidth: '380px',
    zIndex: 99999,
    animation: 'slideIn 0.3s cubic-bezier(0.16, 1, 0.3, 1)',
  },
  toastIcon: {
    fontSize: '22px',
  },
  toastBody: {
    flex: 1,
  },
  toastTitle: {
    display: 'block',
    fontSize: '14px',
    fontWeight: 600,
    color: '#f9fafb',
  },
  toastMessage: {
    margin: '4px 0 0',
    fontSize: '13px',
    color: '#d1d5db',
    lineHeight: 1.4,
  },
  toastClose: {
    background: 'none',
    border: 'none',
    color: '#9ca3af',
    fontSize: '14px',
    cursor: 'pointer',
    padding: '0',
  },
};
