import React, { useState, useEffect, useCallback } from 'react';
import { AdminSellerLayout } from '../components/layout/AdminSellerLayout';
import {
  sellerAnalyticsService,
  type SellerKpiData,
  type RevenueChartPoint,
  type OrderStatusBreakdownItem,
} from '../services/sellerAnalyticsService';

const formatCurrency = (val: number) =>
  new Intl.NumberFormat('vi-VN', { style: 'currency', currency: 'VND' }).format(val);

const formatNumber = (val: number) =>
  new Intl.NumberFormat('vi-VN').format(val);

const PERIOD_OPTIONS = [
  { value: 'today', label: 'Hôm nay' },
  { value: '7days', label: '7 ngày qua' },
  { value: '30days', label: '30 ngày qua' },
  { value: '1year', label: '1 năm qua' },
];

export const SellerAnalyticsPage: React.FC = () => {
  const [selectedPeriod, setSelectedPeriod] = useState<string>('7days');
  const [kpiData, setKpiData] = useState<SellerKpiData | null>(null);
  const [chartData, setChartData] = useState<RevenueChartPoint[]>([]);
  const [statusData, setStatusData] = useState<OrderStatusBreakdownItem[]>([]);
  const [loading, setLoading] = useState<boolean>(true);
  const [errorMsg, setErrorMsg] = useState<string | null>(null);

  // Hover state cho chart tooltip
  const [hoveredPoint, setHoveredPoint] = useState<RevenueChartPoint | null>(null);
  const [hoveredIndex, setHoveredIndex] = useState<number | null>(null);

  const fetchAnalytics = useCallback(async (period: string) => {
    try {
      setLoading(true);
      setErrorMsg(null);
      const [kpiRes, chartRes, statusRes] = await Promise.all([
        sellerAnalyticsService.getKpis(period),
        sellerAnalyticsService.getRevenueChart(period),
        sellerAnalyticsService.getStatusBreakdown(period),
      ]);

      if (kpiRes?.success) setKpiData(kpiRes.data);
      if (chartRes?.success) setChartData(chartRes.data || []);
      if (statusRes?.success) setStatusData(statusRes.data || []);
    } catch (err: any) {
      console.error('Error fetching seller analytics:', err);
      setErrorMsg(err.message || 'Không thể tải báo cáo doanh thu.');
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchAnalytics(selectedPeriod);
  }, [selectedPeriod, fetchAnalytics]);

  // Tính toán kích thước SVG Chart
  const svgWidth = 800;
  const svgHeight = 280;
  const paddingX = 50;
  const paddingTop = 30;
  const paddingBottom = 40;

  const maxRevenue = Math.max(...chartData.map((d) => d.revenue), 1000000);
  const maxOrders = Math.max(...chartData.map((d) => d.orderCount), 5);

  const getYRevenue = (val: number) => {
    const usableHeight = svgHeight - paddingTop - paddingBottom;
    return svgHeight - paddingBottom - (val / maxRevenue) * usableHeight;
  };

  const getX = (index: number) => {
    if (chartData.length <= 1) return svgWidth / 2;
    const usableWidth = svgWidth - paddingX * 2;
    return paddingX + (index / (chartData.length - 1)) * usableWidth;
  };

  // Generate SVG path cho doanh thu
  const revenuePoints = chartData.map((d, i) => `${getX(i)},${getYRevenue(d.revenue)}`);
  const revenuePathD = revenuePoints.length > 0 ? `M ${revenuePoints.join(' L ')}` : '';
  const areaPathD =
    revenuePoints.length > 0
      ? `M ${getX(0)},${svgHeight - paddingBottom} L ${revenuePoints.join(' L ')} L ${getX(
          chartData.length - 1
        )},${svgHeight - paddingBottom} Z`
      : '';

  // Tính toán vòng cung Donut Chart cho phân bổ đơn hàng
  const totalStatusOrders = statusData.reduce((acc, curr) => acc + curr.count, 0);

  let cumulativeAngle = 0;
  const donutSlices = statusData.map((item) => {
    const angle = totalStatusOrders > 0 ? (item.count / totalStatusOrders) * 360 : 0;
    const startAngle = cumulativeAngle;
    cumulativeAngle += angle;
    return {
      ...item,
      startAngle,
      endAngle: cumulativeAngle,
      color: item.colorHex || '#94a3b8',
    };
  });

  return (
    <AdminSellerLayout
      title="Báo Cáo Doanh Thu & Hiệu Quả Kinh Doanh"
      subtitle="Theo dõi biến động dòng tiền, số lượng đơn hàng và tỷ lệ giao vận của gian hàng"
    >
      {/* ─── THANH ĐIỀU KHIỂN & BỘ LỌC THỜI GIAN ───────────────────────────── */}
      <div
        style={{
          display: 'flex',
          justifyContent: 'space-between',
          alignItems: 'center',
          flexWrap: 'wrap',
          gap: '16px',
          marginBottom: '24px',
        }}
      >
        <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
          <span
            className="material-symbols-outlined"
            style={{ fontSize: '20px', color: 'var(--color-on-surface-variant)' }}
          >
            calendar_today
          </span>
          <span style={{ fontSize: '13px', fontWeight: 600, color: 'var(--color-on-surface-variant)' }}>
            Kỳ báo cáo:
          </span>
        </div>

        <div style={{ display: 'flex', gap: '8px', flexWrap: 'wrap' }}>
          {PERIOD_OPTIONS.map((opt) => {
            const isSelected = selectedPeriod === opt.value;
            return (
              <button
                key={opt.value}
                type="button"
                onClick={() => setSelectedPeriod(opt.value)}
                style={{
                  padding: '8px 18px',
                  borderRadius: '20px',
                  fontSize: '13px',
                  fontWeight: isSelected ? 700 : 500,
                  backgroundColor: isSelected ? '#1b1c1c' : 'var(--color-surface-card)',
                  color: isSelected ? '#ffffff' : 'var(--color-on-surface)',
                  border: isSelected ? '1px solid #1b1c1c' : '1px solid var(--color-border-subtle)',
                  cursor: 'pointer',
                  transition: 'all 160ms cubic-bezier(0.4, 0, 0.2, 1)',
                  boxShadow: isSelected ? '0 2px 8px rgba(0,0,0,0.15)' : 'none',
                }}
              >
                {opt.label}
              </button>
            );
          })}
        </div>
      </div>

      {/* ─── THÔNG BÁO LỖI (NẾU CÓ) ────────────────────────────────────────── */}
      {errorMsg && (
        <div
          style={{
            padding: '14px 18px',
            borderRadius: '12px',
            backgroundColor: '#fef2f2',
            border: '1px solid #fecaca',
            color: '#991b1b',
            fontSize: '13.5px',
            fontWeight: 500,
            display: 'flex',
            alignItems: 'center',
            gap: '10px',
            marginBottom: '24px',
          }}
        >
          <span className="material-symbols-outlined" style={{ fontSize: '20px' }}>
            error
          </span>
          <span>{errorMsg}</span>
        </div>
      )}

      {/* ─── 1. THẺ KPI SUMMARY ĐỒNG BỘ ĐEN SANG TRỌNG ───────────────────────── */}
      <div
        style={{
          display: 'grid',
          gridTemplateColumns: 'repeat(auto-fit, minmax(240px, 1fr))',
          gap: '16px',
          marginBottom: '28px',
        }}
      >
        {/* KPI 1: Doanh thu thuần */}
        <div style={cardKpiStyle}>
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
            <span style={kpiLabelStyle}>DOANH THU THUẦN</span>
            <div style={kpiIconWrapperStyle}>
              <span className="material-symbols-outlined" style={{ color: '#1b1c1c', fontSize: '20px' }}>
                payments
              </span>
            </div>
          </div>
          <div style={kpiValueStyle}>
            {loading ? '...' : formatCurrency(kpiData?.totalRevenue ?? 0)}
          </div>
          <div style={kpiSubtextStyle}>
            Chỉ tính từ các đơn giao thành công
          </div>
        </div>

        {/* KPI 2: Tổng số đơn hàng */}
        <div style={cardKpiStyle}>
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
            <span style={kpiLabelStyle}>TỔNG ĐƠN ĐÃ PHÁT SINH</span>
            <div style={kpiIconWrapperStyle}>
              <span className="material-symbols-outlined" style={{ color: '#1b1c1c', fontSize: '20px' }}>
                shopping_bag
              </span>
            </div>
          </div>
          <div style={kpiValueStyle}>
            {loading ? '...' : formatNumber(kpiData?.totalOrders ?? 0)}
          </div>
          <div style={kpiSubtextStyle}>
            Bao gồm tất cả đơn có món hàng của bạn
          </div>
        </div>

        {/* KPI 3: Giá trị đơn trung bình (AOV) */}
        <div style={cardKpiStyle}>
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
            <span style={kpiLabelStyle}>GIÁ TRỊ ĐƠN TB (AOV)</span>
            <div style={kpiIconWrapperStyle}>
              <span className="material-symbols-outlined" style={{ color: '#1b1c1c', fontSize: '20px' }}>
                trending_up
              </span>
            </div>
          </div>
          <div style={kpiValueStyle}>
            {loading ? '...' : formatCurrency(kpiData?.averageOrderValue ?? 0)}
          </div>
          <div style={kpiSubtextStyle}>
            Doanh thu bình quân trên mỗi đơn giao
          </div>
        </div>

        {/* KPI 4: Tỷ lệ giao thành công */}
        <div style={cardKpiStyle}>
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
            <span style={kpiLabelStyle}>TỶ LỆ GIAO THÀNH CÔNG</span>
            <div style={kpiIconWrapperStyle}>
              <span className="material-symbols-outlined" style={{ color: '#1b1c1c', fontSize: '20px' }}>
                verified
              </span>
            </div>
          </div>
          <div style={kpiValueStyle}>
            {loading ? '...' : `${kpiData?.successRate ?? 0}%`}
          </div>
          <div style={kpiSubtextStyle}>
            {kpiData?.deliveredOrders ?? 0} đơn giao thành công
          </div>
        </div>
      </div>

      {/* ─── 2. BIỂU ĐỒ DOANH THU & PHÂN BỔ TRẠNG THÁI ──────────────────────── */}
      <div
        style={{
          display: 'grid',
          gridTemplateColumns: 'minmax(0, 2.2fr) minmax(0, 1.2fr)',
          gap: '20px',
          marginBottom: '28px',
        }}
      >
        {/* Biểu đồ Doanh Thu & Số Đơn Hàng Theo Thời Gian */}
        <div style={chartContainerStyle}>
          <div
            style={{
              display: 'flex',
              justifyContent: 'space-between',
              alignItems: 'center',
              marginBottom: '16px',
            }}
          >
            <div>
              <h3 style={{ fontSize: '16px', fontWeight: 700, margin: 0, color: 'var(--color-on-surface)' }}>
                Xu Hướng Doanh Thu
              </h3>
              <p style={{ fontSize: '12.5px', color: 'var(--color-on-surface-variant)', margin: '4px 0 0 0' }}>
                Biểu đồ diễn biến dòng tiền thực tế theo các mốc thời gian
              </p>
            </div>
            <div style={{ display: 'flex', gap: '14px', alignItems: 'center', fontSize: '12px' }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: '6px' }}>
                <span style={{ width: '10px', height: '10px', borderRadius: '50%', backgroundColor: '#ff385c' }} />
                <span style={{ fontWeight: 600, color: 'var(--color-on-surface)' }}>Doanh thu (VNĐ)</span>
              </div>
              <div style={{ display: 'flex', alignItems: 'center', gap: '6px' }}>
                <span style={{ width: '10px', height: '10px', borderRadius: '50%', backgroundColor: '#3b82f6' }} />
                <span style={{ fontWeight: 600, color: 'var(--color-on-surface)' }}>Số đơn hàng</span>
              </div>
            </div>
          </div>

          {/* Khung vẽ SVG Responsive */}
          <div style={{ position: 'relative', width: '100%', overflowX: 'auto' }}>
            {loading ? (
              <div
                style={{
                  height: '280px',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  color: 'var(--color-on-surface-variant)',
                  fontSize: '14px',
                }}
              >
                Đang nạp dữ liệu thống kê...
              </div>
            ) : chartData.length === 0 ? (
              <div
                style={{
                  height: '280px',
                  display: 'flex',
                  flexDirection: 'column',
                  alignItems: 'center',
                  justifyContent: 'center',
                  color: 'var(--color-on-surface-variant)',
                  gap: '8px',
                }}
              >
                <span className="material-symbols-outlined" style={{ fontSize: '36px', opacity: 0.5 }}>
                  bar_chart
                </span>
                <span>Chưa có dữ liệu giao dịch trong kỳ này</span>
              </div>
            ) : (
              <>
                <svg
                  viewBox={`0 0 ${svgWidth} ${svgHeight}`}
                  style={{ width: '100%', height: 'auto', display: 'block' }}
                >
                  <defs>
                    <linearGradient id="revenueGradient" x1="0" y1="0" x2="0" y2="1">
                      <stop offset="0%" stopColor="#ff385c" stopOpacity="0.25" />
                      <stop offset="100%" stopColor="#ff385c" stopOpacity="0.0" />
                    </linearGradient>
                  </defs>

                  {/* Grid Lines ngang */}
                  {[0, 0.25, 0.5, 0.75, 1].map((pct, idx) => {
                    const y = paddingTop + (svgHeight - paddingTop - paddingBottom) * pct;
                    const val = maxRevenue * (1 - pct);
                    return (
                      <g key={idx}>
                        <line
                          x1={paddingX}
                          y1={y}
                          x2={svgWidth - paddingX}
                          y2={y}
                          stroke="var(--color-border-subtle)"
                          strokeDasharray="4 4"
                          strokeWidth="1"
                        />
                        <text
                          x={paddingX - 8}
                          y={y + 4}
                          textAnchor="end"
                          fontSize="10"
                          fill="var(--color-on-surface-variant)"
                          fontFamily="inherit"
                        >
                          {val >= 1000000 ? `${(val / 1000000).toFixed(1)}M` : `${Math.round(val / 1000)}k`}
                        </text>
                      </g>
                    );
                  })}

                  {/* Area fill */}
                  {areaPathD && <path d={areaPathD} fill="url(#revenueGradient)" />}

                  {/* Cột số lượng đơn hàng (Bar Chart phía sau đường cong) */}
                  {chartData.map((d, i) => {
                    const x = getX(i);
                    const barWidth = 14;
                    const barHeight =
                      maxOrders > 0
                        ? (d.orderCount / maxOrders) * (svgHeight - paddingTop - paddingBottom) * 0.7
                        : 0;
                    const y = svgHeight - paddingBottom - barHeight;
                    return (
                      <rect
                        key={`bar-${i}`}
                        x={x - barWidth / 2}
                        y={y}
                        width={barWidth}
                        height={barHeight}
                        rx="4"
                        fill="#3b82f6"
                        opacity={hoveredIndex === i ? 0.85 : 0.45}
                        style={{ transition: 'opacity 150ms' }}
                      />
                    );
                  })}

                  {/* Line curve doanh thu */}
                  {revenuePathD && (
                    <path
                      d={revenuePathD}
                      fill="none"
                      stroke="#ff385c"
                      strokeWidth="3"
                      strokeLinecap="round"
                      strokeLinejoin="round"
                    />
                  )}

                  {/* Điểm Data Points */}
                  {chartData.map((d, i) => {
                    const x = getX(i);
                    const y = getYRevenue(d.revenue);
                    const isHovered = hoveredIndex === i;
                    return (
                      <g
                        key={`pt-${i}`}
                        style={{ cursor: 'pointer' }}
                        onMouseEnter={() => {
                          setHoveredIndex(i);
                          setHoveredPoint(d);
                        }}
                        onMouseLeave={() => {
                          setHoveredIndex(null);
                          setHoveredPoint(null);
                        }}
                      >
                        {/* Hitbox rộng để dễ hover */}
                        <circle cx={x} cy={y} r="18" fill="transparent" />
                        <circle
                          cx={x}
                          cy={y}
                          r={isHovered ? 7 : 4}
                          fill="#ffffff"
                          stroke="#ff385c"
                          strokeWidth={isHovered ? 3 : 2}
                          style={{ transition: 'r 150ms ease' }}
                        />
                        {/* Nhãn trục X */}
                        <text
                          x={x}
                          y={svgHeight - paddingBottom + 20}
                          textAnchor="middle"
                          fontSize="11"
                          fontWeight={isHovered ? 700 : 500}
                          fill={isHovered ? 'var(--color-on-surface)' : 'var(--color-on-surface-variant)'}
                          fontFamily="inherit"
                        >
                          {d.timeLabel}
                        </text>
                      </g>
                    );
                  })}
                </svg>

                {/* Tooltip nổi khi hover data point */}
                {hoveredPoint && hoveredIndex !== null && (
                  <div
                    style={{
                      position: 'absolute',
                      top: '12px',
                      left: '50%',
                      transform: 'translateX(-50%)',
                      backgroundColor: 'rgba(27, 28, 28, 0.95)',
                      backdropFilter: 'blur(8px)',
                      color: '#ffffff',
                      padding: '8px 16px',
                      borderRadius: '8px',
                      fontSize: '12.5px',
                      display: 'flex',
                      alignItems: 'center',
                      gap: '14px',
                      boxShadow: '0 4px 12px rgba(0,0,0,0.25)',
                      pointerEvents: 'none',
                      zIndex: 10,
                    }}
                  >
                    <div>
                      <span style={{ color: '#9ca3af', fontSize: '11px', display: 'block' }}>Thời gian</span>
                      <strong>{hoveredPoint.timeLabel}</strong>
                    </div>
                    <div style={{ width: '1px', height: '24px', backgroundColor: 'rgba(255,255,255,0.2)' }} />
                    <div>
                      <span style={{ color: '#fca5a5', fontSize: '11px', display: 'block' }}>Doanh thu thuần</span>
                      <strong style={{ color: '#ffffff' }}>{formatCurrency(hoveredPoint.revenue)}</strong>
                    </div>
                    <div style={{ width: '1px', height: '24px', backgroundColor: 'rgba(255,255,255,0.2)' }} />
                    <div>
                      <span style={{ color: '#93c5fd', fontSize: '11px', display: 'block' }}>Số đơn hàng</span>
                      <strong style={{ color: '#ffffff' }}>{hoveredPoint.orderCount} đơn</strong>
                    </div>
                  </div>
                )}
              </>
            )}
          </div>
        </div>

        {/* Biểu đồ Phân Bổ Trạng Thái Đơn Hàng (Donut Breakdown) */}
        <div style={chartContainerStyle}>
          <h3 style={{ fontSize: '16px', fontWeight: 700, margin: '0 0 4px 0', color: 'var(--color-on-surface)' }}>
            Tỷ Lệ Đơn Hàng
          </h3>
          <p style={{ fontSize: '12.5px', color: 'var(--color-on-surface-variant)', margin: '0 0 16px 0' }}>
            Phân bổ trạng thái xử lý và giao hàng ({totalStatusOrders} đơn)
          </p>

          {/* Vòng tròn Donut hiển thị */}
          <div
            style={{
              display: 'flex',
              flexDirection: 'column',
              alignItems: 'center',
              justifyContent: 'center',
              marginBottom: '20px',
            }}
          >
            {totalStatusOrders === 0 ? (
              <div
                style={{
                  height: '160px',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  color: 'var(--color-on-surface-variant)',
                  fontSize: '13px',
                }}
              >
                Chưa có đơn hàng nào
              </div>
            ) : (
              <div style={{ position: 'relative', width: '160px', height: '160px' }}>
                <svg viewBox="0 0 100 100" style={{ transform: 'rotate(-90deg)', width: '100%', height: '100%' }}>
                  {donutSlices.map((slice, idx) => {
                    const strokeDasharray = `${(slice.count / totalStatusOrders) * 251.2} 251.2`;
                    const strokeDashoffset = -((slice.startAngle / 360) * 251.2);
                    return (
                      <circle
                        key={idx}
                        cx="50"
                        cy="50"
                        r="40"
                        fill="transparent"
                        stroke={slice.color}
                        strokeWidth="16"
                        strokeDasharray={strokeDasharray}
                        strokeDashoffset={strokeDashoffset}
                        strokeLinecap="round"
                        style={{ transition: 'stroke-dasharray 300ms ease' }}
                      />
                    );
                  })}
                </svg>
                {/* Trung tâm Donut */}
                <div
                  style={{
                    position: 'absolute',
                    top: '50%',
                    left: '50%',
                    transform: 'translate(-50%, -50%)',
                    textAlign: 'center',
                  }}
                >
                  <span style={{ fontSize: '20px', fontWeight: 800, color: 'var(--color-on-surface)' }}>
                    {totalStatusOrders}
                  </span>
                  <span style={{ display: 'block', fontSize: '10px', color: 'var(--color-on-surface-variant)', textTransform: 'uppercase', fontWeight: 600 }}>
                    Tổng đơn
                  </span>
                </div>
              </div>
            )}
          </div>

          {/* Danh sách Legend chi tiết */}
          <div style={{ display: 'flex', flexDirection: 'column', gap: '8px' }}>
            {donutSlices.map((item) => (
              <div
                key={item.statusKey}
                style={{
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'space-between',
                  padding: '6px 10px',
                  borderRadius: '8px',
                  backgroundColor: 'var(--color-surface-container-low)',
                  fontSize: '12.5px',
                }}
              >
                <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                  <span
                    style={{
                      width: '10px',
                      height: '10px',
                      borderRadius: '50%',
                      backgroundColor: item.color,
                      flexShrink: 0,
                    }}
                  />
                  <span style={{ color: 'var(--color-on-surface)', fontWeight: 500 }}>
                    {item.statusName}
                  </span>
                </div>
                <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                  <span style={{ fontWeight: 700, color: 'var(--color-on-surface)' }}>
                    {item.count}
                  </span>
                  <span style={{ fontSize: '11px', color: 'var(--color-on-surface-variant)', width: '38px', textAlign: 'right' }}>
                    ({item.percentage}%)
                  </span>
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>
    </AdminSellerLayout>
  );
};

// ─── Inline Style Constants Chuẩn Design Token ────────────────────────────────
const cardKpiStyle: React.CSSProperties = {
  backgroundColor: 'var(--color-surface-card)',
  borderRadius: 'var(--radius-xl)',
  padding: '20px 22px',
  border: '1px solid var(--color-border-subtle)',
  boxShadow: 'var(--shadow-sm)',
  display: 'flex',
  flexDirection: 'column',
  justifyContent: 'space-between',
  transition: 'transform 180ms ease, box-shadow 180ms ease',
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
  fontSize: '26px',
  fontWeight: 800,
  color: 'var(--color-on-surface)',
  marginTop: '10px',
  letterSpacing: '-0.5px',
};

const kpiSubtextStyle: React.CSSProperties = {
  fontSize: '12px',
  color: 'var(--color-on-surface-variant)',
  marginTop: '6px',
};

const chartContainerStyle: React.CSSProperties = {
  backgroundColor: 'var(--color-surface-card)',
  borderRadius: 'var(--radius-xl)',
  padding: '22px 24px',
  border: '1px solid var(--color-border-subtle)',
  boxShadow: 'var(--shadow-sm)',
};
