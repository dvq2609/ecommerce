using Backend.Models;

namespace Backend.Repositories.CartRepo
{
    public interface ICartRepository
    {
        Task<Cart> GetOrCreateByUserIdAsync(int userId);
        Task<Cart?> GetCartWithDetailsAsync(int cartId);
        Task<CartItem?> GetItemAsync(int cartId, int productId, int? variantId);
        Task<CartItem?> GetItemByIdAsync(int cartItemId, int cartId);
        Task AddItemAsync(CartItem item);
        Task UpdateItemAsync(CartItem item);
        Task RemoveItemAsync(CartItem item);
        Task ClearItemsAsync(int cartId);
        Task TouchCartAsync(int cartId);
    }
}
