using Backend.Models;
using Backend.Models.DTOs;

namespace Backend.Repositories.ProductRepo
{
    public interface IProductRepository
    {
        Task<(List<Product> Items, int TotalCount)> GetPagedAsync(ProductQueryDto query);
        Task<Product?> GetByIdAsync(int id);
        Task<Product?> GetBySlugAsync(string slug);
        Task<bool> SlugExistsAsync(string slug, int? excludeId = null);
        Task<Product> CreateAsync(Product product);
        Task<Product> UpdateAsync(Product product);
        Task<bool> DeleteAsync(int id);

        // Image management
        Task AddImagesAsync(List<ProductImage> images);
        Task<bool> DeleteImageAsync(int imageId);
        Task SetPrimaryImageAsync(int productId, int imageId);
    }
}
