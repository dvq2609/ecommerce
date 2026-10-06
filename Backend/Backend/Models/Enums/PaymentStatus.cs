namespace Backend.Models.Enums
{
    public enum PaymentStatus
    {
        Pending = 0,    // Đang chờ thanh toán
        Completed = 1,  // Đã thanh toán thành công
        Failed = 2,     // Thanh toán thất bại
        Refunded = 3    // Đã hoàn tiền
    }
}
