using Backend.Models;
using Backend.Models.DTOs;

namespace Backend.Repositories.ProductRepo
{
    public interface IProductRepository
    {
        Task<(List<Product> Items, int TotalCount)> GetPagedAsync(ProductQueryDto query);
        Task<Product?> GetByIdAsync(int id);
        Task<Product?> GetBySlugAsync(string slug);
        Task<Product?> GetDetailByIdAsync(int id);
        Task<Product?> GetDetailBySlugAsync(string slug);
        Task<bool> SlugExistsAsync(string slug, int? excludeId = null);
        Task<Product> CreateAsync(Product product);
        Task<Product> CreateWithVariantsAsync(Product product, List<ProductVariant> variants, List<ProductImage> images);
        Task<Product> UpdateAsync(Product product);
        Task<bool> DeleteAsync(int id);

        // Variant management
        Task<List<ProductVariant>> GetVariantsByProductIdAsync(int productId);
        Task<ProductVariant?> GetVariantByIdAsync(int variantId);

        // Image management
        Task AddImagesAsync(List<ProductImage> images);
        Task<bool> DeleteImageAsync(int imageId);
        Task SetPrimaryImageAsync(int productId, int imageId);
    }
}
