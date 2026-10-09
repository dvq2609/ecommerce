using Backend.Models;

namespace Backend.Repositories.AddressRepo
{
    public interface IAddressRepository
    {
        Task<List<UserAddress>> GetAddressesByUserIdAsync(int userId, CancellationToken cancellationToken = default);
        Task<UserAddress?> GetAddressByIdAsync(int addressId, int userId, CancellationToken cancellationToken = default);
        Task<UserAddress?> GetDefaultAddressAsync(int userId, CancellationToken cancellationToken = default);
        Task<UserAddress> CreateAddressAsync(UserAddress address, CancellationToken cancellationToken = default);
        Task UpdateAddressAsync(UserAddress address, CancellationToken cancellationToken = default);
        Task DeleteAddressAsync(UserAddress address, CancellationToken cancellationToken = default);
        Task SetDefaultAddressAsync(int addressId, int userId, CancellationToken cancellationToken = default);
    }
}
