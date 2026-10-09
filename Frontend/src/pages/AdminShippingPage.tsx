import React, { useState, useEffect } from 'react';
import { AdminSellerLayout } from '../components/layout/AdminSellerLayout';
import { shippingService } from '../services/shippingService';
import type { ShippingSetting, ShippingRule, CreateShippingRuleRequest } from '../types/shipping';

export const AdminShippingPage: React.FC = () => {
  // ─── Settings State ──────────────────────────────────────────────────────────
  const [_settings, setSettings] = useState<ShippingSetting | null>(null);
  const [thresholdInput, setThresholdInput] = useState<string>('1000000');
  const [defaultFeeInput, setDefaultFeeInput] = useState<string>('30000');
  const [isFreeShippingEnabled, setIsFreeShippingEnabled] = useState<boolean>(true);
  const [savingSettings, setSavingSettings] = useState<boolean>(false);
  const [settingsMessage, setSettingsMessage] = useState<{ type: 'success' | 'error'; text: string } | null>(null);

  // ─── Rules State ────────────────────────────────────────────────────────────
  const [rules, setRules] = useState<ShippingRule[]>([]);
  const [loadingRules, setLoadingRules] = useState<boolean>(true);

  // Modal State (Create / Edit)
  const [isModalOpen, setIsModalOpen] = useState<boolean>(false);
  const [editingRuleId, setEditingRuleId] = useState<number | null>(null);
  const [modalForm, setModalForm] = useState<CreateShippingRuleRequest>({
    fromLocation: 'TP. Hồ Chí Minh',
    toLocation: '',
    fee: 30000,
    estimatedDeliveryDays: '2 - 4 ngày',
    isActive: true,
  });
  const [modalSubmitting, setModalSubmitting] = useState<boolean>(false);
  const [modalError, setModalError] = useState<string | null>(null);

  // Delete Confirm State
  const [deletingRuleId, setDeletingRuleId] = useState<number | null>(null);

  // ─── Load Initial Data ──────────────────────────────────────────────────────
  const fetchData = async () => {
    try {
      setLoadingRules(true);
      const [settingsRes, rulesRes] = await Promise.all([
        shippingService.getAdminSettings(),
        shippingService.getAllRules(),
      ]);

      if (settingsRes && settingsRes.data) {
        setSettings(settingsRes.data);
        setThresholdInput(settingsRes.data.freeShippingThreshold.toString());
        setDefaultFeeInput(settingsRes.data.defaultShippingFee.toString());
        setIsFreeShippingEnabled(settingsRes.data.isFreeShippingEnabled);
      }

      if (rulesRes && rulesRes.data) {
        setRules(rulesRes.data);
      }
    } catch (err: any) {
      console.error('Lỗi khi tải cấu hình vận chuyển:', err);
    } finally {
      setLoadingRules(false);
    }
  };

  useEffect(() => {
    fetchData();
  }, []);

  // ─── Handler: Update Settings ──────────────────────────────────────────────
  const handleSaveSettings = async (e: React.FormEvent) => {
    e.preventDefault();
    setSettingsMessage(null);

    const threshold = parseFloat(thresholdInput);
    const defaultFee = parseFloat(defaultFeeInput);

    if (isNaN(threshold) || threshold < 0) {
      setSettingsMessage({ type: 'error', text: 'Ngưỡng miễn phí vận chuyển không hợp lệ.' });
      return;
    }

    if (isNaN(defaultFee) || defaultFee < 0) {
      setSettingsMessage({ type: 'error', text: 'Phí ship mặc định không hợp lệ.' });
      return;
    }

    try {
      setSavingSettings(true);
      const res = await shippingService.updateAdminSettings({
        freeShippingThreshold: threshold,
        defaultShippingFee: defaultFee,
        isFreeShippingEnabled,
      });

      if (res && res.data) {
        setSettings(res.data);
        setSettingsMessage({ type: 'success', text: 'Cập nhật cấu hình Freeship & cước mặc định thành công!' });
      }
    } catch (err: any) {
      setSettingsMessage({ type: 'error', text: err.message || 'Lỗi khi lưu cài đặt.' });
    } finally {
      setSavingSettings(false);
    }
  };

  // ─── Handler: Open Modal Create/Edit ───────────────────────────────────────
  const openCreateModal = () => {
    setEditingRuleId(null);
    setModalForm({
      fromLocation: 'TP. Hồ Chí Minh',
      toLocation: '',
      fee: 30000,
      estimatedDeliveryDays: '2 - 4 ngày',
      isActive: true,
    });
    setModalError(null);
    setIsModalOpen(true);
  };

  const openEditModal = (rule: ShippingRule) => {
    setEditingRuleId(rule.shippingRuleId);
    setModalForm({
      fromLocation: rule.fromLocation,
      toLocation: rule.toLocation,
      fee: rule.fee,
      estimatedDeliveryDays: rule.estimatedDeliveryDays || '2 - 4 ngày',
      isActive: rule.isActive,
    });
    setModalError(null);
    setIsModalOpen(true);
  };

  // ─── Handler: Save Modal Form ──────────────────────────────────────────────
  const handleSaveModal = async (e: React.FormEvent) => {
    e.preventDefault();
    setModalError(null);

    if (!modalForm.fromLocation.trim()) {
      setModalError('Vui lòng nhập điểm gửi hàng.');
      return;
    }
    if (!modalForm.toLocation.trim()) {
      setModalError('Vui lòng nhập điểm nhận hàng (ví dụ: Hà Nội, Miền Bắc, Toàn Quốc...).');
      return;
    }
    if (modalForm.fee < 0) {
      setModalError('Cước phí không được âm.');
      return;
    }

    try {
      setModalSubmitting(true);
      if (editingRuleId) {
        await shippingService.updateRule(editingRuleId, modalForm);
      } else {
        await shippingService.createRule(modalForm);
      }
      setIsModalOpen(false);
      await fetchData();
    } catch (err: any) {
      setModalError(err.message || 'Đã xảy ra lỗi khi lưu tuyến vận chuyển.');
    } finally {
      setModalSubmitting(false);
    }
  };

  // ─── Handler: Delete Rule ──────────────────────────────────────────────────
  const handleDeleteRule = async (id: number) => {
    try {
      setDeletingRuleId(id);
      await shippingService.deleteRule(id);
      setRules((prev) => prev.filter((r) => r.shippingRuleId !== id));
    } catch (err: any) {
      alert(err.message || 'Lỗi khi xóa tuyến vận chuyển.');
    } finally {
      setDeletingRuleId(null);
    }
  };

  const formatVND = (amount: number) => {
    return new Intl.NumberFormat('vi-VN', { style: 'currency', currency: 'VND' }).format(amount);
  };

  return (
    <AdminSellerLayout
      title="Quản lý Cước Vận Chuyển"
      subtitle="Thiết lập hạn mức Freeship tự động và định cấu hình phí ship cho từng tỉnh thành/khu vực"
    >
      <div style={{ maxWidth: '1080px', margin: '0 auto', paddingBottom: '48px' }}>
        
        {/* ── CARD 1: CẤU HÌNH FREESHIP TOÀN SÀN ── */}
        <section
          style={{
            backgroundColor: '#ffffff',
            borderRadius: '14px',
            border: '1px solid #ebebeb',
            padding: '24px',
            marginBottom: '32px',
            boxShadow: '0 1px 3px rgba(0,0,0,0.02)',
          }}
        >
          <div style={{ display: 'flex', alignItems: 'center', gap: '12px', marginBottom: '16px' }}>
            <span className="material-symbols-outlined" style={{ color: '#ff385c', fontSize: '28px' }}>
              local_shipping
            </span>
            <div>
              <h2 style={{ fontSize: '18px', fontWeight: 600, color: '#222222', margin: 0 }}>
                Chính Sách Miễn Phí Vận Chuyển (Freeship)
              </h2>
              <p style={{ fontSize: '13px', color: '#717171', margin: '2px 0 0' }}>
                Đơn hàng đạt giá trị tối thiểu này sẽ được tự động miễn phí vận chuyển 0₫ tại Cart & Checkout.
              </p>
            </div>
          </div>

          {settingsMessage && (
            <div
              style={{
                padding: '12px 16px',
                borderRadius: '8px',
                marginBottom: '16px',
                fontSize: '13px',
                backgroundColor: settingsMessage.type === 'success' ? '#f0fdf4' : '#fef2f2',
                color: settingsMessage.type === 'success' ? '#166534' : '#991b1b',
                border: `1px solid ${settingsMessage.type === 'success' ? '#bbf7d0' : '#fecaca'}`,
              }}
            >
              {settingsMessage.text}
            </div>
          )}

          <form onSubmit={handleSaveSettings}>
            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(240px, 1fr))', gap: '20px' }}>
              {/* Ngưỡng Freeship */}
              <div>
                <label
                  style={{
                    display: 'block',
                    fontSize: '13px',
                    fontWeight: 600,
                    color: '#222222',
                    marginBottom: '8px',
                  }}
                >
                  Đơn hàng tối thiểu để Freeship (VNĐ)
                </label>
                <div style={{ position: 'relative' }}>
                  <input
                    type="number"
                    min="0"
                    step="10000"
                    value={thresholdInput}
                    onChange={(e) => setThresholdInput(e.target.value)}
                    placeholder="1000000"
                    style={{
                      width: '100%',
                      padding: '10px 14px',
                      fontSize: '14px',
                      borderRadius: '8px',
                      border: '1px solid #b0b0b0',
                      outline: 'none',
                      backgroundColor: '#fff',
                    }}
                  />
                </div>
                <p style={{ fontSize: '12px', color: '#717171', marginTop: '4px' }}>
                  Hiện tại: <strong>{formatVND(parseFloat(thresholdInput) || 0)}</strong>
                </p>
              </div>

              {/* Phí ship mặc định */}
              <div>
                <label
                  style={{
                    display: 'block',
                    fontSize: '13px',
                    fontWeight: 600,
                    color: '#222222',
                    marginBottom: '8px',
                  }}
                >
                  Cước ship mặc định (nếu không khớp tuyến)
                </label>
                <input
                  type="number"
                  min="0"
                  step="5000"
                  value={defaultFeeInput}
                  onChange={(e) => setDefaultFeeInput(e.target.value)}
                  placeholder="30000"
                  style={{
                    width: '100%',
                    padding: '10px 14px',
                    fontSize: '14px',
                    borderRadius: '8px',
                    border: '1px solid #b0b0b0',
                    outline: 'none',
                    backgroundColor: '#fff',
                  }}
                />
                <p style={{ fontSize: '12px', color: '#717171', marginTop: '4px' }}>
                  Hiện tại: <strong>{formatVND(parseFloat(defaultFeeInput) || 0)}</strong>
                </p>
              </div>

              {/* Bật/Tắt Freeship */}
              <div>
                <label
                  style={{
                    display: 'block',
                    fontSize: '13px',
                    fontWeight: 600,
                    color: '#222222',
                    marginBottom: '8px',
                  }}
                >
                  Trạng thái Freeship
                </label>
                <label
                  style={{
                    display: 'flex',
                    alignItems: 'center',
                    gap: '10px',
                    cursor: 'pointer',
                    height: '42px',
                    padding: '0 12px',
                    borderRadius: '8px',
                    border: '1px solid #ebebeb',
                    backgroundColor: isFreeShippingEnabled ? '#fff5f7' : '#f7f7f7',
                  }}
                >
                  <input
                    type="checkbox"
                    checked={isFreeShippingEnabled}
                    onChange={(e) => setIsFreeShippingEnabled(e.target.checked)}
                    style={{ width: '16px', height: '16px', accentColor: '#ff385c' }}
                  />
                  <span style={{ fontSize: '13px', fontWeight: 500, color: '#222222' }}>
                    {isFreeShippingEnabled ? 'Đang kích hoạt Freeship' : 'Tạm tắt Freeship'}
                  </span>
                </label>
              </div>
            </div>

            <div style={{ marginTop: '20px', display: 'flex', justifyContent: 'flex-end' }}>
              <button
                type="submit"
                disabled={savingSettings}
                style={{
                  backgroundColor: '#ff385c',
                  color: '#ffffff',
                  border: 'none',
                  borderRadius: '8px',
                  padding: '10px 24px',
                  fontSize: '14px',
                  fontWeight: 600,
                  cursor: savingSettings ? 'not-allowed' : 'pointer',
                  opacity: savingSettings ? 0.7 : 1,
                  display: 'flex',
                  alignItems: 'center',
                  gap: '8px',
                  transition: 'background-color 0.2s',
                }}
              >
                {savingSettings && <span className="material-symbols-outlined spin" style={{ fontSize: '18px' }}>sync</span>}
                <span>Lưu Cấu Hình Freeship</span>
              </button>
            </div>
          </form>
        </section>

        {/* ── CARD 2: BẢNG QUẢN LÝ QUY TẮC CƯỚC THEO TUYẾN ── */}
        <section
          style={{
            backgroundColor: '#ffffff',
            borderRadius: '14px',
            border: '1px solid #ebebeb',
            padding: '24px',
            boxShadow: '0 1px 3px rgba(0,0,0,0.02)',
          }}
        >
          <div
            style={{
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'space-between',
              marginBottom: '20px',
              flexWrap: 'wrap',
              gap: '12px',
            }}
          >
            <div>
              <h2 style={{ fontSize: '18px', fontWeight: 600, color: '#222222', margin: 0 }}>
                Bảng Tuyến & Cước Phí Vận Chuyển
              </h2>
              <p style={{ fontSize: '13px', color: '#717171', margin: '2px 0 0' }}>
                Hệ thống tự động tra cứu từ khóa địa chỉ nhận hàng để áp dụng đúng mức phí và thời gian giao dự kiến.
              </p>
            </div>
            <button
              type="button"
              onClick={openCreateModal}
              style={{
                backgroundColor: '#222222',
                color: '#ffffff',
                border: 'none',
                borderRadius: '8px',
                padding: '9px 18px',
                fontSize: '13px',
                fontWeight: 600,
                cursor: 'pointer',
                display: 'flex',
                alignItems: 'center',
                gap: '6px',
              }}
            >
              <span className="material-symbols-outlined" style={{ fontSize: '18px' }}>add</span>
              <span>Thêm Tuyến Vận Chuyển</span>
            </button>
          </div>

          {/* Table */}
          <div style={{ overflowX: 'auto' }}>
            <table style={{ width: '100%', borderCollapse: 'collapse', textAlign: 'left', fontSize: '13px' }}>
              <thead>
                <tr style={{ borderBottom: '1px solid #ebebeb', color: '#717171' }}>
                  <th style={{ padding: '12px 14px', fontWeight: 600 }}>ID</th>
                  <th style={{ padding: '12px 14px', fontWeight: 600 }}>Điểm gửi hàng</th>
                  <th style={{ padding: '12px 14px', fontWeight: 600 }}>Điểm / Khu vực nhận</th>
                  <th style={{ padding: '12px 14px', fontWeight: 600 }}>Cước phí</th>
                  <th style={{ padding: '12px 14px', fontWeight: 600 }}>Thời gian dự kiến</th>
                  <th style={{ padding: '12px 14px', fontWeight: 600 }}>Trạng thái</th>
                  <th style={{ padding: '12px 14px', fontWeight: 600, textAlign: 'right' }}>Thao tác</th>
                </tr>
              </thead>
              <tbody>
                {loadingRules ? (
                  <tr>
                    <td colSpan={7} style={{ padding: '32px', textAlign: 'center', color: '#717171' }}>
                      Đang tải danh sách tuyến vận chuyển...
                    </td>
                  </tr>
                ) : rules.length === 0 ? (
                  <tr>
                    <td colSpan={7} style={{ padding: '32px', textAlign: 'center', color: '#717171' }}>
                      Chưa có quy tắc tuyến vận chuyển nào. Hãy thêm tuyến đầu tiên!
                    </td>
                  </tr>
                ) : (
                  rules.map((rule) => (
                    <tr
                      key={rule.shippingRuleId}
                      style={{
                        borderBottom: '1px solid #f2f2f2',
                        transition: 'background-color 0.15s',
                      }}
                    >
                      <td style={{ padding: '14px', color: '#717171', fontWeight: 500 }}>
                        #{rule.shippingRuleId}
                      </td>
                      <td style={{ padding: '14px', fontWeight: 500, color: '#222222' }}>
                        {rule.fromLocation}
                      </td>
                      <td style={{ padding: '14px' }}>
                        <span
                          style={{
                            display: 'inline-block',
                            backgroundColor: '#f7f7f7',
                            border: '1px solid #e2e2e2',
                            borderRadius: '6px',
                            padding: '3px 8px',
                            fontWeight: 600,
                            color: '#222222',
                          }}
                        >
                          {rule.toLocation}
                        </span>
                      </td>
                      <td style={{ padding: '14px', fontWeight: 600, color: '#ff385c' }}>
                        {formatVND(rule.fee)}
                      </td>
                      <td style={{ padding: '14px', color: '#717171' }}>
                        {rule.estimatedDeliveryDays || '2 - 4 ngày'}
                      </td>
                      <td style={{ padding: '14px' }}>
                        <span
                          style={{
                            display: 'inline-block',
                            padding: '3px 8px',
                            borderRadius: '12px',
                            fontSize: '11px',
                            fontWeight: 600,
                            backgroundColor: rule.isActive ? '#ecfdf5' : '#f3f4f6',
                            color: rule.isActive ? '#059669' : '#6b7280',
                          }}
                        >
                          {rule.isActive ? 'Đang áp dụng' : 'Tạm ẩn'}
                        </span>
                      </td>
                      <td style={{ padding: '14px', textAlign: 'right' }}>
                        <div style={{ display: 'inline-flex', gap: '8px' }}>
                          <button
                            type="button"
                            onClick={() => openEditModal(rule)}
                            style={{
                              backgroundColor: 'transparent',
                              border: '1px solid #dddddd',
                              borderRadius: '6px',
                              padding: '5px 10px',
                              cursor: 'pointer',
                              fontSize: '12px',
                              fontWeight: 500,
                              color: '#222222',
                              display: 'flex',
                              alignItems: 'center',
                              gap: '4px',
                            }}
                          >
                            <span className="material-symbols-outlined" style={{ fontSize: '16px' }}>edit</span>
                            Sửa
                          </button>
                          <button
                            type="button"
                            disabled={deletingRuleId === rule.shippingRuleId}
                            onClick={() => {
                              if (confirm(`Bạn có chắc chắn muốn xóa tuyến "${rule.toLocation}"?`)) {
                                handleDeleteRule(rule.shippingRuleId);
                              }
                            }}
                            style={{
                              backgroundColor: 'transparent',
                              border: '1px solid #fee2e2',
                              borderRadius: '6px',
                              padding: '5px 10px',
                              cursor: 'pointer',
                              fontSize: '12px',
                              fontWeight: 500,
                              color: '#dc2626',
                              display: 'flex',
                              alignItems: 'center',
                              gap: '4px',
                            }}
                          >
                            <span className="material-symbols-outlined" style={{ fontSize: '16px' }}>delete</span>
                            Xóa
                          </button>
                        </div>
                      </td>
                    </tr>
                  ))
                )}
              </tbody>
            </table>
          </div>
        </section>

        {/* ── MODAL: THÊM / SỬA TUYẾN VẬN CHUYỂN ── */}
        {isModalOpen && (
          <div
            style={{
              position: 'fixed',
              top: 0,
              left: 0,
              right: 0,
              bottom: 0,
              backgroundColor: 'rgba(0,0,0,0.5)',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              zIndex: 9999,
              padding: '16px',
            }}
          >
            <div
              style={{
                backgroundColor: '#ffffff',
                borderRadius: '16px',
                width: '100%',
                maxWidth: '520px',
                boxShadow: '0 20px 25px -5px rgba(0,0,0,0.1), 0 10px 10px -5px rgba(0,0,0,0.04)',
                overflow: 'hidden',
              }}
            >
              {/* Header */}
              <div
                style={{
                  padding: '20px 24px',
                  borderBottom: '1px solid #ebebeb',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'space-between',
                }}
              >
                <h3 style={{ margin: 0, fontSize: '17px', fontWeight: 600, color: '#222222' }}>
                  {editingRuleId ? 'Cập Nhật Tuyến Vận Chuyển' : 'Thêm Tuyến Vận Chuyển Mới'}
                </h3>
                <button
                  type="button"
                  onClick={() => setIsModalOpen(false)}
                  style={{
                    border: 'none',
                    background: 'none',
                    cursor: 'pointer',
                    color: '#717171',
                    fontSize: '20px',
                    lineHeight: 1,
                  }}
                >
                  ✕
                </button>
              </div>

              {/* Body */}
              <form onSubmit={handleSaveModal}>
                <div style={{ padding: '24px', display: 'flex', flexDirection: 'column', gap: '16px' }}>
                  {modalError && (
                    <div
                      style={{
                        padding: '10px 14px',
                        borderRadius: '8px',
                        backgroundColor: '#fef2f2',
                        border: '1px solid #fecaca',
                        color: '#991b1b',
                        fontSize: '13px',
                      }}
                    >
                      {modalError}
                    </div>
                  )}

                  {/* Điểm gửi */}
                  <div>
                    <label style={{ display: 'block', fontSize: '13px', fontWeight: 600, marginBottom: '6px' }}>
                      Điểm gửi hàng
                    </label>
                    <input
                      type="text"
                      value={modalForm.fromLocation}
                      onChange={(e) => setModalForm({ ...modalForm, fromLocation: e.target.value })}
                      placeholder="TP. Hồ Chí Minh"
                      style={{
                        width: '100%',
                        padding: '10px 12px',
                        borderRadius: '8px',
                        border: '1px solid #b0b0b0',
                        fontSize: '14px',
                      }}
                    />
                  </div>

                  {/* Điểm nhận */}
                  <div>
                    <label style={{ display: 'block', fontSize: '13px', fontWeight: 600, marginBottom: '6px' }}>
                      Điểm nhận hàng (Tên Tỉnh/Thành hoặc Khu vực)
                    </label>
                    <input
                      type="text"
                      value={modalForm.toLocation}
                      onChange={(e) => setModalForm({ ...modalForm, toLocation: e.target.value })}
                      placeholder="Ví dụ: TP. Hồ Chí Minh, Hà Nội, Miền Trung..."
                      style={{
                        width: '100%',
                        padding: '10px 12px',
                        borderRadius: '8px',
                        border: '1px solid #b0b0b0',
                        fontSize: '14px',
                      }}
                    />
                    <p style={{ fontSize: '12px', color: '#717171', margin: '4px 0 0' }}>
                      * Người mua khi nhập địa chỉ có chứa từ khóa này sẽ được áp dụng phí tương ứng.
                    </p>
                  </div>

                  {/* Cước phí */}
                  <div>
                    <label style={{ display: 'block', fontSize: '13px', fontWeight: 600, marginBottom: '6px' }}>
                      Cước phí (VNĐ)
                    </label>
                    <input
                      type="number"
                      min="0"
                      step="1000"
                      value={modalForm.fee}
                      onChange={(e) => setModalForm({ ...modalForm, fee: parseFloat(e.target.value) || 0 })}
                      placeholder="30000"
                      style={{
                        width: '100%',
                        padding: '10px 12px',
                        borderRadius: '8px',
                        border: '1px solid #b0b0b0',
                        fontSize: '14px',
                      }}
                    />
                  </div>

                  {/* Thời gian dự kiến */}
                  <div>
                    <label style={{ display: 'block', fontSize: '13px', fontWeight: 600, marginBottom: '6px' }}>
                      Thời gian giao hàng dự kiến
                    </label>
                    <input
                      type="text"
                      value={modalForm.estimatedDeliveryDays || ''}
                      onChange={(e) => setModalForm({ ...modalForm, estimatedDeliveryDays: e.target.value })}
                      placeholder="Ví dụ: 1 - 2 ngày, 3 - 5 ngày"
                      style={{
                        width: '100%',
                        padding: '10px 12px',
                        borderRadius: '8px',
                        border: '1px solid #b0b0b0',
                        fontSize: '14px',
                      }}
                    />
                  </div>

                  {/* IsActive */}
                  <div>
                    <label
                      style={{
                        display: 'flex',
                        alignItems: 'center',
                        gap: '8px',
                        cursor: 'pointer',
                        fontSize: '13px',
                        fontWeight: 500,
                      }}
                    >
                      <input
                        type="checkbox"
                        checked={modalForm.isActive}
                        onChange={(e) => setModalForm({ ...modalForm, isActive: e.target.checked })}
                        style={{ width: '16px', height: '16px', accentColor: '#ff385c' }}
                      />
                      Kích hoạt tuyến vận chuyển này
                    </label>
                  </div>
                </div>

                {/* Footer */}
                <div
                  style={{
                    padding: '16px 24px',
                    borderTop: '1px solid #ebebeb',
                    display: 'flex',
                    justifyContent: 'flex-end',
                    gap: '10px',
                    backgroundColor: '#fafafa',
                  }}
                >
                  <button
                    type="button"
                    onClick={() => setIsModalOpen(false)}
                    style={{
                      padding: '9px 18px',
                      borderRadius: '8px',
                      border: '1px solid #dddddd',
                      backgroundColor: '#ffffff',
                      color: '#222222',
                      fontSize: '13px',
                      fontWeight: 500,
                      cursor: 'pointer',
                    }}
                  >
                    Hủy
                  </button>
                  <button
                    type="submit"
                    disabled={modalSubmitting}
                    style={{
                      padding: '9px 20px',
                      borderRadius: '8px',
                      border: 'none',
                      backgroundColor: '#ff385c',
                      color: '#ffffff',
                      fontSize: '13px',
                      fontWeight: 600,
                      cursor: modalSubmitting ? 'not-allowed' : 'pointer',
                      opacity: modalSubmitting ? 0.7 : 1,
                    }}
                  >
                    {modalSubmitting ? 'Đang lưu...' : editingRuleId ? 'Cập Nhật' : 'Thêm Mới'}
                  </button>
                </div>
              </form>
            </div>
          </div>
        )}

      </div>
    </AdminSellerLayout>
  );
};
