import React, { useState, useEffect, useMemo } from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import { useCart } from '../context/CartContext';
import { authService } from '../services/authService';
import { orderService } from '../services/orderService';
import { paymentService } from '../services/paymentService';
import { shippingService } from '../services/shippingService';
import { userService } from '../services/userService';
import { HomeHeader } from '../components/home/HomeHeader';
import { BottomNavBar } from '../components/home/BottomNavBar';
import type { CreateOrderRequest } from '../types/order';
import type { UserAddress } from '../types/user';

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

// ─── component ────────────────────────────────────────────────────────────────
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

    const timer = setTimeout(calc, 250);
    return () => {
      active = false;
      clearTimeout(timer);
    };
  }, [form.shippingAddress, effectiveTotalAmount]);

  const finalAmount = effectiveTotalAmount + shippingFee;
  const progressPct = freeShippingThreshold > 0
    ? Math.min((effectiveTotalAmount / freeShippingThreshold) * 100, 100)
    : 100;

  // Load Sổ địa chỉ và điền sẵn địa chỉ mặc định
  useEffect(() => {
    userService.getAddresses()
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
      const res = await orderService.createOrder(payload);
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
          <h1 style={styles.pageTitle}>Thanh toán</h1>
        </div>

        <div style={styles.grid}>
          {/* ════════════ LEFT COLUMN: FORM ════════════ */}
          <form onSubmit={handleSubmit} style={styles.formCol} noValidate>
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
                      background: 'none',
                      border: '1px solid #dddddd',
                      borderRadius: 8,
                      padding: '6px 12px',
                      fontSize: 12.5,
                      fontWeight: 600,
                      color: '#ff385c',
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
                <div style={{ backgroundColor: '#f9f9f9', borderRadius: 10, padding: 12, marginBottom: 16, border: '1px solid #ebebeb' }}>
                  <p style={{ fontSize: 12.5, fontWeight: 600, color: '#717171', margin: '0 0 8px' }}>
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
                          borderRadius: 8,
                          border: '1px solid #dddddd',
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
                            <strong style={{ fontSize: 13, color: '#222' }}>{addr.receiverName}</strong>
                            <span style={{ fontSize: 12, color: '#717171' }}>• {addr.receiverPhone}</span>
                            <span style={{ fontSize: 11, padding: '1px 6px', borderRadius: 4, backgroundColor: '#f0f0f0', color: '#555' }}>
                              {addr.addressType}
                            </span>
                            {addr.isDefault && (
                              <span style={{ fontSize: 10, color: '#ff385c', fontWeight: 700 }}>[Mặc định]</span>
                            )}
                          </div>
                          <p style={{ fontSize: 12.5, color: '#444', margin: '4px 0 0' }}>
                            {addr.fullAddress || addr.streetAddress}
                          </p>
                        </div>
                        <span className="material-symbols-outlined" style={{ fontSize: 18, color: '#ff385c' }}>
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

              {/* Note (textarea) */}
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
                      <p style={{ margin: 0, fontWeight: 600, fontSize: 15, color: '#222' }}>{opt.label}</p>
                      <p style={{ margin: 0, fontSize: 13, color: '#6a6a6a', marginTop: 2 }}>{opt.desc}</p>
                    </div>
                    <div style={{
                      ...styles.radioCircle,
                      ...(form.paymentMethod === opt.value ? styles.radioCircleActive : {}),
                    }}>
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

            {/* ── Submit (mobile only — sticky; desktop in right col) ── */}
            <button
              type="submit"
              disabled={submitting || effectiveItems.length === 0}
              style={{
                ...styles.submitBtn,
                ...(submitting ? styles.submitBtnLoading : {}),
              }}
              aria-label="Đặt hàng"
            >
              {submitting ? (
                <>
                  <span style={styles.btnSpinner} /> Đang xử lý…
                </>
              ) : (
                `Đặt hàng — ${formatPrice(finalAmount)}`
              )}
            </button>
          </form>

          {/* ════════════ RIGHT COLUMN: ORDER SUMMARY ════════════ */}
          <aside style={styles.summaryCol}>
            <div style={styles.card}>
              <h2 style={styles.sectionTitle}>
                <span style={styles.sectionIcon}>🛍️</span>
                Tóm tắt đơn hàng
                <span style={{ marginLeft: 'auto', fontSize: 13, fontWeight: 400, color: '#6a6a6a' }}>
                  {effectiveItems.length} sản phẩm
                </span>
              </h2>

              {/* Item list */}
              <ul style={{ listStyle: 'none', margin: 0, padding: 0, display: 'flex', flexDirection: 'column', gap: 14 }}>
                {effectiveItems.map((item) => (
                  <li key={item.cartItemId} style={styles.itemRow}>
                    {/* Image */}
                    <div style={styles.itemImgWrap}>
                      {item.productImage ? (
                        <img src={item.productImage} alt={item.productName} style={styles.itemImg} />
                      ) : (
                        <div style={styles.itemImgFallback}>🛍️</div>
                      )}
                      <span style={styles.qtyBadge}>{item.quantity}</span>
                    </div>

                    {/* Info */}
                    <div style={{ flex: 1, minWidth: 0 }}>
                      <p style={styles.itemName}>{item.productName}</p>
                      {(item.colorName || item.sizeName) && (
                        <p style={styles.itemVariant}>
                          {[item.colorName, item.sizeName].filter(Boolean).join(' • ')}
                        </p>
                      )}
                    </div>

                    {/* Price */}
                    <p style={styles.itemPrice}>{formatPrice(item.totalPrice)}</p>
                  </li>
                ))}
              </ul>

              <div style={styles.divider} />

              {/* Free ship progress */}
              {shippingFee > 0 && freeShippingThreshold > 0 && (
                <div style={{ marginBottom: 14 }}>
                  <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: 13, color: '#6a6a6a', marginBottom: 6 }}>
                    <span>Thêm {formatPrice(Math.max(0, freeShippingThreshold - effectiveTotalAmount))} để được miễn phí giao hàng</span>
                  </div>
                  <div style={styles.progressTrack}>
                    <div style={{ ...styles.progressFill, width: `${progressPct}%` }} />
                  </div>
                </div>
              )}
              {shippingFee === 0 && effectiveTotalAmount > 0 && (
                <div style={styles.freeShipBadge}>
                  🎉 Miễn phí giao hàng cho đơn hàng của bạn!
                </div>
              )}

              {/* Totals */}
              <div style={{ display: 'flex', flexDirection: 'column', gap: 8 }}>
                <div style={styles.totalRow}>
                  <span>Tạm tính</span>
                  <span>{formatPrice(effectiveTotalAmount)}</span>
                </div>
                <div style={styles.totalRow}>
                  <div style={{ display: 'flex', flexDirection: 'column' }}>
                    <span>Phí vận chuyển</span>
                    {estimatedDays && (
                      <span style={{ fontSize: 11, color: '#717171' }}>
                        Dự kiến giao: {estimatedDays} {shippingRuleMatched ? `(${shippingRuleMatched})` : ''}
                      </span>
                    )}
                  </div>
                  <span style={{ color: shippingFee === 0 ? '#00a699' : '#222', fontWeight: 600 }}>
                    {shippingFee === 0 ? 'Miễn phí' : formatPrice(shippingFee)}
                  </span>
                </div>
                <div style={styles.divider} />
                <div style={{ ...styles.totalRow, fontSize: 18, fontWeight: 700 }}>
                  <span>Tổng cộng</span>
                  <span style={{ color: '#ff385c' }}>{formatPrice(finalAmount)}</span>
                </div>
              </div>

              {/* ── Desktop Submit ── */}
              <button
                form="__checkout_form__"
                type="submit"
                disabled={submitting || effectiveItems.length === 0}
                onClick={handleSubmit}
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
                  `Đặt hàng ngay`
                )}
              </button>

              <p style={{ textAlign: 'center', fontSize: 12, color: '#6a6a6a', marginTop: 10, lineHeight: 1.5 }}>
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

