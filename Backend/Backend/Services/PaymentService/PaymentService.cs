using System.Security.Cryptography;
using System.Text;
using System.Text.Json;
using System.Text.RegularExpressions;
using Backend.Models;
using Backend.Models.DTOs;
using Backend.Models.Enums;
using Backend.Repositories.PaymentRepo;

namespace Backend.Services.PaymentService
{
    public class PaymentService : IPaymentService
    {
        private readonly IPaymentRepository _paymentRepository;
        private readonly IHttpClientFactory _httpClientFactory;
        private readonly IConfiguration _configuration;
        private readonly ILogger<PaymentService> _logger;

        public PaymentService(
            IPaymentRepository paymentRepository,
            IHttpClientFactory httpClientFactory,
            IConfiguration configuration,
            ILogger<PaymentService> logger)
        {
            _paymentRepository = paymentRepository;
            _httpClientFactory = httpClientFactory;
            _configuration = configuration;
            _logger = logger;
        }

        public async Task<PaymentStatusResponseDto> CheckPaymentStatusAsync(string orderCode, CancellationToken cancellationToken = default)
        {
            var order = await _paymentRepository.GetOrderByCodeAsync(orderCode, cancellationToken);
            if (order == null)
            {
                throw new KeyNotFoundException($"Không tìm thấy đơn hàng với mã {orderCode}");
            }

            var latestTx = order.PaymentTransactions.OrderByDescending(t => t.CreatedAt).FirstOrDefault();

            return new PaymentStatusResponseDto
            {
                OrderCode = order.OrderCode,
                PaymentStatus = order.PaymentStatus.ToString(),
                OrderStatus = order.OrderStatus.ToString(),
                IsPaid = order.PaymentStatus == PaymentStatus.Completed,
                Amount = order.FinalAmount,
                PaidAt = order.PaymentDate,
                TransactionRef = latestTx?.TransactionRef
            };
        }

        public async Task<(bool Success, string Message)> ProcessBankWebhookAsync(
            BankWebhookPayloadDto payload,
            string? rawBody,
            CancellationToken cancellationToken = default)
        {
            if (string.IsNullOrWhiteSpace(payload.Content))
            {
                return (false, "Nội dung chuyển khoản trống.");
            }

            // Tìm mã đơn hàng từ nội dung chuyển khoản: format SHOPVIBE ORD-YYMMDD-XXXX hoặc ORD-YYMMDD-XXXX
            var match = Regex.Match(payload.Content, @"ORD-\d{6}-\d{4}", RegexOptions.IgnoreCase);
            if (!match.Success)
            {
                return (false, "Không tìm thấy mã đơn hàng SHOPVIBE hợp lệ trong nội dung chuyển khoản.");
            }

            var orderCode = match.Value.ToUpperInvariant();
            var order = await _paymentRepository.GetOrderByCodeAsync(orderCode, cancellationToken);
            if (order == null)
            {
                return (false, $"Đơn hàng {orderCode} không tồn tại trên hệ thống.");
            }

            if (order.PaymentStatus == PaymentStatus.Completed)
            {
                return (true, $"Đơn hàng {orderCode} đã được thanh toán trước đó.");
            }

            // Kiểm tra số tiền chuyển có đủ không (cho phép lệch tối đa 1.000₫ do làm tròn nếu có)
            if (payload.Amount < (order.FinalAmount - 1000m))
            {
                _logger.LogWarning("Thanh toán thiếu: Đơn {OrderCode} cần {Expected:N0}₫ nhưng nhận {Actual:N0}₫",
                    orderCode, order.FinalAmount, payload.Amount);
                return (false, $"Số tiền thanh toán ({payload.Amount:N0}₫) không đủ so với giá trị đơn hàng ({order.FinalAmount:N0}₫).");
            }

            // Ghi nhận transaction
            var tx = new PaymentTransaction
            {
                OrderId = order.OrderId,
                OrderCode = order.OrderCode,
                Amount = payload.Amount,
                BankCode = payload.BankCode ?? "BANK",
                BankAccount = payload.AccountNumber ?? "ACCOUNT",
                TransactionRef = payload.TransactionId ?? Guid.NewGuid().ToString("N")[..12].ToUpperInvariant(),
                TransferContent = payload.Content,
                Status = "Success",
                PaidAt = DateTime.UtcNow,
                CreatedAt = DateTime.UtcNow,
                RawWebhookPayload = rawBody
            };

            // Cập nhật trạng thái Order: PaymentStatus -> Paid, OrderStatus -> Processing (Đang xử lý / Đã xác nhận)
            order.PaymentStatus = PaymentStatus.Completed;
            order.PaymentDate = DateTime.UtcNow;
            if (order.OrderStatus == OrderStatus.Pending)
            {
                order.OrderStatus = OrderStatus.Processing;
            }
            order.UpdatedAt = DateTime.UtcNow;

            await _paymentRepository.UpdateOrderStatusAfterPaymentAsync(order, tx, cancellationToken);
            _logger.LogInformation("Xác nhận thanh toán tự động THÀNH CÔNG cho đơn #{OrderCode}, Số tiền: {Amount:N0}₫",
                order.OrderCode, payload.Amount);

            return (true, $"Đơn hàng {orderCode} đã được xác nhận thanh toán thành công.");
        }

