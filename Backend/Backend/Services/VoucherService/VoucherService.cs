using Backend.Models;
using Backend.Models.DTOs;
using Backend.Models.Enums;
using Backend.Repositories.VoucherRepo;

namespace Backend.Services.VoucherService
{
    public class VoucherService : IVoucherService
    {
        private readonly IVoucherRepository _voucherRepository;

        public VoucherService(IVoucherRepository voucherRepository)
        {
            _voucherRepository = voucherRepository;
        }

        public async Task<List<VoucherDto>> GetPublicVouchersAsync()
        {
            var active = await _voucherRepository.GetActiveVouchersAsync();
            return active.Select(MapToDto).ToList();
        }

        public async Task<AvailableVouchersGroupedDto> GetAvailableVouchersForBuyerAsync(int userId, decimal orderTotal, decimal shippingFee)
        {
            var active = await _voucherRepository.GetActiveVouchersAsync();
            var usageMap = await _voucherRepository.GetUserUsageCountsAsync(userId, active.Select(v => v.VoucherId));

            var shippingList = new List<AvailableVoucherDto>();
            var discountList = new List<AvailableVoucherDto>();

            foreach (var v in active)
            {
                var usedByUser = usageMap.TryGetValue(v.VoucherId, out var c) ? c : 0;
                var availDto = EvaluateVoucherForBuyer(v, usedByUser, orderTotal, shippingFee);

                if (v.DiscountType == VoucherDiscountType.FreeShipping)
                    shippingList.Add(availDto);
                else
                    discountList.Add(availDto);
            }

            return new AvailableVouchersGroupedDto
            {
                ShippingVouchers = shippingList
                    .OrderByDescending(v => v.IsEligible)
                    .ThenByDescending(v => v.CalculatedDiscount)
                    .ToList(),
                DiscountVouchers = discountList
                    .OrderByDescending(v => v.IsEligible)
                    .ThenByDescending(v => v.CalculatedDiscount)
                    .ToList()
            };
        }

