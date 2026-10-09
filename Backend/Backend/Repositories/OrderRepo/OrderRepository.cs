using Backend.Models;
using Backend.Models.DTOs;
using Backend.Models.Enums;
using Microsoft.EntityFrameworkCore;
using Microsoft.EntityFrameworkCore.Storage;

namespace Backend.Repositories.OrderRepo
{
    public class OrderRepository : IOrderRepository
    {
        private readonly ApplicationDbContext _context;

        public OrderRepository(ApplicationDbContext context)
        {
            _context = context;
        }

        public async Task<Order?> GetByIdAsync(int orderId, int userId)
        {
            return await _context.Orders
                .Include(o => o.OrderItems)
                    .ThenInclude(oi => oi.Product)
                        .ThenInclude(p => p.Images)
                .Include(o => o.OrderItems)
                    .ThenInclude(oi => oi.ProductVariant)
                        .ThenInclude(pv => pv!.Color)
                .Include(o => o.OrderItems)
                    .ThenInclude(oi => oi.ProductVariant)
                        .ThenInclude(pv => pv!.Size)
                .FirstOrDefaultAsync(o => o.OrderId == orderId && o.UserId == userId);
        }

        public async Task<Order?> GetByCodeAsync(string orderCode, int userId)
        {
            return await _context.Orders
                .Include(o => o.OrderItems)
                    .ThenInclude(oi => oi.Product)
                        .ThenInclude(p => p.Images)
                .Include(o => o.OrderItems)
                    .ThenInclude(oi => oi.ProductVariant)
                        .ThenInclude(pv => pv!.Color)
                .Include(o => o.OrderItems)
                    .ThenInclude(oi => oi.ProductVariant)
                        .ThenInclude(pv => pv!.Size)
                .FirstOrDefaultAsync(o => o.OrderCode == orderCode && o.UserId == userId);
        }

        public async Task<(List<Order> Items, int TotalCount)> GetPagedByUserAsync(int userId, OrderQueryDto query)
        {
            var dbQuery = _context.Orders
                .AsNoTracking()
                .Where(o => o.UserId == userId);

            if (query.Status.HasValue)
            {
                dbQuery = dbQuery.Where(o => o.OrderStatus == query.Status.Value);
            }

            if (!string.IsNullOrWhiteSpace(query.Search))
            {
                var keyword = query.Search.Trim().ToLower();
                dbQuery = dbQuery.Where(o => o.OrderCode.ToLower().Contains(keyword) ||
                                             o.RecipientName.ToLower().Contains(keyword) ||
                                             o.RecipientPhone.Contains(keyword));
            }

            var totalCount = await dbQuery.CountAsync();

            var pageNumber = query.PageNumber > 0 ? query.PageNumber : 1;
            var pageSize = query.PageSize > 0 ? query.PageSize : 10;

            var items = await dbQuery
                .Include(o => o.OrderItems)
                .OrderByDescending(o => o.CreatedAt)
                .Skip((pageNumber - 1) * pageSize)
                .Take(pageSize)
                .ToListAsync();

            return (items, totalCount);
        }

        public async Task<Order> CreateOrderAsync(Order order)
        {
            await _context.Orders.AddAsync(order);
            await _context.SaveChangesAsync();
            return order;
        }

        public async Task UpdateOrderAsync(Order order)
        {
            order.UpdatedAt = DateTime.UtcNow;
            _context.Orders.Update(order);
            await _context.SaveChangesAsync();
        }

        public async Task<bool> DeductStockAsync(int? variantId, int productId, int quantity)
        {
            if (quantity <= 0) return false;

            if (variantId.HasValue)
            {
                var variant = await _context.ProductVariants
                    .FirstOrDefaultAsync(pv => pv.VariantId == variantId.Value);

                if (variant == null || variant.StockQuantity < quantity)
                {
                    return false;
                }

                variant.StockQuantity -= quantity;
                variant.UpdatedAt = DateTime.UtcNow;

                var product = await _context.Products.FindAsync(productId);
                if (product != null && product.StockQuantity >= quantity)
                {
                    product.StockQuantity -= quantity;
                }

                await _context.SaveChangesAsync();
                return true;
            }
            else
            {
                var product = await _context.Products.FindAsync(productId);
                if (product == null || product.StockQuantity < quantity)
                {
                    return false;
                }

                product.StockQuantity -= quantity;
                await _context.SaveChangesAsync();
                return true;
            }
        }

        public async Task<bool> RestoreStockAsync(int? variantId, int productId, int quantity)
        {
            if (quantity <= 0) return false;

            if (variantId.HasValue)
            {
                var variant = await _context.ProductVariants
                    .FirstOrDefaultAsync(pv => pv.VariantId == variantId.Value);

                if (variant != null)
                {
                    variant.StockQuantity += quantity;
                    variant.UpdatedAt = DateTime.UtcNow;
                }

                var product = await _context.Products.FindAsync(productId);
                if (product != null)
                {
                    product.StockQuantity += quantity;
                }

                await _context.SaveChangesAsync();
                return true;
            }
            else
            {
                var product = await _context.Products.FindAsync(productId);
                if (product != null)
                {
                    product.StockQuantity += quantity;
                    await _context.SaveChangesAsync();
                }
                return true;
            }
        }

        public async Task<IDbContextTransaction> BeginTransactionAsync()
        {
            return await _context.Database.BeginTransactionAsync();
        }

        public async Task SaveChangesAsync()
        {
            await _context.SaveChangesAsync();
        }
    }
}
