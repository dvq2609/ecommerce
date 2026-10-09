using Backend.Models;
using Backend.Models.DTOs;
using Backend.Repositories.AddressRepo;

namespace Backend.Services.AddressService
{
    public class AddressService : IAddressService
    {
        private readonly IAddressRepository _addressRepository;
        private readonly ILogger<AddressService> _logger;

        public AddressService(IAddressRepository addressRepository, ILogger<AddressService> logger)
        {
            _addressRepository = addressRepository;
            _logger = logger;
        }

        public async Task<List<UserAddressDto>> GetUserAddressesAsync(int userId, CancellationToken cancellationToken = default)
        {
            var addresses = await _addressRepository.GetAddressesByUserIdAsync(userId, cancellationToken);
            return addresses.Select(MapToDto).ToList();
        }

        public async Task<UserAddressDto?> GetAddressByIdAsync(int addressId, int userId, CancellationToken cancellationToken = default)
        {
            var address = await _addressRepository.GetAddressByIdAsync(addressId, userId, cancellationToken);
            return address == null ? null : MapToDto(address);
        }

        public async Task<UserAddressDto?> GetDefaultAddressAsync(int userId, CancellationToken cancellationToken = default)
        {
            var address = await _addressRepository.GetDefaultAddressAsync(userId, cancellationToken);
            return address == null ? null : MapToDto(address);
        }

        public async Task<UserAddressDto> CreateAddressAsync(int userId, CreateAddressRequestDto request, CancellationToken cancellationToken = default)
        {
            var fullAddress = BuildFullAddress(request.StreetAddress, request.Ward, request.District, request.ProvinceCity);

            var address = new UserAddress
            {
                UserId = userId,
                ReceiverName = request.ReceiverName.Trim(),
                ReceiverPhone = request.ReceiverPhone.Trim(),
                StreetAddress = request.StreetAddress.Trim(),
                ProvinceCity = request.ProvinceCity.Trim(),
                District = string.IsNullOrWhiteSpace(request.District) ? null : request.District.Trim(),
                Ward = string.IsNullOrWhiteSpace(request.Ward) ? null : request.Ward.Trim(),
                FullAddress = fullAddress,
                AddressType = string.IsNullOrWhiteSpace(request.AddressType) ? "Nhà riêng" : request.AddressType.Trim(),
                IsDefault = request.IsDefault,
                CreatedAt = DateTime.UtcNow
            };

            var created = await _addressRepository.CreateAddressAsync(address, cancellationToken);
            _logger.LogInformation("Người dùng #{UserId} đã tạo địa chỉ mới #{AddressId}", userId, created.AddressId);
            return MapToDto(created);
        }

        public async Task<UserAddressDto?> UpdateAddressAsync(int addressId, int userId, UpdateAddressRequestDto request, CancellationToken cancellationToken = default)
        {
            var address = await _addressRepository.GetAddressByIdAsync(addressId, userId, cancellationToken);
            if (address == null) return null;

            address.ReceiverName = request.ReceiverName.Trim();
            address.ReceiverPhone = request.ReceiverPhone.Trim();
            address.StreetAddress = request.StreetAddress.Trim();
            address.ProvinceCity = request.ProvinceCity.Trim();
            address.District = string.IsNullOrWhiteSpace(request.District) ? null : request.District.Trim();
            address.Ward = string.IsNullOrWhiteSpace(request.Ward) ? null : request.Ward.Trim();
            address.FullAddress = BuildFullAddress(request.StreetAddress, request.Ward, request.District, request.ProvinceCity);
            address.AddressType = string.IsNullOrWhiteSpace(request.AddressType) ? "Nhà riêng" : request.AddressType.Trim();
            address.IsDefault = request.IsDefault;

            await _addressRepository.UpdateAddressAsync(address, cancellationToken);
            _logger.LogInformation("Người dùng #{UserId} đã cập nhật địa chỉ #{AddressId}", userId, addressId);
            return MapToDto(address);
        }

        public async Task<bool> DeleteAddressAsync(int addressId, int userId, CancellationToken cancellationToken = default)
        {
            var address = await _addressRepository.GetAddressByIdAsync(addressId, userId, cancellationToken);
            if (address == null) return false;

            await _addressRepository.DeleteAddressAsync(address, cancellationToken);
            _logger.LogInformation("Người dùng #{UserId} đã xóa địa chỉ #{AddressId}", userId, addressId);
            return true;
        }

        public async Task<bool> SetDefaultAddressAsync(int addressId, int userId, CancellationToken cancellationToken = default)
        {
            var address = await _addressRepository.GetAddressByIdAsync(addressId, userId, cancellationToken);
            if (address == null) return false;

            await _addressRepository.SetDefaultAddressAsync(addressId, userId, cancellationToken);
            _logger.LogInformation("Người dùng #{UserId} đã đặt địa chỉ #{AddressId} làm mặc định", userId, addressId);
            return true;
        }

        private static string BuildFullAddress(string street, string? ward, string? district, string city)
        {
            var parts = new List<string> { street.Trim() };
            if (!string.IsNullOrWhiteSpace(ward)) parts.Add(ward.Trim());
            if (!string.IsNullOrWhiteSpace(district)) parts.Add(district.Trim());
            parts.Add(city.Trim());
            return string.Join(", ", parts);
        }

        private static UserAddressDto MapToDto(UserAddress entity)
        {
            return new UserAddressDto
            {
                AddressId = entity.AddressId,
                UserId = entity.UserId,
                ReceiverName = entity.ReceiverName,
                ReceiverPhone = entity.ReceiverPhone,
                StreetAddress = entity.StreetAddress,
                ProvinceCity = entity.ProvinceCity,
                District = entity.District,
                Ward = entity.Ward,
                FullAddress = entity.FullAddress,
                AddressType = entity.AddressType,
                IsDefault = entity.IsDefault,
                CreatedAt = entity.CreatedAt,
                UpdatedAt = entity.UpdatedAt
            };
        }
    }
}
