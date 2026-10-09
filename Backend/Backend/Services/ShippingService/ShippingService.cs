using Backend.Models;
using Backend.Models.DTOs;
using Backend.Repositories.ShippingRepo;

namespace Backend.Services.ShippingService
{
    public class ShippingService : IShippingService
    {
        private readonly IShippingRepository _shippingRepository;
        private readonly ILogger<ShippingService> _logger;

        public ShippingService(IShippingRepository shippingRepository, ILogger<ShippingService> logger)
        {
            _shippingRepository = shippingRepository;
            _logger = logger;
        }

        public async Task<ShippingSettingDto> GetPublicConfigAsync()
        {
            var setting = await _shippingRepository.GetSettingsAsync();
            return MapSettingToDto(setting);
        }

        public async Task<CalculateShippingResponseDto> CalculateShippingFeeAsync(string? destinationAddress, decimal orderTotal)
        {
            var settings = await _shippingRepository.GetSettingsAsync();
            var rules = await _shippingRepository.GetAllRulesAsync(includeInactive: false);

            decimal fee = settings.DefaultShippingFee;
            string matchedRule = "Mặc định toàn quốc";
            string estDelivery = "2 - 4 ngày";

            if (!string.IsNullOrWhiteSpace(destinationAddress))
            {
                var addrLower = destinationAddress.Trim().ToLowerInvariant();

                // Tìm rule khớp với tỉnh/thành trong địa chỉ nhận
                var rule = rules.FirstOrDefault(r =>
                    !string.IsNullOrWhiteSpace(r.ToLocation) &&
                    r.ToLocation != "Toàn quốc" &&
                    r.ToLocation != "*" &&
                    addrLower.Contains(r.ToLocation.Trim().ToLowerInvariant()));

                if (rule != null)
                {
                    fee = rule.Fee;
                    matchedRule = $"{rule.FromLocation} → {rule.ToLocation}";
                    estDelivery = rule.EstimatedDeliveryDays ?? estDelivery;
                }
                else
                {
                    // Fallback to "Toàn quốc" rule if exists
                    var nationalRule = rules.FirstOrDefault(r => r.ToLocation == "Toàn quốc" || r.ToLocation == "*");
                    if (nationalRule != null)
                    {
                        fee = nationalRule.Fee;
                        matchedRule = nationalRule.ToLocation;
                        estDelivery = nationalRule.EstimatedDeliveryDays ?? estDelivery;
                    }
                }
            }

            var originalFee = fee;
            bool isFreeShipping = settings.IsFreeShippingEnabled && orderTotal >= settings.FreeShippingThreshold;
            if (isFreeShipping)
            {
                fee = 0m;
            }

            return new CalculateShippingResponseDto
            {
                ShippingFee = fee,
                OriginalFee = originalFee,
                FreeShippingThreshold = settings.FreeShippingThreshold,
                IsFreeShipping = isFreeShipping,
                MatchedRule = matchedRule,
                EstimatedDeliveryDays = estDelivery
            };
        }

        public async Task<ShippingSettingDto> GetAdminSettingsAsync()
        {
            var setting = await _shippingRepository.GetSettingsAsync();
            return MapSettingToDto(setting);
        }

        public async Task<ShippingSettingDto> UpdateAdminSettingsAsync(UpdateShippingSettingDto dto)
        {
            var setting = new ShippingSetting
            {
                FreeShippingThreshold = dto.FreeShippingThreshold,
                DefaultShippingFee = dto.DefaultShippingFee,
                IsFreeShippingEnabled = dto.IsFreeShippingEnabled
            };

            var updated = await _shippingRepository.UpdateSettingsAsync(setting);
            _logger.LogInformation("Cập nhật ShippingSettings: Ngưỡng Freeship = {Threshold:N0}₫, Phí mặc định = {Fee:N0}₫, Freeship = {Enabled}",
                updated.FreeShippingThreshold, updated.DefaultShippingFee, updated.IsFreeShippingEnabled);

            return MapSettingToDto(updated);
        }

        public async Task<List<ShippingRuleDto>> GetAllRulesAsync()
        {
            var rules = await _shippingRepository.GetAllRulesAsync(includeInactive: true);
            return rules.Select(MapRuleToDto).ToList();
        }

        public async Task<ShippingRuleDto?> GetRuleByIdAsync(int id)
        {
            var rule = await _shippingRepository.GetRuleByIdAsync(id);
            return rule == null ? null : MapRuleToDto(rule);
        }

        public async Task<ShippingRuleDto> CreateRuleAsync(CreateShippingRuleDto dto)
        {
            var rule = new ShippingRule
            {
                FromLocation = dto.FromLocation.Trim(),
                ToLocation = dto.ToLocation.Trim(),
                Fee = dto.Fee,
                EstimatedDeliveryDays = dto.EstimatedDeliveryDays?.Trim(),
                IsActive = dto.IsActive
            };

            var created = await _shippingRepository.CreateRuleAsync(rule);
            _logger.LogInformation("Tạo ShippingRule #{Id}: {From} -> {To}, Phí: {Fee:N0}₫",
                created.ShippingRuleId, created.FromLocation, created.ToLocation, created.Fee);

            return MapRuleToDto(created);
        }

        public async Task<ShippingRuleDto> UpdateRuleAsync(int id, UpdateShippingRuleDto dto)
        {
            var rule = await _shippingRepository.GetRuleByIdAsync(id);
            if (rule == null)
            {
                throw new KeyNotFoundException($"Không tìm thấy quy tắc vận chuyển ID={id}.");
            }

            rule.FromLocation = dto.FromLocation.Trim();
            rule.ToLocation = dto.ToLocation.Trim();
            rule.Fee = dto.Fee;
            rule.EstimatedDeliveryDays = dto.EstimatedDeliveryDays?.Trim();
            rule.IsActive = dto.IsActive;

            var updated = await _shippingRepository.UpdateRuleAsync(rule);
            _logger.LogInformation("Cập nhật ShippingRule #{Id}: {From} -> {To}, Phí: {Fee:N0}₫",
                updated.ShippingRuleId, updated.FromLocation, updated.ToLocation, updated.Fee);

            return MapRuleToDto(updated);
        }

        public async Task<bool> DeleteRuleAsync(int id)
        {
            var success = await _shippingRepository.DeleteRuleAsync(id);
            if (success)
            {
                _logger.LogInformation("Xóa ShippingRule #{Id} thành công", id);
            }
            return success;
        }

        private static ShippingSettingDto MapSettingToDto(ShippingSetting s) => new()
        {
            Id = s.Id,
            FreeShippingThreshold = s.FreeShippingThreshold,
            DefaultShippingFee = s.DefaultShippingFee,
            IsFreeShippingEnabled = s.IsFreeShippingEnabled,
            UpdatedAt = s.UpdatedAt
        };

        private static ShippingRuleDto MapRuleToDto(ShippingRule r) => new()
        {
            ShippingRuleId = r.ShippingRuleId,
            FromLocation = r.FromLocation,
            ToLocation = r.ToLocation,
            Fee = r.Fee,
            EstimatedDeliveryDays = r.EstimatedDeliveryDays,
            IsActive = r.IsActive,
            CreatedAt = r.CreatedAt,
            UpdatedAt = r.UpdatedAt
        };
    }
}
