using System.Text.Json;
using Backend.Models;
using Backend.Models.DTOs.ReviewDTOs;
using Backend.Models.Enums;
using Backend.Services.NotificationService;
using Microsoft.EntityFrameworkCore;

namespace Backend.Services.ReviewService
{
    public class ReviewService : IReviewService
    {
        private readonly ApplicationDbContext _context;
        private readonly INotificationService _notificationService;
        private readonly ILogger<ReviewService> _logger;

        public ReviewService(
            ApplicationDbContext context,
            INotificationService notificationService,
            ILogger<ReviewService> logger)
        {
            _context = context;
            _notificationService = notificationService;
            _logger = logger;
        }

        public async Task<(bool Success, string Message, ReviewResponseDto? Data)> CreateReviewAsync(
            int userId, CreateReviewDto dto)
        {
            // 1. Kiểm tra đơn hàng tồn tại và thuộc về user
            var order = await _context.Orders
                .Include(o => o.OrderItems)
                .FirstOrDefaultAsync(o => o.OrderId == dto.OrderId && o.UserId == userId);

            if (order == null)
            {
                return (false, "Không tìm thấy đơn hàng của bạn.", null);
            }

            // 2. Kiểm tra trạng thái đơn hàng: Phải là Delivered (Đã giao thành công)
            if (order.OrderStatus != OrderStatus.Delivered)
            {
                return (false, "Bạn chỉ có thể đánh giá sản phẩm khi đơn hàng đã được giao thành công.", null);
            }

            // 3. Kiểm tra sản phẩm có trong đơn hàng không
            var orderItem = order.OrderItems.FirstOrDefault(oi => oi.ProductId == dto.ProductId);
            if (orderItem == null)
            {
                return (false, "Sản phẩm này không nằm trong đơn hàng đã chọn.", null);
            }

            // 4. Kiểm tra xem người dùng đã đánh giá sản phẩm này trong đơn này chưa
            var existingReview = await _context.Reviews
                .AnyAsync(r => r.OrderId == dto.OrderId && r.ProductId == dto.ProductId && r.UserId == userId);

            if (existingReview)
            {
                return (false, "Bạn đã gửi đánh giá cho sản phẩm này trong đơn hàng rồi.", null);
            }

            // 5. Lấy thông tin sản phẩm và Seller sở hữu sản phẩm (Multi-vendor Shopee style)
            var product = await _context.Products
                .Include(p => p.Seller)
                .FirstOrDefaultAsync(p => p.ProductId == dto.ProductId);

            if (product == null)
            {
                return (false, "Sản phẩm không còn tồn tại trên hệ thống.", null);
            }

            int sellerId = product.SellerId;

            // Xử lý JSON danh sách ảnh feedback (nếu có)
            string? imagesJson = null;
            if (dto.Images != null && dto.Images.Any())
            {
                imagesJson = JsonSerializer.Serialize(dto.Images);
            }

            var review = new Review
            {
                OrderId = dto.OrderId,
                ProductId = dto.ProductId,
                UserId = userId,
                SellerId = sellerId,
                ProductVariantId = dto.ProductVariantId ?? orderItem.ProductVariantId,
                Rating = dto.Rating,
                Comment = dto.Comment.Trim(),
                ReviewImagesJson = imagesJson,
                CreatedAt = DateTime.UtcNow
            };

            _context.Reviews.Add(review);
            
            // Cập nhật lại Rating trung bình của sản phẩm
            product.RatingCount += 1;
            var currentTotalRating = (product.RatingCount - 1) * product.AverageRating + (decimal)dto.Rating;
            product.AverageRating = Math.Round(currentTotalRating / product.RatingCount, 2);

            await _context.SaveChangesAsync();

            // 6. Lấy thông tin người mua để tạo nội dung thông báo
            var user = await _context.Users
                .FirstOrDefaultAsync(u => u.UserId == userId);

            string buyerName = !string.IsNullOrWhiteSpace(user?.FullName) ? user.FullName : user?.Email ?? "Khách hàng";

            // 7. Bắn thông báo Realtime cho Seller qua SignalR & Lưu Notification
            string notifTitle = $"Đánh giá mới cho sản phẩm ({review.Rating}★)";
            string notifMessage = $"{buyerName} vừa đánh giá {review.Rating} sao cho sản phẩm \"{product.ProductName}\": \"{(review.Comment.Length > 50 ? review.Comment.Substring(0, 50) + "..." : review.Comment)}\"";

            await _notificationService.CreateAndSendNotificationAsync(
                receiverId: sellerId,
                senderId: userId,
                title: notifTitle,
                message: notifMessage,
                type: "Review",
                referenceId: review.ReviewId.ToString(),
                targetUrl: $"/seller/reviews"
            );

            // DTO trả về
            var resultDto = new ReviewResponseDto
            {
                ReviewId = review.ReviewId,
                OrderId = review.OrderId,
                ProductId = review.ProductId,
                ProductName = product.ProductName,
                UserId = review.UserId,
                UserName = buyerName,
                UserAvatar = user?.ImageUrl,
                SellerId = review.SellerId,
                ProductVariantId = review.ProductVariantId,
                VariantInfo = orderItem.VariantInfo,
                Rating = review.Rating,
                Comment = review.Comment,
                Images = dto.Images ?? new List<string>(),
                CreatedAt = review.CreatedAt
            };

            return (true, "Đánh giá sản phẩm thành công!", resultDto);
        }

