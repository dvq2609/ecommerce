using System.ComponentModel.DataAnnotations;
using System.ComponentModel.DataAnnotations.Schema;
using Microsoft.EntityFrameworkCore;

namespace Backend.Models
{
    [Table("Product")]
    [Index(nameof(ProductId), Name = "IX_Product_ProductId", IsUnique = true)]
    public class Product
    {
        [Key]
        [DatabaseGenerated(DatabaseGeneratedOption.Identity)]
        public int ProductId { get; set; }
        
        [Required]
        [ForeignKey("User")]
        public int SellerId { get; set; }


        [Required]
        [ForeignKey("Category")]
        public int CategoryId { get; set; }

        [Required]
        [ForeignKey("Brand")]
        public int BrandId { get; set; }

        [Required]
        [MaxLength(100)]
        public string ProductName { get; set; } = string.Empty;

        [Required]
        [MaxLength(10000)]
        public string ProductDescription { get; set; } = string.Empty;

        [Required]
        public string Slug { get; set; } = string.Empty;

        [Required]
        [Range(0.1, double.MaxValue)]
        [Column(TypeName = "decimal(18,2)")]
        public decimal Price { get; set; }

        [Required]
        [Range(0, int.MaxValue)]
        public int StockQuantity { get; set; }

        [Required]
        public bool IsActive { get; set; } = true;

        [Required]
        public DateTime ImportDate { get; set; }

        // Fashion & Material specifications
        [MaxLength(200)]
        public string Material { get; set; } = string.Empty;

        [MaxLength(200)]
        public string Origin { get; set; } = string.Empty;

        [MaxLength(200)]
        public string Style { get; set; } = string.Empty;

        [MaxLength(200)]
        public string Fit { get; set; } = string.Empty;

        [MaxLength(300)]
        public string CareInstructions { get; set; } = string.Empty;

        [Range(0, 5)]
        [Column(TypeName = "decimal(3,2)")]
        public decimal AverageRating { get; set; } = 5.0m;

        [Range(0, int.MaxValue)]
        public int RatingCount { get; set; } = 0;

        // Navigation properties
        public virtual Category Category { get; set; } = null!;
        public virtual Brand Brand { get; set; } = null!;
        public virtual ICollection<ProductImage> Images { get; set; } = new List<ProductImage>();
        public virtual ICollection<ProductVariant> Variants { get; set; } = new List<ProductVariant>();
        public virtual ICollection<Review> Reviews { get; set; } = new List<Review>();
        public virtual User Seller {get;set;} = null!;
    }
}