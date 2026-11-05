using Backend.Models;
using Backend.Models.DTOs.AnalyticsDTOs;
using Backend.Models.Enums;
using Microsoft.EntityFrameworkCore;

namespace Backend.Services.AnalyticsService
{
    public class AdminAnalyticsService : IAdminAnalyticsService
    {
        private readonly ApplicationDbContext _context;

        public AdminAnalyticsService(ApplicationDbContext context)
        {
            _context = context;
        }

        public async Task<AdminDashboardOverviewDto> GetAdminOverviewAsync(string period)
        {
            var (startDate, _) = ResolvePeriodDates(period);

            // 1. Lấy tất cả Orders theo kỳ lọc
            IQueryable<Order> ordersQuery = _context.Orders
                .Include(o => o.OrderItems)
                    .ThenInclude(oi => oi.Product)
                        .ThenInclude(p => p.Category)
                .Include(o => o.OrderItems)
                    .ThenInclude(oi => oi.Product)
                        .ThenInclude(p => p.Brand)
                .Include(o => o.OrderItems)
                    .ThenInclude(oi => oi.Product)
                        .ThenInclude(p => p.Seller)
                .Include(o => o.OrderItems)
                    .ThenInclude(oi => oi.Product)
                        .ThenInclude(p => p.Images)
                .AsNoTracking();

            if (startDate.HasValue)
            {
                ordersQuery = ordersQuery.Where(o => o.CreatedAt >= startDate.Value);
            }

            var orders = await ordersQuery.ToListAsync();

            // 2. Lấy quy mô hệ sinh thái toàn sàn
            var users = await _context.Users
                .Include(u => u.Role)
                .AsNoTracking()
                .ToListAsync();

            var totalBuyers = users.Count(u =>
            {
                var rName = (u.Role?.RoleName ?? "").ToLower();
                return rName == "customer" || rName == "buyer" || rName == "user";
            });
            var totalSellers = users.Count(u => (u.Role?.RoleName ?? "").ToLower() == "seller");

            var allProducts = await _context.Products
                .Include(p => p.Category)
                .Include(p => p.Brand)
                .Include(p => p.Seller)
                .Include(p => p.Images)
                .AsNoTracking()
                .ToListAsync();
            var totalActiveProducts = allProducts.Count(p => p.IsActive);

            // 3. Tính toán KPI tài chính & đơn hàng
            var nonCancelledOrders = orders
                .Where(o => o.OrderStatus != OrderStatus.Cancelled && o.OrderStatus != OrderStatus.Refunded)
                .ToList();
            var deliveredOrders = orders.Where(o => o.OrderStatus == OrderStatus.Delivered).ToList();
            var pendingOrders = orders
                .Where(o => o.OrderStatus == OrderStatus.Pending || o.OrderStatus == OrderStatus.Confirmed || o.OrderStatus == OrderStatus.Processing)
                .ToList();
            var cancelledOrders = orders
                .Where(o => o.OrderStatus == OrderStatus.Cancelled || o.OrderStatus == OrderStatus.Refunded)
                .ToList();

            decimal totalGmv = nonCancelledOrders.Sum(o => o.TotalAmount);
            decimal netRevenue = nonCancelledOrders.Sum(o => o.FinalAmount);
            decimal totalDiscountGiven = nonCancelledOrders.Sum(o => o.DiscountAmount + o.ShippingDiscountAmount);
            decimal totalShippingCollected = nonCancelledOrders.Sum(o => o.ShippingFee);
            decimal aov = nonCancelledOrders.Count > 0 ? Math.Round(netRevenue / nonCancelledOrders.Count, 0) : 0;
            double successRate = orders.Count > 0
                ? Math.Round(((double)nonCancelledOrders.Count / orders.Count) * 100, 1)
                : 100.0;

            var vouchers = await _context.Vouchers
                .Where(v => v.DiscountType != VoucherDiscountType.FreeShipping)
                .OrderByDescending(v => v.UsedCount)
                .AsNoTracking()
                .ToListAsync();

            int totalVoucherRedemptions = vouchers.Sum(v => v.UsedCount);

            var kpi = new AdminKpiSummaryDto
            {
                TotalGmv = totalGmv,
                NetRevenue = netRevenue,
                TotalDiscountGiven = totalDiscountGiven,
                TotalShippingCollected = totalShippingCollected,
                AverageOrderValue = aov,
                TotalOrders = orders.Count,
                DeliveredOrders = deliveredOrders.Count,
                PendingOrders = pendingOrders.Count,
                CancelledOrders = cancelledOrders.Count,
                SuccessRate = successRate,
                TotalBuyers = totalBuyers > 0 ? totalBuyers : Math.Max(1, users.Count - totalSellers - 1),
                TotalSellers = totalSellers,
                TotalActiveProducts = totalActiveProducts,
                TotalVoucherRedemptions = totalVoucherRedemptions
            };

            // 4. Chuỗi thời gian biểu đồ GMV & Net Revenue
            var revenueTrend = BuildRevenueTrend(orders, period);

            // 5. Phân bổ trạng thái đơn hàng
            var statusBreakdown = BuildOrderStatusBreakdown(orders);

            // 6. Phân bổ phương thức thanh toán
            var paymentBreakdown = BuildPaymentMethodBreakdown(nonCancelledOrders);

            // 7. Bảng xếp hạng Top 5 Gian hàng (Sellers)
            var sellerOrderItems = nonCancelledOrders
                .SelectMany(o => o.OrderItems.Select(oi => new { Order = o, Item = oi }))
                .Where(x => x.Item.Product != null)
                .ToList();

            var sellersList = users.Where(u => (u.Role?.RoleName ?? "").ToLower() == "seller").ToList();
            var topSellers = sellersList
                .Select(s =>
                {
                    var sItems = sellerOrderItems.Where(x => x.Item.Product.SellerId == s.UserId).ToList();
                    var sProductsCount = allProducts.Count(p => p.SellerId == s.UserId && p.IsActive);
                    return new TopSellerItemDto
                    {
                        SellerId = s.UserId,
                        SellerName = string.IsNullOrWhiteSpace(s.FullName) ? s.Email : s.FullName,
                        SellerEmail = s.Email,
                        ActiveProductCount = sProductsCount,
                        OrderCount = sItems.Select(x => x.Order.OrderId).Distinct().Count(),
                        TotalItemsSold = sItems.Sum(x => x.Item.Quantity),
                        TotalRevenue = sItems.Sum(x => x.Item.TotalPrice)
                    };
                })
                .OrderByDescending(x => x.TotalRevenue)
                .ThenByDescending(x => x.ActiveProductCount)
                .Take(5)
                .ToList();

            // 8. Bảng xếp hạng Top 5 Sản phẩm bán chạy
            var topProducts = allProducts
                .Where(p => p.IsActive)
                .Select(p =>
                {
                    var pItems = sellerOrderItems.Where(x => x.Item.ProductId == p.ProductId).ToList();
                    var primaryImg = p.Images?.FirstOrDefault(i => i.IsPrimary)?.ImageUrl
                                  ?? p.Images?.FirstOrDefault()?.ImageUrl;
                    return new TopProductItemDto
                    {
                        ProductId = p.ProductId,
                        ProductName = p.ProductName,
                        CategoryName = p.Category?.CategoryName ?? "Thời trang",
                        BrandName = p.Brand?.BrandName ?? "ShopVibe",
                        ImageUrl = primaryImg,
                        UnitPrice = p.Price,
                        TotalSoldQuantity = pItems.Sum(x => x.Item.Quantity),
                        TotalRevenue = pItems.Sum(x => x.Item.TotalPrice)
                    };
                })
                .OrderByDescending(x => x.TotalRevenue)
                .ThenByDescending(x => x.TotalSoldQuantity)
                .ThenByDescending(x => x.UnitPrice)
                .Take(5)
                .ToList();

            // 9. Hiệu quả chiến dịch Mã giảm giá (Voucher ROI)
            var voucherPerformance = vouchers
                .Select(v =>
                {
                    var matchedOrders = nonCancelledOrders
                        .Where(o => o.DiscountVoucherId == v.VoucherId ||
                                    string.Equals(o.DiscountVoucherCode, v.Code, StringComparison.OrdinalIgnoreCase))
                        .ToList();

                    decimal bookedDiscount = matchedOrders.Sum(o => o.DiscountAmount);
                    decimal generatedGmv = matchedOrders.Sum(o => o.TotalAmount);

                    if (bookedDiscount == 0 && v.UsedCount > 0)
                    {
                        bookedDiscount = v.DiscountType == VoucherDiscountType.FixedAmount
                            ? v.UsedCount * v.DiscountValue
                            : v.UsedCount * Math.Min(v.MaxDiscountAmount ?? 80000m, Math.Round(v.MinOrderValue * (v.DiscountValue / 100m), 0));
                        generatedGmv = v.UsedCount * Math.Max(v.MinOrderValue, 450000m);
                    }

                    return new VoucherPerformanceItemDto
                    {
                        VoucherId = v.VoucherId,
                        Code = v.Code,
                        Title = v.Title,
                        DiscountType = (int)v.DiscountType,
                        DiscountValue = v.DiscountValue,
                        UsedCount = v.UsedCount,
                        UsageLimit = v.UsageLimit,
                        IsActive = v.IsActive,
                        TotalDiscountBooked = bookedDiscount,
                        GeneratedGmv = generatedGmv
                    };
                })
                .ToList();

            return new AdminDashboardOverviewDto
            {
                Kpi = kpi,
                RevenueTrend = revenueTrend,
                OrderStatusBreakdown = statusBreakdown,
                PaymentBreakdown = paymentBreakdown,
                TopSellers = topSellers,
                TopProducts = topProducts,
                VoucherPerformance = voucherPerformance
            };
        }