        public async Task<(bool Success, string Message, PaymentStatusResponseDto? Data)> SimulatePaymentSuccessAsync(
            string orderCode,
            CancellationToken cancellationToken = default)
        {
            var order = await _paymentRepository.GetOrderByCodeAsync(orderCode, cancellationToken);
            if (order == null)
            {
                return (false, $"Không tìm thấy đơn hàng {orderCode}", null);
            }

            if (order.PaymentStatus == PaymentStatus.Completed)
            {
                var currentStatus = await CheckPaymentStatusAsync(orderCode, cancellationToken);
                return (true, "Đơn hàng đã được thanh toán thành công trước đó.", currentStatus);
            }

            var mockTxRef = $"SIM-{DateTime.UtcNow:yyMMddHHmmss}-{new Random().Next(100, 999)}";

            var tx = new PaymentTransaction
            {
                OrderId = order.OrderId,
                OrderCode = order.OrderCode,
                Amount = order.FinalAmount,
                BankCode = "BANK",
                BankAccount = "ACCOUNT",
                TransactionRef = mockTxRef,
                TransferContent = $"SHOPVIBE {order.OrderCode}",
                Status = "Success",
                PaidAt = DateTime.UtcNow,
                CreatedAt = DateTime.UtcNow,
                RawWebhookPayload = "{\"source\":\"SimulatedDevGateway\",\"status\":\"Success\"}"
            };

            order.PaymentStatus = PaymentStatus.Completed;
            order.PaymentDate = DateTime.UtcNow;
            if (order.OrderStatus == OrderStatus.Pending)
            {
                order.OrderStatus = OrderStatus.Processing;
            }
            order.UpdatedAt = DateTime.UtcNow;

            await _paymentRepository.UpdateOrderStatusAfterPaymentAsync(order, tx, cancellationToken);
            _logger.LogInformation("Giả lập thanh toán VietQR thành công cho đơn #{OrderCode}", order.OrderCode);

            var status = await CheckPaymentStatusAsync(orderCode, cancellationToken);
            return (true, "Giả lập thanh toán đơn hàng thành công!", status);
        }

        #region MoMo Payment Gateway

