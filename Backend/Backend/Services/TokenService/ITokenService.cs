using System.Security.Claims;
using Backend.Models;

namespace Backend.Services.TokenService
{
    public interface ITokenService
    {
        string GenerateAccessToken(User user);
        RefreshToken GenerateRefreshToken(int userId, string? ipAddress);
        ClaimsPrincipal? GetPrincipalFromExpiredToken(string token);
    }
}