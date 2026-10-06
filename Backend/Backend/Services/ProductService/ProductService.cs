using Backend.Models;
using Backend.Models.DTOs;
using Backend.Repositories.ProductRepo;

namespace Backend.Services.ProductService
{
    public class ProductService : IProductService
    {
        private readonly IProductRepository _productRepo;

        public ProductService(IProductRepository productRepo)
        {
            _productRepo = productRepo;
        }

        public async Task<PagedResult<ProductResponseDto>> GetPagedAsync(ProductQueryDto query)
        {
            // Validate pagination
            query.Page     = Math.Max(1, query.Page);
            query.PageSize = Math.Clamp(query.PageSize, 1, 100);

            var (items, totalCount) = await _productRepo.GetPagedAsync(query);

            return new PagedResult<ProductResponseDto>
            {
                Items      = items.Select(MapToDto).ToList(),
                TotalCount = totalCount,
                Page       = query.Page,
                PageSize   = query.PageSize
            };
        }

        public async Task<ProductResponseDto?> GetByIdAsync(int id)
        {
            var product = await _productRepo.GetByIdAsync(id);
            return product == null ? null : MapToDto(product);
        }

        public async Task<ProductResponseDto?> GetBySlugAsync(string slug)
        {
            var product = await _productRepo.GetBySlugAsync(slug);
            return product == null ? null : MapToDto(product);
        }

        public async Task<(bool Success, string? Error, ProductResponseDto? Data)> CreateAsync(CreateProductDto dto)
        {
            var slug = string.IsNullOrWhiteSpace(dto.Slug)
                ? GenerateSlug(dto.ProductName)
                : dto.Slug.Trim().ToLower();

            if (await _productRepo.SlugExistsAsync(slug))
                return (false, $"Slug '{slug}' đã tồn tại.", null);

            var product = new Product
            {
                CategoryId         = dto.CategoryId,
                BrandId            = dto.BrandId,
                ProductName        = dto.ProductName.Trim(),
                ProductDescription = dto.ProductDescription?.Trim() ?? string.Empty,
                Slug               = slug,
                Price              = dto.Price,
                StockQuantity      = dto.StockQuantity,
                IsActive           = dto.IsActive,
                ImportDate         = dto.ImportDate ?? DateTime.UtcNow
            };

            var created = await _productRepo.CreateAsync(product);

            // Add images if provided
            if (dto.Images.Count > 0)
            {
                var images = dto.Images.Select((img, idx) => new ProductImage
                {
                    ProductId    = created.ProductId,
                    ImageUrl     = img.ImageUrl.Trim(),
                    IsPrimary    = img.IsPrimary || idx == 0, // first is primary if none flagged
                    DisplayOrder = img.DisplayOrder > 0 ? img.DisplayOrder : idx
                }).ToList();

                // Ensure only 1 primary
                var hasPrimary = images.Any(i => i.IsPrimary);
                if (!hasPrimary) images[0].IsPrimary = true;
                if (images.Count(i => i.IsPrimary) > 1)
                {
                    // Keep only first primary
                    var firstPrimary = true;
                    foreach (var img in images)
                    {
                        if (img.IsPrimary && firstPrimary) { firstPrimary = false; }
                        else { img.IsPrimary = false; }
                    }
                }

                await _productRepo.AddImagesAsync(images);
                created.Images = images;
            }

            return (true, null, MapToDto(created));
        }

        public async Task<(bool Success, string? Error, ProductResponseDto? Data)> UpdateAsync(int id, UpdateProductDto dto)
        {
            var product = await _productRepo.GetByIdAsync(id);
            if (product == null)
                return (false, "Không tìm thấy sản phẩm.", null);

            if (dto.CategoryId.HasValue)  product.CategoryId         = dto.CategoryId.Value;
            if (dto.BrandId.HasValue)     product.BrandId            = dto.BrandId.Value;
            if (dto.ProductName   != null) product.ProductName        = dto.ProductName.Trim();
            if (dto.ProductDescription != null) product.ProductDescription = dto.ProductDescription.Trim();
            if (dto.Price.HasValue)       product.Price              = dto.Price.Value;
            if (dto.StockQuantity.HasValue) product.StockQuantity    = dto.StockQuantity.Value;
            if (dto.IsActive.HasValue)    product.IsActive           = dto.IsActive.Value;
            if (dto.ImportDate.HasValue)  product.ImportDate         = dto.ImportDate.Value;

            if (!string.IsNullOrWhiteSpace(dto.Slug))
            {
                var newSlug = dto.Slug.Trim().ToLower();
                if (await _productRepo.SlugExistsAsync(newSlug, id))
                    return (false, $"Slug '{newSlug}' đã tồn tại.", null);
                product.Slug = newSlug;
            }

            var updated = await _productRepo.UpdateAsync(product);
            return (true, null, MapToDto(updated));
        }

