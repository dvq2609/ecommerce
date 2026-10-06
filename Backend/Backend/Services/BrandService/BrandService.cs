using Backend.Models;
using Backend.Models.DTOs;
using Backend.Repositories.BrandRepo;

namespace Backend.Services.BrandService
{
    public class BrandService : IBrandService
    {
        private readonly IBrandRepository _brandRepo;

        public BrandService(IBrandRepository brandRepo)
        {
            _brandRepo = brandRepo;
        }

        public async Task<List<BrandResponseDto>> GetAllAsync()
        {
            var brands = await _brandRepo.GetAllAsync();
            return brands.Select(MapToDto).ToList();
        }

        public async Task<BrandResponseDto?> GetByIdAsync(int id)
        {
            var brand = await _brandRepo.GetByIdAsync(id);
            return brand == null ? null : MapToDto(brand);
        }

        public async Task<BrandResponseDto?> GetBySlugAsync(string slug)
        {
            var brand = await _brandRepo.GetBySlugAsync(slug);
            return brand == null ? null : MapToDto(brand);
        }

        public async Task<(bool Success, string? Error, BrandResponseDto? Data)> CreateAsync(CreateBrandDto dto)
        {
            var slug = string.IsNullOrWhiteSpace(dto.Slug)
                ? GenerateSlug(dto.BrandName)
                : dto.Slug.Trim().ToLower();

            if (await _brandRepo.SlugExistsAsync(slug))
                return (false, $"Slug '{slug}' đã tồn tại.", null);

            var brand = new Brand
            {
                BrandName        = dto.BrandName.Trim(),
                BrandDescription = dto.BrandDescription?.Trim() ?? string.Empty,
                Slug             = slug
            };

            var created = await _brandRepo.CreateAsync(brand);
            return (true, null, MapToDto(created));
        }

        public async Task<(bool Success, string? Error, BrandResponseDto? Data)> UpdateAsync(int id, UpdateBrandDto dto)
        {
            var brand = await _brandRepo.GetByIdAsync(id);
            if (brand == null)
                return (false, "Không tìm thấy thương hiệu.", null);

            if (!string.IsNullOrWhiteSpace(dto.BrandName))
                brand.BrandName = dto.BrandName.Trim();

            if (dto.BrandDescription != null)
                brand.BrandDescription = dto.BrandDescription.Trim();

            if (!string.IsNullOrWhiteSpace(dto.Slug))
            {
                var newSlug = dto.Slug.Trim().ToLower();
                if (await _brandRepo.SlugExistsAsync(newSlug, id))
                    return (false, $"Slug '{newSlug}' đã tồn tại.", null);
                brand.Slug = newSlug;
            }

            var updated = await _brandRepo.UpdateAsync(brand);
            return (true, null, MapToDto(updated));
        }

        public async Task<(bool Success, string? Error)> DeleteAsync(int id)
        {
            var brand = await _brandRepo.GetByIdAsync(id);
            if (brand == null)
                return (false, "Không tìm thấy thương hiệu.");

            if (await _brandRepo.HasProductsAsync(id))
                return (false, "Không thể xóa thương hiệu đang có sản phẩm.");

            await _brandRepo.DeleteAsync(id);
            return (true, null);
        }

        // ─── Helpers ─────────────────────────────────────────────────────────────

        private static BrandResponseDto MapToDto(Brand b) => new()
        {
            BrandId          = b.BrandId,
            BrandName        = b.BrandName,
            BrandDescription = b.BrandDescription,
            Slug             = b.Slug,
            ProductCount     = b.Products?.Count ?? 0
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
