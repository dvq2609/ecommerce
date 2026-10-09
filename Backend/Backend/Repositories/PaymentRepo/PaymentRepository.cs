using Backend.Models;
using Microsoft.EntityFrameworkCore;

namespace Backend.Repositories.PaymentRepo
{
    public class PaymentRepository : IPaymentRepository
    {
        private readonly ApplicationDbContext _context;

        public PaymentRepository(ApplicationDbContext context)
        {
            _context = context;
        }

        public async Task<PaymentTransaction?> GetTransactionByRefAsync(string transactionRef, CancellationToken cancellationToken = default)
        {
            return await _context.PaymentTransactions
                .FirstOrDefaultAsync(t => t.TransactionRef == transactionRef, cancellationToken);
        }

        public async Task<PaymentTransaction?> GetLatestTransactionByOrderCodeAsync(string orderCode, CancellationToken cancellationToken = default)
        {
            return await _context.PaymentTransactions
                .Where(t => t.OrderCode == orderCode)
                .OrderByDescending(t => t.CreatedAt)
                .FirstOrDefaultAsync(cancellationToken);
        }

        public async Task<PaymentTransaction> CreateTransactionAsync(PaymentTransaction transaction, CancellationToken cancellationToken = default)
        {
            await _context.PaymentTransactions.AddAsync(transaction, cancellationToken);
            await _context.SaveChangesAsync(cancellationToken);
            return transaction;
        }

        public async Task UpdateTransactionAsync(PaymentTransaction transaction, CancellationToken cancellationToken = default)
        {
            _context.PaymentTransactions.Update(transaction);
            await _context.SaveChangesAsync(cancellationToken);
        }

        public async Task<Order?> GetOrderByCodeAsync(string orderCode, CancellationToken cancellationToken = default)
        {
            return await _context.Orders
                .Include(o => o.PaymentTransactions)
                .FirstOrDefaultAsync(o => o.OrderCode == orderCode, cancellationToken);
        }

        public async Task UpdateOrderStatusAfterPaymentAsync(Order order, PaymentTransaction transaction, CancellationToken cancellationToken = default)
        {
            await using var tx = await _context.Database.BeginTransactionAsync(cancellationToken);
            try
            {
                _context.PaymentTransactions.Update(transaction);
                _context.Orders.Update(order);
                await _context.SaveChangesAsync(cancellationToken);
                await tx.CommitAsync(cancellationToken);
            }
            catch
            {
                await tx.RollbackAsync(cancellationToken);
                throw;
            }
        }
    }
}
