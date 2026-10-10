using Backend.Models.DTOs;
using Backend.Services.OrderService;
using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;

namespace Backend.Controllers
{
    [ApiController]
    [Route("api/[controller]")]
    [Authorize(Roles = "admin,seller")]
    public class AdminOrderController : ControllerBase
    {
        private readonly IOrderService _orderService;
        private readonly ILogger<AdminOrderController> _logger;

        public AdminOrderController(IOrderService orderService, ILogger<AdminOrderController> logger)
        {
            _orderService = orderService;
            _logger = logger;
        }

        /// <summary>
        /// [Admin/Seller] Lấy danh sách đơn hàng có phân trang & lọc đa tiêu chí
        /// </summary>
        [HttpGet]
        public async Task<IActionResult> GetOrders([FromQuery] AdminOrderQueryDto query)
        {
            try
            {
                var result = await _orderService.GetAdminOrdersPagedAsync(query);
                return Ok(new
                {
                    success = true,
                    message = "Lấy danh sách đơn hàng thành công.",
                    data = result
                });
            }
            catch (Exception ex)
            {
                _logger.LogError(ex, "Lỗi khi lấy danh sách đơn hàng Admin");
                return StatusCode(500, new { success = false, message = "Lỗi máy chủ khi lấy danh sách đơn hàng." });
            }
        }

        /// <summary>
        /// [Admin/Seller] Lấy số liệu thống kê nhanh cho Dashboard đơn hàng
        /// </summary>
        [HttpGet("stats")]
        public async Task<IActionResult> GetStats()
        {
            try
            {
                var stats = await _orderService.GetAdminOrderStatsAsync();
                return Ok(new
                {
                    success = true,
                    message = "Lấy thống kê đơn hàng thành công.",
                    data = stats
                });
            }
            catch (Exception ex)
            {
                _logger.LogError(ex, "Lỗi khi lấy thống kê đơn hàng Admin");
                return StatusCode(500, new { success = false, message = "Lỗi máy chủ khi lấy thống kê đơn hàng." });
            }
        }

        /// <summary>
        /// [Admin/Seller] Lấy chi tiết đơn hàng theo OrderId
        /// </summary>
        [HttpGet("{orderId:int}")]
        public async Task<IActionResult> GetOrderDetail(int orderId)
        {
            try
            {
                var order = await _orderService.GetAdminOrderDetailAsync(orderId);
                if (order == null)
                {
                    return NotFound(new { success = false, message = $"Không tìm thấy đơn hàng với ID #{orderId}." });
                }

                return Ok(new
                {
                    success = true,
                    message = "Lấy chi tiết đơn hàng thành công.",
                    data = order
                });
            }
            catch (Exception ex)
            {
                _logger.LogError(ex, "Lỗi khi lấy chi tiết đơn hàng ID={OrderId}", orderId);
                return StatusCode(500, new { success = false, message = "Lỗi máy chủ khi lấy chi tiết đơn hàng." });
            }
        }

        /// <summary>
        /// [Admin/Seller] Cập nhật trạng thái đơn hàng (Xác nhận, Giao hàng, Hoàn thành, Hủy...)
        /// </summary>
        [HttpPut("{orderId:int}/status")]
        public async Task<IActionResult> UpdateOrderStatus(int orderId, [FromBody] AdminUpdateOrderStatusDto dto)
        {
            if (!ModelState.IsValid)
            {
                return BadRequest(ModelState);
            }

            try
            {
                var updated = await _orderService.UpdateOrderStatusByAdminAsync(orderId, dto);
                return Ok(new
                {
                    success = true,
                    message = $"Cập nhật trạng thái đơn #{updated.OrderCode} thành '{updated.OrderStatusName}' thành công.",
                    data = updated
                });
            }
            catch (KeyNotFoundException ex)
            {
                return NotFound(new { success = false, message = ex.Message });
            }
            catch (InvalidOperationException ex)
            {
                return BadRequest(new { success = false, message = ex.Message });
            }
            catch (Exception ex)
            {
                _logger.LogError(ex, "Lỗi khi cập nhật trạng thái đơn hàng ID={OrderId}", orderId);
                return StatusCode(500, new { success = false, message = "Lỗi máy chủ khi cập nhật trạng thái đơn hàng." });
            }
        }

        /// <summary>
        /// [Admin/Seller] Cập nhật trạng thái thanh toán đơn hàng (Chờ thanh toán, Đã thanh toán, Thất bại)
        /// </summary>
        [HttpPut("{orderId:int}/payment-status")]
        public async Task<IActionResult> UpdatePaymentStatus(int orderId, [FromBody] AdminUpdatePaymentStatusDto dto)
        {
            if (!ModelState.IsValid)
            {
                return BadRequest(ModelState);
            }

            try
            {
                var updated = await _orderService.UpdatePaymentStatusByAdminAsync(orderId, dto);
                return Ok(new
                {
                    success = true,
                    message = $"Cập nhật trạng thái thanh toán đơn #{updated.OrderCode} thành '{updated.PaymentStatusName}' thành công.",
                    data = updated
                });
            }
            catch (KeyNotFoundException ex)
            {
                return NotFound(new { success = false, message = ex.Message });
            }
            catch (Exception ex)
            {
                _logger.LogError(ex, "Lỗi khi cập nhật trạng thái thanh toán đơn hàng ID={OrderId}", orderId);
                return StatusCode(500, new { success = false, message = "Lỗi máy chủ khi cập nhật trạng thái thanh toán." });
            }
        }
    }
}
