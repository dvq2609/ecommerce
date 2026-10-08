import React, { useState, useEffect } from 'react';
import { AdminSellerLayout } from '../components/layout/AdminSellerLayout';

interface ColorItem {
  colorId: number;
  colorName: string;
  hexCode: string;
}

export const ColorsManagePage: React.FC = () => {
  const [colors, setColors] = useState<ColorItem[]>([]);
  const [loading, setLoading] = useState(true);
  const [submitting, setSubmitting] = useState(false);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);
  const [successMessage, setSuccessMessage] = useState<string | null>(null);

  // Form State
  const [colorName, setColorName] = useState('');
  const [hexCode, setHexCode] = useState('#222222');

  const fetchColors = async () => {
    try {
      setLoading(true);
      const res = await fetch('/api/color');
      const json = await res.json();
      if (json && json.data) {
        setColors(json.data);
      }
    } catch (err) {
      console.error('Lỗi khi tải bảng màu:', err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchColors();
  }, []);

  const handleCreateColor = async (e: React.FormEvent) => {
    e.preventDefault();
    setErrorMessage(null);
    setSuccessMessage(null);

    const trimmedName = colorName.trim();
    if (!trimmedName) {
      setErrorMessage('Vui lòng nhập tên màu sắc.');
      return;
    }

    const trimmedHex = hexCode.trim();
    if (!/^#[0-9A-Fa-f]{6}$/.test(trimmedHex)) {
      setErrorMessage('Mã màu Hex không hợp lệ (Ví dụ hợp lệ: #E6DEC8).');
      return;
    }

    try {
      setSubmitting(true);
      const token = localStorage.getItem('accessToken');
      const res = await fetch('/api/color', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          ...(token ? { Authorization: `Bearer ${token}` } : {}),
        },
        body: JSON.stringify({
          colorName: trimmedName,
          hexCode: trimmedHex,
        }),
      });

      const json = await res.json();
      if (!res.ok || !json.success) {
        throw new Error(json.message || 'Không thể tạo màu mới.');
      }

      setSuccessMessage(`Đã thêm màu "${trimmedName}" thành công!`);
      setColorName('');
      setHexCode('#222222');
      fetchColors();
    } catch (err: any) {
      setErrorMessage(err.message || 'Lỗi khi gửi yêu cầu lên máy chủ.');
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <AdminSellerLayout
      title="Bảng Màu Sắc Thời Trang (Color Palette)"
      subtitle="Thiết lập và quản lý các gam màu thời trang cho bộ sưu tập & biến thể sản phẩm"
    >
      <div style={{ display: 'grid', gridTemplateColumns: '1fr', gap: '24px' }}>
        {/* TOP: FORM THÊM MÀU MỚI */}
        <div
          style={{
            backgroundColor: '#ffffff', // --color-canvas
            borderRadius: '14px', // --radius-md
            padding: '24px',
            border: '1px solid #ebebeb', // --color-hairline-soft
            boxShadow: '0 1px 2px rgba(0,0,0,0.04)',
          }}
        >
          <div
            style={{
              display: 'flex',
              alignItems: 'center',
              gap: '10px',
              marginBottom: '20px',
            }}
          >
            <span
              className="material-symbols-outlined"
              style={{ fontSize: '22px', color: '#ff385c' }}
            >
              palette
            </span>
            <h2 style={{ fontSize: '16px', fontWeight: 700, margin: 0, color: '#222222' }}>
              Thêm màu sắc thời trang mới
            </h2>
          </div>

          {errorMessage && (
            <div
              style={{
                padding: '12px 16px',
                borderRadius: '8px',
                backgroundColor: '#fff1f2',
                border: '1px solid #fecdd3',
                color: '#c13515',
                fontSize: '13px',
                marginBottom: '16px',
                display: 'flex',
                alignItems: 'center',
                gap: '8px',
              }}
            >
              <span className="material-symbols-outlined" style={{ fontSize: '18px' }}>
                error
              </span>
              <span>{errorMessage}</span>
            </div>
          )}

          {successMessage && (
            <div
              style={{
                padding: '12px 16px',
                borderRadius: '8px',
                backgroundColor: '#f0fdfa',
                border: '1px solid #ccfbf1',
                color: '#00a699',
                fontSize: '13px',
                marginBottom: '16px',
                display: 'flex',
                alignItems: 'center',
                gap: '8px',
              }}
            >
              <span className="material-symbols-outlined" style={{ fontSize: '18px' }}>
                check_circle
              </span>
              <span>{successMessage}</span>
            </div>
          )}

          <form onSubmit={handleCreateColor}>
            <div
              style={{
                display: 'grid',
                gridTemplateColumns: 'repeat(auto-fit, minmax(240px, 1fr))',
                gap: '16px',
                alignItems: 'flex-end',
              }}
            >
              {/* Tên màu */}
              <div>
                <label
                  style={{
                    display: 'block',
                    fontSize: '12.5px',
                    fontWeight: 600,
                    color: '#222222',
                    marginBottom: '6px',
                  }}
                >
                  Tên màu sắc <span style={{ color: '#ff385c' }}>*</span>
                </label>
                <input
                  type="text"
                  placeholder="Ví dụ: Nâu Cacao, Kem Vintage, Xanh Mint..."
                  value={colorName}
                  onChange={(e) => setColorName(e.target.value)}
                  style={{
                    width: '100%',
                    height: '46px',
                    padding: '8px 14px',
                    borderRadius: '8px',
                    border: '1px solid #dddddd',
                    fontSize: '14px',
                    color: '#222222',
                    outline: 'none',
                    backgroundColor: '#ffffff',
                  }}
                  required
                />
              </div>

              {/* Mã màu Hex & Color Picker */}
              <div>
                <label
                  style={{
                    display: 'block',
                    fontSize: '12.5px',
                    fontWeight: 600,
                    color: '#222222',
                    marginBottom: '6px',
                  }}
                >
                  Mã Hex Code <span style={{ color: '#ff385c' }}>*</span>
                </label>
                <div style={{ display: 'flex', gap: '8px', alignItems: 'center' }}>
                  <input
                    type="color"
                    value={hexCode}
                    onChange={(e) => setHexCode(e.target.value.toUpperCase())}
                    style={{
                      width: '46px',
                      height: '46px',
                      padding: '2px',
                      borderRadius: '8px',
                      border: '1px solid #dddddd',
                      cursor: 'pointer',
                      backgroundColor: '#ffffff',
                    }}
                  />
                  <input
                    type="text"
                    value={hexCode}
                    onChange={(e) => setHexCode(e.target.value)}
                    placeholder="#222222"
                    style={{
                      flex: 1,
                      height: '46px',
                      padding: '8px 14px',
                      borderRadius: '8px',
                      border: '1px solid #dddddd',
                      fontSize: '14px',
                      fontFamily: 'monospace',
                      fontWeight: 600,
                      color: '#222222',
                    }}
                    required
                  />
                </div>
              </div>

              {/* Live Preview & Submit */}
              <div style={{ display: 'flex', gap: '12px', alignItems: 'center' }}>
                <div
                  style={{
                    display: 'flex',
                    alignItems: 'center',
                    gap: '8px',
                    height: '46px',
                    padding: '0 16px',
                    borderRadius: '8px',
                    backgroundColor: '#f7f7f7',
                    border: '1px solid #dddddd',
                  }}
                >
                  <div
                    style={{
                      width: '22px',
                      height: '22px',
                      borderRadius: '50%',
                      backgroundColor: hexCode,
                      border: '1px solid rgba(0,0,0,0.15)',
                    }}
                  />
                  <span style={{ fontSize: '13px', fontWeight: 600, color: '#3f3f3f' }}>
                    {colorName || 'Xem trước'}
                  </span>
                </div>

                <button
                  type="submit"
                  disabled={submitting}
                  style={{
                    height: '46px',
                    padding: '0 24px',
                    borderRadius: '8px',
                    backgroundColor: '#ff385c', // --color-primary
                    color: '#ffffff',
                    border: 'none',
                    fontSize: '14px',
                    fontWeight: 600,
                    cursor: submitting ? 'not-allowed' : 'pointer',
                    opacity: submitting ? 0.7 : 1,
                    display: 'inline-flex',
                    alignItems: 'center',
                    gap: '6px',
                    whiteSpace: 'nowrap',
                    boxShadow: '0 1px 2px rgba(0,0,0,0.08)',
                    transition: 'background 150ms ease-out',
                  }}
                  onMouseOver={(e) => (e.currentTarget.style.backgroundColor = '#e00b41')}
                  onMouseOut={(e) => (e.currentTarget.style.backgroundColor = '#ff385c')}
                >
                  <span className="material-symbols-outlined" style={{ fontSize: '18px' }}>
                    save
                  </span>
                  <span>{submitting ? 'Đang lưu...' : 'Thêm màu'}</span>
                </button>
              </div>
            </div>
          </form>
        </div>

        {/* BOTTOM: DANH SÁCH MÀU ĐANG CÓ */}
        <div
          style={{
            backgroundColor: '#ffffff',
            borderRadius: '14px',
            padding: '24px',
            border: '1px solid #ebebeb',
            boxShadow: '0 1px 2px rgba(0,0,0,0.04)',
          }}
        >
          <div
            style={{
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'space-between',
              marginBottom: '20px',
            }}
          >
            <div>
              <h3 style={{ fontSize: '16px', fontWeight: 700, margin: 0, color: '#222222' }}>
                Danh mục màu sắc sẵn có
              </h3>
              <p style={{ fontSize: '13px', color: '#6a6a6a', margin: '3px 0 0' }}>
                Tổng cộng {colors.length} mã màu đang sẵn sàng để áp dụng vào biến thể sản phẩm.
              </p>
            </div>

            <button
              type="button"
              onClick={fetchColors}
              style={{
                height: '36px',
                padding: '0 14px',
                borderRadius: '8px',
                backgroundColor: '#ffffff',
                border: '1px solid #dddddd',
                fontSize: '12.5px',
                fontWeight: 500,
                color: '#222222',
                cursor: 'pointer',
                display: 'inline-flex',
                alignItems: 'center',
                gap: '6px',
                transition: 'background 150ms ease-out',
              }}
              onMouseOver={(e) => (e.currentTarget.style.backgroundColor = '#f7f7f7')}
              onMouseOut={(e) => (e.currentTarget.style.backgroundColor = '#ffffff')}
            >
              <span className="material-symbols-outlined" style={{ fontSize: '16px' }}>
                refresh
              </span>
              <span>Làm mới</span>
            </button>
          </div>

          {loading ? (
            <div style={{ textAlign: 'center', padding: '48px', color: '#6a6a6a' }}>
              Đang tải danh sách màu sắc...
            </div>
          ) : colors.length === 0 ? (
            <div style={{ textAlign: 'center', padding: '48px', color: '#6a6a6a' }}>
              Chưa có màu sắc nào. Hãy thêm màu đầu tiên ở trên!
            </div>
          ) : (
            <div
              style={{
                display: 'grid',
                gridTemplateColumns: 'repeat(auto-fill, minmax(210px, 1fr))',
                gap: '14px',
              }}
            >
              {colors.map((c) => (
                <div
                  key={c.colorId}
                  style={{
                    display: 'flex',
                    alignItems: 'center',
                    gap: '12px',
                    padding: '12px 14px',
                    borderRadius: '10px',
                    backgroundColor: '#ffffff',
                    border: '1px solid #ebebeb',
                    transition: 'border 150ms ease-out, box-shadow 150ms ease-out',
                  }}
                  onMouseOver={(e) => {
                    e.currentTarget.style.borderColor = '#222222';
                    e.currentTarget.style.boxShadow = '0 2px 8px rgba(0,0,0,0.06)';
                  }}
                  onMouseOut={(e) => {
                    e.currentTarget.style.borderColor = '#ebebeb';
                    e.currentTarget.style.boxShadow = 'none';
                  }}
                >
                  <div
                    style={{
                      width: '40px',
                      height: '40px',
                      borderRadius: '8px',
                      backgroundColor: c.hexCode,
                      border: '1px solid rgba(0,0,0,0.1)',
                      flexShrink: 0,
                    }}
                  />
                  <div style={{ overflow: 'hidden' }}>
                    <div
                      style={{
                        fontSize: '13.5px',
                        fontWeight: 600,
                        color: '#222222',
                        whiteSpace: 'nowrap',
                        overflow: 'hidden',
                        textOverflow: 'ellipsis',
                      }}
                    >
                      {c.colorName}
                    </div>
                    <div
                      style={{
                        fontSize: '12px',
                        fontFamily: 'monospace',
                        color: '#6a6a6a',
                        fontWeight: 500,
                      }}
                    >
                      {c.hexCode}
                    </div>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      </div>
    </AdminSellerLayout>
  );
};
