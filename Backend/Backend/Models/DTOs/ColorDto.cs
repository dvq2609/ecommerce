using System.ComponentModel.DataAnnotations;

namespace Backend.Models.DTOs
{
    public class ColorDto
    {
        public int ColorId { get; set; }
        public string ColorName { get; set; } = string.Empty;
        public string HexCode { get; set; } = string.Empty;
    }

    public class CreateColorDto
    {
        [Required(ErrorMessage = "Tên màu là bắt buộc.")]
        [MaxLength(50)]
        public string ColorName { get; set; } = string.Empty;

        [Required(ErrorMessage = "Mã màu Hex là bắt buộc.")]
        [MaxLength(20)]
        public string HexCode { get; set; } = string.Empty;
    }

    public class UpdateColorDto
    {
        [MaxLength(50)]
        public string? ColorName { get; set; }

        [MaxLength(20)]
        public string? HexCode { get; set; }
    }
}
