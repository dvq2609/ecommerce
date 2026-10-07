using System.Security.Cryptography;
using Backend.Models;
using Backend.Models.DTOs;
using Backend.Repositories.UserRepo;
using Backend.Services.EmailService;
using Backend.Services.TokenService;
using Google.Apis.Auth;

namespace Backend.Services.UserService
{
    public class UserService : IUserService
    {
        private readonly IUserRepository _userRepository;
        private readonly ITokenService _tokenService;
        private readonly IEmailSender _emailSender;
        private readonly IConfiguration _configuration;
        private readonly ILogger<UserService> _logger;

        public UserService(
            IUserRepository userRepository,
            ITokenService tokenService,
            IEmailSender emailSender,
            IConfiguration configuration,
            ILogger<UserService> logger)
        {
            _userRepository = userRepository;
            _tokenService = tokenService;
            _emailSender = emailSender;
            _configuration = configuration;
            _logger = logger;
        }

        public async Task<(bool Success, string Message, RegisterResponseDto? Data)> RegisterAsync(
            RegisterDto request, 
            string? ipAddress, 
            CancellationToken cancellationToken = default)
        {
            var normalizedEmail = request.Email.Trim().ToLowerInvariant();

            // 1. Kiểm tra Email
            var existingUser = await _userRepository.GetUserByEmailAsync(normalizedEmail, cancellationToken);
            if (existingUser != null)
            {
                return (false, "Email này đã được sử dụng.", null);
            }

            // 2. Kiểm tra Số điện thoại
            if (!string.IsNullOrWhiteSpace(request.PhoneNumber))
            {
                var existingPhone = await _userRepository.GetUserByPhoneNumberAsync(request.PhoneNumber.Trim(), cancellationToken);
                if (existingPhone != null)
                {
                    return (false, "Số điện thoại này đã được sử dụng.", null);
                }
            }

            // 3. Lấy Role Buyer mặc định
            var buyerRole = await _userRepository.GetRoleByNameAsync("buyer", cancellationToken);
            var roleId = buyerRole?.RoleId ?? 2;

            // 4. Sinh Email Confirmation Token
            var emailConfirmationToken = GenerateRandomToken();

            // 5. Tạo User mới
            var user = new User
            {
                RoleId = roleId,
                FullName = request.FullName.Trim(),
                Email = normalizedEmail,
                PhoneNumber = string.IsNullOrWhiteSpace(request.PhoneNumber) ? null : request.PhoneNumber.Trim(),
                PasswordHash = BCrypt.Net.BCrypt.HashPassword(request.Password),
                Status = true,
                IsLocked = false,
                ImageUrl = "/AvatarImage/avt_default.jpg",
                EmailConfirmationToken = emailConfirmationToken,
                EmailConfirmationTokenExpiresAt = DateTime.UtcNow.AddHours(24)
            };

            await _userRepository.CreateUserAsync(user, cancellationToken);

            // 6. Tạo Giỏ hàng rỗng cho User
            await _userRepository.CreateCartForUserAsync(user.UserId, cancellationToken);

            // 7. Gửi Email kích hoạt tài khoản
            _ = Task.Run(async () =>
            {
                try
                {
                    await _emailSender.SendConfirmationEmailAsync(user.Email, user.FullName, emailConfirmationToken);
                }
                catch (Exception ex)
                {
                    _logger.LogError(ex, "Lỗi khi gửi email xác thực đến {Email}", user.Email);
                }
            }, CancellationToken.None);

            var responseData = new RegisterResponseDto
            {
                UserId = user.UserId,
                FullName = user.FullName,
                Email = user.Email,
                Role = buyerRole?.RoleName ?? "buyer",
                IsEmailConfirmed = false,
                Message = "Đăng ký thành công. Vui lòng kiểm tra hòm thư email để kích hoạt tài khoản."
            };

            return (true, "Đăng ký tài khoản thành công.", responseData);
        }

