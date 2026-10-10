using System.ComponentModel.DataAnnotations;
using System.ComponentModel.DataAnnotations.Schema;
using System.Text.Json.Serialization;

namespace Backend.Models
{
    [Table("PaymentTransactions")]
    public class PaymentTransaction
    {
        [Key]
        [DatabaseGenerated(DatabaseGeneratedOption.Identity)]
        public int TransactionId { get; set; }

        [Required]
        [ForeignKey("Order")]
        public int OrderId { get; set; }

        [Required]
        [MaxLength(50)]
        public string OrderCode { get; set; } = string.Empty;

        [Required]
        [Column(TypeName = "decimal(18,2)")]
        public decimal Amount { get; set; }

        [Required]
        [MaxLength(50)]
        public string BankCode { get; set; } = "MB";

        [Required]
        [MaxLength(50)]
        public string BankAccount { get; set; } = string.Empty;

        [MaxLength(100)]
        public string? TransactionRef { get; set; }

        [Required]
        [MaxLength(255)]
        public string TransferContent { get; set; } = string.Empty;

        [Required]
        [MaxLength(50)]
        public string Status { get; set; } = "Pending"; // "Pending", "Success", "Failed"

        public DateTime? PaidAt { get; set; }

        public DateTime CreatedAt { get; set; } = DateTime.UtcNow;

        public string? RawWebhookPayload { get; set; }

        // Navigation property
        [JsonIgnore]
        public virtual Order? Order { get; set; }
    }
}