        public async Task<CalculateVoucherStackResultDto> CalculateVoucherStackAsync(int userId, CalculateVoucherStackRequestDto request)
        {
            var result = new CalculateVoucherStackResultDto
            {
                Success = true,
                FinalShippingFee = request.ShippingFee,
                FinalAmount = request.OrderTotal + request.ShippingFee
            };

            string? shippingCode = string.IsNullOrWhiteSpace(request.ShippingVoucherCode)
                ? null
                : request.ShippingVoucherCode.Trim().ToUpperInvariant();
            string? discountCode = string.IsNullOrWhiteSpace(request.DiscountVoucherCode)
                ? null
                : request.DiscountVoucherCode.Trim().ToUpperInvariant();

            // Nếu người dùng nhập 1 mã vào ô nhập nhanh (QuickInputCode), tự động phân loại vào slot Freeship hoặc slot Giảm giá
            if (!string.IsNullOrWhiteSpace(request.QuickInputCode))
            {
                var quickNormalized = request.QuickInputCode.Trim().ToUpperInvariant();
                var quickVoucher = await _voucherRepository.GetByCodeAsync(quickNormalized);
                if (quickVoucher == null)
                {
                    throw new InvalidOperationException($"Mã ưu đãi '{quickNormalized}' không tồn tại.");
                }

                if (quickVoucher.DiscountType == VoucherDiscountType.FreeShipping)
                {
                    shippingCode = quickVoucher.Code;
                }
                else
                {
                    discountCode = quickVoucher.Code;
                }
            }

            var messages = new List<string>();

            // 1. Kiểm tra & Tính toán Mã Freeship (nếu có)
            if (!string.IsNullOrWhiteSpace(shippingCode))
            {
                var shipVoucher = await _voucherRepository.GetByCodeAsync(shippingCode);
                if (shipVoucher == null)
                {
                    throw new InvalidOperationException($"Mã vận chuyển '{shippingCode}' không tồn tại.");
                }
                if (shipVoucher.DiscountType != VoucherDiscountType.FreeShipping)
                {
                    throw new InvalidOperationException($"Mã '{shippingCode}' là mã giảm giá đơn hàng, không phải mã Freeship.");
                }

                var userUsed = await _voucherRepository.GetUserUsageCountAsync(shipVoucher.VoucherId, userId);
                var eval = EvaluateVoucherForBuyer(shipVoucher, userUsed, request.OrderTotal, request.ShippingFee);
                if (!eval.IsEligible)
                {
                    throw new InvalidOperationException($"Mã Freeship '{shippingCode}': {eval.IneligibleReason}");
                }

                result.AppliedShippingVoucherCode = shipVoucher.Code;
                result.AppliedShippingVoucher = eval;
                result.ShippingDiscountAmount = eval.CalculatedDiscount;
                messages.Add($"Đã áp dụng mã Freeship {shipVoucher.Code} (-{result.ShippingDiscountAmount:N0}₫)");
            }

            // 2. Kiểm tra & Tính toán Mã Giảm Giá Đơn Hàng (nếu có)
            if (!string.IsNullOrWhiteSpace(discountCode))
            {
                var discVoucher = await _voucherRepository.GetByCodeAsync(discountCode);
                if (discVoucher == null)
                {
                    throw new InvalidOperationException($"Mã giảm giá '{discountCode}' không tồn tại.");
                }
                if (discVoucher.DiscountType == VoucherDiscountType.FreeShipping)
                {
                    throw new InvalidOperationException($"Mã '{discountCode}' là mã Freeship, không phải mã giảm giá tiền hàng.");
                }

                var userUsed = await _voucherRepository.GetUserUsageCountAsync(discVoucher.VoucherId, userId);
                var eval = EvaluateVoucherForBuyer(discVoucher, userUsed, request.OrderTotal, request.ShippingFee);
                if (!eval.IsEligible)
                {
                    throw new InvalidOperationException($"Mã giảm giá '{discountCode}': {eval.IneligibleReason}");
                }

                result.AppliedDiscountVoucherCode = discVoucher.Code;
                result.AppliedDiscountVoucher = eval;
                result.ProductDiscountAmount = eval.CalculatedDiscount;
                messages.Add($"Đã áp dụng mã giảm giá {discVoucher.Code} (-{result.ProductDiscountAmount:N0}₫)");
            }

            result.FinalShippingFee = Math.Max(0m, request.ShippingFee - result.ShippingDiscountAmount);
            var discountedSubtotal = Math.Max(0m, request.OrderTotal - result.ProductDiscountAmount);
            result.FinalAmount = discountedSubtotal + result.FinalShippingFee;
            result.Message = messages.Count > 0
                ? string.Join(" • ", messages)
                : "Chưa áp dụng mã ưu đãi nào.";

            return result;
        }

        public async Task<AdminVoucherListResponseDto> GetAdminVouchersAsync()
        {
            var stats = await _voucherRepository.GetAdminStatsAsync();
            var items = await _voucherRepository.GetAllAsync();

            return new AdminVoucherListResponseDto
            {
                Stats = stats,
                Items = items.Select(MapToDto).ToList()
            };
        }

        public async Task<VoucherDto> CreateVoucherByAdminAsync(CreateUpdateVoucherDto dto)
        {
            var code = dto.Code.Trim().ToUpperInvariant();
            var existing = await _voucherRepository.GetByCodeAsync(code);
            if (existing != null)
            {
                throw new InvalidOperationException($"Mã ưu đãi '{code}' đã tồn tại trên hệ thống.");
            }

            ValidateVoucherRules(dto);

            var voucher = new Voucher
            {
                Code = code,
                Title = dto.Title.Trim(),
                Description = string.IsNullOrWhiteSpace(dto.Description) ? null : dto.Description.Trim(),
                DiscountType = dto.DiscountType,
                DiscountValue = dto.DiscountValue,
                MaxDiscountAmount = dto.DiscountType == VoucherDiscountType.Percentage ? dto.MaxDiscountAmount : null,
                MinOrderValue = dto.MinOrderValue,
                StartDate = dto.StartDate,
                EndDate = dto.EndDate,
                UsageLimit = dto.UsageLimit,
                MaxUsagePerUser = dto.MaxUsagePerUser,
                IsActive = dto.IsActive
            };

            var created = await _voucherRepository.CreateAsync(voucher);
            return MapToDto(created);
        }

