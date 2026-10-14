using System.ComponentModel.DataAnnotations;
using System.ComponentModel.DataAnnotations.Schema;

namespace Backend.Models
{
    [Table("ChatMessages")]
    public class ChatMessage
    {
        [Key]
        [DatabaseGenerated(DatabaseGeneratedOption.Identity)]
        public int MessageId { get; set; }

        [Required]
        [ForeignKey("Conversation")]
        public int ConversationId { get; set; }

        [Required]
        [ForeignKey("Sender")]
        public int SenderId { get; set; }

        [Required]
        [MaxLength(2000)]
        public string MessageText { get; set; } = string.Empty;

        [ForeignKey("AttachedProduct")]
        public int? AttachedProductId { get; set; }

        public bool IsRead { get; set; } = false;

        public DateTime CreatedAt { get; set; } = DateTime.UtcNow;

        // Navigation properties
        public virtual ChatConversation Conversation { get; set; } = null!;
        public virtual User Sender { get; set; } = null!;
        public virtual Product? AttachedProduct { get; set; }
    }
}
