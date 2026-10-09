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
        Task<(List<Order> Items, int TotalCount)> GetPagedByUserAsync(int userId, OrderQueryDto query);
        Task<Order> CreateOrderAsync(Order order);
        Task UpdateOrderAsync(Order order);
        Task<bool> DeductStockAsync(int? variantId, int productId, int quantity);
        Task<bool> RestoreStockAsync(int? variantId, int productId, int quantity);
        Task<IDbContextTransaction> BeginTransactionAsync();
        Task SaveChangesAsync();
    }
}
