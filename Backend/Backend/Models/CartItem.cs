using System.ComponentModel.DataAnnotations;
using System.ComponentModel.DataAnnotations.Schema;
using Microsoft.EntityFrameworkCore;

namespace Backend.Models
{
    [Table("CartItems")]
    [Index(nameof(CartItemId), Name = "IX_CartItems_CartItemId", IsUnique = true)]
    [Index(nameof(CartId), nameof(ProductId), nameof(ProductVariantId), Name = "IX_CartItems_CartId_ProductId_VariantId", IsUnique = true)]
    [Index(nameof(ProductVariantId), Name = "IX_CartItems_ProductVariantId")]
    public class CartItem
    {
        [Key]
        [DatabaseGenerated(DatabaseGeneratedOption.Identity)]
        public int CartItemId { get; set; }

        [Required]
        [ForeignKey("Cart")]
        public int CartId { get; set; }

        [Required]
        [ForeignKey("Product")]
        public int ProductId { get; set; }

        [ForeignKey("ProductVariant")]
        public int? ProductVariantId { get; set; } // Nullable để tương thích ngược nếu sản phẩm không có biến thể

        [Required]
        [Range(1, int.MaxValue)]
        public int Quantity { get; set; } = 1;

        public DateTime CreatedAt { get; set; } = DateTime.UtcNow;

        public DateTime? UpdatedAt { get; set; }

        // Navigation properties
        public virtual Cart Cart { get; set; } = null!;
        public virtual Product Product { get; set; } = null!;
        public virtual ProductVariant? ProductVariant { get; set; }
    }
}
