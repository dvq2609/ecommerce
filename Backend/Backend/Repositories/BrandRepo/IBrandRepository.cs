using Backend.Models;

namespace Backend.Repositories.BrandRepo
{
    public interface IBrandRepository
    {
        Task<List<Brand>> GetAllAsync();
        Task<Brand?> GetByIdAsync(int id);
        Task<Brand?> GetBySlugAsync(string slug);
        Task<bool> SlugExistsAsync(string slug, int? excludeId = null);
        Task<Brand> CreateAsync(Brand brand);
        Task<Brand> UpdateAsync(Brand brand);
        Task<bool> DeleteAsync(int id);
        Task<bool> HasProductsAsync(int id);
    }
}
