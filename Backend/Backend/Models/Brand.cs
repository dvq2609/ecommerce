using System.ComponentModel.DataAnnotations;
using System.ComponentModel.DataAnnotations.Schema;
using Microsoft.EntityFrameworkCore;
namespace Backend.Models
{
    [Table("Brand")]
    [Index(nameof(BrandId), Name = "IX_Brand_BrandId", IsUnique = true)]
    public class Brand
    {
        [Key]
        [DatabaseGenerated(DatabaseGeneratedOption.Identity)]
        public int BrandId { get; set; }

        [Required]
        [MaxLength(100)]
        public string BrandName { get; set; } = string.Empty;

        [Required]
        [MaxLength(10000)]
        public string BrandDescription { get; set; } = string.Empty;

        [Required]
        public string Slug { get; set; } = string.Empty;

        //vitural

        public virtual ICollection<Product> Products { get; set; } = new List<Product>();

    }
}