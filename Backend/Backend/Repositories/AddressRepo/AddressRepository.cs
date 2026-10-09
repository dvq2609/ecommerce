using Backend.Models;
using Microsoft.EntityFrameworkCore;

namespace Backend.Repositories.AddressRepo
{
    public class AddressRepository : IAddressRepository
    {
        private readonly ApplicationDbContext _context;

        public AddressRepository(ApplicationDbContext context)
        {
            _context = context;
        }

        public async Task<List<UserAddress>> GetAddressesByUserIdAsync(int userId, CancellationToken cancellationToken = default)
        {
            return await _context.UserAddresses
                .Where(a => a.UserId == userId)
                .OrderByDescending(a => a.IsDefault)
                .ThenByDescending(a => a.CreatedAt)
                .ToListAsync(cancellationToken);
        }

        public async Task<UserAddress?> GetAddressByIdAsync(int addressId, int userId, CancellationToken cancellationToken = default)
        {
            return await _context.UserAddresses
                .FirstOrDefaultAsync(a => a.AddressId == addressId && a.UserId == userId, cancellationToken);
        }

        public async Task<UserAddress?> GetDefaultAddressAsync(int userId, CancellationToken cancellationToken = default)
        {
            return await _context.UserAddresses
                .FirstOrDefaultAsync(a => a.UserId == userId && a.IsDefault, cancellationToken);
        }

        public async Task<UserAddress> CreateAddressAsync(UserAddress address, CancellationToken cancellationToken = default)
        {
            // Nếu địa chỉ đầu tiên hoặc được đánh dấu default, bỏ default các địa chỉ cũ
            var hasOther = await _context.UserAddresses.AnyAsync(a => a.UserId == address.UserId, cancellationToken);
            if (!hasOther)
            {
                address.IsDefault = true;
            }
            else if (address.IsDefault)
            {
                var existingDefaults = await _context.UserAddresses
                    .Where(a => a.UserId == address.UserId && a.IsDefault)
                    .ToListAsync(cancellationToken);
                foreach (var item in existingDefaults)
                {
                    item.IsDefault = false;
                }
            }

            await _context.UserAddresses.AddAsync(address, cancellationToken);
            await _context.SaveChangesAsync(cancellationToken);
            return address;
        }

        public async Task UpdateAddressAsync(UserAddress address, CancellationToken cancellationToken = default)
        {
            address.UpdatedAt = DateTime.UtcNow;

            if (address.IsDefault)
            {
                var otherDefaults = await _context.UserAddresses
                    .Where(a => a.UserId == address.UserId && a.AddressId != address.AddressId && a.IsDefault)
                    .ToListAsync(cancellationToken);
                foreach (var item in otherDefaults)
                {
                    item.IsDefault = false;
                }
            }

            _context.UserAddresses.Update(address);
            await _context.SaveChangesAsync(cancellationToken);
        }

        public async Task DeleteAddressAsync(UserAddress address, CancellationToken cancellationToken = default)
        {
            bool wasDefault = address.IsDefault;
            int userId = address.UserId;

            _context.UserAddresses.Remove(address);
            await _context.SaveChangesAsync(cancellationToken);

            // Nếu xóa địa chỉ mặc định, tự động gán địa chỉ còn lại gần nhất làm mặc định
            if (wasDefault)
            {
                var remaining = await _context.UserAddresses
                    .Where(a => a.UserId == userId)
                    .OrderByDescending(a => a.CreatedAt)
                    .FirstOrDefaultAsync(cancellationToken);

                if (remaining != null)
                {
                    remaining.IsDefault = true;
                    await _context.SaveChangesAsync(cancellationToken);
                }
            }
        }

        public async Task SetDefaultAddressAsync(int addressId, int userId, CancellationToken cancellationToken = default)
        {
            var addresses = await _context.UserAddresses
                .Where(a => a.UserId == userId)
                .ToListAsync(cancellationToken);

            foreach (var addr in addresses)
            {
                addr.IsDefault = (addr.AddressId == addressId);
                if (addr.AddressId == addressId)
                {
                    addr.UpdatedAt = DateTime.UtcNow;
                }
            }

            await _context.SaveChangesAsync(cancellationToken);
        }
    }
}
