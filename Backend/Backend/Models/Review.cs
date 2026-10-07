using System.ComponentModel.DataAnnotations;
using System.ComponentModel.DataAnnotations.Schema;
using Microsoft.EntityFrameworkCore;

namespace Backend.Models
{
    [Table("Reviews")]
    [Index(nameof(ReviewId), Name = "IX_Reviews_ReviewId", IsUnique = true)]
    [Index(nameof(ProductId), Name = "IX_Reviews_ProductId")]
    [Index(nameof(UserId), Name = "IX_Reviews_UserId")]
    [Index(nameof(ProductVariantId), Name = "IX_Reviews_ProductVariantId")]
    public class Review
    {
        [Key]
        [DatabaseGenerated(DatabaseGeneratedOption.Identity)]
        public int ReviewId { get; set; }

        [Required]
        [ForeignKey("Product")]
        public int ProductId { get; set; }

        [Required]
        [ForeignKey("User")]
        public int UserId { get; set; }

        [ForeignKey("ProductVariant")]
        public int? ProductVariantId { get; set; } // Nullable: liên kết variant khách đã mua để hiện nhãn phân loại

        [Required]
        [Range(1, 5)]
        public int Rating { get; set; }

        [Required]
        [MaxLength(2000)]
        public string Comment { get; set; } = string.Empty;

        [MaxLength(2000)]
        public string? ReviewImagesJson { get; set; } // Mảng JSON chứa các URL ảnh feedback của khách

        public DateTime CreatedAt { get; set; } = DateTime.UtcNow;

        public DateTime? UpdatedAt { get; set; }

        // Navigation properties
        public virtual Product Product { get; set; } = null!;
        public virtual User User { get; set; } = null!;
        public virtual ProductVariant? ProductVariant { get; set; }
    }
}
