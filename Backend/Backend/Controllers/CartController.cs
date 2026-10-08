using System.Security.Claims;
using Backend.Models.DTOs;
using Backend.Services.CartService;
using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;

namespace Backend.Controllers
{
    [ApiController]
    [Route("api/[controller]")]
    [Authorize]
    public class CartController : ControllerBase
    {
        private readonly ICartService _cartService;

        public CartController(ICartService cartService)
        {
            _cartService = cartService;
        }

        private int GetCurrentUserId()
        {
            var userIdClaim = User.FindFirst("UserId")?.Value 
                ?? User.FindFirst(ClaimTypes.NameIdentifier)?.Value;

            if (int.TryParse(userIdClaim, out int userId))
            {
                return userId;
            }

            throw new UnauthorizedAccessException("Không xác định được danh tính người dùng từ token.");
        }

        /// <summary>
        /// Lấy chi tiết giỏ hàng của người dùng đang đăng nhập.
        /// </summary>
        [HttpGet]
        public async Task<IActionResult> GetCart()
        {
            try
            {
                int userId = GetCurrentUserId();
                var cart = await _cartService.GetCartByUserIdAsync(userId);
                return Ok(new { success = true, data = cart });
            }
            catch (UnauthorizedAccessException ex)
            {
                return Unauthorized(new { success = false, message = ex.Message });
            }
        }

        /// <summary>
        /// Thêm sản phẩm (kèm biến thể nếu có) vào giỏ hàng.
        /// </summary>
        [HttpPost("items")]
        public async Task<IActionResult> AddItem([FromBody] AddToCartRequestDto dto)
        {
            if (!ModelState.IsValid)
            {
                return BadRequest(new { success = false, errors = ModelState });
            }

            try
            {
                int userId = GetCurrentUserId();
                var (success, error, data) = await _cartService.AddToCartAsync(userId, dto);

                if (!success)
                {
                    return BadRequest(new { success = false, message = error });
                }

                return Ok(new { success = true, message = "Đã thêm sản phẩm vào giỏ hàng thành công.", data });
            }
            catch (UnauthorizedAccessException ex)
            {
                return Unauthorized(new { success = false, message = ex.Message });
            }
        }

        /// <summary>
        /// Cập nhật số lượng của một món hàng trong giỏ.
        /// </summary>
        [HttpPut("items/{cartItemId:int}")]
        public async Task<IActionResult> UpdateQuantity(int cartItemId, [FromBody] UpdateCartItemRequestDto dto)
        {
            if (!ModelState.IsValid)
            {
                return BadRequest(new { success = false, errors = ModelState });
            }

            try
            {
                int userId = GetCurrentUserId();
                var (success, error, data) = await _cartService.UpdateCartItemQuantityAsync(userId, cartItemId, dto.Quantity);

                if (!success)
                {
                    return BadRequest(new { success = false, message = error });
                }

                return Ok(new { success = true, message = "Đã cập nhật số lượng món hàng.", data });
            }
            catch (UnauthorizedAccessException ex)
            {
                return Unauthorized(new { success = false, message = ex.Message });
            }
        }

        /// <summary>
        /// Xóa một món hàng khỏi giỏ hàng.
        /// </summary>
        [HttpDelete("items/{cartItemId:int}")]
        public async Task<IActionResult> RemoveItem(int cartItemId)
        {
            try
            {
                int userId = GetCurrentUserId();
                var (success, error, data) = await _cartService.RemoveCartItemAsync(userId, cartItemId);

                if (!success)
                {
                    return BadRequest(new { success = false, message = error });
                }

                return Ok(new { success = true, message = "Đã xóa món hàng khỏi giỏ.", data });
            }
            catch (UnauthorizedAccessException ex)
            {
                return Unauthorized(new { success = false, message = ex.Message });
            }
        }

        /// <summary>
        /// Xóa toàn bộ sản phẩm trong giỏ hàng.
        /// </summary>
        [HttpDelete("clear")]
        public async Task<IActionResult> ClearCart()
        {
            try
            {
                int userId = GetCurrentUserId();
                var (success, error, data) = await _cartService.ClearCartAsync(userId);

                if (!success)
                {
                    return BadRequest(new { success = false, message = error });
                }

                return Ok(new { success = true, message = "Đã dọn sạch giỏ hàng.", data });
            }
            catch (UnauthorizedAccessException ex)
            {
                return Unauthorized(new { success = false, message = ex.Message });
            }
        }
    }
}
