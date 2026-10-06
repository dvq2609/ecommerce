using System.ComponentModel.DataAnnotations;
using System.ComponentModel.DataAnnotations.Schema;
using Microsoft.EntityFrameworkCore;

namespace Backend.Models
{
    [Table("RefreshTokens")]
    [Index(nameof(RefreshTokenId), Name = "IX_RefreshTokens_RefreshTokenId", IsUnique = true)]
    [Index(nameof(Token), Name = "IX_RefreshTokens_Token", IsUnique = true)]
    [Index(nameof(UserId), Name = "IX_RefreshTokens_UserId")]
    public class RefreshToken
    {
        [Key]
        [DatabaseGenerated(DatabaseGeneratedOption.Identity)]
        public int RefreshTokenId { get; set; }

        [Required]
        [ForeignKey("User")]
        public int UserId { get; set; }

        [Required]
        [MaxLength(256)]
        public string Token { get; set; } = string.Empty;

        [Required]
        public DateTime ExpiresAt { get; set; }

        public DateTime CreatedAt { get; set; } = DateTime.UtcNow;

        [MaxLength(50)]
        public string? CreatedByIp { get; set; }

        public DateTime? RevokedAt { get; set; }

        [MaxLength(50)]
        public string? RevokedByIp { get; set; }

        [MaxLength(256)]
        public string? ReplacedByToken { get; set; }

        [MaxLength(256)]
        public string? ReasonRevoked { get; set; }

        [NotMapped]
        public bool IsExpired => DateTime.UtcNow >= ExpiresAt;

        [NotMapped]
        public bool IsRevoked => RevokedAt != null;

        [NotMapped]
        public bool IsActive => !IsRevoked && !IsExpired;

        // Navigation property
        public virtual User User { get; set; } = null!;
    }
}
