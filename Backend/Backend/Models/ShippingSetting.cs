using System;
using System.ComponentModel.DataAnnotations;
using System.ComponentModel.DataAnnotations.Schema;

namespace Backend.Models
{
    public class ShippingSetting
    {
        [Key]
        public int Id { get; set; }

        [Column(TypeName = "decimal(18,2)")]
        public decimal FreeShippingThreshold { get; set; } = 1000000m;

        [Column(TypeName = "decimal(18,2)")]
        public decimal DefaultShippingFee { get; set; } = 30000m;

        public bool IsFreeShippingEnabled { get; set; } = true;

        public DateTime UpdatedAt { get; set; } = DateTime.UtcNow;
    }
}
