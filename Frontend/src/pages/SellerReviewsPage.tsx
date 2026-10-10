import React, { useState, useEffect, useCallback } from 'react';
import { AdminSellerLayout } from '../components/layout/AdminSellerLayout';
import { reviewAndNotifyService, type ReviewItem, type SellerReviewStats } from '../services/reviewAndNotifyService';

export const SellerReviewsPage: React.FC = () => {
  const [stats, setStats] = useState<SellerReviewStats | null>(null);
  const [reviews, setReviews] = useState<ReviewItem[]>([]);
  const [loading, setLoading] = useState<boolean>(true);
  const [totalCount, setTotalCount] = useState<number>(0);
  const [pageNumber, setPageNumber] = useState<number>(1);

  // Filters
  const [replyFilter, setReplyFilter] = useState<'all' | 'pending' | 'replied'>('all');
  const [starFilter, setStarFilter] = useState<number | 'all'>('all');

  // Reply modal / inline state
  const [activeReplyId, setActiveReplyId] = useState<number | null>(null);
  const [replyText, setReplyText] = useState<string>('');
  const [submittingReply, setSubmittingReply] = useState<boolean>(false);
  const [toastMsg, setToastMsg] = useState<{ text: string; type: 'success' | 'error' } | null>(null);

  const fetchStats = useCallback(async () => {
    try {
      const res = await reviewAndNotifyService.getSellerReviewStats();
      if (res.success && res.data) {
        setStats(res.data);
      }
    } catch (err) {
      console.error('Lỗi khi tải thống kê đánh giá:', err);
    }
  }, []);

  const fetchReviews = useCallback(async () => {
    setLoading(true);
    try {
      const hasReplied =
        replyFilter === 'pending' ? false : replyFilter === 'replied' ? true : undefined;
      const rating = starFilter === 'all' ? undefined : starFilter;

      const res = await reviewAndNotifyService.getSellerReviews(pageNumber, 15, rating, hasReplied);
      if (res.success && res.data) {
        setReviews(res.data.items || []);
        setTotalCount(res.data.totalCount || 0);
      }
    } catch (err) {
      console.error('Lỗi khi tải danh sách đánh giá:', err);
    } finally {
      setLoading(false);
    }
  }, [pageNumber, replyFilter, starFilter]);

  useEffect(() => {
    fetchStats();
  }, [fetchStats]);

  useEffect(() => {
    fetchReviews();
  }, [fetchReviews]);

  // Highlight review state khi navigate từ thông báo
  const [highlightedReviewId, setHighlightedReviewId] = useState<number | null>(null);

  // Tự động scroll và highlight đánh giá nếu URL có hash (#review-X)
  useEffect(() => {
    if (loading) return;

    const hash = window.location.hash;
    if (hash && hash.startsWith('#review-')) {
      const reviewId = parseInt(hash.replace('#review-', ''), 10);
      if (!isNaN(reviewId)) {
        setHighlightedReviewId(reviewId);
        setTimeout(() => {
          const element = document.getElementById(`review-${reviewId}`);
          if (element) {
            element.scrollIntoView({ behavior: 'smooth', block: 'center' });
          }
        }, 150);

        // Bỏ highlight sau 4 giây
        const timer = setTimeout(() => setHighlightedReviewId(null), 4000);
        return () => clearTimeout(timer);
      }
    }
  }, [loading, reviews]);

  const handleOpenReply = (rev: ReviewItem) => {
    setActiveReplyId(rev.reviewId);
    setReplyText(rev.sellerReply || '');
  };

  const handleSubmitReply = async (reviewId: number) => {
    if (!replyText.trim()) return;
    setSubmittingReply(true);

    try {
      const res = await reviewAndNotifyService.replyReview(reviewId, replyText.trim());
      if (res.success && res.data) {
        setReviews((prev) =>
          prev.map((r) =>
            r.reviewId === reviewId
              ? { ...r, sellerReply: res.data!.sellerReply, sellerRepliedAt: res.data!.sellerRepliedAt }
              : r
          )
        );
        setActiveReplyId(null);
        setReplyText('');
        fetchStats(); // Update stats
        setToastMsg({ text: 'Đã gửi phản hồi thành công tới khách hàng!', type: 'success' });
        setTimeout(() => setToastMsg(null), 3500);
      } else {
        setToastMsg({ text: res.message || 'Không thể gửi phản hồi', type: 'error' });
      }
    } catch {
      setToastMsg({ text: 'Đã xảy ra lỗi khi kết nối máy chủ.', type: 'error' });
    } finally {
      setSubmittingReply(false);
    }
  };

  return (
    <AdminSellerLayout
      title="Quản Lý Đánh Giá & Phản Hồi"
      subtitle="Theo dõi trải nghiệm khách hàng, uy tín gian hàng và phản hồi đánh giá trực tiếp"
    >
      {/* Toast popup */}
      {toastMsg && (
        <div
          style={{
            position: 'fixed',
            top: '20px',
            right: '24px',
            zIndex: 9999,
            backgroundColor: toastMsg.type === 'success' ? '#15803d' : '#b91c1c',
            color: '#ffffff',
            padding: '12px 20px',
            borderRadius: '8px',
            boxShadow: '0 4px 12px rgba(0,0,0,0.15)',
            fontSize: '14px',
            fontWeight: 500,
          }}
        >
          {toastMsg.text}
        </div>
      )}

      {/* ─── 1. KPI STATS CARDS (Chuẩn Homepage card & icon badge) ──────────────── */}
      <div
        style={{
          display: 'grid',
          gridTemplateColumns: 'repeat(auto-fit, minmax(230px, 1fr))',
          gap: '16px',
          marginBottom: '24px',
        }}
      >
        {/* Điểm đánh giá */}
        <div style={styles.kpiCard}>
          <div style={styles.kpiHeader}>
            <span style={{ ...styles.kpiLabel, color: 'var(--color-on-surface)' }}>ĐIỂM ĐÁNH GIÁ SHOP</span>
            <div
              style={{
                width: '36px',
                height: '36px',
                borderRadius: '50%',
                backgroundColor: '#fffbeb',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
              }}
            >
              <span className="material-symbols-outlined" style={{ fontSize: '20px', color: '#f59e0b', fontVariationSettings: "'FILL' 1" }}>
                star
              </span>
            </div>
          </div>
          <div style={{ ...styles.kpiValue, color: 'var(--color-on-surface)' }}>
            {stats ? stats.averageRating : 5.0}
            <span style={{ fontSize: '15px', color: 'var(--color-on-surface-variant)', fontWeight: 600 }}> / 5.0</span>
          </div>
          <div style={styles.kpiSub}>Dựa trên {stats?.totalReviews || 0} lượt đánh giá thực tế</div>
        </div>

        {/* Tổng đánh giá */}
        <div style={styles.kpiCard}>
          <div style={styles.kpiHeader}>
            <span style={{ ...styles.kpiLabel, color: 'var(--color-on-surface)' }}>TỔNG LƯỢT ĐÁNH GIÁ</span>
            <div
              style={{
                width: '36px',
                height: '36px',
                borderRadius: '50%',
                backgroundColor: 'var(--color-surface-container-low)',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
              }}
            >
              <span className="material-symbols-outlined" style={{ color: 'var(--color-primary)', fontSize: '20px' }}>
                rate_review
              </span>
            </div>
          </div>
          <div style={{ ...styles.kpiValue, color: 'var(--color-on-surface)' }}>{stats?.totalReviews || 0}</div>
          <div style={styles.kpiSub}>Toàn bộ các sản phẩm của shop</div>
        </div>

        {/* Chưa phản hồi */}
        <div style={styles.kpiCard}>
          <div style={styles.kpiHeader}>
            <span style={{ ...styles.kpiLabel, color: 'var(--color-on-surface)' }}>CHƯA PHẢN HỒI</span>
            <div
              style={{
                width: '36px',
                height: '36px',
                borderRadius: '50%',
                backgroundColor: '#fff7ed',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
              }}
            >
              <span className="material-symbols-outlined" style={{ color: '#ea580c', fontSize: '20px' }}>
                mark_chat_unread
              </span>
            </div>
          </div>
          <div style={{ ...styles.kpiValue, color: 'var(--color-on-surface)' }}>{stats?.pendingReplies || 0}</div>
          <div style={styles.kpiSub}>Cần phản hồi để tăng tỷ lệ uy tín</div>
        </div>

        {/* Tỷ lệ phản hồi */}
        <div style={styles.kpiCard}>
          <div style={styles.kpiHeader}>
            <span style={{ ...styles.kpiLabel, color: 'var(--color-on-surface)' }}>TỶ LỆ PHẢN HỒI</span>
            <div
              style={{
                width: '36px',
                height: '36px',
                borderRadius: '50%',
                backgroundColor: 'var(--color-success-bg)',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
              }}
            >
              <span className="material-symbols-outlined" style={{ color: '#006a62', fontSize: '20px' }}>
                verified
              </span>
            </div>
          </div>
          <div style={{ ...styles.kpiValue, color: 'var(--color-on-surface)' }}>{stats?.responseRate || 100}%</div>
          <div style={styles.kpiSub}>Mục tiêu duy trì trên 95%</div>
        </div>
      </div>

      {/* ─── 2. FILTERS & SEARCH ────────────────────────────────────────────── */}
      <div style={styles.filterBar}>
        {/* Reply Tabs */}
        <div style={{ display: 'flex', gap: '8px' }}>
          {[
            { id: 'all', label: 'Tất cả' },
            { id: 'pending', label: 'Chờ phản hồi' },
            { id: 'replied', label: 'Đã phản hồi' },
          ].map((tab) => {
            const active = replyFilter === tab.id;
            return (
              <button
                key={tab.id}
                type="button"
                style={{
                  ...styles.tabBtn,
                  backgroundColor: active ? 'var(--color-primary)' : 'var(--color-surface-card)',
                  color: active ? '#ffffff' : 'var(--color-on-surface)',
                  borderColor: active ? 'var(--color-primary)' : 'var(--color-border-subtle)',
                  boxShadow: active ? '0 2px 8px rgba(186, 0, 54, 0.25)' : 'none',
                }}
                onClick={() => {
                  setReplyFilter(tab.id as any);
                  setPageNumber(1);
                }}
              >
                {tab.label}
              </button>
            );
          })}
        </div>

        {/* Star Filter */}
        <div style={{ display: 'flex', gap: '6px', alignItems: 'center' }}>
          <span style={{ fontSize: '13px', color: '#6b7280', fontWeight: 500 }}>Lọc theo sao:</span>
          {(['all', 5, 4, 3, 2, 1] as const).map((star) => {
            const active = starFilter === star;
            return (
              <button
                key={star}
                type="button"
                style={{
                  ...styles.starFilterBtn,
                  backgroundColor: active ? '#fef3c7' : '#ffffff',
                  color: active ? '#b45309' : '#4b5563',
                  borderColor: active ? '#f59e0b' : '#e5e7eb',
                }}
                onClick={() => {
                  setStarFilter(star);
                  setPageNumber(1);
                }}
              >
                {star === 'all' ? 'Tất cả' : `${star}★`}
              </button>
            );
          })}
        </div>
      </div>

      {/* ─── 3. REVIEWS LIST ────────────────────────────────────────────────── */}
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '14px' }}>
        <h3 style={{ margin: 0, fontSize: '16px', fontWeight: 700, color: '#111827' }}>
          Danh Sách Đánh Giá ({totalCount})
        </h3>
        {totalCount > 15 && (
          <span style={{ fontSize: '12px', color: '#6b7280' }}>Hiển thị trang {pageNumber}</span>
        )}
      </div>

      <div style={styles.reviewList}>
        {loading ? (
          <div style={styles.loadingBox}>Đang tải danh sách đánh giá...</div>
        ) : reviews.length === 0 ? (
          <div style={styles.emptyBox}>
            <div style={{ fontSize: '36px', marginBottom: '8px' }}>💬</div>
            <div style={{ fontSize: '16px', fontWeight: 600, color: '#374151' }}>
              Không có đánh giá nào phù hợp với bộ lọc
            </div>
            <p style={{ fontSize: '13px', color: '#6b7280', marginTop: '4px' }}>
              Hãy thử chọn trạng thái hoặc số sao khác.
            </p>
          </div>
        ) : (
          reviews.map((rev) => {
            const isHighlighted = highlightedReviewId === rev.reviewId;
            return (
              <div
                key={rev.reviewId}
                id={`review-${rev.reviewId}`}
                style={{
                  ...styles.reviewCard,
                  borderColor: isHighlighted ? '#ff385c' : '#f3f4f6',
                  boxShadow: isHighlighted ? '0 0 0 3px rgba(255, 56, 92, 0.25)' : 'none',
                  transition: 'all 0.3s ease',
                }}
              >
                {/* Header card */}
                <div style={styles.cardHeader}>
                  <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
                    {rev.userAvatar ? (
                      <img src={rev.userAvatar} alt={rev.userName} style={styles.avatarImg} />
                    ) : (
                      <div style={styles.avatarLetter}>{rev.userName.charAt(0)}</div>
                    )}
                  <div>
                    <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                      <span style={{ fontSize: '14.5px', fontWeight: 700, color: '#111827' }}>
                        {rev.userName}
                      </span>
                      <span style={styles.orderBadge}>Đơn #{rev.orderId}</span>
                    </div>
                    <div style={{ fontSize: '12px', color: '#6b7280', marginTop: '2px' }}>
                      Sản phẩm: <strong>{rev.productName}</strong>
                      {rev.variantInfo && ` • Phân loại: ${rev.variantInfo}`}
                    </div>
                  </div>
                </div>

                <div style={{ textAlign: 'right' }}>
                  <div style={{ color: '#f59e0b', fontSize: '16px' }}>
                    {'★'.repeat(rev.rating)}
                    <span style={{ color: '#e5e7eb' }}>{'★'.repeat(5 - rev.rating)}</span>
                  </div>
                  <div style={{ fontSize: '11.5px', color: '#9ca3af', marginTop: '4px' }}>
                    {new Date(
                      rev.createdAt.endsWith('Z') || rev.createdAt.includes('+')
                        ? rev.createdAt
                        : `${rev.createdAt}Z`
                    ).toLocaleString('vi-VN', {
                      timeZone: 'Asia/Ho_Chi_Minh',
                      hour: '2-digit',
                      minute: '2-digit',
                      day: '2-digit',
                      month: '2-digit',
                      year: 'numeric',
                    })}
                  </div>
                </div>
              </div>

              {/* Comment text */}
              <div style={styles.commentBody}>
                <p style={{ margin: 0, fontSize: '14px', color: '#1f2937', lineHeight: '1.5' }}>
                  {rev.comment}
                </p>

                {/* Review Images */}
                {rev.images && rev.images.length > 0 && (
                  <div style={{ display: 'flex', gap: '8px', marginTop: '10px' }}>
                    {rev.images.map((img, idx) => (
                      <a key={idx} href={img} target="_blank" rel="noreferrer" style={styles.imgLink}>
                        <img src={img} alt="Feedback" style={styles.feedbackImg} />
                      </a>
                    ))}
                  </div>
                )}
              </div>

              {/* Seller Reply Box */}
              <div style={styles.replySection}>
                {rev.sellerReply ? (
                  <div style={styles.repliedBox}>
                    <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                      <span style={styles.replyTitle}>
                        <span style={{ color: '#ff385c' }}>●</span> Phản hồi của bạn (ShopVibe):
                      </span>
                      <button
                        type="button"
                        style={styles.editReplyBtn}
                        onClick={() => handleOpenReply(rev)}
                      >
                        Sửa phản hồi
                      </button>
                    </div>
                    <p style={styles.replyContent}>{rev.sellerReply}</p>
                    {rev.sellerRepliedAt && (
                      <div style={styles.replyTime}>
                        Đã trả lời lúc:{' '}
                        {new Date(
                          rev.sellerRepliedAt.endsWith('Z') || rev.sellerRepliedAt.includes('+')
                            ? rev.sellerRepliedAt
                            : `${rev.sellerRepliedAt}Z`
                        ).toLocaleString('vi-VN', {
                          timeZone: 'Asia/Ho_Chi_Minh',
                          hour: '2-digit',
                          minute: '2-digit',
                          day: '2-digit',
                          month: '2-digit',
                        })}
                      </div>
                    )}
                  </div>
                ) : (
                  <div>
                    {activeReplyId === rev.reviewId ? (
                      <div style={styles.inlineReplyBox}>
                        <label style={styles.replyInputLabel}>Nhập lời phản hồi tới khách hàng:</label>
                        <textarea
                          rows={3}
                          style={styles.replyTextarea}
                          placeholder="Dạ shop chân thành cảm ơn bạn đã tin tưởng ủng hộ..."
                          value={replyText}
                          onChange={(e) => setReplyText(e.target.value)}
                        />
                        <div style={{ display: 'flex', justifyContent: 'flex-end', gap: '8px', marginTop: '8px' }}>
                          <button
                            type="button"
                            style={styles.cancelReplyBtn}
                            onClick={() => setActiveReplyId(null)}
                            disabled={submittingReply}
                          >
                            Hủy
                          </button>
                          <button
                            type="button"
                            style={styles.sendReplyBtn}
                            onClick={() => handleSubmitReply(rev.reviewId)}
                            disabled={!replyText.trim() || submittingReply}
                          >
                            {submittingReply ? 'Đang gửi...' : 'Gửi phản hồi'}
                          </button>
                        </div>
                      </div>
                    ) : (
                      <button
                        type="button"
                        style={styles.openReplyBtn}
                        onClick={() => handleOpenReply(rev)}
                      >
                        <span className="material-symbols-outlined" style={{ fontSize: '18px' }}>
                          reply
                        </span>
                        <span>Trả lời khách hàng</span>
                      </button>
                    )}
                  </div>
                )}
              </div>
            </div>
            );
          })
        )}
      </div>
    </AdminSellerLayout>
  );
};