        public async Task<(bool Success, string? PayUrl, string? Message)> CreateMoMoPaymentAsync(
            string orderCode,
            CancellationToken cancellationToken = default)
        {
            var order = await _paymentRepository.GetOrderByCodeAsync(orderCode, cancellationToken);
            if (order == null)
            {
                return (false, null, $"Không tìm thấy đơn hàng {orderCode}");
            }

            if (order.PaymentStatus == PaymentStatus.Completed)
            {
                return (false, null, "Đơn hàng đã được thanh toán thành công trước đó.");
            }

            var partnerCode = _configuration["MoMo:PartnerCode"] ?? "MOMO";
            var accessKey = _configuration["MoMo:AccessKey"] ?? "";
            var secretKey = _configuration["MoMo:SecretKey"] ?? "";
            var apiEndpoint = _configuration["MoMo:ApiEndpoint"] ?? "https://test-payment.momo.vn";
            var redirectUrl = _configuration["MoMo:RedirectUrl"] ?? "http://localhost:5173/momo-callback";
            var ipnUrl = _configuration["MoMo:IpnUrl"] ?? "https://webhook.site/placeholder";

            var requestId = Guid.NewGuid().ToString();
            var amount = Convert.ToInt64(decimal.Round(order.FinalAmount, 0, MidpointRounding.AwayFromZero)).ToString();
            var orderInfo = $"Thanh toan don hang ShopVibe #{order.OrderCode}";
            var extraData = "";
            var requestType = "captureWallet";

            // Tạo chữ ký HMAC-SHA256 theo chuẩn alphabet của MoMo
            var rawHash = $"accessKey={accessKey}&amount={amount}&extraData={extraData}&ipnUrl={ipnUrl}&orderId={order.OrderCode}&orderInfo={orderInfo}&partnerCode={partnerCode}&redirectUrl={redirectUrl}&requestId={requestId}&requestType={requestType}";
            var signature = ComputeHmacSha256(rawHash, secretKey);

            var requestData = new
            {
                partnerCode,
                partnerName = "ShopVibe Fashion",
                storeId = "ShopVibeStore",
                requestId,
                amount,
                orderId = order.OrderCode,
                orderInfo,
                redirectUrl,
                ipnUrl,
                lang = "vi",
                extraData,
                requestType,
                signature
            };

            try
            {
                var client = _httpClientFactory.CreateClient();
                var content = new StringContent(JsonSerializer.Serialize(requestData), Encoding.UTF8, "application/json");
                var response = await client.PostAsync($"{apiEndpoint}/v2/gateway/api/create", content, cancellationToken);

                var responseBody = await response.Content.ReadAsStringAsync(cancellationToken);
                var momoResponse = JsonSerializer.Deserialize<MoMoCreateResponseDto>(responseBody, new JsonSerializerOptions { PropertyNameCaseInsensitive = true });

                if (momoResponse != null && momoResponse.ResultCode == 0 && !string.IsNullOrWhiteSpace(momoResponse.PayUrl))
                {
                    _logger.LogInformation("Tạo phiên thanh toán MoMo thành công cho đơn #{OrderCode}, PayUrl: {PayUrl}",
                        order.OrderCode, momoResponse.PayUrl);
                    return (true, momoResponse.PayUrl, "Tạo phiên thanh toán MoMo thành công.");
                }

                _logger.LogWarning("Tạo phiên thanh toán MoMo thất bại: {Message} (Code: {Code})",
                    momoResponse?.Message, momoResponse?.ResultCode);
                return (false, null, momoResponse?.Message ?? "Không thể kết nối cổng MoMo.");
            }
            catch (Exception ex)
            {
                _logger.LogError(ex, "Lỗi khi gọi MoMo Create Payment API cho đơn #{OrderCode}", order.OrderCode);
                return (false, null, "Lỗi kết nối tới hệ thống MoMo: " + ex.Message);
            }
        }

        public async Task<(bool Success, string Message)> HandleMoMoIpnAsync(
            MoMoIpnRequestDto ipn,
            CancellationToken cancellationToken = default)
        {
            if (string.IsNullOrWhiteSpace(ipn.OrderId))
            {
                return (false, "Mã đơn hàng không hợp lệ.");
            }

            var order = await _paymentRepository.GetOrderByCodeAsync(ipn.OrderId, cancellationToken);
            if (order == null)
            {
                return (false, $"Không tìm thấy đơn hàng {ipn.OrderId}");
            }

            // Verify chữ ký an toàn HMAC-SHA256
            var accessKey = _configuration["MoMo:AccessKey"] ?? "";
            var secretKey = _configuration["MoMo:SecretKey"] ?? "";

            var rawHash = $"accessKey={accessKey}&amount={ipn.Amount}&extraData={ipn.ExtraData}&message={ipn.Message}&orderId={ipn.OrderId}&orderInfo={ipn.OrderInfo}&orderType={ipn.OrderType}&partnerCode={ipn.PartnerCode}&payType={ipn.PayType}&requestId={ipn.RequestId}&responseTime={ipn.ResponseTime}&resultCode={ipn.ResultCode}&transId={ipn.TransId}";
            var expectedSignature = ComputeHmacSha256(rawHash, secretKey);

            if (!CryptographicOperations.FixedTimeEquals(
                    Encoding.UTF8.GetBytes(expectedSignature),
                    Encoding.UTF8.GetBytes(ipn.Signature ?? string.Empty)))
            {
                _logger.LogWarning("MoMo IPN signature invalid cho đơn #{OrderCode}", ipn.OrderId);
                return (false, "Chữ ký MoMo không hợp lệ.");
            }

            if (order.PaymentStatus == PaymentStatus.Completed)
            {
                return (true, "Đơn hàng đã được thanh toán trước đó.");
            }

            // Kiểm tra resultCode của MoMo: 0 = Thành công
            if (ipn.ResultCode != 0)
            {
                _logger.LogWarning("MoMo thanh toán thất bại cho đơn #{OrderCode}: Code {Code}, Message: {Msg}",
                    ipn.OrderId, ipn.ResultCode, ipn.Message);
                return (false, $"Thanh toán MoMo thất bại: {ipn.Message}");
            }

            // Ghi nhận transaction
            var tx = new PaymentTransaction
            {
                OrderId = order.OrderId,
                OrderCode = order.OrderCode,
                Amount = ipn.Amount,
                BankCode = "MOMO",
                BankAccount = "MOMO_WALLET",
                TransactionRef = ipn.TransId.ToString(),
                TransferContent = ipn.OrderInfo ?? $"ShopVibe {order.OrderCode}",
                Status = "Success",
                PaidAt = DateTime.UtcNow,
                CreatedAt = DateTime.UtcNow,
                RawWebhookPayload = JsonSerializer.Serialize(ipn)
            };

            order.PaymentStatus = PaymentStatus.Completed;
            order.PaymentDate = DateTime.UtcNow;
            if (order.OrderStatus == OrderStatus.Pending)
            {
                order.OrderStatus = OrderStatus.Processing;
            }
            order.UpdatedAt = DateTime.UtcNow;

            await _paymentRepository.UpdateOrderStatusAfterPaymentAsync(order, tx, cancellationToken);
            _logger.LogInformation("Xác nhận thanh toán MoMo THÀNH CÔNG cho đơn #{OrderCode}, TransId: {TransId}",
                order.OrderCode, ipn.TransId);

            return (true, "Xác nhận thanh toán MoMo thành công.");
        }