        public async Task<(bool Success, string Message, LoginResponseDto? Data)> LoginAsync(
            LoginDto request, 
            string? ipAddress, 
            CancellationToken cancellationToken = default)
        {
            var user = await _userRepository.GetUserByEmailAsync(request.Email, cancellationToken);
            if (user == null)
            {
                return (false, "Email hoặc mật khẩu không chính xác.", null);
            }

            if (user.IsLocked)
            {
                var reason = string.IsNullOrWhiteSpace(user.LockReason) ? "Tài khoản của bạn tạm thời bị khóa." : user.LockReason;
                return (false, $"Tài khoản đã bị khóa: {reason}", null);
            }

            if (!user.Status)
            {
                return (false, "Tài khoản đang bị vô hiệu hóa.", null);
            }

            // Kiểm tra mật khẩu
            if (string.IsNullOrEmpty(user.PasswordHash) || !BCrypt.Net.BCrypt.Verify(request.Password, user.PasswordHash))
            {
                return (false, "Email hoặc mật khẩu không chính xác.", null);
            }

            // Kiểm tra xác thực email
            if (user.EmailConfirmedAt == null)
            {
                return (false, "Tài khoản chưa được kích hoạt email. Vui lòng kiểm tra hộp thư hoặc yêu cầu gửi lại email xác thực.", null);
            }

            // Sinh Access Token & Refresh Token
            var accessToken = _tokenService.GenerateAccessToken(user);
            var refreshToken = _tokenService.GenerateRefreshToken(user.UserId, ipAddress);

            await _userRepository.AddRefreshTokenAsync(refreshToken, cancellationToken);

            var expireMinutes = int.Parse(_configuration["Jwt:ExpireMinutes"] ?? "60");

            var response = new LoginResponseDto
            {
                AccessToken = accessToken,
                RefreshToken = refreshToken.Token,
                ExpiresAt = DateTime.UtcNow.AddMinutes(expireMinutes),
                UserId = user.UserId,
                FullName = user.FullName,
                Email = user.Email,
                Role = user.Role?.RoleName ?? "buyer",
                ImageUrl = user.ImageUrl
            };

            return (true, "Đăng nhập thành công.", response);
        }


        public async Task<(bool Success, string Message, LoginResponseDto? Data)> ProcessGoogleUserAsync(
            string email, 
            string? fullName, 
            string? picture, 
            string? ipAddress, 
            CancellationToken cancellationToken = default)
        {
            var normalizedEmail = email.ToLowerInvariant().Trim();
            var user = await _userRepository.GetUserByEmailAsync(normalizedEmail, cancellationToken);

            if (user == null)
            {
                // Tạo user mới từ tài khoản Google
                var buyerRole = await _userRepository.GetRoleByNameAsync("buyer", cancellationToken);
                user = new User
                {
                    RoleId = buyerRole?.RoleId ?? 2,
                    FullName = !string.IsNullOrWhiteSpace(fullName) ? fullName : "Google User",
                    Email = normalizedEmail,
                    ImageUrl = picture ?? "/AvatarImage/avt_default.jpg",
                    EmailConfirmedAt = DateTime.UtcNow,
                    Status = true,
                    IsLocked = false
                };

                await _userRepository.CreateUserAsync(user, cancellationToken);
                await _userRepository.CreateCartForUserAsync(user.UserId, cancellationToken);

                // Load lại user kèm Role
                user = await _userRepository.GetUserByIdAsync(user.UserId, cancellationToken);
            }
            else
            {
                if (user.IsLocked)
                {
                    return (false, $"Tài khoản đã bị khóa: {user.LockReason ?? "Vi phạm chính sách"}", null);
                }

                // Cập nhật avatar hoặc email confirmed nếu chưa có
                if (user.EmailConfirmedAt == null)
                {
                    user.EmailConfirmedAt = DateTime.UtcNow;
                    await _userRepository.UpdateUserAsync(user, cancellationToken);
                }
            }

            if (user == null)
            {
                return (false, "Không thể xác thực thông tin người dùng.", null);
            }

            var accessToken = _tokenService.GenerateAccessToken(user);
            var refreshToken = _tokenService.GenerateRefreshToken(user.UserId, ipAddress);

            await _userRepository.AddRefreshTokenAsync(refreshToken, cancellationToken);

            var expireMinutes = int.Parse(_configuration["Jwt:ExpireMinutes"] ?? "60");

            var response = new LoginResponseDto
            {
                AccessToken = accessToken,
                RefreshToken = refreshToken.Token,
                ExpiresAt = DateTime.UtcNow.AddMinutes(expireMinutes),
                UserId = user.UserId,
                FullName = user.FullName,
                Email = user.Email,
                Role = user.Role?.RoleName ?? "buyer",
                ImageUrl = user.ImageUrl
            };

            return (true, "Đăng nhập Google thành công.", response);
        }

