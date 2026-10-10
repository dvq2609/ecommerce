using System.ComponentModel.DataAnnotations;
using System.ComponentModel.DataAnnotations.Schema;
using Microsoft.EntityFrameworkCore;

namespace Backend.Models
{
    [Table("Notifications")]
    [Index(nameof(NotificationId), Name = "IX_Notifications_NotificationId", IsUnique = true)]
    [Index(nameof(ReceiverId), Name = "IX_Notifications_ReceiverId")]
    [Index(nameof(SenderId), Name = "IX_Notifications_SenderId")]
    [Index(nameof(IsRead), Name = "IX_Notifications_IsRead")]
    public class Notification
    {
        [Key]
        [DatabaseGenerated(DatabaseGeneratedOption.Identity)]
        public int NotificationId { get; set; }

        [Required]
        [ForeignKey("Receiver")]
        public int ReceiverId { get; set; } // Người nhận thông báo (VD: Seller sở hữu sản phẩm)

        [ForeignKey("Sender")]
        public int? SenderId { get; set; } // Người gửi/Tác nhân (VD: Khách hàng đánh giá)

        [Required]
        [MaxLength(255)]
        public string Title { get; set; } = string.Empty;

        [Required]
        [MaxLength(1000)]
        public string Message { get; set; } = string.Empty;

        [Required]
        [MaxLength(50)]
        public string Type { get; set; } = "Review"; // Review, Order, System

        [MaxLength(100)]
        public string? ReferenceId { get; set; } // reviewId hoặc orderCode

        [MaxLength(255)]
        public string? TargetUrl { get; set; }

        public bool IsRead { get; set; } = false;

        public DateTime CreatedAt { get; set; } = DateTime.UtcNow;

        // Navigation properties
        public virtual User Receiver { get; set; } = null!;
        public virtual User? Sender { get; set; }
    }
}
