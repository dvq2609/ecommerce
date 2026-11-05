using Backend.Models;
using Backend.Models.DTOs;

namespace Backend.Repositories.VoucherRepo
{
    public interface IVoucherRepository
    {
        Task<List<Voucher>> GetAllAsync();
        Task<List<Voucher>> GetActiveVouchersAsync();
        Task<Voucher?> GetByIdAsync(int voucherId);
        Task<Voucher?> GetByCodeAsync(string code);
        Task<int> GetUserUsageCountAsync(int voucherId, int userId);
        Task<Dictionary<int, int>> GetUserUsageCountsAsync(int userId, IEnumerable<int> voucherIds);
        Task<Voucher> CreateAsync(Voucher voucher);
        Task<Voucher> UpdateAsync(Voucher voucher);
        Task<bool> DeleteAsync(int voucherId);
        Task<VoucherUsage> AddUsageAsync(VoucherUsage usage);
        Task RefundOrderVouchersAsync(int orderId);
        Task<VoucherStatsDto> GetAdminStatsAsync();
    }
}
