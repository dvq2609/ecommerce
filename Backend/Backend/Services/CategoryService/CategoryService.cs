using Backend.Models;
using Backend.Models.DTOs;
using Backend.Repositories.CategoryRepo;

namespace Backend.Services.CategoryService
{
    public class CategoryService : ICategoryService
    {
        private readonly ICategoryRepository _categoryRepo;

        public CategoryService(ICategoryRepository categoryRepo)
        {
            _categoryRepo = categoryRepo;
        }

        public async Task<List<CategoryResponseDto>> GetAllAsync()
        {
            var categories = await _categoryRepo.GetAllAsync();
            return categories.Select(MapToDto).ToList();
        }

        public async Task<CategoryResponseDto?> GetByIdAsync(int id)
        {
            var category = await _categoryRepo.GetByIdAsync(id);
            return category == null ? null : MapToDto(category);
        }

        public async Task<CategoryResponseDto?> GetBySlugAsync(string slug)
        {
            var category = await _categoryRepo.GetBySlugAsync(slug);
            return category == null ? null : MapToDto(category);
        }

        public async Task<(bool Success, string? Error, CategoryResponseDto? Data)> CreateAsync(CreateCategoryDto dto)
        {
            var slug = string.IsNullOrWhiteSpace(dto.Slug)
                ? GenerateSlug(dto.CategoryName)
                : dto.Slug.Trim().ToLower();

            if (await _categoryRepo.SlugExistsAsync(slug))
                return (false, $"Slug '{slug}' đã tồn tại. Vui lòng chọn slug khác.", null);

            var category = new Category
            {
                CategoryName        = dto.CategoryName.Trim(),
                CategoryDescription = dto.CategoryDescription?.Trim() ?? string.Empty,
                Slug                = slug
            };

            var created = await _categoryRepo.CreateAsync(category);
            return (true, null, MapToDto(created));
        }

        public async Task<(bool Success, string? Error, CategoryResponseDto? Data)> UpdateAsync(int id, UpdateCategoryDto dto)
        {
            var category = await _categoryRepo.GetByIdAsync(id);
            if (category == null)
                return (false, "Không tìm thấy danh mục.", null);

            if (!string.IsNullOrWhiteSpace(dto.CategoryName))
                category.CategoryName = dto.CategoryName.Trim();

            if (dto.CategoryDescription != null)
                category.CategoryDescription = dto.CategoryDescription.Trim();

            if (!string.IsNullOrWhiteSpace(dto.Slug))
            {
                var newSlug = dto.Slug.Trim().ToLower();
                if (await _categoryRepo.SlugExistsAsync(newSlug, id))
                    return (false, $"Slug '{newSlug}' đã tồn tại.", null);
                category.Slug = newSlug;
            }

            var updated = await _categoryRepo.UpdateAsync(category);
            return (true, null, MapToDto(updated));
        }

        public async Task<(bool Success, string? Error)> DeleteAsync(int id)
        {
            if (!await _categoryRepo.GetByIdAsync(id).ContinueWith(t => t.Result != null))
                return (false, "Không tìm thấy danh mục.");

            if (await _categoryRepo.HasProductsAsync(id))
                return (false, "Không thể xóa danh mục đang có sản phẩm. Vui lòng xóa hoặc chuyển sản phẩm trước.");

            await _categoryRepo.DeleteAsync(id);
            return (true, null);
        }

        // ─── Helpers ─────────────────────────────────────────────────────────────

        private static CategoryResponseDto MapToDto(Category c) => new()
        {
            CategoryId          = c.CategoryId,
            CategoryName        = c.CategoryName,
            CategoryDescription = c.CategoryDescription,
            Slug                = c.Slug,
            ProductCount        = c.Products?.Count ?? 0
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
