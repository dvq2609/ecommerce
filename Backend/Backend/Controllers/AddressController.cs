using System.Security.Claims;
using Backend.Models.DTOs;
using Backend.Services.AddressService;
using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;

namespace Backend.Controllers
{
    [ApiController]
    [Route("api/[controller]")]
    [Authorize]
    public class AddressController : ControllerBase
    {
        private readonly IAddressService _addressService;
        private readonly ILogger<AddressController> _logger;

        public AddressController(IAddressService addressService, ILogger<AddressController> logger)
        {
            _addressService = addressService;
            _logger = logger;
        }

        private int GetCurrentUserId()
        {
            var userIdClaim = User.FindFirst(ClaimTypes.NameIdentifier)?.Value
                              ?? User.FindFirst("UserId")?.Value;

            if (int.TryParse(userIdClaim, out var userId))
                return userId;

            throw new UnauthorizedAccessException("Không xác định được danh tính người dùng từ token.");
        }

        /// <summary>
        /// Lấy toàn bộ danh sách địa chỉ nhận hàng của người dùng hiện tại
        /// </summary>
        [HttpGet]
        public async Task<IActionResult> GetMyAddresses(CancellationToken cancellationToken)
        {
            try
            {
                int userId = GetCurrentUserId();
                var addresses = await _addressService.GetUserAddressesAsync(userId, cancellationToken);
                return Ok(new { success = true, data = addresses });
            }
            catch (UnauthorizedAccessException ex)
            {
                return Unauthorized(new { success = false, message = ex.Message });
            }
        }

        /// <summary>
        /// Lấy chi tiết một địa chỉ nhận hàng
        /// </summary>
        [HttpGet("{id:int}")]
        public async Task<IActionResult> GetAddressById(int id, CancellationToken cancellationToken)
        {
            try
            {
                int userId = GetCurrentUserId();
                var address = await _addressService.GetAddressByIdAsync(id, userId, cancellationToken);
                if (address == null)
                {
                    return NotFound(new { success = false, message = $"Không tìm thấy địa chỉ #{id}." });
                }

                return Ok(new { success = true, data = address });
            }
            catch (UnauthorizedAccessException ex)
            {
                return Unauthorized(new { success = false, message = ex.Message });
            }
        }

        /// <summary>
        /// Lấy địa chỉ mặc định của người dùng
        /// </summary>
        [HttpGet("default")]
        public async Task<IActionResult> GetDefaultAddress(CancellationToken cancellationToken)
        {
            try
            {
                int userId = GetCurrentUserId();
                var address = await _addressService.GetDefaultAddressAsync(userId, cancellationToken);
                return Ok(new { success = true, data = address });
            }
            catch (UnauthorizedAccessException ex)
            {
                return Unauthorized(new { success = false, message = ex.Message });
            }
        }

        /// <summary>
        /// Thêm mới một địa chỉ nhận hàng
        /// </summary>
        [HttpPost]
        public async Task<IActionResult> CreateAddress([FromBody] CreateAddressRequestDto request, CancellationToken cancellationToken)
        {
            if (!ModelState.IsValid) return BadRequest(ModelState);

            try
            {
                int userId = GetCurrentUserId();
                var created = await _addressService.CreateAddressAsync(userId, request, cancellationToken);
                return StatusCode(201, new { success = true, message = "Thêm địa chỉ mới thành công.", data = created });
            }
            catch (UnauthorizedAccessException ex)
            {
                return Unauthorized(new { success = false, message = ex.Message });
            }
        }

        /// <summary>
        /// Cập nhật địa chỉ nhận hàng
        /// </summary>
        [HttpPut("{id:int}")]
        public async Task<IActionResult> UpdateAddress(int id, [FromBody] UpdateAddressRequestDto request, CancellationToken cancellationToken)
        {
            if (!ModelState.IsValid) return BadRequest(ModelState);

            try
            {
                int userId = GetCurrentUserId();
                var updated = await _addressService.UpdateAddressAsync(id, userId, request, cancellationToken);
                if (updated == null)
                {
                    return NotFound(new { success = false, message = $"Không tìm thấy địa chỉ #{id} để cập nhật." });
                }

                return Ok(new { success = true, message = "Cập nhật địa chỉ thành công.", data = updated });
            }
            catch (UnauthorizedAccessException ex)
            {
                return Unauthorized(new { success = false, message = ex.Message });
            }
        }

        /// <summary>
        /// Đặt một địa chỉ làm địa chỉ mặc định
        /// </summary>
        [HttpPut("{id:int}/default")]
        public async Task<IActionResult> SetDefaultAddress(int id, CancellationToken cancellationToken)
        {
            try
            {
                int userId = GetCurrentUserId();
                var success = await _addressService.SetDefaultAddressAsync(id, userId, cancellationToken);
                if (!success)
                {
                    return NotFound(new { success = false, message = $"Không tìm thấy địa chỉ #{id}." });
                }

                return Ok(new { success = true, message = "Đã đặt làm địa chỉ mặc định." });
            }
            catch (UnauthorizedAccessException ex)
            {
                return Unauthorized(new { success = false, message = ex.Message });
            }
        }

        /// <summary>
        /// Xóa một địa chỉ nhận hàng
        /// </summary>
        [HttpDelete("{id:int}")]
        public async Task<IActionResult> DeleteAddress(int id, CancellationToken cancellationToken)
        {
            try
            {
                int userId = GetCurrentUserId();
                var success = await _addressService.DeleteAddressAsync(id, userId, cancellationToken);
                if (!success)
                {
                    return NotFound(new { success = false, message = $"Không tìm thấy địa chỉ #{id}." });
                }

                return Ok(new { success = true, message = "Đã xóa địa chỉ thành công." });
            }
            catch (UnauthorizedAccessException ex)
            {
                return Unauthorized(new { success = false, message = ex.Message });
            }
        }
    }
}
