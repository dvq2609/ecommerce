import React, { useState, useEffect } from 'react';
import { useNavigate, Link } from 'react-router-dom';

interface CategoryItem {
  categoryId: number;
  categoryName: string;
}

interface BrandItem {
  brandId: number;
  brandName: string;
}

interface ColorItem {
  colorId: number;
  colorName: string;
  hexCode: string;
}

interface SizeItem {
  sizeId: number;
  sizeName: string;
  description?: string;
  displayOrder: number;
}

interface ImageInput {
  imageUrl: string;
  colorId: number | null;
  isPrimary: boolean;
  displayOrder: number;
}

interface VariantInput {
  colorId: number;
  colorName: string;
  hexCode: string;
  sizeId: number;
  sizeName: string;
  sku: string;
  price: number;
  stockQuantity: number;
  isActive: boolean;
}

export const AddProductPage: React.FC = () => {
  const navigate = useNavigate();

  // Master data from Backend API
  const [categories, setCategories] = useState<CategoryItem[]>([]);
  const [brands, setBrands] = useState<BrandItem[]>([]);
  const [availableColors, setAvailableColors] = useState<ColorItem[]>([]);
  const [availableSizes, setAvailableSizes] = useState<SizeItem[]>([]);
  const [loadingMaster, setLoadingMaster] = useState(true);

  // Form Basic Info
  const [productName, setProductName] = useState('');
  const [slug, setSlug] = useState('');
  const [categoryId, setCategoryId] = useState<number | ''>('');
  const [brandId, setBrandId] = useState<number | ''>('');
  const [basePrice, setBasePrice] = useState<number>(0);
  const [description, setDescription] = useState('');

  // Fashion Specs
  const [material, setMaterial] = useState('');
  const [origin, setOrigin] = useState('Việt Nam');
  const [style, setStyle] = useState('');
  const [fit, setFit] = useState('');
  const [careInstructions, setCareInstructions] = useState('');

  // Images
  const [images, setImages] = useState<ImageInput[]>([
    {
      imageUrl: '',
      colorId: null,
      isPrimary: true,
      displayOrder: 1,
    },
  ]);

  // Variant generator state
  const [selectedColorIds, setSelectedColorIds] = useState<number[]>([]);
  const [selectedSizeIds, setSelectedSizeIds] = useState<number[]>([]);
  const [variants, setVariants] = useState<VariantInput[]>([]);

  // Feedback & Loading
  const [submitting, setSubmitting] = useState(false);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);
  const [successMessage, setSuccessMessage] = useState<string | null>(null);

  // 1. Tải Master Data từ Backend
  useEffect(() => {
    let isMounted = true;

    Promise.all([
      fetch('/api/category').then((r) => r.json()),
      fetch('/api/brand').then((r) => r.json()),
      fetch('/api/color').then((r) => r.json()),
      fetch('/api/size').then((r) => r.json()),
    ])
      .then(([catRes, brandRes, colorRes, sizeRes]) => {
        if (!isMounted) return;

        if (catRes?.success && Array.isArray(catRes.data)) {
          setCategories(catRes.data);
          if (catRes.data.length > 0) setCategoryId(catRes.data[0].categoryId);
        }
        if (brandRes?.success && Array.isArray(brandRes.data)) {
          setBrands(brandRes.data);
          if (brandRes.data.length > 0) setBrandId(brandRes.data[0].brandId);
        }
        if (colorRes?.success && Array.isArray(colorRes.data)) {
          setAvailableColors(colorRes.data);
        }
        if (sizeRes?.success && Array.isArray(sizeRes.data)) {
          setAvailableSizes(sizeRes.data);
        }
        setLoadingMaster(false);
      })
      .catch((err) => {
        console.error('Lỗi khi tải master data:', err);
        if (isMounted) setLoadingMaster(false);
      });

    return () => {
      isMounted = false;
    };
  }, []);

  // Tự động sinh Slug khi nhập tên sản phẩm
  const handleNameChange = (val: string) => {
    setProductName(val);
    const autoSlug = val
      .trim()
      .toLowerCase()
      .replace(/\s+/g, '-')
      .replace(/đ/g, 'd')
      .replace(/[àáảãạăắằẳẵặâấầẩẫậ]/g, 'a')
      .replace(/[èéẻẽẹêếềểễệ]/g, 'e')
      .replace(/[ìíỉĩị]/g, 'i')
      .replace(/[òóỏõọôốồổỗộơớờởỡợ]/g, 'o')
      .replace(/[ùúủũụưứừửữự]/g, 'u')
      .replace(/[ỳýỷỹỵ]/g, 'y')
      .replace(/[^a-z0-9-]/g, '');
    setSlug(autoSlug);
  };

  // 2. Xử lý Image
  const handleAddImage = () => {
    setImages((prev) => [
      ...prev,
      {
        imageUrl: '',
        colorId: selectedColorIds.length > 0 ? selectedColorIds[0] : null,
        isPrimary: prev.length === 0,
        displayOrder: prev.length + 1,
      },
    ]);
  };

  const handleRemoveImage = (index: number) => {
    setImages((prev) => prev.filter((_, idx) => idx !== index));
  };

  const handleImageFieldChange = (index: number, field: keyof ImageInput, val: any) => {
    setImages((prev) =>
      prev.map((img, idx) => {
        if (idx === index) {
          if (field === 'isPrimary') {
            return { ...img, isPrimary: true };
          }
          return { ...img, [field]: val };
        }
        // Nếu chọn isPrimary thì bỏ primary của ảnh khác
        if (field === 'isPrimary' && val === true) {
          return { ...img, isPrimary: false };
        }
        return img;
      })
    );
  };

  // 3. Xử lý Variant Matrix
  const toggleSelectColor = (cid: number) => {
    setSelectedColorIds((prev) =>
      prev.includes(cid) ? prev.filter((id) => id !== cid) : [...prev, cid]
    );
  };

  const toggleSelectSize = (sid: number) => {
    setSelectedSizeIds((prev) =>
      prev.includes(sid) ? prev.filter((id) => id !== sid) : [...prev, sid]
    );
  };

  const handleGenerateVariants = () => {
    if (selectedColorIds.length === 0 || selectedSizeIds.length === 0) {
      alert('Vui lòng chọn ít nhất 1 màu sắc và 1 kích thước để tạo ma trận biến thể!');
      return;
    }

    const newVariants: VariantInput[] = [];
    selectedColorIds.forEach((cid) => {
      const colorObj = availableColors.find((c) => c.colorId === cid);
      selectedSizeIds.forEach((sid) => {
        const sizeObj = availableSizes.find((s) => s.sizeId === sid);
        if (colorObj && sizeObj) {
          const skuGenerated = `${slug || 'prod'}-${cid}-${sid}`.toUpperCase();
          newVariants.push({
            colorId: cid,
            colorName: colorObj.colorName,
            hexCode: colorObj.hexCode,
            sizeId: sid,
            sizeName: sizeObj.sizeName,
            sku: skuGenerated,
            price: basePrice,
            stockQuantity: 10,
            isActive: true,
          });
        }
      });
    });

    setVariants(newVariants);
  };

  const handleVariantFieldChange = (index: number, field: keyof VariantInput, val: any) => {
    setVariants((prev) =>
      prev.map((v, idx) => (idx === index ? { ...v, [field]: val } : v))
    );
  };

  // 4. Submit form
  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setErrorMessage(null);
    setSuccessMessage(null);

    if (!productName.trim()) {
      setErrorMessage('Vui lòng nhập tên sản phẩm.');
      return;
    }
    if (!categoryId) {
      setErrorMessage('Vui lòng chọn danh mục sản phẩm.');
      return;
    }
    if (!brandId) {
      setErrorMessage('Vui lòng chọn thương hiệu.');
      return;
    }
    if (basePrice <= 0) {
      setErrorMessage('Giá sản phẩm phải lớn hơn 0.');
      return;
    }

    const validImages = images.filter((i) => i.imageUrl.trim().length > 0);
    if (validImages.length === 0) {
      setErrorMessage('Vui lòng thêm ít nhất 1 đường dẫn hình ảnh cho sản phẩm.');
      return;
    }

    if (variants.length === 0) {
      setErrorMessage('Vui lòng chọn màu & size và nhấn "Tạo bảng ma trận biến thể" trước khi lưu.');
      return;
    }

    setSubmitting(true);

    const token = localStorage.getItem('accessToken');
    const headers: Record<string, string> = {
      'Content-Type': 'application/json',
    };
    if (token) {
      headers['Authorization'] = `Bearer ${token}`;
    }

    const payload = {
      categoryId: Number(categoryId),
      brandId: Number(brandId),
      productName: productName.trim(),
      productDescription: description.trim(),
      slug: slug.trim() || undefined,
      price: Number(basePrice),
      stockQuantity: variants.reduce((acc, cur) => acc + (Number(cur.stockQuantity) || 0), 0),
      isActive: true,
      material: material.trim() || null,
      origin: origin.trim() || null,
      style: style.trim() || null,
      fit: fit.trim() || null,
      careInstructions: careInstructions.trim() || null,
      images: validImages.map((img, idx) => ({
        imageUrl: img.imageUrl.trim(),
        colorId: img.colorId || null,
        isPrimary: img.isPrimary,
        displayOrder: idx + 1,
      })),
      variants: variants.map((v) => ({
        colorId: v.colorId,
        sizeId: v.sizeId,
        price: Number(v.price) > 0 ? Number(v.price) : Number(basePrice),
        stockQuantity: Number(v.stockQuantity) || 0,
        sku: v.sku.trim(),
        isActive: v.isActive,
      })),
    };

    try {
      const response = await fetch('/api/product', {
        method: 'POST',
        headers,
        body: JSON.stringify(payload),
      });

      const resData = await response.json();

      if (!response.ok) {
        if (response.status === 401 || response.status === 403) {
          throw new Error('Chức năng này yêu cầu quyền Admin/Seller. Vui lòng đăng nhập với tài khoản có quyền quản trị.');
        }
        throw new Error(resData?.message || 'Có lỗi xảy ra khi tạo sản phẩm.');
      }

      setSuccessMessage('Tạo sản phẩm và các biến thể thành công! Đang chuyển hướng...');
      setTimeout(() => {
        const createdSlug = resData?.data?.slug || slug;
        navigate(`/product/${createdSlug}`);
      }, 1500);
    } catch (err: any) {
      setErrorMessage(err.message || 'Không thể kết nối đến máy chủ.');
    } finally {
      setSubmitting(false);
    }
  };

  if (loadingMaster) {
    return (
      <div
        style={{
          minHeight: '100vh',
          backgroundColor: 'var(--color-surface-bg)',
          display: 'flex',
          flexDirection: 'column',
          alignItems: 'center',
          justifyContent: 'center',
          gap: '12px',
        }}
      >
        <div className="btn-spinner" style={{ width: '36px', height: '36px', borderTopColor: 'var(--color-primary)' }} />
        <span style={{ fontSize: '14px', fontWeight: 600, color: 'var(--color-on-surface-variant)' }}>
          Đang tải dữ liệu danh mục & bảng màu từ hệ thống...
        </span>
      </div>
    );
  }

  return (
    <div
      style={{
        minHeight: '100vh',
        backgroundColor: 'var(--color-surface-bg)',
        paddingBottom: '60px',
      }}
    >
      {/* Header Bar */}
      <div
        style={{
          position: 'sticky',
          top: 0,
          zIndex: 40,
          backgroundColor: 'rgba(252, 249, 248, 0.95)',
          backdropFilter: 'blur(16px)',
          borderBottom: '1px solid var(--color-border-subtle)',
          padding: '16px 24px',
        }}
      >
        <div
          style={{
            maxWidth: '1080px',
            margin: '0 auto',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'space-between',
          }}
        >
          <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
            <Link
              to="/"
              style={{
                display: 'flex',
                alignItems: 'center',
                color: 'var(--color-on-surface-variant)',
                textDecoration: 'none',
              }}
            >
              <span className="material-symbols-outlined" style={{ fontSize: '24px' }}>
                arrow_back
              </span>
            </Link>
            <div>
              <h1 style={{ fontSize: '19px', fontWeight: 800, color: 'var(--color-on-surface)' }}>
                Thêm Sản Phẩm & Biến Thể Mới
              </h1>
              <span style={{ fontSize: '12px', color: 'var(--color-on-surface-variant)' }}>
                Tạo sản phẩm, thông số thời trang và ma trận biến thể theo chuẩn SQL Server
              </span>
            </div>
          </div>

          <button
            type="button"
            onClick={handleSubmit}
            disabled={submitting}
            style={{
              display: 'inline-flex',
              alignItems: 'center',
              gap: '6px',
              padding: '10px 22px',
              borderRadius: 'var(--radius-full)',
              backgroundColor: 'var(--color-primary)',
              color: '#ffffff',
              fontSize: '14px',
              fontWeight: 700,
              border: 'none',
              cursor: submitting ? 'not-allowed' : 'pointer',
              boxShadow: 'var(--shadow-sm)',
              opacity: submitting ? 0.7 : 1,
            }}
          >
            {submitting ? (
              <>
                <div className="btn-spinner" style={{ width: '16px', height: '16px' }} />
                <span>Đang lưu...</span>
              </>
            ) : (
              <>
                <span className="material-symbols-outlined" style={{ fontSize: '20px' }}>
                  check_circle
                </span>
                <span>Lưu Sản Phẩm</span>
              </>
            )}
          </button>
        </div>
      </div>

      <div style={{ maxWidth: '1080px', margin: '24px auto', padding: '0 16px' }}>
        {/* Error Alert */}
        {errorMessage && (
          <div
            style={{
              padding: '14px 18px',
              backgroundColor: '#fee2e2',
              color: '#991b1b',
              borderRadius: 'var(--radius-md)',
              fontSize: '13.5px',
              fontWeight: 600,
              marginBottom: '20px',
              display: 'flex',
              alignItems: 'center',
              gap: '8px',
            }}
          >
            <span className="material-symbols-outlined" style={{ fontSize: '20px' }}>
              error
            </span>
            <span>{errorMessage}</span>
          </div>
        )}

        {/* Success Alert */}
        {successMessage && (
          <div
            style={{
              padding: '14px 18px',
              backgroundColor: '#dcfce7',
              color: '#166534',
              borderRadius: 'var(--radius-md)',
              fontSize: '13.5px',
              fontWeight: 600,
              marginBottom: '20px',
              display: 'flex',
              alignItems: 'center',
              gap: '8px',
            }}
          >
            <span className="material-symbols-outlined" style={{ fontSize: '20px' }}>
              task_alt
            </span>
            <span>{successMessage}</span>
          </div>
        )}

        <form onSubmit={handleSubmit} style={{ display: 'flex', flexDirection: 'column', gap: '24px' }}>
          {/* Card 1: Thông tin cơ bản */}
          <div
            style={{
              backgroundColor: 'var(--color-surface-card)',
              borderRadius: 'var(--radius-xl)',
              padding: '24px',
              border: '1px solid var(--color-border-subtle)',
              boxShadow: 'var(--shadow-sm)',
              display: 'flex',
              flexDirection: 'column',
              gap: '16px',
            }}
          >
            <h2 style={{ fontSize: '16px', fontWeight: 700, color: 'var(--color-on-surface)' }}>
              1. Thông Tin Cơ Bản
            </h2>

            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(280px, 1fr))', gap: '16px' }}>
              <div>
                <label style={{ display: 'block', fontSize: '13px', fontWeight: 600, marginBottom: '6px' }}>
                  Tên sản phẩm *
                </label>
                <input
                  type="text"
                  required
                  placeholder="Ví dụ: Áo Blazer Form Rộng Cổ Điển"
                  value={productName}
                  onChange={(e) => handleNameChange(e.target.value)}
                  style={{
                    width: '100%',
                    padding: '10px 14px',
                    borderRadius: 'var(--radius-md)',
                    border: '1px solid var(--color-border-subtle)',
                    fontSize: '14px',
                    backgroundColor: 'var(--color-surface-container-low)',
                  }}
                />
              </div>

              <div>
                <label style={{ display: 'block', fontSize: '13px', fontWeight: 600, marginBottom: '6px' }}>
                  Đường dẫn (Slug URL) *
                </label>
                <input
                  type="text"
                  required
                  placeholder="ao-blazer-form-rong-co-dien"
                  value={slug}
                  onChange={(e) => setSlug(e.target.value)}
                  style={{
                    width: '100%',
                    padding: '10px 14px',
                    borderRadius: 'var(--radius-md)',
                    border: '1px solid var(--color-border-subtle)',
                    fontSize: '14px',
                    backgroundColor: 'var(--color-surface-container-low)',
                  }}
                />
              </div>
            </div>

            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))', gap: '16px' }}>
              <div>
                <label style={{ display: 'block', fontSize: '13px', fontWeight: 600, marginBottom: '6px' }}>
                  Danh mục sản phẩm *
                </label>
                <select
                  value={categoryId}
                  onChange={(e) => setCategoryId(Number(e.target.value))}
                  style={{
                    width: '100%',
                    padding: '10px 14px',
                    borderRadius: 'var(--radius-md)',
                    border: '1px solid var(--color-border-subtle)',
                    fontSize: '14px',
                    backgroundColor: 'var(--color-surface-container-low)',
                  }}
                >
                  {categories.map((c) => (
                    <option key={c.categoryId} value={c.categoryId}>
                      {c.categoryName}
                    </option>
                  ))}
                </select>
              </div>

              <div>
                <label style={{ display: 'block', fontSize: '13px', fontWeight: 600, marginBottom: '6px' }}>
                  Thương hiệu *
                </label>
                <select
                  value={brandId}
                  onChange={(e) => setBrandId(Number(e.target.value))}
                  style={{
                    width: '100%',
                    padding: '10px 14px',
                    borderRadius: 'var(--radius-md)',
                    border: '1px solid var(--color-border-subtle)',
                    fontSize: '14px',
                    backgroundColor: 'var(--color-surface-container-low)',
                  }}
                >
                  {brands.map((b) => (
                    <option key={b.brandId} value={b.brandId}>
                      {b.brandName}
                    </option>
                  ))}
                </select>
              </div>

              <div>
                <label style={{ display: 'block', fontSize: '13px', fontWeight: 600, marginBottom: '6px' }}>
                  Giá bán cơ sở (VNĐ) *
                </label>
                <input
                  type="number"
                  min="1000"
                  step="1000"
                  value={basePrice || ''}
                  onChange={(e) => setBasePrice(Number(e.target.value))}
                  placeholder="890000"
                  style={{
                    width: '100%',
                    padding: '10px 14px',
                    borderRadius: 'var(--radius-md)',
                    border: '1px solid var(--color-border-subtle)',
                    fontSize: '14px',
                    backgroundColor: 'var(--color-surface-container-low)',
                  }}
                />
              </div>
            </div>

            <div>
              <label style={{ display: 'block', fontSize: '13px', fontWeight: 600, marginBottom: '6px' }}>
                Mô tả chi tiết sản phẩm
              </label>
              <textarea
                rows={4}
                value={description}
                onChange={(e) => setDescription(e.target.value)}
                placeholder="Nhập mô tả sản phẩm, phong cách phối đồ, câu chuyện BST..."
                style={{
                  width: '100%',
                  padding: '10px 14px',
                  borderRadius: 'var(--radius-md)',
                  border: '1px solid var(--color-border-subtle)',
                  fontSize: '14px',
                  backgroundColor: 'var(--color-surface-container-low)',
                  resize: 'vertical',
                }}
              />
            </div>
          </div>

          {/* Card 2: Thông số vải thời trang (Fashion Specs) */}
          <div
            style={{
              backgroundColor: 'var(--color-surface-card)',
              borderRadius: 'var(--radius-xl)',
              padding: '24px',
              border: '1px solid var(--color-border-subtle)',
              boxShadow: 'var(--shadow-sm)',
              display: 'flex',
              flexDirection: 'column',
              gap: '16px',
            }}
          >
            <h2 style={{ fontSize: '16px', fontWeight: 700, color: 'var(--color-on-surface)' }}>
              2. Thông Số Vải & Thiết Kế (Fashion Specs)
            </h2>

            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))', gap: '16px' }}>
              <div>
                <label style={{ display: 'block', fontSize: '13px', fontWeight: 600, marginBottom: '6px' }}>
                  Chất liệu
                </label>
                <input
                  type="text"
                  placeholder="Wool Blend cao cấp, lót lụa"
                  value={material}
                  onChange={(e) => setMaterial(e.target.value)}
                  style={{
                    width: '100%',
                    padding: '10px 14px',
                    borderRadius: 'var(--radius-md)',
                    border: '1px solid var(--color-border-subtle)',
                    fontSize: '13.5px',
                    backgroundColor: 'var(--color-surface-container-low)',
                  }}
                />
              </div>

              <div>
                <label style={{ display: 'block', fontSize: '13px', fontWeight: 600, marginBottom: '6px' }}>
                  Xuất xứ
                </label>
                <input
                  type="text"
                  placeholder="Việt Nam may thủ công"
                  value={origin}
                  onChange={(e) => setOrigin(e.target.value)}
                  style={{
                    width: '100%',
                    padding: '10px 14px',
                    borderRadius: 'var(--radius-md)',
                    border: '1px solid var(--color-border-subtle)',
                    fontSize: '13.5px',
                    backgroundColor: 'var(--color-surface-container-low)',
                  }}
                />
              </div>

              <div>
                <label style={{ display: 'block', fontSize: '13px', fontWeight: 600, marginBottom: '6px' }}>
                  Phong cách
                </label>
                <input
                  type="text"
                  placeholder="Tối giản, Parisian Chic"
                  value={style}
                  onChange={(e) => setStyle(e.target.value)}
                  style={{
                    width: '100%',
                    padding: '10px 14px',
                    borderRadius: 'var(--radius-md)',
                    border: '1px solid var(--color-border-subtle)',
                    fontSize: '13.5px',
                    backgroundColor: 'var(--color-surface-container-low)',
                  }}
                />
              </div>

              <div>
                <label style={{ display: 'block', fontSize: '13px', fontWeight: 600, marginBottom: '6px' }}>
                  Kiểu dáng (Fit)
                </label>
                <input
                  type="text"
                  placeholder="Oversize form rộng"
                  value={fit}
                  onChange={(e) => setFit(e.target.value)}
                  style={{
                    width: '100%',
                    padding: '10px 14px',
                    borderRadius: 'var(--radius-md)',
                    border: '1px solid var(--color-border-subtle)',
                    fontSize: '13.5px',
                    backgroundColor: 'var(--color-surface-container-low)',
                  }}
                />
              </div>

              <div style={{ gridColumn: '1 / -1' }}>
                <label style={{ display: 'block', fontSize: '13px', fontWeight: 600, marginBottom: '6px' }}>
                  Hướng dẫn chăm sóc vải
                </label>
                <input
                  type="text"
                  placeholder="Giặt khô hoặc giặt tay nước mát, ủi nhiệt độ thấp"
                  value={careInstructions}
                  onChange={(e) => setCareInstructions(e.target.value)}
                  style={{
                    width: '100%',
                    padding: '10px 14px',
                    borderRadius: 'var(--radius-md)',
                    border: '1px solid var(--color-border-subtle)',
                    fontSize: '13.5px',
                    backgroundColor: 'var(--color-surface-container-low)',
                  }}
                />
              </div>
            </div>
          </div>

          {/* Card 3: Danh sách hình ảnh */}
          <div
            style={{
              backgroundColor: 'var(--color-surface-card)',
              borderRadius: 'var(--radius-xl)',
              padding: '24px',
              border: '1px solid var(--color-border-subtle)',
              boxShadow: 'var(--shadow-sm)',
              display: 'flex',
              flexDirection: 'column',
              gap: '16px',
            }}
          >
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
              <h2 style={{ fontSize: '16px', fontWeight: 700, color: 'var(--color-on-surface)' }}>
                3. Bộ Ảnh Sản Phẩm (Liên kết theo màu)
              </h2>
              <button
                type="button"
                onClick={handleAddImage}
                style={{
                  padding: '6px 14px',
                  borderRadius: 'var(--radius-full)',
                  border: '1px solid var(--color-primary)',
                  backgroundColor: 'transparent',
                  color: 'var(--color-primary)',
                  fontSize: '13px',
                  fontWeight: 600,
                  cursor: 'pointer',
                  display: 'flex',
                  alignItems: 'center',
                  gap: '4px',
                }}
              >
                <span className="material-symbols-outlined" style={{ fontSize: '18px' }}>
                  add
                </span>
                Thêm ảnh
              </button>
            </div>

            <div style={{ display: 'flex', flexDirection: 'column', gap: '12px' }}>
              {images.map((img, idx) => (
                <div
                  key={idx}
                  style={{
                    display: 'flex',
                    alignItems: 'center',
                    gap: '12px',
                    padding: '12px',
                    borderRadius: 'var(--radius-lg)',
                    backgroundColor: 'var(--color-surface-container-low)',
                    border: '1px solid var(--color-border-subtle)',
                  }}
                >
                  <span style={{ fontSize: '13px', fontWeight: 700, minWidth: '24px' }}>#{idx + 1}</span>

                  <input
                    type="url"
                    required
                    placeholder="https://images.unsplash.com/..."
                    value={img.imageUrl}
                    onChange={(e) => handleImageFieldChange(idx, 'imageUrl', e.target.value)}
                    style={{
                      flex: 1,
                      padding: '8px 12px',
                      borderRadius: 'var(--radius-md)',
                      border: '1px solid var(--color-border-subtle)',
                      fontSize: '13px',
                      backgroundColor: '#ffffff',
                    }}
                  />

                  {/* Chọn màu liên kết */}
                  <select
                    value={img.colorId || ''}
                    onChange={(e) =>
                      handleImageFieldChange(idx, 'colorId', e.target.value ? Number(e.target.value) : null)
                    }
                    style={{
                      padding: '8px 12px',
                      borderRadius: 'var(--radius-md)',
                      border: '1px solid var(--color-border-subtle)',
                      fontSize: '13px',
                      backgroundColor: '#ffffff',
                    }}
                  >
                    <option value="">Ảnh lookbook chung</option>
                    {availableColors.map((c) => (
                      <option key={c.colorId} value={c.colorId}>
                        Màu: {c.colorName}
                      </option>
                    ))}
                  </select>

                  <label style={{ display: 'flex', alignItems: 'center', gap: '6px', fontSize: '13px', cursor: 'pointer' }}>
                    <input
                      type="radio"
                      name="primaryImage"
                      checked={img.isPrimary}
                      onChange={() => handleImageFieldChange(idx, 'isPrimary', true)}
                    />
                    <span>Ảnh chính</span>
                  </label>

                  {images.length > 1 && (
                    <button
                      type="button"
                      onClick={() => handleRemoveImage(idx)}
                      style={{
                        padding: '6px',
                        borderRadius: '50%',
                        border: 'none',
                        backgroundColor: 'transparent',
                        color: 'var(--color-error)',
                        cursor: 'pointer',
                      }}
                    >
                      <span className="material-symbols-outlined" style={{ fontSize: '20px' }}>
                        delete
                      </span>
                    </button>
                  )}
                </div>
              ))}
            </div>
          </div>

          {/* Card 4: Ma trận Biến Thể (Color x Size) */}
          <div
            style={{
              backgroundColor: 'var(--color-surface-card)',
              borderRadius: 'var(--radius-xl)',
              padding: '24px',
              border: '1px solid var(--color-border-subtle)',
              boxShadow: 'var(--shadow-sm)',
              display: 'flex',
              flexDirection: 'column',
              gap: '20px',
            }}
          >
            <h2 style={{ fontSize: '16px', fontWeight: 700, color: 'var(--color-on-surface)' }}>
              4. Thiết Lập Biến Thể Màu Sắc & Kích Thước
            </h2>

            {/* Bước 4.1: Chọn màu */}
            <div>
              <span style={{ display: 'block', fontSize: '13px', fontWeight: 600, marginBottom: '8px' }}>
                A. Chọn các màu sắc áp dụng:
              </span>
              <div style={{ display: 'flex', gap: '8px', flexWrap: 'wrap' }}>
                {availableColors.map((c) => {
                  const selected = selectedColorIds.includes(c.colorId);
                  return (
                    <button
                      key={c.colorId}
                      type="button"
                      onClick={() => toggleSelectColor(c.colorId)}
                      style={{
                        display: 'flex',
                        alignItems: 'center',
                        gap: '6px',
                        padding: '6px 12px',
                        borderRadius: 'var(--radius-md)',
                        border: selected ? '2px solid var(--color-on-surface)' : '1px solid var(--color-border-subtle)',
                        backgroundColor: selected ? 'var(--color-surface-container)' : 'transparent',
                        cursor: 'pointer',
                        fontSize: '13px',
                        fontWeight: selected ? 700 : 500,
                      }}
                    >
                      <span
                        style={{
                          width: '14px',
                          height: '14px',
                          borderRadius: '50%',
                          backgroundColor: c.hexCode,
                          border: '1px solid rgba(0,0,0,0.2)',
                        }}
                      />
                      <span>{c.colorName}</span>
                    </button>
                  );
                })}
              </div>
            </div>

            {/* Bước 4.2: Chọn Size */}
            <div>
              <span style={{ display: 'block', fontSize: '13px', fontWeight: 600, marginBottom: '8px' }}>
                B. Chọn các kích cỡ áp dụng:
              </span>
              <div style={{ display: 'flex', gap: '8px', flexWrap: 'wrap' }}>
                {availableSizes.map((s) => {
                  const selected = selectedSizeIds.includes(s.sizeId);
                  return (
                    <button
                      key={s.sizeId}
                      type="button"
                      onClick={() => toggleSelectSize(s.sizeId)}
                      style={{
                        padding: '6px 14px',
                        borderRadius: 'var(--radius-md)',
                        border: selected ? '2px solid var(--color-on-surface)' : '1px solid var(--color-border-subtle)',
                        backgroundColor: selected ? 'var(--color-on-surface)' : 'transparent',
                        color: selected ? '#ffffff' : 'var(--color-on-surface)',
                        cursor: 'pointer',
                        fontSize: '13px',
                        fontWeight: 700,
                      }}
                    >
                      {s.sizeName}
                    </button>
                  );
                })}
              </div>
            </div>

            {/* Nút Tạo ma trận */}
            <div>
              <button
                type="button"
                onClick={handleGenerateVariants}
                style={{
                  padding: '10px 20px',
                  borderRadius: 'var(--radius-md)',
                  backgroundColor: 'var(--color-surface-container-high)',
                  color: 'var(--color-on-surface)',
                  fontSize: '13.5px',
                  fontWeight: 700,
                  border: '1px solid var(--color-border-subtle)',
                  cursor: 'pointer',
                  display: 'inline-flex',
                  alignItems: 'center',
                  gap: '6px',
                }}
              >
                <span className="material-symbols-outlined" style={{ fontSize: '18px' }}>
                  auto_fix_high
                </span>
                Tạo Bảng Ma Trận Biến Thể ({selectedColorIds.length} màu × {selectedSizeIds.length} size = {selectedColorIds.length * selectedSizeIds.length})
              </button>
            </div>

            {/* Bảng Ma Trận Biến Thể */}
            {variants.length > 0 && (
              <div style={{ overflowX: 'auto', marginTop: '10px' }}>
                <table
                  style={{
                    width: '100%',
                    borderCollapse: 'collapse',
                    fontSize: '13px',
                    textAlign: 'left',
                  }}
                >
                  <thead>
                    <tr style={{ backgroundColor: 'var(--color-surface-container)', color: 'var(--color-on-surface-variant)' }}>
                      <th style={{ padding: '10px 12px' }}>Phân loại</th>
                      <th style={{ padding: '10px 12px' }}>Mã SKU</th>
                      <th style={{ padding: '10px 12px' }}>Giá riêng (VNĐ)</th>
                      <th style={{ padding: '10px 12px' }}>Tồn kho</th>
                      <th style={{ padding: '10px 12px' }}>Kích hoạt</th>
                    </tr>
                  </thead>
                  <tbody>
                    {variants.map((v, idx) => (
                      <tr
                        key={idx}
                        style={{
                          borderBottom: '1px solid var(--color-border-subtle)',
                        }}
                      >
                        <td style={{ padding: '10px 12px', display: 'flex', alignItems: 'center', gap: '6px' }}>
                          <span
                            style={{
                              width: '12px',
                              height: '12px',
                              borderRadius: '50%',
                              backgroundColor: v.hexCode,
                              border: '1px solid rgba(0,0,0,0.15)',
                            }}
                          />
                          <span style={{ fontWeight: 600 }}>{v.colorName}</span>
                          <span style={{ color: 'var(--color-on-surface-variant)' }}>• Size {v.sizeName}</span>
                        </td>
                        <td style={{ padding: '10px 12px' }}>
                          <input
                            type="text"
                            value={v.sku}
                            onChange={(e) => handleVariantFieldChange(idx, 'sku', e.target.value)}
                            style={{
                              padding: '6px 8px',
                              borderRadius: 'var(--radius-sm)',
                              border: '1px solid var(--color-border-subtle)',
                              fontSize: '12.5px',
                              width: '160px',
                            }}
                          />
                        </td>
                        <td style={{ padding: '10px 12px' }}>
                          <input
                            type="number"
                            min="0"
                            step="1000"
                            value={v.price}
                            onChange={(e) => handleVariantFieldChange(idx, 'price', Number(e.target.value))}
                            style={{
                              padding: '6px 8px',
                              borderRadius: 'var(--radius-sm)',
                              border: '1px solid var(--color-border-subtle)',
                              fontSize: '12.5px',
                              width: '120px',
                            }}
                          />
                        </td>
                        <td style={{ padding: '10px 12px' }}>
                          <input
                            type="number"
                            min="0"
                            value={v.stockQuantity}
                            onChange={(e) => handleVariantFieldChange(idx, 'stockQuantity', Number(e.target.value))}
                            style={{
                              padding: '6px 8px',
                              borderRadius: 'var(--radius-sm)',
                              border: '1px solid var(--color-border-subtle)',
                              fontSize: '12.5px',
                              width: '80px',
                            }}
                          />
                        </td>
                        <td style={{ padding: '10px 12px' }}>
                          <input
                            type="checkbox"
                            checked={v.isActive}
                            onChange={(e) => handleVariantFieldChange(idx, 'isActive', e.target.checked)}
                          />
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            )}
          </div>
        </form>
      </div>
    </div>
  );
};
