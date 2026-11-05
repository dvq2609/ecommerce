import React, { useState, useEffect, useCallback } from 'react';
import { Link } from 'react-router-dom';
import { AdminSellerLayout } from '../components/layout/AdminSellerLayout';
import {
  adminAnalyticsService,
  type AdminDashboardOverview,
  type AdminRevenuePoint,
} from '../services/adminAnalyticsService';

const formatCurrency = (val: number) =>
  new Intl.NumberFormat('vi-VN', { style: 'currency', currency: 'VND' }).format(val);

const formatNumber = (val: number) =>
  new Intl.NumberFormat('vi-VN').format(val);

const PERIOD_OPTIONS = [
  { value: 'all', label: 'Toàn thời gian' },
  { value: 'today', label: 'Hôm nay' },
  { value: '7days', label: '7 ngày qua' },
  { value: '30days', label: '30 ngày qua' },
  { value: '1year', label: '1 năm qua' },
];

export const AdminDashboardPage: React.FC = () => {
  const [selectedPeriod, setSelectedPeriod] = useState<string>('all');
  const [overview, setOverview] = useState<AdminDashboardOverview | null>(null);
  const [loading, setLoading] = useState<boolean>(true);
  const [errorMsg, setErrorMsg] = useState<string | null>(null);
  const [hoveredPoint, setHoveredPoint] = useState<AdminRevenuePoint | null>(null);

  const fetchOverview = useCallback(async (period: string) => {
    try {
      setLoading(true);
      setErrorMsg(null);
      const data = await adminAnalyticsService.getOverview(period);
      setOverview(data);
    } catch (err: unknown) {
      setErrorMsg(err instanceof Error ? err.message : 'Không thể tải báo cáo tổng quan toàn sàn.');
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchOverview(selectedPeriod);
  }, [selectedPeriod, fetchOverview]);

  const kpi = overview?.kpi;
  const chartData = overview?.revenueTrend || [];
  const statusData = overview?.orderStatusBreakdown || [];
  const paymentData = overview?.paymentBreakdown || [];
  const topSellers = overview?.topSellers || [];
  const topProducts = overview?.topProducts || [];
  const voucherPerf = overview?.voucherPerformance || [];

  // SVG Chart dimensions
  const svgWidth = 760;
  const svgHeight = 250;
  const padX = 44;
  const padTop = 26;
  const padBottom = 36;

  const maxVal = Math.max(...chartData.map((d) => Math.max(d.gmv, d.netRevenue)), 1000000);
  const getY = (val: number) => {
    const usableH = svgHeight - padTop - padBottom;
    return svgHeight - padBottom - (val / maxVal) * usableH;
  };
  const getX = (idx: number) => {
    if (chartData.length <= 1) return svgWidth / 2;
    const usableW = svgWidth - padX * 2;
    return padX + (idx / (chartData.length - 1)) * usableW;
  };

  const gmvPoints = chartData.map((d, i) => `${getX(i)},${getY(d.gmv)}`);
  const netPoints = chartData.map((d, i) => `${getX(i)},${getY(d.netRevenue)}`);
  const gmvPath = gmvPoints.length > 0 ? `M ${gmvPoints.join(' L ')}` : '';
  const netPath = netPoints.length > 0 ? `M ${netPoints.join(' L ')}` : '';
  const gmvArea =
    gmvPoints.length > 0
      ? `M ${getX(0)},${svgHeight - padBottom} L ${gmvPoints.join(' L ')} L ${getX(
        chartData.length - 1
      )},${svgHeight - padBottom} Z`
      : '';

  return (
    <AdminSellerLayout
      title="Trung Tâm Điều Hành Toàn Sàn"
      subtitle="Giám sát tổng giá trị giao dịch (GMV), doanh thu thực thu, hiệu quả chiến dịch Voucher và bảng xếp hạng Gian hàng"
    >
      {/* ─── TOP CONTROL BAR ─────────────────────────────────────────────────── */}
      <div
        style={{
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'space-between',
          flexWrap: 'wrap',
          gap: '12px',
          marginBottom: '22px',
          backgroundColor: '#ffffff',
          padding: '14px 18px',
          borderRadius: '16px',
          border: '1px solid var(--nike-hairline, #e5e5e5)',
        }}
      >
        <div style={{ display: 'flex', alignItems: 'center', gap: '8px', flexWrap: 'wrap' }}>
          <span
            style={{
              fontSize: '12px',
              fontWeight: 800,
              color: 'var(--nike-gray, #707072)',
              textTransform: 'uppercase',
              letterSpacing: '0.05em',
              marginRight: '4px',
            }}
          >
            Kỳ thống kê:
          </span>
          {PERIOD_OPTIONS.map((opt) => {
            const active = selectedPeriod === opt.value;
            return (
              <button
                key={opt.value}
                type="button"
                onClick={() => setSelectedPeriod(opt.value)}
                style={{
                  padding: '7px 15px',
                  borderRadius: '9999px',
                  fontSize: '12.5px',
                  fontWeight: 800,
                  cursor: 'pointer',
                  border: active ? 'none' : '1px solid var(--nike-hairline, #e5e5e5)',
                  backgroundColor: active ? '#111111' : '#ffffff',
                  color: active ? '#ffffff' : '#111111',
                  transition: 'all 0.15s ease',
                }}
              >
                {opt.label}
              </button>
            );
          })}
        </div>

        <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
          <Link
            to="/admin/orders"
            style={{
              padding: '8px 14px',
              borderRadius: '9999px',
              border: '1px solid var(--nike-hairline, #e5e5e5)',
              backgroundColor: '#ffffff',
              color: '#111111',
              fontSize: '12.5px',
              fontWeight: 700,
              textDecoration: 'none',
            }}
          >
            📦 Quản lý Đơn hàng
          </Link>
          <Link
            to="/admin/vouchers"
            style={{
              padding: '8px 16px',
              borderRadius: '9999px',
              border: 'none',
              backgroundColor: '#111111',
              color: '#ffffff',
              fontSize: '12.5px',
              fontWeight: 800,
              textDecoration: 'none',
            }}
          >
            🎟️ Quản lý Voucher
          </Link>
        </div>
      </div>

      {errorMsg && (
        <div
          style={{
            padding: '12px 16px',
            borderRadius: '12px',
            backgroundColor: '#fff1f2',
            border: '1px solid #fecdd3',
            color: '#d30005',
            fontSize: '13px',
            fontWeight: 700,
            marginBottom: '18px',
          }}
        >
          ⚠️ {errorMsg}
        </div>
      )}

      {loading && !overview ? (
        <div
          style={{
            backgroundColor: '#ffffff',
            borderRadius: '16px',
            padding: '48px',
            textAlign: 'center',
            border: '1px solid var(--nike-hairline, #e5e5e5)',
            color: '#707072',
            fontWeight: 600,
          }}
        >
          Đang tổng hợp dữ liệu điều hành toàn sàn...
        </div>
      ) : (
        <>
          {/* ─── HÀNG 1: 4 CHỈ SỐ TÀI CHÍNH CỐT LÕI (GMV, NET REVENUE, ORDERS, VOUCHER BUDGET) ─── */}
          <div
            style={{
              display: 'grid',
              gridTemplateColumns: 'repeat(auto-fit, minmax(240px, 1fr))',
              gap: '16px',
              marginBottom: '16px',
            }}
          >
            {/* Card 1: Tổng GMV Toàn Sàn */}
            <div
              style={{
                backgroundColor: '#ffffff',
                padding: '22px',
                borderRadius: '18px',
                display: 'flex',
                flexDirection: 'column',
                justifyContent: 'space-between',
              }}
            >
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                <span style={{ fontSize: '11.5px', fontWeight: 800, letterSpacing: '0.06em', textTransform: 'uppercase', color: '#707072' }}>
                  TỔNG GMV TOÀN SÀN
                </span>
                <span style={{ fontSize: '18px' }}>💎</span>
              </div>
              <div style={{ fontSize: '26px', fontWeight: 900, marginTop: '10px', letterSpacing: '-0.02em' }}>
                {formatCurrency(kpi?.totalGmv || 0)}
              </div>
              <div style={{ fontSize: '12px', color: '#707072', marginTop: '8px' }}>
                Giá trị đơn trung bình (AOV): <strong>{formatCurrency(kpi?.averageOrderValue || 0)}</strong>
              </div>
            </div>

            {/* Card 2: Doanh thu thực thu (Net Revenue) */}
            <div
              style={{
                backgroundColor: '#ffffff',
                padding: '22px',
                borderRadius: '18px',
                border: '1px solid var(--nike-hairline, #e5e5e5)',
                display: 'flex',
                flexDirection: 'column',
                justifyContent: 'space-between',
              }}
            >
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                <span style={{ fontSize: '11.5px', fontWeight: 800, letterSpacing: '0.06em', textTransform: 'uppercase', color: '#707072' }}>
                  DOANH THU THỰC THU (NET)
                </span>
                <span style={{ fontSize: '18px' }}>💰</span>
              </div>
              <div style={{ fontSize: '26px', fontWeight: 900, marginTop: '10px', letterSpacing: '-0.02em' }}>
                {formatCurrency(kpi?.netRevenue || 0)}
              </div>
              <div style={{ fontSize: '12px', color: '#707072', marginTop: '8px' }}>
                Cước vận chuyển thu hộ: <strong>{formatCurrency(kpi?.totalShippingCollected || 0)}</strong>
              </div>
            </div>

            {/* Card 3: Tổng Đơn Hàng & Tỷ lệ thành công */}
            <div
              style={{
                backgroundColor: '#ffffff',
                padding: '22px',
                borderRadius: '18px',
                border: '1px solid var(--nike-hairline, #e5e5e5)',
                display: 'flex',
                flexDirection: 'column',
                justifyContent: 'space-between',
              }}
            >
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                <span style={{ fontSize: '11.5px', fontWeight: 800, letterSpacing: '0.06em', textTransform: 'uppercase', color: '#707072' }}>
                  TỔNG ĐƠN HÀNG TOÀN SÀN
                </span>
                <span style={{ fontSize: '18px' }}>📦</span>
              </div>
              <div style={{ display: 'flex', alignItems: 'baseline', gap: '10px', marginTop: '10px' }}>
                <span style={{ fontSize: '26px', fontWeight: 900, color: '#111111' }}>
                  {formatNumber(kpi?.totalOrders || 0)}
                </span>
                <span
                  style={{
                    fontSize: '11.5px',
                    fontWeight: 800,
                    padding: '2px 8px',
                    borderRadius: '9999px',
                    backgroundColor: '#f0fdfa',
                    color: '#0f766e',
                  }}
                >
                  {kpi?.successRate ?? 100}% hợp lệ
                </span>
              </div>
              <div style={{ fontSize: '12px', color: '#707072', marginTop: '8px' }}>
                Đã giao: <strong>{kpi?.deliveredOrders || 0}</strong> • Chờ xử lý: <strong>{kpi?.pendingOrders || 0}</strong> • Hủy: <strong>{kpi?.cancelledOrders || 0}</strong>
              </div>
            </div>

            {/* Card 4: Ngân sách Khuyến mãi Voucher */}
            <div
              style={{
                backgroundColor: '#ffffff',
                padding: '22px',
                borderRadius: '18px',
                border: '1px solid var(--nike-hairline, #e5e5e5)',
                display: 'flex',
                flexDirection: 'column',
                justifyContent: 'space-between',
              }}
            >
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                <span style={{ fontSize: '11.5px', fontWeight: 800, letterSpacing: '0.06em', textTransform: 'uppercase', color: '#707072' }}>
                  NGÂN SÁCH TÀI TRỢ VOUCHER
                </span>
                <span style={{ fontSize: '18px' }}>🎟️</span>
              </div>
              <div style={{ fontSize: '26px', fontWeight: 900, marginTop: '10px', letterSpacing: '-0.02em' }}>
                {formatCurrency(kpi?.totalDiscountGiven || 0)}
              </div>
              <div style={{ fontSize: '12px', color: '#707072', marginTop: '8px' }}>
                Tổng lượt khách áp mã: <strong>{formatNumber(kpi?.totalVoucherRedemptions || 0)} lượt</strong>
              </div>
            </div>
          </div>

          {/* ─── HÀNG 2: QUY MÔ HỆ SINH THÁI SÀN SHOPVIBE ───────────────────────── */}
          <div
            style={{
              display: 'grid',
              gridTemplateColumns: 'repeat(auto-fit, minmax(220px, 1fr))',
              gap: '14px',
              marginBottom: '22px',
            }}
          >
            <div
              style={{
                backgroundColor: '#ffffff',
                borderRadius: '14px',
                padding: '14px 18px',
                border: '1px solid var(--nike-hairline, #e5e5e5)',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'space-between',
              }}
            >
              <div>
                <div style={{ fontSize: '11.5px', fontWeight: 700, color: '#707072' }}>Khách mua hàng (Buyers)</div>
                <div style={{ fontSize: '20px', fontWeight: 900, color: '#111111', marginTop: '2px' }}>
                  {formatNumber(kpi?.totalBuyers || 0)} tài khoản
                </div>
              </div>
              <span style={{ fontSize: '24px' }}>👥</span>
            </div>

            <div
              style={{
                backgroundColor: '#ffffff',
                borderRadius: '14px',
                padding: '14px 18px',
                border: '1px solid var(--nike-hairline, #e5e5e5)',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'space-between',
              }}
            >
              <div>
                <div style={{ fontSize: '11.5px', fontWeight: 700, color: '#707072' }}>Đối tác Gian hàng (Sellers)</div>
                <div style={{ fontSize: '20px', fontWeight: 900, color: '#111111', marginTop: '2px' }}>
                  {formatNumber(kpi?.totalSellers || 0)} gian hàng
                </div>
              </div>
              <span style={{ fontSize: '24px' }}>🏪</span>
            </div>

            <div
              style={{
                backgroundColor: '#ffffff',
                borderRadius: '14px',
                padding: '14px 18px',
                border: '1px solid var(--nike-hairline, #e5e5e5)',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'space-between',
              }}
            >
              <div>
                <div style={{ fontSize: '11.5px', fontWeight: 700, color: '#707072' }}>Sản phẩm đang kinh doanh</div>
                <div style={{ fontSize: '20px', fontWeight: 900, color: '#111111', marginTop: '2px' }}>
                  {formatNumber(kpi?.totalActiveProducts || 0)} SKU
                </div>
              </div>
              <span style={{ fontSize: '24px' }}>👕</span>
            </div>
          </div>

          {/* ─── HÀNG 3: BIỂU ĐỒ TĂNG TRƯỞNG GMV & PHÂN BỔ ĐƠN HÀNG ────────────── */}
          <div
            style={{
              display: 'grid',
              gridTemplateColumns: '2fr 1fr',
              gap: '18px',
              marginBottom: '22px',
            }}
          >
            {/* Left: SVG Area & Line Chart */}
            <div
              style={{
                backgroundColor: '#ffffff',
                borderRadius: '18px',
                padding: '22px',
                border: '1px solid var(--nike-hairline, #e5e5e5)',
              }}
            >
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '14px', flexWrap: 'wrap', gap: '8px' }}>
                <div>
                  <h3 style={{ margin: 0, fontSize: '16px', fontWeight: 900, color: '#111111' }}>
                    Biểu Đồ Tăng Trưởng GMV & Doanh Thu Thực Thu
                  </h3>
                  <p style={{ margin: '2px 0 0', fontSize: '12px', color: '#707072' }}>
                    So sánh giá trị giao dịch gốc (GMV) và doanh thu sau ưu đãi Voucher
                  </p>
                </div>
                <div style={{ display: 'flex', alignItems: 'center', gap: '14px', fontSize: '12px', fontWeight: 700 }}>
                  <span style={{ display: 'inline-flex', alignItems: 'center', gap: '6px' }}>
                    <span style={{ width: 10, height: 10, borderRadius: '50%', backgroundColor: '#111111' }} />
                    GMV
                  </span>
                  <span style={{ display: 'inline-flex', alignItems: 'center', gap: '6px' }}>
                    <span style={{ width: 10, height: 10, borderRadius: '50%', backgroundColor: '#d30005' }} />
                    Doanh thu Net
                  </span>
                </div>
              </div>

              {hoveredPoint && (
                <div
                  style={{
                    marginBottom: '10px',
                    padding: '8px 12px',
                    borderRadius: '10px',
                    backgroundColor: '#f5f5f7',
                    fontSize: '12px',
                    display: 'inline-flex',
                    gap: '14px',
                    fontWeight: 700,
                  }}
                >
                  <span>📅 {hoveredPoint.timeLabel}</span>
                  <span>GMV: <strong>{formatCurrency(hoveredPoint.gmv)}</strong></span>
                  <span style={{ color: '#d30005' }}>Net: <strong>{formatCurrency(hoveredPoint.netRevenue)}</strong></span>
                  <span>Đơn hàng: <strong>{hoveredPoint.orderCount} đơn</strong></span>
                </div>
              )}

              <div style={{ width: '100%', overflowX: 'auto' }}>
                <svg viewBox={`0 0 ${svgWidth} ${svgHeight}`} style={{ width: '100%', height: 'auto', minWidth: 480 }}>
                  <defs>
                    <linearGradient id="adminGmvGrad" x1="0" y1="0" x2="0" y2="1">
                      <stop offset="0%" stopColor="#111111" stopOpacity="0.16" />
                      <stop offset="100%" stopColor="#111111" stopOpacity="0.0" />
                    </linearGradient>
                  </defs>

                  {/* Horizontal Grid Lines */}
                  {[0, 0.25, 0.5, 0.75, 1].map((ratio, idx) => {
                    const y = padTop + ratio * (svgHeight - padTop - padBottom);
                    return (
                      <line
                        key={idx}
                        x1={padX}
                        y1={y}
                        x2={svgWidth - padX}
                        y2={y}
                        stroke="#f0f0f2"
                        strokeDasharray="4 4"
                      />
                    );
                  })}

                  {/* GMV Area & Line */}
                  {gmvArea && <path d={gmvArea} fill="url(#adminGmvGrad)" />}
                  {gmvPath && <path d={gmvPath} fill="none" stroke="#111111" strokeWidth="2.8" />}
                  {netPath && <path d={netPath} fill="none" stroke="#d30005" strokeWidth="2.2" strokeDasharray="5 3" />}

                  {/* Points & X Labels */}
                  {chartData.map((pt, i) => {
                    const cx = getX(i);
                    const cyGmv = getY(pt.gmv);
                    return (
                      <g
                        key={i}
                        onMouseEnter={() => setHoveredPoint(pt)}
                        onMouseLeave={() => setHoveredPoint(null)}
                        style={{ cursor: 'pointer' }}
                      >
                        <circle cx={cx} cy={cyGmv} r={4.5} fill="#111111" stroke="#ffffff" strokeWidth="2" />
                        <text
                          x={cx}
                          y={svgHeight - 10}
                          textAnchor="middle"
                          fontSize="11"
                          fontWeight="600"
                          fill="#707072"
                        >
                          {pt.timeLabel}
                        </text>
                      </g>
                    );
                  })}
                </svg>
              </div>
            </div>

            {/* Right: Trạng thái đơn hàng & Kênh thanh toán */}
            <div
              style={{
                backgroundColor: '#ffffff',
                borderRadius: '18px',
                padding: '22px',
                border: '1px solid var(--nike-hairline, #e5e5e5)',
                display: 'flex',
                flexDirection: 'column',
                justifyContent: 'space-between',
                gap: '18px',
              }}
            >
              <div>
                <h3 style={{ margin: '0 0 12px', fontSize: '15.5px', fontWeight: 900, color: '#111111' }}>
                  Tỷ Lệ Trạng Thái Đơn Hàng
                </h3>
                <div style={{ display: 'flex', flexDirection: 'column', gap: '10px' }}>
                  {statusData.map((st) => (
                    <div key={st.statusKey}>
                      <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '12.5px', marginBottom: '4px' }}>
                        <span style={{ fontWeight: 700, color: '#111111', display: 'inline-flex', alignItems: 'center', gap: '6px' }}>
                          <span style={{ width: 8, height: 8, borderRadius: '50%', backgroundColor: st.colorHex }} />
                          {st.statusName}
                        </span>
                        <span style={{ fontWeight: 800, color: '#111111' }}>
                          {st.count} đơn ({st.percentage}%)
                        </span>
                      </div>
                      <div style={{ height: 6, borderRadius: 999, backgroundColor: '#f0f0f2', overflow: 'hidden' }}>
                        <div
                          style={{
                            height: '100%',
                            width: `${Math.max(st.count > 0 ? 6 : 0, st.percentage)}%`,
                            backgroundColor: st.colorHex,
                          }}
                        />
                      </div>
                    </div>
                  ))}
                </div>
              </div>

              <div style={{ borderTop: '1px solid var(--nike-hairline, #e5e5e5)', paddingTop: '14px' }}>
                <h4 style={{ margin: '0 0 10px', fontSize: '13.5px', fontWeight: 900, color: '#111111' }}>
                  Phương Thức Thanh Toán
                </h4>
                <div style={{ display: 'flex', flexDirection: 'column', gap: '8px' }}>
                  {paymentData.map((pm) => (
                    <div
                      key={pm.methodKey}
                      style={{
                        display: 'flex',
                        justifyContent: 'space-between',
                        alignItems: 'center',
                        padding: '8px 12px',
                        borderRadius: '10px',
                        backgroundColor: '#f5f5f7',
                        fontSize: '12px',
                      }}
                    >
                      <div>
                        <div style={{ fontWeight: 800, color: '#111111' }}>{pm.methodName}</div>
                        <div style={{ color: '#707072', fontSize: '11px' }}>{pm.orderCount} đơn ({pm.percentage}%)</div>
                      </div>
                      <div style={{ fontWeight: 900, color: '#111111' }}>{formatCurrency(pm.totalAmount)}</div>
                    </div>
                  ))}
                </div>
              </div>
            </div>
          </div>

          {/* ─── HÀNG 4: BẢNG XẾP HẠNG TOP 5 SELLERS & TOP 5 SẢN PHẨM ──────────── */}
          <div
            style={{
              display: 'grid',
              gridTemplateColumns: 'repeat(auto-fit, minmax(460px, 1fr))',
              gap: '18px',
              marginBottom: '22px',
            }}
          >
            {/* Top 5 Sellers */}
            <div
              style={{
                backgroundColor: '#ffffff',
                borderRadius: '18px',
                padding: '22px',
                border: '1px solid var(--nike-hairline, #e5e5e5)',
              }}
            >
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '14px' }}>
                <div>
                  <h3 style={{ margin: 0, fontSize: '16px', fontWeight: 900, color: '#111111' }}>
                    🏆 Top Gian Hàng (Sellers) Doanh Thu Cao Nhất
                  </h3>
                  <p style={{ margin: '2px 0 0', fontSize: '12px', color: '#707072' }}>
                    Xếp hạng theo tổng doanh thu sản phẩm và số lượng SKU đang bán
                  </p>
                </div>
              </div>

              <div style={{ display: 'flex', flexDirection: 'column', gap: '10px' }}>
                {topSellers.map((seller, idx) => (
                  <div
                    key={seller.sellerId}
                    style={{
                      display: 'flex',
                      alignItems: 'center',
                      justifyContent: 'space-between',
                      padding: '12px 14px',
                      borderRadius: '12px',
                      border: '1px solid var(--nike-hairline, #e5e5e5)',
                      backgroundColor: idx === 0 ? '#fafafa' : '#ffffff',
                    }}
                  >
                    <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
                      <div
                        style={{
                          width: 32,
                          height: 32,
                          borderRadius: '50%',
                          backgroundColor: idx === 0 ? '#111111' : '#f0f0f2',
                          color: idx === 0 ? '#ffffff' : '#111111',
                          display: 'flex',
                          alignItems: 'center',
                          justifyContent: 'center',
                          fontWeight: 900,
                          fontSize: '12.5px',
                        }}
                      >
                        #{idx + 1}
                      </div>
                      <div>
                        <div style={{ fontSize: '13.5px', fontWeight: 800, color: '#111111' }}>
                          {seller.sellerName}
                        </div>
                        <div style={{ fontSize: '11.5px', color: '#707072' }}>
                          {seller.sellerEmail} • {seller.activeProductCount} sản phẩm
                        </div>
                      </div>
                    </div>

                    <div style={{ textAlign: 'right' }}>
                      <div style={{ fontSize: '14px', fontWeight: 900, color: '#111111' }}>
                        {formatCurrency(seller.totalRevenue)}
                      </div>
                      <div style={{ fontSize: '11.5px', color: '#707072' }}>
                        {seller.orderCount} đơn • {seller.totalItemsSold} đã bán
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            </div>

            {/* Top 5 Products */}
            <div
              style={{
                backgroundColor: '#ffffff',
                borderRadius: '18px',
                padding: '22px',
                border: '1px solid var(--nike-hairline, #e5e5e5)',
              }}
            >
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '14px' }}>
                <div>
                  <h3 style={{ margin: 0, fontSize: '16px', fontWeight: 900, color: '#111111' }}>
                    🔥 Top Sản Phẩm Thời Trang Bán Chạy
                  </h3>
                  <p style={{ margin: '2px 0 0', fontSize: '12px', color: '#707072' }}>
                    Sản phẩm dẫn đầu doanh số và sản lượng tiêu thụ trên toàn sàn
                  </p>
                </div>
              </div>

              <div style={{ display: 'flex', flexDirection: 'column', gap: '10px' }}>
                {topProducts.map((prod, idx) => (
                  <div
                    key={prod.productId}
                    style={{
                      display: 'flex',
                      alignItems: 'center',
                      justifyContent: 'space-between',
                      padding: '10px 14px',
                      borderRadius: '12px',
                      border: '1px solid var(--nike-hairline, #e5e5e5)',
                      gap: '12px',
                    }}
                  >
                    <div style={{ display: 'flex', alignItems: 'center', gap: '12px', minWidth: 0 }}>
                      <span
                        style={{
                          fontSize: '12px',
                          fontWeight: 900,
                          color: idx === 0 ? '#d30005' : '#707072',
                          width: 22,
                        }}
                      >
                        #{idx + 1}
                      </span>
                      {prod.imageUrl ? (
                        <img
                          src={prod.imageUrl}
                          alt={prod.productName}
                          style={{
                            width: 42,
                            height: 50,
                            objectFit: 'cover',
                            borderRadius: 8,
                            border: '1px solid #e5e5e5',
                            flexShrink: 0,
                          }}
                        />
                      ) : (
                        <div
                          style={{
                            width: 42,
                            height: 50,
                            borderRadius: 8,
                            backgroundColor: '#f5f5f7',
                            display: 'flex',
                            alignItems: 'center',
                            justifyContent: 'center',
                            flexShrink: 0,
                          }}
                        >
                          👕
                        </div>
                      )}
                      <div style={{ minWidth: 0 }}>
                        <div
                          style={{
                            fontSize: '13px',
                            fontWeight: 800,
                            color: '#111111',
                            whiteSpace: 'nowrap',
                            overflow: 'hidden',
                            textOverflow: 'ellipsis',
                          }}
                        >
                          {prod.productName}
                        </div>
                        <div style={{ fontSize: '11.5px', color: '#707072' }}>
                          {prod.brandName} • {prod.categoryName} • Giá: {formatCurrency(prod.unitPrice)}
                        </div>
                      </div>
                    </div>

                    <div style={{ textAlign: 'right', flexShrink: 0 }}>
                      <div style={{ fontSize: '13.5px', fontWeight: 900, color: '#111111' }}>
                        {formatCurrency(prod.totalRevenue)}
                      </div>
                      <div style={{ fontSize: '11.5px', fontWeight: 700, color: '#0f766e' }}>
                        Đã bán: {prod.totalSoldQuantity}
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </div>

          {/* ─── HÀNG 5: BÁO CÁO HIỆU QUẢ CHIẾN DỊCH VOUCHER (ROI) ──────────────── */}
          <div
            style={{
              backgroundColor: '#ffffff',
              borderRadius: '18px',
              padding: '22px',
              border: '1px solid var(--nike-hairline, #e5e5e5)',
            }}
          >
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '16px', flexWrap: 'wrap', gap: '10px' }}>
              <div>
                <h3 style={{ margin: 0, fontSize: '16px', fontWeight: 900, color: '#111111' }}>
                  🎟️ Hiệu Quả Chiến Dịch Mã Giảm Giá (Voucher ROI)
                </h3>
                <p style={{ margin: '2px 0 0', fontSize: '12px', color: '#707072' }}>
                  Đo lường tỷ lệ sử dụng mã, chi phí khuyến mãi đã cấp và tổng giá trị đơn hàng (GMV) thu về
                </p>
              </div>
              <Link
                to="/admin/vouchers"
                style={{
                  fontSize: '12.5px',
                  fontWeight: 800,
                  color: 'var(--nike-sale, #d30005)',
                  textDecoration: 'none',
                }}
              >
                Điều chỉnh chiến dịch Voucher →
              </Link>
            </div>

            <div style={{ overflowX: 'auto' }}>
              <table style={{ width: '100%', borderCollapse: 'collapse', fontSize: '13px' }}>
                <thead>
                  <tr
                    style={{
                      borderBottom: '1px solid var(--nike-hairline, #e5e5e5)',
                      textAlign: 'left',
                      fontSize: '11px',
                      fontWeight: 800,
                      color: '#707072',
                      textTransform: 'uppercase',
                    }}
                  >
                    <th style={{ padding: '10px 12px' }}>Mã Voucher</th>
                    <th style={{ padding: '10px 12px' }}>Tên Chương Trình</th>
                    <th style={{ padding: '10px 12px' }}>Tiến Độ Lượt Dùng</th>
                    <th style={{ padding: '10px 12px' }}>Ngân Sách Đã Giảm</th>
                    <th style={{ padding: '10px 12px' }}>GMV Mang Lại</th>
                    <th style={{ padding: '10px 12px' }}>Trạng Thái</th>
                  </tr>
                </thead>
                <tbody>
                  {voucherPerf.map((v) => {
                    const pct = v.usageLimit > 0 ? Math.min(100, Math.round((v.usedCount / v.usageLimit) * 100)) : 0;
                    return (
                      <tr key={v.voucherId} style={{ borderBottom: '1px solid #f5f5f7' }}>
                        <td style={{ padding: '12px' }}>
                          <span
                            style={{
                              padding: '3px 9px',
                              borderRadius: '6px',
                              backgroundColor: '#111111',
                              color: '#ffffff',
                              fontSize: '11.5px',
                              fontWeight: 800,
                              letterSpacing: '0.04em',
                            }}
                          >
                            {v.code}
                          </span>
                        </td>
                        <td style={{ padding: '12px', fontWeight: 700, color: '#111111' }}>{v.title}</td>
                        <td style={{ padding: '12px', minWidth: 160 }}>
                          <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '11.5px', marginBottom: 4 }}>
                            <strong>{v.usedCount} / {v.usageLimit}</strong>
                            <span style={{ color: '#707072' }}>{pct}%</span>
                          </div>
                          <div style={{ height: 5, borderRadius: 999, backgroundColor: '#ebebeb', overflow: 'hidden' }}>
                            <div style={{ height: '100%', width: `${Math.max(6, pct)}%`, backgroundColor: '#111111' }} />
                          </div>
                        </td>
                        <td style={{ padding: '12px', fontWeight: 800, color: 'var(--nike-sale, #d30005)' }}>
                          −{formatCurrency(v.totalDiscountBooked)}
                        </td>
                        <td style={{ padding: '12px', fontWeight: 900, color: '#0f766e' }}>
                          {formatCurrency(v.generatedGmv)}
                        </td>
                        <td style={{ padding: '12px' }}>
                          <span
                            style={{
                              padding: '3px 10px',
                              borderRadius: '9999px',
                              fontSize: '11px',
                              fontWeight: 800,
                              backgroundColor: v.isActive ? '#f0fdfa' : '#f4f4f5',
                              color: v.isActive ? '#0f766e' : '#71717a',
                            }}
                          >
                            {v.isActive ? '• Đang chạy' : '• Đã tắt'}
                          </span>
                        </td>
                      </tr>
                    );
                  })}
                </tbody>
              </table>
            </div>
          </div>
        </>
      )}
    </AdminSellerLayout>
  );
};
