using System.ComponentModel.DataAnnotations;
using System.ComponentModel.DataAnnotations.Schema;
using Backend.Models.Enums;
using Microsoft.EntityFrameworkCore;

namespace Backend.Models
{
    [Table("Vouchers")]
    [Index(nameof(Code), Name = "IX_Vouchers_Code", IsUnique = true)]
    [Index(nameof(DiscountType), Name = "IX_Vouchers_DiscountType")]
    [Index(nameof(IsActive), Name = "IX_Vouchers_IsActive")]
    public class Voucher
    {
        [Key]
        [DatabaseGenerated(DatabaseGeneratedOption.Identity)]
        public int VoucherId { get; set; }

        [Required]
        [MaxLength(50)]
        public string Code { get; set; } = string.Empty;

        [Required]
        [MaxLength(150)]
        public string Title { get; set; } = string.Empty;

        [MaxLength(500)]
        public string? Description { get; set; }

        [Required]
        public VoucherDiscountType DiscountType { get; set; } = VoucherDiscountType.FixedAmount;

        [Required]
        [Column(TypeName = "decimal(18,2)")]
        public decimal DiscountValue { get; set; }

        [Column(TypeName = "decimal(18,2)")]
        public decimal? MaxDiscountAmount { get; set; }

        [Required]
        [Column(TypeName = "decimal(18,2)")]
        public decimal MinOrderValue { get; set; } = 0;

        [Required]
        public DateTime StartDate { get; set; } = DateTime.UtcNow;

        [Required]
        public DateTime EndDate { get; set; } = DateTime.UtcNow.AddMonths(1);

        [Required]
        public int UsageLimit { get; set; } = 100;

        [Required]
        public int UsedCount { get; set; } = 0;

        [Required]
        public int MaxUsagePerUser { get; set; } = 1;

        [Required]
        public bool IsActive { get; set; } = true;

        public DateTime CreatedAt { get; set; } = DateTime.UtcNow;

        public DateTime? UpdatedAt { get; set; }

        // Navigation properties
        public virtual ICollection<VoucherUsage> VoucherUsages { get; set; } = new List<VoucherUsage>();
    }
}
