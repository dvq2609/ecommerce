import React, { useState, useEffect, useRef, useCallback } from 'react';
import { AdminSellerLayout } from '../components/layout/AdminSellerLayout';
import {
  chatService,
  chatSignalR,
  mergeChatMessages,
  type ChatConversationSummary,
  type ChatMessage,
} from '../services/chatService';

export const SellerChatPage: React.FC = () => {
  const [conversations, setConversations] = useState<ChatConversationSummary[]>([]);
  const [selectedConversation, setSelectedConversation] = useState<ChatConversationSummary | null>(null);
  const [messages, setMessages] = useState<ChatMessage[]>([]);
  const [inputMessage, setInputMessage] = useState('');
  const [searchQuery, setSearchQuery] = useState('');
  const [loading, setLoading] = useState(true);

  const messagesEndRef = useRef<HTMLDivElement>(null);
  const selectedConversationRef = useRef(selectedConversation);
  const token = localStorage.getItem('accessToken');

  const myUserId = (() => {
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

  // Nạp danh sách hội thoại
  const fetchConversations = useCallback(async () => {
    try {
      const res = await chatService.getConversations();
      if (res.success && res.data) {
        setConversations(res.data);
        // Tự động chọn hội thoại đầu tiên nếu có và chưa chọn
        if (res.data.length > 0 && !selectedConversationRef.current) {
          handleSelectConversation(res.data[0]);
        }
      }
    } catch (err) {
      console.error('Lỗi nạp danh sách hội thoại:', err);
    } finally {
      setLoading(false);
    }
  }, []);

  // Kết nối SignalR
  useEffect(() => {
    if (!token || !myUserId) return;

    void chatSignalR.startConnection(token);

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

    const unsubNotif = chatSignalR.onNewNotification(({ conversationId, message }) => {
      const isSelected = selectedConversationRef.current?.conversationId === conversationId;
      if (isSelected) {
        setMessages((prev) => mergeChatMessages(prev, [message]));
        void chatSignalR.markAsRead(conversationId);
      }

      setConversations((prev) =>
        prev.map((c) =>
          c.conversationId === conversationId
            ? {
                ...c,
                lastMessageText: message.messageText,
                lastMessageAt: message.createdAt,
                lastSenderId: message.senderId,
                unreadCount: isSelected ? 0 : c.unreadCount + 1,
              }
            : c
        )
      );
    });

    const unsubRead = chatSignalR.onReadStatus(({ conversationId, readerId }) => {
      if (readerId !== myUserId) {
        setMessages((prev) =>
          prev.map((m) => (m.conversationId === conversationId ? { ...m, isRead: true } : m))
        );
      }
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

    fetchConversations();

    return () => {
      unsubMsg();
      unsubNotif();
      unsubRead();
      unsubReconnect();
    };
  }, [token, myUserId, fetchConversations]);

  async function handleSelectConversation(conv: ChatConversationSummary) {
    selectedConversationRef.current = conv;
    setSelectedConversation(conv);
    try {
      await chatSignalR.joinConversation(conv.conversationId);
      const res = await chatService.getMessages(conv.conversationId);
      if (res.success && res.data && selectedConversationRef.current?.conversationId === conv.conversationId) {
        setMessages((prev) =>
          mergeChatMessages(
            prev.filter((message) => message.conversationId === conv.conversationId),
            res.data
          )
        );
      }

      if (conv.unreadCount > 0) {
        await chatSignalR.markAsRead(conv.conversationId);
        setConversations((prev) =>
          prev.map((c) => (c.conversationId === conv.conversationId ? { ...c, unreadCount: 0 } : c))
        );
      }
    } catch (err) {
      console.error('Lỗi nạp tin nhắn:', err);
    }
  }

  const handleSendMessage = async (e?: React.FormEvent) => {
    if (e) e.preventDefault();
    if (!inputMessage.trim() || !selectedConversation) return;

    const text = inputMessage.trim();
    setInputMessage('');

    try {
      await chatSignalR.sendMessage({
        conversationId: selectedConversation.conversationId,
        messageText: text,
      });
    } catch (err) {
      console.error('Lỗi gửi tin nhắn:', err);
    }
  };

  // Lọc hội thoại theo tên khách hàng
  const filteredConversations = conversations.filter((c) =>
    c.partner.fullName.toLowerCase().includes(searchQuery.toLowerCase()) ||
    c.partner.email.toLowerCase().includes(searchQuery.toLowerCase())
  );

  return (
    <AdminSellerLayout
      title="Tin Nhắn Khách Hàng (Live Chat)"
      subtitle="Tư vấn khách hàng trực tiếp, phản hồi thắc mắc đơn hàng và sản phẩm thời gian thực"
    >
      <div
        style={{
          display: 'grid',
          gridTemplateColumns: '320px minmax(0, 1fr)',
          backgroundColor: 'var(--color-surface-card)',
          borderRadius: 'var(--radius-xl)',
          border: '1px solid var(--color-border-subtle)',
          boxShadow: 'var(--shadow-sm)',
          height: 'calc(100vh - 200px)',
          minHeight: '560px',
          overflow: 'hidden',
        }}
      >
        {/* ─── CỘT TRÁI: DANH SÁCH KHÁCH HÀNG ───────────────────────────────── */}
        <div
          style={{
            borderRight: '1px solid var(--color-border-subtle)',
            display: 'flex',
            flexDirection: 'column',
            backgroundColor: 'var(--color-surface-container-low)',
          }}
        >
          {/* Thanh tìm kiếm khách hàng */}
          <div style={{ padding: '16px', borderBottom: '1px solid var(--color-border-subtle)' }}>
            <div style={{ position: 'relative' }}>
              <span
                className="material-symbols-outlined"
                style={{
                  position: 'absolute',
                  left: '12px',
                  top: '50%',
                  transform: 'translateY(-50%)',
                  color: 'var(--color-on-surface-variant)',
                  fontSize: '18px',
                }}
              >
                search
              </span>
              <input
                type="text"
                placeholder="Tìm khách hàng..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                style={{
                  width: '100%',
                  padding: '8px 12px 8px 36px',
                  borderRadius: '20px',
                  border: '1px solid var(--color-border-subtle)',
                  fontSize: '13px',
                  backgroundColor: 'var(--color-surface-card)',
                  color: 'var(--color-on-surface)',
                  outline: 'none',
                  boxSizing: 'border-box',
                }}
              />
            </div>
          </div>

          {/* Danh sách hội thoại */}
          <div style={{ flex: 1, overflowY: 'auto', padding: '8px' }}>
            {loading ? (
              <div style={{ padding: '24px', textAlign: 'center', color: 'var(--color-on-surface-variant)', fontSize: '13px' }}>
                Đang nạp cuộc hội thoại...
              </div>
            ) : filteredConversations.length === 0 ? (
              <div style={{ padding: '32px 16px', textAlign: 'center', color: 'var(--color-on-surface-variant)', fontSize: '13px' }}>
                Không tìm thấy hội thoại nào.
              </div>
            ) : (
              filteredConversations.map((c) => {
                const isSelected = selectedConversation?.conversationId === c.conversationId;
                return (
                  <div
                    key={c.conversationId}
                    onClick={() => handleSelectConversation(c)}
                    style={{
                      display: 'flex',
                      alignItems: 'center',
                      gap: '12px',
                      padding: '12px 14px',
                      borderRadius: '12px',
                      cursor: 'pointer',
                      backgroundColor: isSelected ? 'var(--color-surface-card)' : 'transparent',
                      border: isSelected ? '1px solid var(--color-border-subtle)' : '1px solid transparent',
                      boxShadow: isSelected ? 'var(--shadow-sm)' : 'none',
                      marginBottom: '4px',
                      transition: 'all 120ms ease',
                    }}
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
                      {c.partner.fullName ? c.partner.fullName.charAt(0).toUpperCase() : 'U'}
                    </div>

                    <div style={{ flex: 1, minWidth: 0 }}>
                      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                        <span style={{ fontSize: '13.5px', fontWeight: 600, color: 'var(--color-on-surface)' }}>
                          {c.partner.fullName}
                        </span>
                        <span style={{ fontSize: '11px', color: 'var(--color-on-surface-variant)' }}>
                          {c.lastMessageAt ? new Date(c.lastMessageAt).toLocaleTimeString('vi-VN', { hour: '2-digit', minute: '2-digit' }) : ''}
                        </span>
                      </div>
                      <div
                        style={{
                          fontSize: '12px',
                          color: c.unreadCount > 0 ? 'var(--color-on-surface)' : 'var(--color-on-surface-variant)',
                          fontWeight: c.unreadCount > 0 ? 700 : 400,
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
                          fontSize: '10.5px',
                          fontWeight: 700,
                          borderRadius: '10px',
                          padding: '2px 6px',
                        }}
                      >
                        {c.unreadCount}
                      </span>
                    )}
                  </div>
                );
              })
            )}
          </div>
        </div>

        {/* ─── CỘT PHẢI: KHUNG CHAT CHI TIẾT ─────────────────────────────────── */}
        <div style={{ display: 'flex', flexDirection: 'column', backgroundColor: 'var(--color-surface-card)' }}>
          {selectedConversation ? (
            <>
              {/* Header Khung Chat */}
              <div
                style={{
                  padding: '14px 20px',
                  borderBottom: '1px solid var(--color-border-subtle)',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'space-between',
                  backgroundColor: 'var(--color-surface-card)',
                }}
              >
                <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
                  <div
                    style={{
                      width: '40px',
                      height: '40px',
                      borderRadius: '50%',
                      backgroundColor: '#1b1c1c',
                      color: '#ffffff',
                      display: 'flex',
                      alignItems: 'center',
                      justifyContent: 'center',
                      fontWeight: 700,
                      fontSize: '15px',
                    }}
                  >
                    {selectedConversation.partner.fullName ? selectedConversation.partner.fullName.charAt(0).toUpperCase() : 'U'}
                  </div>
                  <div>
                    <div style={{ fontSize: '15px', fontWeight: 700, color: 'var(--color-on-surface)' }}>
                      {selectedConversation.partner.fullName}
                    </div>
                    <div style={{ fontSize: '12px', color: 'var(--color-on-surface-variant)', display: 'flex', alignItems: 'center', gap: '6px' }}>
                      <span style={{ width: '7px', height: '7px', borderRadius: '50%', backgroundColor: '#22c55e' }} />
                      <span>{selectedConversation.partner.email} • Khách hàng</span>
                    </div>
                  </div>
                </div>

                <div style={{ display: 'flex', gap: '8px' }}>
                  <button
                    type="button"
                    onClick={() => handleSelectConversation(selectedConversation)}
                    title="Làm mới tin nhắn"
                    style={{
                      background: 'none',
                      border: '1px solid var(--color-border-subtle)',
                      borderRadius: '8px',
                      padding: '6px',
                      color: 'var(--color-on-surface-variant)',
                      cursor: 'pointer',
                      display: 'flex',
                      alignItems: 'center',
                    }}
                  >
                    <span className="material-symbols-outlined" style={{ fontSize: '18px' }}>
                      refresh
                    </span>
                  </button>
                </div>
              </div>

              {/* Danh sách tin nhắn */}
              <div
                style={{
                  flex: 1,
                  overflowY: 'auto',
                  padding: '20px',
                  display: 'flex',
                  flexDirection: 'column',
                  gap: '12px',
                  backgroundColor: 'var(--color-surface-container-lowest)',
                }}
              >
                {messages.length === 0 ? (
                  <div style={{ textAlign: 'center', color: 'var(--color-on-surface-variant)', margin: 'auto', fontSize: '13.5px' }}>
                    Chưa có tin nhắn nào trong cuộc trò chuyện này.
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
                        {/* Thẻ sản phẩm đính kèm nếu khách hỏi */}
                        {m.attachedProduct && (
                          <div
                            style={{
                              backgroundColor: 'var(--color-surface-card)',
                              border: '1px solid var(--color-border-subtle)',
                              borderRadius: '10px',
                              padding: '8px 12px',
                              display: 'flex',
                              alignItems: 'center',
                              gap: '12px',
                              maxWidth: '65%',
                              marginBottom: '6px',
                              boxShadow: 'var(--shadow-sm)',
                            }}
                          >
                            <img
                              src={m.attachedProduct.primaryImage || 'https://via.placeholder.com/48'}
                              alt={m.attachedProduct.productName}
                              style={{ width: '42px', height: '42px', borderRadius: '6px', objectFit: 'cover' }}
                            />
                            <div style={{ fontSize: '12.5px', overflow: 'hidden' }}>
                              <div style={{ fontWeight: 600, color: 'var(--color-on-surface)', whiteSpace: 'nowrap', textOverflow: 'ellipsis' }}>
                                {m.attachedProduct.productName}
                              </div>
                              <div style={{ color: '#ff385c', fontWeight: 700, marginTop: '2px' }}>
                                {new Intl.NumberFormat('vi-VN', { style: 'currency', currency: 'VND' }).format(m.attachedProduct.price)}
                              </div>
                            </div>
                          </div>
                        )}

                        {/* Bubble tin nhắn */}
                        <div
                          style={{
                            maxWidth: '65%',
                            padding: '10px 14px',
                            borderRadius: isMine ? '16px 16px 4px 16px' : '16px 16px 16px 4px',
                            backgroundColor: isMine ? '#1b1c1c' : 'var(--color-surface-card)',
                            color: isMine ? '#ffffff' : 'var(--color-on-surface)',
                            border: isMine ? 'none' : '1px solid var(--color-border-subtle)',
                            fontSize: '13.5px',
                            lineHeight: 1.5,
                            wordBreak: 'break-word',
                            boxShadow: '0 1px 3px rgba(0,0,0,0.04)',
                          }}
                        >
                          {m.messageText}
                        </div>

                        {/* Thời gian & Trạng thái đã xem */}
                        <div style={{ fontSize: '11px', color: 'var(--color-on-surface-variant)', marginTop: '4px', display: 'flex', alignItems: 'center', gap: '6px' }}>
                          <span>{new Date(m.createdAt).toLocaleTimeString('vi-VN', { hour: '2-digit', minute: '2-digit' })}</span>
                          {isMine && (
                            <span style={{ color: m.isRead ? '#0284c7' : 'var(--color-on-surface-variant)' }}>
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

              {/* Form nhập tin nhắn phản hồi khách */}
              <form
                onSubmit={handleSendMessage}
                style={{
                  padding: '14px 20px',
                  borderTop: '1px solid var(--color-border-subtle)',
                  display: 'flex',
                  alignItems: 'center',
                  gap: '10px',
                  backgroundColor: 'var(--color-surface-card)',
                }}
              >
                <input
                  type="text"
                  placeholder="Nhập nội dung tư vấn khách hàng..."
                  value={inputMessage}
                  onChange={(e) => setInputMessage(e.target.value)}
                  style={{
                    flex: 1,
                    padding: '10px 16px',
                    borderRadius: '24px',
                    border: '1px solid var(--color-border-subtle)',
                    fontSize: '13.5px',
                    backgroundColor: 'var(--color-surface-container-low)',
                    color: 'var(--color-on-surface)',
                    outline: 'none',
                  }}
                />
                <button
                  type="submit"
                  disabled={!inputMessage.trim()}
                  style={{
                    height: '40px',
                    padding: '0 18px',
                    borderRadius: '20px',
                    backgroundColor: inputMessage.trim() ? '#1b1c1c' : 'var(--color-surface-container-high)',
                    color: '#ffffff',
                    border: 'none',
                    fontSize: '13px',
                    fontWeight: 600,
                    display: 'flex',
                    alignItems: 'center',
                    gap: '6px',
                    cursor: inputMessage.trim() ? 'pointer' : 'not-allowed',
                    transition: 'all 150ms ease',
                  }}
                >
                  <span>Gửi</span>
                  <span className="material-symbols-outlined" style={{ fontSize: '16px' }}>
                    send
                  </span>
                </button>
              </form>
            </>
          ) : (
            <div style={{ margin: 'auto', textAlign: 'center', color: 'var(--color-on-surface-variant)' }}>
              <span className="material-symbols-outlined" style={{ fontSize: '48px', color: '#cbd5e1', display: 'block', marginBottom: '8px' }}>
                forum
              </span>
              <div style={{ fontSize: '15px', fontWeight: 600, color: 'var(--color-on-surface)' }}>
                Chọn một khách hàng để bắt đầu tư vấn
              </div>
              <div style={{ fontSize: '13px', marginTop: '4px' }}>
                Các câu hỏi về kích cỡ, sản phẩm sẽ xuất hiện tại đây
              </div>
            </div>
          )}
        </div>
      </div>
    </AdminSellerLayout>
  );
};
