import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { authService, ApiError } from '../services/authService';
import type { RegisterRequest } from '../types/auth';

interface RegisterErrors {
  fullName?: string;
  email?: string;
  phoneNumber?: string;
  password?: string;
  agreeTerms?: string;
  general?: string;
}

export const useRegister = () => {
  const navigate = useNavigate();
  const [formData, setFormData] = useState<RegisterRequest & { agreeTerms: boolean }>({
    fullName: '',
    email: '',
    phoneNumber: '',
    password: '',
    agreeTerms: false,
  });
  const [errors, setErrors] = useState<RegisterErrors>({});
  const [loading, setLoading] = useState(false);

  const validate = (): boolean => {
    const newErrors: RegisterErrors = {};

    if (!formData.fullName.trim()) {
      newErrors.fullName = 'Họ và tên là bắt buộc.';
    } else if (formData.fullName.trim().length > 100) {
      newErrors.fullName = 'Họ và tên không được vượt quá 100 ký tự.';
    }

    if (!formData.email.trim()) {
      newErrors.email = 'Email là bắt buộc.';
    } else if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(formData.email.trim())) {
      newErrors.email = 'Địa chỉ email không hợp lệ.';
    }

    if (formData.phoneNumber && formData.phoneNumber.trim()) {
      const cleanPhone = formData.phoneNumber.trim();
      if (!/^0\d{9}$/.test(cleanPhone)) {
        newErrors.phoneNumber = 'Số điện thoại phải có 10 chữ số và bắt đầu bằng 0.';
      }
    }

    if (!formData.password) {
      newErrors.password = 'Mật khẩu là bắt buộc.';
    } else if (formData.password.length < 6) {
      newErrors.password = 'Mật khẩu phải có ít nhất 6 ký tự.';
    }

    if (!formData.agreeTerms) {
      newErrors.agreeTerms = 'Bạn cần đồng ý với Điều khoản dịch vụ & Chính sách bảo mật.';
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleChange = (field: keyof typeof formData, value: string | boolean) => {
    setFormData((prev) => ({ ...prev, [field]: value }));
    if (errors[field as keyof RegisterErrors] || errors.general) {
      setErrors((prev) => ({ ...prev, [field]: undefined, general: undefined }));
    }
  };

  const handleSubmit = async (e?: React.FormEvent) => {
    if (e) e.preventDefault();
    if (!validate()) return;

    setLoading(true);
    setErrors({});

    try {
      await authService.register({
        fullName: formData.fullName.trim(),
        email: formData.email.trim(),
        phoneNumber: formData.phoneNumber?.trim() || undefined,
        password: formData.password,
      });

      // Điều hướng sang trang thông báo kiểm tra email
      navigate(`/verify-notice?email=${encodeURIComponent(formData.email.trim())}`);
    } catch (err) {
      if (err instanceof ApiError) {
        setErrors({ general: err.message });
      } else {
        setErrors({ general: 'Không thể kết nối máy chủ. Vui lòng thử lại sau.' });
      }
    } finally {
      setLoading(false);
    }
  };

  return {
    formData,
    errors,
    loading,
    handleChange,
    handleSubmit,
  };
};
