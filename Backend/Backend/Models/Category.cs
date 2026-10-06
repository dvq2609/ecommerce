using System.ComponentModel.DataAnnotations;
using System.ComponentModel.DataAnnotations.Schema;
using Microsoft.EntityFrameworkCore;
namespace Backend.Models
{
    [Table("Category")]
    [Index(nameof(CategoryId), Name = "IX_Category_CategoryId", IsUnique = true)]
    public class Category
    {
        [Key]
        [DatabaseGenerated(DatabaseGeneratedOption.Identity)]
        public int CategoryId { get; set; }

        [Required]
        [MaxLength(100)]
        public string CategoryName { get; set; } = string.Empty;

        [Required]
        [MaxLength(10000)]
        public string CategoryDescription { get; set; } = string.Empty;

        [Required]
        public string Slug { get; set; } = string.Empty;

        //vitural

        public virtual ICollection<Product> Products { get; set; } = new List<Product>();

    }
}