        private static List<AdminRevenuePointDto> BuildRevenueTrend(List<Order> orders, string period)
        {
            var p = (period ?? "30days").ToLower();
            var now = DateTime.UtcNow;
            var validOrders = orders
                .Where(o => o.OrderStatus != OrderStatus.Cancelled && o.OrderStatus != OrderStatus.Refunded)
                .ToList();

            var result = new List<AdminRevenuePointDto>();

            if (p == "today")
            {
                var startOfToday = new DateTime(now.Year, now.Month, now.Day, 0, 0, 0, DateTimeKind.Utc);
                for (int h = 0; h < 24; h += 4)
                {
                    var blockStart = startOfToday.AddHours(h);
                    var blockEnd = blockStart.AddHours(4);
                    var inBlock = validOrders.Where(o => o.CreatedAt >= blockStart && o.CreatedAt < blockEnd).ToList();

                    result.Add(new AdminRevenuePointDto
                    {
                        TimeLabel = $"{h:D2}:00",
                        Gmv = inBlock.Sum(o => o.TotalAmount),
                        NetRevenue = inBlock.Sum(o => o.FinalAmount),
                        OrderCount = inBlock.Count
                    });
                }
            }
            else if (p == "7days")
            {
                var startDate = now.Date.AddDays(-6);
                for (int i = 0; i < 7; i++)
                {
                    var curDate = startDate.AddDays(i);
                    var nextDate = curDate.AddDays(1);
                    var inDay = validOrders.Where(o => o.CreatedAt >= curDate && o.CreatedAt < nextDate).ToList();

                    result.Add(new AdminRevenuePointDto
                    {
                        TimeLabel = curDate.ToString("dd/MM"),
                        Gmv = inDay.Sum(o => o.TotalAmount),
                        NetRevenue = inDay.Sum(o => o.FinalAmount),
                        OrderCount = inDay.Count
                    });
                }
            }
            else if (p == "1year" || p == "all")
            {
                var startOfMonth = new DateTime(now.Year, now.Month, 1, 0, 0, 0, DateTimeKind.Utc).AddMonths(-11);
                for (int m = 0; m < 12; m++)
                {
                    var curMonth = startOfMonth.AddMonths(m);
                    var nextMonth = curMonth.AddMonths(1);
                    var inMonth = validOrders.Where(o => o.CreatedAt >= curMonth && o.CreatedAt < nextMonth).ToList();

                    result.Add(new AdminRevenuePointDto
                    {
                        TimeLabel = $"T{curMonth.Month}",
                        Gmv = inMonth.Sum(o => o.TotalAmount),
                        NetRevenue = inMonth.Sum(o => o.FinalAmount),
                        OrderCount = inMonth.Count
                    });
                }
            }
            else // 30days default
            {
                var startDate = now.Date.AddDays(-29);
                for (int i = 0; i < 30; i += 3)
                {
                    var curDate = startDate.AddDays(i);
                    var nextDate = curDate.AddDays(3);
                    var inBucket = validOrders.Where(o => o.CreatedAt >= curDate && o.CreatedAt < nextDate).ToList();

                    result.Add(new AdminRevenuePointDto
                    {
                        TimeLabel = curDate.ToString("dd/MM"),
                        Gmv = inBucket.Sum(o => o.TotalAmount),
                        NetRevenue = inBucket.Sum(o => o.FinalAmount),
                        OrderCount = inBucket.Count
                    });
                }
            }

            return result;
        }

