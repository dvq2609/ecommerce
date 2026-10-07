using System.Net;
using System.Net.Mail;

namespace Backend.Services.EmailService
{
    public class EmailService : IEmailSender
    {
        private readonly IConfiguration _configuration;
        private readonly ILogger<EmailService> _logger;

        public EmailService(IConfiguration configuration, ILogger<EmailService> logger)
        {
            _configuration = configuration;
            _logger = logger;
        }

        public async Task SendEmailAsync(string toEmail, string subject, string body)
        {
            var smtpHost = _configuration["Email:SmtpHost"] ?? "smtp.gmail.com";
            var smtpPort = int.Parse(_configuration["Email:SmtpPort"] ?? "587");
            var username = _configuration["Email:Username"] ?? _configuration["EMAIL_USERNAME"];
            var password = (_configuration["Email:Password"] ?? _configuration["EMAIL_PASSWORD"])?.Replace(" ", ""); // Loại bỏ khoảng trắng nếu copy từ Google
            var fromEmail = _configuration["Email:FromEmail"] ?? _configuration["EMAIL_FROM"] ?? username ?? "noreply@ecommerce.com";
            var fromName = _configuration["Email:FromName"] ?? "Ecommerce Store";

            if (string.IsNullOrWhiteSpace(username) || string.IsNullOrWhiteSpace(password))
            {
                _logger.LogWarning("Email settings (Username/Password) are not configured. Email to {ToEmail} skipped.", toEmail);
                return;
            }

            try
            {
                using var client = new SmtpClient(smtpHost, smtpPort)
                {
                    EnableSsl = true,
                    UseDefaultCredentials = false,
                    Credentials = new NetworkCredential(username, password)
                };

                using var mailMessage = new MailMessage
                {
                    From = new MailAddress(fromEmail, fromName),
                    To = { toEmail },
                    Subject = subject,
                    Body = body,
                    IsBodyHtml = true
                };

                await client.SendMailAsync(mailMessage);
                _logger.LogInformation("Email sent successfully to {ToEmail}", toEmail);
            }
            catch (Exception ex)
            {
                _logger.LogError(ex, "Failed to send email to {ToEmail}", toEmail);
            }
        }

