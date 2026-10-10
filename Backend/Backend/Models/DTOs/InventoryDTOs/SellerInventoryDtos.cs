namespace Backend.Models.DTOs.InventoryDTOs
{
    public class SellerInventoryItemDto
    {
        public int VariantId { get; set; }
        public int ProductId { get; set; }
        public string ProductName { get; set; } = string.Empty;
        public string ProductSlug { get; set; } = string.Empty;
        public string PrimaryImage { get; set; } = string.Empty;
        public string Sku { get; set; } = string.Empty;
        public string ColorName { get; set; } = string.Empty;
        public string HexCode { get; set; } = string.Empty;
        public string SizeName { get; set; } = string.Empty;
        public decimal Price { get; set; }
        public int StockQuantity { get; set; }
        public string Status { get; set; } = string.Empty; // "InStock", "LowStock", "OutOfStock"
        public bool IsActive { get; set; }
        public DateTime? UpdatedAt { get; set; }
    }

    public class SellerInventoryStatsDto
    {
        public int TotalVariants { get; set; }
        public int TotalUnitsInStock { get; set; }
        public int LowStockCount { get; set; }
        public int OutOfStockCount { get; set; }
    }

    public class UpdateInventoryStockDto
    {
        public int? StockQuantity { get; set; }
        public decimal? Price { get; set; }
        public bool? IsActive { get; set; }
    }

    public class SellerInventoryPagedResultDto
    {
        public List<SellerInventoryItemDto> Items { get; set; } = new();
        public int TotalCount { get; set; }
        public int PageNumber { get; set; }
        public int PageSize { get; set; }
        public int TotalPages => (int)Math.Ceiling((double)TotalCount / (PageSize > 0 ? PageSize : 10));
    }
}
