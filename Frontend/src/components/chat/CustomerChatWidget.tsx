import React, { useState, useEffect, useRef, useCallback } from 'react';
import {
  chatService,
  chatSignalR,
  mergeChatMessages,
  type ChatConversationSummary,
  type ChatMessage,
} from '../../services/chatService';

interface CustomerChatWidgetProps {
  currentUserId?: number;
}

export const CustomerChatWidget: React.FC<CustomerChatWidgetProps> = ({ currentUserId }) => {
  const [isOpen, setIsOpen] = useState(false);
  const [conversations, setConversations] = useState<ChatConversationSummary[]>([]);
  const [selectedConversation, setSelectedConversation] = useState<ChatConversationSummary | null>(null);
  const [messages, setMessages] = useState<ChatMessage[]>([]);
  const [inputMessage, setInputMessage] = useState('');
  const [loading, setLoading] = useState(false);
  const [unreadCount, setUnreadCount] = useState(0);

  // Sản phẩm đính kèm đang được hỏi
  const [attachedProduct, setAttachedProduct] = useState<{
    productId: number;
    title: string;
    price: number;
    image: string;
  } | null>(null);

  const messagesEndRef = useRef<HTMLDivElement>(null);
  const selectedConversationRef = useRef(selectedConversation);
  const isOpenRef = useRef(isOpen);
  const token = localStorage.getItem('accessToken');

  // Lấy currentUserId từ token nếu chưa truyền
  const myUserId = currentUserId || (() => {
    if (!token) return 0;
    try {
      const payload = JSON.parse(atob(token.split('.')[1]));
      return Number(payload.UserId || payload.sub || 0);
    } catch {
      return 0;
    }
  })();

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  };

  useEffect(() => {
    scrollToBottom();
  }, [messages]);

  // Kết nối SignalR khi có token
  useEffect(() => {
    if (!token || !myUserId) return;

    void chatSignalR.startConnection(token);

    // Lắng nghe tin nhắn mới trong phòng chat
    const unsubMsg = chatSignalR.onMessage((newMsg) => {
      if (selectedConversationRef.current?.conversationId === newMsg.conversationId) {
        setMessages((prev) => mergeChatMessages(prev, [newMsg]));
      }

      setConversations((prev) =>
        prev.map((conversation) =>
          conversation.conversationId === newMsg.conversationId
            ? {
                ...conversation,
                lastMessageText: newMsg.messageText,
                lastMessageAt: newMsg.createdAt,
                lastSenderId: newMsg.senderId,
              }
            : conversation
        )
      );
    });

    // Lắng nghe notification tin nhắn mới (cho cả trường hợp đang ở ngoài hoặc mở tab khác)
    const unsubNotif = chatSignalR.onNewNotification(({ conversationId, message }) => {
      const isSelected = selectedConversationRef.current?.conversationId === conversationId;
      const isActive = isSelected && isOpenRef.current;
      if (isSelected) {
        setMessages((prev) => mergeChatMessages(prev, [message]));
        if (isActive) {
          void chatSignalR.markAsRead(conversationId);
        }
      }

      setConversations((prev) =>
        prev.map((c) =>
          c.conversationId === conversationId
            ? {
                ...c,
                lastMessageText: message.messageText,
                lastMessageAt: message.createdAt,
                lastSenderId: message.senderId,
                unreadCount: isActive ? 0 : c.unreadCount + 1,
              }
            : c
        )
      );
    });

    // Lắng nghe trạng thái đã đọc
    const unsubRead = chatSignalR.onReadStatus(({ conversationId, readerId }) => {
      if (readerId !== myUserId) {
        setMessages((prev) =>
          prev.map((m) => (m.conversationId === conversationId ? { ...m, isRead: true } : m))
        );
      }
    });

    // Lắng nghe tổng số tin chưa đọc
    const unsubUnread = chatSignalR.onUnreadCount((count) => {
      setUnreadCount(count);
    });

    // Tải số lượng unread ban đầu
    chatService.getUnreadCount().then((res) => {
      if (res.success) setUnreadCount(res.data);
    }).catch((err) => {
      console.error('Lỗi tải số tin nhắn chưa đọc:', err);
    });

    const unsubReconnect = chatSignalR.onReconnected(() => {
      const conversationId = selectedConversationRef.current?.conversationId;
      if (!conversationId) return;

      void chatService.getMessages(conversationId).then((res) => {
        if (res.success && res.data && selectedConversationRef.current?.conversationId === conversationId) {
          setMessages((prev) =>
            mergeChatMessages(
              prev.filter((message) => message.conversationId === conversationId),
              res.data
            )
          );
        }
      }).catch((err) => {
        console.error('Lỗi đồng bộ tin nhắn sau khi kết nối lại:', err);
      });
    });

    return () => {
      unsubMsg();
      unsubNotif();
      unsubRead();
      unsubUnread();
      unsubReconnect();
    };
  }, [token, myUserId]);

  // Tải danh sách cuộc trò chuyện khi mở widget
  const loadConversations = useCallback(async () => {
    if (!token) return;
    try {
      const res = await chatService.getConversations();
      if (res.success && res.data) {
        setConversations(res.data);
      }
    } catch (err) {
      console.error('Lỗi tải cuộc hội thoại:', err);
    } finally {
      setLoading(false);
    }
  }, [token]);

  // Khi chọn 1 cuộc hội thoại
  const handleSelectConversation = async (conv: ChatConversationSummary) => {
    const previousConversationId = selectedConversationRef.current?.conversationId;
    selectedConversationRef.current = conv;
    setSelectedConversation(conv);
    if (previousConversationId !== conv.conversationId) {
      setMessages([]);
    }
    try {
      setLoading(true);
      // Join SignalR group
      await chatSignalR.joinConversation(conv.conversationId);

      // Tải lịch sử tin nhắn
      const res = await chatService.getMessages(conv.conversationId);
      if (res.success && res.data && selectedConversationRef.current?.conversationId === conv.conversationId) {
        setMessages((prev) =>
          mergeChatMessages(
            prev.filter((message) => message.conversationId === conv.conversationId),
            res.data
          )
        );
      }

      // Đánh dấu đã đọc
      if (conv.unreadCount > 0) {
        await chatSignalR.markAsRead(conv.conversationId);
        setConversations((prev) =>
          prev.map((c) => (c.conversationId === conv.conversationId ? { ...c, unreadCount: 0 } : c))
        );
      }
    } catch (err) {
      console.error('Lỗi nạp tin nhắn:', err);
    } finally {
      setLoading(false);
    }
  };

  const restoreSelectedConversation = useCallback(async () => {
    const conversation = selectedConversationRef.current;
    if (!conversation) return;

    try {
      await chatSignalR.joinConversation(conversation.conversationId);
      const res = await chatService.getMessages(conversation.conversationId);
      if (res.success && res.data && selectedConversationRef.current?.conversationId === conversation.conversationId) {
        setMessages((prev) =>
          mergeChatMessages(
            prev.filter((message) => message.conversationId === conversation.conversationId),
            res.data
          )
        );
      }
      if (isOpenRef.current && selectedConversationRef.current?.conversationId === conversation.conversationId) {
        await chatSignalR.markAsRead(conversation.conversationId);
        setConversations((prev) =>
          prev.map((item) =>
            item.conversationId === conversation.conversationId ? { ...item, unreadCount: 0 } : item
          )
        );
      }
    } catch (err) {
      console.error('Lỗi đồng bộ cuộc trò chuyện:', err);
    }
  }, []);

  useEffect(() => {
    if (!isOpen) return;
    void loadConversations();
    void restoreSelectedConversation();
  }, [isOpen, loadConversations, restoreSelectedConversation]);

  // Lắng nghe custom event từ trang ProductDetail "open-customer-chat"
  useEffect(() => {
    const handleOpenChatEvent = async (e: Event) => {
      const customEvent = e as CustomEvent<{
        sellerId: number;
        sellerName?: string;
        productId?: number;
        productTitle?: string;
        productPrice?: number;
        productImage?: string;
      }>;

      if (!customEvent.detail || !customEvent.detail.sellerId) return;

      const { sellerId, productId, productTitle, productPrice, productImage } = customEvent.detail;

      if (productId && productTitle) {
        setAttachedProduct({
          productId,
          title: productTitle,
          price: productPrice || 0,
          image: productImage || '',
        });
      }

      isOpenRef.current = true;
      setIsOpen(true);

      // Khởi tạo hoặc tìm cuộc trò chuyện với seller
      try {
        setLoading(true);
        const res = await chatService.initConversation({
          sellerId,
          initialProductId: productId,
        });

        if (res.success && res.data) {
          await handleSelectConversation(res.data);
        }
      } catch (err) {
        console.error('Lỗi mở chat với shop:', err);
      } finally {
        setLoading(false);
      }
    };

    window.addEventListener('open-customer-chat', handleOpenChatEvent);
    return () => {
      window.removeEventListener('open-customer-chat', handleOpenChatEvent);
    };
  }, []);

  const handleSendMessage = async (e?: React.FormEvent) => {
    if (e) e.preventDefault();
    if (!inputMessage.trim() || !selectedConversation) return;

    const textToSend = inputMessage.trim();
    const productToSend = attachedProduct ? attachedProduct.productId : undefined;

    setInputMessage('');
    setAttachedProduct(null); // Gửi xong thì xóa preview sản phẩm đính kèm

    try {
      await chatSignalR.sendMessage({
        conversationId: selectedConversation.conversationId,
        messageText: textToSend,
        attachedProductId: productToSend,
      });
    } catch (err) {
      console.error('Lỗi gửi tin nhắn:', err);
    }
  };

  // Nếu chưa đăng nhập, không hiển thị widget nổi
  if (!token) return null;

  return (
    <>
      {/* ─── NÚT TRÒN NỔI GÓC DƯỚI PHẢI ───────────────────────────────────────── */}
      {!isOpen && (
        <button
          type="button"
          onClick={() => {
            setLoading(true);
            isOpenRef.current = true;
            setIsOpen(true);
          }}
          style={{
            position: 'fixed',
            bottom: '28px',
            right: '28px',
            zIndex: 9000,
            width: '56px',
            height: '56px',
            borderRadius: '50%',
            backgroundColor: '#1b1c1c',
            color: '#ffffff',
            border: 'none',
            boxShadow: '0 8px 24px rgba(0,0,0,0.22)',
            cursor: 'pointer',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            transition: 'transform 0.18s ease, box-shadow 0.18s ease',
          }}
          onMouseEnter={(e) => {
            e.currentTarget.style.transform = 'scale(1.06)';
          }}
          onMouseLeave={(e) => {
            e.currentTarget.style.transform = 'scale(1)';
          }}
          title="Trò chuyện với người bán"
        >
          <span className="material-symbols-outlined" style={{ fontSize: '26px' }}>
            chat
          </span>
          {unreadCount > 0 && (
            <span
              style={{
                position: 'absolute',
                top: '-4px',
                right: '-4px',
                backgroundColor: '#ff385c',
                color: '#ffffff',
                fontSize: '11px',
                fontWeight: 700,
                width: '20px',
                height: '20px',
                borderRadius: '50%',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                border: '2px solid #ffffff',
              }}
            >
              {unreadCount > 9 ? '9+' : unreadCount}
            </span>
          )}
        </button>
      )}

      {/* ─── HỘP CHATBOX POPUP NỔI (FROSTED GLASS) ────────────────────────────── */}
      {isOpen && (
        <div
          style={{
            position: 'fixed',
            bottom: '28px',
            right: '28px',
            zIndex: 9000,
            width: '380px',
            height: '520px',
            borderRadius: '16px',
            backgroundColor: '#ffffff',
            boxShadow: '0 12px 36px rgba(0,0,0,0.2)',
            border: '1px solid #e5e7eb',
            display: 'flex',
            flexDirection: 'column',
            overflow: 'hidden',
            fontFamily: 'inherit',
          }}
        >
          {/* Header Chatbox */}
          <div
            style={{
              padding: '14px 16px',
              backgroundColor: '#1b1c1c',
              color: '#ffffff',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'space-between',
            }}
          >
            <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
              {selectedConversation && (
                <button
                  type="button"
                  onClick={() => {
                    chatSignalR.leaveConversation(selectedConversation.conversationId);
                    selectedConversationRef.current = null;
                    setSelectedConversation(null);
                  }}
                  style={{
                    background: 'none',
                    border: 'none',
                    color: '#ffffff',
                    cursor: 'pointer',
                    display: 'flex',
                    alignItems: 'center',
                    padding: 0,
                  }}
                >
                  <span className="material-symbols-outlined" style={{ fontSize: '20px' }}>
                    arrow_back
                  </span>
                </button>
              )}
              <div>
                <div style={{ fontSize: '14px', fontWeight: 700 }}>
                  {selectedConversation ? selectedConversation.partner.fullName : 'Tin nhắn ShopVibe'}
                </div>
                <div style={{ fontSize: '11px', color: '#9ca3af', display: 'flex', alignItems: 'center', gap: '4px' }}>
                  <span style={{ width: '6px', height: '6px', borderRadius: '50%', backgroundColor: '#22c55e' }} />
                  {selectedConversation ? 'Đang hoạt động' : 'Tư vấn trực tuyến'}
                </div>
              </div>
            </div>

            <button
              type="button"
              onClick={() => {
                if (selectedConversation) {
                  chatSignalR.leaveConversation(selectedConversation.conversationId);
                }
                isOpenRef.current = false;
                setIsOpen(false);
              }}
              style={{
                background: 'none',
                border: 'none',
                color: '#ffffff',
                cursor: 'pointer',
                display: 'flex',
                alignItems: 'center',
                padding: '4px',
              }}
            >
              <span className="material-symbols-outlined" style={{ fontSize: '20px' }}>
                close
              </span>
            </button>
          </div>

          {/* Body: Danh sách cuộc trò chuyện HOẶC Khung chat chi tiết */}
          {!selectedConversation ? (
            /* DANH SÁCH CUỘC TRÒ CHUYỆN */
            <div style={{ flex: 1, overflowY: 'auto', padding: '8px' }}>
              {loading ? (
                <div style={{ padding: '24px', textAlign: 'center', color: '#6b7280', fontSize: '13px' }}>
                  Đang nạp cuộc hội thoại...
                </div>
              ) : conversations.length === 0 ? (
                <div style={{ padding: '40px 20px', textAlign: 'center', color: '#6b7280' }}>
                  <span className="material-symbols-outlined" style={{ fontSize: '40px', color: '#cbd5e1', display: 'block', marginBottom: '8px' }}>
                    chat_bubble_outline
                  </span>
                  <div style={{ fontSize: '14px', fontWeight: 600, color: '#374151' }}>Chưa có tin nhắn nào</div>
                  <div style={{ fontSize: '12px', marginTop: '4px' }}>
                    Bấm "Chat với người bán" tại bất kỳ sản phẩm nào để bắt đầu trò chuyện!
                  </div>
                </div>
              ) : (
                conversations.map((c) => (
                  <div
                    key={c.conversationId}
                    onClick={() => handleSelectConversation(c)}
                    style={{
                      display: 'flex',
                      alignItems: 'center',
                      gap: '12px',
                      padding: '10px 12px',
                      borderRadius: '10px',
                      cursor: 'pointer',
                      transition: 'background-color 150ms',
                    }}
                    onMouseEnter={(e) => (e.currentTarget.style.backgroundColor = '#f3f4f6')}
                    onMouseLeave={(e) => (e.currentTarget.style.backgroundColor = 'transparent')}
                  >
                    <div
                      style={{
                        width: '42px',
                        height: '42px',
                        borderRadius: '50%',
                        backgroundColor: '#1b1c1c',
                        color: '#ffffff',
                        display: 'flex',
                        alignItems: 'center',
                        justifyContent: 'center',
                        fontWeight: 700,
                        fontSize: '15px',
                        flexShrink: 0,
                      }}
                    >
                      {c.partner.fullName ? c.partner.fullName.charAt(0).toUpperCase() : 'S'}
                    </div>
                    <div style={{ flex: 1, minWidth: 0 }}>
                      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                        <span style={{ fontSize: '13.5px', fontWeight: 600, color: '#111827' }}>
                          {c.partner.fullName}
                        </span>
                        <span style={{ fontSize: '11px', color: '#9ca3af' }}>
                          {c.lastMessageAt ? new Date(c.lastMessageAt).toLocaleTimeString('vi-VN', { hour: '2-digit', minute: '2-digit' }) : ''}
                        </span>
                      </div>
                      <div
                        style={{
                          fontSize: '12px',
                          color: c.unreadCount > 0 ? '#111827' : '#6b7280',
                          fontWeight: c.unreadCount > 0 ? 600 : 400,
                          whiteSpace: 'nowrap',
                          overflow: 'hidden',
                          textOverflow: 'ellipsis',
                          marginTop: '2px',
                        }}
                      >
                        {c.lastMessageText || 'Đã mở cuộc trò chuyện'}
                      </div>
                    </div>
                    {c.unreadCount > 0 && (
                      <span
                        style={{
                          backgroundColor: '#ff385c',
                          color: '#ffffff',
                          fontSize: '10px',
                          fontWeight: 700,
                          borderRadius: '10px',
                          padding: '2px 6px',
                        }}
                      >
                        {c.unreadCount}
                      </span>
                    )}
                  </div>
                ))
              )}
            </div>
          ) : (
            /* KHUNG CHAT CHI TIẾT */
            <div style={{ flex: 1, display: 'flex', flexDirection: 'column', minHeight: 0 }}>
              {/* Thẻ sản phẩm đính kèm đang hỏi (nếu có) */}
              {attachedProduct && (
                <div
                  style={{
                    padding: '8px 12px',
                    backgroundColor: '#f8fafc',
                    borderBottom: '1px solid #e2e8f0',
                    display: 'flex',
                    alignItems: 'center',
                    gap: '10px',
                  }}
                >
                  <img
                    src={attachedProduct.image || 'https://via.placeholder.com/40'}
                    alt={attachedProduct.title}
                    style={{ width: '38px', height: '38px', borderRadius: '6px', objectFit: 'cover' }}
                  />
                  <div style={{ flex: 1, minWidth: 0 }}>
                    <div style={{ fontSize: '12px', fontWeight: 600, color: '#1e293b', whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis' }}>
                      {attachedProduct.title}
                    </div>
                    <div style={{ fontSize: '11.5px', color: '#ff385c', fontWeight: 700 }}>
                      {new Intl.NumberFormat('vi-VN', { style: 'currency', currency: 'VND' }).format(attachedProduct.price)}
                    </div>
                  </div>
                  <button
                    type="button"
                    onClick={() => setAttachedProduct(null)}
                    style={{ background: 'none', border: 'none', color: '#94a3b8', cursor: 'pointer', padding: '2px' }}
                  >
                    <span className="material-symbols-outlined" style={{ fontSize: '16px' }}>close</span>
                  </button>
                </div>
              )}

              {/* Danh sách tin nhắn */}
              <div style={{ flex: 1, overflowY: 'auto', padding: '12px', display: 'flex', flexDirection: 'column', gap: '8px' }}>
                {messages.length === 0 ? (
                  <div style={{ textAlign: 'center', color: '#94a3b8', fontSize: '12.5px', marginTop: '30px' }}>
                    Bắt đầu cuộc trò chuyện với người bán ngay!
                  </div>
                ) : (
                  messages.map((m) => {
                    const isMine = m.senderId === myUserId;
                    return (
                      <div
                        key={m.messageId}
                        style={{
                          display: 'flex',
                          flexDirection: 'column',
                          alignItems: isMine ? 'flex-end' : 'flex-start',
                        }}
                      >
                        {/* Thẻ sản phẩm đính kèm trong tin nhắn */}
                        {m.attachedProduct && (
                          <div
                            style={{
                              backgroundColor: '#f1f5f9',
                              border: '1px solid #e2e8f0',
                              borderRadius: '8px',
                              padding: '6px 10px',
                              display: 'flex',
                              alignItems: 'center',
                              gap: '8px',
                              maxWidth: '75%',
                              marginBottom: '4px',
                            }}
                          >
                            <img
                              src={m.attachedProduct.primaryImage || 'https://via.placeholder.com/32'}
                              alt={m.attachedProduct.productName}
                              style={{ width: '32px', height: '32px', borderRadius: '4px', objectFit: 'cover' }}
                            />
                            <div style={{ fontSize: '11.5px', overflow: 'hidden' }}>
                              <div style={{ fontWeight: 600, color: '#1e293b', whiteSpace: 'nowrap', textOverflow: 'ellipsis' }}>
                                {m.attachedProduct.productName}
                              </div>
                              <div style={{ color: '#ff385c', fontWeight: 700 }}>
                                {new Intl.NumberFormat('vi-VN', { style: 'currency', currency: 'VND' }).format(m.attachedProduct.price)}
                              </div>
                            </div>
                          </div>
                        )}

                        {/* Bubble nội dung tin nhắn */}
                        <div
                          style={{
                            maxWidth: '75%',
                            padding: '8px 12px',
                            borderRadius: isMine ? '14px 14px 2px 14px' : '14px 14px 14px 2px',
                            backgroundColor: isMine ? '#1b1c1c' : '#f3f4f6',
                            color: isMine ? '#ffffff' : '#1f2937',
                            fontSize: '13px',
                            lineHeight: 1.4,
                            wordBreak: 'break-word',
                          }}
                        >
                          {m.messageText}
                        </div>

                        {/* Thời gian & Trạng thái đã xem */}
                        <div style={{ fontSize: '10px', color: '#9ca3af', marginTop: '2px', display: 'flex', alignItems: 'center', gap: '4px' }}>
                          <span>{new Date(m.createdAt).toLocaleTimeString('vi-VN', { hour: '2-digit', minute: '2-digit' })}</span>
                          {isMine && (
                            <span style={{ color: m.isRead ? '#3b82f6' : '#9ca3af' }}>
                              {m.isRead ? '• Đã xem' : '• Đã gửi'}
                            </span>
                          )}
                        </div>
                      </div>
                    );
                  })
                )}
                <div ref={messagesEndRef} />
              </div>

              {/* Khung nhập tin nhắn */}
              <form
                onSubmit={handleSendMessage}
                style={{
                  padding: '10px 12px',
                  borderTop: '1px solid #e5e7eb',
                  display: 'flex',
                  alignItems: 'center',
                  gap: '8px',
                  backgroundColor: '#ffffff',
                }}
              >
                <input
                  type="text"
                  placeholder="Nhập tin nhắn..."
                  value={inputMessage}
                  onChange={(e) => setInputMessage(e.target.value)}
                  style={{
                    flex: 1,
                    padding: '8px 14px',
                    borderRadius: '20px',
                    border: '1px solid #d1d5db',
                    fontSize: '13px',
                    outline: 'none',
                  }}
                />
                <button
                  type="submit"
                  disabled={!inputMessage.trim()}
                  style={{
                    width: '36px',
                    height: '36px',
                    borderRadius: '50%',
                    backgroundColor: inputMessage.trim() ? '#1b1c1c' : '#e5e7eb',
                    color: '#ffffff',
                    border: 'none',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    cursor: inputMessage.trim() ? 'pointer' : 'not-allowed',
                    transition: 'all 150ms ease',
                  }}
                >
                  <span className="material-symbols-outlined" style={{ fontSize: '18px' }}>
                    send
                  </span>
                </button>
              </form>
            </div>
          )}
        </div>
      )}
    </>
  );
};
