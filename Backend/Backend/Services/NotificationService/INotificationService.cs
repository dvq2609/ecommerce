using Backend.Models.DTOs.NotificationDTOs;

namespace Backend.Services.NotificationService
{
    public interface INotificationService
    {
        Task<NotificationResponseDto> CreateAndSendNotificationAsync(
            int receiverId,
            int? senderId,
            string title,
            string message,
            string type = "Review",
            string? referenceId = null,
            string? targetUrl = null);

        Task<(List<NotificationResponseDto> Items, int TotalCount, int UnreadCount)> GetUserNotificationsAsync(
            int userId, int pageNumber = 1, int pageSize = 20);

        Task<int> GetUnreadCountAsync(int userId);

        Task<bool> MarkAsReadAsync(int notificationId, int userId);

        Task<bool> MarkAllAsReadAsync(int userId);
    }
}
