import React, { useState, useEffect, useCallback } from 'react';
import { AdminSellerLayout } from '../components/layout/AdminSellerLayout';
import { voucherService } from '../services/voucherService';
import type {
  VoucherItem,
  VoucherStats,
  VoucherDiscountType,
  CreateUpdateVoucherPayload,
} from '../types/voucher';

const formatPrice = (v: number) =>
  new Intl.NumberFormat('vi-VN', { style: 'currency', currency: 'VND' }).format(v);

const formatDateShort = (iso: string) => {
  if (!iso) return '';
  return new Date(iso).toLocaleDateString('vi-VN', {
    day: '2-digit',
    month: '2-digit',
    year: 'numeric',
  });
};

const toDateTimeLocal = (iso?: string) => {
  const d = iso ? new Date(iso) : new Date();
  const pad = (n: number) => String(n).padStart(2, '0');
  return `${d.getFullYear()}-${pad(d.getMonth() + 1)}-${pad(d.getDate())}T${pad(d.getHours())}:${pad(d.getMinutes())}`;
};

export const AdminVoucherPage: React.FC = () => {
  const [stats, setStats] = useState<VoucherStats>({
    totalVouchers: 0,
    activeVouchers: 0,
    shippingVouchersCount: 0,
    discountVouchersCount: 0,
    totalRedemptions: 0,
    totalDiscountGranted: 0,
    expiringSoonCount: 0,
  });
  const [vouchers, setVouchers] = useState<VoucherItem[]>([]);
  const [loading, setLoading] = useState<boolean>(true);
  const [search, setSearch] = useState<string>('');
  const [typeFilter, setTypeFilter] = useState<'all' | 'percentage' | 'fixed'>('all');
  const [toast, setToast] = useState<{ text: string; type: 'success' | 'error' } | null>(null);

  // Modal Create / Edit State
  const [modalOpen, setModalOpen] = useState<boolean>(false);
  const [editingVoucher, setEditingVoucher] = useState<VoucherItem | null>(null);
  const [saving, setSaving] = useState<boolean>(false);
  const [formError, setFormError] = useState<string | null>(null);

  const [form, setForm] = useState<{
    code: string;
    title: string;
    description: string;
    discountType: VoucherDiscountType;
    discountValue: number;
    maxDiscountAmount: string;
    minOrderValue: number;
    startDate: string;
    endDate: string;
    usageLimit: number;
    maxUsagePerUser: number;
    isActive: boolean;
  }>({
    code: '',
    title: '',
    description: '',
    discountType: 1,
    discountValue: 50000,
    maxDiscountAmount: '',
    minOrderValue: 300000,
    startDate: toDateTimeLocal(new Date().toISOString()),
    endDate: toDateTimeLocal(new Date(Date.now() + 30 * 86400000).toISOString()),
    usageLimit: 200,
    maxUsagePerUser: 1,
    isActive: true,
  });

  const showNotice = (text: string, type: 'success' | 'error' = 'success') => {
    setToast({ text, type });
    setTimeout(() => setToast(null), 3500);
  };

  const fetchVouchers = useCallback(async () => {
    setLoading(true);
    try {
      const data = await voucherService.getAdminVouchers();
      setStats(data.stats);
      // Chỉ hiển thị mã giảm giá đơn hàng (% và tiền mặt), không hiển thị mã Freeship ở trang này
      setVouchers(data.items.filter((v) => v.discountType !== 2));
    } catch (err: unknown) {
      showNotice(err instanceof Error ? err.message : 'Lỗi tải danh sách mã giảm giá.', 'error');
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchVouchers();
  }, [fetchVouchers]);

  const handleOpenCreate = () => {
    setEditingVoucher(null);
    setFormError(null);
    setForm({
      code: 'SHOPVIBE',
      title: 'Giảm Giá Đơn Hàng ...',
      description: '',
      discountType: 1,
      discountValue: 50000,
      maxDiscountAmount: '',
      minOrderValue: 300000,
      startDate: toDateTimeLocal(new Date().toISOString()),
      endDate: toDateTimeLocal(new Date(Date.now() + 30 * 86400000).toISOString()),
      usageLimit: 200,
      maxUsagePerUser: 2,
      isActive: true,
    });
    setModalOpen(true);
  };

  const handleOpenEdit = (v: VoucherItem) => {
    setEditingVoucher(v);
    setFormError(null);
    setForm({
      code: v.code,
      title: v.title,
      description: v.description || '',
      discountType: v.discountType === 2 ? 1 : v.discountType,
      discountValue: v.discountValue,
      maxDiscountAmount: v.maxDiscountAmount ? String(v.maxDiscountAmount) : '',
      minOrderValue: v.minOrderValue,
      startDate: toDateTimeLocal(v.startDate),
      endDate: toDateTimeLocal(v.endDate),
      usageLimit: v.usageLimit,
      maxUsagePerUser: v.maxUsagePerUser,
      isActive: v.isActive,
    });
    setModalOpen(true);
  };

  const handleSave = async (e: React.FormEvent) => {
    e.preventDefault();
    setFormError(null);

    if (!form.code.trim() || !form.title.trim()) {
      setFormError('Vui lòng nhập đầy đủ Mã code và Tên chương trình.');
      return;
    }

    setSaving(true);
    const payload: CreateUpdateVoucherPayload = {
      code: form.code.trim().toUpperCase(),
      title: form.title.trim(),
      description: form.description.trim() || undefined,
      discountType: form.discountType,
      discountValue: Number(form.discountValue),
      maxDiscountAmount:
        form.discountType === 0 && form.maxDiscountAmount.trim()
          ? Number(form.maxDiscountAmount)
          : null,
      minOrderValue: Number(form.minOrderValue),
      startDate: new Date(form.startDate).toISOString(),
      endDate: new Date(form.endDate).toISOString(),
      usageLimit: Number(form.usageLimit),
      maxUsagePerUser: Number(form.maxUsagePerUser),
      isActive: form.isActive,
    };

    try {
      if (editingVoucher) {
        const res = await voucherService.updateVoucher(editingVoucher.voucherId, payload);
        showNotice(res.message);
      } else {
        const res = await voucherService.createVoucher(payload);
        showNotice(res.message);
      }
      setModalOpen(false);
      await fetchVouchers();
    } catch (err: unknown) {
      setFormError(err instanceof Error ? err.message : 'Không thể lưu mã ưu đãi.');
    } finally {
      setSaving(false);
    }
  };

  const handleToggle = async (v: VoucherItem) => {
    try {
      const res = await voucherService.toggleVoucher(v.voucherId);
      showNotice(res.message);
      await fetchVouchers();
    } catch (err: unknown) {
      showNotice(err instanceof Error ? err.message : 'Lỗi đổi trạng thái.', 'error');
    }
  };

  const handleDelete = async (v: VoucherItem) => {
    if (!window.confirm(`Bạn có chắc chắn muốn xóa/ngưng mã ${v.code}?`)) return;
    try {
      const res = await voucherService.deleteVoucher(v.voucherId);
      showNotice(res.message);
      await fetchVouchers();
    } catch (err: unknown) {
      showNotice(err instanceof Error ? err.message : 'Lỗi xóa mã.', 'error');
    }
  };

  const percentageCount = vouchers.filter((v) => v.discountType === 0).length;
  const fixedCount = vouchers.filter((v) => v.discountType === 1).length;

  const filteredItems = vouchers.filter((v) => {
    if (typeFilter === 'percentage' && v.discountType !== 0) return false;
    if (typeFilter === 'fixed' && v.discountType !== 1) return false;
    if (search.trim()) {
      const q = search.trim().toLowerCase();
      return (
        v.code.toLowerCase().includes(q) ||
        v.title.toLowerCase().includes(q) ||
        (v.description && v.description.toLowerCase().includes(q))
      );
    }
    return true;
  });

  return (
    <AdminSellerLayout
      title="Quản Lý Mã Giảm Giá Toàn Sàn"
      subtitle="Phát hành Mã Giảm Giá theo % hoặc Tiền mặt (Chính sách Freeship được cấu hình riêng tại trang Cước vận chuyển)"
    >
      {/* Toast Notification */}
      {toast && (
        <div
          style={{
            marginBottom: 18,
            padding: '12px 18px',
            borderRadius: 12,
            backgroundColor: toast.type === 'success' ? '#111111' : '#d30005',
            color: '#ffffff',
            fontSize: 13.5,
            fontWeight: 700,
            display: 'flex',
            alignItems: 'center',
            gap: 8,
          }}
        >
          <span>{toast.type === 'success' ? '✓' : '⚠️'}</span>
          <span>{toast.text}</span>
        </div>
      )}

      {/* 1. KPI Summary Cards */}
      <div
        style={{
          display: 'grid',
          gridTemplateColumns: 'repeat(auto-fit, minmax(220px, 1fr))',
          gap: 16,
          marginBottom: 24,
        }}
      >
        <div style={cardStyle}>
          <span style={kpiLabelStyle}>Đang hoạt động</span>
          <div style={kpiValueStyle}>
            {vouchers.filter((v) => v.isActive && !v.isExpired && !v.isExhausted).length}{' '}
            <span style={{ fontSize: 14, fontWeight: 600, color: '#707072' }}>
              / {vouchers.length} mã
            </span>
          </div>
          <span style={kpiSubStyle}>
            🏷️ {percentageCount} Giảm theo % • 💵 {fixedCount} Giảm tiền mặt
          </span>
        </div>

        <div style={cardStyle}>
          <span style={kpiLabelStyle}>Tổng lượt khách đã dùng</span>
          <div style={kpiValueStyle}>
            {vouchers.reduce((acc, v) => acc + v.usedCount, 0).toLocaleString('vi-VN')}
          </div>
          <span style={kpiSubStyle}>Lượt áp dụng thành công</span>
        </div>

        <div style={cardStyle}>
          <span style={kpiLabelStyle}>Tổng ngân sách đã giảm</span>
          <div style={{ ...kpiValueStyle, color: 'var(--nike-sale, #d30005)' }}>
            {formatPrice(stats.totalDiscountGranted)}
          </div>
          <span style={kpiSubStyle}>Tính trên các đơn không hủy</span>
        </div>

        <div style={cardStyle}>
          <span style={kpiLabelStyle}>Sắp hết hạn (7 ngày tới)</span>
          <div style={kpiValueStyle}>{stats.expiringSoonCount}</div>
          <span style={kpiSubStyle}>Cần gia hạn hoặc tạo chiến dịch mới</span>
        </div>
      </div>

      {/* 2. Action Bar & Filters */}
      <div
        style={{
          ...cardStyle,
          marginBottom: 20,
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'space-between',
          flexWrap: 'wrap',
          gap: 14,
        }}
      >
        <div style={{ display: 'flex', alignItems: 'center', gap: 10, flexWrap: 'wrap' }}>
          {/* Filter Tabs */}
          {[
            { key: 'all', label: `Tất cả (${vouchers.length})` },
            { key: 'percentage', label: `🏷️ Giảm theo % (${percentageCount})` },
            { key: 'fixed', label: `💵 Giảm tiền mặt (${fixedCount})` },
          ].map((tab) => {
            const active = typeFilter === tab.key;
            return (
              <button
                key={tab.key}
                type="button"
                onClick={() => setTypeFilter(tab.key as 'all' | 'percentage' | 'fixed')}
                style={{
                  padding: '8px 16px',
                  borderRadius: 9999,
                  border: active ? '1px solid #111111' : '1px solid var(--nike-hairline, #e5e5e5)',
                  backgroundColor: active ? '#111111' : '#ffffff',
                  color: active ? '#ffffff' : '#111111',
                  fontSize: 12.5,
                  fontWeight: 700,
                  cursor: 'pointer',
                }}
              >
                {tab.label}
              </button>
            );
          })}

          <input
            type="text"
            placeholder="Tìm theo mã code hoặc tên chương trình…"
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            style={{
              height: 38,
              padding: '0 14px',
              borderRadius: 9999,
              border: '1px solid var(--nike-hairline, #e5e5e5)',
              fontSize: 13,
              minWidth: 250,
              outline: 'none',
            }}
          />
        </div>

        <button
          type="button"
          onClick={handleOpenCreate}
          className="btn-pill-primary"
          style={{
            padding: '9px 18px',
            borderRadius: 9999,
            border: 'none',
            backgroundColor: '#111111',
            color: '#ffffff',
            fontSize: 12.5,
            fontWeight: 800,
            cursor: 'pointer',
          }}
        >
          + Tạo Mã Giảm Giá
        </button>
      </div>

      {/* 3. Voucher Table */}
      <div style={{ ...cardStyle, padding: 0, overflow: 'hidden' }}>
        {loading ? (
          <div style={{ padding: 48, textAlign: 'center', color: '#707072' }}>
            Đang tải danh sách mã giảm giá…
          </div>
        ) : filteredItems.length === 0 ? (
          <div style={{ padding: 48, textAlign: 'center', color: '#707072' }}>
            Chưa có mã giảm giá nào phù hợp với bộ lọc.
          </div>
        ) : (
          <div style={{ overflowX: 'auto' }}>
            <table style={{ width: '100%', borderCollapse: 'collapse', textAlign: 'left' }}>
              <thead>
                <tr
                  style={{
                    backgroundColor: 'var(--nike-soft-cloud, #f5f5f7)',
                    borderBottom: '1px solid var(--nike-hairline, #e5e5e5)',
                    fontSize: 11.5,
                    fontWeight: 800,
                    textTransform: 'uppercase',
                    letterSpacing: '0.05em',
                    color: '#707072',
                  }}
                >
                  <th style={{ padding: '14px 18px' }}>Mã Code & Chương trình</th>
                  <th style={{ padding: '14px 14px' }}>Loại ưu đãi</th>
                  <th style={{ padding: '14px 14px' }}>Mức giảm</th>
                  <th style={{ padding: '14px 14px' }}>Đơn tối thiểu</th>
                  <th style={{ padding: '14px 14px' }}>Lượt sử dụng</th>
                  <th style={{ padding: '14px 14px' }}>Hiệu lực</th>
                  <th style={{ padding: '14px 14px' }}>Trạng thái</th>
                  <th style={{ padding: '14px 18px', textAlign: 'right' }}>Thao tác</th>
                </tr>
              </thead>
              <tbody>
                {filteredItems.map((v) => (
                  <tr
                    key={v.voucherId}
                    style={{
                      borderBottom: '1px solid var(--nike-hairline, #e5e5e5)',
                      fontSize: 13.5,
                    }}
                  >
                    <td style={{ padding: '14px 18px' }}>
                      <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
                        <span
                          style={{
                            padding: '3px 9px',
                            borderRadius: 6,
                            backgroundColor: '#111111',
                            color: '#ffffff',
                            fontWeight: 900,
                            fontSize: 12,
                            letterSpacing: '0.04em',
                          }}
                        >
                          {v.code}
                        </span>
                        <strong style={{ color: '#111111' }}>{v.title}</strong>
                      </div>
                      {v.description && (
                        <div style={{ fontSize: 12, color: '#707072', marginTop: 4 }}>
                          {v.description}
                        </div>
                      )}
                    </td>

                    <td style={{ padding: '14px 14px' }}>
                      <span
                        style={{
                          padding: '4px 10px',
                          borderRadius: 9999,
                          fontSize: 11.5,
                          fontWeight: 700,
                          backgroundColor: '#f5f5f7',
                          color: '#111111',
                        }}
                      >
                        🏷️ {v.discountTypeName}
                      </span>
                    </td>

                    <td style={{ padding: '14px 14px', fontWeight: 800, color: 'var(--nike-sale, #d30005)' }}>
                      {v.discountType === 0
                        ? `-${v.discountValue}%`
                        : `-${formatPrice(v.discountValue)}`}
                      {v.maxDiscountAmount ? (
                        <div style={{ fontSize: 11, fontWeight: 500, color: '#707072' }}>
                          Tối đa {formatPrice(v.maxDiscountAmount)}
                        </div>
                      ) : null}
                    </td>

                    <td style={{ padding: '14px 14px', fontWeight: 700 }}>
                      {formatPrice(v.minOrderValue)}
                    </td>

                    <td style={{ padding: '14px 14px', minWidth: 130 }}>
                      <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: 12, fontWeight: 700, marginBottom: 4 }}>
                        <span>
                          {v.usedCount} / {v.usageLimit}
                        </span>
                        <span style={{ color: '#707072' }}>{v.usagePercentage}%</span>
                      </div>
                      <div
                        style={{
                          height: 6,
                          borderRadius: 9999,
                          backgroundColor: '#e5e5e5',
                          overflow: 'hidden',
                        }}
                      >
                        <div
                          style={{
                            height: '100%',
                            width: `${v.usagePercentage}%`,
                            backgroundColor: '#111111',
                          }}
                        />
                      </div>
                      <div style={{ fontSize: 11, color: '#707072', marginTop: 3 }}>
                        Tối đa {v.maxUsagePerUser} lần/khách
                      </div>
                    </td>

                    <td style={{ padding: '14px 14px', fontSize: 12, color: '#444' }}>
                      <div>Từ: {formatDateShort(v.startDate)}</div>
                      <div>Đến: {formatDateShort(v.endDate)}</div>
                    </td>

                    <td style={{ padding: '14px 14px' }}>
                      <button
                        type="button"
                        onClick={() => handleToggle(v)}
                        style={{
                          padding: '4px 12px',
                          borderRadius: 9999,
                          border: 'none',
                          fontSize: 11.5,
                          fontWeight: 800,
                          cursor: 'pointer',
                          backgroundColor:
                            v.isActive && !v.isExpired && !v.isExhausted
                              ? '#dcfce7'
                              : '#f3f4f6',
                          color:
                            v.isActive && !v.isExpired && !v.isExhausted
                              ? '#166534'
                              : '#6b7280',
                        }}
                      >
                        {v.isExpired
                          ? 'Hết hạn'
                          : v.isExhausted
                          ? 'Hết lượt'
                          : v.isActive
                          ? '● Đang bật'
                          : '○ Tạm tắt'}
                      </button>
                    </td>

                    <td style={{ padding: '14px 18px', textAlign: 'right', whiteSpace: 'nowrap' }}>
                      <button
                        type="button"
                        onClick={() => handleOpenEdit(v)}
                        style={{
                          padding: '6px 12px',
                          borderRadius: 8,
                          border: '1px solid var(--nike-hairline, #e5e5e5)',
                          backgroundColor: '#ffffff',
                          fontSize: 12,
                          fontWeight: 700,
                          cursor: 'pointer',
                          marginRight: 6,
                        }}
                      >
                        Sửa
                      </button>
                      <button
                        type="button"
                        onClick={() => handleDelete(v)}
                        style={{
                          padding: '6px 12px',
                          borderRadius: 8,
                          border: '1px solid #fecdd3',
                          backgroundColor: '#fff1f2',
                          color: '#d30005',
                          fontSize: 12,
                          fontWeight: 700,
                          cursor: 'pointer',
                        }}
                      >
                        Xóa
                      </button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>

      {/* MODAL TẠO / SỬA MÃ GIẢM GIÁ */}
      {modalOpen && (
        <div
          style={{
            position: 'fixed',
            inset: 0,
            zIndex: 999,
            backgroundColor: 'rgba(0,0,0,0.45)',
            backdropFilter: 'blur(4px)',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            padding: 16,
          }}
          onClick={() => setModalOpen(false)}
        >
          <form
            onSubmit={handleSave}
            onClick={(e) => e.stopPropagation()}
            style={{
              backgroundColor: '#ffffff',
              borderRadius: 18,
              width: '100%',
              maxWidth: 560,
              maxHeight: '90vh',
              overflowY: 'auto',
              padding: 24,
              border: '1px solid var(--nike-hairline, #e5e5e5)',
            }}
          >
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 18 }}>
              <h3 style={{ margin: 0, fontSize: 18, fontWeight: 900 }}>
                {editingVoucher ? `Chỉnh sửa mã ${editingVoucher.code}` : 'Phát hành Mã Giảm Giá Mới'}
              </h3>
              <button
                type="button"
                onClick={() => setModalOpen(false)}
                style={{ background: 'none', border: 'none', fontSize: 18, cursor: 'pointer' }}
              >
                ✕
              </button>
            </div>

            {formError && (
              <div
                style={{
                  marginBottom: 14,
                  padding: '10px 14px',
                  borderRadius: 10,
                  backgroundColor: '#fff1f2',
                  color: '#d30005',
                  fontSize: 13,
                  fontWeight: 600,
                }}
              >
                {formError}
              </div>
            )}

            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 14 }}>
              <div>
                <label style={labelStyle}>Mã Code (In hoa) *</label>
                <input
                  type="text"
                  required
                  value={form.code}
                  onChange={(e) => setForm({ ...form, code: e.target.value.toUpperCase() })}
                  placeholder="VD: WELCOME50, ATELIER15"
                  style={inputStyle}
                />
              </div>

              <div>
                <label style={labelStyle}>Loại Mã Giảm Giá *</label>
                <select
                  value={form.discountType}
                  onChange={(e) =>
                    setForm({ ...form, discountType: Number(e.target.value) as VoucherDiscountType })
                  }
                  style={inputStyle}
                >
                  <option value={1}>💵 Giảm Tiền Mặt Đơn Hàng (VNĐ)</option>
                  <option value={0}>🏷️ Giảm Theo Phần Trăm (%)</option>
                </select>
              </div>

              <div style={{ gridColumn: '1 / -1' }}>
                <label style={labelStyle}>Tên chương trình hiển thị *</label>
                <input
                  type="text"
                  required
                  value={form.title}
                  onChange={(e) => setForm({ ...form, title: e.target.value })}
                  placeholder="VD: Giảm 50K Đơn Từ 300K"
                  style={inputStyle}
                />
              </div>

              <div style={{ gridColumn: '1 / -1' }}>
                <label style={labelStyle}>Mô tả điều kiện</label>
                <input
                  type="text"
                  value={form.description}
                  onChange={(e) => setForm({ ...form, description: e.target.value })}
                  placeholder="Mô tả ngắn gọn hiển thị cho khách mua hàng"
                  style={inputStyle}
                />
              </div>

              <div>
                <label style={labelStyle}>
                  {form.discountType === 0
                    ? 'Mức giảm (%) *'
                    : 'Số tiền giảm trực tiếp (VNĐ) *'}
                </label>
                <input
                  type="number"
                  required
                  min={1}
                  value={form.discountValue}
                  onChange={(e) => setForm({ ...form, discountValue: Number(e.target.value) })}
                  style={inputStyle}
                />
              </div>

              <div>
                <label style={labelStyle}>Giá trị đơn hàng tối thiểu (VNĐ) *</label>
                <input
                  type="number"
                  required
                  min={0}
                  value={form.minOrderValue}
                  onChange={(e) => setForm({ ...form, minOrderValue: Number(e.target.value) })}
                  style={inputStyle}
                />
              </div>

              {form.discountType === 0 && (
                <div style={{ gridColumn: '1 / -1' }}>
                  <label style={labelStyle}>Mức giảm tối đa (VNĐ - Bỏ trống nếu không giới hạn)</label>
                  <input
                    type="number"
                    min={0}
                    value={form.maxDiscountAmount}
                    onChange={(e) => setForm({ ...form, maxDiscountAmount: e.target.value })}
                    placeholder="VD: 150000"
                    style={inputStyle}
                  />
                </div>
              )}

              <div>
                <label style={labelStyle}>Ngày bắt đầu *</label>
                <input
                  type="datetime-local"
                  required
                  value={form.startDate}
                  onChange={(e) => setForm({ ...form, startDate: e.target.value })}
                  style={inputStyle}
                />
              </div>

              <div>
                <label style={labelStyle}>Ngày kết thúc *</label>
                <input
                  type="datetime-local"
                  required
                  value={form.endDate}
                  onChange={(e) => setForm({ ...form, endDate: e.target.value })}
                  style={inputStyle}
                />
              </div>

              <div>
                <label style={labelStyle}>Tổng lượt phát hành toàn sàn *</label>
                <input
                  type="number"
                  required
                  min={1}
                  value={form.usageLimit}
                  onChange={(e) => setForm({ ...form, usageLimit: Number(e.target.value) })}
                  style={inputStyle}
                />
              </div>

              <div>
                <label style={labelStyle}>Số lần dùng tối đa / 1 Khách *</label>
                <input
                  type="number"
                  required
                  min={1}
                  value={form.maxUsagePerUser}
                  onChange={(e) => setForm({ ...form, maxUsagePerUser: Number(e.target.value) })}
                  style={inputStyle}
                />
              </div>
            </div>

            <div style={{ display: 'flex', justifyContent: 'flex-end', gap: 10, marginTop: 22 }}>
              <button
                type="button"
                onClick={() => setModalOpen(false)}
                style={{
                  padding: '10px 18px',
                  borderRadius: 9999,
                  border: '1px solid var(--nike-hairline, #e5e5e5)',
                  backgroundColor: '#ffffff',
                  fontWeight: 700,
                  cursor: 'pointer',
                }}
              >
                Hủy
              </button>
              <button
                type="submit"
                disabled={saving}
                className="btn-pill-primary"
                style={{
                  padding: '10px 24px',
                  borderRadius: 9999,
                  border: 'none',
                  backgroundColor: '#111111',
                  color: '#ffffff',
                  fontWeight: 800,
                  cursor: 'pointer',
                }}
              >
                {saving ? 'Đang lưu…' : editingVoucher ? 'Lưu thay đổi' : 'Phát hành Mã'}
              </button>
            </div>
          </form>
        </div>
      )}
    </AdminSellerLayout>
  );
};

const cardStyle: React.CSSProperties = {
  backgroundColor: '#ffffff',
  border: '1px solid var(--nike-hairline, #e5e5e5)',
  borderRadius: 16,
  padding: 20,
};

const kpiLabelStyle: React.CSSProperties = {
  fontSize: 12,
  fontWeight: 700,
  textTransform: 'uppercase',
  letterSpacing: '0.04em',
  color: '#707072',
};

const kpiValueStyle: React.CSSProperties = {
  fontSize: 26,
  fontWeight: 900,
  color: '#111111',
  margin: '6px 0 4px',
  letterSpacing: '-0.02em',
};

const kpiSubStyle: React.CSSProperties = {
  fontSize: 12,
  color: '#707072',
};

const labelStyle: React.CSSProperties = {
  display: 'block',
  fontSize: 12.5,
  fontWeight: 700,
  color: '#111111',
  marginBottom: 6,
};

const inputStyle: React.CSSProperties = {
  width: '100%',
  height: 42,
  padding: '0 12px',
  borderRadius: 10,
  border: '1px solid var(--nike-hairline, #e5e5e5)',
  fontSize: 13.5,
  boxSizing: 'border-box',
  outline: 'none',
};
