using Backend.Models.DTOs;

namespace Backend.Services.ShippingService
{
    public interface IShippingService
    {
        // Public / Calculations
        Task<ShippingSettingDto> GetPublicConfigAsync();
        Task<CalculateShippingResponseDto> CalculateShippingFeeAsync(string? destinationAddress, decimal orderTotal);

        // Admin Management
        Task<ShippingSettingDto> GetAdminSettingsAsync();
        Task<ShippingSettingDto> UpdateAdminSettingsAsync(UpdateShippingSettingDto dto);
        Task<List<ShippingRuleDto>> GetAllRulesAsync();
        Task<ShippingRuleDto?> GetRuleByIdAsync(int id);
        Task<ShippingRuleDto> CreateRuleAsync(CreateShippingRuleDto dto);
        Task<ShippingRuleDto> UpdateRuleAsync(int id, UpdateShippingRuleDto dto);
        Task<bool> DeleteRuleAsync(int id);
    }
}
