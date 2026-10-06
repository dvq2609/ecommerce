namespace Backend.Services.EmailService
{
    public interface IEmailSender
    {
        Task SendEmailAsync(string toEmail, string subject, string body);
        Task SendConfirmationEmailAsync(string toEmail, string fullName, string token);
        Task SendPasswordResetEmailAsync(string toEmail, string fullName, string token);
    }
}