        private static List<OrderStatusBreakdownDto> BuildOrderStatusBreakdown(List<Order> orders)
        {
            int totalOrders = orders.Count;
            var statusConfigs = new List<(OrderStatus Status, string Key, string Name, string Color)>
            {
                (OrderStatus.Delivered, "Delivered", "Đã giao thành công", "#0f766e"),
                (OrderStatus.Shipping, "Shipping", "Đang vận chuyển", "#0284c7"),
                (OrderStatus.Processing, "Processing", "Đang đóng gói", "#111111"),
                (OrderStatus.Confirmed, "Confirmed", "Đã xác nhận", "#d97706"),
                (OrderStatus.Pending, "Pending", "Chờ xác nhận", "#ea580c"),
                (OrderStatus.Cancelled, "Cancelled", "Đã hủy đơn", "#d30005"),
            };

            return statusConfigs.Select(cfg =>
            {
                int count = orders.Count(o => o.OrderStatus == cfg.Status);
                double pct = totalOrders > 0 ? Math.Round(((double)count / totalOrders) * 100, 1) : 0;
                return new OrderStatusBreakdownDto
                {
                    StatusKey = cfg.Key,
                    StatusName = cfg.Name,
                    Count = count,
                    Percentage = pct,
                    ColorHex = cfg.Color
                };
            }).ToList();
        }