        public async Task SendConfirmationEmailAsync(string toEmail, string fullName, string token)
        {
            var frontendUrl = _configuration["FrontendUrl"] ?? "http://localhost:5173";
            var confirmUrl = $"{frontendUrl}/verify-email?token={Uri.EscapeDataString(token)}";

            var subject = "Confirm it's you - Ecommerce Store";
            var body = $@"
<!DOCTYPE html>
<html lang='vi'>
<head>
    <meta charset='utf-8' />
    <meta name='viewport' content='width=device-width, initial-scale=1.0' />
    <title>Xác nhận email của bạn</title>
</head>
<body style='margin: 0; padding: 40px 15px; background-color: #f7fafc; font-family: -apple-system, BlinkMacSystemFont, ""Segoe UI"", Roboto, Helvetica, Arial, sans-serif; color: #1a202c;'>
    <table role='presentation' border='0' cellpadding='0' cellspacing='0' width='100%' style='max-width: 520px; margin: 0 auto;'>
        <!-- LOGO HEADER -->
        <tr>
            <td align='center' style='padding-bottom: 28px;'>
                <div style='display: inline-flex; align-items: center; gap: 8px;'>
                    <div style='width: 32px; height: 32px; background-color: #00d66f; border-radius: 50%; display: inline-block; vertical-align: middle; text-align: center; line-height: 32px;'>
                        <span style='color: #0f172a; font-weight: 900; font-size: 18px; line-height: 32px;'>&#10148;</span>
                    </div>
                    <span style='font-size: 26px; font-weight: 800; color: #0f172a; letter-spacing: -0.5px; vertical-align: middle; margin-left: 6px;'>ecommerce</span>
                </div>
            </td>
        </tr>

        <!-- MAIN CARD CONTAINER -->
        <tr>
            <td>
                <div style='background-color: #ffffff; border-radius: 28px; padding: 40px 36px; box-shadow: 0 4px 24px rgba(0, 0, 0, 0.04); border: 1px solid #edf2f7; text-align: center;'>
                    <!-- TITLE -->
                    <h1 style='margin: 0 0 16px 0; font-size: 24px; font-weight: 700; color: #0f172a; letter-spacing: -0.3px;'>
                        Confirm it's you
                    </h1>

                    <!-- SUBTITLE / DESCRIPTION -->
                    <p style='margin: 0 0 28px 0; font-size: 15px; line-height: 1.55; color: #475569; padding: 0 10px;'>
                        Thanks for joining Ecommerce Store. To confirm it's you, please verify your email address.
                    </p>

                    <!-- ACTION BUTTON -->
                    <div style='margin-bottom: 36px;'>
                        <a href='{confirmUrl}' target='_blank' style='display: block; width: 100%; box-sizing: border-box; background-color: #00d66f; color: #0f172a !important; text-decoration: none; padding: 16px 24px; border-radius: 14px; font-size: 16px; font-weight: 700; text-align: center; transition: background-color 0.2s;'>
                            Verify your email
                        </a>
                    </div>

                    <!-- DIVIDER -->
                    <div style='height: 1px; background-color: #f1f5f9; margin-bottom: 28px;'></div>

                    <!-- INFO SECTION 1: WHAT'S ECOMMERCE -->
                    <table role='presentation' border='0' cellpadding='0' cellspacing='0' width='100%' style='text-align: left; margin-bottom: 20px;'>
                        <tr>
                            <td valign='top' style='width: 36px; padding-right: 12px;'>
                                <div style='width: 32px; height: 32px; background-color: #f8fafc; border-radius: 8px; text-align: center; line-height: 32px;'>
                                    <span style='font-size: 18px;'>💳</span>
                                </div>
                            </td>
                            <td valign='top'>
                                <div style='font-size: 14px; font-weight: 700; color: #0f172a; margin-bottom: 4px;'>What's Ecommerce?</div>
                                <div style='font-size: 13px; line-height: 1.45; color: #64748b;'>
                                    A safe, fast way to purchase and track your orders seamlessly across devices. <a href='{frontendUrl}' style='color: #00d66f; text-decoration: underline;'>Learn more</a>
                                </div>
                            </td>
                        </tr>
                    </table>

                    <!-- INFO SECTION 2: NEED SUPPORT -->
                    <table role='presentation' border='0' cellpadding='0' cellspacing='0' width='100%' style='text-align: left;'>
                        <tr>
                            <td valign='top' style='width: 36px; padding-right: 12px;'>
                                <div style='width: 32px; height: 32px; background-color: #f8fafc; border-radius: 8px; text-align: center; line-height: 32px;'>
                                    <span style='font-size: 18px;'>💬</span>
                                </div>
                            </td>
                            <td valign='top'>
                                <div style='font-size: 14px; font-weight: 700; color: #0f172a; margin-bottom: 4px;'>Need support?</div>
                                <div style='font-size: 13px; line-height: 1.45; color: #64748b;'>
                                    For questions or concerns about your account, <a href='{frontendUrl}/support' style='color: #00d66f; text-decoration: underline;'>contact Ecommerce support</a>.
                                </div>
                            </td>
                        </tr>
                    </table>
                </div>
            </td>
        </tr>

        <!-- FOOTER SECTION -->
        <tr>
            <td align='center' style='padding-top: 32px; font-size: 12px; line-height: 1.6; color: #94a3b8;'>
                <p style='margin: 0 0 6px 0; color: #64748b;'>Ecommerce Platform Inc.</p>
                <p style='margin: 0 0 14px 0;'>Hanoi, Vietnam</p>
                <p style='margin: 0 0 16px 0; color: #94a3b8;'>
                    You received this email because you registered on Ecommerce Store.<br />
                    If you didn't create an account, you can safely ignore this email.
                </p>
                <div style='color: #64748b;'>
                    <a href='{frontendUrl}/terms' style='color: #64748b; text-decoration: underline; margin: 0 6px;'>Terms</a>
                    <a href='{frontendUrl}/privacy' style='color: #64748b; text-decoration: underline; margin: 0 6px;'>Privacy</a>
                    <a href='{frontendUrl}/support' style='color: #64748b; text-decoration: underline; margin: 0 6px;'>Support</a>
                </div>
            </td>
        </tr>
    </table>
</body>
</html>";

            await SendEmailAsync(toEmail, subject, body);
        }

