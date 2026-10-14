using System.ComponentModel.DataAnnotations;
using System.ComponentModel.DataAnnotations.Schema;
using Microsoft.EntityFrameworkCore;

namespace Backend.Models
{
    [Table("ChatConversations")]
    [Index(nameof(BuyerId), nameof(SellerId), Name = "IX_ChatConversations_Buyer_Seller", IsUnique = true)]
    public class ChatConversation
    {
        [Key]
        [DatabaseGenerated(DatabaseGeneratedOption.Identity)]
        public int ConversationId { get; set; }

        [Required]
        [ForeignKey("Buyer")]
        public int BuyerId { get; set; }

        [Required]
        [ForeignKey("Seller")]
        public int SellerId { get; set; }

        [MaxLength(1000)]
        public string? LastMessageText { get; set; }

        public DateTime LastMessageAt { get; set; } = DateTime.UtcNow;

        public int? LastSenderId { get; set; }

        public int BuyerUnreadCount { get; set; } = 0;

        public int SellerUnreadCount { get; set; } = 0;

        public DateTime CreatedAt { get; set; } = DateTime.UtcNow;

        // Navigation properties
        public virtual User Buyer { get; set; } = null!;
        public virtual User Seller { get; set; } = null!;
        public virtual ICollection<ChatMessage> Messages { get; set; } = new List<ChatMessage>();
    }
}
