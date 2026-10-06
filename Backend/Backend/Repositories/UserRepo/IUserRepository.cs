using Backend.Models;

namespace Backend.Repositories.UserRepo
{
    public interface IUserRepository
    {
        Task<User?> GetUserByIdAsync(int userId, CancellationToken cancellationToken = default);
        Task<User?> GetUserByEmailAsync(string email, CancellationToken cancellationToken = default);
        Task<User?> GetUserByPhoneNumberAsync(string phoneNumber, CancellationToken cancellationToken = default);
        Task<User?> GetUserByEmailConfirmationTokenAsync(string token, CancellationToken cancellationToken = default);
        Task<User?> GetUserByPasswordResetTokenAsync(string token, CancellationToken cancellationToken = default);
        Task<User> CreateUserAsync(User user, CancellationToken cancellationToken = default);
        Task UpdateUserAsync(User user, CancellationToken cancellationToken = default);
        Task<Role?> GetRoleByNameAsync(string roleName, CancellationToken cancellationToken = default);
        Task<Cart> CreateCartForUserAsync(int userId, CancellationToken cancellationToken = default);

        // Refresh Token methods
        Task<RefreshToken?> GetRefreshTokenWithUserAsync(string token, CancellationToken cancellationToken = default);
        Task AddRefreshTokenAsync(RefreshToken refreshToken, CancellationToken cancellationToken = default);
        Task UpdateRefreshTokenAsync(RefreshToken refreshToken, CancellationToken cancellationToken = default);
        Task RevokeAllUserRefreshTokensAsync(int userId, string ipAddress, string reason, CancellationToken cancellationToken = default);
    }
}