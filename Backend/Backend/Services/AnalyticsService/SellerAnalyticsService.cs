using Backend.Models;
using Backend.Models.DTOs.AnalyticsDTOs;
using Backend.Models.Enums;
using Microsoft.EntityFrameworkCore;

namespace Backend.Services.AnalyticsService
{
    public class SellerAnalyticsService : ISellerAnalyticsService
    {
        private readonly ApplicationDbContext _context;

        public SellerAnalyticsService(ApplicationDbContext context)
        {
            _context = context;
        }

        public async Task<SellerKpiDto> GetSellerKpiAsync(int sellerId, string period)
        {
            var (startDate, endDate) = ResolvePeriodDates(period);

            // 1. Lấy tất cả OrderItems của các sản phẩm thuộc Seller này
            var query = _context.OrderItems
                .Include(oi => oi.Order)
                .Include(oi => oi.Product)
                .Where(oi => oi.Product.SellerId == sellerId);

            if (startDate.HasValue)
            {
                query = query.Where(oi => oi.Order.CreatedAt >= startDate.Value);
            }

            var items = await query.ToListAsync();

            if (items.Count == 0)
            {
                return new SellerKpiDto
                {
                    TotalRevenue = 0,
                    TotalOrders = 0,
                    DeliveredOrders = 0,
                    AverageOrderValue = 0,
                    SuccessRate = 100
                };
            }

            // Doanh thu tính trên các đơn hàng Delivered
            var deliveredItems = items.Where(oi => oi.Order.OrderStatus == OrderStatus.Delivered).ToList();
            var totalRevenue = deliveredItems.Sum(oi => oi.TotalPrice);

            // Số đơn hàng distinct
            var allOrderIds = items.Select(oi => oi.OrderId).Distinct().ToList();
            var deliveredOrderIds = deliveredItems.Select(oi => oi.OrderId).Distinct().ToList();

            var totalOrdersCount = allOrderIds.Count;
            var deliveredOrdersCount = deliveredOrderIds.Count;

            var aov = deliveredOrdersCount > 0 ? Math.Round(totalRevenue / deliveredOrdersCount, 0) : 0;
            var successRate = totalOrdersCount > 0 ? Math.Round(((double)deliveredOrdersCount / totalOrdersCount) * 100, 1) : 100;

            return new SellerKpiDto
            {
                TotalRevenue = totalRevenue,
                TotalOrders = totalOrdersCount,
                DeliveredOrders = deliveredOrdersCount,
                AverageOrderValue = aov,
                SuccessRate = successRate
            };
        }

        public async Task<List<RevenueChartPointDto>> GetRevenueChartAsync(int sellerId, string period)
        {
            var p = (period ?? "7days").ToLower();
            var now = DateTime.UtcNow;

            var itemsQuery = _context.OrderItems
                .Include(oi => oi.Order)
                .Include(oi => oi.Product)
                .Where(oi => oi.Product.SellerId == sellerId && oi.Order.OrderStatus == OrderStatus.Delivered);

            var result = new List<RevenueChartPointDto>();

            if (p == "today")
            {
                var startOfToday = new DateTime(now.Year, now.Month, now.Day, 0, 0, 0, DateTimeKind.Utc);
                var items = await itemsQuery.Where(oi => oi.Order.CreatedAt >= startOfToday).ToListAsync();

                // Nhóm theo từng block 4 tiếng: 0h-4h, 4h-8h, 8h-12h, 12h-16h, 16h-20h, 20h-24h
                for (int h = 0; h < 24; h += 4)
                {
                    var blockStart = startOfToday.AddHours(h);
                    var blockEnd = blockStart.AddHours(4);
                    var inBlock = items.Where(oi => oi.Order.CreatedAt >= blockStart && oi.Order.CreatedAt < blockEnd).ToList();

                    result.Add(new RevenueChartPointDto
                    {
                        TimeLabel = $"{h:D2}:00",
                        Revenue = inBlock.Sum(oi => oi.TotalPrice),
                        OrderCount = inBlock.Select(oi => oi.OrderId).Distinct().Count()
                    });
                }
            }
            else if (p == "30days")
            {
                var startDate = now.Date.AddDays(-29);
                var items = await itemsQuery.Where(oi => oi.Order.CreatedAt >= startDate).ToListAsync();

                for (int i = 0; i < 30; i++)
                {
                    var curDate = startDate.AddDays(i);
                    var nextDate = curDate.AddDays(1);
                    var inDay = items.Where(oi => oi.Order.CreatedAt >= curDate && oi.Order.CreatedAt < nextDate).ToList();

                    result.Add(new RevenueChartPointDto
                    {
                        TimeLabel = curDate.ToString("dd/MM"),
                        Revenue = inDay.Sum(oi => oi.TotalPrice),
                        OrderCount = inDay.Select(oi => oi.OrderId).Distinct().Count()
                    });
                }
            }
            else if (p == "1year" || p == "12months")
            {
                var startOfMonth = new DateTime(now.Year, now.Month, 1, 0, 0, 0, DateTimeKind.Utc).AddMonths(-11);
                var items = await itemsQuery.Where(oi => oi.Order.CreatedAt >= startOfMonth).ToListAsync();

                for (int m = 0; m < 12; m++)
                {
                    var curMonth = startOfMonth.AddMonths(m);
                    var nextMonth = curMonth.AddMonths(1);
                    var inMonth = items.Where(oi => oi.Order.CreatedAt >= curMonth && oi.Order.CreatedAt < nextMonth).ToList();

                    result.Add(new RevenueChartPointDto
                    {
                        TimeLabel = $"T{curMonth.Month}",
                        Revenue = inMonth.Sum(oi => oi.TotalPrice),
                        OrderCount = inMonth.Select(oi => oi.OrderId).Distinct().Count()
                    });
                }
            }
            else // Default: 7days
            {
                var startDate = now.Date.AddDays(-6);
                var items = await itemsQuery.Where(oi => oi.Order.CreatedAt >= startDate).ToListAsync();

                for (int i = 0; i < 7; i++)
                {
                    var curDate = startDate.AddDays(i);
                    var nextDate = curDate.AddDays(1);
                    var inDay = items.Where(oi => oi.Order.CreatedAt >= curDate && oi.Order.CreatedAt < nextDate).ToList();

                    result.Add(new RevenueChartPointDto
                    {
                        TimeLabel = curDate.ToString("dd/MM"),
                        Revenue = inDay.Sum(oi => oi.TotalPrice),
                        OrderCount = inDay.Select(oi => oi.OrderId).Distinct().Count()
                    });
                }
            }

            return result;
        }

