using Backend.Models.DTOs;

namespace Backend.Services.PaymentService
{
    public interface IPaymentService
    {
        Task<PaymentStatusResponseDto> CheckPaymentStatusAsync(string orderCode, CancellationToken cancellationToken = default);
        Task<(bool Success, string Message)> ProcessBankWebhookAsync(BankWebhookPayloadDto payload, string? rawBody, CancellationToken cancellationToken = default);
        Task<(bool Success, string Message, PaymentStatusResponseDto? Data)> SimulatePaymentSuccessAsync(string orderCode, CancellationToken cancellationToken = default);

        // MoMo Gateway methods
        Task<(bool Success, string? PayUrl, string? Message)> CreateMoMoPaymentAsync(string orderCode, CancellationToken cancellationToken = default);
        Task<(bool Success, string Message)> HandleMoMoIpnAsync(MoMoIpnRequestDto ipn, CancellationToken cancellationToken = default);
        Task<(bool Success, string Message, PaymentStatusResponseDto? Data)> QueryMoMoTransactionAsync(string orderCode, int? resultCode = null, CancellationToken cancellationToken = default);
    }
}
