using Backend.Models.DTOs;

namespace Backend.Services.ProductService
{
    public interface IProductService
    {
        Task<PagedResult<ProductResponseDto>> GetPagedAsync(ProductQueryDto query);
        Task<ProductResponseDto?> GetByIdAsync(int id);
        Task<ProductResponseDto?> GetBySlugAsync(string slug);
        Task<(bool Success, string? Error, ProductResponseDto? Data)> CreateAsync(CreateProductDto dto);
        Task<(bool Success, string? Error, ProductResponseDto? Data)> UpdateAsync(int id, UpdateProductDto dto);
        Task<(bool Success, string? Error)> DeleteAsync(int id);

        // Image management
        Task<(bool Success, string? Error)> AddImagesAsync(int productId, List<ProductImageInputDto> images);
        Task<(bool Success, string? Error)> DeleteImageAsync(int productId, int imageId);
        Task<(bool Success, string? Error)> SetPrimaryImageAsync(int productId, int imageId);
    }
}
