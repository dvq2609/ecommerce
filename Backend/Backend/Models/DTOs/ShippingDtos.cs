using System.ComponentModel.DataAnnotations;

namespace Backend.Models.DTOs
{
    // ─── Settings DTOs ────────────────────────────────────────────────────────
    public class ShippingSettingDto
    {
        public int Id { get; set; }
        public decimal FreeShippingThreshold { get; set; }
        public decimal DefaultShippingFee { get; set; }
        public bool IsFreeShippingEnabled { get; set; }
        public DateTime UpdatedAt { get; set; }
    }

    public class UpdateShippingSettingDto
    {
        [Range(0, 1000000000, ErrorMessage = "Ngưỡng miễn phí ship phải lớn hơn hoặc bằng 0.")]
        public decimal FreeShippingThreshold { get; set; } = 1000000m;

        [Range(0, 10000000, ErrorMessage = "Phí ship mặc định phải lớn hơn hoặc bằng 0.")]
        public decimal DefaultShippingFee { get; set; } = 30000m;

        public bool IsFreeShippingEnabled { get; set; } = true;
    }

    // ─── Rules DTOs ───────────────────────────────────────────────────────────
    public class ShippingRuleDto
    {
        public int ShippingRuleId { get; set; }
        public string FromLocation { get; set; } = string.Empty;
        public string ToLocation { get; set; } = string.Empty;
        public decimal Fee { get; set; }
        public string? EstimatedDeliveryDays { get; set; }
        public bool IsActive { get; set; }
        public DateTime CreatedAt { get; set; }
        public DateTime? UpdatedAt { get; set; }
    }

    public class CreateShippingRuleDto
    {
        [Required(ErrorMessage = "Điểm gửi hàng không được để trống.")]
        [MaxLength(100, ErrorMessage = "Điểm gửi không vượt quá 100 ký tự.")]
        public string FromLocation { get; set; } = "TP. Hồ Chí Minh";

        [Required(ErrorMessage = "Điểm nhận hàng không được để trống.")]
        [MaxLength(100, ErrorMessage = "Điểm nhận không vượt quá 100 ký tự.")]
        public string ToLocation { get; set; } = string.Empty;

        [Range(0, 10000000, ErrorMessage = "Cước phí phải lớn hơn hoặc bằng 0.")]
        public decimal Fee { get; set; } = 30000m;

        [MaxLength(50)]
        public string? EstimatedDeliveryDays { get; set; } = "2 - 4 ngày";

        public bool IsActive { get; set; } = true;
    }

    public class UpdateShippingRuleDto : CreateShippingRuleDto
    {
    }

    // ─── Calculation DTOs ─────────────────────────────────────────────────────
    public class CalculateShippingRequestDto
    {
        public string? DestinationAddress { get; set; }
        public decimal OrderTotal { get; set; }
    }

    public class CalculateShippingResponseDto
    {
        public decimal ShippingFee { get; set; }
        public decimal OriginalFee { get; set; }
        public decimal FreeShippingThreshold { get; set; }
        public bool IsFreeShipping { get; set; }
        public string MatchedRule { get; set; } = string.Empty;
        public string EstimatedDeliveryDays { get; set; } = "2 - 4 ngày";
    }
}
