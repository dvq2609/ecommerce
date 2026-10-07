import { useState } from 'react';
import { authService, ApiError } from '../services/authService';

export const useForgotPassword = () => {
  const [email, setEmail] = useState('');
  const [error, setError] = useState<string | null>(null);
  const [successMessage, setSuccessMessage] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);

  const handleSubmit = async (e?: React.FormEvent) => {
    if (e) e.preventDefault();
    if (!email.trim()) {
      setError('Vui lòng nhập địa chỉ email.');
      return;
    }
    if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email.trim())) {
      setError('Địa chỉ email không hợp lệ.');
      return;
    }

    setLoading(true);
    setError(null);
    setSuccessMessage(null);

    try {
      const response = await authService.forgotPassword({ email: email.trim() });
      setSuccessMessage(response.message || 'Link đặt lại mật khẩu đã được gửi đến email của bạn.');
    } catch (err) {
      if (err instanceof ApiError) {
        setError(err.message);
      } else {
        setError('Không thể gửi yêu cầu đặt lại mật khẩu. Vui lòng thử lại sau.');
      }
    } finally {
      setLoading(false);
    }
  };

  return {
    email,
    setEmail: (val: string) => {
      setEmail(val);
      if (error) setError(null);
    },
    error,
    successMessage,
    loading,
    handleSubmit,
  };
};
