using Backend.Models;
using Backend.Models.DTOs;
using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;
using Microsoft.EntityFrameworkCore;

namespace Backend.Controllers
{
    [ApiController]
    [Route("api/[controller]")]
    public class SizeController : ControllerBase
    {
        private readonly ApplicationDbContext _context;

        public SizeController(ApplicationDbContext context)
        {
            _context = context;
        }

        /// <summary>Lấy danh sách tất cả kích cỡ (sắp xếp theo DisplayOrder).</summary>
        [HttpGet]
        public async Task<IActionResult> GetAll()
        {
            var sizes = await _context.Sizes
                .OrderBy(s => s.DisplayOrder)
                .Select(s => new SizeDto
                {
                    SizeId       = s.SizeId,
                    SizeName     = s.SizeName,
                    Description  = s.Description,
                    DisplayOrder = s.DisplayOrder
                })
                .ToListAsync();

            return Ok(new { success = true, data = sizes });
        }

        /// <summary>Thêm kích cỡ mới vào danh mục (Admin only).</summary>
        [HttpPost]
        [Authorize(Roles = "admin")]
        public async Task<IActionResult> Create([FromBody] CreateSizeDto dto)
        {
            if (!ModelState.IsValid)
                return BadRequest(new { success = false, errors = ModelState });

            var trimmedName = dto.SizeName.Trim();
            if (await _context.Sizes.AnyAsync(s => s.SizeName.ToLower() == trimmedName.ToLower()))
                return BadRequest(new { success = false, message = $"Kích cỡ '{trimmedName}' đã tồn tại." });

            var size = new Size
            {
                SizeName     = trimmedName,
                Description  = dto.Description?.Trim(),
                DisplayOrder = dto.DisplayOrder > 0 ? dto.DisplayOrder : 99
            };

            _context.Sizes.Add(size);
            await _context.SaveChangesAsync();

            var result = new SizeDto
            {
                SizeId       = size.SizeId,
                SizeName     = size.SizeName,
                Description  = size.Description,
                DisplayOrder = size.DisplayOrder
            };

            return Ok(new { success = true, message = "Thêm kích cỡ thành công.", data = result });
        }
    }
}
