namespace Backend.Models.DTOs
{
    public class PaymentStatusResponseDto
    {
        public string OrderCode { get; set; } = string.Empty;
        public string PaymentStatus { get; set; } = "Pending"; // "Pending", "Completed", "Failed"
        public string OrderStatus { get; set; } = "Pending";
        public bool IsPaid { get; set; }
        public decimal Amount { get; set; }
        public DateTime? PaidAt { get; set; }
        public string? TransactionRef { get; set; }
    }

    public class MoMoCreateResponseDto
    {
        public string? PartnerCode { get; set; }
        public string? OrderId { get; set; }
        public string? RequestId { get; set; }
        public long Amount { get; set; }
        public long ResponseTime { get; set; }
        public string? Message { get; set; }
        public int ResultCode { get; set; }
        public string? PayUrl { get; set; }
        public string? Deeplink { get; set; }
        public string? QrCodeUrl { get; set; }
    }

    public class MoMoIpnRequestDto
    {
        public string? PartnerCode { get; set; }
        public string? OrderId { get; set; }
        public string? RequestId { get; set; }
        public long Amount { get; set; }
        public string? OrderInfo { get; set; }
        public string? OrderType { get; set; }
        public long TransId { get; set; }
        public int ResultCode { get; set; }
        public string? Message { get; set; }
        public string? PayType { get; set; }
        public long ResponseTime { get; set; }
        public string? ExtraData { get; set; }
        public string? Signature { get; set; }
    }

    public class MoMoQueryResponseDto
    {
        public string? PartnerCode { get; set; }
        public string? OrderId { get; set; }
        public string? RequestId { get; set; }
        public string? ExtraData { get; set; }
        public long Amount { get; set; }
        public long TransId { get; set; }
        public string? PayType { get; set; }
        public int ResultCode { get; set; }
        public string? Message { get; set; }
        public long ResponseTime { get; set; }
    }
}
