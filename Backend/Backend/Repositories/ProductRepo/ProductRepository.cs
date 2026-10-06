using Backend.Models;
using Backend.Models.DTOs;
using Microsoft.EntityFrameworkCore;

namespace Backend.Repositories.ProductRepo
{
    public class ProductRepository : IProductRepository
    {
        private readonly ApplicationDbContext _context;

        public ProductRepository(ApplicationDbContext context)
        {
            _context = context;
        }

        public async Task<(List<Product> Items, int TotalCount)> GetPagedAsync(ProductQueryDto query)
        {
            var q = _context.Products
                .Include(p => p.Category)
                .Include(p => p.Brand)
                .Include(p => p.Images)
                .AsQueryable();

            // Filters
            if (!string.IsNullOrWhiteSpace(query.Search))
                q = q.Where(p => p.ProductName.Contains(query.Search));

            if (query.CategoryId.HasValue)
                q = q.Where(p => p.CategoryId == query.CategoryId.Value);

            if (query.BrandId.HasValue)
                q = q.Where(p => p.BrandId == query.BrandId.Value);

            if (query.MinPrice.HasValue)
                q = q.Where(p => p.Price >= query.MinPrice.Value);

            if (query.MaxPrice.HasValue)
                q = q.Where(p => p.Price <= query.MaxPrice.Value);

            if (query.InStock.HasValue && query.InStock.Value)
                q = q.Where(p => p.StockQuantity > 0);

            if (query.IsActive.HasValue)
                q = q.Where(p => p.IsActive == query.IsActive.Value);

            // Sort
            q = query.SortByPrice?.ToLower() switch
            {
                "asc"  => q.OrderBy(p => p.Price),
                "desc" => q.OrderByDescending(p => p.Price),
                _      => q.OrderByDescending(p => p.ProductId)
            };

            var totalCount = await q.CountAsync();

            var items = await q
                .Skip((query.Page - 1) * query.PageSize)
                .Take(query.PageSize)
                .ToListAsync();

            return (items, totalCount);
        }

        public async Task<Product?> GetByIdAsync(int id)
        {
            return await _context.Products
                .Include(p => p.Category)
                .Include(p => p.Brand)
                .Include(p => p.Images.OrderBy(i => i.DisplayOrder))
                .FirstOrDefaultAsync(p => p.ProductId == id);
        }

        public async Task<Product?> GetBySlugAsync(string slug)
        {
            return await _context.Products
                .Include(p => p.Category)
                .Include(p => p.Brand)
                .Include(p => p.Images.OrderBy(i => i.DisplayOrder))
                .FirstOrDefaultAsync(p => p.Slug == slug);
        }

        public async Task<bool> SlugExistsAsync(string slug, int? excludeId = null)
        {
            return await _context.Products.AnyAsync(p =>
                p.Slug == slug && (excludeId == null || p.ProductId != excludeId));
        }

        public async Task<Product> CreateAsync(Product product)
        {
            _context.Products.Add(product);
            await _context.SaveChangesAsync();
            return product;
        }

        public async Task<Product> UpdateAsync(Product product)
        {
            _context.Products.Update(product);
            await _context.SaveChangesAsync();
            return product;
        }

        public async Task<bool> DeleteAsync(int id)
        {
            var product = await _context.Products.FindAsync(id);
            if (product == null) return false;

            _context.Products.Remove(product);
            await _context.SaveChangesAsync();
            return true;
        }

        public async Task AddImagesAsync(List<ProductImage> images)
        {
            _context.ProductImages.AddRange(images);
            await _context.SaveChangesAsync();
        }

        public async Task<bool> DeleteImageAsync(int imageId)
        {
            var image = await _context.ProductImages.FindAsync(imageId);
            if (image == null) return false;

            _context.ProductImages.Remove(image);
            await _context.SaveChangesAsync();
            return true;
        }

        public async Task SetPrimaryImageAsync(int productId, int imageId)
        {
            var images = await _context.ProductImages
                .Where(i => i.ProductId == productId)
                .ToListAsync();

            foreach (var img in images)
                img.IsPrimary = img.ProductImageId == imageId;

            await _context.SaveChangesAsync();
        }
    }
}
