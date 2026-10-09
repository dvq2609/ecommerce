using Backend.Models;
using Backend.Models.DTOs;
using Backend.Models.Enums;
using Backend.Repositories.CartRepo;
using Backend.Repositories.OrderRepo;
using Backend.Repositories.ProductRepo;
using Backend.Repositories.UserRepo;

namespace Backend.Services.OrderService
{
    public class OrderService : IOrderService
    {
        private readonly IOrderRepository _orderRepository;
        private readonly ICartRepository _cartRepository;
        private readonly IProductRepository _productRepository;
        private readonly IUserRepository _userRepository;
        private readonly ILogger<OrderService> _logger;

        public OrderService(
            IOrderRepository orderRepository,
            ICartRepository cartRepository,
            IProductRepository productRepository,
            IUserRepository userRepository,
            ILogger<OrderService> logger)
        {
            _orderRepository = orderRepository;
            _cartRepository = cartRepository;
            _productRepository = productRepository;
            _userRepository = userRepository;
            _logger = logger;
        }

        // ─────────────────────────────────────────────────────────────────────
        // CREATE ORDER (Transactional: validate stock → create order → deduct stock → clean cart)
        // ─────────────────────────────────────────────────────────────────────
        public async Task<OrderResponseDto> CreateOrderAsync(int userId, CreateOrderRequestDto request)
        {
            await using var transaction = await _orderRepository.BeginTransactionAsync();
            try
            {
                // 1. Lấy danh sách items cần đặt hàng
                List<(int ProductId, int? VariantId, int Quantity)> orderLines;

                if (request.Items != null && request.Items.Count > 0)
                {
                    // Buy Now: dùng danh sách items từ request
                    orderLines = request.Items.Select(i => (i.ProductId, i.ProductVariantId, i.Quantity)).ToList();
                }
                else
                {
                    // Cart Checkout: lấy toàn bộ giỏ hàng
                    var cart = await _cartRepository.GetOrCreateByUserIdAsync(userId);
                    var cartWithDetails = await _cartRepository.GetCartWithDetailsAsync(cart.CartId);
                    if (cartWithDetails == null || cartWithDetails.CartItems.Count == 0)
                    {
                        throw new InvalidOperationException("Giỏ hàng của bạn đang trống. Vui lòng thêm sản phẩm trước khi đặt hàng.");
                    }
                    orderLines = cartWithDetails.CartItems
                        .Select(ci => (ci.ProductId, ci.ProductVariantId, ci.Quantity))
                        .ToList();
                }

                // 2. Validate tồn kho & xây dựng OrderItems
                var orderItems = new List<OrderItem>();
                decimal totalAmount = 0;

                foreach (var (productId, variantId, quantity) in orderLines)
                {
                    var product = await _productRepository.GetDetailByIdAsync(productId);
                    if (product == null || !product.IsActive)
                    {
                        throw new InvalidOperationException($"Sản phẩm ID={productId} không tồn tại hoặc đã ngừng kinh doanh.");
                    }

                    decimal unitPrice;
                    string variantInfo = string.Empty;
                    string? imageUrl = product.Images
                        .OrderBy(img => img.DisplayOrder)
                        .FirstOrDefault()?.ImageUrl;

                    if (variantId.HasValue)
                    {
                        var variant = product.Variants?.FirstOrDefault(v => v.VariantId == variantId.Value);
                        if (variant == null || !variant.IsActive)
                        {
                            throw new InvalidOperationException($"Biến thể ID={variantId} của sản phẩm '{product.ProductName}' không tồn tại.");
                        }
                        if (variant.StockQuantity < quantity)
                        {
                            throw new InvalidOperationException($"Sản phẩm '{product.ProductName}' ({variant.Color?.ColorName} • {variant.Size?.SizeName}) chỉ còn {variant.StockQuantity} sản phẩm, không đủ số lượng yêu cầu ({quantity}).");
                        }

                        unitPrice = variant.Price;
                        variantInfo = $"{variant.Color?.ColorName ?? ""} • {variant.Size?.SizeName ?? ""}".Trim(' ', '•', ' ');

                        // Chọn ảnh theo màu của biến thể
                        var colorImage = product.Images.FirstOrDefault(img => img.ColorId == variant.ColorId);
                        if (colorImage != null) imageUrl = colorImage.ImageUrl;
                    }
                    else
                    {
                        if (product.StockQuantity < quantity)
                        {
                            throw new InvalidOperationException($"Sản phẩm '{product.ProductName}' chỉ còn {product.StockQuantity} sản phẩm, không đủ số lượng yêu cầu ({quantity}).");
                        }
                        unitPrice = product.Price;
                    }

                    var lineTotal = unitPrice * quantity;
                    totalAmount += lineTotal;

                    orderItems.Add(new OrderItem
                    {
                        ProductId = productId,
                        ProductVariantId = variantId,
                        ProductName = product.ProductName,
                        VariantInfo = string.IsNullOrWhiteSpace(variantInfo) ? null : variantInfo,
                        ProductImageUrl = imageUrl,
                        UnitPrice = unitPrice,
                        Quantity = quantity,
                        TotalPrice = lineTotal
                    });
                }

                // 3. Tính phí ship (Freeship khi >= 1.000.000₫, mặc định 30.000₫)
                const decimal FREE_SHIP_THRESHOLD = 1000000m;
                const decimal SHIPPING_FEE = 30000m;
                var shippingFee = totalAmount >= FREE_SHIP_THRESHOLD ? 0m : SHIPPING_FEE;
                var finalAmount = totalAmount + shippingFee;

                // 4. Sinh mã đơn hàng duy nhất: ORD-YYMMDD-XXXX
                var orderCode = GenerateOrderCode();

                // 5. Tạo đối tượng Order
                var order = new Order
                {
                    UserId = userId,
                    OrderCode = orderCode,
                    RecipientName = request.RecipientName,
                    RecipientPhone = request.RecipientPhone,
                    ShippingAddress = request.ShippingAddress,
                    Note = request.Note,
                    TotalAmount = totalAmount,
                    ShippingFee = shippingFee,
                    DiscountAmount = 0m,
                    FinalAmount = finalAmount,
                    PaymentMethod = request.PaymentMethod,
                    PaymentStatus = PaymentStatus.Pending,
                    OrderStatus = OrderStatus.Pending,
                    CreatedAt = DateTime.UtcNow,
                    OrderItems = orderItems
                };

                // 6. Lưu đơn hàng vào DB
                await _orderRepository.CreateOrderAsync(order);

                // 7. Trừ tồn kho cho từng item
                foreach (var item in orderItems)
                {
                    var deducted = await _orderRepository.DeductStockAsync(item.ProductVariantId, item.ProductId, item.Quantity);
                    if (!deducted)
                    {
                        throw new InvalidOperationException($"Không thể trừ tồn kho cho sản phẩm '{item.ProductName}'. Vui lòng thử lại.");
                    }
                }

                // 8. Dọn sạch giỏ hàng (chỉ khi đặt từ Cart)
                if (request.Items == null || request.Items.Count == 0)
                {
                    var cart = await _cartRepository.GetOrCreateByUserIdAsync(userId);
                    await _cartRepository.ClearItemsAsync(cart.CartId);
                }

                // 9. Tùy chọn lưu địa chỉ vào hồ sơ User
                if (request.SaveToProfile)
                {
                    try
                    {
                        var user = await _userRepository.GetUserByIdAsync(userId);
                        if (user != null && string.IsNullOrWhiteSpace(user.Address))
                        {
                            user.Address = request.ShippingAddress;
                            await _userRepository.UpdateUserAsync(user);
                        }
                    }
                    catch (Exception ex)
                    {
                        // Không làm hỏng đơn hàng nếu update profile lỗi
                        _logger.LogWarning(ex, "Không thể cập nhật địa chỉ cho User {UserId}", userId);
                    }
                }

                // 10. Commit transaction
                await transaction.CommitAsync();

                _logger.LogInformation("Đơn hàng {OrderCode} được tạo thành công cho User {UserId}. Tổng tiền: {FinalAmount:N0}₫",
                    orderCode, userId, finalAmount);

                return MapToDto(order);
            }
            catch
            {
                await transaction.RollbackAsync();
                throw;
            }
        }

