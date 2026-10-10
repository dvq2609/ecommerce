using System.ComponentModel.DataAnnotations;
using System.ComponentModel.DataAnnotations.Schema;
using Microsoft.EntityFrameworkCore;

namespace Backend.Models
{
    [Table("Reviews")]
    [Index(nameof(ReviewId), Name = "IX_Reviews_ReviewId", IsUnique = true)]
    [Index(nameof(OrderId), Name = "IX_Reviews_OrderId")]
    [Index(nameof(ProductId), Name = "IX_Reviews_ProductId")]
    [Index(nameof(UserId), Name = "IX_Reviews_UserId")]
    [Index(nameof(SellerId), Name = "IX_Reviews_SellerId")]
    [Index(nameof(ProductVariantId), Name = "IX_Reviews_ProductVariantId")]
    [Index(nameof(OrderId), nameof(ProductId), nameof(UserId), Name = "IX_Reviews_Order_Product_User", IsUnique = true)]
    public class Review
    {
        [Key]
        [DatabaseGenerated(DatabaseGeneratedOption.Identity)]
        public int ReviewId { get; set; }

        [Required]
        [ForeignKey("Order")]
        public int OrderId { get; set; } // Đơn hàng đã giao thành công

        [Required]
        [ForeignKey("Product")]
        public int ProductId { get; set; }

        [Required]
        [ForeignKey("User")]
        public int UserId { get; set; } // Người mua hàng

        [Required]
        [ForeignKey("Seller")]
        public int SellerId { get; set; } // Người bán sở hữu sản phẩm (Multi-vendor Shopee style)

        [ForeignKey("ProductVariant")]
        public int? ProductVariantId { get; set; } // Liên kết variant khách đã mua

        [Required]
        [Range(1, 5)]
        public int Rating { get; set; }

        [Required]
        [MaxLength(2000)]
        public string Comment { get; set; } = string.Empty;

        [MaxLength(2000)]
        public string? ReviewImagesJson { get; set; } // Mảng JSON chứa các URL ảnh feedback (tùy chọn - optional)

        [MaxLength(2000)]
        public string? SellerReply { get; set; } // Phản hồi từ người bán

        public DateTime? SellerRepliedAt { get; set; }

        public DateTime CreatedAt { get; set; } = DateTime.UtcNow;

        public DateTime? UpdatedAt { get; set; }

        // Navigation properties
        public virtual Order Order { get; set; } = null!;
        public virtual Product Product { get; set; } = null!;
        public virtual User User { get; set; } = null!;
        public virtual User Seller { get; set; } = null!;
        public virtual ProductVariant? ProductVariant { get; set; }
    }
}
