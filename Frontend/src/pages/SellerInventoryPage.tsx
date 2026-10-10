import React, { useState, useEffect, useCallback } from 'react';
import { AdminSellerLayout } from '../components/layout/AdminSellerLayout';
import {
  sellerInventoryService,
  type SellerInventoryItem,
  type SellerInventoryStats,
} from '../services/sellerInventoryService';

const formatCurrency = (val: number) =>
  new Intl.NumberFormat('vi-VN', { style: 'currency', currency: 'VND' }).format(val);

const formatNumber = (val: number) =>
  new Intl.NumberFormat('vi-VN').format(val);

const FILTER_TABS = [
  { value: '', label: 'Tất cả biến thể' },
  { value: 'low_stock', label: '⚠️ Sắp hết hàng (≤ 5)' },
  { value: 'out_of_stock', label: '🔴 Đã hết hàng (0)' },
  { value: 'in_stock', label: '🟢 Còn hàng (> 5)' },
];

export const SellerInventoryPage: React.FC = () => {
  // ─── Data State ─────────────────────────────────────────────────────────────
  const [items, setItems] = useState<SellerInventoryItem[]>([]);
  const [stats, setStats] = useState<SellerInventoryStats | null>(null);
  const [loading, setLoading] = useState<boolean>(true);
  const [totalCount, setTotalCount] = useState<number>(0);
  const [totalPages, setTotalPages] = useState<number>(1);

  // ─── Query State ────────────────────────────────────────────────────────────
  const [searchKeyword, setSearchKeyword] = useState<string>('');
  const [activeFilter, setActiveFilter] = useState<string>('');
  const [pageNumber, setPageNumber] = useState<number>(1);
  const pageSize = 12;

  // ─── Inline Edit State ──────────────────────────────────────────────────────
  const [editingVariantId, setEditingVariantId] = useState<number | null>(null);
  const [editStockValue, setEditStockValue] = useState<number>(0);
  const [editPriceValue, setEditPriceValue] = useState<number>(0);
  const [savingId, setSavingId] = useState<number | null>(null);

  // ─── Feedback Toast State ───────────────────────────────────────────────────
  const [feedbackMsg, setFeedbackMsg] = useState<{ type: 'success' | 'error'; text: string } | null>(null);

  // ─── Load Stats ─────────────────────────────────────────────────────────────
  const fetchStats = useCallback(async () => {
    try {
      const res = await sellerInventoryService.getStats();
      if (res?.success) setStats(res.data);
    } catch (err: any) {
      console.error('Lỗi tải thống kê kho:', err);
    }
  }, []);

  // ─── Load Inventory List ────────────────────────────────────────────────────
  const fetchInventory = useCallback(async () => {
    try {
      setLoading(true);
      const res = await sellerInventoryService.getInventory({
        search: searchKeyword,
        stockFilter: activeFilter,
        page: pageNumber,
        pageSize,
      });

      if (res?.success && res.data) {
        setItems(res.data.items || []);
        setTotalCount(res.data.totalCount || 0);
        setTotalPages(res.data.totalPages || 1);
      }
    } catch (err: any) {
      setFeedbackMsg({ type: 'error', text: err.message || 'Lỗi khi tải danh sách tồn kho.' });
    } finally {
      setLoading(false);
    }
  }, [searchKeyword, activeFilter, pageNumber, pageSize]);

  useEffect(() => {
    fetchStats();
  }, [fetchStats]);

  useEffect(() => {
    fetchInventory();
  }, [fetchInventory]);

  // ─── Quick Inline Edit Handlers ─────────────────────────────────────────────
  const startEditing = (item: SellerInventoryItem) => {
    setEditingVariantId(item.variantId);
    setEditStockValue(item.stockQuantity);
    setEditPriceValue(item.price);
  };

  const cancelEditing = () => {
    setEditingVariantId(null);
  };

  const saveQuickEdit = async (variantId: number) => {
    try {
      setSavingId(variantId);
      const res = await sellerInventoryService.updateStock(variantId, {
        stockQuantity: editStockValue,
        price: editPriceValue,
      });

      if (res?.success && res.data) {
        setFeedbackMsg({ type: 'success', text: `Đã cập nhật tồn kho biến thể SKU: ${res.data.sku}!` });
        // Cập nhật mảng items tại chỗ
        setItems((prev) => prev.map((item) => (item.variantId === variantId ? res.data : item)));
        setEditingVariantId(null);
        // Tải lại KPI stats
        fetchStats();
      }
    } catch (err: any) {
      setFeedbackMsg({ type: 'error', text: err.message || 'Lỗi khi cập nhật tồn kho.' });
    } finally {
      setSavingId(null);
      setTimeout(() => setFeedbackMsg(null), 4000);
    }
  };

  return (
    <AdminSellerLayout
      title="Quản Lý Tồn Kho & Cảnh Báo Nhập Hàng"
      subtitle="Theo dõi chi tiết số lượng theo màu sắc, kích cỡ và điều chỉnh số lượng tồn trực tiếp"
    >
      {/* ─── TOAST PHẢN HỒI ─────────────────────────────────────────────────── */}
      {feedbackMsg && (
        <div
          style={{
            position: 'fixed',
            top: '24px',
            right: '24px',
            zIndex: 9999,
            backgroundColor: feedbackMsg.type === 'success' ? '#006a62' : '#ba1a1a',
            color: '#ffffff',
            padding: '12px 20px',
            borderRadius: '10px',
            boxShadow: '0 8px 24px rgba(0,0,0,0.18)',
            fontSize: '14px',
            fontWeight: 500,
            display: 'flex',
            alignItems: 'center',
            gap: '8px',
          }}
        >
          <span className="material-symbols-outlined" style={{ fontSize: '20px' }}>
            {feedbackMsg.type === 'success' ? 'check_circle' : 'error'}
          </span>
          <span>{feedbackMsg.text}</span>
        </div>
      )}

      {/* ─── 1. BỘ THẺ KPI TỒN KHO ĐỒNG BỘ ĐEN SANG TRỌNG ───────────────────── */}
      <div
        style={{
          display: 'grid',
          gridTemplateColumns: 'repeat(auto-fit, minmax(230px, 1fr))',
          gap: '16px',
          marginBottom: '24px',
        }}
      >
        {/* KPI 1: Tổng biến thể */}
        <div style={cardKpiStyle}>
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
            <span style={kpiLabelStyle}>TỔNG BIẾN THỂ</span>
            <div style={kpiIconWrapperStyle}>
              <span className="material-symbols-outlined" style={{ color: '#1b1c1c', fontSize: '20px' }}>
                style
              </span>
            </div>
          </div>
          <div style={kpiValueStyle}>
            {formatNumber(stats?.totalVariants ?? 0)}
          </div>
          <div style={kpiSubtextStyle}>
            Tổng các phân loại màu x size đang quản lý
          </div>
        </div>

        {/* KPI 2: Tổng lượng tồn kho */}
        <div style={cardKpiStyle}>
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
            <span style={kpiLabelStyle}>TỔNG LƯỢNG HÀNG TỒN</span>
            <div style={kpiIconWrapperStyle}>
              <span className="material-symbols-outlined" style={{ color: '#1b1c1c', fontSize: '20px' }}>
                inventory_2
              </span>
            </div>
          </div>
          <div style={kpiValueStyle}>
            {formatNumber(stats?.totalUnitsInStock ?? 0)}
          </div>
          <div style={kpiSubtextStyle}>
            Tổng sản phẩm thực tế sẵn sàng giao
          </div>
        </div>

        {/* KPI 3: Sắp hết hàng (<= 5) */}
        <div style={cardKpiStyle}>
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
            <span style={kpiLabelStyle}>SẮP HẾT HÀNG (≤ 5)</span>
            <div style={{ ...kpiIconWrapperStyle, backgroundColor: '#fffbeb' }}>
              <span className="material-symbols-outlined" style={{ color: '#b45309', fontSize: '20px' }}>
                warning
              </span>
            </div>
          </div>
          <div style={{ ...kpiValueStyle, color: (stats?.lowStockCount ?? 0) > 0 ? '#b45309' : '#1b1c1c' }}>
            {formatNumber(stats?.lowStockCount ?? 0)}
          </div>
          <div style={kpiSubtextStyle}>
            Cần lên kế hoạch nhập bổ sung ngay
          </div>
        </div>

        {/* KPI 4: Đã hết hàng (0) */}
        <div style={cardKpiStyle}>
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
            <span style={kpiLabelStyle}>ĐÃ HẾT HÀNG (0)</span>
            <div style={{ ...kpiIconWrapperStyle, backgroundColor: '#fef2f2' }}>
              <span className="material-symbols-outlined" style={{ color: '#b91c1c', fontSize: '20px' }}>
                production_quantity_limits
              </span>
            </div>
          </div>
          <div style={{ ...kpiValueStyle, color: (stats?.outOfStockCount ?? 0) > 0 ? '#b91c1c' : '#1b1c1c' }}>
            {formatNumber(stats?.outOfStockCount ?? 0)}
          </div>
          <div style={kpiSubtextStyle}>
            Khách không thể bấm đặt mua lúc này
          </div>
        </div>
      </div>

      {/* ─── 2. BỘ LỌC TRẠNG THÁI & THANH TÌM KIẾM ──────────────────────────── */}
      <div
        style={{
          display: 'flex',
          justifyContent: 'space-between',
          alignItems: 'center',
          flexWrap: 'wrap',
          gap: '12px',
          marginBottom: '16px',
        }}
      >
        {/* Filter Tabs */}
        <div style={{ display: 'flex', gap: '8px', overflowX: 'auto', paddingBottom: '4px' }}>
          {FILTER_TABS.map((tab) => {
            const isSelected = activeFilter === tab.value;
            return (
              <button
                key={tab.value}
                type="button"
                onClick={() => {
                  setActiveFilter(tab.value);
                  setPageNumber(1);
                }}
                style={{
                  padding: '8px 16px',
                  borderRadius: '20px',
                  fontSize: '13px',
                  fontWeight: isSelected ? 700 : 500,
                  backgroundColor: isSelected ? '#1b1c1c' : 'var(--color-surface-card)',
                  color: isSelected ? '#ffffff' : 'var(--color-on-surface)',
                  border: isSelected ? '1px solid #1b1c1c' : '1px solid var(--color-border-subtle)',
                  cursor: 'pointer',
                  whiteSpace: 'nowrap',
                  transition: 'all 150ms ease',
                }}
              >
                {tab.label}
              </button>
            );
          })}
        </div>

        {/* Thanh Tìm Kiếm */}
        <div style={{ position: 'relative', width: '280px' }}>
          <span
            className="material-symbols-outlined"
            style={{
              position: 'absolute',
              left: '12px',
              top: '50%',
              transform: 'translateY(-50%)',
              color: 'var(--color-on-surface-variant)',
              fontSize: '18px',
            }}
          >
            search
          </span>
          <input
            type="text"
            placeholder="Tìm theo tên hoặc SKU..."
            value={searchKeyword}
            onChange={(e) => {
              setSearchKeyword(e.target.value);
              setPageNumber(1);
            }}
            style={{
              width: '100%',
              padding: '8px 14px 8px 36px',
              borderRadius: 'var(--radius-full)',
              border: '1px solid var(--color-border-subtle)',
              fontSize: '13px',
              backgroundColor: 'var(--color-surface-card)',
              color: 'var(--color-on-surface)',
              outline: 'none',
              boxSizing: 'border-box',
            }}
          />
        </div>
      </div>

      {/* ─── 3. BẢNG DANH SÁCH BIẾN THỂ & CHỈNH SỬA TỒN KHO ──────────────────── */}
      <div
        style={{
          backgroundColor: 'var(--color-surface-card)',
          borderRadius: 'var(--radius-xl)',
          border: '1px solid var(--color-border-subtle)',
          boxShadow: 'var(--shadow-sm)',
          overflow: 'hidden',
        }}
      >
        <div style={{ overflowX: 'auto' }}>
          <table style={{ width: '100%', borderCollapse: 'collapse', textAlign: 'left', fontSize: '13px' }}>
            <thead>
              <tr style={{ backgroundColor: 'var(--color-surface-container-low)', borderBottom: '1px solid var(--color-border-subtle)' }}>
                <th style={thStyle}>SẢN PHẨM & BIẾN THỂ</th>
                <th style={thStyle}>SKU</th>
                <th style={thStyle}>PHÂN LOẠI</th>
                <th style={thStyle}>GIÁ NIÊM YẾT</th>
                <th style={thStyle}>SỐ LƯỢNG TỒN</th>
                <th style={thStyle}>TRẠNG THÁI</th>
                <th style={{ ...thStyle, textAlign: 'right' }}>THAO TÁC</th>
              </tr>
            </thead>
            <tbody>
              {loading ? (
                <tr>
                  <td colSpan={7} style={{ textAlign: 'center', padding: '40px', color: 'var(--color-on-surface-variant)' }}>
                    Đang nạp dữ liệu kho hàng...
                  </td>
                </tr>
              ) : items.length === 0 ? (
                <tr>
                  <td colSpan={7} style={{ textAlign: 'center', padding: '40px', color: 'var(--color-on-surface-variant)' }}>
                    Không tìm thấy biến thể nào phù hợp với bộ lọc.
                  </td>
                </tr>
              ) : (
                items.map((item) => {
                  const isEditing = editingVariantId === item.variantId;
                  const isSaving = savingId === item.variantId;

                  return (
                    <tr
                      key={item.variantId}
                      style={{
                        borderBottom: '1px solid var(--color-border-subtle)',
                        backgroundColor: isEditing ? '#f8fafc' : 'transparent',
                        transition: 'background-color 150ms',
                      }}
                    >
                      {/* Cột 1: Thông tin sản phẩm & Thumbnail */}
                      <td style={tdStyle}>
                        <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
                          <img
                            src={item.primaryImage || 'https://via.placeholder.com/48'}
                            alt={item.productName}
                            style={{
                              width: '44px',
                              height: '44px',
                              borderRadius: '8px',
                              objectFit: 'cover',
                              border: '1px solid var(--color-border-subtle)',
                              backgroundColor: '#f3f4f6',
                            }}
                          />
                          <div>
                            <div style={{ fontWeight: 600, color: 'var(--color-on-surface)' }}>
                              {item.productName}
                            </div>
                            <div style={{ fontSize: '11px', color: 'var(--color-on-surface-variant)', marginTop: '2px' }}>
                              Mã SP: #{item.productId}
                            </div>
                          </div>
                        </div>
                      </td>

                      {/* Cột 2: SKU */}
                      <td style={tdStyle}>
                        <code
                          style={{
                            padding: '3px 6px',
                            backgroundColor: 'var(--color-surface-container-low)',
                            borderRadius: '4px',
                            fontSize: '12px',
                            color: '#334155',
                            fontWeight: 600,
                          }}
                        >
                          {item.sku}
                        </code>
                      </td>

                      {/* Cột 3: Màu & Size */}
                      <td style={tdStyle}>
                        <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                          <span
                            style={{
                              width: '14px',
                              height: '14px',
                              borderRadius: '50%',
                              backgroundColor: item.hexCode || '#000',
                              border: '1px solid #d1d5db',
                              flexShrink: 0,
                            }}
                          />
                          <span style={{ fontWeight: 500, color: 'var(--color-on-surface)' }}>
                            {item.colorName} • {item.sizeName}
                          </span>
                        </div>
                      </td>

                      {/* Cột 4: Giá bán */}
                      <td style={tdStyle}>
                        {isEditing ? (
                          <input
                            type="number"
                            min="1000"
                            step="1000"
                            value={editPriceValue}
                            onChange={(e) => setEditPriceValue(Number(e.target.value))}
                            style={inlineInputStyle}
                          />
                        ) : (
                          <span style={{ fontWeight: 600, color: 'var(--color-on-surface)' }}>
                            {formatCurrency(item.price)}
                          </span>
                        )}
                      </td>

                      {/* Cột 5: Tồn kho (Quick inline edit) */}
                      <td style={tdStyle}>
                        {isEditing ? (
                          <div style={{ display: 'flex', alignItems: 'center', gap: '6px' }}>
                            <input
                              type="number"
                              min="0"
                              value={editStockValue}
                              onChange={(e) => setEditStockValue(Number(e.target.value))}
                              style={{ ...inlineInputStyle, width: '80px', textAlign: 'center', fontWeight: 700 }}
                            />
                            <span style={{ fontSize: '12px', color: 'var(--color-on-surface-variant)' }}>cái</span>
                          </div>
                        ) : (
                          <div
                            onClick={() => startEditing(item)}
                            title="Bấm để chỉnh sửa nhanh số lượng"
                            style={{
                              display: 'inline-flex',
                              alignItems: 'center',
                              gap: '6px',
                              cursor: 'pointer',
                              padding: '4px 8px',
                              borderRadius: '6px',
                              backgroundColor: 'transparent',
                              transition: 'background-color 150ms',
                            }}
                            onMouseEnter={(e) => (e.currentTarget.style.backgroundColor = '#f1f5f9')}
                            onMouseLeave={(e) => (e.currentTarget.style.backgroundColor = 'transparent')}
                          >
                            <span style={{ fontSize: '15px', fontWeight: 700, color: 'var(--color-on-surface)' }}>
                              {item.stockQuantity}
                            </span>
                            <span className="material-symbols-outlined" style={{ fontSize: '14px', color: '#94a3b8' }}>
                              edit
                            </span>
                          </div>
                        )}
                      </td>

                      {/* Cột 6: Trạng thái badge */}
                      <td style={tdStyle}>
                        {item.status === 'OutOfStock' ? (
                          <span style={{ ...badgeStyle, backgroundColor: '#fef2f2', color: '#dc2626', border: '1px solid #fecaca' }}>
                            🔴 Hết hàng
                          </span>
                        ) : item.status === 'LowStock' ? (
                          <span style={{ ...badgeStyle, backgroundColor: '#fffbeb', color: '#b45309', border: '1px solid #fef3c7' }}>
                            ⚠️ Sắp hết ({item.stockQuantity})
                          </span>
                        ) : (
                          <span style={{ ...badgeStyle, backgroundColor: '#f0fdf4', color: '#16a34a', border: '1px solid #bbf7d0' }}>
                            🟢 Còn hàng
                          </span>
                        )}
                      </td>

                      {/* Cột 7: Nút Thao tác */}
                      <td style={{ ...tdStyle, textAlign: 'right' }}>
                        {isEditing ? (
                          <div style={{ display: 'inline-flex', gap: '6px' }}>
                            <button
                              type="button"
                              disabled={isSaving}
                              onClick={() => saveQuickEdit(item.variantId)}
                              style={{
                                padding: '6px 12px',
                                borderRadius: '6px',
                                backgroundColor: '#1b1c1c',
                                color: '#ffffff',
                                border: 'none',
                                fontSize: '12px',
                                fontWeight: 600,
                                cursor: 'pointer',
                                display: 'inline-flex',
                                alignItems: 'center',
                                gap: '4px',
                              }}
                            >
                              <span className="material-symbols-outlined" style={{ fontSize: '14px' }}>
                                check
                              </span>
                              {isSaving ? '...' : 'Lưu'}
                            </button>
                            <button
                              type="button"
                              disabled={isSaving}
                              onClick={cancelEditing}
                              style={{
                                padding: '6px 10px',
                                borderRadius: '6px',
                                backgroundColor: '#e2e8f0',
                                color: '#475569',
                                border: 'none',
                                fontSize: '12px',
                                fontWeight: 500,
                                cursor: 'pointer',
                              }}
                            >
                              Hủy
                            </button>
                          </div>
                        ) : (
                          <button
                            type="button"
                            onClick={() => startEditing(item)}
                            style={{
                              padding: '6px 12px',
                              borderRadius: '6px',
                              backgroundColor: '#ffffff',
                              color: '#334155',
                              border: '1px solid #cbd5e1',
                              fontSize: '12px',
                              fontWeight: 600,
                              cursor: 'pointer',
                              display: 'inline-flex',
                              alignItems: 'center',
                              gap: '4px',
                            }}
                          >
                            <span className="material-symbols-outlined" style={{ fontSize: '14px' }}>
                              edit
                            </span>
                            Sửa kho
                          </button>
                        )}
                      </td>
                    </tr>
                  );
                })
              )}
            </tbody>
          </table>
        </div>

        {/* Phân trang */}
        {totalPages > 1 && (
          <div
            style={{
              display: 'flex',
              justifyContent: 'space-between',
              alignItems: 'center',
              padding: '14px 20px',
              borderTop: '1px solid var(--color-border-subtle)',
              backgroundColor: 'var(--color-surface-container-low)',
            }}
          >
            <span style={{ fontSize: '12.5px', color: 'var(--color-on-surface-variant)' }}>
              Hiển thị {items.length} trên tổng số {totalCount} biến thể
            </span>
            <div style={{ display: 'flex', gap: '6px' }}>
              <button
                type="button"
                disabled={pageNumber <= 1}
                onClick={() => setPageNumber((p) => Math.max(1, p - 1))}
                style={{
                  padding: '6px 12px',
                  borderRadius: '6px',
                  border: '1px solid var(--color-border-subtle)',
                  backgroundColor: pageNumber <= 1 ? '#f1f5f9' : '#ffffff',
                  color: pageNumber <= 1 ? '#94a3b8' : '#1b1c1c',
                  cursor: pageNumber <= 1 ? 'not-allowed' : 'pointer',
                  fontSize: '12px',
                  fontWeight: 600,
                }}
              >
                Trước
              </button>
              <span
                style={{
                  padding: '6px 12px',
                  fontSize: '12.5px',
                  fontWeight: 600,
                  color: 'var(--color-on-surface)',
                  display: 'flex',
                  alignItems: 'center',
                }}
              >
                Trang {pageNumber} / {totalPages}
              </span>
              <button
                type="button"
                disabled={pageNumber >= totalPages}
                onClick={() => setPageNumber((p) => Math.min(totalPages, p + 1))}
                style={{
                  padding: '6px 12px',
                  borderRadius: '6px',
                  border: '1px solid var(--color-border-subtle)',
                  backgroundColor: pageNumber >= totalPages ? '#f1f5f9' : '#ffffff',
                  color: pageNumber >= totalPages ? '#94a3b8' : '#1b1c1c',
                  cursor: pageNumber >= totalPages ? 'not-allowed' : 'pointer',
                  fontSize: '12px',
                  fontWeight: 600,
                }}
              >
                Sau
              </button>
            </div>
          </div>
        )}
      </div>
    </AdminSellerLayout>
  );
};

