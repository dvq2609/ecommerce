using Backend.Services.AnalyticsService;
using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;

namespace Backend.Controllers
{
    [ApiController]
    [Route("api/admin/analytics")]
    [Authorize(Roles = "admin")]
    public class AdminAnalyticsController : ControllerBase
    {
        private readonly IAdminAnalyticsService _adminAnalyticsService;

        public AdminAnalyticsController(IAdminAnalyticsService adminAnalyticsService)
        {
            _adminAnalyticsService = adminAnalyticsService;
        }

        /// <summary>
        /// Lấy toàn bộ dữ liệu thống kê tổng quan toàn sàn dành cho Admin Dashboard.
        /// </summary>
        [HttpGet("overview")]
        public async Task<IActionResult> GetOverview([FromQuery] string period = "all")
        {
            try
            {
                var data = await _adminAnalyticsService.GetAdminOverviewAsync(period);
                return Ok(new { success = true, data });
            }
            catch (Exception ex)
            {
                return BadRequest(new { success = false, message = ex.Message });
            }
        }
    }
}
