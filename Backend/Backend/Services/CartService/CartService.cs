using Backend.Models;
using Backend.Models.DTOs;
using Backend.Repositories.CartRepo;
using Backend.Repositories.ProductRepo;

namespace Backend.Services.CartService
{
    public class CartService : ICartService
    {
        private readonly ICartRepository _cartRepository;
        private readonly IProductRepository _productRepository;
        private readonly ILogger<CartService> _logger;

        public CartService(
            ICartRepository cartRepository,
            IProductRepository productRepository,
            ILogger<CartService> logger)
        {
            _cartRepository = cartRepository;
            _productRepository = productRepository;
            _logger = logger;
        }

        private async Task<CartResponseDto> MapToCartDtoAsync(int cartId)
        {
            var cart = await _cartRepository.GetCartWithDetailsAsync(cartId);
            if (cart == null)
            {
                return new CartResponseDto();
            }

            var response = new CartResponseDto
            {
                CartId = cart.CartId,
                UserId = cart.UserId,
                Items = cart.CartItems.Select(ci =>
                {
                    // Chọn ảnh thông minh: ưu tiên ảnh gắn ColorId của biến thể, nếu không lấy ảnh chính
                    string? imageUrl = null;
                    if (ci.ProductVariant?.ColorId != null)
                    {
                        imageUrl = ci.Product.Images
                            .FirstOrDefault(img => img.ColorId == ci.ProductVariant.ColorId)?
                            .ImageUrl;
                    }
                    if (string.IsNullOrEmpty(imageUrl))
                    {
                        imageUrl = ci.Product.Images
                            .OrderBy(img => img.DisplayOrder)
                            .FirstOrDefault()?.ImageUrl;
                    }

                    // Tính đơn giá: ưu tiên giá của biến thể nếu > 0
                    decimal unitPrice = (ci.ProductVariant != null && ci.ProductVariant.Price > 0)
                        ? ci.ProductVariant.Price
                        : ci.Product.Price;

                    int stockQuantity = ci.ProductVariant?.StockQuantity ?? ci.Product.StockQuantity;

                    return new CartItemResponseDto
                    {
                        CartItemId = ci.CartItemId,
                        ProductId = ci.ProductId,
                        ProductName = ci.Product.ProductName,
                        ProductSlug = ci.Product.Slug,
                        ProductImage = imageUrl,
                        SellerId = ci.Product.SellerId,
                        SellerName = ci.Product.Seller?.FullName ?? "ShopVibe Official",
                        ProductVariantId = ci.ProductVariantId,
                        ColorId = ci.ProductVariant?.ColorId,
                        ColorName = ci.ProductVariant?.Color?.ColorName,
                        HexCode = ci.ProductVariant?.Color?.HexCode,
                        SizeId = ci.ProductVariant?.SizeId,
                        SizeName = ci.ProductVariant?.Size?.SizeName,
                        Sku = ci.ProductVariant?.Sku,
                        UnitPrice = unitPrice,
                        Quantity = ci.Quantity,
                        StockQuantity = stockQuantity
                    };
                }).OrderByDescending(i => i.CartItemId).ToList()
            };

            return response;
        }

        public async Task<CartResponseDto> GetCartByUserIdAsync(int userId)
        {
            var cart = await _cartRepository.GetOrCreateByUserIdAsync(userId);
            return await MapToCartDtoAsync(cart.CartId);
        }