        public async Task<VoucherDto> UpdateVoucherByAdminAsync(int voucherId, CreateUpdateVoucherDto dto)
        {
            var voucher = await _voucherRepository.GetByIdAsync(voucherId);
            if (voucher == null)
            {
                throw new KeyNotFoundException($"Không tìm thấy voucher ID={voucherId}.");
            }

            var code = dto.Code.Trim().ToUpperInvariant();
            if (!string.Equals(voucher.Code, code, StringComparison.OrdinalIgnoreCase))
            {
                var duplicate = await _voucherRepository.GetByCodeAsync(code);
                if (duplicate != null && duplicate.VoucherId != voucherId)
                {
                    throw new InvalidOperationException($"Mã ưu đãi '{code}' đã tồn tại trên hệ thống.");
                }
            }

            ValidateVoucherRules(dto);

            voucher.Code = code;
            voucher.Title = dto.Title.Trim();
            voucher.Description = string.IsNullOrWhiteSpace(dto.Description) ? null : dto.Description.Trim();
            voucher.DiscountType = dto.DiscountType;
            voucher.DiscountValue = dto.DiscountValue;
            voucher.MaxDiscountAmount = dto.DiscountType == VoucherDiscountType.Percentage ? dto.MaxDiscountAmount : null;
            voucher.MinOrderValue = dto.MinOrderValue;
            voucher.StartDate = dto.StartDate;
            voucher.EndDate = dto.EndDate;
            voucher.UsageLimit = dto.UsageLimit;
            voucher.MaxUsagePerUser = dto.MaxUsagePerUser;
            voucher.IsActive = dto.IsActive;

            var updated = await _voucherRepository.UpdateAsync(voucher);
            return MapToDto(updated);
        }

        public async Task<VoucherDto> ToggleVoucherActiveByAdminAsync(int voucherId)
        {
            var voucher = await _voucherRepository.GetByIdAsync(voucherId);
            if (voucher == null)
            {
                throw new KeyNotFoundException($"Không tìm thấy voucher ID={voucherId}.");
            }

            voucher.IsActive = !voucher.IsActive;
            var updated = await _voucherRepository.UpdateAsync(voucher);
            return MapToDto(updated);
        }

        public async Task<bool> DeleteVoucherByAdminAsync(int voucherId)
        {
            return await _voucherRepository.DeleteAsync(voucherId);
        }

