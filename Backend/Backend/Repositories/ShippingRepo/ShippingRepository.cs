using Backend.Models;
using Microsoft.EntityFrameworkCore;

namespace Backend.Repositories.ShippingRepo
{
    public class ShippingRepository : IShippingRepository
    {
        private readonly ApplicationDbContext _context;

        public ShippingRepository(ApplicationDbContext context)
        {
            _context = context;
        }

        public async Task<ShippingSetting> GetSettingsAsync()
        {
            var setting = await _context.ShippingSettings.FirstOrDefaultAsync();
            if (setting == null)
            {
                setting = new ShippingSetting
                {
                    FreeShippingThreshold = 1000000m,
                    DefaultShippingFee = 30000m,
                    IsFreeShippingEnabled = true,
                    UpdatedAt = DateTime.UtcNow
                };
                _context.ShippingSettings.Add(setting);
                await _context.SaveChangesAsync();
            }
            return setting;
        }

        public async Task<ShippingSetting> UpdateSettingsAsync(ShippingSetting settings)
        {
            var existing = await GetSettingsAsync();
            existing.FreeShippingThreshold = settings.FreeShippingThreshold;
            existing.DefaultShippingFee = settings.DefaultShippingFee;
            existing.IsFreeShippingEnabled = settings.IsFreeShippingEnabled;
            existing.UpdatedAt = DateTime.UtcNow;

            await _context.SaveChangesAsync();
            return existing;
        }

        public async Task<List<ShippingRule>> GetAllRulesAsync(bool includeInactive = true)
        {
            var query = _context.ShippingRules.AsQueryable();
            if (!includeInactive)
            {
                query = query.Where(r => r.IsActive);
            }
            return await query.OrderBy(r => r.ShippingRuleId).ToListAsync();
        }

        public async Task<ShippingRule?> GetRuleByIdAsync(int id)
        {
            return await _context.ShippingRules.FindAsync(id);
        }

        public async Task<ShippingRule> CreateRuleAsync(ShippingRule rule)
        {
            rule.CreatedAt = DateTime.UtcNow;
            _context.ShippingRules.Add(rule);
            await _context.SaveChangesAsync();
            return rule;
        }

        public async Task<ShippingRule> UpdateRuleAsync(ShippingRule rule)
        {
            rule.UpdatedAt = DateTime.UtcNow;
            _context.ShippingRules.Update(rule);
            await _context.SaveChangesAsync();
            return rule;
        }

        public async Task<bool> DeleteRuleAsync(int id)
        {
            var rule = await _context.ShippingRules.FindAsync(id);
            if (rule == null) return false;

            _context.ShippingRules.Remove(rule);
            await _context.SaveChangesAsync();
            return true;
        }
    }
}
