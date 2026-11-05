using System.Security.Claims;
using Backend.Models.DTOs;
using Backend.Services.VoucherService;
using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;

namespace Backend.Controllers
{
    [ApiController]
    [Route("api/[controller]")]
    public class VoucherController : ControllerBase
    {
        private readonly IVoucherService _voucherService;
        private readonly ILogger<VoucherController> _logger;

        public VoucherController(IVoucherService voucherService, ILogger<VoucherController> logger)
        {
            _voucherService = voucherService;
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
        /// Lấy danh sách mã Freeship & Mã giảm giá đang hoạt động để hiển thị ngoài Trang chủ (Public).
        /// </summary>
        [HttpGet("public")]
        [AllowAnonymous]
        public async Task<IActionResult> GetPublicVouchers()
        {
            var list = await _voucherService.GetPublicVouchersAsync();
            return Ok(new { success = true, data = list });
        }

        /// <summary>
        /// Lấy danh sách mã chia làm 2 nhóm (Freeship & Giảm giá đơn hàng) kèm kiểm tra điều kiện đơn tối thiểu cho Buyer.
        /// </summary>
        [HttpGet("available")]
        [Authorize]
        public async Task<IActionResult> GetAvailableVouchers([FromQuery] decimal orderTotal = 0, [FromQuery] decimal shippingFee = 30000)
        {
            try
            {
                int userId = GetCurrentUserId();
                var data = await _voucherService.GetAvailableVouchersForBuyerAsync(userId, orderTotal, shippingFee);
                return Ok(new { success = true, data });
            }
            catch (UnauthorizedAccessException ex)
            {
                return Unauthorized(new { success = false, message = ex.Message });
            }
        }

        /// <summary>
        /// Tính toán áp dụng đồng thời 1 Mã Freeship + 1 Mã Giảm Giá cho Buyer tại trang Thanh toán.
        /// </summary>
        [HttpPost("calculate-stack")]
        [Authorize]
        public async Task<IActionResult> CalculateVoucherStack([FromBody] CalculateVoucherStackRequestDto request)
        {
            try
            {
                int userId = GetCurrentUserId();
                var result = await _voucherService.CalculateVoucherStackAsync(userId, request);
                return Ok(new { success = true, message = result.Message, data = result });
            }
            catch (InvalidOperationException ex)
            {
                return BadRequest(new { success = false, message = ex.Message });
            }
            catch (UnauthorizedAccessException ex)
            {
                return Unauthorized(new { success = false, message = ex.Message });
            }
        }

        // ─────────────────────────────────────────────────────────────────────
        // ADMIN-ONLY ENDPOINTS (Chỉ Admin được tạo / sửa / bật tắt / xóa mã)
        // ─────────────────────────────────────────────────────────────────────

        [HttpGet("admin")]
        [Authorize(Roles = "admin")]
        public async Task<IActionResult> GetAdminVouchers()
        {
            var data = await _voucherService.GetAdminVouchersAsync();
            return Ok(new { success = true, data });
        }

        [HttpPost("admin")]
        [Authorize(Roles = "admin")]
        public async Task<IActionResult> CreateVoucher([FromBody] CreateUpdateVoucherDto dto)
        {
            if (!ModelState.IsValid)
                return BadRequest(ModelState);

            try
            {
                var created = await _voucherService.CreateVoucherByAdminAsync(dto);
                return Ok(new { success = true, message = $"Đã tạo mã ưu đãi {created.Code} thành công!", data = created });
            }
            catch (InvalidOperationException ex)
            {
                return BadRequest(new { success = false, message = ex.Message });
            }
        }

        [HttpPut("admin/{id:int}")]
        [Authorize(Roles = "admin")]
        public async Task<IActionResult> UpdateVoucher(int id, [FromBody] CreateUpdateVoucherDto dto)
        {
            if (!ModelState.IsValid)
                return BadRequest(ModelState);

            try
            {
                var updated = await _voucherService.UpdateVoucherByAdminAsync(id, dto);
                return Ok(new { success = true, message = $"Đã cập nhật mã {updated.Code} thành công!", data = updated });
            }
            catch (KeyNotFoundException ex)
            {
                return NotFound(new { success = false, message = ex.Message });
            }
            catch (InvalidOperationException ex)
            {
                return BadRequest(new { success = false, message = ex.Message });
            }
        }

        [HttpPatch("admin/{id:int}/toggle")]
        [Authorize(Roles = "admin")]
        public async Task<IActionResult> ToggleVoucher(int id)
        {
            try
            {
                var updated = await _voucherService.ToggleVoucherActiveByAdminAsync(id);
                var statusText = updated.IsActive ? "kích hoạt" : "tạm ngưng";
                return Ok(new { success = true, message = $"Đã {statusText} mã {updated.Code}.", data = updated });
            }
            catch (KeyNotFoundException ex)
            {
                return NotFound(new { success = false, message = ex.Message });
            }
        }

        [HttpDelete("admin/{id:int}")]
        [Authorize(Roles = "admin")]
        public async Task<IActionResult> DeleteVoucher(int id)
        {
            var deleted = await _voucherService.DeleteVoucherByAdminAsync(id);
            if (!deleted)
                return NotFound(new { success = false, message = $"Không tìm thấy mã ưu đãi ID={id}." });

            return Ok(new { success = true, message = "Đã xóa/vô hiệu hóa mã ưu đãi thành công." });
        }
    }
}