        public async Task<(List<ReviewResponseDto> Items, int TotalCount, double AverageRating)> GetProductReviewsAsync(
            int productId, int pageNumber = 1, int pageSize = 10)
        {
            var query = _context.Reviews
                .Include(r => r.User)
                .Include(r => r.Product)
                .Include(r => r.ProductVariant)
                .Where(r => r.ProductId == productId)
                .OrderByDescending(r => r.CreatedAt);

            var totalCount = await query.CountAsync();
            var averageRating = totalCount > 0 ? await query.AverageAsync(r => (double)r.Rating) : 5.0;

            var reviews = await query
                .Skip((pageNumber - 1) * pageSize)
                .Take(pageSize)
                .ToListAsync();

            var items = reviews.Select(r => new ReviewResponseDto
            {
                ReviewId = r.ReviewId,
                OrderId = r.OrderId,
                ProductId = r.ProductId,
                ProductName = r.Product?.ProductName ?? "",
                UserId = r.UserId,
                UserName = !string.IsNullOrWhiteSpace(r.User?.FullName) ? r.User.FullName : r.User?.Email ?? "Ẩn danh",
                UserAvatar = r.User?.ImageUrl,
                SellerId = r.SellerId,
                ProductVariantId = r.ProductVariantId,
                Rating = r.Rating,
                Comment = r.Comment,
                Images = !string.IsNullOrEmpty(r.ReviewImagesJson)
                    ? JsonSerializer.Deserialize<List<string>>(r.ReviewImagesJson) ?? new List<string>()
                    : new List<string>(),
                SellerReply = r.SellerReply,
                SellerRepliedAt = r.SellerRepliedAt,
                CreatedAt = r.CreatedAt,
                UpdatedAt = r.UpdatedAt
            }).ToList();

            return (items, totalCount, Math.Round(averageRating, 1));
        }

        public async Task<bool> CanUserReviewProductAsync(int userId, int orderId, int productId)
        {
            var order = await _context.Orders
                .Include(o => o.OrderItems)
                .FirstOrDefaultAsync(o => o.OrderId == orderId && o.UserId == userId);

            if (order == null || order.OrderStatus != OrderStatus.Delivered)
            {
                return false;
            }

            var hasProduct = order.OrderItems.Any(oi => oi.ProductId == productId);
            if (!hasProduct) return false;

            var reviewed = await _context.Reviews
                .AnyAsync(r => r.OrderId == orderId && r.ProductId == productId && r.UserId == userId);

            return !reviewed;
        }

        public async Task<(List<ReviewResponseDto> Items, int TotalCount)> GetSellerReviewsAsync(
            int sellerId, int pageNumber = 1, int pageSize = 20)
        {
            var query = _context.Reviews
                .Include(r => r.User)
                .Include(r => r.Product)
                .Where(r => r.SellerId == sellerId)
                .OrderByDescending(r => r.CreatedAt);

            var totalCount = await query.CountAsync();
            var reviews = await query
                .Skip((pageNumber - 1) * pageSize)
                .Take(pageSize)
                .ToListAsync();

            var items = reviews.Select(r => new ReviewResponseDto
            {
                ReviewId = r.ReviewId,
                OrderId = r.OrderId,
                ProductId = r.ProductId,
                ProductName = r.Product?.ProductName ?? "",
                UserId = r.UserId,
                UserName = !string.IsNullOrWhiteSpace(r.User?.FullName) ? r.User.FullName : r.User?.Email ?? "Ẩn danh",
                UserAvatar = r.User?.ImageUrl,
                SellerId = r.SellerId,
                ProductVariantId = r.ProductVariantId,
                Rating = r.Rating,
                Comment = r.Comment,
                Images = !string.IsNullOrEmpty(r.ReviewImagesJson)
                    ? JsonSerializer.Deserialize<List<string>>(r.ReviewImagesJson) ?? new List<string>()
                    : new List<string>(),
                SellerReply = r.SellerReply,
                SellerRepliedAt = r.SellerRepliedAt,
                CreatedAt = r.CreatedAt,
                UpdatedAt = r.UpdatedAt
            }).ToList();

            return (items, totalCount);
        }

        public async Task<(bool Success, string Message, ReviewResponseDto? Data)> ReplyReviewAsync(
            int sellerId, int reviewId, string replyComment)
        {
            var review = await _context.Reviews
                .Include(r => r.Product)
                .Include(r => r.User)
                .FirstOrDefaultAsync(r => r.ReviewId == reviewId && r.SellerId == sellerId);

            if (review == null)
            {
                return (false, "Không tìm thấy đánh giá này hoặc bạn không có quyền phản hồi.", null);
            }

            review.SellerReply = replyComment.Trim();
            review.SellerRepliedAt = DateTime.UtcNow;
            review.UpdatedAt = DateTime.UtcNow;

            await _context.SaveChangesAsync();

            // Bắn thông báo Realtime cho Người mua: Shop đã trả lời đánh giá của bạn
            await _notificationService.CreateAndSendNotificationAsync(
                receiverId: review.UserId,
                senderId: sellerId,
                title: "Người bán đã phản hồi đánh giá của bạn",
                message: $"Shop đã trả lời bình luận của bạn về sản phẩm \"{review.Product?.ProductName}\": \"{replyComment}\"",
                type: "ReviewReply",
                referenceId: review.ReviewId.ToString(),
                targetUrl: $"/products/{review.Product?.Slug}"
            );

            var resultDto = new ReviewResponseDto
            {
                ReviewId = review.ReviewId,
                OrderId = review.OrderId,
                ProductId = review.ProductId,
                ProductName = review.Product?.ProductName ?? "",
                UserId = review.UserId,
                SellerId = review.SellerId,
                Rating = review.Rating,
                Comment = review.Comment,
                SellerReply = review.SellerReply,
                SellerRepliedAt = review.SellerRepliedAt,
                CreatedAt = review.CreatedAt,
                UpdatedAt = review.UpdatedAt
            };

            return (true, "Phản hồi đánh giá thành công!", resultDto);
        }
    }
}
