using Backend.Models;
using Backend.Models.DTOs;
using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;
using Microsoft.EntityFrameworkCore;

namespace Backend.Controllers
{
    [ApiController]
    [Route("api/[controller]")]
    public class ColorController : ControllerBase
    {
        private readonly ApplicationDbContext _context;

        public ColorController(ApplicationDbContext context)
        {
            _context = context;
        }

        /// <summary>Lấy danh sách tất cả màu sắc.</summary>
        [HttpGet]
        public async Task<IActionResult> GetAll()
        {
            var colors = await _context.Colors
                .OrderBy(c => c.ColorId)
                .Select(c => new ColorDto
                {
                    ColorId   = c.ColorId,
                    ColorName = c.ColorName,
                    HexCode   = c.HexCode
                })
                .ToListAsync();

            return Ok(new { success = true, data = colors });
        }

        /// <summary>Thêm màu mới vào danh mục (Admin only).</summary>
        [HttpPost]
        [Authorize(Roles = "admin")]
        public async Task<IActionResult> Create([FromBody] CreateColorDto dto)
        {
            if (!ModelState.IsValid)
                return BadRequest(new { success = false, errors = ModelState });

            var trimmedName = dto.ColorName.Trim();
            if (await _context.Colors.AnyAsync(c => c.ColorName.ToLower() == trimmedName.ToLower()))
                return BadRequest(new { success = false, message = $"Màu '{trimmedName}' đã tồn tại." });

            var color = new Color
            {
                ColorName = trimmedName,
                HexCode   = dto.HexCode.Trim()
            };

            _context.Colors.Add(color);
            await _context.SaveChangesAsync();

            var result = new ColorDto
            {
                ColorId   = color.ColorId,
                ColorName = color.ColorName,
                HexCode   = color.HexCode
            };

            return Ok(new { success = true, message = "Thêm màu thành công.", data = result });
        }
    }
}