        public async Task<(bool Success, string Message, LoginResponseDto? Data)> RefreshTokenAsync(
            string token, 
            string? ipAddress, 
            CancellationToken cancellationToken = default)
        {
            var refreshToken = await _userRepository.GetRefreshTokenWithUserAsync(token, cancellationToken);
            if (refreshToken == null)
            {
                return (false, "Refresh Token không tồn tại.", null);
            }

            var user = refreshToken.User;

            // Nếu token đã bị thu hồi trước đó -> Cảnh báo bảo mật: Thu hồi toàn bộ token của User
            if (refreshToken.IsRevoked)
            {
                await _userRepository.RevokeAllUserRefreshTokensAsync(
                    user.UserId, 
                    ipAddress ?? "Unknown", 
                    $"Phát hiện token đã bị thu hồi được tái sử dụng: {token}", 
                    cancellationToken);

                return (false, "Token không hợp lệ. Vui lòng đăng nhập lại.", null);
            }

            if (refreshToken.IsExpired)
            {
                return (false, "Refresh Token đã hết hạn. Vui lòng đăng nhập lại.", null);
            }

            if (user.IsLocked || !user.Status)
            {
                return (false, "Tài khoản người dùng đã bị khóa hoặc ngừng hoạt động.", null);
            }

            // Xoay vòng Token (Rotation): Thu hồi token cũ và sinh token mới
            var newRefreshToken = _tokenService.GenerateRefreshToken(user.UserId, ipAddress);

            refreshToken.RevokedAt = DateTime.UtcNow;
            refreshToken.RevokedByIp = ipAddress;
            refreshToken.ReplacedByToken = newRefreshToken.Token;
            refreshToken.ReasonRevoked = "Replaced by new token";

            await _userRepository.UpdateRefreshTokenAsync(refreshToken, cancellationToken);
            await _userRepository.AddRefreshTokenAsync(newRefreshToken, cancellationToken);

            var newAccessToken = _tokenService.GenerateAccessToken(user);
            var expireMinutes = int.Parse(_configuration["Jwt:ExpireMinutes"] ?? "60");

            var response = new LoginResponseDto
            {
                AccessToken = newAccessToken,
                RefreshToken = newRefreshToken.Token,
                ExpiresAt = DateTime.UtcNow.AddMinutes(expireMinutes),
                UserId = user.UserId,
                FullName = user.FullName,
                Email = user.Email,
                Role = user.Role?.RoleName ?? "buyer",
                ImageUrl = user.ImageUrl
            };

            return (true, "Làm mới Token thành công.", response);
        }

        public async Task<(bool Success, string Message)> RevokeTokenAsync(
            string token, 
            string? ipAddress, 
            CancellationToken cancellationToken = default)
        {
            var refreshToken = await _userRepository.GetRefreshTokenWithUserAsync(token, cancellationToken);
            if (refreshToken == null || !refreshToken.IsActive)
            {
                return (false, "Token không hợp lệ hoặc đã bị thu hồi trước đó.");
            }

            refreshToken.RevokedAt = DateTime.UtcNow;
            refreshToken.RevokedByIp = ipAddress;
            refreshToken.ReasonRevoked = "Thu hồi bởi người dùng (Đăng xuất)";

            await _userRepository.UpdateRefreshTokenAsync(refreshToken, cancellationToken);
            return (true, "Thu hồi Token thành công.");
        }

        public async Task<(bool Success, string Message)> VerifyEmailAsync(
            string token, 
            CancellationToken cancellationToken = default)
        {
            var user = await _userRepository.GetUserByEmailConfirmationTokenAsync(token, cancellationToken);
            if (user == null)
            {
                return (false, "Token xác thực không hợp lệ hoặc tài khoản đã được xác thực trước đó.");
            }

            if (user.EmailConfirmationTokenExpiresAt != null && user.EmailConfirmationTokenExpiresAt < DateTime.UtcNow)
            {
                return (false, "Token xác thực đã hết hạn. Vui lòng yêu cầu gửi lại email xác thực.");
            }

            user.EmailConfirmedAt = DateTime.UtcNow;
            user.EmailConfirmationToken = null;
            user.EmailConfirmationTokenExpiresAt = null;
            user.Status = true;

            await _userRepository.UpdateUserAsync(user, cancellationToken);
            return (true, "Xác thực email thành công! Bây giờ bạn có thể đăng nhập.");
        }

