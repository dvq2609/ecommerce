using System.ComponentModel.DataAnnotations;

namespace Backend.Models.DTOs
{
    public class ProductVariantDto
    {
        public int VariantId { get; set; }
        public int ProductId { get; set; }
        public int ColorId { get; set; }
        public string ColorName { get; set; } = string.Empty;
        public string HexCode { get; set; } = string.Empty;
        public int SizeId { get; set; }
        public string SizeName { get; set; } = string.Empty;
        public string? SizeDescription { get; set; }
        public string Sku { get; set; } = string.Empty;
        public decimal Price { get; set; }
        public int StockQuantity { get; set; }
        public bool IsActive { get; set; }
    }

    public class CreateProductVariantDto
    {
        [Required(ErrorMessage = "ColorId là bắt buộc.")]
        public int ColorId { get; set; }

        [Required(ErrorMessage = "SizeId là bắt buộc.")]
        public int SizeId { get; set; }

        /// <summary>
        /// Mã SKU riêng của biến thể. Nếu để trống hệ thống sẽ tự sinh.
        /// </summary>
        [MaxLength(100)]
        public string? Sku { get; set; }

        [Required]
        [Range(0.01, double.MaxValue, ErrorMessage = "Giá của biến thể phải lớn hơn 0.")]
        public decimal Price { get; set; }

        [Required]
        [Range(0, int.MaxValue, ErrorMessage = "Tồn kho không được âm.")]
        public int StockQuantity { get; set; } = 0;

        public bool IsActive { get; set; } = true;
    }

    public class UpdateProductVariantDto
    {
        [MaxLength(100)]
        public string? Sku { get; set; }

        [Range(0.01, double.MaxValue)]
        public decimal? Price { get; set; }

        [Range(0, int.MaxValue)]
        public int? StockQuantity { get; set; }

        public bool? IsActive { get; set; }
    }
}
