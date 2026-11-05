namespace Backend.Models.DTOs.AnalyticsDTOs
{
    public class AdminDashboardOverviewDto
    {
        public AdminKpiSummaryDto Kpi { get; set; } = new();
        public List<AdminRevenuePointDto> RevenueTrend { get; set; } = new();
        public List<OrderStatusBreakdownDto> OrderStatusBreakdown { get; set; } = new();
        public List<PaymentMethodBreakdownDto> PaymentBreakdown { get; set; } = new();
        public List<TopSellerItemDto> TopSellers { get; set; } = new();
        public List<TopProductItemDto> TopProducts { get; set; } = new();
        public List<VoucherPerformanceItemDto> VoucherPerformance { get; set; } = new();
    }

    public class AdminKpiSummaryDto
    {
        public decimal TotalGmv { get; set; }
        public decimal NetRevenue { get; set; }
        public decimal TotalDiscountGiven { get; set; }
        public decimal TotalShippingCollected { get; set; }
        public decimal AverageOrderValue { get; set; }
        public int TotalOrders { get; set; }
        public int DeliveredOrders { get; set; }
        public int PendingOrders { get; set; }
        public int CancelledOrders { get; set; }
        public double SuccessRate { get; set; }
        public int TotalBuyers { get; set; }
        public int TotalSellers { get; set; }
        public int TotalActiveProducts { get; set; }
        public int TotalVoucherRedemptions { get; set; }
    }

    public class AdminRevenuePointDto
    {
        public string TimeLabel { get; set; } = string.Empty;
        public decimal Gmv { get; set; }
        public decimal NetRevenue { get; set; }
        public int OrderCount { get; set; }
    }

    public class PaymentMethodBreakdownDto
    {
        public string MethodKey { get; set; } = string.Empty;
        public string MethodName { get; set; } = string.Empty;
        public int OrderCount { get; set; }
        public decimal TotalAmount { get; set; }
        public double Percentage { get; set; }
    }

    public class TopSellerItemDto
    {
        public int SellerId { get; set; }
        public string SellerName { get; set; } = string.Empty;
        public string SellerEmail { get; set; } = string.Empty;
        public int ActiveProductCount { get; set; }
        public int OrderCount { get; set; }
        public int TotalItemsSold { get; set; }
        public decimal TotalRevenue { get; set; }
    }

    public class TopProductItemDto
    {
        public int ProductId { get; set; }
        public string ProductName { get; set; } = string.Empty;
        public string CategoryName { get; set; } = string.Empty;
        public string BrandName { get; set; } = string.Empty;
        public string? ImageUrl { get; set; }
        public decimal UnitPrice { get; set; }
        public int TotalSoldQuantity { get; set; }
        public decimal TotalRevenue { get; set; }
    }

    public class VoucherPerformanceItemDto
    {
        public int VoucherId { get; set; }
        public string Code { get; set; } = string.Empty;
        public string Title { get; set; } = string.Empty;
        public int DiscountType { get; set; }
        public decimal DiscountValue { get; set; }
        public int UsedCount { get; set; }
        public int UsageLimit { get; set; }
        public bool IsActive { get; set; }
        public decimal TotalDiscountBooked { get; set; }
        public decimal GeneratedGmv { get; set; }
    }
}
