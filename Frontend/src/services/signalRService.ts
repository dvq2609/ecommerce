import * as signalR from '@microsoft/signalr';

export interface RealtimeNotification {
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

type NotificationHandler = (notification: RealtimeNotification) => void;
type UnreadCountHandler = (unreadCount: number) => void;

class SignalRService {
  private connection: signalR.HubConnection | null = null;
  private notificationListeners: Set<NotificationHandler> = new Set();
  private unreadCountListeners: Set<UnreadCountHandler> = new Set();

  public async startConnection(token: string) {
    if (this.connection && this.connection.state === signalR.HubConnectionState.Connected) {
      return;
    }

    const hubUrl = 'http://localhost:5216/hubs/notification';

    this.connection = new signalR.HubConnectionBuilder()
      .withUrl(hubUrl, {
        accessTokenFactory: () => token,
        skipNegotiation: false,
        transport: signalR.HttpTransportType.WebSockets | signalR.HttpTransportType.LongPolling,
      })
      .withAutomaticReconnect([0, 2000, 5000, 10000, 30000])
      .configureLogging(signalR.LogLevel.Information)
      .build();

    this.connection.on('ReceiveNotification', (notification: RealtimeNotification) => {
      this.notificationListeners.forEach((listener) => listener(notification));
    });

    this.connection.on('UpdateUnreadCount', (unreadCount: number) => {
      this.unreadCountListeners.forEach((listener) => listener(unreadCount));
    });

    try {
      await this.connection.start();
      console.log('⚡ SignalR NotificationHub Connected successfully.');
    } catch (err) {
      console.error('❌ Error connecting to SignalR NotificationHub:', err);
    }
  }

  public stopConnection() {
    if (this.connection) {
      this.connection.stop();
      this.connection = null;
    }
  }

  public onNotification(handler: NotificationHandler) {
    this.notificationListeners.add(handler);
    return () => this.notificationListeners.delete(handler);
  }

  public onUnreadCount(handler: UnreadCountHandler) {
    this.unreadCountListeners.add(handler);
    return () => this.unreadCountListeners.delete(handler);
  }
}

export const signalRService = new SignalRService();
