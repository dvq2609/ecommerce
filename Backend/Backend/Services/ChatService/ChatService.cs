using Backend.Models;
using Backend.Models.DTOs.ChatDTOs;
using Microsoft.EntityFrameworkCore;

namespace Backend.Services.ChatService
{
    public class ChatService : IChatService
    {
        private readonly ApplicationDbContext _context;

        public ChatService(ApplicationDbContext context)
        {
            _context = context;
        }

        public async Task<List<ChatConversationSummaryDto>> GetUserConversationsAsync(int currentUserId)
        {
            var conversations = await _context.ChatConversations
                .AsNoTracking()
                .Include(c => c.Buyer)
                .Include(c => c.Seller)
                .Where(c => c.BuyerId == currentUserId || c.SellerId == currentUserId)
                .OrderByDescending(c => c.LastMessageAt)
                .ToListAsync();

            return conversations.Select(c =>
            {
                var isBuyer = c.BuyerId == currentUserId;
                var partner = isBuyer ? c.Seller : c.Buyer;
                var unreadCount = isBuyer ? c.BuyerUnreadCount : c.SellerUnreadCount;

                return new ChatConversationSummaryDto
                {
                    ConversationId = c.ConversationId,
                    Partner = new ChatPartnerDto
                    {
                        UserId = partner.UserId,
                        FullName = partner.FullName,
                        Email = partner.Email,
                        AvatarUrl = partner.ImageUrl ?? string.Empty,
                        RoleName = partner.RoleId == 3 ? "seller" : (partner.RoleId == 1 ? "admin" : "buyer")
                    },
                    LastMessageText = c.LastMessageText,
                    LastMessageAt = c.LastMessageAt,
                    LastSenderId = c.LastSenderId,
                    UnreadCount = unreadCount,
                    CreatedAt = c.CreatedAt
                };
            }).ToList();
        }

        public async Task<List<ChatMessageDto>> GetConversationMessagesAsync(int currentUserId, int conversationId, int limit = 50)
        {
            // Kiểm tra quyền truy cập hội thoại
            var conv = await _context.ChatConversations
                .AsNoTracking()
                .FirstOrDefaultAsync(c => c.ConversationId == conversationId && (c.BuyerId == currentUserId || c.SellerId == currentUserId));

            if (conv == null)
            {
                return new List<ChatMessageDto>();
            }

            var messages = await _context.ChatMessages
                .AsNoTracking()
                .Include(m => m.Sender)
                .Include(m => m.AttachedProduct)
                    .ThenInclude(p => p!.Images)
                .Where(m => m.ConversationId == conversationId)
                .OrderByDescending(m => m.CreatedAt)
                .Take(limit)
                .ToListAsync();

            // Đảo ngược lại để theo thứ tự thời gian tăng dần
            messages.Reverse();

            return messages.Select(m => MapMessageToDto(m)).ToList();
        }

        public async Task<ChatConversationSummaryDto> InitOrGetConversationAsync(int currentUserId, int sellerId, int? initialProductId)
        {
            if (currentUserId == sellerId)
            {
                throw new InvalidOperationException("Bạn không thể mở cuộc trò chuyện với chính mình.");
            }

            var conversation = await _context.ChatConversations
                .Include(c => c.Buyer)
                .Include(c => c.Seller)
                .FirstOrDefaultAsync(c => c.BuyerId == currentUserId && c.SellerId == sellerId);

            if (conversation == null)
            {
                conversation = new ChatConversation
                {
                    BuyerId = currentUserId,
                    SellerId = sellerId,
                    LastMessageText = initialProductId.HasValue ? "Quan tâm sản phẩm" : null,
                    LastMessageAt = DateTime.UtcNow,
                    LastSenderId = currentUserId,
                    BuyerUnreadCount = 0,
                    SellerUnreadCount = 0,
                    CreatedAt = DateTime.UtcNow
                };

                _context.ChatConversations.Add(conversation);
                await _context.SaveChangesAsync();

                // Nạp lại thông tin Buyer & Seller
                await _context.Entry(conversation).Reference(c => c.Buyer).LoadAsync();
                await _context.Entry(conversation).Reference(c => c.Seller).LoadAsync();
            }

            var isBuyer = conversation.BuyerId == currentUserId;
            var partner = isBuyer ? conversation.Seller : conversation.Buyer;
            var unreadCount = isBuyer ? conversation.BuyerUnreadCount : conversation.SellerUnreadCount;

            return new ChatConversationSummaryDto
            {
                ConversationId = conversation.ConversationId,
                Partner = new ChatPartnerDto
                {
                    UserId = partner.UserId,
                    FullName = partner.FullName,
                    Email = partner.Email,
                    AvatarUrl = partner.ImageUrl ?? string.Empty,
                    RoleName = partner.RoleId == 3 ? "seller" : (partner.RoleId == 1 ? "admin" : "buyer")
                },
                LastMessageText = conversation.LastMessageText,
                LastMessageAt = conversation.LastMessageAt,
                LastSenderId = conversation.LastSenderId,
                UnreadCount = unreadCount,
                CreatedAt = conversation.CreatedAt
            };
        }