        public async Task<(bool Success, string? Error, CartResponseDto? Data)> AddToCartAsync(int userId, AddToCartRequestDto dto)
        {
            var cart = await _cartRepository.GetOrCreateByUserIdAsync(userId);

            // Kiểm tra thông tin sản phẩm qua ProductRepository
            var product = await _productRepository.GetByIdAsync(dto.ProductId);
            if (product == null || !product.IsActive)
            {
                return (false, "Sản phẩm không tồn tại hoặc đã ngừng kinh doanh.", null);
            }

            int availableStock;
            if (dto.ProductVariantId.HasValue)
            {
                var variant = await _productRepository.GetVariantByIdAsync(dto.ProductVariantId.Value);
                if (variant == null || variant.ProductId != dto.ProductId || !variant.IsActive)
                {
                    return (false, "Phân loại biến thể sản phẩm không tồn tại hoặc đã ngừng bán.", null);
                }

                availableStock = variant.StockQuantity;
            }
            else
            {
                availableStock = product.StockQuantity;
            }

            if (availableStock <= 0)
            {
                return (false, "Sản phẩm hoặc phân loại đã chọn hiện đã hết hàng trong kho.", null);
            }

            // Kiểm tra món đã có trong giỏ qua CartRepository
            var existingItem = await _cartRepository.GetItemAsync(cart.CartId, dto.ProductId, dto.ProductVariantId);

            if (existingItem != null)
            {
                int newTotalQty = existingItem.Quantity + dto.Quantity;
                if (newTotalQty > availableStock)
                {
                    return (false, $"Số lượng yêu cầu ({newTotalQty}) vượt quá số lượng còn lại trong kho ({availableStock}).", null);
                }

                existingItem.Quantity = newTotalQty;
                existingItem.UpdatedAt = DateTime.UtcNow;
                await _cartRepository.UpdateItemAsync(existingItem);
            }
            else
            {
                if (dto.Quantity > availableStock)
                {
                    return (false, $"Số lượng yêu cầu ({dto.Quantity}) vượt quá số lượng còn lại trong kho ({availableStock}).", null);
                }

                var newItem = new CartItem
                {
                    CartId = cart.CartId,
                    ProductId = dto.ProductId,
                    ProductVariantId = dto.ProductVariantId,
                    Quantity = dto.Quantity,
                    CreatedAt = DateTime.UtcNow,
                    UpdatedAt = DateTime.UtcNow
                };
                await _cartRepository.AddItemAsync(newItem);
            }

            await _cartRepository.TouchCartAsync(cart.CartId);

            var result = await MapToCartDtoAsync(cart.CartId);
            return (true, null, result);
        }

        public async Task<(bool Success, string? Error, CartResponseDto? Data)> UpdateCartItemQuantityAsync(int userId, int cartItemId, int quantity)
        {
            var cart = await _cartRepository.GetOrCreateByUserIdAsync(userId);
            var item = await _cartRepository.GetItemByIdAsync(cartItemId, cart.CartId);

            if (item == null)
            {
                return (false, "Món hàng không tồn tại trong giỏ của bạn.", null);
            }

            if (quantity <= 0)
            {
                await _cartRepository.RemoveItemAsync(item);
            }
            else
            {
                int availableStock = item.ProductVariant?.StockQuantity ?? item.Product.StockQuantity;
                if (quantity > availableStock)
                {
                    return (false, $"Số lượng yêu cầu ({quantity}) vượt quá tồn kho hiện có ({availableStock}).", null);
                }

                item.Quantity = quantity;
                item.UpdatedAt = DateTime.UtcNow;
                await _cartRepository.UpdateItemAsync(item);
            }

            await _cartRepository.TouchCartAsync(cart.CartId);

            var result = await MapToCartDtoAsync(cart.CartId);
            return (true, null, result);
        }

        public async Task<(bool Success, string? Error, CartResponseDto? Data)> RemoveCartItemAsync(int userId, int cartItemId)
        {
            var cart = await _cartRepository.GetOrCreateByUserIdAsync(userId);
            var item = await _cartRepository.GetItemByIdAsync(cartItemId, cart.CartId);

            if (item == null)
            {
                return (false, "Món hàng không tồn tại trong giỏ của bạn.", null);
            }

            await _cartRepository.RemoveItemAsync(item);
            await _cartRepository.TouchCartAsync(cart.CartId);

            var result = await MapToCartDtoAsync(cart.CartId);
            return (true, null, result);
        }

        public async Task<(bool Success, string? Error, CartResponseDto? Data)> ClearCartAsync(int userId)
        {
            var cart = await _cartRepository.GetOrCreateByUserIdAsync(userId);

            await _cartRepository.ClearItemsAsync(cart.CartId);
            await _cartRepository.TouchCartAsync(cart.CartId);

            var result = await MapToCartDtoAsync(cart.CartId);
            return (true, null, result);
        }
    }
}
