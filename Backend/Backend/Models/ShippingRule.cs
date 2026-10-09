using System;
using System.ComponentModel.DataAnnotations;
using System.ComponentModel.DataAnnotations.Schema;

namespace Backend.Models
{
    public class ShippingRule
    {
        [Key]
        public int ShippingRuleId { get; set; }

        [Required]
        [MaxLength(100)]
        public string FromLocation { get; set; } = "TP. Hồ Chí Minh";

        [Required]
        [MaxLength(100)]
        public string ToLocation { get; set; } = string.Empty;

        [Column(TypeName = "decimal(18,2)")]
        public decimal Fee { get; set; } = 30000m;

        [MaxLength(50)]
        public string? EstimatedDeliveryDays { get; set; } = "2 - 4 ngày";

        public bool IsActive { get; set; } = true;

        public DateTime CreatedAt { get; set; } = DateTime.UtcNow;

        public DateTime? UpdatedAt { get; set; }
    }
}