        public async Task<(bool Success, string Message, PaymentStatusResponseDto? Data)> QueryMoMoTransactionAsync(
            string orderCode,
            int? resultCode = null,
            CancellationToken cancellationToken = default)
        {
            var order = await _paymentRepository.GetOrderByCodeAsync(orderCode, cancellationToken);
            if (order == null)
            {
                return (false, $"Không tìm thấy đơn hàng {orderCode}", null);
            }

            if (order.PaymentStatus == PaymentStatus.Completed)
            {
                var currentStatus = await CheckPaymentStatusAsync(orderCode, cancellationToken);
                return (true, "Đơn hàng đã hoàn tất thanh toán.", currentStatus);
            }

            // Nếu user quay lại từ redirectUrl với resultCode == 0 (thành công)
            if (resultCode.HasValue && resultCode.Value == 0)
            {
                var tx = new PaymentTransaction
                {
                    OrderId = order.OrderId,
                    OrderCode = order.OrderCode,
                    Amount = order.FinalAmount,
                    BankCode = "MOMO",
                    BankAccount = "MOMO_WALLET",
                    TransactionRef = $"MOMO-{DateTime.UtcNow:yyMMddHHmmss}",
                    TransferContent = $"ShopVibe {order.OrderCode}",
                    Status = "Success",
                    PaidAt = DateTime.UtcNow,
                    CreatedAt = DateTime.UtcNow,
                    RawWebhookPayload = "{\"source\":\"MoMoCallbackRedirect\",\"resultCode\":0}"
                };

                order.PaymentStatus = PaymentStatus.Completed;
                order.PaymentDate = DateTime.UtcNow;
                if (order.OrderStatus == OrderStatus.Pending)
                {
                    order.OrderStatus = OrderStatus.Processing;
                }
                order.UpdatedAt = DateTime.UtcNow;

                await _paymentRepository.UpdateOrderStatusAfterPaymentAsync(order, tx, cancellationToken);
                _logger.LogInformation("Cập nhật thanh toán MoMo thành công qua Callback Redirect cho #{OrderCode}", order.OrderCode);
            }

            var status = await CheckPaymentStatusAsync(orderCode, cancellationToken);
            return (true, "Trạng thái thanh toán đơn hàng", status);
        }

        private static string ComputeHmacSha256(string message, string secretKey)
        {
            var keyBytes = Encoding.UTF8.GetBytes(secretKey);
            var messageBytes = Encoding.UTF8.GetBytes(message);

            using var hmac = new HMACSHA256(keyBytes);
            var hashBytes = hmac.ComputeHash(messageBytes);

            return BitConverter.ToString(hashBytes).Replace("-", "").ToLower();
        }

        #endregion
    }
}
