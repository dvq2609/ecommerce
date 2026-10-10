using System.Security.Claims;
using Backend.Services.AnalyticsService;
using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;

namespace Backend.Controllers
{
    [ApiController]
    [Route("api/seller/analytics")]
    [Authorize(Roles = "seller,admin")]
    public class SellerAnalyticsController : ControllerBase
    {
        private readonly ISellerAnalyticsService _analyticsService;

        public SellerAnalyticsController(ISellerAnalyticsService analyticsService)
        {
            _analyticsService = analyticsService;
        }

        private int GetCurrentUserId()
        {
            var claim = User.FindFirst("UserId")?.Value ?? User.FindFirst(ClaimTypes.NameIdentifier)?.Value;
            if (int.TryParse(claim, out int id))
            {
                return id;
            }
            throw new UnauthorizedAccessException("Không xác định được danh tính người bán.");
        }

        /// <summary>
        /// Lấy 4 chỉ số KPI tài chính cốt lõi của Seller theo khoảng thời gian.
        /// </summary>
        [HttpGet("kpi")]
        public async Task<IActionResult> GetKpi([FromQuery] string period = "7days")
        {
            try
            {
                int sellerId = GetCurrentUserId();
                var data = await _analyticsService.GetSellerKpiAsync(sellerId, period);
                return Ok(new { success = true, data });
            }
            catch (Exception ex)
            {
                return BadRequest(new { success = false, message = ex.Message });
            }
        }

        /// <summary>
        /// Lấy chuỗi dữ liệu thời gian cho biểu đồ Doanh thu & Đơn hàng (Hôm nay, 7 ngày, 30 ngày, 1 năm).
        /// </summary>
        [HttpGet("revenue-chart")]
        public async Task<IActionResult> GetRevenueChart([FromQuery] string period = "7days")
        {
            try
            {
                int sellerId = GetCurrentUserId();
                var data = await _analyticsService.GetRevenueChartAsync(sellerId, period);
                return Ok(new { success = true, data });
            }
            catch (Exception ex)
            {
                return BadRequest(new { success = false, message = ex.Message });
            }
        }

        /// <summary>
        /// Lấy tỷ lệ phân bổ trạng thái đơn hàng cho biểu đồ Donut Chart.
        /// </summary>
        [HttpGet("status-breakdown")]
        public async Task<IActionResult> GetStatusBreakdown()
        {
            try
            {
                int sellerId = GetCurrentUserId();
                var data = await _analyticsService.GetOrderStatusBreakdownAsync(sellerId);
                return Ok(new { success = true, data });
            }
            catch (Exception ex)
            {
                return BadRequest(new { success = false, message = ex.Message });
            }
        }
    }
}