        public async Task SendPasswordResetEmailAsync(string toEmail, string fullName, string token)
        {
            var frontendUrl = _configuration["FrontendUrl"] ?? "http://localhost:5173";
            var resetUrl = $"{frontendUrl}/reset-password?token={Uri.EscapeDataString(token)}";

            var subject = "Reset your password - Ecommerce Store";
            var body = $@"
<!DOCTYPE html>
<html lang='vi'>
<head>
    <meta charset='utf-8' />
    <meta name='viewport' content='width=device-width, initial-scale=1.0' />
    <title>Đặt lại mật khẩu</title>
</head>
<body style='margin: 0; padding: 40px 15px; background-color: #f7fafc; font-family: -apple-system, BlinkMacSystemFont, ""Segoe UI"", Roboto, Helvetica, Arial, sans-serif; color: #1a202c;'>
    <table role='presentation' border='0' cellpadding='0' cellspacing='0' width='100%' style='max-width: 520px; margin: 0 auto;'>
        <!-- LOGO HEADER -->
        <tr>
            <td align='center' style='padding-bottom: 28px;'>
                <div style='display: inline-flex; align-items: center; gap: 8px;'>
                    <div style='width: 32px; height: 32px; background-color: #ef4444; border-radius: 50%; display: inline-block; vertical-align: middle; text-align: center; line-height: 32px;'>
                        <span style='color: #ffffff; font-weight: 900; font-size: 16px; line-height: 32px;'>&#128273;</span>
                    </div>
                    <span style='font-size: 26px; font-weight: 800; color: #0f172a; letter-spacing: -0.5px; vertical-align: middle; margin-left: 6px;'>ecommerce</span>
                </div>
            </td>
        </tr>

        <!-- MAIN CARD CONTAINER -->
        <tr>
            <td>
                <div style='background-color: #ffffff; border-radius: 28px; padding: 40px 36px; box-shadow: 0 4px 24px rgba(0, 0, 0, 0.04); border: 1px solid #edf2f7; text-align: center;'>
                    <!-- TITLE -->
                    <h1 style='margin: 0 0 16px 0; font-size: 24px; font-weight: 700; color: #0f172a; letter-spacing: -0.3px;'>
                        Reset your password
                    </h1>

                    <!-- SUBTITLE / DESCRIPTION -->
                    <p style='margin: 0 0 28px 0; font-size: 15px; line-height: 1.55; color: #475569; padding: 0 10px;'>
                        Hi <strong>{fullName}</strong>, we received a request to reset your password. Click the button below to choose a new password.
                    </p>

                    <!-- ACTION BUTTON -->
                    <div style='margin-bottom: 36px;'>
                        <a href='{resetUrl}' target='_blank' style='display: block; width: 100%; box-sizing: border-box; background-color: #0f172a; color: #ffffff !important; text-decoration: none; padding: 16px 24px; border-radius: 14px; font-size: 16px; font-weight: 700; text-align: center;'>
                            Reset password
                        </a>
                    </div>

                    <!-- DIVIDER -->
                    <div style='height: 1px; background-color: #f1f5f9; margin-bottom: 28px;'></div>

                    <!-- SECURITY NOTICE -->
                    <table role='presentation' border='0' cellpadding='0' cellspacing='0' width='100%' style='text-align: left;'>
                        <tr>
                            <td valign='top' style='width: 36px; padding-right: 12px;'>
                                <div style='width: 32px; height: 32px; background-color: #fef2f2; border-radius: 8px; text-align: center; line-height: 32px;'>
                                    <span style='font-size: 18px;'>🔒</span>
                                </div>
                            </td>
                            <td valign='top'>
                                <div style='font-size: 14px; font-weight: 700; color: #0f172a; margin-bottom: 4px;'>Security notice</div>
                                <div style='font-size: 13px; line-height: 1.45; color: #64748b;'>
                                    This password reset link will expire in 15 minutes. If you didn't request this, your account is still secure and you can ignore this email.
                                </div>
                            </td>
                        </tr>
                    </table>
                </div>
            </td>
        </tr>

        <!-- FOOTER SECTION -->
        <tr>
            <td align='center' style='padding-top: 32px; font-size: 12px; line-height: 1.6; color: #94a3b8;'>
                <p style='margin: 0 0 6px 0; color: #64748b;'>Ecommerce Platform Inc.</p>
                <div style='color: #64748b; margin-top: 10px;'>
                    <a href='{frontendUrl}/terms' style='color: #64748b; text-decoration: underline; margin: 0 6px;'>Terms</a>
                    <a href='{frontendUrl}/privacy' style='color: #64748b; text-decoration: underline; margin: 0 6px;'>Privacy</a>
                    <a href='{frontendUrl}/support' style='color: #64748b; text-decoration: underline; margin: 0 6px;'>Support</a>
                </div>
            </td>
        </tr>
    </table>
</body>
</html>";

            await SendEmailAsync(toEmail, subject, body);
        }
    }
}