        public async Task<List<OrderStatusBreakdownDto>> GetOrderStatusBreakdownAsync(int sellerId)
        {
            // Lấy danh sách các đơn hàng phân biệt có chứa sản phẩm của Seller
            var orders = await _context.OrderItems
                .Include(oi => oi.Order)
                .Include(oi => oi.Product)
                .Where(oi => oi.Product.SellerId == sellerId)
                .Select(oi => new { oi.OrderId, oi.Order.OrderStatus })
                .Distinct()
                .ToListAsync();

            int totalOrders = orders.Count;

            var statusConfigs = new List<(OrderStatus Status, string Key, string Name, string Color)>
            {
                (OrderStatus.Delivered, "Delivered", "Đã giao thành công", "#16a34a"),
                (OrderStatus.Shipping, "Shipping", "Đang giao hàng", "#0284c7"),
                (OrderStatus.Processing, "Processing", "Đang đóng gói", "#8b5cf6"),
                (OrderStatus.Confirmed, "Confirmed", "Đã xác nhận", "#d97706"),
                (OrderStatus.Pending, "Pending", "Chờ xác nhận", "#ea580c"),
                (OrderStatus.Cancelled, "Cancelled", "Đã hủy đơn", "#dc2626"),
                (OrderStatus.Refunded, "Refunded", "Đã hoàn tiền", "#6b7280"),
            };

            var list = new List<OrderStatusBreakdownDto>();

            foreach (var cfg in statusConfigs)
            {
                int count = orders.Count(o => o.OrderStatus == cfg.Status);
                double pct = totalOrders > 0 ? Math.Round(((double)count / totalOrders) * 100, 1) : 0;

                list.Add(new OrderStatusBreakdownDto
                {
                    StatusKey = cfg.Key,
                    StatusName = cfg.Name,
                    Count = count,
                    Percentage = pct,
                    ColorHex = cfg.Color
                });
            }

            return list;
        }

        private static (DateTime? StartDate, DateTime? EndDate) ResolvePeriodDates(string period)
        {
            var p = (period ?? "7days").ToLower();
            var now = DateTime.UtcNow;

            switch (p)
            {
                case "today":
                    return (new DateTime(now.Year, now.Month, now.Day, 0, 0, 0, DateTimeKind.Utc), now);
                case "7days":
                    return (now.Date.AddDays(-6), now);
                case "30days":
                    return (now.Date.AddDays(-29), now);
                case "1year":
                case "12months":
                    return (now.Date.AddYears(-1), now);
                default:
                    return (null, now);
            }
        }
    }
}
