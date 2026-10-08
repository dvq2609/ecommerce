import React, { useState, useEffect } from 'react';
import { AdminSellerLayout } from '../components/layout/AdminSellerLayout';

interface SizeItem {
  sizeId: number;
  sizeName: string;
  description?: string;
  displayOrder: number;
}

export const SizesManagePage: React.FC = () => {
  const [sizes, setSizes] = useState<SizeItem[]>([]);
  const [loading, setLoading] = useState(true);
  const [submitting, setSubmitting] = useState(false);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);
  const [successMessage, setSuccessMessage] = useState<string | null>(null);

  // Form State
  const [sizeName, setSizeName] = useState('');
  const [description, setDescription] = useState('');
  const [displayOrder, setDisplayOrder] = useState<number>(1);

  const fetchSizes = async () => {
    try {
      setLoading(true);
      const res = await fetch('/api/size');
      const json = await res.json();
      if (json && json.data) {
        setSizes(json.data);
        if (json.data.length > 0) {
          const maxOrder = Math.max(...json.data.map((s: SizeItem) => s.displayOrder || 0));
          setDisplayOrder(maxOrder + 1);
        }
      }
    } catch (err) {
      console.error('Lỗi khi tải bảng kích cỡ:', err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchSizes();
  }, []);

  const handleCreateSize = async (e: React.FormEvent) => {
    e.preventDefault();
    setErrorMessage(null);
    setSuccessMessage(null);

    const trimmedName = sizeName.trim().toUpperCase();
    if (!trimmedName) {
      setErrorMessage('Vui lòng nhập tên kích cỡ (VD: S, M, L, XL, 2XL...).');
      return;
    }

    try {
      setSubmitting(true);
      const token = localStorage.getItem('accessToken');
      const res = await fetch('/api/size', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          ...(token ? { Authorization: `Bearer ${token}` } : {}),
        },
        body: JSON.stringify({
          sizeName: trimmedName,
          description: description.trim() || undefined,
          displayOrder: Number(displayOrder) || 1,
        }),
      });

      const json = await res.json();
      if (!res.ok || !json.success) {
        throw new Error(json.message || 'Không thể tạo kích cỡ mới.');
      }

      setSuccessMessage(`Đã thêm kích cỡ "${trimmedName}" thành công!`);
      setSizeName('');
      setDescription('');
      fetchSizes();
    } catch (err: any) {
      setErrorMessage(err.message || 'Lỗi khi gửi yêu cầu lên máy chủ.');
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <AdminSellerLayout
      title="Quy Chuẩn Bảng Kích Cỡ Hệ Thống"
      subtitle="Thiết lập tiêu chuẩn kích cỡ thời trang cho toàn sàn (Đặc quyền Ban Quản Trị)"
    >
      <div style={{ display: 'grid', gridTemplateColumns: '1fr', gap: '24px' }}>
        {/* TOP: FORM THÊM KÍCH CỠ MỚI */}
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
              straighten
            </span>
            <h2 style={{ fontSize: '16px', fontWeight: 700, margin: 0, color: '#222222' }}>
              Thêm kích cỡ tiêu chuẩn mới
            </h2>
          </div>

          {errorMessage && (
            <div
              style={{
                padding: '12px 16px',
                borderRadius: '8px',
                backgroundColor: '#fff1f2',
                border: '1px solid #fecdd3',
                color: '#c13515', // --color-error
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
                color: '#00a699', // --color-success
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

          <form onSubmit={handleCreateSize}>
            <div
              style={{
                display: 'grid',
                gridTemplateColumns: '130px 1fr 120px auto',
                gap: '16px',
                alignItems: 'flex-end',
              }}
            >
              {/* Tên kích cỡ */}
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
                  Tên Size <span style={{ color: '#ff385c' }}>*</span>
                </label>
                <input
                  type="text"
                  placeholder="VD: 3XL"
                  value={sizeName}
                  onChange={(e) => setSizeName(e.target.value.toUpperCase())}
                  style={{
                    width: '100%',
                    height: '46px',
                    padding: '8px 14px',
                    borderRadius: '8px',
                    border: '1px solid #dddddd',
                    fontSize: '14px',
                    fontWeight: 700,
                    color: '#222222',
                    outline: 'none',
                    textAlign: 'center',
                    backgroundColor: '#ffffff',
                  }}
                  required
                />
              </div>

              {/* Mô tả dáng/cân nặng */}
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
                  Mô tả khuyến nghị vóc dáng / cân nặng
                </label>
                <input
                  type="text"
                  placeholder="Ví dụ: 75-82kg, chiều cao 1m75 - 1m82"
                  value={description}
                  onChange={(e) => setDescription(e.target.value)}
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
                />
              </div>

              {/* Thứ tự hiển thị */}
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
                  Thứ tự sắp xếp
                </label>
                <input
                  type="number"
                  min="1"
                  value={displayOrder}
                  onChange={(e) => setDisplayOrder(Number(e.target.value))}
                  style={{
                    width: '100%',
                    height: '46px',
                    padding: '8px 14px',
                    borderRadius: '8px',
                    border: '1px solid #dddddd',
                    fontSize: '14px',
                    color: '#222222',
                    outline: 'none',
                    textAlign: 'center',
                    backgroundColor: '#ffffff',
                  }}
                  required
                />
              </div>

              {/* Submit Button */}
              <div>
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
                    boxShadow: '0 1px 2px rgba(0,0,0,0.08)',
                    transition: 'background 150ms ease-out',
                  }}
                  onMouseOver={(e) => (e.currentTarget.style.backgroundColor = '#e00b41')}
                  onMouseOut={(e) => (e.currentTarget.style.backgroundColor = '#ff385c')}
                >
                  <span className="material-symbols-outlined" style={{ fontSize: '18px' }}>
                    add
                  </span>
                  <span>{submitting ? 'Đang thêm...' : 'Thêm Size'}</span>
                </button>
              </div>
            </div>
          </form>
        </div>

        {/* BOTTOM: DANH SÁCH SIZE HỆ THỐNG */}
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
                Danh sách kích cỡ chuẩn sàn
              </h3>
              <p style={{ fontSize: '13px', color: '#6a6a6a', margin: '3px 0 0' }}>
                Hệ thống tự động sắp xếp theo thứ tự hiển thị của các nút chọn Size trên trang chi tiết sản phẩm.
              </p>
            </div>

            <button
              type="button"
              onClick={fetchSizes}
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
              Đang tải danh sách kích cỡ...
            </div>
          ) : sizes.length === 0 ? (
            <div style={{ textAlign: 'center', padding: '48px', color: '#6a6a6a' }}>
              Chưa có kích cỡ nào trong hệ thống. Hãy thêm size đầu tiên ở trên!
            </div>
          ) : (
            <div style={{ overflowX: 'auto' }}>
              <table
                style={{
                  width: '100%',
                  borderCollapse: 'collapse',
                  textAlign: 'left',
                  fontSize: '14px',
                }}
              >
                <thead>
                  <tr style={{ borderBottom: '1px solid #ebebeb', color: '#6a6a6a' }}>
                    <th style={{ padding: '12px 16px', width: '80px', fontWeight: 600 }}>Thứ tự</th>
                    <th style={{ padding: '12px 16px', width: '130px', fontWeight: 600 }}>Kích cỡ (Size)</th>
                    <th style={{ padding: '12px 16px', fontWeight: 600 }}>Mô tả khuyến nghị vóc dáng</th>
                    <th style={{ padding: '12px 16px', width: '130px', textAlign: 'right', fontWeight: 600 }}>
                      Trạng thái
                    </th>
                  </tr>
                </thead>
                <tbody>
                  {sizes.map((s) => (
                    <tr
                      key={s.sizeId}
                      style={{
                        borderBottom: '1px solid #f7f7f7',
                        transition: 'background 150ms ease-out',
                      }}
                      onMouseOver={(e) => (e.currentTarget.style.backgroundColor = '#fafafa')}
                      onMouseOut={(e) => (e.currentTarget.style.backgroundColor = 'transparent')}
                    >
                      <td style={{ padding: '14px 16px', fontWeight: 600, color: '#6a6a6a' }}>
                        #{s.displayOrder}
                      </td>
                      <td style={{ padding: '14px 16px' }}>
                        <span
                          style={{
                            display: 'inline-block',
                            padding: '4px 12px',
                            borderRadius: '8px',
                            backgroundColor: '#f7f7f7',
                            color: '#222222',
                            fontWeight: 700,
                            fontSize: '13.5px',
                            border: '1px solid #dddddd',
                          }}
                        >
                          {s.sizeName}
                        </span>
                      </td>
                      <td style={{ padding: '14px 16px', color: '#3f3f3f' }}>
                        {s.description || (
                          <span style={{ color: '#6a6a6a', fontStyle: 'italic' }}>
                            Chưa có mô tả
                          </span>
                        )}
                      </td>
                      <td style={{ padding: '14px 16px', textAlign: 'right' }}>
                        <span
                          style={{
                            display: 'inline-flex',
                            alignItems: 'center',
                            gap: '4px',
                            fontSize: '12.5px',
                            fontWeight: 600,
                            color: '#00a699', // --color-success
                          }}
                        >
                          <span
                            style={{
                              width: '6px',
                              height: '6px',
                              borderRadius: '50%',
                              backgroundColor: '#00a699',
                            }}
                          />
                          Áp dụng
                        </span>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </div>
      </div>
    </AdminSellerLayout>
  );
};
