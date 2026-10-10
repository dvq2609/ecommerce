namespace Backend.Models.DTOs.AnalyticsDTOs
{
    public class SellerKpiDto
    {
        public decimal TotalRevenue { get; set; }        // Doanh thu thực tế (Delivered)
        public int TotalOrders { get; set; }             // Tổng số đơn liên quan
        public int DeliveredOrders { get; set; }         // Số đơn hoàn thành
        public decimal AverageOrderValue { get; set; }   // Giá trị trung bình mỗi đơn (AOV)
        public double SuccessRate { get; set; }          // Tỷ lệ giao thành công (%)
    }

    public class RevenueChartPointDto
    {
        public string TimeLabel { get; set; } = string.Empty; // "10/10", "11/10" hoặc "Tháng 10"
        public decimal Revenue { get; set; }                 // Doanh thu trong mốc thời gian đó
        public int OrderCount { get; set; }                  // Số đơn trong mốc thời gian đó
    }

    public class OrderStatusBreakdownDto
    {
        public string StatusKey { get; set; } = string.Empty; // "Delivered", "Shipping", "Pending", "Cancelled"
        public string StatusName { get; set; } = string.Empty; // "Đã giao thành công", "Đang vận chuyển", ...
        public int Count { get; set; }
        public double Percentage { get; set; }
        public string ColorHex { get; set; } = string.Empty; // Màu biểu diễn trên Donut Chart
    }
}
