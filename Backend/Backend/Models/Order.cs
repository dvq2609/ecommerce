using System.ComponentModel.DataAnnotations;
using System.ComponentModel.DataAnnotations.Schema;
using Backend.Models.Enums;
using Microsoft.EntityFrameworkCore;

namespace Backend.Models
{
    [Table("Orders")]
    [Index(nameof(OrderId), Name = "IX_Orders_OrderId", IsUnique = true)]
    [Index(nameof(OrderCode), Name = "IX_Orders_OrderCode", IsUnique = true)]
    [Index(nameof(UserId), Name = "IX_Orders_UserId")]
    public class Order
    {
        [Key]
        [DatabaseGenerated(DatabaseGeneratedOption.Identity)]
        public int OrderId { get; set; }

        [Required]
        [ForeignKey("User")]
        public int UserId { get; set; }

        [Required]
        [MaxLength(50)]
        public string OrderCode { get; set; } = string.Empty;

        [Required]
        [MaxLength(100)]
        public string RecipientName { get; set; } = string.Empty;

        [Required]
        [MaxLength(20)]
        [Phone]
        public string RecipientPhone { get; set; } = string.Empty;

        [Required]
        [MaxLength(500)]
        public string ShippingAddress { get; set; } = string.Empty;

        [MaxLength(1000)]
        public string? Note { get; set; }

        [Required]
        [Column(TypeName = "decimal(18,2)")]
        public decimal TotalAmount { get; set; }

        [Required]
        [Column(TypeName = "decimal(18,2)")]
        public decimal ShippingFee { get; set; } = 0;

        [Required]
        [Column(TypeName = "decimal(18,2)")]
        public decimal DiscountAmount { get; set; } = 0;

        [Required]
        [Column(TypeName = "decimal(18,2)")]
        public decimal FinalAmount { get; set; }

        [Required]
        public PaymentMethod PaymentMethod { get; set; } = PaymentMethod.COD;

        [Required]
        public PaymentStatus PaymentStatus { get; set; } = PaymentStatus.Pending;

        [Required]
        public OrderStatus OrderStatus { get; set; } = OrderStatus.Pending;

        public DateTime? PaymentDate { get; set; }

        [MaxLength(128)]
        public string? IdempotencyKey { get; set; }

        public DateTime CreatedAt { get; set; } = DateTime.UtcNow;

        public DateTime? UpdatedAt { get; set; }

        // Navigation properties
        public virtual User User { get; set; } = null!;
        public virtual ICollection<OrderItem> OrderItems { get; set; } = new List<OrderItem>();
        public virtual ICollection<PaymentTransaction> PaymentTransactions { get; set; } = new List<PaymentTransaction>();
    }
}
