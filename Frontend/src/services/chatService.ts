import * as signalR from '@microsoft/signalr';

export interface ChatAttachedProduct {
  productId: number;
  productName: string;
  slug: string;
  price: number;
  primaryImage: string;
}

export interface ChatMessage {
  messageId: number;
  conversationId: number;
  senderId: number;
  senderName: string;
  senderAvatar: string;
  messageText: string;
  isRead: boolean;
  createdAt: string;
  attachedProduct?: ChatAttachedProduct;
}

export interface ChatPartner {
  userId: number;
  fullName: string;
  email: string;
  avatarUrl: string;
  roleName: string;
}

export interface ChatConversationSummary {
  conversationId: number;
  partner: ChatPartner;
  lastMessageText?: string;
  lastMessageAt: string;
  lastSenderId?: number;
  unreadCount: number;
  createdAt: string;
}

export interface SendMessagePayload {
  conversationId: number;
  messageText: string;
  attachedProductId?: number;
}

export interface InitConversationPayload {
  sellerId: number;
  initialProductId?: number;
}

export interface ChatApiResponse<T> {
  success: boolean;
  message?: string;
  data: T;
}

export function mergeChatMessages(...messageGroups: ChatMessage[][]): ChatMessage[] {
  const messagesById = new Map<number, ChatMessage>();
  messageGroups.flat().forEach((message) => messagesById.set(message.messageId, message));
  return Array.from(messagesById.values()).sort(
    (left, right) =>
      new Date(left.createdAt).getTime() - new Date(right.createdAt).getTime() ||
      left.messageId - right.messageId
  );
}

const API_BASE = '/api/chat';

function getAuthHeaders(): HeadersInit {
  const token = localStorage.getItem('accessToken');
  return {
    'Content-Type': 'application/json',
    ...(token ? { Authorization: `Bearer ${token}` } : {}),
  };
}

async function handleResponse<T>(res: Response): Promise<T> {
  const data = await res.json().catch(() => null);
  if (!res.ok) {
    const msg = data?.message ?? 'Đã xảy ra lỗi khi kết nối máy chủ tin nhắn.';
    throw new Error(msg);
  }
  return data as T;
}

export const chatService = {
  /** Lấy danh sách hội thoại của người dùng hiện tại */
  async getConversations(): Promise<ChatApiResponse<ChatConversationSummary[]>> {
    const res = await fetch(`${API_BASE}/conversations`, { headers: getAuthHeaders() });
    return handleResponse<ChatApiResponse<ChatConversationSummary[]>>(res);
  },

  /** Lấy danh sách tin nhắn của 1 cuộc hội thoại */
  async getMessages(conversationId: number, limit = 50): Promise<ChatApiResponse<ChatMessage[]>> {
    const res = await fetch(`${API_BASE}/conversations/${conversationId}/messages?limit=${limit}`, {
      headers: getAuthHeaders(),
    });
    return handleResponse<ChatApiResponse<ChatMessage[]>>(res);
  },

  /** Khởi tạo hoặc tìm cuộc hội thoại với Seller */
  async initConversation(payload: InitConversationPayload): Promise<ChatApiResponse<ChatConversationSummary>> {
    const res = await fetch(`${API_BASE}/conversations/init`, {
      method: 'POST',
      headers: getAuthHeaders(),
      body: JSON.stringify(payload),
    });
    return handleResponse<ChatApiResponse<ChatConversationSummary>>(res);
  },

  /** Gửi tin nhắn qua REST API (fallback) */
  async sendMessage(payload: SendMessagePayload): Promise<ChatApiResponse<ChatMessage>> {
    const res = await fetch(`${API_BASE}/messages`, {
      method: 'POST',
      headers: getAuthHeaders(),
      body: JSON.stringify(payload),
    });
    return handleResponse<ChatApiResponse<ChatMessage>>(res);
  },

  /** Đánh dấu đã đọc cuộc trò chuyện */
  async markAsRead(conversationId: number): Promise<ChatApiResponse<void>> {
    const res = await fetch(`${API_BASE}/conversations/${conversationId}/read`, {
      method: 'PATCH',
      headers: getAuthHeaders(),
    });
    return handleResponse<ChatApiResponse<void>>(res);
  },

  /** Lấy tổng số tin nhắn chưa đọc */
  async getUnreadCount(): Promise<ChatApiResponse<number>> {
    const res = await fetch(`${API_BASE}/unread-count`, { headers: getAuthHeaders() });
    return handleResponse<ChatApiResponse<number>>(res);
  },
};

// ─── SIGNALR CLIENT SINGLETON CHO CHAT ────────────────────────────────────────
type MessageListener = (message: ChatMessage) => void;
type NewNotificationListener = (data: { conversationId: number; message: ChatMessage }) => void;
type ReadStatusListener = (data: { conversationId: number; readerId: number }) => void;
type UnreadCountListener = (count: number) => void;
type ReconnectedListener = () => void;

