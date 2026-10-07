using System.ComponentModel.DataAnnotations;
using System.ComponentModel.DataAnnotations.Schema;
using Microsoft.EntityFrameworkCore;

namespace Backend.Models
{
    [Table("ProductImage")]
    [Index(nameof(ProductImageId), Name = "IX_ProductImage_ProductImageId", IsUnique = true)]
    [Index(nameof(ProductId), Name = "IX_ProductImage_ProductId")]
    [Index(nameof(ColorId), Name = "IX_ProductImage_ColorId")]
    public class ProductImage
    {
        [Key]
        [DatabaseGenerated(DatabaseGeneratedOption.Identity)]
        public int ProductImageId { get; set; }

        [Required]
        [ForeignKey("Product")]
        public int ProductId { get; set; }

        [ForeignKey("Color")]
        public int? ColorId { get; set; } // Nullable: nếu null là ảnh chung, nếu có là ảnh riêng của màu đó

        [Required]
        [MaxLength(500)]
        public string ImageUrl { get; set; } = string.Empty;

        public bool IsPrimary { get; set; } = false;

        public int DisplayOrder { get; set; } = 0;

        public DateTime CreatedAt { get; set; } = DateTime.UtcNow;

        // Navigation properties
        public virtual Product Product { get; set; } = null!;
        public virtual Color? Color { get; set; }
    }
}
