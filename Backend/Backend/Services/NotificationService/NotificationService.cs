using Backend.Hubs;
using Backend.Models;
using Backend.Models.DTOs.NotificationDTOs;
using Microsoft.AspNetCore.SignalR;
using Microsoft.EntityFrameworkCore;

namespace Backend.Services.NotificationService
{
    public class NotificationService : INotificationService
    {
        private readonly ApplicationDbContext _context;
        private readonly IHubContext<NotificationHub> _hubContext;
        private readonly ILogger<NotificationService> _logger;

        public NotificationService(
            ApplicationDbContext context,
            IHubContext<NotificationHub> hubContext,
            ILogger<NotificationService> logger)
        {
            _context = context;
            _hubContext = hubContext;
            _logger = logger;
        }

        public async Task<NotificationResponseDto> CreateAndSendNotificationAsync(
            int receiverId,
            int? senderId,
            string title,
            string message,
            string type = "Review",
            string? referenceId = null,
            string? targetUrl = null)
        {
            var notification = new Notification
            {
                ReceiverId = receiverId,
                SenderId = senderId,
                Title = title,
                Message = message,
                Type = type,
                ReferenceId = referenceId,
                TargetUrl = targetUrl,
                IsRead = false,
                CreatedAt = DateTime.UtcNow
            };

            _context.Notifications.Add(notification);
            await _context.SaveChangesAsync();

            // Lấy thông tin Sender để hiển thị DTO
            string? senderName = null;
            if (senderId.HasValue)
            {
                var sender = await _context.Users
                    .FirstOrDefaultAsync(u => u.UserId == senderId.Value);
                senderName = !string.IsNullOrWhiteSpace(sender?.FullName) ? sender.FullName : sender?.Email;
            }

            var dto = new NotificationResponseDto
            {
                NotificationId = notification.NotificationId,
                ReceiverId = notification.ReceiverId,
                SenderId = notification.SenderId,
                SenderName = senderName,
                Title = notification.Title,
                Message = notification.Message,
                Type = notification.Type,
                ReferenceId = notification.ReferenceId,
                TargetUrl = notification.TargetUrl,
                IsRead = notification.IsRead,
                CreatedAt = notification.CreatedAt
            };

            // Bắn SignalR Realtime tới Group của người nhận
            try
            {
                var targetGroup = NotificationHub.UserGroup(receiverId);
                await _hubContext.Clients.Group(targetGroup).SendAsync("ReceiveNotification", dto);
                
                // Đồng thời cập nhật Realtime đếm số thông báo chưa đọc
                var unreadCount = await GetUnreadCountAsync(receiverId);
                await _hubContext.Clients.Group(targetGroup).SendAsync("UpdateUnreadCount", unreadCount);

                _logger.LogInformation("SignalR dispatched notification {Id} to {Group}", dto.NotificationId, targetGroup);
            }
            catch (Exception ex)
            {
                _logger.LogError(ex, "Failed to send SignalR notification {Id}", dto.NotificationId);
            }

            return dto;
        }

        public async Task<(List<NotificationResponseDto> Items, int TotalCount, int UnreadCount)> GetUserNotificationsAsync(
            int userId, int pageNumber = 1, int pageSize = 20)
        {
            var query = _context.Notifications
                .Where(n => n.ReceiverId == userId)
                .OrderByDescending(n => n.CreatedAt);

            var totalCount = await query.CountAsync();
            var unreadCount = await _context.Notifications.CountAsync(n => n.ReceiverId == userId && !n.IsRead);

            var items = await query
                .Skip((pageNumber - 1) * pageSize)
                .Take(pageSize)
                .Select(n => new NotificationResponseDto
                {
                    NotificationId = n.NotificationId,
                    ReceiverId = n.ReceiverId,
                    SenderId = n.SenderId,
                    SenderName = n.Sender != null 
                        ? (!string.IsNullOrWhiteSpace(n.Sender.FullName) ? n.Sender.FullName : n.Sender.Email) 
                        : null,
                    Title = n.Title,
                    Message = n.Message,
                    Type = n.Type,
                    ReferenceId = n.ReferenceId,
                    TargetUrl = n.TargetUrl,
                    IsRead = n.IsRead,
                    CreatedAt = n.CreatedAt
                })
                .ToListAsync();

            return (items, totalCount, unreadCount);
        }

        public async Task<int> GetUnreadCountAsync(int userId)
        {
            return await _context.Notifications.CountAsync(n => n.ReceiverId == userId && !n.IsRead);
        }

        public async Task<bool> MarkAsReadAsync(int notificationId, int userId)
        {
            var notif = await _context.Notifications
                .FirstOrDefaultAsync(n => n.NotificationId == notificationId && n.ReceiverId == userId);

            if (notif == null) return false;

            if (!notif.IsRead)
            {
                notif.IsRead = true;
                await _context.SaveChangesAsync();

                // Bắn realtime cập nhật lại unread count
                var unreadCount = await GetUnreadCountAsync(userId);
                await _hubContext.Clients.Group(NotificationHub.UserGroup(userId))
                    .SendAsync("UpdateUnreadCount", unreadCount);
            }

            return true;
        }

        public async Task<bool> MarkAllAsReadAsync(int userId)
        {
            var unreadList = await _context.Notifications
                .Where(n => n.ReceiverId == userId && !n.IsRead)
                .ToListAsync();

            if (unreadList.Any())
            {
                foreach (var item in unreadList)
                {
                    item.IsRead = true;
                }
                await _context.SaveChangesAsync();

                await _hubContext.Clients.Group(NotificationHub.UserGroup(userId))
                    .SendAsync("UpdateUnreadCount", 0);
            }

            return true;
        }
    }
}