// ─── Styles (Airbnb Design System) ───────────────────────────────────────────
const styles: Record<string, React.CSSProperties> = {
  page: {
    minHeight: '100vh',
    backgroundColor: '#f7f7f7',
    fontFamily: "'Inter', -apple-system, BlinkMacSystemFont, Roboto, sans-serif",
    color: '#222222',
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
    background: 'none',
    border: '1px solid #dddddd',
    borderRadius: 8,
    width: 36,
    height: 36,
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    cursor: 'pointer',
    color: '#222',
    flexShrink: 0,
    transition: 'background 150ms ease-out',
  },
  pageTitle: {
    fontSize: 26,
    fontWeight: 700,
    color: '#222222',
    margin: 0,
  },
  grid: {
    display: 'grid',
    gridTemplateColumns: '1fr 400px',
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
    border: '1px solid #ebebeb',
    borderRadius: 14,
    padding: '24px',
    boxShadow: 'none',
  },
  sectionTitle: {
    fontSize: 17,
    fontWeight: 700,
    color: '#222222',
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
    fontWeight: 600,
    color: '#222222',
    marginBottom: 6,
  },
  requiredMark: {
    color: '#ff385c',
    marginLeft: 2,
  },
  optionalMark: {
    fontSize: 12,
    fontWeight: 400,
    color: '#6a6a6a',
    marginLeft: 4,
  },
  input: {
    width: '100%',
    height: 48,
    padding: '0 14px',
    background: '#ffffff',
    border: '1px solid #dddddd',
    borderRadius: 8,
    fontSize: 14.5,
    color: '#222222',
    outline: 'none',
    boxSizing: 'border-box',
    fontFamily: 'inherit',
    transition: 'border-color 150ms ease-in-out, box-shadow 150ms ease-in-out',
  },
  inputError: {
    borderColor: '#c13515 !important',
  },
  errorMsg: {
    margin: '4px 0 0',
    fontSize: 13,
    color: '#c13515',
    lineHeight: 1.38,
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
    accentColor: '#ff385c',
    cursor: 'pointer',
    flexShrink: 0,
  },
  paymentOption: {
    display: 'flex',
    alignItems: 'center',
    gap: 14,
    padding: '14px 16px',
    border: '1.5px solid #dddddd',
    borderRadius: 10,
    cursor: 'pointer',
    transition: 'border 150ms ease-out, background 150ms ease-out',
    background: '#fff',
  },
  paymentOptionActive: {
    borderColor: '#ff385c',
    background: '#fff5f7',
  },
  paymentIcon: {
    fontSize: 22,
    flexShrink: 0,
  },
  radioCircle: {
    width: 20,
    height: 20,
    borderRadius: '50%',
    border: '2px solid #dddddd',
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    flexShrink: 0,
    transition: 'border 150ms',
  },
  radioCircleActive: {
    borderColor: '#ff385c',
  },
  radioDot: {
    width: 10,
    height: 10,
    borderRadius: '50%',
    background: '#ff385c',
  },
  apiError: {
    display: 'flex',
    alignItems: 'center',
    gap: 10,
    padding: '12px 16px',
    background: '#fff5f4',
    border: '1px solid #fecdc8',
    borderRadius: 10,
    fontSize: 14,
    color: '#c13515',
    lineHeight: 1.5,
  },
  submitBtn: {
    width: '100%',
    height: 52,
    background: '#ff385c',
    color: '#ffffff',
    fontSize: 16,
    fontWeight: 600,
    border: 'none',
    borderRadius: 8,
    cursor: 'pointer',
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 10,
    boxShadow: '0 1px 2px rgba(0,0,0,0.08)',
    transition: 'background 150ms ease-out, transform 150ms ease-out, opacity 150ms',
    fontFamily: 'inherit',
  },
  submitBtnLoading: {
    opacity: 0.75,
    cursor: 'not-allowed',
  },
  btnSpinner: {
    display: 'inline-block',
    width: 18,
    height: 18,
    border: '2px solid rgba(255,255,255,0.35)',
    borderTopColor: '#fff',
    borderRadius: '50%',
    animation: 'spin 600ms linear infinite',
  },
  divider: {
    height: 1,
    background: '#ebebeb',
    margin: '14px 0',
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
    width: 60,
    height: 60,
    objectFit: 'cover',
    borderRadius: 8,
    border: '1px solid #ebebeb',
  },
  itemImgFallback: {
    width: 60,
    height: 60,
    borderRadius: 8,
    background: '#f7f7f7',
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    fontSize: 24,
    border: '1px solid #ebebeb',
  },
  qtyBadge: {
    position: 'absolute',
    top: -6,
    right: -6,
    width: 20,
    height: 20,
    background: '#222222',
    color: '#fff',
    borderRadius: '50%',
    fontSize: 11,
    fontWeight: 700,
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
  },
  itemName: {
    margin: 0,
    fontSize: 14,
    fontWeight: 500,
    color: '#222',
    lineHeight: 1.4,
    overflow: 'hidden',
    textOverflow: 'ellipsis',
    whiteSpace: 'nowrap',
  },
  itemVariant: {
    margin: '3px 0 0',
    fontSize: 12,
    color: '#6a6a6a',
  },
  itemPrice: {
    margin: 0,
    fontSize: 14,
    fontWeight: 600,
    color: '#222',
    flexShrink: 0,
  },
  totalRow: {
    display: 'flex',
    justifyContent: 'space-between',
    fontSize: 15,
    color: '#3f3f3f',
  },
  progressTrack: {
    height: 4,
    background: '#ebebeb',
    borderRadius: 2,
    overflow: 'hidden',
  },
  progressFill: {
    height: '100%',
    background: '#ff385c',
    borderRadius: 2,
    transition: 'width 600ms ease-in-out',
  },
  freeShipBadge: {
    padding: '10px 14px',
    background: '#f0fdf4',
    border: '1px solid #bbf7d0',
    borderRadius: 8,
    fontSize: 13,
    color: '#15803d',
    fontWeight: 500,
    marginBottom: 14,
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
    border: '3px solid #ebebeb',
    borderTopColor: '#ff385c',
    borderRadius: '50%',
    animation: 'spin 600ms linear infinite',
  },
};

// Inject keyframes (chỉ 1 lần)
if (typeof document !== 'undefined' && !document.getElementById('__checkout_spin__')) {
  const style = document.createElement('style');
  style.id = '__checkout_spin__';
  style.textContent = `
    @keyframes spin { to { transform: rotate(360deg); } }
    #recipientName:focus, #recipientPhone:focus, #shippingAddress:focus, #note:focus {
      border-color: #222222 !important;
      box-shadow: 0 0 0 1px #222222;
    }
    @media (max-width: 768px) {
      .checkout-grid { grid-template-columns: 1fr !important; }
      .checkout-summary-col { position: static !important; }
    }
  `;
  document.head.appendChild(style);
}
