using Backend.Models.DTOs;
using Backend.Services.PaymentService;
using Microsoft.AspNetCore.Mvc;

namespace Backend.Controllers
{
    [ApiController]
    [Route("api/[controller]")]
    public class PaymentController : ControllerBase
    {
        private readonly IPaymentService _paymentService;
        private readonly ILogger<PaymentController> _logger;

        public PaymentController(IPaymentService paymentService, ILogger<PaymentController> logger)
        {
            _paymentService = paymentService;
            _logger = logger;
        }

        /// <summary>
        /// Kiểm tra trạng thái thanh toán của đơn hàng (dùng cho Polling thời gian thực ở trang OrderSuccess)
        /// </summary>
        [HttpGet("order/{orderCode}/status")]
        public async Task<IActionResult> CheckPaymentStatus(string orderCode, CancellationToken cancellationToken)
        {
            try
            {
                var status = await _paymentService.CheckPaymentStatusAsync(orderCode, cancellationToken);
                return Ok(new { success = true, data = status });
            }
            catch (KeyNotFoundException ex)
            {
                return NotFound(new { success = false, message = ex.Message });
            }
        }

        #region MoMo Endpoints

        /// <summary>
        /// Tạo phiên thanh toán qua cổng MoMo (Trả về PayUrl chuyển hướng hoặc deeplink)
        /// </summary>
        [HttpPost("momo/create/{orderCode}")]
        public async Task<IActionResult> CreateMoMoPayment(string orderCode, CancellationToken cancellationToken)
        {
            var (success, payUrl, message) = await _paymentService.CreateMoMoPaymentAsync(orderCode, cancellationToken);
            if (!success)
            {
                return BadRequest(new { success = false, message });
            }

            return Ok(new { success = true, payUrl, message });
        }

        /// <summary>
        /// Webhook IPN nhận kết quả thanh toán từ hệ thống MoMo
        /// </summary>
        [HttpPost("momo/ipn")]
        public async Task<IActionResult> MoMoIpn([FromBody] MoMoIpnRequestDto ipn, CancellationToken cancellationToken)
        {
            var (success, message) = await _paymentService.HandleMoMoIpnAsync(ipn, cancellationToken);
            if (!success)
            {
                return BadRequest(new { success = false, message });
            }

            return NoContent();
        }

        /// <summary>
        /// Callback đón người dùng sau khi hoàn tất giao diện thanh toán MoMo quay về ShopVibe
        /// </summary>
        [HttpGet("momo/callback")]
        public async Task<IActionResult> MoMoCallback(
            [FromQuery] string orderId,
            [FromQuery] int? resultCode,
            CancellationToken cancellationToken)
        {
            if (string.IsNullOrWhiteSpace(orderId))
            {
                return BadRequest(new { success = false, message = "Thiếu mã đơn hàng orderId." });
            }

            var (success, message, data) = await _paymentService.QueryMoMoTransactionAsync(orderId, resultCode, cancellationToken);
            if (!success)
            {
                return BadRequest(new { success = false, message });
            }

            return Ok(new { success = true, message, data });
        }

        #endregion
    }
}
