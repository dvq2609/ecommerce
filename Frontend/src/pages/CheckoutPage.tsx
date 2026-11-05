import React, { useState, useEffect, useMemo, useCallback } from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import { useCart } from '../context/CartContext';
import { authService } from '../services/authService';
import { orderService } from '../services/orderService';
import { paymentService } from '../services/paymentService';
import { shippingService } from '../services/shippingService';
import { userService } from '../services/userService';
import { voucherService } from '../services/voucherService';
import { HomeHeader } from '../components/home/HomeHeader';
import { BottomNavBar } from '../components/home/BottomNavBar';
import type { CreateOrderRequest } from '../types/order';
import type { UserAddress } from '../types/user';
import type { AvailableVoucherItem } from '../types/voucher';

interface BuyNowState {
  buyNowItem?: {
    productId: number;
    productVariantId?: number | null;
    quantity: number;
    title: string;
    price: number;
    imageUrl?: string;
    colorName?: string;
    sizeName?: string;
  };
}

const formatPrice = (p: number) =>
  new Intl.NumberFormat('vi-VN', { style: 'currency', currency: 'VND' }).format(p);

const PAYMENT_OPTIONS = [
  {
    value: 0,
    icon: '🚚',
    label: 'Thanh toán khi nhận hàng (COD)',
    desc: 'Trả tiền mặt khi nhận được hàng',
  },
  {
    value: 3,
    icon: '👛',
    label: 'Ví điện tử MoMo',
    desc: 'Thanh toán trực tiếp qua cổng MoMo (QR/App)',
  },
] as const;

