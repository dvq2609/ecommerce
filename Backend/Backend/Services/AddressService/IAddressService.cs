using Backend.Models.DTOs;

namespace Backend.Services.AddressService
{
    public interface IAddressService
    {
        Task<List<UserAddressDto>> GetUserAddressesAsync(int userId, CancellationToken cancellationToken = default);
        Task<UserAddressDto?> GetAddressByIdAsync(int addressId, int userId, CancellationToken cancellationToken = default);
        Task<UserAddressDto?> GetDefaultAddressAsync(int userId, CancellationToken cancellationToken = default);
        Task<UserAddressDto> CreateAddressAsync(int userId, CreateAddressRequestDto request, CancellationToken cancellationToken = default);
        Task<UserAddressDto?> UpdateAddressAsync(int addressId, int userId, UpdateAddressRequestDto request, CancellationToken cancellationToken = default);
        Task<bool> DeleteAddressAsync(int addressId, int userId, CancellationToken cancellationToken = default);
        Task<bool> SetDefaultAddressAsync(int addressId, int userId, CancellationToken cancellationToken = default);
    }
}
