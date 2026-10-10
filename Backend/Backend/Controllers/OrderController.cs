using System.Security.Claims;
using Backend.Models.DTOs;
using Backend.Services.OrderService;
using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;

namespace Backend.Controllers
{
    [ApiController]
    [Route("api/[controller]")]
    [Authorize]
    public class OrderController : ControllerBase
    {
        private readonly IOrderService _orderService;
        private readonly ILogger<OrderController> _logger;

        public OrderController(IOrderService orderService, ILogger<OrderController> logger)
        {
            _orderService = orderService;
            _logger = logger;
        }

        private int GetCurrentUserId()
        {
            var userIdClaim = User.FindFirst("UserId")?.Value
                ?? User.FindFirst(ClaimTypes.NameIdentifier)?.Value;

            if (int.TryParse(userIdClaim, out int userId))
                return userId;

            throw new UnauthorizedAccessException("Không xác định được danh tính người dùng từ token.");
        }

        /// <summary>
        /// Tạo đơn hàng mới từ Giỏ hàng hoặc Buy Now.
        /// Nếu không truyền Items, hệ thống tự lấy toàn bộ giỏ hàng.
        /// </summary>
        [HttpPost]
        public async Task<IActionResult> CreateOrder([FromBody] CreateOrderRequestDto request)
        {
            if (!ModelState.IsValid)
                return BadRequest(ModelState);

            try
            {
                int userId = GetCurrentUserId();
                var idempotencyKey = Request.Headers["Idempotency-Key"].FirstOrDefault();
                var order = await _orderService.CreateOrderAsync(userId, request, idempotencyKey);
                return Ok(new { success = true, message = $"Đặt hàng thành công! Mã đơn: {order.OrderCode}", data = order });
            }
            catch (UnauthorizedAccessException ex)
            {
                return Unauthorized(new { success = false, message = ex.Message });
            }
            catch (InvalidOperationException ex)
            {
                return BadRequest(new { success = false, message = ex.Message });
            }
            catch (Exception ex)
            {
                _logger.LogError(ex, "Lỗi khi tạo đơn hàng cho User");
                return StatusCode(500, new { success = false, message = "Lỗi hệ thống khi xử lý đơn hàng. Vui lòng thử lại." });
            }
        }

        /// <summary>
        /// Lấy danh sách đơn hàng của người dùng hiện tại, có thể lọc theo trạng thái và phân trang.
        /// </summary>
        [HttpGet]
        public async Task<IActionResult> GetMyOrders([FromQuery] OrderQueryDto query)
        {
            try
            {
                int userId = GetCurrentUserId();
                var result = await _orderService.GetPagedOrdersAsync(userId, query);
                return Ok(new { success = true, data = result });
            }
            catch (UnauthorizedAccessException ex)
            {
                return Unauthorized(new { success = false, message = ex.Message });
            }
        }

        /// <summary>
        /// Lấy chi tiết một đơn hàng theo ID.
        /// </summary>
        [HttpGet("{id:int}")]
        public async Task<IActionResult> GetOrderById(int id)
        {
            try
            {
                int userId = GetCurrentUserId();
                var order = await _orderService.GetOrderDetailAsync(userId, id);
                if (order == null)
                    return NotFound(new { success = false, message = $"Không tìm thấy đơn hàng ID={id}." });

                return Ok(new { success = true, data = order });
            }
            catch (UnauthorizedAccessException ex)
            {
                return Unauthorized(new { success = false, message = ex.Message });
            }
        }

        /// <summary>
        /// Lấy chi tiết một đơn hàng theo Mã đơn hàng (OrderCode).
        /// </summary>
        [HttpGet("code/{orderCode}")]
        public async Task<IActionResult> GetOrderByCode(string orderCode)
        {
            try
            {
                int userId = GetCurrentUserId();
                var order = await _orderService.GetOrderByCodeAsync(userId, orderCode);
                if (order == null)
                    return NotFound(new { success = false, message = $"Không tìm thấy đơn hàng với mã '{orderCode}'." });

                return Ok(new { success = true, data = order });
            }
            catch (UnauthorizedAccessException ex)
            {
                return Unauthorized(new { success = false, message = ex.Message });
            }
        }

        /// <summary>
        /// Hủy đơn hàng (chỉ khi ở trạng thái Chờ xác nhận hoặc Đã xác nhận).
        /// Tồn kho của từng sản phẩm sẽ được hoàn trả tự động.
        /// </summary>
        [HttpPut("{id:int}/cancel")]
        public async Task<IActionResult> CancelOrder(int id, [FromBody] CancelOrderRequestDto? request)
        {
            try
            {
                int userId = GetCurrentUserId();
                var order = await _orderService.CancelOrderAsync(userId, id, request?.Reason);
                return Ok(new { success = true, message = $"Đơn hàng {order.OrderCode} đã được hủy thành công.", data = order });
            }
            catch (UnauthorizedAccessException ex)
            {
                return Unauthorized(new { success = false, message = ex.Message });
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
                _logger.LogError(ex, "Lỗi khi hủy đơn hàng ID={OrderId}", id);
                return StatusCode(500, new { success = false, message = "Lỗi hệ thống khi hủy đơn hàng. Vui lòng thử lại." });
            }
        }
    }
}
