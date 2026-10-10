using Backend.Models;
using Backend.Models.DTOs;
using Backend.Models.Enums;
using Microsoft.EntityFrameworkCore.Storage;

namespace Backend.Repositories.OrderRepo
{
    public interface IOrderRepository
    {
        Task<Order?> GetByIdAsync(int orderId, int userId);
        Task<Order?> GetByCodeAsync(string orderCode, int userId);
        Task<Order?> GetByIdempotencyKeyAsync(string idempotencyKey, int userId);
        Task<(List<Order> Items, int TotalCount)> GetPagedByUserAsync(int userId, OrderQueryDto query);

        // Admin & Seller methods
        Task<Order?> GetByIdForAdminAsync(int orderId);
        Task<(List<Order> Items, int TotalCount)> GetPagedForAdminAsync(AdminOrderQueryDto query);
        Task<AdminOrderStatsDto> GetOrderStatsAsync();

        Task<Order> CreateOrderAsync(Order order);
        Task UpdateOrderAsync(Order order);
        Task<bool> DeductStockAsync(int? variantId, int productId, int quantity);
        Task<bool> RestoreStockAsync(int? variantId, int productId, int quantity);
        Task<IDbContextTransaction> BeginTransactionAsync();
        Task SaveChangesAsync();
    }
}
