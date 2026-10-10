using Backend.Models.DTOs;

namespace Backend.Services.OrderService
{
    public interface IOrderService
    {
        /// <summary>
        /// Tạo đơn hàng mới: validate tồn kho, tạo order + items, trừ kho, dọn giỏ hàng – trong 1 transaction.
        /// Hỗ trợ IdempotencyKey để chống trùng lặp request đặt hàng.
        /// </summary>
        Task<OrderResponseDto> CreateOrderAsync(int userId, CreateOrderRequestDto request, string? idempotencyKey = null);

        /// <summary>
        /// Lấy danh sách đơn hàng của User với phân trang và lọc theo trạng thái.
        /// </summary>
        Task<PagedOrderResultDto> GetPagedOrdersAsync(int userId, OrderQueryDto query);

        /// <summary>
        /// Lấy chi tiết một đơn hàng theo ID (chỉ User sở hữu mới xem được).
        /// </summary>
        Task<OrderResponseDto?> GetOrderDetailAsync(int userId, int orderId);

        /// <summary>
        /// Lấy chi tiết một đơn hàng theo mã đơn hàng (OrderCode).
        /// </summary>
        Task<OrderResponseDto?> GetOrderByCodeAsync(int userId, string orderCode);

        /// <summary>
        /// Hủy đơn hàng (chỉ khi ở trạng thái Pending hoặc Confirmed) và hoàn lại tồn kho.
        /// </summary>
        Task<OrderResponseDto> CancelOrderAsync(int userId, int orderId, string? cancelReason = null);

        // ── Admin & Seller Operations ─────────────────────────────────────────
        Task<AdminPagedOrderResultDto> GetAdminOrdersPagedAsync(AdminOrderQueryDto query);
        Task<AdminOrderDetailDto?> GetAdminOrderDetailAsync(int orderId);
        Task<AdminOrderStatsDto> GetAdminOrderStatsAsync();
        Task<AdminOrderDetailDto> UpdateOrderStatusByAdminAsync(int orderId, AdminUpdateOrderStatusDto dto);
        Task<AdminOrderDetailDto> UpdatePaymentStatusByAdminAsync(int orderId, AdminUpdatePaymentStatusDto dto);
    }
}
