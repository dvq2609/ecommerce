using Backend.Models.DTOs;

namespace Backend.Services.OrderService
{
    public interface IOrderService
    {
        /// <summary>
        /// Tạo đơn hàng mới: validate tồn kho, tạo order + items, trừ kho, dọn giỏ hàng – trong 1 transaction.
        /// </summary>
        Task<OrderResponseDto> CreateOrderAsync(int userId, CreateOrderRequestDto request);

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
    }
}