export const CheckoutPage: React.FC = () => {
  const navigate = useNavigate();
  const location = useLocation();
  const buyNowItem = (location.state as BuyNowState | null)?.buyNowItem;

  const { cart, totalAmount, loading: cartLoading, refreshCart } = useCart();
  const [currentUser, setCurrentUser] = useState(() => authService.getCurrentUser());

  // Dynamic Shipping State
  const [freeShippingThreshold, setFreeShippingThreshold] = useState<number>(1000000);
  const [shippingFee, setShippingFee] = useState<number>(30000);
  const [estimatedDays, setEstimatedDays] = useState<string>('2 - 4 ngày');
  const [shippingRuleMatched, setShippingRuleMatched] = useState<string>('');

  // Sổ địa chỉ đã lưu
  const [savedAddresses, setSavedAddresses] = useState<UserAddress[]>([]);
  const [showAddressPicker, setShowAddressPicker] = useState(false);

  // Voucher Giảm Giá Đơn Hàng (Hiển thị mặc định trực tiếp tại trang Thanh toán)
  const [availableDiscountVouchers, setAvailableDiscountVouchers] = useState<AvailableVoucherItem[]>([]);
  const [selectedDiscountCode, setSelectedDiscountCode] = useState<string | null>(null);
  const [productDiscountAmount, setProductDiscountAmount] = useState<number>(0);
  const [quickVoucherInput, setQuickVoucherInput] = useState<string>('');
  const [voucherMessage, setVoucherMessage] = useState<{ text: string; type: 'success' | 'error' } | null>(null);

  // Form state
  const [form, setForm] = useState({
    recipientName: currentUser?.fullName ?? '',
    recipientPhone: '',
    shippingAddress: '',
    note: '',
    paymentMethod: 0 as 0 | 1 | 2 | 3,
    saveToProfile: true,
  });

  // UI state
  const [errors, setErrors] = useState<Partial<Record<keyof typeof form, string>>>({});
  const [submitting, setSubmitting] = useState(false);
  const [apiError, setApiError] = useState<string | null>(null);
  const [idempotencyKey] = useState<string>(() => {
    if (typeof crypto !== 'undefined' && crypto.randomUUID) {
      return crypto.randomUUID();
    }
    return 'IDEM_' + Math.random().toString(36).substring(2) + Date.now().toString(36);
  });

  const effectiveItems = useMemo(() => {
    if (buyNowItem) {
      return [
        {
          cartItemId: -1,
          productId: buyNowItem.productId,
          productVariantId: buyNowItem.productVariantId ?? undefined,
          productName: buyNowItem.title,
          productImage: buyNowItem.imageUrl ?? '',
          colorName: buyNowItem.colorName,
          sizeName: buyNowItem.sizeName,
          quantity: buyNowItem.quantity,
          unitPrice: buyNowItem.price,
          totalPrice: buyNowItem.price * buyNowItem.quantity,
        },
      ];
    }
    return cart?.items ?? [];
  }, [buyNowItem, cart]);

  const effectiveTotalAmount = useMemo(() => {
    if (buyNowItem) {
      return buyNowItem.price * buyNowItem.quantity;
    }
    return totalAmount;
  }, [buyNowItem, totalAmount]);

  // Recalculate dynamic shipping fee whenever address or total changes
  useEffect(() => {
    let active = true;
    const calc = async () => {
      try {
        const res = await shippingService.calculateFee({
          destinationAddress: form.shippingAddress,
          orderTotal: effectiveTotalAmount,
        });
        if (active && res && res.data) {
          setShippingFee(res.data.shippingFee);
          setFreeShippingThreshold(res.data.freeShippingThreshold);
          setEstimatedDays(res.data.estimatedDeliveryDays);
          setShippingRuleMatched(res.data.matchedRule);
        }
      } catch (err) {
        console.error('Lỗi tính phí ship tự động:', err);
      }
    };

    const timer = setTimeout(calc, 200);
    return () => {
      active = false;
      clearTimeout(timer);
    };
  }, [form.shippingAddress, effectiveTotalAmount]);

  // Tải danh sách Voucher giảm giá khả dụng & tự động kiểm tra mã đang chọn khi tổng tiền thay đổi
  const syncVouchers = useCallback(async () => {
    if (effectiveTotalAmount <= 0 || !localStorage.getItem('accessToken')) return;
    try {
      const grouped = await voucherService.getAvailableVouchers(effectiveTotalAmount, shippingFee);
      setAvailableDiscountVouchers(grouped.discountVouchers || []);

      let validDisc = selectedDiscountCode;
      if (validDisc) {
        const foundDisc = grouped.discountVouchers.find((v) => v.code === validDisc);
        if (!foundDisc || !foundDisc.isEligible) {
          validDisc = null;
          setSelectedDiscountCode(null);
        }
      }

      if (validDisc) {
        const stackRes = await voucherService.calculateStack({
          shippingVoucherCode: null,
          discountVoucherCode: validDisc,
          orderTotal: effectiveTotalAmount,
          shippingFee,
        });
        setProductDiscountAmount(stackRes.productDiscountAmount);
      } else {
        setProductDiscountAmount(0);
      }
    } catch (err) {
      console.error('Lỗi đồng bộ voucher:', err);
    }
  }, [effectiveTotalAmount, shippingFee, selectedDiscountCode]);

  useEffect(() => {
    syncVouchers();
  }, [syncVouchers]);

  // Xử lý khi người dùng nhập nhanh 1 mã vào ô input
  const handleQuickApplyCode = async () => {
    const code = quickVoucherInput.trim().toUpperCase();
    if (!code) return;
    setVoucherMessage(null);

    try {
      const res = await voucherService.calculateStack({
        shippingVoucherCode: null,
        discountVoucherCode: selectedDiscountCode,
        quickInputCode: code,
        orderTotal: effectiveTotalAmount,
        shippingFee,
      });

      if (res.appliedDiscountVoucherCode) {
        setSelectedDiscountCode(res.appliedDiscountVoucherCode);
      }

      setProductDiscountAmount(res.productDiscountAmount);
      setQuickVoucherInput('');
      setVoucherMessage({ text: res.message, type: 'success' });
    } catch (err: unknown) {
      setVoucherMessage({
        text: err instanceof Error ? err.message : 'Không thể áp dụng mã ưu đãi.',
        type: 'error',
      });
    }
  };

  const handleRemoveDiscountVoucher = () => {
    setSelectedDiscountCode(null);
    setProductDiscountAmount(0);
    setVoucherMessage(null);
  };

  const finalShippingFee = shippingFee;
  const finalSubtotal = Math.max(0, effectiveTotalAmount - productDiscountAmount);
  const finalAmount = finalSubtotal + finalShippingFee;

  const progressPct = freeShippingThreshold > 0
    ? Math.min((effectiveTotalAmount / freeShippingThreshold) * 100, 100)
    : 100;

  // Load Sổ địa chỉ và điền sẵn địa chỉ mặc định
  useEffect(() => {
    userService
      .getAddresses()
      .then((res) => {
        if (res && res.data && res.data.length > 0) {
          setSavedAddresses(res.data);
          const defaultAddr = res.data.find((a) => a.isDefault) || res.data[0];
          setForm((prev) => ({
            ...prev,
            recipientName: defaultAddr.receiverName || prev.recipientName,
            recipientPhone: defaultAddr.receiverPhone || prev.recipientPhone,
            shippingAddress: defaultAddr.fullAddress || defaultAddr.streetAddress || prev.shippingAddress,
          }));
        }
      })
      .catch((err) => console.error('Lỗi tải sổ địa chỉ checkout:', err));
  }, []);

  // Redirect nếu không có token
  useEffect(() => {
    if (!localStorage.getItem('accessToken')) {
      navigate('/login?redirect=/checkout');
    }
  }, [navigate]);

  // Redirect nếu giỏ rỗng và không phải là Mua ngay
  useEffect(() => {
    if (!buyNowItem && !cartLoading && cart && cart.items.length === 0) {
      navigate('/cart');
    }
  }, [buyNowItem, cart, cartLoading, navigate]);

  // ─── Validation ────────────────────────────────────────────────────────────
  const validate = () => {
    const e: Partial<Record<keyof typeof form, string>> = {};
    if (!form.recipientName.trim()) e.recipientName = 'Vui lòng nhập họ tên người nhận.';
    if (!/^(0[3|5|7|8|9])[0-9]{8}$/.test(form.recipientPhone))
      e.recipientPhone = 'Số điện thoại không hợp lệ (10 số, đầu 03/05/07/08/09).';
    if (!form.shippingAddress.trim()) e.shippingAddress = 'Vui lòng nhập địa chỉ nhận hàng.';
    return e;
  };

  const handleChange = (
    e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>
  ) => {
    const { name, value, type } = e.target;
    const checked = type === 'checkbox' ? (e.target as HTMLInputElement).checked : undefined;
    setForm((prev) => ({ ...prev, [name]: type === 'checkbox' ? checked : value }));
    if (errors[name as keyof typeof form]) {
      setErrors((prev) => ({ ...prev, [name]: undefined }));
    }
  };

  // ─── Submit ─────────────────────────────────────────────────────────────────
  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    const errs = validate();
    if (Object.keys(errs).length > 0) {
      setErrors(errs);
      return;
    }

    setSubmitting(true);
    setApiError(null);

    const payload: CreateOrderRequest = {
      recipientName: form.recipientName.trim(),
      recipientPhone: form.recipientPhone.trim(),
      shippingAddress: form.shippingAddress.trim(),
      note: form.note.trim() || undefined,
      paymentMethod: form.paymentMethod,
      shippingVoucherCode: null,
      discountVoucherCode: selectedDiscountCode || null,
      saveToProfile: form.saveToProfile,
      items: buyNowItem
        ? [
            {
              productId: buyNowItem.productId,
              productVariantId: buyNowItem.productVariantId ?? null,
              quantity: buyNowItem.quantity,
            },
          ]
        : null,
    };

    try {
      const res = await orderService.createOrder(payload, idempotencyKey);
      if (res.success && res.data) {
        if (!buyNowItem) {
          await refreshCart();
        }

        // Nếu khách chọn Ví MoMo -> Tạo phiên thanh toán và chuyển hướng sang MoMo
        if (payload.paymentMethod === 3) {
          try {
            const momoRes = await paymentService.createMoMoPayment(res.data.orderCode);
            if (momoRes.success && momoRes.payUrl) {
              window.location.href = momoRes.payUrl;
              return;
            }
          } catch (momoErr) {
            console.error('Không thể tạo phiên MoMo:', momoErr);
          }
        }

        navigate(`/order-success/${res.data.orderCode}`, { replace: true });
      } else {
        setApiError(res.message ?? 'Đặt hàng thất bại. Vui lòng thử lại.');
      }
    } catch (err: unknown) {
      setApiError(err instanceof Error ? err.message : 'Lỗi kết nối. Vui lòng thử lại.');
    } finally {
      setSubmitting(false);
    }
  };

  if (!buyNowItem && cartLoading) {
    return (
      <div style={styles.loadingWrap}>
        <div style={styles.spinner} />
        <p style={{ marginTop: 16, color: '#6a6a6a', fontSize: 15 }}>Đang tải giỏ hàng…</p>
      </div>
    );
  }

  const eligibleDiscountCount = availableDiscountVouchers.filter((v) => v.isEligible).length;

  return (
    <div style={styles.page}>
      <HomeHeader
        currentUser={currentUser}
        onLogout={() => {
          authService.logout();
          setCurrentUser(null);
          navigate('/login');
        }}
      />

      <main style={styles.main}>
        {/* ── PAGE TITLE ── */}
        <div style={styles.titleRow}>
          <button onClick={() => navigate(-1)} style={styles.backBtn} aria-label="Quay lại">
            <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5">
              <polyline points="15 18 9 12 15 6" />
            </svg>
          </button>
          <h1 style={styles.pageTitle}>Thanh toán đơn hàng</h1>
        </div>

        <div style={styles.grid}>
          {/* ════════════ LEFT COLUMN: FORM ════════════ */}
          <form id="__checkout_form__" onSubmit={handleSubmit} style={styles.formCol} noValidate>
            {/* ── Section 1: Delivery Info ── */}
            <section style={styles.card}>
              <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: 18 }}>
                <h2 style={{ ...styles.sectionTitle, margin: 0 }}>
                  <span style={styles.sectionIcon}>📍</span>
                  Thông tin nhận hàng
                </h2>
                {savedAddresses.length > 0 && (
                  <button
                    type="button"
                    onClick={() => setShowAddressPicker(!showAddressPicker)}
                    style={{
                      background: '#ffffff',
                      border: '1px solid var(--nike-hairline, #e5e5e5)',
                      borderRadius: 9999,
                      padding: '6px 14px',
                      fontSize: 12.5,
                      fontWeight: 700,
                      color: 'var(--nike-black, #111111)',
                      cursor: 'pointer',
                      display: 'flex',
                      alignItems: 'center',
                      gap: 4,
                    }}
                  >
                    <span className="material-symbols-outlined" style={{ fontSize: 16 }}>contacts</span>
                    <span>{showAddressPicker ? 'Đóng sổ địa chỉ' : 'Chọn từ Sổ địa chỉ'}</span>
                  </button>
                )}
              </div>

              {/* Quick Address Picker List */}
              {showAddressPicker && savedAddresses.length > 0 && (
                <div style={{ backgroundColor: 'var(--nike-soft-cloud, #f5f5f7)', borderRadius: 12, padding: 12, marginBottom: 16, border: '1px solid var(--nike-hairline, #e5e5e5)' }}>
                  <p style={{ fontSize: 12.5, fontWeight: 700, color: '#707072', margin: '0 0 8px' }}>
                    Chọn nhanh địa chỉ đã lưu của bạn:
                  </p>
                  <div style={{ display: 'flex', flexDirection: 'column', gap: 8 }}>
                    {savedAddresses.map((addr) => (
                      <div
                        key={addr.addressId}
                        onClick={() => {
                          setForm((prev) => ({
                            ...prev,
                            recipientName: addr.receiverName,
                            recipientPhone: addr.receiverPhone,
                            shippingAddress: addr.fullAddress || addr.streetAddress,
                          }));
                          setShowAddressPicker(false);
                        }}
                        style={{
                          backgroundColor: '#ffffff',
                          borderRadius: 10,
                          border: '1px solid var(--nike-hairline, #e5e5e5)',
                          padding: '10px 14px',
                          cursor: 'pointer',
                          display: 'flex',
                          alignItems: 'center',
                          justifyContent: 'space-between',
                          transition: 'all 0.15s',
                        }}
                      >
                        <div>
                          <div style={{ display: 'flex', alignItems: 'center', gap: 6 }}>
                            <strong style={{ fontSize: 13, color: '#111111' }}>{addr.receiverName}</strong>
                            <span style={{ fontSize: 12, color: '#707072' }}>• {addr.receiverPhone}</span>
                            <span style={{ fontSize: 11, padding: '1px 6px', borderRadius: 4, backgroundColor: '#f0f0f0', color: '#555' }}>
                              {addr.addressType}
                            </span>
                            {addr.isDefault && (
                              <span style={{ fontSize: 10, color: 'var(--nike-sale, #d30005)', fontWeight: 800 }}>[Mặc định]</span>
                            )}
                          </div>
                          <p style={{ fontSize: 12.5, color: '#444', margin: '4px 0 0' }}>
                            {addr.fullAddress || addr.streetAddress}
                          </p>
                        </div>
                        <span className="material-symbols-outlined" style={{ fontSize: 18, color: '#111111' }}>
                          check_circle
                        </span>
                      </div>
                    ))}
                  </div>
                </div>
              )}

              {/* Recipient Name */}
              <div style={styles.field}>
                <label htmlFor="recipientName" style={styles.fieldLabel}>
                  Họ và tên người nhận <span style={styles.requiredMark}>*</span>
                </label>
                <input
                  id="recipientName"
                  name="recipientName"
                  type="text"
                  placeholder="Nhập họ và tên người nhận hàng"
                  value={form.recipientName}
                  onChange={handleChange}
                  style={{
                    ...styles.input,
                    ...(errors.recipientName ? styles.inputError : {}),
                  }}
                  autoComplete="name"
                />
                {errors.recipientName && <p style={styles.errorMsg}>{errors.recipientName}</p>}
              </div>

              {/* Phone */}
              <div style={styles.field}>
                <label htmlFor="recipientPhone" style={styles.fieldLabel}>
                  Số điện thoại <span style={styles.requiredMark}>*</span>
                </label>
                <input
                  id="recipientPhone"
                  name="recipientPhone"
                  type="tel"
                  placeholder="Nhập số điện thoại (ví dụ: 0912345678)"
                  value={form.recipientPhone}
                  onChange={handleChange}
                  style={{
                    ...styles.input,
                    ...(errors.recipientPhone ? styles.inputError : {}),
                  }}
                  autoComplete="tel"
                  maxLength={10}
                />
                {errors.recipientPhone && <p style={styles.errorMsg}>{errors.recipientPhone}</p>}
              </div>

              {/* Shipping Address */}
              <div style={styles.field}>
                <label htmlFor="shippingAddress" style={styles.fieldLabel}>
                  Địa chỉ nhận hàng (số nhà, đường, phường, quận, tỉnh/TP) <span style={styles.requiredMark}>*</span>
                </label>
                <input
                  id="shippingAddress"
                  name="shippingAddress"
                  type="text"
                  placeholder="Số nhà, tên đường, phường/xã, quận/huyện, tỉnh/thành phố"
                  value={form.shippingAddress}
                  onChange={handleChange}
                  style={{
                    ...styles.input,
                    ...(errors.shippingAddress ? styles.inputError : {}),
                  }}
                  autoComplete="street-address"
                />
                {errors.shippingAddress && <p style={styles.errorMsg}>{errors.shippingAddress}</p>}
              </div>

              {/* Note */}
              <div style={styles.field}>
                <label htmlFor="note" style={styles.fieldLabel}>
                  Ghi chú đơn hàng <span style={styles.optionalMark}>(không bắt buộc)</span>
                </label>
                <textarea
                  id="note"
                  name="note"
                  placeholder="Ghi chú thêm về thời gian giao hàng, địa điểm chỉ dẫn cụ thể…"
                  value={form.note}
                  onChange={handleChange}
                  style={{
                    ...styles.input,
                    height: 80,
                    padding: '10px 14px',
                    resize: 'none',
                  }}
                  maxLength={500}
                />
              </div>

              {/* Save to profile */}
              <label style={styles.checkboxRow}>
                <input
                  type="checkbox"
                  name="saveToProfile"
                  checked={form.saveToProfile}
                  onChange={handleChange}
                  style={styles.checkbox}
                />
                <span style={{ fontSize: 14, color: '#3f3f3f' }}>
                  Lưu địa chỉ này vào hồ sơ cá nhân
                </span>
              </label>
            </section>

            {/* ── Section 2: Payment Method ── */}
            <section style={styles.card}>
              <h2 style={styles.sectionTitle}>
                <span style={styles.sectionIcon}>💳</span>
                Phương thức thanh toán
              </h2>
              <div style={{ display: 'flex', flexDirection: 'column', gap: 10 }}>
                {PAYMENT_OPTIONS.map((opt) => (
                  <label
                    key={opt.value}
                    style={{
                      ...styles.paymentOption,
                      ...(form.paymentMethod === opt.value ? styles.paymentOptionActive : {}),
                    }}
                  >
                    <input
                      type="radio"
                      name="paymentMethod"
                      value={opt.value}
                      checked={form.paymentMethod === opt.value}
                      onChange={() => setForm((p) => ({ ...p, paymentMethod: opt.value }))}
                      style={{ display: 'none' }}
                    />
                    <span style={styles.paymentIcon}>{opt.icon}</span>
                    <div style={{ flex: 1 }}>
                      <p style={{ margin: 0, fontWeight: 700, fontSize: 15, color: '#111111' }}>{opt.label}</p>
                      <p style={{ margin: 0, fontSize: 13, color: '#707072', marginTop: 2 }}>{opt.desc}</p>
                    </div>
                    <div
                      style={{
                        ...styles.radioCircle,
                        ...(form.paymentMethod === opt.value ? styles.radioCircleActive : {}),
                      }}
                    >
                      {form.paymentMethod === opt.value && <div style={styles.radioDot} />}
                    </div>
                  </label>
                ))}
              </div>
            </section>

            {/* ── API Error ── */}
            {apiError && (
              <div style={styles.apiError}>
                <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="#c13515" strokeWidth="2">
                  <circle cx="12" cy="12" r="10" />
                  <line x1="12" y1="8" x2="12" y2="12" />
                  <line x1="12" y1="16" x2="12.01" y2="16" />
                </svg>
                {apiError}
              </div>
            )}
          </form>

          {/* ════════════ RIGHT COLUMN: ORDER SUMMARY + DUAL VOUCHER SELECTOR ════════════ */}
          <aside style={styles.summaryCol}>
            <div style={styles.card}>
              <h2 style={styles.sectionTitle}>
                <span style={styles.sectionIcon}>🛍️</span>
                Tóm tắt đơn hàng
                <span style={{ marginLeft: 'auto', fontSize: 13, fontWeight: 500, color: '#707072' }}>
                  {effectiveItems.length} sản phẩm
                </span>
              </h2>

              {/* Item list */}
              <ul style={{ listStyle: 'none', margin: 0, padding: 0, display: 'flex', flexDirection: 'column', gap: 14 }}>
                {effectiveItems.map((item) => (
                  <li key={item.cartItemId} style={styles.itemRow}>
                    <div style={styles.itemImgWrap}>
                      {item.productImage ? (
                        <img src={item.productImage} alt={item.productName} style={styles.itemImg} />
                      ) : (
                        <div style={styles.itemImgFallback}>🛍️</div>
                      )}
                      <span style={styles.qtyBadge}>{item.quantity}</span>
                    </div>

                    <div style={{ flex: 1, minWidth: 0 }}>
                      <p style={styles.itemName}>{item.productName}</p>
                      {(item.colorName || item.sizeName) && (
                        <p style={styles.itemVariant}>
                          {[item.colorName, item.sizeName].filter(Boolean).join(' • ')}
                        </p>
                      )}
                    </div>

                    <p style={styles.itemPrice}>{formatPrice(item.totalPrice)}</p>
                  </li>
                ))}
              </ul>

              <div style={styles.divider} />

              {/* ── DISCOUNT VOUCHER BOX (MẶC ĐỊNH HIỂN THỊ TRỰC TIẾP) ── */}
              <div
                style={{
                  backgroundColor: 'var(--nike-soft-cloud, #f5f5f7)',
                  borderRadius: 12,
                  padding: '14px',
                  border: '1px solid var(--nike-hairline, #e5e5e5)',
                  marginBottom: 16,
                }}
              >
                <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: 10 }}>
                  <div style={{ display: 'flex', alignItems: 'center', gap: 6, fontSize: 13.5, fontWeight: 800, color: '#111111' }}>
                    <span>🎟️</span>
                    <span>Mã giảm giá ShopVibe ({eligibleDiscountCount} khả dụng)</span>
                  </div>
                  {selectedDiscountCode && (
                    <button
                      type="button"
                      onClick={handleRemoveDiscountVoucher}
                      style={{
                        background: 'none',
                        border: 'none',
                        padding: 0,
                        fontSize: 12,
                        fontWeight: 700,
                        color: '#707072',
                        cursor: 'pointer',
                        textDecoration: 'underline',
                      }}
                    >
                      Bỏ chọn mã
                    </button>
                  )}
                </div>

                {/* Quick input code */}
                <div style={{ display: 'flex', gap: 8, marginBottom: availableDiscountVouchers.length > 0 ? 12 : 0 }}>
                  <input
                    type="text"
                    placeholder="Nhập mã giảm giá đơn hàng…"
                    value={quickVoucherInput}
                    onChange={(e) => setQuickVoucherInput(e.target.value.toUpperCase())}
                    onKeyDown={(e) => {
                      if (e.key === 'Enter') {
                        e.preventDefault();
                        handleQuickApplyCode();
                      }
                    }}
                    style={{
                      flex: 1,
                      height: 38,
                      padding: '0 12px',
                      borderRadius: 9999,
                      border: '1px solid var(--nike-hairline, #e5e5e5)',
                      backgroundColor: '#ffffff',
                      fontSize: 12.5,
                      fontWeight: 600,
                      letterSpacing: '0.03em',
                      outline: 'none',
                    }}
                  />
                  <button
                    type="button"
                    onClick={handleQuickApplyCode}
                    className="btn-pill-primary"
                    style={{
                      height: 38,
                      padding: '0 16px',
                      borderRadius: 9999,
                      border: 'none',
                      backgroundColor: '#111111',
                      color: '#ffffff',
                      fontSize: 12.5,
                      fontWeight: 800,
                      cursor: 'pointer',
                    }}
                  >
                    Áp dụng
                  </button>
                </div>

                {/* Danh sách Mã giảm giá hiển thị mặc định ngay trong phần Thanh toán */}
                {availableDiscountVouchers.length > 0 && (
                  <div style={{ display: 'flex', flexDirection: 'column', gap: 8, maxHeight: 240, overflowY: 'auto' }}>
                    {availableDiscountVouchers.map((v) => {
                      const isSelected = selectedDiscountCode === v.code;
                      return (
                        <div
                          key={v.voucherId}
                          onClick={async () => {
                            if (!v.isEligible) return;
                            if (isSelected) {
                              handleRemoveDiscountVoucher();
                              return;
                            }
                            setVoucherMessage(null);
                            try {
                              const res = await voucherService.calculateStack({
                                shippingVoucherCode: null,
                                discountVoucherCode: v.code,
                                orderTotal: effectiveTotalAmount,
                                shippingFee,
                              });
                              setSelectedDiscountCode(res.appliedDiscountVoucherCode ?? null);
                              setProductDiscountAmount(res.productDiscountAmount);
                              setVoucherMessage({ text: res.message, type: 'success' });
                            } catch (err: unknown) {
                              setVoucherMessage({
                                text: err instanceof Error ? err.message : 'Không thể áp dụng mã.',
                                type: 'error',
                              });
                            }
                          }}
                          style={{
                            display: 'flex',
                            alignItems: 'center',
                            gap: 10,
                            padding: '10px 12px',
                            borderRadius: 10,
                            border: isSelected
                              ? '1.5px solid #111111'
                              : '1px solid var(--nike-hairline, #e5e5e5)',
                            backgroundColor: !v.isEligible
                              ? '#fafafa'
                              : isSelected
                              ? '#ffffff'
                              : '#ffffff',
                            opacity: v.isEligible ? 1 : 0.6,
                            cursor: v.isEligible ? 'pointer' : 'not-allowed',
                            transition: 'all 0.15s ease',
                          }}
                        >
                          <div
                            style={{
                              width: 42,
                              height: 42,
                              borderRadius: 8,
                              backgroundColor: isSelected ? 'var(--nike-sale, #d30005)' : '#111111',
                              color: '#ffffff',
                              display: 'flex',
                              flexDirection: 'column',
                              alignItems: 'center',
                              justifyContent: 'center',
                              fontWeight: 900,
                              fontSize: 10.5,
                              flexShrink: 0,
                            }}
                          >
                            <span>🏷️</span>
                            <span>
                              {v.discountType === 0
                                ? `-${v.discountValue}%`
                                : `-${Math.round(v.discountValue / 1000)}K`}
                            </span>
                          </div>

                          <div style={{ flex: 1, minWidth: 0 }}>
                            <div style={{ display: 'flex', alignItems: 'center', gap: 6 }}>
                              <strong
                                style={{
                                  fontSize: 12.5,
                                  color: '#111111',
                                  whiteSpace: 'nowrap',
                                  overflow: 'hidden',
                                  textOverflow: 'ellipsis',
                                }}
                              >
                                {v.title}
                              </strong>
                              <span
                                style={{
                                  fontSize: 10.5,
                                  fontWeight: 800,
                                  padding: '1px 6px',
                                  borderRadius: 4,
                                  backgroundColor: '#f0f0f0',
                                  color: '#111111',
                                  flexShrink: 0,
                                }}
                              >
                                {v.code}
                              </span>
                            </div>
                            <p style={{ margin: '2px 0 0', fontSize: 11.5, color: '#707072' }}>
                              Đơn tối thiểu {formatPrice(v.minOrderValue)}
                              {v.maxDiscountAmount ? ` • Tối đa ${formatPrice(v.maxDiscountAmount)}` : ''}
                            </p>
                            {!v.isEligible && v.ineligibleReason && (
                              <p style={{ margin: '2px 0 0', fontSize: 11, fontWeight: 700, color: '#d30005' }}>
                                ⚠️ {v.ineligibleReason}
                              </p>
                            )}
                          </div>

                          <input
                            type="radio"
                            checked={isSelected}
                            disabled={!v.isEligible}
                            readOnly
                            style={{ width: 16, height: 16, accentColor: '#111111', flexShrink: 0 }}
                          />
                        </div>
                      );
                    })}
                  </div>
                )}

                {voucherMessage && (
                  <p
                    style={{
                      margin: '8px 0 0',
                      fontSize: 12,
                      fontWeight: 600,
                      color: voucherMessage.type === 'success' ? '#0f766e' : '#d30005',
                    }}
                  >
                    {voucherMessage.text}
                  </p>
                )}
              </div>

              {/* Free ship progress (Chính sách Freeship từ trang /admin/shipping) */}
              {finalShippingFee > 0 && freeShippingThreshold > 0 && (
                <div style={{ marginBottom: 14 }}>
                  <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: 12.5, color: '#707072', marginBottom: 6 }}>
                    <span>
                      Mua thêm {formatPrice(Math.max(0, freeShippingThreshold - effectiveTotalAmount))} để được <strong>Miễn phí vận chuyển (Freeship 0₫)</strong>
                    </span>
                  </div>
                  <div style={styles.progressTrack}>
                    <div style={{ ...styles.progressFill, width: `${progressPct}%` }} />
                  </div>
                </div>
              )}
              {finalShippingFee === 0 && effectiveTotalAmount > 0 && (
                <div style={styles.freeShipBadge}>
                  🚚 Đơn hàng đạt từ {formatPrice(freeShippingThreshold)} — Đã áp dụng Freeship 0₫ (+ dùng kèm Mã giảm giá)!
                </div>
              )}

              {/* Totals Breakdown */}
              <div style={{ display: 'flex', flexDirection: 'column', gap: 9 }}>
                <div style={styles.totalRow}>
                  <span>Tạm tính tiền hàng</span>
                  <span style={{ fontWeight: 600 }}>{formatPrice(effectiveTotalAmount)}</span>
                </div>

                <div style={styles.totalRow}>
                  <div style={{ display: 'flex', flexDirection: 'column' }}>
                    <span>Phí vận chuyển</span>
                    {estimatedDays && (
                      <span style={{ fontSize: 11, color: '#707072' }}>
                        Dự kiến giao: {estimatedDays} {shippingRuleMatched ? `(${shippingRuleMatched})` : ''}
                      </span>
                    )}
                  </div>
                  <span style={{ color: shippingFee === 0 ? '#0f766e' : '#111111', fontWeight: 700 }}>
                    {shippingFee === 0 ? 'Miễn phí (0₫)' : formatPrice(shippingFee)}
                  </span>
                </div>

                {productDiscountAmount > 0 && (
                  <div style={{ ...styles.totalRow, color: 'var(--nike-sale, #d30005)', fontWeight: 700 }}>
                    <span>🏷️ Mã giảm giá ({selectedDiscountCode})</span>
                    <span>−{formatPrice(productDiscountAmount)}</span>
                  </div>
                )}

                <div style={styles.divider} />

                <div style={{ ...styles.totalRow, fontSize: 18, fontWeight: 900, color: '#111111' }}>
                  <span>Tổng thanh toán</span>
                  <span style={{ color: 'var(--nike-sale, #d30005)' }}>{formatPrice(finalAmount)}</span>
                </div>

                {productDiscountAmount > 0 && (
                  <div style={{ textAlign: 'right', fontSize: 12, fontWeight: 700, color: '#0f766e' }}>
                    Tiết kiệm được {formatPrice(productDiscountAmount)}
                  </div>
                )}
              </div>

              {/* ── Submit Button ── */}
              <button
                form="__checkout_form__"
                type="submit"
                disabled={submitting || effectiveItems.length === 0}
                onClick={handleSubmit}
                className="btn-pill-primary"
                style={{
                  ...styles.submitBtn,
                  marginTop: 20,
                  ...(submitting ? styles.submitBtnLoading : {}),
                }}
                aria-label="Đặt hàng"
              >
                {submitting ? (
                  <>
                    <span style={styles.btnSpinner} /> Đang xử lý…
                  </>
                ) : (
                  `Đặt hàng ngay — ${formatPrice(finalAmount)}`
                )}
              </button>

              <p style={{ textAlign: 'center', fontSize: 12, color: '#707072', marginTop: 10, lineHeight: 1.5 }}>
                🔒 Thông tin của bạn được bảo mật tuyệt đối bởi ShopVibe
              </p>
            </div>
          </aside>
        </div>
      </main>

      <BottomNavBar />
    </div>
  );
};

