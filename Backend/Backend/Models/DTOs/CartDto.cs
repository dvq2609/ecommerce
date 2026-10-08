using System.ComponentModel.DataAnnotations;

namespace Backend.Models.DTOs
{
    public class AddToCartRequestDto
    {
        [Required(ErrorMessage = "ProductId là bắt buộc.")]
        public int ProductId { get; set; }

        public int? ProductVariantId { get; set; }

        [Range(1, 100, ErrorMessage = "Số lượng phải từ 1 đến 100.")]
        public int Quantity { get; set; } = 1;
    }

    public class UpdateCartItemRequestDto
    {
        [Range(1, 100, ErrorMessage = "Số lượng phải từ 1 đến 100.")]
        public int Quantity { get; set; }
    }

    public class CartItemResponseDto
    {
        public int CartItemId { get; set; }
        public int ProductId { get; set; }
        public string ProductName { get; set; } = string.Empty;
        public string ProductSlug { get; set; } = string.Empty;
        public string? ProductImage { get; set; }
        public int SellerId { get; set; }
        public string SellerName { get; set; } = string.Empty;

        // Thông tin biến thể (nếu có)
        public int? ProductVariantId { get; set; }
        public int? ColorId { get; set; }
        public string? ColorName { get; set; }
        public string? HexCode { get; set; }
        public int? SizeId { get; set; }
        public string? SizeName { get; set; }
        public string? Sku { get; set; }

        // Giá & Số lượng
        public decimal UnitPrice { get; set; }
        public int Quantity { get; set; }
        public decimal TotalPrice => UnitPrice * Quantity;
        public int StockQuantity { get; set; }
    }

    public class CartResponseDto
    {
        public int CartId { get; set; }
        public int UserId { get; set; }
        public List<CartItemResponseDto> Items { get; set; } = new();
        public int TotalItems => Items.Sum(i => i.Quantity);
        public decimal TotalAmount => Items.Sum(i => i.TotalPrice);
    }
}
