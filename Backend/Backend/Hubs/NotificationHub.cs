using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.SignalR;

namespace Backend.Hubs
{
    [Authorize]
    public class NotificationHub : Hub
    {
        public static string UserGroup(int userId) => $"user:{userId}";
        public static string RoleGroup(string role) => $"role:{role.ToLower()}";

        public override async Task OnConnectedAsync()
        {
            var userIdValue = Context.User?.FindFirst("UserId")?.Value;
            var role = Context.User?.FindFirst(System.Security.Claims.ClaimTypes.Role)?.Value 
                       ?? Context.User?.FindFirst("role")?.Value;

            if (int.TryParse(userIdValue, out var userId))
            {
                // Thêm kết nối vào nhóm người nhận theo UserId
                await Groups.AddToGroupAsync(Context.ConnectionId, UserGroup(userId));
            }

            if (!string.IsNullOrWhiteSpace(role))
            {
                // Thêm kết nối vào nhóm Role (admin, seller, buyer)
                await Groups.AddToGroupAsync(Context.ConnectionId, RoleGroup(role));
            }

            await base.OnConnectedAsync();
        }

        public override async Task OnDisconnectedAsync(Exception? exception)
        {
            var userIdValue = Context.User?.FindFirst("UserId")?.Value;
            var role = Context.User?.FindFirst(System.Security.Claims.ClaimTypes.Role)?.Value 
                       ?? Context.User?.FindFirst("role")?.Value;

            if (int.TryParse(userIdValue, out var userId))
            {
                await Groups.RemoveFromGroupAsync(Context.ConnectionId, UserGroup(userId));
            }

            if (!string.IsNullOrWhiteSpace(role))
            {
                await Groups.RemoveFromGroupAsync(Context.ConnectionId, RoleGroup(role));
            }

            await base.OnDisconnectedAsync(exception);
        }
    }
}
