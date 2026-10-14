using System.Security.Claims;
using Backend.Hubs;
using Backend.Models.DTOs.ChatDTOs;
using Backend.Services.ChatService;
using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;
using Microsoft.AspNetCore.SignalR;

namespace Backend.Controllers
{
    [ApiController]
    [Route("api/[controller]")]
    [Authorize]
    public class ChatController : ControllerBase
    {
        private readonly IChatService _chatService;
        private readonly IHubContext<ChatHub> _chatHub;

        public ChatController(IChatService chatService, IHubContext<ChatHub> chatHub)
        {
            _chatService = chatService;
            _chatHub = chatHub;
        }

        private int GetCurrentUserId()
        {
            var userIdClaim = User.FindFirst("UserId")?.Value 
                              ?? User.FindFirst(ClaimTypes.NameIdentifier)?.Value;
            if (int.TryParse(userIdClaim, out var userId))
            {
                return userId;
            }
            throw new UnauthorizedAccessException("Không xác định được người dùng.");
        }

        /// <summary>
        /// Lấy danh sách cuộc trò chuyện của người dùng hiện tại (áp dụng cho cả Buyer và Seller).
        /// </summary>
        [HttpGet("conversations")]
        public async Task<IActionResult> GetConversations()
        {
            var userId = GetCurrentUserId();
            var conversations = await _chatService.GetUserConversationsAsync(userId);
            return Ok(new { success = true, data = conversations });
        }

        /// <summary>
        /// Lấy lịch sử tin nhắn của một cuộc hội thoại.
        /// </summary>
        [HttpGet("conversations/{conversationId:int}/messages")]
        public async Task<IActionResult> GetMessages(int conversationId, [FromQuery] int limit = 50)
        {
            var userId = GetCurrentUserId();
            var messages = await _chatService.GetConversationMessagesAsync(userId, conversationId, limit);
            return Ok(new { success = true, data = messages });
        }

        /// <summary>
        /// Khởi tạo hoặc tìm cuộc trò chuyện giữa người mua và người bán (kèm ngữ cảnh sản phẩm nếu có).
        /// </summary>
        [HttpPost("conversations/init")]
        public async Task<IActionResult> InitConversation([FromBody] InitConversationRequestDto dto)
        {
            try
            {
                var userId = GetCurrentUserId();
                var conversation = await _chatService.InitOrGetConversationAsync(userId, dto.SellerId, dto.InitialProductId);
                return Ok(new { success = true, data = conversation });
            }
            catch (Exception ex)
            {
                return BadRequest(new { success = false, message = ex.Message });
            }
        }

        /// <summary>
        /// Gửi tin nhắn qua REST API (fallback hoặc tích hợp tiện ích).
        /// </summary>
        [HttpPost("messages")]
        public async Task<IActionResult> SendMessage([FromBody] SendMessageRequestDto dto)
        {
            var userId = GetCurrentUserId();
            var (success, error, message, receiverId) = await _chatService.SaveMessageAsync(userId, dto);
            if (!success || message == null)
            {
                return BadRequest(new { success = false, message = error });
            }

            await _chatHub.Clients.Group(ChatHub.ConversationGroup(dto.ConversationId))
                .SendAsync("ReceiveMessage", message);
            await _chatHub.Clients.Group(ChatHub.UserGroup(receiverId))
                .SendAsync("NewMessageNotification", new
                {
                    conversationId = dto.ConversationId,
                    message
                });
            var unreadCount = await _chatService.GetTotalUnreadCountAsync(receiverId);
            await _chatHub.Clients.Group(ChatHub.UserGroup(receiverId))
                .SendAsync("UnreadCountUpdated", unreadCount);

            return Ok(new { success = true, data = message });
        }

        /// <summary>
        /// Đánh dấu đã đọc cuộc hội thoại.
        /// </summary>
        [HttpPatch("conversations/{conversationId:int}/read")]
        public async Task<IActionResult> MarkAsRead(int conversationId)
        {
            var userId = GetCurrentUserId();
            var (success, error, _) = await _chatService.MarkConversationAsReadAsync(userId, conversationId);
            if (!success)
            {
                return BadRequest(new { success = false, message = error });
            }

            await _chatHub.Clients.Group(ChatHub.ConversationGroup(conversationId))
                .SendAsync("MessagesMarkedAsRead", new
                {
                    conversationId,
                    readerId = userId
                });
            var unreadCount = await _chatService.GetTotalUnreadCountAsync(userId);
            await _chatHub.Clients.Group(ChatHub.UserGroup(userId))
                .SendAsync("UnreadCountUpdated", unreadCount);

            return Ok(new { success = true, message = "Đã đánh dấu đã đọc." });
        }

        /// <summary>
        /// Lấy tổng số tin nhắn chưa đọc của người dùng hiện tại.
        /// </summary>
        [HttpGet("unread-count")]
        public async Task<IActionResult> GetUnreadCount()
        {
            var userId = GetCurrentUserId();
            var count = await _chatService.GetTotalUnreadCountAsync(userId);
            return Ok(new { success = true, data = count });
        }
    }
}
