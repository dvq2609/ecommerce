using Backend.Models.DTOs.ReviewDTOs;

namespace Backend.Services.ReviewService
{
    public interface IReviewService
    {
        Task<(bool Success, string Message, ReviewResponseDto? Data)> CreateReviewAsync(int userId, CreateReviewDto dto);

        Task<(List<ReviewResponseDto> Items, int TotalCount, double AverageRating)> GetProductReviewsAsync(
            int productId, int pageNumber = 1, int pageSize = 10);

        Task<bool> CanUserReviewProductAsync(int userId, int orderId, int productId);

        Task<(List<ReviewResponseDto> Items, int TotalCount)> GetSellerReviewsAsync(
            int sellerId, int pageNumber = 1, int pageSize = 20);

        Task<(bool Success, string Message, ReviewResponseDto? Data)> ReplyReviewAsync(
            int sellerId, int reviewId, string replyComment);
    }
}
