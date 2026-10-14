using Backend.Models.DTOs.ChatDTOs;
using Backend.Services.ChatService;
using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.SignalR;

namespace Backend.Hubs
{
    [Authorize]
    public class ChatHub : Hub
    {
        private readonly IChatService _chatService;

        public ChatHub(IChatService chatService)
        {
            _chatService = chatService;
        }

        public static string ConversationGroup(int conversationId) => $"conversation:{conversationId}";
        public static string UserGroup(int userId) => $"user:{userId}";

        public override async Task OnConnectedAsync()
        {
            var userIdValue = Context.User?.FindFirst("UserId")?.Value 
                              ?? Context.User?.FindFirst(System.Security.Claims.ClaimTypes.NameIdentifier)?.Value;

            if (int.TryParse(userIdValue, out var userId))
            {
                await Groups.AddToGroupAsync(Context.ConnectionId, UserGroup(userId));
            }

            await base.OnConnectedAsync();
        }

        public override async Task OnDisconnectedAsync(Exception? exception)
        {
            var userIdValue = Context.User?.FindFirst("UserId")?.Value 
                              ?? Context.User?.FindFirst(System.Security.Claims.ClaimTypes.NameIdentifier)?.Value;

            if (int.TryParse(userIdValue, out var userId))
            {
                await Groups.RemoveFromGroupAsync(Context.ConnectionId, UserGroup(userId));
            }

            await base.OnDisconnectedAsync(exception);
        }

        /// <summary>
        /// Tham gia vào nhóm của 1 cuộc hội thoại cụ thể khi mở khung chat.
        /// </summary>
        public async Task JoinConversation(int conversationId)
        {
            await Groups.AddToGroupAsync(Context.ConnectionId, ConversationGroup(conversationId));
        }

        /// <summary>
        /// Rời khỏi nhóm khi đóng khung chat.
        /// </summary>
        public async Task LeaveConversation(int conversationId)
        {
            await Groups.RemoveFromGroupAsync(Context.ConnectionId, ConversationGroup(conversationId));
        }

        /// <summary>
        /// Gửi tin nhắn tức thời qua WebSocket và lưu vào DB.
        /// </summary>
        public async Task SendMessage(SendMessageRequestDto request)
        {
            var userIdValue = Context.User?.FindFirst("UserId")?.Value 
                              ?? Context.User?.FindFirst(System.Security.Claims.ClaimTypes.NameIdentifier)?.Value;

            if (!int.TryParse(userIdValue, out var currentUserId))
            {
                throw new HubException("Không xác định được danh tính người dùng.");
            }

            var (success, error, messageDto, receiverId) = await _chatService.SaveMessageAsync(currentUserId, request);
            if (!success || messageDto == null)
            {
                throw new HubException(error ?? "Gửi tin nhắn thất bại.");
            }

            // 1. Phát tin nhắn đến nhóm hội thoại (cho những ai đang mở khung chat này)
            await Clients.Group(ConversationGroup(request.ConversationId)).SendAsync("ReceiveMessage", messageDto);

            // 2. Phát thông báo tin nhắn mới & cập nhật badge tới người nhận
            await Clients.Group(UserGroup(receiverId)).SendAsync("NewMessageNotification", new
            {
                conversationId = request.ConversationId,
                message = messageDto
            });
            var unread = await _chatService.GetTotalUnreadCountAsync(receiverId);
            await Clients.Group(UserGroup(receiverId)).SendAsync("UnreadCountUpdated", unread);
        }

        /// <summary>
        /// Đánh dấu đã đọc cuộc hội thoại và thông báo cho đối phương biết "Đã xem".
        /// </summary>
        public async Task MarkAsRead(int conversationId)
        {
            var userIdValue = Context.User?.FindFirst("UserId")?.Value 
                              ?? Context.User?.FindFirst(System.Security.Claims.ClaimTypes.NameIdentifier)?.Value;

            if (int.TryParse(userIdValue, out var currentUserId))
            {
                var (success, _, partnerId) = await _chatService.MarkConversationAsReadAsync(currentUserId, conversationId);
                if (success)
                {
                    // Báo cho đối tác biết tin nhắn đã được xem
                    await Clients.Group(ConversationGroup(conversationId)).SendAsync("MessagesMarkedAsRead", new
                    {
                        conversationId,
                        readerId = currentUserId
                    });

                    // Cập nhật lại số tin chưa đọc cho người đọc
                    var unread = await _chatService.GetTotalUnreadCountAsync(currentUserId);
                    await Clients.Group(UserGroup(currentUserId)).SendAsync("UnreadCountUpdated", unread);
                }
            }
        }
    }
}
