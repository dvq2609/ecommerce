using Backend.Models.DTOs.ChatDTOs;

namespace Backend.Services.ChatService
{
    public interface IChatService
    {
        Task<List<ChatConversationSummaryDto>> GetUserConversationsAsync(int currentUserId);
        Task<List<ChatMessageDto>> GetConversationMessagesAsync(int currentUserId, int conversationId, int limit = 50);
        Task<ChatConversationSummaryDto> InitOrGetConversationAsync(int currentUserId, int sellerId, int? initialProductId);
        Task<(bool Success, string? Error, ChatMessageDto? Message, int ReceiverId)> SaveMessageAsync(int currentUserId, SendMessageRequestDto dto);
        Task<(bool Success, string? Error, int PartnerId)> MarkConversationAsReadAsync(int currentUserId, int conversationId);
        Task<int> GetTotalUnreadCountAsync(int currentUserId);
    }
}
