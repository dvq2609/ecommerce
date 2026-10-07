using System.ComponentModel.DataAnnotations;
using System.ComponentModel.DataAnnotations.Schema;
using Microsoft.EntityFrameworkCore;

namespace Backend.Models
{
    [Table("Colors")]
    [Index(nameof(ColorId), Name = "IX_Colors_ColorId", IsUnique = true)]
    [Index(nameof(ColorName), Name = "IX_Colors_ColorName", IsUnique = true)]
    public class Color
    {
        [Key]
        [DatabaseGenerated(DatabaseGeneratedOption.Identity)]
        public int ColorId { get; set; }

        [Required]
        [MaxLength(50)]
        public string ColorName { get; set; } = string.Empty;

        [Required]
        [MaxLength(20)]
        public string HexCode { get; set; } = string.Empty; // e.g. #E6DEC8, #1A1A1A

        // Navigation properties
        public virtual ICollection<ProductVariant> Variants { get; set; } = new List<ProductVariant>();
        public virtual ICollection<ProductImage> Images { get; set; } = new List<ProductImage>();
    }
}
