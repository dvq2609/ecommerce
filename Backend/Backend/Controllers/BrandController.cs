using Backend.Models.DTOs;
using Backend.Services.BrandService;
using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;

namespace Backend.Controllers
{
    [ApiController]
    [Route("api/[controller]")]
    public class BrandController : ControllerBase
    {
        private readonly IBrandService _brandService;

        public BrandController(IBrandService brandService)
        {
            _brandService = brandService;
        }

        /// <summary>Lấy tất cả thương hiệu.</summary>
        [HttpGet]
        public async Task<IActionResult> GetAll()
        {
            var brands = await _brandService.GetAllAsync();
            return Ok(new { success = true, data = brands });
        }

        /// <summary>Lấy thương hiệu theo ID.</summary>
        [HttpGet("{id:int}")]
        public async Task<IActionResult> GetById(int id)
        {
            var brand = await _brandService.GetByIdAsync(id);
            if (brand == null)
                return NotFound(new { success = false, message = "Không tìm thấy thương hiệu." });

            return Ok(new { success = true, data = brand });
        }

        /// <summary>Lấy thương hiệu theo slug.</summary>
        [HttpGet("slug/{slug}")]
        public async Task<IActionResult> GetBySlug(string slug)
        {
            var brand = await _brandService.GetBySlugAsync(slug);
            if (brand == null)
                return NotFound(new { success = false, message = "Không tìm thấy thương hiệu." });

            return Ok(new { success = true, data = brand });
        }

        /// <summary>Tạo thương hiệu mới (Admin only).</summary>
        [HttpPost]
        [Authorize(Roles = "admin")]
        public async Task<IActionResult> Create([FromBody] CreateBrandDto dto)
        {
            if (!ModelState.IsValid)
                return BadRequest(new { success = false, errors = ModelState });

            var (success, error, data) = await _brandService.CreateAsync(dto);
            if (!success)
                return BadRequest(new { success = false, message = error });

            return CreatedAtAction(nameof(GetById), new { id = data!.BrandId },
                new { success = true, message = "Tạo thương hiệu thành công.", data });
        }

        /// <summary>Cập nhật thương hiệu (Admin only).</summary>
        [HttpPut("{id:int}")]
        [Authorize(Roles = "admin")]
        public async Task<IActionResult> Update(int id, [FromBody] UpdateBrandDto dto)
        {
            if (!ModelState.IsValid)
                return BadRequest(new { success = false, errors = ModelState });

            var (success, error, data) = await _brandService.UpdateAsync(id, dto);
            if (!success)
                return BadRequest(new { success = false, message = error });

            return Ok(new { success = true, message = "Cập nhật thương hiệu thành công.", data });
        }

        /// <summary>Xóa thương hiệu (Admin only).</summary>
        [HttpDelete("{id:int}")]
        [Authorize(Roles = "admin")]
        public async Task<IActionResult> Delete(int id)
        {
            var (success, error) = await _brandService.DeleteAsync(id);
            if (!success)
                return BadRequest(new { success = false, message = error });

            return Ok(new { success = true, message = "Xóa thương hiệu thành công." });
        }
    }
}
