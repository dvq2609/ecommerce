import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { authService, ApiError } from '../services/authService';
import type { LoginRequest, LoginResponse } from '../types/auth';

interface FormErrors {
  email?: string;
  password?: string;
  general?: string;
}

export const useLogin = (onSuccessRedirect: string = '/') => {
  const navigate = useNavigate();
  const [formData, setFormData] = useState<LoginRequest>({ email: '', password: '' });
  const [errors, setErrors] = useState<FormErrors>({});
  const [loading, setLoading] = useState(false);
  const [user, setUser] = useState<LoginResponse | null>(null);

  const validate = (): boolean => {
    const newErrors: FormErrors = {};

    if (!formData.email.trim()) {
      newErrors.email = 'Vui lòng nhập email.';
    } else if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(formData.email.trim())) {
      newErrors.email = 'Địa chỉ email không hợp lệ.';
    }

    if (!formData.password) {
      newErrors.password = 'Vui lòng nhập mật khẩu.';
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleChange = (field: keyof LoginRequest, value: string) => {
    setFormData((prev) => ({ ...prev, [field]: value }));
    // Clear individual error as the user types
    if (errors[field] || errors.general) {
      setErrors((prev) => ({ ...prev, [field]: undefined, general: undefined }));
    }
  };

  const handleSubmit = async (e?: React.FormEvent) => {
    if (e) e.preventDefault();
    if (!validate()) return;

    setLoading(true);
    setErrors({});

    try {
      const response = await authService.login({
        email: formData.email.trim(),
        password: formData.password,
      });
      setUser(response);
      navigate(onSuccessRedirect, { replace: true });
    } catch (err) {
      if (err instanceof ApiError) {
        setErrors({ general: err.message });
      } else {
        setErrors({ general: 'Không thể kết nối đến máy chủ. Vui lòng thử lại sau.' });
      }
    } finally {
      setLoading(false);
    }
  };

  return {
    formData,
    errors,
    loading,
    user,
    handleChange,
    handleSubmit,
  };
};
