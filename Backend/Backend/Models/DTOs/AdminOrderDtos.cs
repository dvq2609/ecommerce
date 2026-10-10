using System.ComponentModel.DataAnnotations;
using Backend.Models.Enums;

namespace Backend.Models.DTOs
{
    /// <summary>
    /// Tham số tìm kiếm, lọc và phân trang đơn hàng dành cho Admin & Seller
    /// </summary>
    public class AdminOrderQueryDto
    {
        public int PageNumber { get; set; } = 1;
        public int PageSize { get; set; } = 10;
        public OrderStatus? Status { get; set; }
        public PaymentStatus? PaymentStatus { get; set; }
        public PaymentMethod? PaymentMethod { get; set; }
        public string? Search { get; set; } // Tìm theo OrderCode, RecipientName, RecipientPhone
        public DateTime? FromDate { get; set; }
        public DateTime? ToDate { get; set; }
        public string SortBy { get; set; } = "createdAt"; // "createdAt", "finalAmount"
        public bool IsDescending { get; set; } = true;
    }

    /// <summary>
    /// Yêu cầu cập nhật trạng thái đơn hàng từ Admin/Seller
    /// </summary>
    public class AdminUpdateOrderStatusDto
    {
        [Required(ErrorMessage = "Trạng thái mới là bắt buộc.")]
        public OrderStatus NewStatus { get; set; }

        [MaxLength(500, ErrorMessage = "Ghi chú không vượt quá 500 ký tự.")]
        public string? Note { get; set; }
    }

    /// <summary>
    /// Yêu cầu cập nhật trạng thái thanh toán từ Admin/Seller
    /// </summary>
    public class AdminUpdatePaymentStatusDto
    {
        [Required(ErrorMessage = "Trạng thái thanh toán mới là bắt buộc.")]
        public PaymentStatus NewPaymentStatus { get; set; }

        [MaxLength(500, ErrorMessage = "Ghi chú không vượt quá 500 ký tự.")]
        public string? Note { get; set; }
    }

    /// <summary>
    /// DTO thống kê nhanh tổng quan đơn hàng cho Dashboard Admin
    /// </summary>
    public class AdminOrderStatsDto
    {
        public int TotalOrders { get; set; }
        public int PendingOrders { get; set; }
        public int ConfirmedOrders { get; set; }
        public int ProcessingOrders { get; set; }
        public int ShippingOrders { get; set; }
        public int DeliveredOrders { get; set; }
        public int CancelledOrders { get; set; }
        public int RefundedOrders { get; set; }
        public decimal TotalRevenue { get; set; } // Tổng tiền từ các đơn Delivered
    }

    /// <summary>
    /// Chi tiết đơn hàng mở rộng có thông tin tài khoản người đặt dành cho Admin
    /// </summary>
    public class AdminOrderDetailDto : OrderResponseDto
    {
        public string? CustomerName { get; set; }
        public string? CustomerEmail { get; set; }
        public string? CustomerPhone { get; set; }
        public string PaymentStatusName => PaymentStatus switch
        {
            Models.Enums.PaymentStatus.Pending => "Chờ thanh toán",
            Models.Enums.PaymentStatus.Completed => "Đã thanh toán",
            Models.Enums.PaymentStatus.Failed => "Thanh toán thất bại",
            _ => "Không xác định"
        };
    }

    /// <summary>
    /// Kết quả danh sách phân trang đơn hàng dành cho Admin
    /// </summary>
    public class AdminPagedOrderResultDto
    {
        public List<AdminOrderDetailDto> Items { get; set; } = new();
        public int TotalCount { get; set; }
        public int PageNumber { get; set; }
        public int PageSize { get; set; }
        public int TotalPages => (int)Math.Ceiling((double)TotalCount / (PageSize > 0 ? PageSize : 10));
    }
}
