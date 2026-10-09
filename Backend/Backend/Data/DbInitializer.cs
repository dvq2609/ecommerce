using Backend.Models;
using Microsoft.EntityFrameworkCore;

namespace Backend.Data
{
    public static class DbInitializer
    {
        public static async Task SeedAsync(IServiceProvider serviceProvider)
        {
            using var scope = serviceProvider.CreateScope();
            var context = scope.ServiceProvider.GetRequiredService<ApplicationDbContext>();

            // 1. Đảm bảo Category tồn tại
            var category = await context.Categories.FirstOrDefaultAsync(c => c.Slug == "ao-blazer");
            if (category == null)
            {
                category = new Category
                {
                    CategoryName        = "Áo Blazer & Vest",
                    CategoryDescription = "Các mẫu blazer và áo vest thiết kế cao cấp",
                    Slug                = "ao-blazer"
                };
                context.Categories.Add(category);
                await context.SaveChangesAsync();
            }

            // 2. Đảm bảo Brand tồn tại
            var brand = await context.Brands.FirstOrDefaultAsync(b => b.Slug == "shopvibe-atelier");
            if (brand == null)
            {
                brand = new Brand
                {
                    BrandName        = "ShopVibe Atelier",
                    BrandDescription = "Dòng thiết kế độc quyền ShopVibe Studio",
                    Slug             = "shopvibe-atelier"
                };
                context.Brands.Add(brand);
                await context.SaveChangesAsync();
            }

            // 3. Đảm bảo Sản phẩm Áo Blazer VIBE-BZ-809 tồn tại
            var productSlug = "ao-blazer-form-rong-ve-k-co-dien";
            var existingProduct = await context.Products
                .Include(p => p.Variants)
                .Include(p => p.Images)
                .FirstOrDefaultAsync(p => p.Slug == productSlug);

            if (existingProduct == null)
            {
                var blazer = new Product
                {
                    CategoryId         = category.CategoryId,
                    BrandId            = brand.BrandId,
                    SellerId           = 1,
                    ProductName        = "Áo Blazer Form Rộng Ve K Cổ Điển",
                    Slug               = productSlug,
                    ProductDescription = "Áo blazer thiết kế độc quyền từ BST ShopVibe Atelier. Phom dáng oversize thời thượng với ve áo chữ K cổ điển, mang hơi thở Parisian Chic thanh lịch hiện đại.\n\nCấu trúc 2 lớp cao cấp với lớp ngoài là vải Wool Blend đứng phom, lót lụa habutai mềm mại chống nhăn và thoáng khí. Thích hợp cho cả môi trường công sở lẫn dạo phố cuối tuần.",
                    Price              = 890000m,
                    StockQuantity      = 48,
                    IsActive           = true,
                    ImportDate         = DateTime.UtcNow,
                    Material           = "Wool Blend cao cấp, lót lụa mềm mại",
                    Origin             = "Việt Nam thiết kế & may thủ công",
                    Style              = "Tối giản, Thanh lịch, Công sở & Dạo phố",
                    Fit                = "Oversize form rộng, ve áo chữ K cổ điển",
                    CareInstructions   = "Giặt khô hoặc giặt tay nước mát, ủi ở nhiệt độ thấp",
                    AverageRating      = 4.9m,
                    RatingCount        = 128
                };

                context.Products.Add(blazer);
                await context.SaveChangesAsync();

                // Tạo bộ ảnh theo màu
                var images = new List<ProductImage>
                {
                    new()
                    {
                        ProductId    = blazer.ProductId,
                        ColorId      = 1, // Kem Vintage
                        ImageUrl     = "https://images.unsplash.com/photo-1591047139829-d91aecb6caea?w=1000&auto=format&fit=crop&q=80",
                        IsPrimary    = true,
                        DisplayOrder = 1
                    },
                    new()
                    {
                        ProductId    = blazer.ProductId,
                        ColorId      = 1, // Kem Vintage detail
                        ImageUrl     = "https://images.unsplash.com/photo-1539109136881-3be0616acf4b?w=1000&auto=format&fit=crop&q=80",
                        IsPrimary    = false,
                        DisplayOrder = 2
                    },
                    new()
                    {
                        ProductId    = blazer.ProductId,
                        ColorId      = 2, // Đen Classic
                        ImageUrl     = "https://images.unsplash.com/photo-1550614000-4895a10e1bfd?w=1000&auto=format&fit=crop&q=80",
                        IsPrimary    = false,
                        DisplayOrder = 3
                    },
                    new()
                    {
                        ProductId    = blazer.ProductId,
                        ColorId      = 3, // Nâu Cacao
                        ImageUrl     = "https://images.unsplash.com/photo-1515886657613-9f3515b0c78f?w=1000&auto=format&fit=crop&q=80",
                        IsPrimary    = false,
                        DisplayOrder = 4
                    },
                    new()
                    {
                        ProductId    = blazer.ProductId,
                        ColorId      = null, // Ảnh lookbook chung
                        ImageUrl     = "https://images.unsplash.com/photo-1490481651871-ab68de25d43d?w=1000&auto=format&fit=crop&q=80",
                        IsPrimary    = false,
                        DisplayOrder = 5
                    }
                };
                context.ProductImages.AddRange(images);

                // Tạo các biến thể Màu x Size (S=2, M=3, L=4, XL=5)
                var variants = new List<ProductVariant>
                {
                    // Kem Vintage (Color 1)
                    new() { ProductId = blazer.ProductId, ColorId = 1, SizeId = 2, Sku = "VIBE-BZ-809-KEM-S", Price = 890000m, StockQuantity = 12, IsActive = true },
                    new() { ProductId = blazer.ProductId, ColorId = 1, SizeId = 3, Sku = "VIBE-BZ-809-KEM-M", Price = 890000m, StockQuantity = 18, IsActive = true },
                    new() { ProductId = blazer.ProductId, ColorId = 1, SizeId = 4, Sku = "VIBE-BZ-809-KEM-L", Price = 890000m, StockQuantity = 10, IsActive = true },
                    new() { ProductId = blazer.ProductId, ColorId = 1, SizeId = 5, Sku = "VIBE-BZ-809-KEM-XL", Price = 890000m, StockQuantity = 0, IsActive = true }, // Hết hàng!

                    // Đen Classic (Color 2)
                    new() { ProductId = blazer.ProductId, ColorId = 2, SizeId = 2, Sku = "VIBE-BZ-809-DEN-S", Price = 890000m, StockQuantity = 5, IsActive = true },
                    new() { ProductId = blazer.ProductId, ColorId = 2, SizeId = 3, Sku = "VIBE-BZ-809-DEN-M", Price = 890000m, StockQuantity = 3, IsActive = true },
                    new() { ProductId = blazer.ProductId, ColorId = 2, SizeId = 4, Sku = "VIBE-BZ-809-DEN-L", Price = 890000m, StockQuantity = 0, IsActive = true },
                    new() { ProductId = blazer.ProductId, ColorId = 2, SizeId = 5, Sku = "VIBE-BZ-809-DEN-XL", Price = 890000m, StockQuantity = 0, IsActive = true },

                    // Nâu Cacao (Color 3)
                    new() { ProductId = blazer.ProductId, ColorId = 3, SizeId = 2, Sku = "VIBE-BZ-809-NAU-S", Price = 890000m, StockQuantity = 0, IsActive = true },
                    new() { ProductId = blazer.ProductId, ColorId = 3, SizeId = 3, Sku = "VIBE-BZ-809-NAU-M", Price = 890000m, StockQuantity = 0, IsActive = true },
                    new() { ProductId = blazer.ProductId, ColorId = 3, SizeId = 4, Sku = "VIBE-BZ-809-NAU-L", Price = 890000m, StockQuantity = 0, IsActive = true }
                };
                context.ProductVariants.AddRange(variants);

                // Cập nhật lại tổng tồn kho sản phẩm cha
                blazer.StockQuantity = variants.Sum(v => v.StockQuantity);

                await context.SaveChangesAsync();

                // Tạo 1 vài review mẫu nếu có User
                var sampleUser = await context.Users.FirstOrDefaultAsync();
                if (sampleUser != null)
                {
                    var kemVariant = variants.First(v => v.ColorId == 1 && v.SizeId == 2);
                    var sampleReviews = new List<Review>
                    {
                        new()
                        {
                            ProductId        = blazer.ProductId,
                            UserId           = sampleUser.UserId,
                            ProductVariantId = kemVariant.VariantId,
                            Rating           = 5,
                            Comment          = "Áo form đẹp xuất sắc, chất vải wool blend dày dặn đứng form nhưng không bị cứng. Màu kem vintage ở ngoài y hệt ảnh trên trang chủ!",
                            CreatedAt        = DateTime.UtcNow.AddDays(-2)
                        },
                        new()
                        {
                            ProductId        = blazer.ProductId,
                            UserId           = sampleUser.UserId,
                            ProductVariantId = kemVariant.VariantId,
                            Rating           = 5,
                            Comment          = "Giao hàng siêu nhanh trong 2h. Mình 1m58 49kg mặc size S vừa vặn thoải mái, tôn dáng cực kỳ.",
                            CreatedAt        = DateTime.UtcNow.AddDays(-5)
                        }
                    };
                    context.Reviews.AddRange(sampleReviews);
                    await context.SaveChangesAsync();
                }
            }

            // 4. Đảm bảo cấu hình Phí Vận Chuyển và Ngưỡng Freeship tồn tại
            if (!await context.ShippingSettings.AnyAsync())
            {
                context.ShippingSettings.Add(new ShippingSetting
                {
                    FreeShippingThreshold = 1000000m,
                    DefaultShippingFee = 30000m,
                    IsFreeShippingEnabled = true,
                    UpdatedAt = DateTime.UtcNow
                });
                await context.SaveChangesAsync();
            }

            // 5. Đảm bảo các tuyến vận chuyển mặc định tồn tại
            if (!await context.ShippingRules.AnyAsync())
            {
                var defaultRules = new List<ShippingRule>
                {
                    new()
                    {
                        FromLocation = "TP. Hồ Chí Minh",
                        ToLocation = "TP. Hồ Chí Minh",
                        Fee = 20000m,
                        EstimatedDeliveryDays = "1 - 2 ngày",
                        IsActive = true,
                        CreatedAt = DateTime.UtcNow
                    },
                    new()
                    {
                        FromLocation = "TP. Hồ Chí Minh",
                        ToLocation = "Hà Nội",
                        Fee = 35000m,
                        EstimatedDeliveryDays = "2 - 4 ngày",
                        IsActive = true,
                        CreatedAt = DateTime.UtcNow
                    },
                    new()
                    {
                        FromLocation = "TP. Hồ Chí Minh",
                        ToLocation = "Đà Nẵng",
                        Fee = 30000m,
                        EstimatedDeliveryDays = "2 - 3 ngày",
                        IsActive = true,
                        CreatedAt = DateTime.UtcNow
                    },
                    new()
                    {
                        FromLocation = "TP. Hồ Chí Minh",
                        ToLocation = "Toàn quốc",
                        Fee = 30000m,
                        EstimatedDeliveryDays = "3 - 5 ngày",
                        IsActive = true,
                        CreatedAt = DateTime.UtcNow
                    }
                };
                context.ShippingRules.AddRange(defaultRules);
                await context.SaveChangesAsync();
            }
        }
    }
}
