using System.ComponentModel.DataAnnotations;

namespace Backend.Models.DTOs
{
    public class SizeDto
    {
        public int SizeId { get; set; }
        public string SizeName { get; set; } = string.Empty;
        public string? Description { get; set; }
        public int DisplayOrder { get; set; }
    }

    public class CreateSizeDto
    {
        [Required(ErrorMessage = "Tên kích cỡ là bắt buộc.")]
        [MaxLength(20)]
        public string SizeName { get; set; } = string.Empty;

        [MaxLength(100)]
        public string? Description { get; set; }

        public int DisplayOrder { get; set; } = 0;
    }

    public class UpdateSizeDto
    {
        [MaxLength(20)]
        public string? SizeName { get; set; }

        [MaxLength(100)]
        public string? Description { get; set; }

        public int? DisplayOrder { get; set; }
    }
}
