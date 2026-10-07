using Backend.Models.DTOs;

namespace Backend.Services.UserService
{
    public interface IUserService
    {
        Task<(bool Success, string Message, RegisterResponseDto? Data)> RegisterAsync(RegisterDto request, string? ipAddress, CancellationToken cancellationToken = default);
        Task<(bool Success, string Message, LoginResponseDto? Data)> LoginAsync(LoginDto request, string? ipAddress, CancellationToken cancellationToken = default);
        Task<(bool Success, string Message, LoginResponseDto? Data)> ProcessGoogleUserAsync(string email, string fullName, string? picture, string? ipAddress, CancellationToken cancellationToken = default);
        Task<(bool Success, string Message, LoginResponseDto? Data)> RefreshTokenAsync(string refreshToken, string? ipAddress, CancellationToken cancellationToken = default);
        Task<(bool Success, string Message)> RevokeTokenAsync(string token, string? ipAddress, CancellationToken cancellationToken = default);
        Task<(bool Success, string Message)> VerifyEmailAsync(string token, CancellationToken cancellationToken = default);
        Task<(bool Success, string Message)> ResendVerificationEmailAsync(string email, CancellationToken cancellationToken = default);
        Task<(bool Success, string Message)> ForgotPasswordAsync(string email, CancellationToken cancellationToken = default);
        Task<(bool Success, string Message)> ResetPasswordAsync(ResetPasswordDto request, CancellationToken cancellationToken = default);
        Task<UserMeResponseDto?> GetUserProfileAsync(int userId, CancellationToken cancellationToken = default);
    }
}