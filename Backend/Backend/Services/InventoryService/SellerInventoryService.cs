using Backend.Models;
using Backend.Models.DTOs.InventoryDTOs;
using Microsoft.EntityFrameworkCore;

namespace Backend.Services.InventoryService
{
    public class SellerInventoryService : ISellerInventoryService
    {
        private readonly ApplicationDbContext _context;

        public SellerInventoryService(ApplicationDbContext context)
        {
            _context = context;
        }

        public async Task<SellerInventoryPagedResultDto> GetInventoryPagedAsync(
            int sellerId,
            string? search,
            string? stockFilter,
            int page,
            int pageSize)
        {
            if (page < 1) page = 1;
            if (pageSize < 1) pageSize = 15;

            var query = _context.ProductVariants
                .AsNoTracking()
                .Include(v => v.Product)
                    .ThenInclude(p => p.Images)
                .Include(v => v.Color)
                .Include(v => v.Size)
                .Where(v => v.Product.SellerId == sellerId);

            // Tìm kiếm theo tên sản phẩm hoặc mã SKU
            if (!string.IsNullOrWhiteSpace(search))
            {
                var term = search.Trim().ToLower();
                query = query.Where(v => v.Product.ProductName.ToLower().Contains(term) || v.Sku.ToLower().Contains(term));
            }

            // Lọc theo trạng thái tồn kho
            if (!string.IsNullOrWhiteSpace(stockFilter))
            {
                var filter = stockFilter.Trim().ToLower();
                if (filter == "out_of_stock")
                {
                    query = query.Where(v => v.StockQuantity == 0);
                }
                else if (filter == "low_stock")
                {
                    query = query.Where(v => v.StockQuantity > 0 && v.StockQuantity <= 5);
                }
                else if (filter == "in_stock")
                {
                    query = query.Where(v => v.StockQuantity > 5);
                }
            }

            var totalCount = await query.CountAsync();

            var variants = await query
                .OrderBy(v => v.StockQuantity) // Ưu tiên các mặt hàng sắp hết/hết hàng lên trước
                .ThenByDescending(v => v.UpdatedAt)
                .Skip((page - 1) * pageSize)
                .Take(pageSize)
                .ToListAsync();

            var items = variants.Select(v =>
            {
                var primaryImage = v.Product.Images?.FirstOrDefault(i => i.ColorId == v.ColorId)?.ImageUrl
                    ?? v.Product.Images?.FirstOrDefault(i => i.IsPrimary)?.ImageUrl
                    ?? v.Product.Images?.FirstOrDefault()?.ImageUrl
                    ?? string.Empty;

                string status;
                if (v.StockQuantity == 0) status = "OutOfStock";
                else if (v.StockQuantity <= 5) status = "LowStock";
                else status = "InStock";

                return new SellerInventoryItemDto
                {
                    VariantId = v.VariantId,
                    ProductId = v.ProductId,
                    ProductName = v.Product.ProductName,
                    ProductSlug = v.Product.Slug,
                    PrimaryImage = primaryImage,
                    Sku = v.Sku,
                    ColorName = v.Color?.ColorName ?? string.Empty,
                    HexCode = v.Color?.HexCode ?? "#000000",
                    SizeName = v.Size?.SizeName ?? string.Empty,
                    Price = v.Price,
                    StockQuantity = v.StockQuantity,
                    Status = status,
                    IsActive = v.IsActive,
                    UpdatedAt = v.UpdatedAt
                };
            }).ToList();

            return new SellerInventoryPagedResultDto
            {
                Items = items,
                TotalCount = totalCount,
                PageNumber = page,
                PageSize = pageSize
            };
        }

        public async Task<SellerInventoryStatsDto> GetInventoryStatsAsync(int sellerId)
        {
            var variants = await _context.ProductVariants
                .AsNoTracking()
                .Where(v => v.Product.SellerId == sellerId)
                .Select(v => new { v.StockQuantity })
                .ToListAsync();

            var totalVariants = variants.Count;
            var totalUnits = variants.Sum(v => v.StockQuantity);
            var lowStock = variants.Count(v => v.StockQuantity > 0 && v.StockQuantity <= 5);
            var outOfStock = variants.Count(v => v.StockQuantity == 0);

            return new SellerInventoryStatsDto
            {
                TotalVariants = totalVariants,
                TotalUnitsInStock = totalUnits,
                LowStockCount = lowStock,
                OutOfStockCount = outOfStock
            };
        }

        public async Task<(bool Success, string? Error, SellerInventoryItemDto? Data)> UpdateStockAsync(
            int sellerId,
            int variantId,
            UpdateInventoryStockDto dto)
        {
            var variant = await _context.ProductVariants
                .Include(v => v.Product)
                    .ThenInclude(p => p.Images)
                .Include(v => v.Color)
                .Include(v => v.Size)
                .FirstOrDefaultAsync(v => v.VariantId == variantId);

            if (variant == null)
            {
                return (false, "Không tìm thấy biến thể sản phẩm.", null);
            }

            // Kiểm tra phân quyền: Biến thể phải thuộc về Seller đang đăng nhập
            if (variant.Product.SellerId != sellerId)
            {
                return (false, "Bạn không có quyền chỉnh sửa tồn kho của sản phẩm này.", null);
            }

            if (dto.StockQuantity.HasValue)
            {
                if (dto.StockQuantity.Value < 0)
                {
                    return (false, "Số lượng tồn kho không được âm.", null);
                }
                variant.StockQuantity = dto.StockQuantity.Value;
            }

            if (dto.Price.HasValue)
            {
                if (dto.Price.Value <= 0)
                {
                    return (false, "Giá bán sản phẩm phải lớn hơn 0.", null);
                }
                variant.Price = dto.Price.Value;
            }

            if (dto.IsActive.HasValue)
            {
                variant.IsActive = dto.IsActive.Value;
            }

            variant.UpdatedAt = DateTime.UtcNow;

            // Đồng bộ lại tổng tồn kho của sản phẩm cha
            var productId = variant.ProductId;
            await _context.SaveChangesAsync();

            // Tính tổng tồn kho của tất cả biến thể
            var totalProductStock = await _context.ProductVariants
                .Where(v => v.ProductId == productId)
                .SumAsync(v => v.StockQuantity);

            variant.Product.StockQuantity = totalProductStock;
            await _context.SaveChangesAsync();

            var primaryImage = variant.Product.Images?.FirstOrDefault(i => i.ColorId == variant.ColorId)?.ImageUrl
                ?? variant.Product.Images?.FirstOrDefault(i => i.IsPrimary)?.ImageUrl
                ?? variant.Product.Images?.FirstOrDefault()?.ImageUrl
                ?? string.Empty;

            string status;
            if (variant.StockQuantity == 0) status = "OutOfStock";
            else if (variant.StockQuantity <= 5) status = "LowStock";
            else status = "InStock";

            var resultDto = new SellerInventoryItemDto
            {
                VariantId = variant.VariantId,
                ProductId = variant.ProductId,
                ProductName = variant.Product.ProductName,
                ProductSlug = variant.Product.Slug,
                PrimaryImage = primaryImage,
                Sku = variant.Sku,
                ColorName = variant.Color?.ColorName ?? string.Empty,
                HexCode = variant.Color?.HexCode ?? "#000000",
                SizeName = variant.Size?.SizeName ?? string.Empty,
                Price = variant.Price,
                StockQuantity = variant.StockQuantity,
                Status = status,
                IsActive = variant.IsActive,
                UpdatedAt = variant.UpdatedAt
            };

            return (true, null, resultDto);
        }
    }
}
