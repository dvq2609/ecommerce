using Microsoft.EntityFrameworkCore;
using System.ComponentModel.DataAnnotations;
using System.ComponentModel.DataAnnotations.Schema;
using Backend.Models.Enums;
namespace Backend.Models
{
    [Table("UserProfile")]
    [Index(nameof(ProfileId), Name = "IX_UserProfile_ProfileId", IsUnique = true)]
    public class UserProfile
    {
        [Key]
        [DatabaseGenerated(DatabaseGeneratedOption.Identity)]
        public int ProfileId { get; set; }

        [Required]
        [ForeignKey("User")]
        public int UserId { get; set; }

        [Required]
        [MaxLength(255)]
        public string School { get; set; } = string.Empty;

        [Required]
        [MaxLength(255)]
        public string Major { get; set; } = string.Empty;

        [Required]
        [Column(TypeName = "decimal(3,2)")]
        public decimal Gpa { get; set; }

        [Required]
        [MaxLength(255)]
        public string TargetPosition { get; set; } = string.Empty;

        [Required]
        public Gender Gender { get; set; }

        [Required]
        public DateTime CreatedAt { get; set; }

        public DateTime? UpdatedAt { get; set; }

        // Navigation property
        public virtual User User { get; set; } = null!;
    }
}