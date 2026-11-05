using Backend.Models.DTOs;

namespace Backend.Services.VoucherService
{
    public interface IVoucherService
    {
        Task<List<VoucherDto>> GetPublicVouchersAsync();
        Task<AvailableVouchersGroupedDto> GetAvailableVouchersForBuyerAsync(int userId, decimal orderTotal, decimal shippingFee);
        Task<CalculateVoucherStackResultDto> CalculateVoucherStackAsync(int userId, CalculateVoucherStackRequestDto request);
        Task<AdminVoucherListResponseDto> GetAdminVouchersAsync();
        Task<VoucherDto> CreateVoucherByAdminAsync(CreateUpdateVoucherDto dto);
        Task<VoucherDto> UpdateVoucherByAdminAsync(int voucherId, CreateUpdateVoucherDto dto);
        Task<VoucherDto> ToggleVoucherActiveByAdminAsync(int voucherId);
        Task<bool> DeleteVoucherByAdminAsync(int voucherId);
    }
}