        // ─────────────────────────────────────────────────────────────────────
        // GET PAGED ORDERS
        // ─────────────────────────────────────────────────────────────────────
        public async Task<PagedOrderResultDto> GetPagedOrdersAsync(int userId, OrderQueryDto query)
        {
            var (items, totalCount) = await _orderRepository.GetPagedByUserAsync(userId, query);

            return new PagedOrderResultDto
            {
                Items = items.Select(MapToDto).ToList(),
                TotalCount = totalCount,
                PageNumber = query.PageNumber,
                PageSize = query.PageSize
            };
        }

        // ─────────────────────────────────────────────────────────────────────
        // GET ORDER DETAIL
        // ─────────────────────────────────────────────────────────────────────
        public async Task<OrderResponseDto?> GetOrderDetailAsync(int userId, int orderId)
        {
            var order = await _orderRepository.GetByIdAsync(orderId, userId);
            return order == null ? null : MapToDto(order);
        }

        public async Task<OrderResponseDto?> GetOrderByCodeAsync(int userId, string orderCode)
        {
            var order = await _orderRepository.GetByCodeAsync(orderCode, userId);
            return order == null ? null : MapToDto(order);
        }

        // ─────────────────────────────────────────────────────────────────────
        // CANCEL ORDER (chỉ Pending / Confirmed)
        // ─────────────────────────────────────────────────────────────────────
        public async Task<OrderResponseDto> CancelOrderAsync(int userId, int orderId, string? cancelReason = null)
        {
            var order = await _orderRepository.GetByIdAsync(orderId, userId);
            if (order == null)
            {
                throw new KeyNotFoundException($"Không tìm thấy đơn hàng ID={orderId}.");
            }

            if (order.OrderStatus != OrderStatus.Pending && order.OrderStatus != OrderStatus.Confirmed)
            {
                throw new InvalidOperationException($"Đơn hàng {order.OrderCode} đang ở trạng thái '{GetStatusLabel(order.OrderStatus)}' và không thể hủy lúc này.");
            }

            await using var transaction = await _orderRepository.BeginTransactionAsync();
            try
            {
                // Hoàn lại tồn kho cho từng item
                foreach (var item in order.OrderItems)
                {
                    await _orderRepository.RestoreStockAsync(item.ProductVariantId, item.ProductId, item.Quantity);
                }

                order.OrderStatus = OrderStatus.Cancelled;
                order.Note = string.IsNullOrWhiteSpace(cancelReason)
                    ? order.Note
                    : $"{order.Note ?? ""}\n[Lý do hủy]: {cancelReason}".Trim();
                order.UpdatedAt = DateTime.UtcNow;

                await _orderRepository.UpdateOrderAsync(order);
                await transaction.CommitAsync();

                _logger.LogInformation("Đơn hàng {OrderCode} (User {UserId}) đã bị hủy. Tồn kho đã được hoàn trả.",
                    order.OrderCode, userId);

                return MapToDto(order);
            }
            catch
            {
                await transaction.RollbackAsync();
                throw;
            }
        }

