using System.ComponentModel.DataAnnotations;
using Backend.Models.Enums;

namespace Backend.Models.DTOs
{
    public class OrderItemRequestDto
    {
        [Required(ErrorMessage = "ProductId là bắt buộc.")]
        public int ProductId { get; set; }

        public int? ProductVariantId { get; set; }

        [Range(1, 100, ErrorMessage = "Số lượng phải từ 1 đến 100.")]
        public int Quantity { get; set; } = 1;
    }

    public class CreateOrderRequestDto
    {
        [Required(ErrorMessage = "Tên người nhận không được để trống.")]
        [MaxLength(100, ErrorMessage = "Tên người nhận không vượt quá 100 ký tự.")]
        public string RecipientName { get; set; } = string.Empty;

        [Required(ErrorMessage = "Số điện thoại người nhận không được để trống.")]
        [RegularExpression(@"^(0[3|5|7|8|9])[0-9]{8}$", ErrorMessage = "Số điện thoại không hợp lệ (định dạng 10 số Việt Nam).")]
        public string RecipientPhone { get; set; } = string.Empty;

        [Required(ErrorMessage = "Địa chỉ nhận hàng không được để trống.")]
        [MaxLength(500, ErrorMessage = "Địa chỉ nhận hàng không vượt quá 500 ký tự.")]
        public string ShippingAddress { get; set; } = string.Empty;

        [MaxLength(1000, ErrorMessage = "Ghi chú không vượt quá 1000 ký tự.")]
        public string? Note { get; set; }

        public PaymentMethod PaymentMethod { get; set; } = PaymentMethod.COD;

        /// <summary>
        /// Danh sách sản phẩm mua. Nếu null hoặc rỗng, hệ thống sẽ lấy toàn bộ sản phẩm trong giỏ hàng.
        /// </summary>
        public List<OrderItemRequestDto>? Items { get; set; }

        /// <summary>
        /// Tùy chọn lưu địa chỉ này làm địa chỉ mặc định trong hồ sơ cá nhân.
        /// </summary>
        public bool SaveToProfile { get; set; } = true;
    }

    public class OrderItemResponseDto
    {
        public int OrderItemId { get; set; }
        public int OrderId { get; set; }
        public int ProductId { get; set; }
        public int? ProductVariantId { get; set; }
        public string ProductName { get; set; } = string.Empty;
        public string? VariantInfo { get; set; }
        public string? ProductImageUrl { get; set; }
        public decimal UnitPrice { get; set; }
        public int Quantity { get; set; }
        public decimal TotalPrice { get; set; }
    }

    public class OrderResponseDto
    {
        public int OrderId { get; set; }
        public int UserId { get; set; }
        public string OrderCode { get; set; } = string.Empty;
        public string RecipientName { get; set; } = string.Empty;
        public string RecipientPhone { get; set; } = string.Empty;
        public string ShippingAddress { get; set; } = string.Empty;
        public string? Note { get; set; }

        public decimal TotalAmount { get; set; }
        public decimal ShippingFee { get; set; }
        public decimal DiscountAmount { get; set; }
        public decimal FinalAmount { get; set; }

        public PaymentMethod PaymentMethod { get; set; }
        public string PaymentMethodName => PaymentMethod switch
        {
            PaymentMethod.COD => "Thanh toán khi nhận hàng (COD)",
            PaymentMethod.VNPay => "Cổng thanh toán VNPay",
            PaymentMethod.MoMo => "Ví điện tử MoMo",
            _ => "Khác"
        };

        public PaymentStatus PaymentStatus { get; set; }
        public OrderStatus OrderStatus { get; set; }
        public string OrderStatusName => OrderStatus switch
        {
            OrderStatus.Pending => "Chờ xác nhận",
            OrderStatus.Confirmed => "Đã xác nhận",
            OrderStatus.Processing => "Đang xử lý đóng gói",
            OrderStatus.Shipping => "Đang giao hàng",
            OrderStatus.Delivered => "Đã giao thành công",
            OrderStatus.Cancelled => "Đã hủy",
            OrderStatus.Refunded => "Đã hoàn tiền",
            _ => "Không xác định"
        };

        public DateTime? PaymentDate { get; set; }
        public DateTime CreatedAt { get; set; }
        public DateTime? UpdatedAt { get; set; }

        public List<OrderItemResponseDto> OrderItems { get; set; } = new();
    }

    public class OrderQueryDto
    {
        public int PageNumber { get; set; } = 1;
        public int PageSize { get; set; } = 10;
        public OrderStatus? Status { get; set; }
        public string? Search { get; set; }
    }

    public class CancelOrderRequestDto
    {
        [MaxLength(500, ErrorMessage = "Lý do hủy không vượt quá 500 ký tự.")]
        public string? Reason { get; set; }
    }

    public class PagedOrderResultDto
    {
        public List<OrderResponseDto> Items { get; set; } = new();
        public int TotalCount { get; set; }
        public int PageNumber { get; set; }
        public int PageSize { get; set; }
        public int TotalPages => (int)Math.Ceiling((double)TotalCount / (PageSize > 0 ? PageSize : 10));
    }
}
