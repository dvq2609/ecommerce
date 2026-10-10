import React, { useState } from 'react';
import { reviewAndNotifyService } from '../../services/reviewAndNotifyService';

interface ReviewModalProps {
  orderId: number;
  productId: number;
  productName: string;
  productImage?: string;
  productVariantId?: number;
  variantInfo?: string;
  onClose: () => void;
  onSuccess: () => void;
}

export const ReviewModal: React.FC<ReviewModalProps> = ({
  orderId,
  productId,
  productName,
  productImage,
  productVariantId,
  variantInfo,
  onClose,
  onSuccess,
}) => {
  const [rating, setRating] = useState<number>(5);
  const [hoverRating, setHoverRating] = useState<number>(0);
  const [comment, setComment] = useState<string>('');
  const [imageUrl, setImageUrl] = useState<string>('');
  const [images, setImages] = useState<string[]>([]);
  const [loading, setLoading] = useState<boolean>(false);
  const [error, setError] = useState<string | null>(null);

  const handleAddImage = () => {
    if (!imageUrl.trim()) return;
    if (images.length >= 3) {
      setError('Tối đa 3 ảnh minh họa');
      return;
    }
    setImages([...images, imageUrl.trim()]);
    setImageUrl('');
    setError(null);
  };

  const handleRemoveImage = (idx: number) => {
    setImages(images.filter((_, i) => i !== idx));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (comment.trim().length < 5) {
      setError('Vui lòng nhập nhận xét ít nhất 5 ký tự.');
      return;
    }

    setLoading(true);
    setError(null);

    try {
      const res = await reviewAndNotifyService.createReview({
        orderId,
        productId,
        productVariantId,
        rating,
        comment: comment.trim(),
        images: images.length > 0 ? images : undefined,
      });

      if (res.success) {
        onSuccess();
      } else {
        setError(res.message || 'Không thể gửi đánh giá');
      }
    } catch {
      setError('Đã có lỗi xảy ra khi kết nối tới máy chủ.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div style={styles.overlay}>
      <div style={styles.modal}>
        {/* Header */}
        <div style={styles.header}>
          <h3 style={styles.title}>Đánh Giá Sản Phẩm</h3>
          <button style={styles.closeBtn} onClick={onClose}>
            ✕
          </button>
        </div>

        {/* Product preview */}
        <div style={styles.productRow}>
          {productImage && <img src={productImage} alt={productName} style={styles.productThumb} />}
          <div style={styles.productInfo}>
            <div style={styles.productName}>{productName}</div>
            {variantInfo && <div style={styles.variantBadge}>{variantInfo}</div>}
          </div>
        </div>

        {error && <div style={styles.errorAlert}>{error}</div>}

        <form onSubmit={handleSubmit} style={styles.form}>
          {/* Star rating */}
          <div style={styles.ratingSection}>
            <label style={styles.label}>Chất lượng sản phẩm</label>
            <div style={styles.starsContainer}>
              {[1, 2, 3, 4, 5].map((star) => {
                const active = star <= (hoverRating || rating);
                return (
                  <button
                    key={star}
                    type="button"
                    style={{
                      ...styles.starBtn,
                      color: active ? '#f59e0b' : '#d1d5db',
                      transform: active ? 'scale(1.15)' : 'scale(1)',
                    }}
                    onMouseEnter={() => setHoverRating(star)}
                    onMouseLeave={() => setHoverRating(0)}
                    onClick={() => setRating(star)}
                  >
                    ★
                  </button>
                );
              })}
              <span style={styles.ratingText}>
                {rating === 5 && 'Tuyệt vời'}
                {rating === 4 && 'Hài lòng'}
                {rating === 3 && 'Bình thường'}
                {rating === 2 && 'Không hài lòng'}
                {rating === 1 && 'Rất tệ'}
              </span>
            </div>
          </div>

          {/* Comment */}
          <div style={styles.field}>
            <label style={styles.label}>
              Chia sẻ cảm nhận của bạn <span style={{ color: '#ef4444' }}>*</span>
            </label>
            <textarea
              style={styles.textarea}
              rows={4}
              placeholder="Hãy chia sẻ về chất liệu, form dáng, thời gian giao hàng và độ hài lòng..."
              value={comment}
              onChange={(e) => setComment(e.target.value)}
              required
            />
          </div>

          {/* Optional images */}
          <div style={styles.field}>
            <label style={styles.label}>
              Đính kèm hình ảnh thực tế <span style={styles.optionalText}>(Tùy chọn - Tối đa 3 ảnh)</span>
            </label>
            <div style={styles.imageInputRow}>
              <input
                type="url"
                style={styles.urlInput}
                placeholder="Dán link ảnh (https://...)"
                value={imageUrl}
                onChange={(e) => setImageUrl(e.target.value)}
              />
              <button
                type="button"
                style={styles.addImageBtn}
                onClick={handleAddImage}
                disabled={!imageUrl.trim() || images.length >= 3}
              >
                + Thêm ảnh
              </button>
            </div>

            {images.length > 0 && (
              <div style={styles.previewGrid}>
                {images.map((img, i) => (
                  <div key={i} style={styles.imageWrapper}>
                    <img src={img} alt="Feedback" style={styles.previewImage} />
                    <button
                      type="button"
                      style={styles.removeImageBtn}
                      onClick={() => handleRemoveImage(i)}
                    >
                      ✕
                    </button>
                  </div>
                ))}
              </div>
            )}
          </div>

          {/* Footer buttons */}
          <div style={styles.footer}>
            <button type="button" style={styles.cancelBtn} onClick={onClose} disabled={loading}>
              Hủy bỏ
            </button>
            <button type="submit" style={styles.submitBtn} disabled={loading}>
              {loading ? 'Đang gửi...' : 'Hoàn thành & Gửi'}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};

const styles: Record<string, React.CSSProperties> = {
  overlay: {
    position: 'fixed',
    inset: 0,
    backgroundColor: 'rgba(0, 0, 0, 0.55)',
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    zIndex: 9999,
    padding: '16px',
    backdropFilter: 'blur(3px)',
  },
  modal: {
    backgroundColor: '#ffffff',
    borderRadius: '16px',
    width: '100%',
    maxWidth: '520px',
    boxShadow: '0 20px 25px -5px rgba(0, 0, 0, 0.1), 0 10px 10px -5px rgba(0, 0, 0, 0.04)',
    overflow: 'hidden',
  },
  header: {
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'space-between',
    padding: '16px 20px',
    borderBottom: '1px solid #f3f4f6',
  },
  title: {
    margin: 0,
    fontSize: '18px',
    fontWeight: 700,
    color: '#111827',
  },
  closeBtn: {
    background: 'none',
    border: 'none',
    fontSize: '18px',
    cursor: 'pointer',
    color: '#9ca3af',
  },
  productRow: {
    display: 'flex',
    alignItems: 'center',
    gap: '12px',
    padding: '12px 20px',
    backgroundColor: '#f9fafb',
    borderBottom: '1px solid #f3f4f6',
  },
  productThumb: {
    width: '48px',
    height: '48px',
    borderRadius: '8px',
    objectFit: 'cover',
    border: '1px solid #e5e7eb',
  },
  productInfo: {
    flex: 1,
  },
  productName: {
    fontSize: '14px',
    fontWeight: 600,
    color: '#1f2937',
  },
  variantBadge: {
    fontSize: '12px',
    color: '#6b7280',
    marginTop: '2px',
  },
  errorAlert: {
    margin: '12px 20px 0',
    padding: '10px 14px',
    backgroundColor: '#fef2f2',
    color: '#dc2626',
    borderRadius: '8px',
    fontSize: '13px',
  },
  form: {
    padding: '20px',
    display: 'flex',
    flexDirection: 'column',
    gap: '16px',
  },
  ratingSection: {
    display: 'flex',
    flexDirection: 'column',
    gap: '6px',
  },
  label: {
    fontSize: '13px',
    fontWeight: 600,
    color: '#374151',
  },
  starsContainer: {
    display: 'flex',
    alignItems: 'center',
    gap: '6px',
  },
  starBtn: {
    background: 'none',
    border: 'none',
    fontSize: '28px',
    cursor: 'pointer',
    padding: '0',
    transition: 'all 0.15s ease',
  },
  ratingText: {
    marginLeft: '10px',
    fontSize: '14px',
    fontWeight: 600,
    color: '#d97706',
  },
  field: {
    display: 'flex',
    flexDirection: 'column',
    gap: '6px',
  },
  textarea: {
    padding: '12px',
    borderRadius: '8px',
    border: '1px solid #d1d5db',
    fontSize: '14px',
    resize: 'vertical',
    fontFamily: 'inherit',
    outline: 'none',
  },
  optionalText: {
    fontSize: '12px',
    color: '#9ca3af',
    fontWeight: 400,
  },
  imageInputRow: {
    display: 'flex',
    gap: '8px',
  },
  urlInput: {
    flex: 1,
    padding: '8px 12px',
    borderRadius: '8px',
    border: '1px solid #d1d5db',
    fontSize: '13px',
    outline: 'none',
  },
  addImageBtn: {
    padding: '8px 14px',
    backgroundColor: '#f3f4f6',
    color: '#374151',
    border: '1px solid #e5e7eb',
    borderRadius: '8px',
    fontSize: '13px',
    fontWeight: 600,
    cursor: 'pointer',
  },
  previewGrid: {
    display: 'flex',
    gap: '10px',
    marginTop: '6px',
  },
  imageWrapper: {
    position: 'relative',
    width: '64px',
    height: '64px',
  },
  previewImage: {
    width: '100%',
    height: '100%',
    borderRadius: '8px',
    objectFit: 'cover',
    border: '1px solid #e5e7eb',
  },
  removeImageBtn: {
    position: 'absolute',
    top: '-6px',
    right: '-6px',
    width: '18px',
    height: '18px',
    borderRadius: '50%',
    backgroundColor: '#ef4444',
    color: '#fff',
    border: 'none',
    fontSize: '11px',
    cursor: 'pointer',
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
  },
  footer: {
    display: 'flex',
    justifyContent: 'flex-end',
    gap: '10px',
    marginTop: '8px',
  },
  cancelBtn: {
    padding: '10px 18px',
    backgroundColor: '#f3f4f6',
    color: '#4b5563',
    border: 'none',
    borderRadius: '8px',
    fontWeight: 600,
    cursor: 'pointer',
  },
  submitBtn: {
    padding: '10px 20px',
    backgroundColor: '#ef4444',
    color: '#ffffff',
    border: 'none',
    borderRadius: '8px',
    fontWeight: 600,
    cursor: 'pointer',
    boxShadow: '0 2px 4px rgba(239, 68, 68, 0.25)',
  },
};
