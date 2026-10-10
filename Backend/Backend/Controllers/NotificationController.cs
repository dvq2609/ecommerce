using Backend.Models.DTOs.NotificationDTOs;
using Backend.Services.NotificationService;
using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;

namespace Backend.Controllers
{
    [ApiController]
    [Route("api/[controller]")]
    [Authorize]
    public class NotificationController : ControllerBase
    {
        private readonly INotificationService _notificationService;

        public NotificationController(INotificationService notificationService)
        {
            _notificationService = notificationService;
        }

        private int GetCurrentUserId()
        {
            var claim = User.FindFirst("UserId")?.Value;
            return int.TryParse(claim, out var id) ? id : 0;
        }

        [HttpGet]
        public async Task<IActionResult> GetNotifications([FromQuery] int pageNumber = 1, [FromQuery] int pageSize = 20)
        {
            var userId = GetCurrentUserId();
            if (userId == 0) return Unauthorized(new { message = "Không xác định được danh tính người dùng." });

            var (items, totalCount, unreadCount) = await _notificationService.GetUserNotificationsAsync(userId, pageNumber, pageSize);
            return Ok(new
            {
                success = true,
                data = new
                {
                    items,
                    totalCount,
                    unreadCount,
                    pageNumber,
                    pageSize
                }
            });
        }

        [HttpGet("unread-count")]
        public async Task<IActionResult> GetUnreadCount()
        {
            var userId = GetCurrentUserId();
            if (userId == 0) return Unauthorized(new { message = "Không xác định được danh tính người dùng." });

            var unreadCount = await _notificationService.GetUnreadCountAsync(userId);
            return Ok(new { success = true, unreadCount });
        }

        [HttpPut("{id}/read")]
        public async Task<IActionResult> MarkAsRead(int id)
        {
            var userId = GetCurrentUserId();
            if (userId == 0) return Unauthorized(new { message = "Không xác định được danh tính người dùng." });

            var success = await _notificationService.MarkAsReadAsync(id, userId);
            return Ok(new { success });
        }

        [HttpPut("read-all")]
        public async Task<IActionResult> MarkAllAsRead()
        {
            var userId = GetCurrentUserId();
            if (userId == 0) return Unauthorized(new { message = "Không xác định được danh tính người dùng." });

            var success = await _notificationService.MarkAllAsReadAsync(userId);
            return Ok(new { success });
        }
    }
}
