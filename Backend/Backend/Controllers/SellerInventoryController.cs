using System.Security.Claims;
using Backend.Models.DTOs.InventoryDTOs;
using Backend.Services.InventoryService;
using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;

namespace Backend.Controllers
{
    [ApiController]
    [Route("api/seller/inventory")]
    [Authorize(Roles = "seller,admin")]
    public class SellerInventoryController : ControllerBase
    {
        private readonly ISellerInventoryService _inventoryService;

        public SellerInventoryController(ISellerInventoryService inventoryService)
        {
            _inventoryService = inventoryService;
        }

        private int GetCurrentSellerId()
        {
            var userIdClaim = User.FindFirst("UserId")?.Value ?? User.FindFirst(ClaimTypes.NameIdentifier)?.Value;
            if (int.TryParse(userIdClaim, out int sellerId))
            {
                return sellerId;
            }
            throw new UnauthorizedAccessException("Không xác định được danh tính Seller từ Token.");
        }

        /// <summary>
        /// Lấy danh sách tồn kho biến thể có phân trang, tìm kiếm và lọc trạng thái.
        /// </summary>
        [HttpGet]
        public async Task<IActionResult> GetInventory(
            [FromQuery] string? search,
            [FromQuery] string? stockFilter,
            [FromQuery] int page = 1,
            [FromQuery] int pageSize = 15)
        {
            try
            {
                var sellerId = GetCurrentSellerId();
                var result = await _inventoryService.GetInventoryPagedAsync(sellerId, search, stockFilter, page, pageSize);
                return Ok(new { success = true, data = result });
            }
            catch (Exception ex)
            {
                return BadRequest(new { success = false, message = ex.Message });
            }
        }

        /// <summary>
        /// Lấy thống kê KPI tồn kho (Tổng biến thể, Tổng tồn kho, Sắp hết hàng, Đã hết hàng).
        /// </summary>
        [HttpGet("stats")]
        public async Task<IActionResult> GetStats()
        {
            try
            {
                var sellerId = GetCurrentSellerId();
                var stats = await _inventoryService.GetInventoryStatsAsync(sellerId);
                return Ok(new { success = true, data = stats });
            }
            catch (Exception ex)
            {
                return BadRequest(new { success = false, message = ex.Message });
            }
        }

        /// <summary>
        /// Cập nhật nhanh số lượng tồn kho và giá bán của một biến thể.
        /// </summary>
        [HttpPatch("variants/{variantId:int}/stock")]
        public async Task<IActionResult> UpdateStock(int variantId, [FromBody] UpdateInventoryStockDto dto)
        {
            try
            {
                var sellerId = GetCurrentSellerId();
                var (success, error, data) = await _inventoryService.UpdateStockAsync(sellerId, variantId, dto);
                if (!success)
                {
                    return BadRequest(new { success = false, message = error });
                }

                return Ok(new { success = true, message = "Cập nhật tồn kho thành công.", data });
            }
            catch (Exception ex)
            {
                return BadRequest(new { success = false, message = ex.Message });
            }
        }
    }
}
