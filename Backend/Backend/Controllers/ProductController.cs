using Backend.Models.DTOs;
using Backend.Services.ProductService;
using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;

namespace Backend.Controllers
{
    [ApiController]
    [Route("api/[controller]")]
    public class ProductController : ControllerBase
    {
        private readonly IProductService _productService;

        public ProductController(IProductService productService)
        {
            _productService = productService;
        }

        /// <summary>
        /// Lấy danh sách sản phẩm có phân trang, lọc, tìm kiếm.
        /// </summary>
        [HttpGet]
        public async Task<IActionResult> GetAll([FromQuery] ProductQueryDto query)
        {
            var result = await _productService.GetPagedAsync(query);
            return Ok(new { success = true, data = result });
        }

        /// <summary>Lấy sản phẩm theo ID.</summary>
        [HttpGet("{id:int}")]
        public async Task<IActionResult> GetById(int id)
        {
            var product = await _productService.GetByIdAsync(id);
            if (product == null)
                return NotFound(new { success = false, message = "Không tìm thấy sản phẩm." });

            return Ok(new { success = true, data = product });
        }

        /// <summary>
        /// Lấy chi tiết sản phẩm theo ID (kèm thông số vải, cây phân loại màu/size, reviews và tồn kho từng biến thể cho UI).
        /// </summary>
        [HttpGet("{id:int}/detail")]
        public async Task<IActionResult> GetDetailById(int id)
        {
            var product = await _productService.GetDetailByIdAsync(id);
            if (product == null)
                return NotFound(new { success = false, message = "Không tìm thấy sản phẩm." });

            return Ok(new { success = true, data = product });
        }

        /// <summary>Lấy sản phẩm theo slug.</summary>
        [HttpGet("slug/{slug}")]
        public async Task<IActionResult> GetBySlug(string slug)
        {
            var product = await _productService.GetBySlugAsync(slug);
            if (product == null)
                return NotFound(new { success = false, message = "Không tìm thấy sản phẩm." });

            return Ok(new { success = true, data = product });
        }

        /// <summary>
        /// Lấy chi tiết sản phẩm theo Slug (kèm thông số vải, cây phân loại màu/size, reviews và tồn kho từng biến thể cho UI).
        /// </summary>
        [HttpGet("slug/{slug}/detail")]
        public async Task<IActionResult> GetDetailBySlug(string slug)
        {
            var product = await _productService.GetDetailBySlugAsync(slug);
            if (product == null)
                return NotFound(new { success = false, message = "Không tìm thấy sản phẩm." });

            return Ok(new { success = true, data = product });
        }

        /// <summary>Lấy danh sách biến thể của sản phẩm.</summary>
        [HttpGet("{id:int}/variants")]
        public async Task<IActionResult> GetVariants(int id)
        {
            var variants = await _productService.GetVariantsByProductIdAsync(id);
            return Ok(new { success = true, data = variants });
        }

        /// <summary>Cập nhật giá và tồn kho của 1 biến thể (Admin only).</summary>
        [HttpPatch("variants/{variantId:int}")]
        [Authorize(Roles = "admin")]
        public async Task<IActionResult> UpdateVariant(int variantId, [FromBody] UpdateProductVariantDto dto)
        {
            var (success, error, data) = await _productService.UpdateVariantAsync(variantId, dto);
            if (!success)
                return BadRequest(new { success = false, message = error });

            return Ok(new { success = true, message = "Cập nhật biến thể thành công.", data });
        }

        /// <summary>Tạo sản phẩm mới (Admin & Seller).</summary>
        [HttpPost]
        [Authorize(Roles = "admin,seller")]
        public async Task<IActionResult> Create([FromBody] CreateProductDto dto)
        {
            if (!ModelState.IsValid)
                return BadRequest(new { success = false, errors = ModelState });

            var (success, error, data) = await _productService.CreateAsync(dto);
            if (!success)
                return BadRequest(new { success = false, message = error });

            return CreatedAtAction(nameof(GetById), new { id = data!.ProductId },
                new { success = true, message = "Tạo sản phẩm thành công.", data });
        }

        /// <summary>Cập nhật sản phẩm (Admin only).</summary>
        [HttpPut("{id:int}")]
        [Authorize(Roles = "admin")]
        public async Task<IActionResult> Update(int id, [FromBody] UpdateProductDto dto)
        {
            if (!ModelState.IsValid)
                return BadRequest(new { success = false, errors = ModelState });

            var (success, error, data) = await _productService.UpdateAsync(id, dto);
            if (!success)
                return BadRequest(new { success = false, message = error });

            return Ok(new { success = true, message = "Cập nhật sản phẩm thành công.", data });
        }

        /// <summary>Xóa sản phẩm (Admin only).</summary>
        [HttpDelete("{id:int}")]
        [Authorize(Roles = "admin")]
        public async Task<IActionResult> Delete(int id)
        {
            var (success, error) = await _productService.DeleteAsync(id);
            if (!success)
                return BadRequest(new { success = false, message = error });

            return Ok(new { success = true, message = "Xóa sản phẩm thành công." });
        }

        // ─── IMAGE MANAGEMENT ────────────────────────────────────────────────────

        /// <summary>Thêm ảnh vào sản phẩm (Admin only).</summary>
        [HttpPost("{id:int}/images")]
        [Authorize(Roles = "admin")]
        public async Task<IActionResult> AddImages(int id, [FromBody] List<ProductImageInputDto> images)
        {
            if (images == null || images.Count == 0)
                return BadRequest(new { success = false, message = "Danh sách ảnh không được rỗng." });

            var (success, error) = await _productService.AddImagesAsync(id, images);
            if (!success)
                return BadRequest(new { success = false, message = error });

            return Ok(new { success = true, message = "Thêm ảnh thành công." });
        }

        /// <summary>Xóa ảnh sản phẩm (Admin only).</summary>
        [HttpDelete("{id:int}/images/{imageId:int}")]
        [Authorize(Roles = "admin")]
        public async Task<IActionResult> DeleteImage(int id, int imageId)
        {
            var (success, error) = await _productService.DeleteImageAsync(id, imageId);
            if (!success)
                return BadRequest(new { success = false, message = error });

            return Ok(new { success = true, message = "Xóa ảnh thành công." });
        }

        /// <summary>Đặt ảnh chính cho sản phẩm (Admin only).</summary>
        [HttpPatch("{id:int}/images/{imageId:int}/set-primary")]
        [Authorize(Roles = "admin")]
        public async Task<IActionResult> SetPrimaryImage(int id, int imageId)
        {
            var (success, error) = await _productService.SetPrimaryImageAsync(id, imageId);
            if (!success)
                return BadRequest(new { success = false, message = error });

            return Ok(new { success = true, message = "Đặt ảnh chính thành công." });
        }
    }
}
