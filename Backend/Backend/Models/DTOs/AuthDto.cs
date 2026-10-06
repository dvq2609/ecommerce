using System.ComponentModel.DataAnnotations;

namespace Backend.Models.DTOs
{
    public class RegisterDto
    {
        [Required(ErrorMessage = "Họ và tên là bắt buộc.")]
        [MaxLength(100, ErrorMessage = "Họ và tên không được vượt quá 100 ký tự.")]
        public string FullName { get; set; } = null!;

        [Required(ErrorMessage = "Email là bắt buộc.")]
        [EmailAddress(ErrorMessage = "Địa chỉ email không hợp lệ.")]
        [MaxLength(100, ErrorMessage = "Email không được vượt quá 100 ký tự.")]
        public string Email { get; set; } = null!;

        [MaxLength(32, ErrorMessage = "Số điện thoại không được vượt quá 32 ký tự.")]
        [RegularExpression(@"^0\d{9}$", ErrorMessage = "Số điện thoại phải có 10 chữ số và bắt đầu bằng 0.")]
        public string? PhoneNumber { get; set; }

        [Required(ErrorMessage = "Mật khẩu là bắt buộc.")]
        [MinLength(6, ErrorMessage = "Mật khẩu phải ít nhất 6 ký tự.")]
        public string Password { get; set; } = null!;
    }

    public class RegisterResponseDto
    {
        public int UserId { get; set; }
        public string FullName { get; set; } = null!;
        public string Email { get; set; } = null!;
        public string Role { get; set; } = null!;
        public bool IsEmailConfirmed { get; set; }
        public string Message { get; set; } = "Đăng ký thành công. Vui lòng kiểm tra email để xác thực tài khoản.";
    }

    public class LoginDto
    {
        [Required(ErrorMessage = "Email là bắt buộc.")]
        [EmailAddress(ErrorMessage = "Địa chỉ email không hợp lệ.")]
        public string Email { get; set; } = null!;

        [Required(ErrorMessage = "Mật khẩu là bắt buộc.")]
        public string Password { get; set; } = null!;
    }

    public class LoginResponseDto
    {
        public string AccessToken { get; set; } = null!;
        public string RefreshToken { get; set; } = null!;
        public DateTime ExpiresAt { get; set; }
        public int UserId { get; set; }
        public string FullName { get; set; } = null!;
        public string Email { get; set; } = null!;
        public string Role { get; set; } = null!;
        public string? ImageUrl { get; set; }
    }

    public class GoogleLoginDto
    {
        [Required(ErrorMessage = "Google ID Token là bắt buộc.")]
        public string IdToken { get; set; } = null!;
    }

    public class RefreshTokenRequestDto
    {
        [Required(ErrorMessage = "RefreshToken là bắt buộc.")]
        public string RefreshToken { get; set; } = null!;
    }

    public class RevokeTokenRequestDto
    {
        [Required(ErrorMessage = "Token cần thu hồi là bắt buộc.")]
        public string Token { get; set; } = null!;
    }

    public class VerifyEmailDto
    {
        [Required(ErrorMessage = "Token xác thực là bắt buộc.")]
        public string Token { get; set; } = null!;
    }

    public class ResendVerificationEmailDto
    {
        [Required(ErrorMessage = "Email là bắt buộc.")]
        [EmailAddress(ErrorMessage = "Địa chỉ email không hợp lệ.")]
        public string Email { get; set; } = null!;
    }

    public class ForgotPasswordDto
    {
        [Required(ErrorMessage = "Email là bắt buộc.")]
        [EmailAddress(ErrorMessage = "Địa chỉ email không hợp lệ.")]
        public string Email { get; set; } = null!;
    }

    public class ResetPasswordDto
    {
        [Required(ErrorMessage = "Token đặt lại mật khẩu là bắt buộc.")]
        public string Token { get; set; } = null!;

        [Required(ErrorMessage = "Mật khẩu mới là bắt buộc.")]
        [MinLength(6, ErrorMessage = "Mật khẩu mới phải ít nhất 6 ký tự.")]
        public string NewPassword { get; set; } = null!;

        [Required(ErrorMessage = "Xác nhận mật khẩu là bắt buộc.")]
        [Compare("NewPassword", ErrorMessage = "Mật khẩu xác nhận không khớp.")]
        public string ConfirmPassword { get; set; } = null!;
    }
}
