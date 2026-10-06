using Backend.Models.DTOs;
using Backend.Services.CategoryService;
using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;

namespace Backend.Controllers
{
    [ApiController]
    [Route("api/[controller]")]
    public class CategoryController : ControllerBase
    {
        private readonly ICategoryService _categoryService;

        public CategoryController(ICategoryService categoryService)
        {
            _categoryService = categoryService;
        }

        /// <summary>Lấy tất cả danh mục.</summary>
        [HttpGet]
        public async Task<IActionResult> GetAll()
        {
            var categories = await _categoryService.GetAllAsync();
            return Ok(new { success = true, data = categories });
        }

        /// <summary>Lấy danh mục theo ID.</summary>
        [HttpGet("{id:int}")]
        public async Task<IActionResult> GetById(int id)
        {
            var category = await _categoryService.GetByIdAsync(id);
            if (category == null)
                return NotFound(new { success = false, message = "Không tìm thấy danh mục." });

            return Ok(new { success = true, data = category });
        }

        /// <summary>Lấy danh mục theo slug.</summary>
        [HttpGet("slug/{slug}")]
        public async Task<IActionResult> GetBySlug(string slug)
        {
            var category = await _categoryService.GetBySlugAsync(slug);
            if (category == null)
                return NotFound(new { success = false, message = "Không tìm thấy danh mục." });

            return Ok(new { success = true, data = category });
        }

        /// <summary>Tạo danh mục mới (Admin only).</summary>
        [HttpPost]
        [Authorize(Roles = "admin")]
        public async Task<IActionResult> Create([FromBody] CreateCategoryDto dto)
        {
            if (!ModelState.IsValid)
                return BadRequest(new { success = false, errors = ModelState });

            var (success, error, data) = await _categoryService.CreateAsync(dto);
            if (!success)
                return BadRequest(new { success = false, message = error });

            return CreatedAtAction(nameof(GetById), new { id = data!.CategoryId },
                new { success = true, message = "Tạo danh mục thành công.", data });
        }

        /// <summary>Cập nhật danh mục (Admin only).</summary>
        [HttpPut("{id:int}")]
        [Authorize(Roles = "admin")]
        public async Task<IActionResult> Update(int id, [FromBody] UpdateCategoryDto dto)
        {
            if (!ModelState.IsValid)
                return BadRequest(new { success = false, errors = ModelState });

            var (success, error, data) = await _categoryService.UpdateAsync(id, dto);
            if (!success)
                return BadRequest(new { success = false, message = error });

            return Ok(new { success = true, message = "Cập nhật danh mục thành công.", data });
        }

        /// <summary>Xóa danh mục (Admin only).</summary>
        [HttpDelete("{id:int}")]
        [Authorize(Roles = "admin")]
        public async Task<IActionResult> Delete(int id)
        {
            var (success, error) = await _categoryService.DeleteAsync(id);
            if (!success)
                return BadRequest(new { success = false, message = error });

            return Ok(new { success = true, message = "Xóa danh mục thành công." });
        }
    }
}
