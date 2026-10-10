using System.ComponentModel.DataAnnotations;

namespace Backend.Models.DTOs.NotificationDTOs
{
    public class NotificationResponseDto
    {
        public int NotificationId { get; set; }
        public int ReceiverId { get; set; }
        public int? SenderId { get; set; }
        public string? SenderName { get; set; }
        public string Title { get; set; } = string.Empty;
        public string Message { get; set; } = string.Empty;
        public string Type { get; set; } = "Review";
        public string? ReferenceId { get; set; }
        public string? TargetUrl { get; set; }
        public bool IsRead { get; set; }
        public DateTime CreatedAt { get; set; }
    }
}
