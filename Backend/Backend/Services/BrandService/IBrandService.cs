using Backend.Models.DTOs;

namespace Backend.Services.BrandService
{
    public interface IBrandService
    {
        Task<List<BrandResponseDto>> GetAllAsync();
        Task<BrandResponseDto?> GetByIdAsync(int id);
        Task<BrandResponseDto?> GetBySlugAsync(string slug);
        Task<(bool Success, string? Error, BrandResponseDto? Data)> CreateAsync(CreateBrandDto dto);
        Task<(bool Success, string? Error, BrandResponseDto? Data)> UpdateAsync(int id, UpdateBrandDto dto);
        Task<(bool Success, string? Error)> DeleteAsync(int id);
    }
}
