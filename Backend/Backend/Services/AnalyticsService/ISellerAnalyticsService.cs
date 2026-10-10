using Backend.Models.DTOs.AnalyticsDTOs;

namespace Backend.Services.AnalyticsService
{
    public interface ISellerAnalyticsService
    {
        Task<SellerKpiDto> GetSellerKpiAsync(int sellerId, string period);
        Task<List<RevenueChartPointDto>> GetRevenueChartAsync(int sellerId, string period);
        Task<List<OrderStatusBreakdownDto>> GetOrderStatusBreakdownAsync(int sellerId);
    }
}
