using Backend.Models.DTOs;
using Backend.Services.ShippingService;
using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;

namespace Backend.Controllers
{
    [ApiController]
    [Route("api/[controller]")]
    public class ShippingController : ControllerBase
    {
        private readonly IShippingService _shippingService;

        public ShippingController(IShippingService shippingService)
        {
            _shippingService = shippingService;
        }

        // ─────────────────────────────────────────────────────────────────────
        // PUBLIC / CLIENT ENDPOINTS
        // ─────────────────────────────────────────────────────────────────────

        /// <summary>
        /// Lấy thông tin cấu hình Freeship & cước mặc định cho Storefront (Cart, Checkout)
        /// </summary>
        [HttpGet("config")]
        public async Task<IActionResult> GetConfig()
        {
            var config = await _shippingService.GetPublicConfigAsync();
            return Ok(new
            {
                success = true,
                message = "Lấy cấu hình vận chuyển thành công.",
                data = config
            });
        }

        /// <summary>
        /// Tính cước phí vận chuyển động theo địa chỉ nhận hàng và giá trị đơn hàng
        /// </summary>
        [HttpPost("calculate")]
        public async Task<IActionResult> Calculate([FromBody] CalculateShippingRequestDto request)
        {
            var result = await _shippingService.CalculateShippingFeeAsync(request.DestinationAddress, request.OrderTotal);
            return Ok(new
            {
                success = true,
                message = "Tính phí vận chuyển thành công.",
                data = result
            });
        }

        // ─────────────────────────────────────────────────────────────────────
        // ADMIN MANAGEMENT ENDPOINTS
        // ─────────────────────────────────────────────────────────────────────

        /// <summary>
        /// [Admin] Lấy cấu hình ngưỡng Freeship và cước phí mặc định
        /// </summary>
        [HttpGet("admin/settings")]
        [Authorize(Roles = "admin")]
        public async Task<IActionResult> GetAdminSettings()
        {
            var settings = await _shippingService.GetAdminSettingsAsync();
            return Ok(new
            {
                success = true,
                message = "Lấy cài đặt vận chuyển thành công.",
                data = settings
            });
        }

        /// <summary>
        /// [Admin] Cập nhật cấu hình ngưỡng Freeship và cước phí mặc định
        /// </summary>
        [HttpPut("admin/settings")]
        [Authorize(Roles = "admin")]
        public async Task<IActionResult> UpdateAdminSettings([FromBody] UpdateShippingSettingDto dto)
        {
            if (!ModelState.IsValid) return BadRequest(ModelState);

            var updated = await _shippingService.UpdateAdminSettingsAsync(dto);
            return Ok(new
            {
                success = true,
                message = "Cập nhật cấu hình vận chuyển thành công.",
                data = updated
            });
        }

        /// <summary>
        /// [Admin] Lấy danh sách tất cả các tuyến vận chuyển
        /// </summary>
        [HttpGet("admin/rules")]
        [Authorize(Roles = "admin")]
        public async Task<IActionResult> GetAllRules()
        {
            var rules = await _shippingService.GetAllRulesAsync();
            return Ok(new
            {
                success = true,
                message = "Lấy danh sách quy tắc vận chuyển thành công.",
                data = rules
            });
        }

        /// <summary>
        /// [Admin] Lấy chi tiết một tuyến vận chuyển
        /// </summary>
        [HttpGet("admin/rules/{id:int}")]
        [Authorize(Roles = "admin")]
        public async Task<IActionResult> GetRuleById(int id)
        {
            var rule = await _shippingService.GetRuleByIdAsync(id);
            if (rule == null)
            {
                return NotFound(new { success = false, message = $"Không tìm thấy tuyến ID={id}." });
            }

            return Ok(new { success = true, data = rule });
        }

        /// <summary>
        /// [Admin] Thêm một tuyến vận chuyển mới
        /// </summary>
        [HttpPost("admin/rules")]
        [Authorize(Roles = "admin")]
        public async Task<IActionResult> CreateRule([FromBody] CreateShippingRuleDto dto)
        {
            if (!ModelState.IsValid) return BadRequest(ModelState);

            var created = await _shippingService.CreateRuleAsync(dto);
            return StatusCode(201, new
            {
                success = true,
                message = "Tạo tuyến vận chuyển mới thành công.",
                data = created
            });
        }

        /// <summary>
        /// [Admin] Cập nhật một tuyến vận chuyển
        /// </summary>
        [HttpPut("admin/rules/{id:int}")]
        [Authorize(Roles = "admin")]
        public async Task<IActionResult> UpdateRule(int id, [FromBody] UpdateShippingRuleDto dto)
        {
            if (!ModelState.IsValid) return BadRequest(ModelState);

            try
            {
                var updated = await _shippingService.UpdateRuleAsync(id, dto);
                return Ok(new
                {
                    success = true,
                    message = "Cập nhật tuyến vận chuyển thành công.",
                    data = updated
                });
            }
            catch (KeyNotFoundException ex)
            {
                return NotFound(new { success = false, message = ex.Message });
            }
        }

        /// <summary>
        /// [Admin] Xóa một tuyến vận chuyển
        /// </summary>
        [HttpDelete("admin/rules/{id:int}")]
        [Authorize(Roles = "admin")]
        public async Task<IActionResult> DeleteRule(int id)
        {
            var deleted = await _shippingService.DeleteRuleAsync(id);
            if (!deleted)
            {
                return NotFound(new { success = false, message = $"Không tìm thấy tuyến ID={id}." });
            }

            return Ok(new
            {
                success = true,
                message = "Xóa tuyến vận chuyển thành công."
            });
        }
    }
}
