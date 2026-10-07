using System.Security.Claims;
using Backend.Models.DTOs;
using Backend.Services.UserService;
using Microsoft.AspNetCore.Authentication;
using Microsoft.AspNetCore.Authentication.Google;
using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;

namespace Backend.Controllers
{
    [ApiController]
    [Route("api/[controller]")]
    public class AuthController : ControllerBase
    {
        private readonly IUserService _userService;
        private readonly IConfiguration _configuration;

        public AuthController(IUserService userService, IConfiguration configuration)
        {
            _userService = userService;
            _configuration = configuration;
        }

        /// <summary>
        /// Đăng ký tài khoản người mua mới (Gửi link xác thực vào Email)
        /// </summary>
        [HttpPost("register")]
        [ProducesResponseType(typeof(RegisterResponseDto), StatusCodes.Status200OK)]
        [ProducesResponseType(StatusCodes.Status400BadRequest)]
        public async Task<IActionResult> Register([FromBody] RegisterDto request, CancellationToken cancellationToken)
        {
            if (!ModelState.IsValid) return BadRequest(ModelState);

            var ipAddress = GetIpAddress();
            var result = await _userService.RegisterAsync(request, ipAddress, cancellationToken);
            if (!result.Success)
            {
                return BadRequest(new { message = result.Message });
            }

            return Ok(result.Data);
        }

        /// <summary>
        /// Xác thực tài khoản qua Token gửi trong Email
        /// </summary>
        [HttpPost("verify-email")]
        [ProducesResponseType(StatusCodes.Status200OK)]
        [ProducesResponseType(StatusCodes.Status400BadRequest)]
        public async Task<IActionResult> VerifyEmail([FromBody] VerifyEmailDto request, CancellationToken cancellationToken)
        {
            if (!ModelState.IsValid) return BadRequest(ModelState);

            var result = await _userService.VerifyEmailAsync(request.Token, cancellationToken);
            if (!result.Success)
            {
                return BadRequest(new { message = result.Message });
            }

            return Ok(new { message = result.Message });
        }

        /// <summary>
        /// Gửi lại email xác thực tài khoản
        /// </summary>
        [HttpPost("resend-verification")]
        [ProducesResponseType(StatusCodes.Status200OK)]
        [ProducesResponseType(StatusCodes.Status400BadRequest)]
        public async Task<IActionResult> ResendVerification([FromBody] ResendVerificationEmailDto request, CancellationToken cancellationToken)
        {
            if (!ModelState.IsValid) return BadRequest(ModelState);

            var result = await _userService.ResendVerificationEmailAsync(request.Email, cancellationToken);
            if (!result.Success)
            {
                return BadRequest(new { message = result.Message });
            }

            return Ok(new { message = result.Message });
        }

        /// <summary>
        /// Đăng nhập bằng Email và Mật khẩu (Nhận Access Token + Refresh Token)
        /// </summary>
        [HttpPost("login")]
        [ProducesResponseType(typeof(LoginResponseDto), StatusCodes.Status200OK)]
        [ProducesResponseType(StatusCodes.Status400BadRequest)]
        public async Task<IActionResult> Login([FromBody] LoginDto request, CancellationToken cancellationToken)
        {
            if (!ModelState.IsValid) return BadRequest(ModelState);

            var ipAddress = GetIpAddress();
            var result = await _userService.LoginAsync(request, ipAddress, cancellationToken);
            if (!result.Success)
            {
                return BadRequest(new { message = result.Message });
            }

            return Ok(result.Data);
        }

        /// <summary>
        /// Khởi tạo đăng nhập Google OAuth 2.0 (Server Redirect Flow chuẩn ASP.NET Core)
        /// </summary>
        [HttpGet("oauth/google")]
        public IActionResult GoogleOAuthRedirect()
        {
            var properties = new AuthenticationProperties
            {
                RedirectUri = Url.Action(nameof(GoogleOAuthCallbackComplete)) ?? "/api/auth/oauth/google/complete"
            };
            return Challenge(properties, GoogleDefaults.AuthenticationScheme);
        }

        /// <summary>
        /// Callback sau khi Google xác thực thành công, tạo JWT và chuyển hướng về Frontend
        /// </summary>
        [HttpGet("oauth/google/complete")]
        public async Task<IActionResult> GoogleOAuthCallbackComplete()
        {
            var result = await HttpContext.AuthenticateAsync("External");
            var frontendUrl = _configuration["FrontendUrl"] ?? "http://localhost:5173";

            if (!result.Succeeded || result.Principal == null)
            {
                return Redirect($"{frontendUrl}/login?error={Uri.EscapeDataString("Xác thực Google thất bại.")}");
            }

            var email = result.Principal.FindFirst(ClaimTypes.Email)?.Value;
            var fullName = result.Principal.FindFirst(ClaimTypes.Name)?.Value;
            var picture = result.Principal.FindFirst("picture")?.Value 
                          ?? result.Principal.FindFirst("image")?.Value;

            if (string.IsNullOrEmpty(email))
            {
                return Redirect($"{frontendUrl}/login?error={Uri.EscapeDataString("Không tìm thấy thông tin email từ tài khoản Google.")}");
            }

            var ipAddress = GetIpAddress();
            var authResult = await _userService.ProcessGoogleUserAsync(email, fullName ?? "Google User", picture, ipAddress, HttpContext.RequestAborted);
            await HttpContext.SignOutAsync("External");

            if (!authResult.Success || authResult.Data == null)
            {
                return Redirect($"{frontendUrl}/login?error={Uri.EscapeDataString(authResult.Message)}");
            }

            // Chuyển hướng về Frontend kèm Tokens trên hash URL (giống luồng AI-SPEIS)
            var redirectUrl = $"{frontendUrl}/login#google_success=true&accessToken={authResult.Data.AccessToken}&refreshToken={authResult.Data.RefreshToken}&userId={authResult.Data.UserId}&fullName={Uri.EscapeDataString(authResult.Data.FullName)}&email={Uri.EscapeDataString(authResult.Data.Email)}&role={authResult.Data.Role}&imageUrl={Uri.EscapeDataString(authResult.Data.ImageUrl ?? "")}";

            return Redirect(redirectUrl);
        }


