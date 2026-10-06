namespace Backend.Models.Enums
{
    public enum PaymentMethod
    {
        COD = 0,          // Thanh toán khi nhận hàng
        VNPay = 1,        // Cổng thanh toán VNPay
        MoMo = 2,         // Ví điện tử MoMo
        BankTransfer = 3  // Chuyển khoản ngân hàng
    }
}