        public async Task<(bool Success, string? Error)> DeleteAsync(int id)
        {
            var exists = await _productRepo.GetByIdAsync(id);
            if (exists == null)
                return (false, "Không tìm thấy sản phẩm.");

            await _productRepo.DeleteAsync(id);
            return (true, null);
        }

        public async Task<(bool Success, string? Error)> AddImagesAsync(int productId, List<ProductImageInputDto> images)
        {
            var product = await _productRepo.GetByIdAsync(productId);
            if (product == null)
                return (false, "Không tìm thấy sản phẩm.");

            var productImages = images.Select((img, idx) => new ProductImage
            {
                ProductId    = productId,
                ImageUrl     = img.ImageUrl.Trim(),
                IsPrimary    = img.IsPrimary,
                DisplayOrder = img.DisplayOrder > 0 ? img.DisplayOrder : idx
            }).ToList();

            await _productRepo.AddImagesAsync(productImages);
            return (true, null);
        }

        public async Task<(bool Success, string? Error)> DeleteImageAsync(int productId, int imageId)
        {
            var product = await _productRepo.GetByIdAsync(productId);
            if (product == null)
                return (false, "Không tìm thấy sản phẩm.");

            var deleted = await _productRepo.DeleteImageAsync(imageId);
            return deleted
                ? (true, null)
                : (false, "Không tìm thấy ảnh.");
        }

        public async Task<(bool Success, string? Error)> SetPrimaryImageAsync(int productId, int imageId)
        {
            var product = await _productRepo.GetByIdAsync(productId);
            if (product == null)
                return (false, "Không tìm thấy sản phẩm.");

            var imageExists = product.Images.Any(i => i.ProductImageId == imageId);
            if (!imageExists)
                return (false, "Ảnh không thuộc sản phẩm này.");

            await _productRepo.SetPrimaryImageAsync(productId, imageId);
            return (true, null);
        }

        // ─── Helpers ─────────────────────────────────────────────────────────────

        private static ProductResponseDto MapToDto(Product p) => new()
        {
            ProductId          = p.ProductId,
            CategoryId         = p.CategoryId,
            CategoryName       = p.Category?.CategoryName ?? string.Empty,
            BrandId            = p.BrandId,
            BrandName          = p.Brand?.BrandName ?? string.Empty,
            ProductName        = p.ProductName,
            ProductDescription = p.ProductDescription,
            Slug               = p.Slug,
            Price              = p.Price,
            StockQuantity      = p.StockQuantity,
            IsActive           = p.IsActive,
            ImportDate         = p.ImportDate,
            Images             = p.Images?.OrderBy(i => i.DisplayOrder).Select(i => new ProductImageResponseDto
            {
                ProductImageId = i.ProductImageId,
                ImageUrl       = i.ImageUrl,
                IsPrimary      = i.IsPrimary,
                DisplayOrder   = i.DisplayOrder
            }).ToList() ?? new()
        };

        private static string GenerateSlug(string input)
        {
            return input.Trim().ToLower()
                .Replace(" ", "-")
                .Replace("đ", "d")
                .Replace("à", "a").Replace("á", "a").Replace("ả", "a").Replace("ã", "a").Replace("ạ", "a")
                .Replace("ă", "a").Replace("ắ", "a").Replace("ặ", "a").Replace("ằ", "a").Replace("ẵ", "a").Replace("ẳ", "a")
                .Replace("â", "a").Replace("ấ", "a").Replace("ầ", "a").Replace("ẩ", "a").Replace("ẫ", "a").Replace("ậ", "a")
                .Replace("è", "e").Replace("é", "e").Replace("ẻ", "e").Replace("ẽ", "e").Replace("ẹ", "e")
                .Replace("ê", "e").Replace("ế", "e").Replace("ề", "e").Replace("ể", "e").Replace("ễ", "e").Replace("ệ", "e")
                .Replace("ì", "i").Replace("í", "i").Replace("ỉ", "i").Replace("ĩ", "i").Replace("ị", "i")
                .Replace("ò", "o").Replace("ó", "o").Replace("ỏ", "o").Replace("õ", "o").Replace("ọ", "o")
                .Replace("ô", "o").Replace("ố", "o").Replace("ồ", "o").Replace("ổ", "o").Replace("ỗ", "o").Replace("ộ", "o")
                .Replace("ơ", "o").Replace("ớ", "o").Replace("ờ", "o").Replace("ở", "o").Replace("ỡ", "o").Replace("ợ", "o")
                .Replace("ù", "u").Replace("ú", "u").Replace("ủ", "u").Replace("ũ", "u").Replace("ụ", "u")
                .Replace("ư", "u").Replace("ứ", "u").Replace("ừ", "u").Replace("ử", "u").Replace("ữ", "u").Replace("ự", "u")
                .Replace("ỳ", "y").Replace("ý", "y").Replace("ỷ", "y").Replace("ỹ", "y").Replace("ỵ", "y");
        }
    }
}