const styles: Record<string, React.CSSProperties> = {
  kpiCard: {
    backgroundColor: 'var(--color-surface-card)',
    borderRadius: 'var(--radius-xl)',
    padding: '20px 22px',
    boxShadow: 'var(--shadow-sm)',
    border: '1px solid var(--color-border-subtle)',
    display: 'flex',
    flexDirection: 'column',
    justifyContent: 'space-between',
  },
  kpiHeader: {
    display: 'flex',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  kpiLabel: {
    fontSize: '12px',
    fontWeight: 700,
    color: 'var(--color-on-surface-variant)',
    letterSpacing: '0.5px',
  },
  kpiValue: {
    fontSize: '28px',
    fontWeight: 800,
    color: 'var(--color-on-surface)',
    marginTop: '6px',
    letterSpacing: '-0.5px',
  },
  kpiSub: {
    fontSize: '12px',
    color: 'var(--color-on-surface-variant)',
    marginTop: '4px',
  },
  filterBar: {
    display: 'flex',
    justifyContent: 'space-between',
    alignItems: 'center',
    backgroundColor: 'var(--color-surface-card)',
    padding: '14px 20px',
    borderRadius: 'var(--radius-xl)',
    border: '1px solid var(--color-border-subtle)',
    boxShadow: 'var(--shadow-soft)',
    marginBottom: '20px',
    flexWrap: 'wrap',
    gap: '12px',
  },
  tabBtn: {
    padding: '8px 18px',
    borderRadius: 'var(--radius-full)',
    fontSize: '13px',
    fontWeight: 600,
    border: '1px solid',
    cursor: 'pointer',
    transition: 'all 0.15s ease',
  },
  starFilterBtn: {
    padding: '6px 12px',
    borderRadius: 'var(--radius-full)',
    fontSize: '12px',
    fontWeight: 600,
    border: '1px solid',
    cursor: 'pointer',
    transition: 'all 0.15s ease',
  },
  reviewList: {
    display: 'flex',
    flexDirection: 'column',
    gap: '16px',
  },
  loadingBox: {
    backgroundColor: 'var(--color-surface-card)',
    padding: '40px',
    textAlign: 'center',
    borderRadius: 'var(--radius-xl)',
    border: '1px solid var(--color-border-subtle)',
    color: 'var(--color-on-surface-variant)',
  },
  emptyBox: {
    backgroundColor: 'var(--color-surface-card)',
    padding: '50px 20px',
    textAlign: 'center',
    borderRadius: 'var(--radius-xl)',
    border: '1px solid var(--color-border-subtle)',
  },
  reviewCard: {
    backgroundColor: 'var(--color-surface-card)',
    borderRadius: 'var(--radius-xl)',
    border: '1px solid var(--color-border-subtle)',
    padding: '22px',
    boxShadow: 'var(--shadow-sm)',
  },
  cardHeader: {
    display: 'flex',
    justifyContent: 'space-between',
    alignItems: 'flex-start',
    borderBottom: '1px solid var(--color-border-subtle)',
    paddingBottom: '14px',
  },
  avatarImg: {
    width: '42px',
    height: '42px',
    borderRadius: '50%',
    objectFit: 'cover',
  },
  avatarLetter: {
    width: '42px',
    height: '42px',
    borderRadius: '50%',
    backgroundColor: 'var(--color-primary-fixed)',
    color: 'var(--color-on-primary-fixed)',
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    fontWeight: 700,
    fontSize: '15px',
  },
  orderBadge: {
    fontSize: '11.5px',
    fontWeight: 600,
    color: '#2563eb',
    backgroundColor: '#eff6ff',
    padding: '2px 8px',
    borderRadius: '4px',
  },
  commentBody: {
    padding: '14px 0',
  },
  imgLink: {
    display: 'inline-block',
  },
  feedbackImg: {
    width: '64px',
    height: '64px',
    borderRadius: '8px',
    objectFit: 'cover',
    border: '1px solid #e5e7eb',
  },
  replySection: {
    marginTop: '6px',
    borderTop: '1px solid #f3f4f6',
    paddingTop: '12px',
  },
  repliedBox: {
    backgroundColor: '#f8fafc',
    borderRadius: '10px',
    padding: '12px 16px',
    border: '1px solid #e2e8f0',
  },
  replyTitle: {
    fontSize: '13px',
    fontWeight: 700,
    color: '#0f172a',
    display: 'flex',
    alignItems: 'center',
    gap: '6px',
  },
  editReplyBtn: {
    background: 'none',
    border: 'none',
    fontSize: '12px',
    color: '#2563eb',
    cursor: 'pointer',
    fontWeight: 500,
  },
  replyContent: {
    margin: '6px 0 0',
    fontSize: '13.5px',
    color: '#334155',
    lineHeight: '1.45',
  },
  replyTime: {
    fontSize: '11px',
    color: '#94a3b8',
    marginTop: '6px',
  },
  openReplyBtn: {
    display: 'inline-flex',
    alignItems: 'center',
    gap: '6px',
    padding: '8px 14px',
    backgroundColor: '#f3f4f6',
    color: '#1f2937',
    border: '1px solid #e5e7eb',
    borderRadius: '8px',
    fontSize: '13px',
    fontWeight: 600,
    cursor: 'pointer',
  },
  inlineReplyBox: {
    backgroundColor: '#f9fafb',
    borderRadius: '10px',
    padding: '14px',
    border: '1px solid #e5e7eb',
  },
  replyInputLabel: {
    display: 'block',
    fontSize: '13px',
    fontWeight: 600,
    color: '#374151',
    marginBottom: '6px',
  },
  replyTextarea: {
    width: '100%',
    padding: '10px 12px',
    borderRadius: '8px',
    border: '1px solid #d1d5db',
    fontSize: '13.5px',
    outline: 'none',
    boxSizing: 'border-box',
    fontFamily: 'inherit',
    resize: 'vertical',
  },
  cancelReplyBtn: {
    padding: '6px 14px',
    backgroundColor: '#ffffff',
    color: '#6b7280',
    border: '1px solid #d1d5db',
    borderRadius: '6px',
    fontSize: '13px',
    fontWeight: 500,
    cursor: 'pointer',
  },
  sendReplyBtn: {
    padding: '6px 16px',
    backgroundColor: '#ff385c',
    color: '#ffffff',
    border: 'none',
    borderRadius: '6px',
    fontSize: '13px',
    fontWeight: 600,
    cursor: 'pointer',
  },
};