        // ─────────────────────────────────────────────────────────────────────
        // HELPERS
        // ─────────────────────────────────────────────────────────────────────
        public static AvailableVoucherDto EvaluateVoucherForBuyer(Voucher v, int userUsedCount, decimal orderTotal, decimal shippingFee)
        {
            var now = DateTime.UtcNow;
            bool isEligible = true;
            string? reason = null;
            decimal missingAmount = 0m;

            if (!v.IsActive)
            {
                isEligible = false;
                reason = "Mã ưu đãi đã tạm ngưng.";
            }
            else if (now < v.StartDate)
            {
                isEligible = false;
                reason = $"Chương trình bắt đầu từ {v.StartDate:dd/MM/yyyy}.";
            }
            else if (now > v.EndDate)
            {
                isEligible = false;
                reason = "Mã ưu đãi đã hết hạn sử dụng.";
            }
            else if (v.UsedCount >= v.UsageLimit)
            {
                isEligible = false;
                reason = "Mã ưu đãi đã hết lượt sử dụng.";
            }
            else if (userUsedCount >= v.MaxUsagePerUser)
            {
                isEligible = false;
                reason = $"Bạn đã dùng hết lượt ({v.MaxUsagePerUser} lần) cho mã này.";
            }
            else if (orderTotal < v.MinOrderValue)
            {
                isEligible = false;
                missingAmount = v.MinOrderValue - orderTotal;
                reason = $"Mua thêm {missingAmount:N0}₫ để đạt đơn tối thiểu {v.MinOrderValue:N0}₫.";
            }
            else if (v.DiscountType == VoucherDiscountType.FreeShipping && shippingFee <= 0)
            {
                isEligible = false;
                reason = "Đơn hàng đã được miễn phí vận chuyển.";
            }

            var calcDiscount = CalculateRawDiscount(v, orderTotal, shippingFee);

            return new AvailableVoucherDto
            {
                VoucherId = v.VoucherId,
                Code = v.Code,
                Title = v.Title,
                Description = v.Description,
                DiscountType = v.DiscountType,
                DiscountValue = v.DiscountValue,
                MaxDiscountAmount = v.MaxDiscountAmount,
                MinOrderValue = v.MinOrderValue,
                StartDate = v.StartDate,
                EndDate = v.EndDate,
                UsageLimit = v.UsageLimit,
                UsedCount = v.UsedCount,
                MaxUsagePerUser = v.MaxUsagePerUser,
                IsActive = v.IsActive,
                CreatedAt = v.CreatedAt,
                IsEligible = isEligible,
                IneligibleReason = reason,
                MissingAmountToQualify = missingAmount,
                CalculatedDiscount = calcDiscount,
                UserUsedCount = userUsedCount
            };
        }

        public static decimal CalculateRawDiscount(Voucher v, decimal orderTotal, decimal shippingFee)
        {
            if (orderTotal <= 0) return 0m;

            switch (v.DiscountType)
            {
                case VoucherDiscountType.Percentage:
                {
                    var raw = Math.Round(orderTotal * (v.DiscountValue / 100m), 0, MidpointRounding.AwayFromZero);
                    if (v.MaxDiscountAmount.HasValue && v.MaxDiscountAmount.Value > 0)
                    {
                        raw = Math.Min(raw, v.MaxDiscountAmount.Value);
                    }
                    return Math.Min(raw, orderTotal);
                }
                case VoucherDiscountType.FixedAmount:
                    return Math.Min(v.DiscountValue, orderTotal);

                case VoucherDiscountType.FreeShipping:
                    if (shippingFee <= 0) return 0m;
                    return v.DiscountValue > 0
                        ? Math.Min(v.DiscountValue, shippingFee)
                        : shippingFee;

                default:
                    return 0m;
            }
        }

        private static void ValidateVoucherRules(CreateUpdateVoucherDto dto)
        {
            if (dto.EndDate <= dto.StartDate)
            {
                throw new InvalidOperationException("Ngày kết thúc phải sau ngày bắt đầu.");
            }

            if (dto.DiscountType == VoucherDiscountType.Percentage && (dto.DiscountValue <= 0 || dto.DiscountValue > 100))
            {
                throw new InvalidOperationException("Mức giảm theo phần trăm (%) phải nằm trong khoảng từ 1% đến 100%.");
            }
        }

        private static VoucherDto MapToDto(Voucher v) => new()
        {
            VoucherId = v.VoucherId,
            Code = v.Code,
            Title = v.Title,
            Description = v.Description,
            DiscountType = v.DiscountType,
            DiscountValue = v.DiscountValue,
            MaxDiscountAmount = v.MaxDiscountAmount,
            MinOrderValue = v.MinOrderValue,
            StartDate = v.StartDate,
            EndDate = v.EndDate,
            UsageLimit = v.UsageLimit,
            UsedCount = v.UsedCount,
            MaxUsagePerUser = v.MaxUsagePerUser,
            IsActive = v.IsActive,
            CreatedAt = v.CreatedAt
        };
    }
}