// ─── Styles (Nike & Apple Luxury Design System) ──────────────────────────────
const styles: Record<string, React.CSSProperties> = {
  page: {
    minHeight: '100vh',
    backgroundColor: 'var(--nike-soft-cloud, #f5f5f7)',
    fontFamily: "'Inter', -apple-system, BlinkMacSystemFont, Roboto, sans-serif",
    color: 'var(--nike-black, #111111)',
    display: 'flex',
    flexDirection: 'column',
  },
  main: {
    flex: 1,
    maxWidth: 1128,
    margin: '0 auto',
    width: '100%',
    padding: '28px 20px 80px',
    boxSizing: 'border-box',
  },
  titleRow: {
    display: 'flex',
    alignItems: 'center',
    gap: 12,
    marginBottom: 24,
  },
  backBtn: {
    background: '#ffffff',
    border: '1px solid var(--nike-hairline, #e5e5e5)',
    borderRadius: '50%',
    width: 38,
    height: 38,
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    cursor: 'pointer',
    color: '#111111',
    flexShrink: 0,
  },
  pageTitle: {
    fontSize: 26,
    fontWeight: 900,
    letterSpacing: '-0.02em',
    color: '#111111',
    margin: 0,
  },
  grid: {
    display: 'grid',
    gridTemplateColumns: '1fr 420px',
    gap: 24,
    alignItems: 'start',
  },
  formCol: {
    display: 'flex',
    flexDirection: 'column',
    gap: 16,
  },
  summaryCol: {
    position: 'sticky',
    top: 90,
  },
  card: {
    background: '#ffffff',
    border: '1px solid var(--nike-hairline, #e5e5e5)',
    borderRadius: 16,
    padding: '24px',
  },
  sectionTitle: {
    fontSize: 17,
    fontWeight: 800,
    color: '#111111',
    margin: '0 0 18px',
    display: 'flex',
    alignItems: 'center',
    gap: 8,
  },
  sectionIcon: {
    fontSize: 18,
  },
  field: {
    marginBottom: 16,
  },
  fieldLabel: {
    display: 'block',
    fontSize: 13.5,
    fontWeight: 700,
    color: '#111111',
    marginBottom: 6,
  },
  requiredMark: {
    color: 'var(--nike-sale, #d30005)',
    marginLeft: 2,
  },
  optionalMark: {
    fontSize: 12,
    fontWeight: 400,
    color: '#707072',
    marginLeft: 4,
  },
  input: {
    width: '100%',
    height: 46,
    padding: '0 14px',
    background: '#ffffff',
    border: '1px solid var(--nike-hairline, #e5e5e5)',
    borderRadius: 10,
    fontSize: 14,
    color: '#111111',
    outline: 'none',
    boxSizing: 'border-box',
    fontFamily: 'inherit',
  },
  inputError: {
    borderColor: '#d30005',
  },
  errorMsg: {
    margin: '4px 0 0',
    fontSize: 12.5,
    color: '#d30005',
  },
  checkboxRow: {
    display: 'flex',
    alignItems: 'center',
    gap: 10,
    cursor: 'pointer',
    marginTop: 4,
  },
  checkbox: {
    width: 18,
    height: 18,
    accentColor: '#111111',
    cursor: 'pointer',
  },
  paymentOption: {
    display: 'flex',
    alignItems: 'center',
    gap: 14,
    padding: '14px 16px',
    border: '1px solid var(--nike-hairline, #e5e5e5)',
    borderRadius: 12,
    cursor: 'pointer',
    background: '#ffffff',
    transition: 'all 150ms ease',
  },
  paymentOptionActive: {
    borderColor: '#111111',
    borderWidth: 2,
    background: '#fafafa',
  },
  paymentIcon: {
    fontSize: 24,
    flexShrink: 0,
  },
  radioCircle: {
    width: 20,
    height: 20,
    borderRadius: '50%',
    border: '2px solid #cccccc',
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    flexShrink: 0,
  },
  radioCircleActive: {
    borderColor: '#111111',
  },
  radioDot: {
    width: 10,
    height: 10,
    borderRadius: '50%',
    background: '#111111',
  },
  itemRow: {
    display: 'flex',
    alignItems: 'flex-start',
    gap: 12,
  },
  itemImgWrap: {
    position: 'relative',
    flexShrink: 0,
  },
  itemImg: {
    width: 56,
    height: 70,
    objectFit: 'cover',
    borderRadius: 8,
    border: '1px solid var(--nike-hairline, #e5e5e5)',
  },
  itemImgFallback: {
    width: 56,
    height: 70,
    borderRadius: 8,
    background: '#f5f5f7',
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    fontSize: 22,
  },
  qtyBadge: {
    position: 'absolute',
    top: -6,
    right: -6,
    width: 20,
    height: 20,
    background: '#111111',
    color: '#ffffff',
    borderRadius: '50%',
    fontSize: 11,
    fontWeight: 700,
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
  },
  itemName: {
    margin: 0,
    fontSize: 13.5,
    fontWeight: 700,
    color: '#111111',
    lineHeight: 1.4,
  },
  itemVariant: {
    margin: '3px 0 0',
    fontSize: 12,
    color: '#707072',
  },
  itemPrice: {
    margin: 0,
    fontSize: 14,
    fontWeight: 800,
    color: '#111111',
    flexShrink: 0,
  },
  divider: {
    height: 1,
    background: 'var(--nike-hairline, #e5e5e5)',
    margin: '16px 0',
  },
  progressTrack: {
    height: 6,
    background: '#e5e5e5',
    borderRadius: 9999,
    overflow: 'hidden',
  },
  progressFill: {
    height: '100%',
    background: '#111111',
    borderRadius: 9999,
    transition: 'width 300ms ease',
  },
  freeShipBadge: {
    background: '#f0fdfa',
    border: '1px solid #99f6e4',
    color: '#0f766e',
    borderRadius: 10,
    padding: '8px 12px',
    fontSize: 12.5,
    fontWeight: 700,
    marginBottom: 14,
    textAlign: 'center',
  },
  totalRow: {
    display: 'flex',
    justifyContent: 'space-between',
    alignItems: 'center',
    fontSize: 14,
    color: '#222222',
  },
  submitBtn: {
    width: '100%',
    height: 52,
    background: '#111111',
    color: '#ffffff',
    border: 'none',
    borderRadius: 9999,
    fontSize: 15,
    fontWeight: 800,
    cursor: 'pointer',
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 8,
  },
  submitBtnLoading: {
    opacity: 0.75,
    cursor: 'not-allowed',
  },
  btnSpinner: {
    width: 16,
    height: 16,
    border: '2.5px solid rgba(255,255,255,0.4)',
    borderTopColor: '#ffffff',
    borderRadius: '50%',
    display: 'inline-block',
    animation: 'spin 600ms linear infinite',
  },
  apiError: {
    display: 'flex',
    alignItems: 'center',
    gap: 8,
    padding: '12px 16px',
    background: '#fff8f6',
    border: '1px solid #d30005',
    borderRadius: 10,
    fontSize: 13.5,
    color: '#d30005',
  },
  loadingWrap: {
    minHeight: '100vh',
    display: 'flex',
    flexDirection: 'column',
    alignItems: 'center',
    justifyContent: 'center',
  },
  spinner: {
    width: 36,
    height: 36,
    border: '3px solid #e5e5e5',
    borderTopColor: '#111111',
    borderRadius: '50%',
    animation: 'spin 600ms linear infinite',
  },
};
