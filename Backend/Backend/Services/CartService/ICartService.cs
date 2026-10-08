using Backend.Models.DTOs;

namespace Backend.Services.CartService
{
    public interface ICartService
    {
        Task<CartResponseDto> GetCartByUserIdAsync(int userId);
        Task<(bool Success, string? Error, CartResponseDto? Data)> AddToCartAsync(int userId, AddToCartRequestDto dto);
        Task<(bool Success, string? Error, CartResponseDto? Data)> UpdateCartItemQuantityAsync(int userId, int cartItemId, int quantity);
        Task<(bool Success, string? Error, CartResponseDto? Data)> RemoveCartItemAsync(int userId, int cartItemId);
        Task<(bool Success, string? Error, CartResponseDto? Data)> ClearCartAsync(int userId);
    }
}