        /// <summary>
        /// Làm mới Access Token bằng Refresh Token (Token Rotation)
        /// </summary>
        [HttpPost("refresh-token")]
        [ProducesResponseType(typeof(LoginResponseDto), StatusCodes.Status200OK)]
        [ProducesResponseType(StatusCodes.Status400BadRequest)]
        public async Task<IActionResult> RefreshToken([FromBody] RefreshTokenRequestDto request, CancellationToken cancellationToken)
        {
            if (!ModelState.IsValid) return BadRequest(ModelState);

            var ipAddress = GetIpAddress();
            var result = await _userService.RefreshTokenAsync(request.RefreshToken, ipAddress, cancellationToken);
            if (!result.Success)
            {
                return BadRequest(new { message = result.Message });
            }

            return Ok(result.Data);
        }

        /// <summary>
        /// Thu hồi Refresh Token (Đăng xuất khỏi thiết bị)
        /// </summary>
        [HttpPost("revoke-token")]
        [ProducesResponseType(StatusCodes.Status200OK)]
        [ProducesResponseType(StatusCodes.Status400BadRequest)]
        public async Task<IActionResult> RevokeToken([FromBody] RevokeTokenRequestDto request, CancellationToken cancellationToken)
        {
            if (!ModelState.IsValid) return BadRequest(ModelState);

            var ipAddress = GetIpAddress();
            var result = await _userService.RevokeTokenAsync(request.Token, ipAddress, cancellationToken);
            if (!result.Success)
            {
                return BadRequest(new { message = result.Message });
            }

            return Ok(new { message = result.Message });
        }

        /// <summary>
        /// Yêu cầu gửi email đặt lại mật khẩu (Forgot Password)
        /// </summary>
        [HttpPost("forgot-password")]
        [ProducesResponseType(StatusCodes.Status200OK)]
        [ProducesResponseType(StatusCodes.Status400BadRequest)]
        public async Task<IActionResult> ForgotPassword([FromBody] ForgotPasswordDto request, CancellationToken cancellationToken)
        {
            if (!ModelState.IsValid) return BadRequest(ModelState);

            var result = await _userService.ForgotPasswordAsync(request.Email, cancellationToken);
            return Ok(new { message = result.Message });
        }

        /// <summary>
        /// Đặt lại mật khẩu mới bằng Token gửi trong Email
        /// </summary>
        [HttpPost("reset-password")]
        [ProducesResponseType(StatusCodes.Status200OK)]
        [ProducesResponseType(StatusCodes.Status400BadRequest)]
        public async Task<IActionResult> ResetPassword([FromBody] ResetPasswordDto request, CancellationToken cancellationToken)
        {
            if (!ModelState.IsValid) return BadRequest(ModelState);

            var result = await _userService.ResetPasswordAsync(request, cancellationToken);
            if (!result.Success)
            {
                return BadRequest(new { message = result.Message });
            }

            return Ok(new { message = result.Message });
        }

        /// <summary>
        /// Lấy thông tin cá nhân của người dùng hiện tại (Yêu cầu JWT Token)
        /// </summary>
        [HttpGet("me")]
        [Authorize]
        [ProducesResponseType(typeof(UserMeResponseDto), StatusCodes.Status200OK)]
        [ProducesResponseType(StatusCodes.Status401Unauthorized)]
        [ProducesResponseType(StatusCodes.Status404NotFound)]
        public async Task<IActionResult> GetCurrentUser(CancellationToken cancellationToken)
        {
            var userIdClaim = User.FindFirst(ClaimTypes.NameIdentifier)?.Value
                              ?? User.FindFirst("UserId")?.Value;

            if (string.IsNullOrEmpty(userIdClaim) || !int.TryParse(userIdClaim, out var userId))
            {
                return Unauthorized(new { message = "Token không hợp lệ hoặc thiếu thông tin người dùng." });
            }

            var profile = await _userService.GetUserProfileAsync(userId, cancellationToken);
            if (profile == null)
            {
                return NotFound(new { message = "Không tìm thấy thông tin người dùng." });
            }

            return Ok(profile);
        }

        private string? GetIpAddress()
        {
            if (Request.Headers.ContainsKey("X-Forwarded-For"))
            {
                return Request.Headers["X-Forwarded-For"].ToString().Split(',')[0].Trim();
            }

            return HttpContext.Connection.RemoteIpAddress?.ToString();
        }
    }
}
