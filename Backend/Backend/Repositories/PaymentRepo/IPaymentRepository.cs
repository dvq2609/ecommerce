using Backend.Models;

namespace Backend.Repositories.PaymentRepo
{
    public interface IPaymentRepository
    {
        Task<PaymentTransaction?> GetTransactionByRefAsync(string transactionRef, CancellationToken cancellationToken = default);
        Task<PaymentTransaction?> GetLatestTransactionByOrderCodeAsync(string orderCode, CancellationToken cancellationToken = default);
        Task<PaymentTransaction> CreateTransactionAsync(PaymentTransaction transaction, CancellationToken cancellationToken = default);
        Task UpdateTransactionAsync(PaymentTransaction transaction, CancellationToken cancellationToken = default);
        Task<Order?> GetOrderByCodeAsync(string orderCode, CancellationToken cancellationToken = default);
        Task UpdateOrderStatusAfterPaymentAsync(Order order, PaymentTransaction transaction, CancellationToken cancellationToken = default);
    }
}
