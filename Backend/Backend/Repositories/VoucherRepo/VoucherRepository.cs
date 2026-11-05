using Backend.Models;
using Backend.Models.DTOs;
using Backend.Models.Enums;
using Microsoft.EntityFrameworkCore;

namespace Backend.Repositories.VoucherRepo
{
    public class VoucherRepository : IVoucherRepository
    {
        private readonly ApplicationDbContext _context;

        public VoucherRepository(ApplicationDbContext context)
        {
            _context = context;
        }

        public async Task<List<Voucher>> GetAllAsync()
        {
            return await _context.Vouchers
                .OrderByDescending(v => v.IsActive)
                .ThenByDescending(v => v.CreatedAt)
                .ToListAsync();
        }

        public async Task<List<Voucher>> GetActiveVouchersAsync()
        {
            var now = DateTime.UtcNow;
            return await _context.Vouchers
                .Where(v => v.IsActive && v.StartDate <= now && v.EndDate >= now && v.UsedCount < v.UsageLimit)
                .OrderBy(v => v.MinOrderValue)
                .ToListAsync();
        }

        public async Task<Voucher?> GetByIdAsync(int voucherId)
        {
            return await _context.Vouchers.FirstOrDefaultAsync(v => v.VoucherId == voucherId);
        }

        public async Task<Voucher?> GetByCodeAsync(string code)
        {
            if (string.IsNullOrWhiteSpace(code)) return null;
            var normalized = code.Trim().ToUpperInvariant();
            return await _context.Vouchers.FirstOrDefaultAsync(v => v.Code == normalized);
        }

        public async Task<int> GetUserUsageCountAsync(int voucherId, int userId)
        {
            return await _context.VoucherUsages
                .CountAsync(vu => vu.VoucherId == voucherId && vu.UserId == userId && !vu.IsRefunded);
        }

        public async Task<Dictionary<int, int>> GetUserUsageCountsAsync(int userId, IEnumerable<int> voucherIds)
        {
            var idList = voucherIds.Distinct().ToList();
            if (idList.Count == 0) return new Dictionary<int, int>();

            return await _context.VoucherUsages
                .Where(vu => vu.UserId == userId && !vu.IsRefunded && idList.Contains(vu.VoucherId))
                .GroupBy(vu => vu.VoucherId)
                .Select(g => new { VoucherId = g.Key, Count = g.Count() })
                .ToDictionaryAsync(x => x.VoucherId, x => x.Count);
        }

        public async Task<Voucher> CreateAsync(Voucher voucher)
        {
            voucher.Code = voucher.Code.Trim().ToUpperInvariant();
            voucher.CreatedAt = DateTime.UtcNow;
            _context.Vouchers.Add(voucher);
            await _context.SaveChangesAsync();
            return voucher;
        }

        public async Task<Voucher> UpdateAsync(Voucher voucher)
        {
            voucher.Code = voucher.Code.Trim().ToUpperInvariant();
            voucher.UpdatedAt = DateTime.UtcNow;
            _context.Vouchers.Update(voucher);
            await _context.SaveChangesAsync();
            return voucher;
        }

        public async Task<bool> DeleteAsync(int voucherId)
        {
            var voucher = await _context.Vouchers
                .Include(v => v.VoucherUsages)
                .FirstOrDefaultAsync(v => v.VoucherId == voucherId);

            if (voucher == null) return false;

            // Nếu đã có đơn hàng sử dụng thì chỉ chuyển sang ngưng kích hoạt (Soft deactivate) để bảo toàn lịch sử đơn hàng
            var hasOrderReference = voucher.VoucherUsages.Count > 0 ||
                await _context.Orders.AnyAsync(o => o.DiscountVoucherId == voucherId || o.ShippingVoucherId == voucherId);

            if (hasOrderReference)
            {
                voucher.IsActive = false;
                voucher.UpdatedAt = DateTime.UtcNow;
                await _context.SaveChangesAsync();
                return true;
            }

            _context.Vouchers.Remove(voucher);
            await _context.SaveChangesAsync();
            return true;
        }

        public async Task<VoucherUsage> AddUsageAsync(VoucherUsage usage)
        {
            _context.VoucherUsages.Add(usage);
            await _context.SaveChangesAsync();
            return usage;
        }

        public async Task RefundOrderVouchersAsync(int orderId)
        {
            var usages = await _context.VoucherUsages
                .Include(vu => vu.Voucher)
                .Where(vu => vu.OrderId == orderId && !vu.IsRefunded)
                .ToListAsync();

            if (usages.Count == 0) return;

            foreach (var usage in usages)
            {
                usage.IsRefunded = true;
                if (usage.Voucher != null && usage.Voucher.UsedCount > 0)
                {
                    usage.Voucher.UsedCount -= 1;
                    usage.Voucher.UpdatedAt = DateTime.UtcNow;
                }
            }

            await _context.SaveChangesAsync();
        }

        public async Task<VoucherStatsDto> GetAdminStatsAsync()
        {
            var now = DateTime.UtcNow;
            var soon = now.AddDays(7);

            var vouchers = await _context.Vouchers.ToListAsync();
            var totalDiscountGranted = await _context.VoucherUsages
                .Where(vu => !vu.IsRefunded)
                .SumAsync(vu => (decimal?)vu.DiscountApplied) ?? 0m;

            return new VoucherStatsDto
            {
                TotalVouchers = vouchers.Count,
                ActiveVouchers = vouchers.Count(v => v.IsActive && v.StartDate <= now && v.EndDate >= now && v.UsedCount < v.UsageLimit),
                ShippingVouchersCount = vouchers.Count(v => v.DiscountType == VoucherDiscountType.FreeShipping),
                DiscountVouchersCount = vouchers.Count(v => v.DiscountType != VoucherDiscountType.FreeShipping),
                TotalRedemptions = vouchers.Sum(v => v.UsedCount),
                TotalDiscountGranted = totalDiscountGranted,
                ExpiringSoonCount = vouchers.Count(v => v.IsActive && v.EndDate >= now && v.EndDate <= soon)
            };
        }
    }
}
