using Backend.Models.DTOs;

namespace Backend.Services.CategoryService
{
    public interface ICategoryService
    {
        Task<List<CategoryResponseDto>> GetAllAsync();
        Task<CategoryResponseDto?> GetByIdAsync(int id);
        Task<CategoryResponseDto?> GetBySlugAsync(string slug);
        Task<(bool Success, string? Error, CategoryResponseDto? Data)> CreateAsync(CreateCategoryDto dto);
        Task<(bool Success, string? Error, CategoryResponseDto? Data)> UpdateAsync(int id, UpdateCategoryDto dto);
        Task<(bool Success, string? Error)> DeleteAsync(int id);
    }
}
