using Backend.Models.DTOs.InventoryDTOs;

namespace Backend.Services.InventoryService
{
    public interface ISellerInventoryService
    {
        Task<SellerInventoryPagedResultDto> GetInventoryPagedAsync(int sellerId, string? search, string? stockFilter, int page, int pageSize);
        Task<SellerInventoryStatsDto> GetInventoryStatsAsync(int sellerId);
        Task<(bool Success, string? Error, SellerInventoryItemDto? Data)> UpdateStockAsync(int sellerId, int variantId, UpdateInventoryStockDto dto);
    }
}