// ─── Inline Style Constants ──────────────────────────────────────────────────
const cardKpiStyle: React.CSSProperties = {
  backgroundColor: 'var(--color-surface-card)',
  borderRadius: 'var(--radius-xl)',
  padding: '20px 22px',
  border: '1px solid var(--color-border-subtle)',
  boxShadow: 'var(--shadow-sm)',
  display: 'flex',
  flexDirection: 'column',
  justifyContent: 'space-between',
};

const kpiLabelStyle: React.CSSProperties = {
  fontSize: '12px',
  color: 'var(--color-on-surface)',
  fontWeight: 700,
  letterSpacing: '0.5px',
};

const kpiIconWrapperStyle: React.CSSProperties = {
  width: '36px',
  height: '36px',
  borderRadius: '50%',
  backgroundColor: 'var(--color-surface-container-low)',
  display: 'flex',
  alignItems: 'center',
  justifyContent: 'center',
};

const kpiValueStyle: React.CSSProperties = {
  fontSize: '28px',
  fontWeight: 800,
  color: 'var(--color-on-surface)',
  marginTop: '8px',
  letterSpacing: '-0.5px',
};

const kpiSubtextStyle: React.CSSProperties = {
  fontSize: '12px',
  color: 'var(--color-on-surface-variant)',
  marginTop: '4px',
};

const thStyle: React.CSSProperties = {
  padding: '12px 16px',
  fontSize: '11.5px',
  fontWeight: 700,
  letterSpacing: '0.5px',
  color: '#64748b',
};

const tdStyle: React.CSSProperties = {
  padding: '14px 16px',
  verticalAlign: 'middle',
};

const badgeStyle: React.CSSProperties = {
  display: 'inline-flex',
  alignItems: 'center',
  padding: '4px 10px',
  borderRadius: '12px',
  fontSize: '12px',
  fontWeight: 600,
};

const inlineInputStyle: React.CSSProperties = {
  padding: '6px 10px',
  borderRadius: '6px',
  border: '1px solid #94a3b8',
  fontSize: '13px',
  backgroundColor: '#ffffff',
  color: '#1b1c1c',
  outline: 'none',
  width: '110px',
};
