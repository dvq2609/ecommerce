namespace Backend.Models.Enums
{
    public enum VoucherDiscountType
    {
        Percentage = 0,   // Mã giảm giá đơn hàng theo % (có thể kèm MaxDiscountAmount)
        FixedAmount = 1,  // Mã giảm giá đơn hàng số tiền cố định (VNĐ)
        FreeShipping = 2  // Mã miễn/giảm phí vận chuyển (Freeship)
    }
}
