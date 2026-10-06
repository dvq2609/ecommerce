namespace Backend.Models.Enums
{
    public enum OrderStatus
    {
        Pending = 0,      // Chờ xác nhận
        Confirmed = 1,    // Đã xác nhận
        Processing = 2,   // Đang đóng gói
        Shipping = 3,     // Đang vận chuyển
        Delivered = 4,    // Giao thành công
        Cancelled = 5,    // Đã hủy
        Refunded = 6      // Đã hoàn tiền
    }
}