        public async Task<(bool Success, string? Error, ChatMessageDto? Message, int ReceiverId)> SaveMessageAsync(int currentUserId, SendMessageRequestDto dto)
        {
            if (string.IsNullOrWhiteSpace(dto.MessageText))
            {
                return (false, "Nội dung tin nhắn không được để trống.", null, 0);
            }

            var conversation = await _context.ChatConversations
                .Include(c => c.Buyer)
                .Include(c => c.Seller)
                .FirstOrDefaultAsync(c => c.ConversationId == dto.ConversationId);

            if (conversation == null)
            {
                return (false, "Không tìm thấy cuộc trò chuyện.", null, 0);
            }

            if (conversation.BuyerId != currentUserId && conversation.SellerId != currentUserId)
            {
                return (false, "Bạn không có quyền gửi tin nhắn trong cuộc trò chuyện này.", null, 0);
            }

            var receiverId = conversation.BuyerId == currentUserId ? conversation.SellerId : conversation.BuyerId;

            var message = new ChatMessage
            {
                ConversationId = dto.ConversationId,
                SenderId = currentUserId,
                MessageText = dto.MessageText.Trim(),
                AttachedProductId = dto.AttachedProductId,
                IsRead = false,
                CreatedAt = DateTime.UtcNow
            };

            _context.ChatMessages.Add(message);

            // Cập nhật cuộc hội thoại
            conversation.LastMessageText = message.MessageText;
            conversation.LastMessageAt = message.CreatedAt;
            conversation.LastSenderId = currentUserId;

            if (currentUserId == conversation.BuyerId)
            {
                conversation.SellerUnreadCount += 1;
            }
            else
            {
                conversation.BuyerUnreadCount += 1;
            }

            await _context.SaveChangesAsync();

            // Eager load sender & attached product
            await _context.Entry(message).Reference(m => m.Sender).LoadAsync();
            if (message.AttachedProductId.HasValue)
            {
                await _context.Entry(message).Reference(m => m.AttachedProduct).LoadAsync();
                if (message.AttachedProduct != null)
                {
                    await _context.Entry(message.AttachedProduct).Collection(p => p.Images).LoadAsync();
                }
            }

            return (true, null, MapMessageToDto(message), receiverId);
        }

        public async Task<(bool Success, string? Error, int PartnerId)> MarkConversationAsReadAsync(int currentUserId, int conversationId)
        {
            var conversation = await _context.ChatConversations
                .FirstOrDefaultAsync(c => c.ConversationId == conversationId);

            if (conversation == null)
            {
                return (false, "Không tìm thấy cuộc hội thoại.", 0);
            }

            if (conversation.BuyerId != currentUserId && conversation.SellerId != currentUserId)
            {
                return (false, "Bạn không thuộc cuộc hội thoại này.", 0);
            }

            var isBuyer = conversation.BuyerId == currentUserId;
            var partnerId = isBuyer ? conversation.SellerId : conversation.BuyerId;

            if (isBuyer)
            {
                conversation.BuyerUnreadCount = 0;
            }
            else
            {
                conversation.SellerUnreadCount = 0;
            }

            // Đánh dấu IsRead = true cho các tin nhắn được gửi từ người đối diện
            var unreadMessages = await _context.ChatMessages
                .Where(m => m.ConversationId == conversationId && m.SenderId != currentUserId && !m.IsRead)
                .ToListAsync();

            foreach (var msg in unreadMessages)
            {
                msg.IsRead = true;
            }

            await _context.SaveChangesAsync();
            return (true, null, partnerId);
        }

        public async Task<int> GetTotalUnreadCountAsync(int currentUserId)
        {
            var buyerUnread = await _context.ChatConversations
                .Where(c => c.BuyerId == currentUserId)
                .SumAsync(c => c.BuyerUnreadCount);

            var sellerUnread = await _context.ChatConversations
                .Where(c => c.SellerId == currentUserId)
                .SumAsync(c => c.SellerUnreadCount);

            return buyerUnread + sellerUnread;
        }

        private static ChatMessageDto MapMessageToDto(ChatMessage m)
        {
            ChatAttachedProductDto? attachedProduct = null;
            if (m.AttachedProduct != null)
            {
                var primaryImg = m.AttachedProduct.Images?.FirstOrDefault(i => i.IsPrimary)?.ImageUrl
                    ?? m.AttachedProduct.Images?.FirstOrDefault()?.ImageUrl
                    ?? string.Empty;

                attachedProduct = new ChatAttachedProductDto
                {
                    ProductId = m.AttachedProduct.ProductId,
                    ProductName = m.AttachedProduct.ProductName,
                    Slug = m.AttachedProduct.Slug,
                    Price = m.AttachedProduct.Price,
                    PrimaryImage = primaryImg
                };
            }

            return new ChatMessageDto
            {
                MessageId = m.MessageId,
                ConversationId = m.ConversationId,
                SenderId = m.SenderId,
                SenderName = m.Sender?.FullName ?? "Người dùng",
                SenderAvatar = m.Sender?.ImageUrl ?? string.Empty,
                MessageText = m.MessageText,
                IsRead = m.IsRead,
                CreatedAt = m.CreatedAt,
                AttachedProduct = attachedProduct
            };
        }
    }
}
