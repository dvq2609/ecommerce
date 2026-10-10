using Backend.Models.DTOs.ReviewDTOs;
using Backend.Services.ReviewService;
using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;

namespace Backend.Controllers
{
    [ApiController]
    [Route("api/[controller]")]
    public class ReviewsController : ControllerBase
    {
        private readonly IReviewService _reviewService;

        public ReviewsController(IReviewService reviewService)
        {
            _reviewService = reviewService;
        }

        private int GetCurrentUserId()
        {
            var claim = User.FindFirst("UserId")?.Value;
            return int.TryParse(claim, out var id) ? id : 0;
        }

        /// <summary>
        /// Tạo đánh giá sản phẩm từ đơn hàng đã giao thành công (Yêu cầu đăng nhập)
        /// </summary>
        [HttpPost]
        [Authorize]
        public async Task<IActionResult> CreateReview([FromBody] CreateReviewDto dto)
        {
            if (!ModelState.IsValid)
            {
                return BadRequest(ModelState);
            }

            var userId = GetCurrentUserId();
            if (userId == 0) return Unauthorized(new { message = "Không xác định được danh tính người dùng." });

            var (success, message, data) = await _reviewService.CreateReviewAsync(userId, dto);
            if (!success)
            {
                return BadRequest(new { success = false, message });
            }

            return StatusCode(201, new { success = true, message, data });
        }

        /// <summary>
        /// Lấy danh sách đánh giá công khai của 1 sản phẩm
        /// </summary>
        [HttpGet("product/{productId}")]
        public async Task<IActionResult> GetProductReviews(int productId, [FromQuery] int pageNumber = 1, [FromQuery] int pageSize = 10)
        {
            var (items, totalCount, averageRating) = await _reviewService.GetProductReviewsAsync(productId, pageNumber, pageSize);
            return Ok(new
            {
                success = true,
                data = new
                {
                    items,
                    totalCount,
                    averageRating,
                    pageNumber,
                    pageSize
                }
            });
        }

        /// <summary>
        /// Kiểm tra xem người dùng hiện tại có được quyền đánh giá sản phẩm trong đơn hàng này không
        /// </summary>
        [HttpGet("can-review/{orderId}/{productId}")]
        [Authorize]
        public async Task<IActionResult> CanReview(int orderId, int productId)
        {
            var userId = GetCurrentUserId();
            if (userId == 0) return Unauthorized();

            var canReview = await _reviewService.CanUserReviewProductAsync(userId, orderId, productId);
            return Ok(new { success = true, canReview });
        }

        /// <summary>
        /// Người bán xem các đánh giá về các sản phẩm của shop mình (kèm bộ lọc)
        /// </summary>
        [HttpGet("seller")]
        [Authorize(Roles = "seller,admin")]
        public async Task<IActionResult> GetSellerReviews(
            [FromQuery] int pageNumber = 1,
            [FromQuery] int pageSize = 20,
            [FromQuery] int? rating = null,
            [FromQuery] bool? hasReplied = null)
        {
            var sellerId = GetCurrentUserId();
            if (sellerId == 0) return Unauthorized();

            var (items, totalCount) = await _reviewService.GetSellerReviewsAsync(sellerId, pageNumber, pageSize, rating, hasReplied);
            return Ok(new
            {
                success = true,
                data = new
                {
                    items,
                    totalCount,
                    pageNumber,
                    pageSize
                }
            });
        }

        /// <summary>
        /// Lấy thống kê KPI đánh giá của Shop
        /// </summary>
        [HttpGet("seller/stats")]
        [Authorize(Roles = "seller,admin")]
        public async Task<IActionResult> GetSellerReviewStats()
        {
            var sellerId = GetCurrentUserId();
            if (sellerId == 0) return Unauthorized();

            var stats = await _reviewService.GetSellerReviewsStatsAsync(sellerId);
            return Ok(new { success = true, data = stats });
        }

        /// <summary>
        /// Người bán trả lời đánh giá của khách hàng
        /// </summary>
        [HttpPost("{reviewId}/reply")]
        [Authorize(Roles = "seller,admin")]
        public async Task<IActionResult> ReplyReview(int reviewId, [FromBody] SellerReplyReviewDto dto)
        {
            if (!ModelState.IsValid)
            {
                return BadRequest(ModelState);
            }

            var sellerId = GetCurrentUserId();
            if (sellerId == 0) return Unauthorized();

            var (success, message, data) = await _reviewService.ReplyReviewAsync(sellerId, reviewId, dto.ReplyComment);
            if (!success)
            {
                return BadRequest(new { success = false, message });
            }

            return Ok(new { success = true, message, data });
        }
    }
}
