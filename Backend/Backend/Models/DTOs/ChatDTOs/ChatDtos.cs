namespace Backend.Models.DTOs.ChatDTOs
{
    public class ChatAttachedProductDto
    {
        public int ProductId { get; set; }
        public string ProductName { get; set; } = string.Empty;
        public string Slug { get; set; } = string.Empty;
        public decimal Price { get; set; }
        public string PrimaryImage { get; set; } = string.Empty;
    }

    public class ChatMessageDto
    {
        public int MessageId { get; set; }
        public int ConversationId { get; set; }
        public int SenderId { get; set; }
        public string SenderName { get; set; } = string.Empty;
        public string SenderAvatar { get; set; } = string.Empty;
        public string MessageText { get; set; } = string.Empty;
        public bool IsRead { get; set; }
        public DateTime CreatedAt { get; set; }
        public ChatAttachedProductDto? AttachedProduct { get; set; }
    }

    public class ChatPartnerDto
    {
        public int UserId { get; set; }
        public string FullName { get; set; } = string.Empty;
        public string Email { get; set; } = string.Empty;
        public string AvatarUrl { get; set; } = string.Empty;
        public string RoleName { get; set; } = string.Empty;
    }

    public class ChatConversationSummaryDto
    {
        public int ConversationId { get; set; }
        public ChatPartnerDto Partner { get; set; } = new();
        public string? LastMessageText { get; set; }
        public DateTime LastMessageAt { get; set; }
        public int? LastSenderId { get; set; }
        public int UnreadCount { get; set; }
        public DateTime CreatedAt { get; set; }
    }

    public class SendMessageRequestDto
    {
        public int ConversationId { get; set; }
        public string MessageText { get; set; } = string.Empty;
        public int? AttachedProductId { get; set; }
    }

    public class InitConversationRequestDto
    {
        public int SellerId { get; set; }
        public int? InitialProductId { get; set; }
    }
}
