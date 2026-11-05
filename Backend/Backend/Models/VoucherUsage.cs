using System.ComponentModel.DataAnnotations;
using System.ComponentModel.DataAnnotations.Schema;
using Microsoft.EntityFrameworkCore;

namespace Backend.Models
{
    [Table("VoucherUsages")]
    [Index(nameof(VoucherId), nameof(UserId), Name = "IX_VoucherUsages_VoucherId_UserId")]
    [Index(nameof(OrderId), Name = "IX_VoucherUsages_OrderId")]
    public class VoucherUsage
    {
        [Key]
        [DatabaseGenerated(DatabaseGeneratedOption.Identity)]
        public int VoucherUsageId { get; set; }

        [Required]
        [ForeignKey("Voucher")]
        public int VoucherId { get; set; }

        [Required]
        [ForeignKey("User")]
        public int UserId { get; set; }

        [Required]
        [ForeignKey("Order")]
        public int OrderId { get; set; }

        [Required]
        [Column(TypeName = "decimal(18,2)")]
        public decimal DiscountApplied { get; set; }

        [Required]
        public bool IsShippingVoucher { get; set; } = false;

        [Required]
        public bool IsRefunded { get; set; } = false;

        public DateTime UsedAt { get; set; } = DateTime.UtcNow;

        // Navigation properties
        public virtual Voucher Voucher { get; set; } = null!;
        public virtual User User { get; set; } = null!;
        public virtual Order Order { get; set; } = null!;
    }
}