        // ─────────────────────────────────────────────────────────────────────
        // PRIVATE HELPERS
        // ─────────────────────────────────────────────────────────────────────
        private static string GenerateOrderCode()
        {
            var datePart = DateTime.UtcNow.ToString("yyMMdd");
            var randomPart = Random.Shared.Next(1000, 9999).ToString();
            return $"ORD-{datePart}-{randomPart}";
        }

        private static string GetStatusLabel(OrderStatus status) => status switch
        {
            OrderStatus.Pending => "Chờ xác nhận",
            OrderStatus.Confirmed => "Đã xác nhận",
            OrderStatus.Processing => "Đang xử lý",
            OrderStatus.Shipping => "Đang giao hàng",
            OrderStatus.Delivered => "Đã giao thành công",
            OrderStatus.Cancelled => "Đã hủy",
            OrderStatus.Refunded => "Đã hoàn tiền",
            _ => "Không xác định"
        };

        private static OrderResponseDto MapToDto(Order order)
        {
            return new OrderResponseDto
            {
                OrderId = order.OrderId,
                UserId = order.UserId,
                OrderCode = order.OrderCode,
                RecipientName = order.RecipientName,
                RecipientPhone = order.RecipientPhone,
                ShippingAddress = order.ShippingAddress,
                Note = order.Note,
                TotalAmount = order.TotalAmount,
                ShippingFee = order.ShippingFee,
                DiscountAmount = order.DiscountAmount,
                FinalAmount = order.FinalAmount,
                PaymentMethod = order.PaymentMethod,
                PaymentStatus = order.PaymentStatus,
                OrderStatus = order.OrderStatus,
                PaymentDate = order.PaymentDate,
                CreatedAt = order.CreatedAt,
                UpdatedAt = order.UpdatedAt,
                OrderItems = order.OrderItems.Select(oi => new OrderItemResponseDto
                {
                    OrderItemId = oi.OrderItemId,
                    OrderId = oi.OrderId,
                    ProductId = oi.ProductId,
                    ProductVariantId = oi.ProductVariantId,
                    ProductName = oi.ProductName,
                    VariantInfo = oi.VariantInfo,
                    ProductImageUrl = oi.ProductImageUrl,
                    UnitPrice = oi.UnitPrice,
                    Quantity = oi.Quantity,
                    TotalPrice = oi.TotalPrice
                }).ToList()
            };
        }
    }
}
