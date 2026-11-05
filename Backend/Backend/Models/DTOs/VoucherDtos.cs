using System.ComponentModel.DataAnnotations;
using Backend.Models.Enums;

namespace Backend.Models.DTOs
{
    public class VoucherDto
    {
        public int VoucherId { get; set; }
        public string Code { get; set; } = string.Empty;
        public string Title { get; set; } = string.Empty;
        public string? Description { get; set; }
        public VoucherDiscountType DiscountType { get; set; }
        public string DiscountTypeName => DiscountType switch
        {
            VoucherDiscountType.Percentage => "Giảm theo %",
            VoucherDiscountType.FixedAmount => "Giảm tiền mặt",
            VoucherDiscountType.FreeShipping => "Miễn phí vận chuyển",
            _ => "Khác"
        };
        public bool IsShippingVoucher => DiscountType == VoucherDiscountType.FreeShipping;
        public decimal DiscountValue { get; set; }
        public decimal? MaxDiscountAmount { get; set; }
        public decimal MinOrderValue { get; set; }
        public DateTime StartDate { get; set; }
        public DateTime EndDate { get; set; }
        public int UsageLimit { get; set; }
        public int UsedCount { get; set; }
        public int MaxUsagePerUser { get; set; }
        public bool IsActive { get; set; }
        public DateTime CreatedAt { get; set; }
        public bool IsExpired => DateTime.UtcNow > EndDate;
        public bool IsExhausted => UsedCount >= UsageLimit;
        public int UsagePercentage => UsageLimit > 0
            ? Math.Min(100, (int)Math.Round((double)UsedCount / UsageLimit * 100))
            : 100;
    }

    public class AvailableVoucherDto : VoucherDto
    {
        public bool IsEligible { get; set; }
        public string? IneligibleReason { get; set; }
        public decimal MissingAmountToQualify { get; set; }
        public decimal CalculatedDiscount { get; set; }
        public int UserUsedCount { get; set; }
        public int RemainingUsesForUser => Math.Max(0, MaxUsagePerUser - UserUsedCount);
    }

    public class AvailableVouchersGroupedDto
    {
        public List<AvailableVoucherDto> ShippingVouchers { get; set; } = new();
        public List<AvailableVoucherDto> DiscountVouchers { get; set; } = new();
    }

    public class CalculateVoucherStackRequestDto
    {
        public string? ShippingVoucherCode { get; set; }
        public string? DiscountVoucherCode { get; set; }
        /// <summary>
        /// Trường hợp người dùng nhập nhanh 1 mã bất kỳ vào ô nhập mã, hệ thống sẽ tự nhận diện là mã Freeship hay mã Giảm giá.
        /// </summary>
        public string? QuickInputCode { get; set; }
        public decimal OrderTotal { get; set; }
        public decimal ShippingFee { get; set; }
    }

    public class CalculateVoucherStackResultDto
    {
        public bool Success { get; set; } = true;
        public string Message { get; set; } = string.Empty;

        public string? AppliedShippingVoucherCode { get; set; }
        public AvailableVoucherDto? AppliedShippingVoucher { get; set; }
        public decimal ShippingDiscountAmount { get; set; }

        public string? AppliedDiscountVoucherCode { get; set; }
        public AvailableVoucherDto? AppliedDiscountVoucher { get; set; }
        public decimal ProductDiscountAmount { get; set; }

        public decimal TotalDiscountAmount => ShippingDiscountAmount + ProductDiscountAmount;
        public decimal FinalShippingFee { get; set; }
        public decimal FinalAmount { get; set; }
    }

    public class CreateUpdateVoucherDto
    {
        [Required(ErrorMessage = "Mã voucher không được để trống.")]
        [MaxLength(50, ErrorMessage = "Mã voucher tối đa 50 ký tự.")]
        public string Code { get; set; } = string.Empty;

        [Required(ErrorMessage = "Tên chương trình không được để trống.")]
        [MaxLength(150, ErrorMessage = "Tên chương trình tối đa 150 ký tự.")]
        public string Title { get; set; } = string.Empty;

        [MaxLength(500, ErrorMessage = "Mô tả tối đa 500 ký tự.")]
        public string? Description { get; set; }

        [Required]
        public VoucherDiscountType DiscountType { get; set; } = VoucherDiscountType.FixedAmount;

        [Required]
        [Range(1, 100000000, ErrorMessage = "Giá trị giảm phải lớn hơn 0.")]
        public decimal DiscountValue { get; set; }

        public decimal? MaxDiscountAmount { get; set; }

        [Range(0, 1000000000, ErrorMessage = "Giá trị đơn tối thiểu không hợp lệ.")]
        public decimal MinOrderValue { get; set; } = 0;

        [Required]
        public DateTime StartDate { get; set; } = DateTime.UtcNow;

        [Required]
        public DateTime EndDate { get; set; } = DateTime.UtcNow.AddMonths(1);

        [Range(1, 1000000, ErrorMessage = "Giới hạn lượt dùng phải từ 1 trở lên.")]
        public int UsageLimit { get; set; } = 100;

        [Range(1, 100, ErrorMessage = "Số lần dùng mỗi khách phải từ 1 đến 100.")]
        public int MaxUsagePerUser { get; set; } = 1;

        public bool IsActive { get; set; } = true;
    }

    public class VoucherStatsDto
    {
        public int TotalVouchers { get; set; }
        public int ActiveVouchers { get; set; }
        public int ShippingVouchersCount { get; set; }
        public int DiscountVouchersCount { get; set; }
        public int TotalRedemptions { get; set; }
        public decimal TotalDiscountGranted { get; set; }
        public int ExpiringSoonCount { get; set; }
    }

    public class AdminVoucherListResponseDto
    {
        public VoucherStatsDto Stats { get; set; } = new();
        public List<VoucherDto> Items { get; set; } = new();
    }
}
