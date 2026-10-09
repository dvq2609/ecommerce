using Backend.Models;

namespace Backend.Repositories.ShippingRepo
{
    public interface IShippingRepository
    {
        // Settings
        Task<ShippingSetting> GetSettingsAsync();
        Task<ShippingSetting> UpdateSettingsAsync(ShippingSetting settings);

        // Rules
        Task<List<ShippingRule>> GetAllRulesAsync(bool includeInactive = true);
        Task<ShippingRule?> GetRuleByIdAsync(int id);
        Task<ShippingRule> CreateRuleAsync(ShippingRule rule);
        Task<ShippingRule> UpdateRuleAsync(ShippingRule rule);
        Task<bool> DeleteRuleAsync(int id);
    }
}
