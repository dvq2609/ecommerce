using System.ComponentModel.DataAnnotations;

namespace Backend.Models.DTOs.ReviewDTOs
{
    public class CreateReviewDto
    {
        [Required(ErrorMessage = "Mã đơn hàng không được để trống.")]
        public int OrderId { get; set; }

        [Required(ErrorMessage = "Mã sản phẩm không được để trống.")]
        public int ProductId { get; set; }

        public int? ProductVariantId { get; set; }

        [Required(ErrorMessage = "Vui lòng chọn số sao đánh giá.")]
        [Range(1, 5, ErrorMessage = "Số sao đánh giá phải từ 1 đến 5 sao.")]
        public int Rating { get; set; }

        [Required(ErrorMessage = "Vui lòng nhập nhận xét chi tiết.")]
        [MinLength(5, ErrorMessage = "Nhận xét tối thiểu 5 ký tự.")]
        [MaxLength(2000, ErrorMessage = "Nhận xét không vượt quá 2000 ký tự.")]
        public string Comment { get; set; } = string.Empty;

        // Danh sách ảnh thực tế do khách upload (Tùy chọn - Optional)
        public List<string>? Images { get; set; }
    }

    public class ReviewResponseDto
    {
        public int ReviewId { get; set; }
        public int OrderId { get; set; }
        public int ProductId { get; set; }
        public string ProductName { get; set; } = string.Empty;
        public int UserId { get; set; }
        public string UserName { get; set; } = string.Empty;
        public string? UserAvatar { get; set; }
        public int SellerId { get; set; }
        public int? ProductVariantId { get; set; }
        public string? VariantInfo { get; set; }
        public int Rating { get; set; }
        public string Comment { get; set; } = string.Empty;
        public List<string> Images { get; set; } = new();
        public string? SellerReply { get; set; }
        public DateTime? SellerRepliedAt { get; set; }
        public DateTime CreatedAt { get; set; }
        public DateTime? UpdatedAt { get; set; }
    }

    public class SellerReplyReviewDto
    {
        [Required(ErrorMessage = "Nội dung phản hồi không được để trống.")]
        [MaxLength(2000, ErrorMessage = "Phản hồi không vượt quá 2000 ký tự.")]
        public string ReplyComment { get; set; } = string.Empty;
    }
}
