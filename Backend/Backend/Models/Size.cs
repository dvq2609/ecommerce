using System.ComponentModel.DataAnnotations;
using System.ComponentModel.DataAnnotations.Schema;
using Microsoft.EntityFrameworkCore;

namespace Backend.Models
{
    [Table("Sizes")]
    [Index(nameof(SizeId), Name = "IX_Sizes_SizeId", IsUnique = true)]
    [Index(nameof(SizeName), Name = "IX_Sizes_SizeName", IsUnique = true)]
    public class Size
    {
        [Key]
        [DatabaseGenerated(DatabaseGeneratedOption.Identity)]
        public int SizeId { get; set; }

        [Required]
        [MaxLength(20)]
        public string SizeName { get; set; } = string.Empty; // e.g. "S", "M", "L", "XL"

        [MaxLength(100)]
        public string? Description { get; set; } // e.g. "45-52kg", "53-60kg"

        public int DisplayOrder { get; set; } = 0; // Để sắp xếp thứ tự: XS (1) -> S (2) -> M (3) -> L (4)...

        // Navigation properties
        public virtual ICollection<ProductVariant> Variants { get; set; } = new List<ProductVariant>();
    }
}