        private static List<PaymentMethodBreakdownDto> BuildPaymentMethodBreakdown(List<Order> validOrders)
        {
            int total = validOrders.Count;
            var codOrders = validOrders.Where(o => o.PaymentMethod == PaymentMethod.COD).ToList();
            var onlineOrders = validOrders.Where(o => o.PaymentMethod != PaymentMethod.COD).ToList();

            return new List<PaymentMethodBreakdownDto>
            {
                new()
                {
                    MethodKey = "COD",
                    MethodName = "Thanh toán khi nhận hàng (COD)",
                    OrderCount = codOrders.Count,
                    TotalAmount = codOrders.Sum(o => o.FinalAmount),
                    Percentage = total > 0 ? Math.Round(((double)codOrders.Count / total) * 100, 1) : 0
                },
                new()
                {
                    MethodKey = "ONLINE",
                    MethodName = "Ví MoMo / Chuyển khoản VietQR",
                    OrderCount = onlineOrders.Count,
                    TotalAmount = onlineOrders.Sum(o => o.FinalAmount),
                    Percentage = total > 0 ? Math.Round(((double)onlineOrders.Count / total) * 100, 1) : 0
                }
            };
        }

        private static (DateTime? StartDate, DateTime? EndDate) ResolvePeriodDates(string period)
        {
            var p = (period ?? "30days").ToLower();
            var now = DateTime.UtcNow;

            return p switch
            {
                "today" => (new DateTime(now.Year, now.Month, now.Day, 0, 0, 0, DateTimeKind.Utc), now),
                "7days" => (now.Date.AddDays(-6), now),
                "30days" => (now.Date.AddDays(-29), now),
                "1year" => (now.Date.AddYears(-1), now),
                _ => (null, now),
            };
        }
    }
}
