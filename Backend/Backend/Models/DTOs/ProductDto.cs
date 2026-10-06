using System.ComponentModel.DataAnnotations;

namespace Backend.Models.DTOs
{
    // ===================== CATEGORY DTOs =====================

    public class CreateCategoryDto
    {
        [Required(ErrorMessage = "Tên danh mục là bắt buộc.")]
        [MaxLength(100)]
        public string CategoryName { get; set; } = string.Empty;

        [MaxLength(10000)]
        public string CategoryDescription { get; set; } = string.Empty;

        /// <summary>
        /// Nếu để trống, hệ thống sẽ tự sinh từ CategoryName.
        /// </summary>
        public string? Slug { get; set; }
    }

    public class UpdateCategoryDto
    {
        [MaxLength(100)]
        public string? CategoryName { get; set; }

        [MaxLength(10000)]
        public string? CategoryDescription { get; set; }

        public string? Slug { get; set; }
    }

    public class CategoryResponseDto
    {
        public int CategoryId { get; set; }
        public string CategoryName { get; set; } = string.Empty;
        public string CategoryDescription { get; set; } = string.Empty;
        public string Slug { get; set; } = string.Empty;
        public int ProductCount { get; set; }
    }

    // ===================== BRAND DTOs =====================

    public class CreateBrandDto
    {
        [Required(ErrorMessage = "Tên thương hiệu là bắt buộc.")]
        [MaxLength(100)]
        public string BrandName { get; set; } = string.Empty;

        [MaxLength(10000)]
        public string BrandDescription { get; set; } = string.Empty;

        public string? Slug { get; set; }
    }

    public class UpdateBrandDto
    {
        [MaxLength(100)]
        public string? BrandName { get; set; }

        [MaxLength(10000)]
        public string? BrandDescription { get; set; }

        public string? Slug { get; set; }
    }

    public class BrandResponseDto
    {
        public int BrandId { get; set; }
        public string BrandName { get; set; } = string.Empty;
        public string BrandDescription { get; set; } = string.Empty;
        public string Slug { get; set; } = string.Empty;
        public int ProductCount { get; set; }
    }

    // ===================== PRODUCT DTOs =====================

    public class CreateProductDto
    {
        [Required(ErrorMessage = "CategoryId là bắt buộc.")]
        public int CategoryId { get; set; }

        [Required(ErrorMessage = "BrandId là bắt buộc.")]
        public int BrandId { get; set; }

        [Required(ErrorMessage = "Tên sản phẩm là bắt buộc.")]
        [MaxLength(100)]
        public string ProductName { get; set; } = string.Empty;

        [MaxLength(10000)]
        public string ProductDescription { get; set; } = string.Empty;

        public string? Slug { get; set; }

        [Required]
        [Range(0.01, double.MaxValue, ErrorMessage = "Giá phải lớn hơn 0.")]
        public decimal Price { get; set; }

        [Required]
        [Range(0, int.MaxValue, ErrorMessage = "Số lượng tồn kho không được âm.")]
        public int StockQuantity { get; set; }

        public bool IsActive { get; set; } = true;

        public DateTime? ImportDate { get; set; }

        /// <summary>
        /// Danh sách URL ảnh sản phẩm (upload trước, truyền URL vào đây).
        /// </summary>
        public List<ProductImageInputDto> Images { get; set; } = new();
    }

    public class UpdateProductDto
    {
        public int? CategoryId { get; set; }
        public int? BrandId { get; set; }

        [MaxLength(100)]
        public string? ProductName { get; set; }

        [MaxLength(10000)]
        public string? ProductDescription { get; set; }

        public string? Slug { get; set; }

        [Range(0.01, double.MaxValue)]
        public decimal? Price { get; set; }

        [Range(0, int.MaxValue)]
        public int? StockQuantity { get; set; }

        public bool? IsActive { get; set; }

        public DateTime? ImportDate { get; set; }
    }

    public class ProductImageInputDto
    {
        [Required]
        [MaxLength(500)]
        public string ImageUrl { get; set; } = string.Empty;

        public bool IsPrimary { get; set; } = false;

        public int DisplayOrder { get; set; } = 0;
    }

    public class ProductImageResponseDto
    {
        public int ProductImageId { get; set; }
        public string ImageUrl { get; set; } = string.Empty;
        public bool IsPrimary { get; set; }
        public int DisplayOrder { get; set; }
    }

    public class ProductResponseDto
    {
        public int ProductId { get; set; }
        public int CategoryId { get; set; }
        public string CategoryName { get; set; } = string.Empty;
        public int BrandId { get; set; }
        public string BrandName { get; set; } = string.Empty;
        public string ProductName { get; set; } = string.Empty;
        public string ProductDescription { get; set; } = string.Empty;
        public string Slug { get; set; } = string.Empty;
        public decimal Price { get; set; }
        public int StockQuantity { get; set; }
        public bool IsActive { get; set; }
        public DateTime ImportDate { get; set; }
        public List<ProductImageResponseDto> Images { get; set; } = new();
    }

    // ===================== QUERY / FILTER DTOs =====================

    public class ProductQueryDto
    {
        public int Page { get; set; } = 1;
        public int PageSize { get; set; } = 12;

        /// <summary>Tìm kiếm theo tên sản phẩm.</summary>
        public string? Search { get; set; }

        public int? CategoryId { get; set; }
        public int? BrandId { get; set; }

        public decimal? MinPrice { get; set; }
        public decimal? MaxPrice { get; set; }

        /// <summary>asc | desc</summary>
        public string? SortByPrice { get; set; }

        /// <summary>true = chỉ hàng còn hàng</summary>
        public bool? InStock { get; set; }

        public bool? IsActive { get; set; }
    }

    public class PagedResult<T>
    {
        public List<T> Items { get; set; } = new();
        public int TotalCount { get; set; }
        public int Page { get; set; }
        public int PageSize { get; set; }
        public int TotalPages => (int)Math.Ceiling((double)TotalCount / PageSize);
        public bool HasNextPage => Page < TotalPages;
        public bool HasPreviousPage => Page > 1;
    }
}
