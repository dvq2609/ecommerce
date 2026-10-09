using System.ComponentModel.DataAnnotations;

namespace Backend.Models.DTOs
{
    public class UserAddressDto
    {
        public int AddressId { get; set; }
        public int UserId { get; set; }
        public string ReceiverName { get; set; } = string.Empty;
        public string ReceiverPhone { get; set; } = string.Empty;
        public string StreetAddress { get; set; } = string.Empty;
        public string ProvinceCity { get; set; } = string.Empty;
        public string? District { get; set; }
        public string? Ward { get; set; }
        public string FullAddress { get; set; } = string.Empty;
        public string AddressType { get; set; } = "Nhà riêng";
        public bool IsDefault { get; set; }
        public DateTime CreatedAt { get; set; }
        public DateTime? UpdatedAt { get; set; }
    }

    public class CreateAddressRequestDto
    {
        [Required(ErrorMessage = "Tên người nhận là bắt buộc.")]
        [MaxLength(100, ErrorMessage = "Tên người nhận không quá 100 ký tự.")]
        public string ReceiverName { get; set; } = string.Empty;

        [Required(ErrorMessage = "Số điện thoại người nhận là bắt buộc.")]
        [RegularExpression(@"^0\d{9}$", ErrorMessage = "Số điện thoại phải gồm 10 chữ số và bắt đầu bằng số 0.")]
        public string ReceiverPhone { get; set; } = string.Empty;

        [Required(ErrorMessage = "Địa chỉ chi tiết (số nhà, tên đường) là bắt buộc.")]
        [MaxLength(255, ErrorMessage = "Địa chỉ không quá 255 ký tự.")]
        public string StreetAddress { get; set; } = string.Empty;

        [Required(ErrorMessage = "Tỉnh / Thành phố là bắt buộc.")]
        [MaxLength(100, ErrorMessage = "Tỉnh/Thành phố không quá 100 ký tự.")]
        public string ProvinceCity { get; set; } = string.Empty;

        [MaxLength(100)]
        public string? District { get; set; }

        [MaxLength(100)]
        public string? Ward { get; set; }

        [MaxLength(50)]
        public string AddressType { get; set; } = "Nhà riêng"; // "Nhà riêng", "Văn phòng"

        public bool IsDefault { get; set; } = false;
    }

    public class UpdateAddressRequestDto : CreateAddressRequestDto
    {
    }
}