class ChatSignalRClient {
  private connection: signalR.HubConnection | null = null;
  private connectionStart: Promise<void> | null = null;
  private token: string | null = null;
  private messageListeners = new Set<MessageListener>();
  private notificationListeners = new Set<NewNotificationListener>();
  private readStatusListeners = new Set<ReadStatusListener>();
  private unreadCountListeners = new Set<UnreadCountListener>();
  private reconnectedListeners = new Set<ReconnectedListener>();
  private joinedConversationIds = new Set<number>();

  public async startConnection(token: string) {
    this.token = token;
    if (this.connection?.state === signalR.HubConnectionState.Connected) {
      return;
    }
    if (this.connectionStart) {
      return this.connectionStart;
    }
    if (this.connection?.state === signalR.HubConnectionState.Reconnecting) {
      return;
    }

    if (!this.connection) {
      const hubUrl = 'http://localhost:5216/hubs/chat';

      this.connection = new signalR.HubConnectionBuilder()
        .withUrl(hubUrl, {
          accessTokenFactory: () => localStorage.getItem('accessToken') ?? this.token ?? token,
          skipNegotiation: false,
          transport: signalR.HttpTransportType.WebSockets | signalR.HttpTransportType.LongPolling,
        })
        .withAutomaticReconnect([0, 2000, 5000, 10000, 30000])
        .configureLogging(signalR.LogLevel.Warning)
        .build();

      this.connection.on('ReceiveMessage', (msg: ChatMessage) => {
        this.messageListeners.forEach((l) => l(msg));
      });

      this.connection.on('NewMessageNotification', (data: { conversationId: number; message: ChatMessage }) => {
        this.notificationListeners.forEach((l) => l(data));
      });

      this.connection.on('MessagesMarkedAsRead', (data: { conversationId: number; readerId: number }) => {
        this.readStatusListeners.forEach((l) => l(data));
      });

      this.connection.on('UnreadCountUpdated', (count: number) => {
        this.unreadCountListeners.forEach((l) => l(count));
      });

      this.connection.onreconnected(() => this.rejoinConversations(true));
    }

    const connection = this.connection;
    this.connectionStart = (async () => {
      try {
        await connection.start();
        console.log('⚡ SignalR ChatHub connected.');
        await this.rejoinConversations();
      } catch (err) {
        console.error('❌ Error connecting to SignalR ChatHub:', err);
      } finally {
        this.connectionStart = null;
      }
    })();

    return this.connectionStart;
  }

  private async rejoinConversations(notifyListeners = false) {
    if (!this.connection || this.connection.state !== signalR.HubConnectionState.Connected) {
      return;
    }

    try {
      await Promise.all(
        Array.from(this.joinedConversationIds, (conversationId) =>
          this.connection!.invoke('JoinConversation', conversationId)
        )
      );
      if (notifyListeners) {
        this.reconnectedListeners.forEach((listener) => listener());
      }
    } catch (err) {
      console.error('❌ Error restoring SignalR chat subscriptions:', err);
    }
  }

  public async joinConversation(conversationId: number) {
    this.joinedConversationIds.add(conversationId);
    if (this.connection?.state !== signalR.HubConnectionState.Connected) {
      if (this.token) {
        await this.startConnection(this.token);
      }
    }
    if (this.connection?.state === signalR.HubConnectionState.Connected) {
      await this.connection.invoke('JoinConversation', conversationId);
    }
  }

  public async leaveConversation(conversationId: number) {
    this.joinedConversationIds.delete(conversationId);
    if (this.connection && this.connection.state === signalR.HubConnectionState.Connected) {
      await this.connection.invoke('LeaveConversation', conversationId);
    }
  }

  public async sendMessage(payload: SendMessagePayload) {
    if (this.connection && this.connection.state === signalR.HubConnectionState.Connected) {
      await this.connection.invoke('SendMessage', payload);
    } else {
      const response = await chatService.sendMessage(payload);
      this.messageListeners.forEach((listener) => listener(response.data));
    }
  }

  public async markAsRead(conversationId: number) {
    if (this.connection && this.connection.state === signalR.HubConnectionState.Connected) {
      await this.connection.invoke('MarkAsRead', conversationId);
    } else {
      await chatService.markAsRead(conversationId);
    }
  }

  public onMessage(listener: MessageListener) {
    this.messageListeners.add(listener);
    return () => this.messageListeners.delete(listener);
  }

  public onNewNotification(listener: NewNotificationListener) {
    this.notificationListeners.add(listener);
    return () => this.notificationListeners.delete(listener);
  }

  public onReadStatus(listener: ReadStatusListener) {
    this.readStatusListeners.add(listener);
    return () => this.readStatusListeners.delete(listener);
  }

  public onUnreadCount(listener: UnreadCountListener) {
    this.unreadCountListeners.add(listener);
    return () => this.unreadCountListeners.delete(listener);
  }

  public onReconnected(listener: ReconnectedListener) {
    this.reconnectedListeners.add(listener);
    return () => this.reconnectedListeners.delete(listener);
  }

  public stopConnection() {
    if (this.connection) {
      this.connection.stop();
      this.connection = null;
      this.connectionStart = null;
      this.joinedConversationIds.clear();
    }
  }
}

export const chatSignalR = new ChatSignalRClient();