        public async Task<(bool Success, string Message)> ResendVerificationEmailAsync(
            string email, 
            CancellationToken cancellationToken = default)
        {
            var user = await _userRepository.GetUserByEmailAsync(email, cancellationToken);
            if (user == null)
            {
                return (true, "Nếu email tồn tại trong hệ thống, liên kết xác thực đã được gửi.");
            }

            if (user.EmailConfirmedAt != null)
            {
                return (false, "Tài khoản này đã được xác thực email từ trước.");
            }

            var newToken = GenerateRandomToken();
            user.EmailConfirmationToken = newToken;
            user.EmailConfirmationTokenExpiresAt = DateTime.UtcNow.AddHours(24);

            await _userRepository.UpdateUserAsync(user, cancellationToken);

            _ = Task.Run(async () =>
            {
                try
                {
                    await _emailSender.SendConfirmationEmailAsync(user.Email, user.FullName, newToken);
                }
                catch (Exception ex)
                {
                    _logger.LogError(ex, "Lỗi khi gửi lại email xác thực đến {Email}", user.Email);
                }
            }, CancellationToken.None);

            return (true, "Liên kết xác thực mới đã được gửi vào hộp thư của bạn.");
        }

        public async Task<(bool Success, string Message)> ForgotPasswordAsync(
            string email, 
            CancellationToken cancellationToken = default)
        {
            var user = await _userRepository.GetUserByEmailAsync(email, cancellationToken);
            if (user == null)
            {
                return (true, "Nếu email tồn tại trong hệ thống, hướng dẫn đặt lại mật khẩu đã được gửi.");
            }

            var resetToken = GenerateRandomToken();
            user.PasswordResetToken = resetToken;
            user.PasswordResetTokenExpiresAt = DateTime.UtcNow.AddMinutes(15);

            await _userRepository.UpdateUserAsync(user, cancellationToken);

            _ = Task.Run(async () =>
            {
                try
                {
                    await _emailSender.SendPasswordResetEmailAsync(user.Email, user.FullName, resetToken);
                }
                catch (Exception ex)
                {
                    _logger.LogError(ex, "Lỗi khi gửi email đặt lại mật khẩu đến {Email}", user.Email);
                }
            }, CancellationToken.None);

            return (true, "Hướng dẫn đặt lại mật khẩu đã được gửi vào hòm thư của bạn.");
        }

        public async Task<(bool Success, string Message)> ResetPasswordAsync(
            ResetPasswordDto request, 
            CancellationToken cancellationToken = default)
        {
            var user = await _userRepository.GetUserByPasswordResetTokenAsync(request.Token, cancellationToken);
            if (user == null)
            {
                return (false, "Token đặt lại mật khẩu không hợp lệ hoặc đã được sử dụng.");
            }

            if (user.PasswordResetTokenExpiresAt != null && user.PasswordResetTokenExpiresAt < DateTime.UtcNow)
            {
                return (false, "Token đặt lại mật khẩu đã hết hạn. Vui lòng yêu cầu lại.");
            }

            user.PasswordHash = BCrypt.Net.BCrypt.HashPassword(request.NewPassword);
            user.PasswordResetToken = null;
            user.PasswordResetTokenExpiresAt = null;

            await _userRepository.UpdateUserAsync(user, cancellationToken);

            // Thu hồi toàn bộ Refresh Tokens cũ để bắt buộc đăng nhập lại
            await _userRepository.RevokeAllUserRefreshTokensAsync(user.UserId, "System", "Password reset", cancellationToken);

            return (true, "Đặt lại mật khẩu thành công. Bạn có thể đăng nhập bằng mật khẩu mới.");
        }

        public async Task<UserMeResponseDto?> GetUserProfileAsync(
            int userId, 
            CancellationToken cancellationToken = default)
        {
            var user = await _userRepository.GetUserByIdAsync(userId, cancellationToken);
            if (user == null) return null;

            return new UserMeResponseDto
            {
                UserId = user.UserId,
                FullName = user.FullName,
                Email = user.Email,
                PhoneNumber = user.PhoneNumber,
                Role = user.Role?.RoleName ?? "buyer",
                Status = user.Status,
                IsLocked = user.IsLocked,
                ImageUrl = user.ImageUrl,
                Address = user.Address,
                HasPassword = !string.IsNullOrEmpty(user.PasswordHash),
                CreatedAt = user.CreatedAt,
                UpdatedAt = user.UpdatedAt
            };
        }

        private static string GenerateRandomToken()
        {
            return Convert.ToHexString(RandomNumberGenerator.GetBytes(32));
        }
    }
}