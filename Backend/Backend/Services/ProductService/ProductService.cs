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

        public async Task<ProductDetailResponseDto?> GetDetailByIdAsync(int id)
        {
            var product = await _productRepo.GetDetailByIdAsync(id);
            return product == null ? null : MapToDetailDto(product);
        }

        public async Task<ProductDetailResponseDto?> GetDetailBySlugAsync(string slug)
        {
            var product = await _productRepo.GetDetailBySlugAsync(slug);
            return product == null ? null : MapToDetailDto(product);
        }

        public async Task<(bool Success, string? Error, ProductResponseDto? Data)> CreateAsync(CreateProductDto dto)
        {
            var slug = string.IsNullOrWhiteSpace(dto.Slug)
                ? GenerateSlug(dto.ProductName)
                : dto.Slug.Trim().ToLower();

            if (await _productRepo.SlugExistsAsync(slug))
                return (false, $"Slug '{slug}' đã tồn tại.", null);

            // Tự động tính tổng tồn kho từ các biến thể nếu có
            var totalStock = dto.Variants.Count > 0 
                ? dto.Variants.Sum(v => v.StockQuantity) 
                : dto.StockQuantity;

            var product = new Product
            {
                CategoryId         = dto.CategoryId,
                BrandId            = dto.BrandId,
                ProductName        = dto.ProductName.Trim(),
                ProductDescription = dto.ProductDescription?.Trim() ?? string.Empty,
                Slug               = slug,
                Price              = dto.Price,
                StockQuantity      = totalStock,
                IsActive           = dto.IsActive,
                ImportDate         = dto.ImportDate ?? DateTime.UtcNow,
                Material           = dto.Material?.Trim() ?? string.Empty,
                Origin             = dto.Origin?.Trim() ?? string.Empty,
                Style              = dto.Style?.Trim() ?? string.Empty,
                Fit                = dto.Fit?.Trim() ?? string.Empty,
                CareInstructions   = dto.CareInstructions?.Trim() ?? string.Empty,
                AverageRating      = 5.0m,
                RatingCount        = 0
            };

            // Chuẩn bị biến thể
            var variants = dto.Variants.Select(v => new ProductVariant
            {
                ColorId       = v.ColorId,
                SizeId        = v.SizeId,
                Price         = v.Price > 0 ? v.Price : dto.Price,
                StockQuantity = v.StockQuantity,
                IsActive      = v.IsActive,
                Sku           = !string.IsNullOrWhiteSpace(v.Sku) 
                    ? v.Sku.Trim() 
                    : $"{slug}-{v.ColorId}-{v.SizeId}"
            }).ToList();

            // Chuẩn bị hình ảnh
            var images = dto.Images.Select((img, idx) => new ProductImage
            {
                ImageUrl     = img.ImageUrl.Trim(),
                ColorId      = img.ColorId,
                IsPrimary    = img.IsPrimary || idx == 0,
                DisplayOrder = img.DisplayOrder > 0 ? img.DisplayOrder : idx
            }).ToList();

            if (images.Count > 0 && !images.Any(i => i.IsPrimary))
            {
                images[0].IsPrimary = true;
            }

            var created = await _productRepo.CreateWithVariantsAsync(product, variants, images);
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
            if (dto.Material != null)     product.Material           = dto.Material.Trim();
            if (dto.Origin != null)       product.Origin             = dto.Origin.Trim();
            if (dto.Style != null)        product.Style              = dto.Style.Trim();
            if (dto.Fit != null)          product.Fit                = dto.Fit.Trim();
            if (dto.CareInstructions != null) product.CareInstructions = dto.CareInstructions.Trim();

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

        public async Task<List<ProductVariantDto>> GetVariantsByProductIdAsync(int productId)
        {
            var variants = await _productRepo.GetVariantsByProductIdAsync(productId);
            return variants.Select(MapVariantToDto).ToList();
        }

        public async Task<(bool Success, string? Error, ProductVariantDto? Data)> UpdateVariantAsync(int variantId, UpdateProductVariantDto dto)
        {
            var variant = await _productRepo.GetVariantByIdAsync(variantId);
            if (variant == null)
                return (false, "Không tìm thấy biến thể.", null);

            if (dto.Price.HasValue) variant.Price = dto.Price.Value;
            if (dto.StockQuantity.HasValue) variant.StockQuantity = dto.StockQuantity.Value;
            if (dto.IsActive.HasValue) variant.IsActive = dto.IsActive.Value;
            if (!string.IsNullOrWhiteSpace(dto.Sku)) variant.Sku = dto.Sku.Trim();
            variant.UpdatedAt = DateTime.UtcNow;

            await _productRepo.UpdateAsync(variant.Product);
            return (true, null, MapVariantToDto(variant));
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
                ColorId      = img.ColorId,
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

        private static ProductVariantDto MapVariantToDto(ProductVariant v) => new()
        {
            VariantId       = v.VariantId,
            ProductId       = v.ProductId,
            ColorId         = v.ColorId,
            ColorName       = v.Color?.ColorName ?? string.Empty,
            HexCode         = v.Color?.HexCode ?? string.Empty,
            SizeId          = v.SizeId,
            SizeName        = v.Size?.SizeName ?? string.Empty,
            SizeDescription = v.Size?.Description,
            Sku             = v.Sku,
            Price           = v.Price,
            StockQuantity   = v.StockQuantity,
            IsActive        = v.IsActive
        };

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
            Material           = p.Material,
            Origin             = p.Origin,
            Style              = p.Style,
            Fit                = p.Fit,
            CareInstructions   = p.CareInstructions,
            AverageRating      = p.AverageRating,
            RatingCount        = p.RatingCount,
            Images             = p.Images?.OrderBy(i => i.DisplayOrder).Select(i => new ProductImageResponseDto
            {
                ProductImageId = i.ProductImageId,
                ImageUrl       = i.ImageUrl,
                ColorId        = i.ColorId,
                ColorName      = i.Color?.ColorName,
                IsPrimary      = i.IsPrimary,
                DisplayOrder   = i.DisplayOrder
            }).ToList() ?? new(),
            Variants           = p.Variants?.Select(MapVariantToDto).ToList() ?? new()
        };

        private static ProductDetailResponseDto MapToDetailDto(Product p)
        {
            var sortedImages = p.Images?.OrderBy(i => i.DisplayOrder).ToList() ?? new List<ProductImage>();

            // Gom nhóm Colors duy nhất từ Variants
            var colorMap = new Dictionary<int, ProductDetailColorDto>();
            foreach (var v in p.Variants)
            {
                if (v.Color != null && !colorMap.ContainsKey(v.ColorId))
                {
                    // Tìm index ảnh đầu tiên trong mảng ảnh có ColorId tương ứng
                    var matchedImgIdx = sortedImages.FindIndex(img => img.ColorId == v.ColorId);

                    colorMap[v.ColorId] = new ProductDetailColorDto
                    {
                        Id         = v.ColorId,
                        Name       = v.Color.ColorName,
                        Hex        = v.Color.HexCode,
                        ImageIndex = matchedImgIdx >= 0 ? matchedImgIdx : null
                    };
                }
            }

            // Gom nhóm Sizes duy nhất từ Variants
            var sizeMap = new Dictionary<int, ProductDetailSizeDto>();
            foreach (var v in p.Variants.OrderBy(v => v.Size?.DisplayOrder ?? 0))
            {
                if (v.Size != null)
                {
                    if (!sizeMap.TryGetValue(v.SizeId, out var existing))
                    {
                        sizeMap[v.SizeId] = new ProductDetailSizeDto
                        {
                            Id          = v.SizeId,
                            Name        = v.Size.SizeName,
                            Description = v.Size.Description,
                            InStock     = v.StockQuantity > 0
                        };
                    }
                    else if (v.StockQuantity > 0)
                    {
                        existing.InStock = true; // Chỉ cần 1 màu còn size này thì InStock = true
                    }
                }
            }

            // Danh sách Specs
            var specs = new List<ProductSpecItemDto>();
            if (!string.IsNullOrWhiteSpace(p.Material))
                specs.Add(new ProductSpecItemDto { Label = "Chất liệu", Value = p.Material });
            if (!string.IsNullOrWhiteSpace(p.Origin))
                specs.Add(new ProductSpecItemDto { Label = "Xuất xứ", Value = p.Origin });
            if (!string.IsNullOrWhiteSpace(p.Style))
                specs.Add(new ProductSpecItemDto { Label = "Phong cách", Value = p.Style });
            if (!string.IsNullOrWhiteSpace(p.Fit))
                specs.Add(new ProductSpecItemDto { Label = "Kiểu dáng", Value = p.Fit });
            if (!string.IsNullOrWhiteSpace(p.CareInstructions))
                specs.Add(new ProductSpecItemDto { Label = "Chăm sóc vải", Value = p.CareInstructions });

            // Danh sách Reviews
            var reviews = p.Reviews?.OrderByDescending(r => r.CreatedAt).Select(r => new ReviewResponseDto
            {
                Id                 = r.ReviewId,
                UserName           = !string.IsNullOrWhiteSpace(r.User?.FullName) ? r.User.FullName : (r.User?.Email ?? "Khách hàng"),
                AvatarLetter       = (!string.IsNullOrWhiteSpace(r.User?.FullName) ? r.User.FullName : (r.User?.Email ?? "K")).Substring(0, 1).ToUpper(),
                Rating             = r.Rating,
                TimeAgo            = CalculateTimeAgo(r.CreatedAt),
                VariantInfo        = r.ProductVariant != null 
                    ? $"{r.ProductVariant.Color?.ColorName} • Size {r.ProductVariant.Size?.SizeName}" 
                    : "Mặc định",
                Comment            = r.Comment,
                IsVerifiedPurchase = true,
                CreatedAt          = r.CreatedAt
            }).ToList() ?? new();

            return new ProductDetailResponseDto
            {
                ProductId          = p.ProductId,
                Sku                = p.Variants?.FirstOrDefault()?.Sku ?? $"VIBE-{p.ProductId:D4}",
                Title              = p.ProductName,
                Slug               = p.Slug,
                CategoryId         = p.CategoryId,
                CategoryName       = p.Category?.CategoryName ?? string.Empty,
                BrandId            = p.BrandId,
                BrandName          = p.Brand?.BrandName ?? string.Empty,
                Price              = p.Price,
                StockQuantity      = p.Variants != null && p.Variants.Count > 0 ? p.Variants.Sum(v => v.StockQuantity) : p.StockQuantity,
                AverageRating      = p.AverageRating,
                RatingCount        = p.RatingCount,
                DescriptionText    = p.ProductDescription,
                Images             = sortedImages.Select(i => new ProductImageResponseDto
                {
                    ProductImageId = i.ProductImageId,
                    ImageUrl       = i.ImageUrl,
                    ColorId        = i.ColorId,
                    ColorName      = i.Color?.ColorName,
                    IsPrimary      = i.IsPrimary,
                    DisplayOrder   = i.DisplayOrder
                }).ToList(),
                Colors             = colorMap.Values.ToList(),
                Sizes              = sizeMap.Values.ToList(),
                Variants           = p.Variants?.Select(MapVariantToDto).ToList() ?? new(),
                Specs              = specs,
                Reviews            = reviews
            };
        }

        private static string CalculateTimeAgo(DateTime dt)
        {
            var span = DateTime.UtcNow - dt;
            if (span.TotalDays > 30) return dt.ToString("dd/MM/yyyy");
            if (span.TotalDays >= 1) return $"{(int)span.TotalDays} ngày trước";
            if (span.TotalHours >= 1) return $"{(int)span.TotalHours} giờ trước";
            return "Vừa xong";
        }

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
