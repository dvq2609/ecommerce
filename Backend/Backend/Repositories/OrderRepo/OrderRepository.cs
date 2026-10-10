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

        public async Task<Order?> GetByIdempotencyKeyAsync(string idempotencyKey, int userId)
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
                .FirstOrDefaultAsync(o => o.IdempotencyKey == idempotencyKey && o.UserId == userId);
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

        // ─────────────────────────────────────────────────────────────────────
        // ADMIN / SELLER REPOSITORY METHODS
        // ─────────────────────────────────────────────────────────────────────
        public async Task<Order?> GetByIdForAdminAsync(int orderId)
        {
            return await _context.Orders
                .Include(o => o.User)
                .Include(o => o.OrderItems)
                    .ThenInclude(oi => oi.Product)
                        .ThenInclude(p => p.Images)
                .Include(o => o.OrderItems)
                    .ThenInclude(oi => oi.ProductVariant)
                        .ThenInclude(pv => pv!.Color)
                .Include(o => o.OrderItems)
                    .ThenInclude(oi => oi.ProductVariant)
                        .ThenInclude(pv => pv!.Size)
                .FirstOrDefaultAsync(o => o.OrderId == orderId);
        }

        public async Task<(List<Order> Items, int TotalCount)> GetPagedForAdminAsync(AdminOrderQueryDto query)
        {
            var dbQuery = _context.Orders
                .AsNoTracking()
                .Include(o => o.User)
                .Include(o => o.OrderItems)
                .AsQueryable();

            if (query.Status.HasValue)
            {
                dbQuery = dbQuery.Where(o => o.OrderStatus == query.Status.Value);
            }

            if (query.PaymentStatus.HasValue)
            {
                dbQuery = dbQuery.Where(o => o.PaymentStatus == query.PaymentStatus.Value);
            }

            if (query.PaymentMethod.HasValue)
            {
                dbQuery = dbQuery.Where(o => o.PaymentMethod == query.PaymentMethod.Value);
            }

            if (!string.IsNullOrWhiteSpace(query.Search))
            {
                var keyword = query.Search.Trim().ToLower();
                dbQuery = dbQuery.Where(o => o.OrderCode.ToLower().Contains(keyword) ||
                                             o.RecipientName.ToLower().Contains(keyword) ||
                                             o.RecipientPhone.Contains(keyword) ||
                                             (o.User != null && o.User.Email.ToLower().Contains(keyword)));
            }

            if (query.FromDate.HasValue)
            {
                dbQuery = dbQuery.Where(o => o.CreatedAt >= query.FromDate.Value);
            }

            if (query.ToDate.HasValue)
            {
                dbQuery = dbQuery.Where(o => o.CreatedAt <= query.ToDate.Value);
            }

            var totalCount = await dbQuery.CountAsync();

            // Sắp xếp
            if (query.SortBy?.ToLower() == "finalamount")
            {
                dbQuery = query.IsDescending
                    ? dbQuery.OrderByDescending(o => o.FinalAmount)
                    : dbQuery.OrderBy(o => o.FinalAmount);
            }
            else
            {
                dbQuery = query.IsDescending
                    ? dbQuery.OrderByDescending(o => o.CreatedAt)
                    : dbQuery.OrderBy(o => o.CreatedAt);
            }

            var pageNumber = query.PageNumber > 0 ? query.PageNumber : 1;
            var pageSize = query.PageSize > 0 ? query.PageSize : 10;

            var items = await dbQuery
                .Skip((pageNumber - 1) * pageSize)
                .Take(pageSize)
                .ToListAsync();

            return (items, totalCount);
        }

        public async Task<AdminOrderStatsDto> GetOrderStatsAsync()
        {
            var stats = new AdminOrderStatsDto();

            var statusCounts = await _context.Orders
                .AsNoTracking()
                .GroupBy(o => o.OrderStatus)
                .Select(g => new { Status = g.Key, Count = g.Count() })
                .ToListAsync();

            stats.TotalOrders = statusCounts.Sum(x => x.Count);
            stats.PendingOrders = statusCounts.FirstOrDefault(x => x.Status == OrderStatus.Pending)?.Count ?? 0;
            stats.ConfirmedOrders = statusCounts.FirstOrDefault(x => x.Status == OrderStatus.Confirmed)?.Count ?? 0;
            stats.ProcessingOrders = statusCounts.FirstOrDefault(x => x.Status == OrderStatus.Processing)?.Count ?? 0;
            stats.ShippingOrders = statusCounts.FirstOrDefault(x => x.Status == OrderStatus.Shipping)?.Count ?? 0;
            stats.DeliveredOrders = statusCounts.FirstOrDefault(x => x.Status == OrderStatus.Delivered)?.Count ?? 0;
            stats.CancelledOrders = statusCounts.FirstOrDefault(x => x.Status == OrderStatus.Cancelled)?.Count ?? 0;
            stats.RefundedOrders = statusCounts.FirstOrDefault(x => x.Status == OrderStatus.Refunded)?.Count ?? 0;

            stats.TotalRevenue = await _context.Orders
                .AsNoTracking()
                .Where(o => o.OrderStatus == OrderStatus.Delivered)
                .SumAsync(o => o.FinalAmount);

            return stats;
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
