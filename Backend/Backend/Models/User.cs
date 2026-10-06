using System.ComponentModel.DataAnnotations;
using System.ComponentModel.DataAnnotations.Schema;
using Microsoft.EntityFrameworkCore;
namespace Backend.Models
{
    [Table("Users")]
    [Index(nameof(UserId), Name = "IX_Users_UserId", IsUnique = true)]
    public class User
    {
        [Key]
        [DatabaseGenerated(DatabaseGeneratedOption.Identity)]
        public int UserId { get; set; }

        [Required]
        [ForeignKey("Role")]
        public int RoleId { get; set; }

        [Required]
        [MaxLength(100)]
        public string FullName { get; set; } = string.Empty;

        [Required]
        [MaxLength(100)]
        [EmailAddress]
        public string Email { get; set; } = string.Empty;
        public string? Address { get; set; } = string.Empty;

        [Phone]
        public string? PhoneNumber { get; set; }

        public string? PasswordHash { get; set; }

        public bool Status { get; set; } = true;

        public bool IsLocked { get; set; } = false;

        [MaxLength(500)]
        public string? LockReason { get; set; }

        public DateTime? LockedAt { get; set; }

        public int? LockedByUserId { get; set; }

        public string? EmailConfirmationToken { get; set; }

        public DateTime? EmailConfirmationTokenExpiresAt { get; set; }

        public DateTime? EmailConfirmedAt { get; set; }

        public string? PasswordResetToken { get; set; }

        public DateTime? PasswordResetTokenExpiresAt { get; set; }
        [MaxLength(256)]
        public string? ImageUrl { get; set; }

        public DateTime CreatedAt { get; set; } = DateTime.UtcNow;

        public DateTime? UpdatedAt { get; set; }

        // Navigation property
        public virtual Role Role { get; set; } = null!;
        public virtual ICollection<RefreshToken> RefreshTokens { get; set; } = new List<RefreshToken>();
    }
}