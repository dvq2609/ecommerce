using Backend.Models.DTOs.AnalyticsDTOs;

namespace Backend.Services.AnalyticsService
{
    public interface IAdminAnalyticsService
    {
        Task<AdminDashboardOverviewDto> GetAdminOverviewAsync(string period);
    }
}
