import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { HomeHeader } from '../components/home/HomeHeader';
import { authService } from '../services/authService';
import { userService } from '../services/userService';
import type { UserProfile, UserAddress, CreateAddressRequest } from '../types/user';

export const ProfilePage: React.FC = () => {
  const navigate = useNavigate();
  const [currentUser, setCurrentUser] = useState(() => authService.getCurrentUser());
  const [activeTab, setActiveTab] = useState<'profile' | 'addresses' | 'security'>('profile');

  // Profile State
  const [profile, setProfile] = useState<UserProfile | null>(null);
  const [loadingProfile, setLoadingProfile] = useState<boolean>(true);
  const [profileForm, setProfileForm] = useState({
    fullName: '',
    phoneNumber: '',
    address: '',
    imageUrl: '',
  });
  const [savingProfile, setSavingProfile] = useState(false);
  const [profileMsg, setProfileMsg] = useState<{ type: 'success' | 'error'; text: string } | null>(null);

  // Password State
  const [passwordForm, setPasswordForm] = useState({
    currentPassword: '',
    newPassword: '',
    confirmNewPassword: '',
  });
  const [savingPassword, setSavingPassword] = useState(false);
  const [passwordMsg, setPasswordMsg] = useState<{ type: 'success' | 'error'; text: string } | null>(null);

  // Address State
  const [addresses, setAddresses] = useState<UserAddress[]>([]);
  const [loadingAddresses, setLoadingAddresses] = useState<boolean>(true);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingAddressId, setEditingAddressId] = useState<number | null>(null);
  const [modalForm, setModalForm] = useState<CreateAddressRequest>({
    receiverName: '',
    receiverPhone: '',
    streetAddress: '',
    provinceCity: 'TP. Hồ Chí Minh',
    district: '',
    ward: '',
    addressType: 'Nhà riêng',
    isDefault: false,
  });
  const [modalSubmitting, setModalSubmitting] = useState(false);
  const [modalError, setModalError] = useState<string | null>(null);

  // Auth Protection
  useEffect(() => {
    if (!localStorage.getItem('accessToken')) {
      navigate('/login?redirect=/profile');
    }
  }, [navigate]);

  // Load Data
  const loadProfile = async () => {
    try {
      setLoadingProfile(true);
      const data = await userService.getProfile();
      setProfile(data);
      setProfileForm({
        fullName: data.fullName || '',
        phoneNumber: data.phoneNumber || '',
        address: data.address || '',
        imageUrl: data.imageUrl || '',
      });
    } catch (err: any) {
      console.error('Lỗi tải thông tin cá nhân:', err);
    } finally {
      setLoadingProfile(false);
    }
  };

  const loadAddresses = async () => {
    try {
      setLoadingAddresses(true);
      const res = await userService.getAddresses();
      if (res && res.data) {
        setAddresses(res.data);
      }
    } catch (err: any) {
      console.error('Lỗi tải sổ địa chỉ:', err);
    } finally {
      setLoadingAddresses(false);
    }
  };

  useEffect(() => {
    loadProfile();
    loadAddresses();
  }, []);

  // Handler: Update Profile
  const handleSaveProfile = async (e: React.FormEvent) => {
    e.preventDefault();
    setProfileMsg(null);

    if (!profileForm.fullName.trim()) {
      setProfileMsg({ type: 'error', text: 'Họ và tên không được để trống.' });
      return;
    }

    try {
      setSavingProfile(true);
      const res = await userService.updateProfile(profileForm);
      if (res.data) {
        setProfile(res.data);
        // Cập nhật lại localStorage current user nếu có
        const local = authService.getCurrentUser();
        if (local) {
          localStorage.setItem('user', JSON.stringify({ ...local, fullName: res.data.fullName }));
          setCurrentUser({ ...local, fullName: res.data.fullName });
        }
        setProfileMsg({ type: 'success', text: 'Cập nhật thông tin cá nhân thành công!' });
      }
    } catch (err: any) {
      setProfileMsg({ type: 'error', text: err.message || 'Lỗi khi cập nhật thông tin.' });
    } finally {
      setSavingProfile(false);
    }
  };

  // Handler: Change Password
  const handleChangePassword = async (e: React.FormEvent) => {
    e.preventDefault();
    setPasswordMsg(null);

    if (passwordForm.newPassword.length < 6) {
      setPasswordMsg({ type: 'error', text: 'Mật khẩu mới phải có ít nhất 6 ký tự.' });
      return;
    }
    if (passwordForm.newPassword !== passwordForm.confirmNewPassword) {
      setPasswordMsg({ type: 'error', text: 'Xác nhận mật khẩu không khớp.' });
      return;
    }

    try {
      setSavingPassword(true);
      await userService.changePassword(passwordForm);
      setPasswordMsg({ type: 'success', text: 'Đổi mật khẩu thành công! Vui lòng ghi nhớ mật khẩu mới.' });
      setPasswordForm({ currentPassword: '', newPassword: '', confirmNewPassword: '' });
    } catch (err: any) {
      setPasswordMsg({ type: 'error', text: err.message || 'Lỗi khi đổi mật khẩu.' });
    } finally {
      setSavingPassword(false);
    }
  };

  // Handler: Open Modal Create/Edit Address
  const openCreateModal = () => {
    setEditingAddressId(null);
    setModalForm({
      receiverName: profile?.fullName || '',
      receiverPhone: profile?.phoneNumber || '',
      streetAddress: '',
      provinceCity: 'TP. Hồ Chí Minh',
      district: '',
      ward: '',
      addressType: 'Nhà riêng',
      isDefault: addresses.length === 0,
    });
    setModalError(null);
    setIsModalOpen(true);
  };

  const openEditModal = (addr: UserAddress) => {
    setEditingAddressId(addr.addressId);
    setModalForm({
      receiverName: addr.receiverName,
      receiverPhone: addr.receiverPhone,
      streetAddress: addr.streetAddress,
      provinceCity: addr.provinceCity,
      district: addr.district || '',
      ward: addr.ward || '',
      addressType: addr.addressType || 'Nhà riêng',
      isDefault: addr.isDefault,
    });
    setModalError(null);
    setIsModalOpen(true);
  };

  // Handler: Save Address Modal
  const handleSaveModal = async (e: React.FormEvent) => {
    e.preventDefault();
    setModalError(null);

    if (!modalForm.receiverName.trim()) {
      setModalError('Vui lòng nhập họ tên người nhận.');
      return;
    }
    if (!/^0\d{9}$/.test(modalForm.receiverPhone.trim())) {
      setModalError('Số điện thoại phải có 10 chữ số (bắt đầu bằng 0).');
      return;
    }
    if (!modalForm.streetAddress.trim()) {
      setModalError('Vui lòng nhập địa chỉ chi tiết (số nhà, tên đường).');
      return;
    }
    if (!modalForm.provinceCity.trim()) {
      setModalError('Vui lòng nhập Tỉnh/Thành phố.');
      return;
    }

    try {
      setModalSubmitting(true);
      if (editingAddressId) {
        await userService.updateAddress(editingAddressId, modalForm);
      } else {
        await userService.createAddress(modalForm);
      }
      setIsModalOpen(false);
      await loadAddresses();
    } catch (err: any) {
      setModalError(err.message || 'Lỗi khi lưu địa chỉ.');
    } finally {
      setModalSubmitting(false);
    }
  };

  // Handler: Set Default
  const handleSetDefault = async (id: number) => {
    try {
      await userService.setDefaultAddress(id);
      await loadAddresses();
    } catch (err: any) {
      alert(err.message || 'Lỗi khi đổi địa chỉ mặc định.');
    }
  };

  // Handler: Delete Address
  const handleDeleteAddress = async (id: number) => {
    if (!confirm('Bạn có chắc chắn muốn xóa địa chỉ này?')) return;
    try {
      await userService.deleteAddress(id);
      await loadAddresses();
    } catch (err: any) {
      alert(err.message || 'Lỗi khi xóa địa chỉ.');
    }
  };

  return (
    <div style={{ minHeight: '100vh', backgroundColor: '#f7f7f7', color: '#222222', fontFamily: "'Inter', sans-serif" }}>
      <HomeHeader currentUser={currentUser} onLogout={() => { authService.logout(); navigate('/login'); }} />

      <main style={{ maxWidth: '960px', margin: '32px auto', padding: '0 20px 60px' }}>
        {/* Title */}
        <div style={{ marginBottom: '24px' }}>
          <h1 style={{ fontSize: '26px', fontWeight: 700, margin: 0, color: '#222222' }}>Tài Khoản Của Tôi</h1>
          <p style={{ fontSize: '14px', color: '#717171', margin: '4px 0 0' }}>
            Quản lý thông tin hồ sơ cá nhân và sổ địa chỉ giao hàng để thuận tiện khi thanh toán.
          </p>
        </div>

        {/* Tabs */}
        <div
          style={{
            display: 'flex',
            gap: '8px',
            borderBottom: '1px solid #ebebeb',
            marginBottom: '28px',
          }}
        >
          <button
            type="button"
            onClick={() => setActiveTab('profile')}
            style={{
              padding: '12px 18px',
              fontSize: '14px',
              fontWeight: 600,
              border: 'none',
              background: 'transparent',
              cursor: 'pointer',
              color: activeTab === 'profile' ? '#ff385c' : '#717171',
              borderBottom: activeTab === 'profile' ? '2px solid #ff385c' : '2px solid transparent',
              transition: 'all 0.2s',
            }}
          >
            Thông Tin Cá Nhân
          </button>
          <button
            type="button"
            onClick={() => setActiveTab('addresses')}
            style={{
              padding: '12px 18px',
              fontSize: '14px',
              fontWeight: 600,
              border: 'none',
              background: 'transparent',
              cursor: 'pointer',
              color: activeTab === 'addresses' ? '#ff385c' : '#717171',
              borderBottom: activeTab === 'addresses' ? '2px solid #ff385c' : '2px solid transparent',
              transition: 'all 0.2s',
              display: 'flex',
              alignItems: 'center',
              gap: '6px',
            }}
          >
            <span>Sổ Địa Chỉ Nhận Hàng</span>
            <span
              style={{
                fontSize: '11px',
                backgroundColor: activeTab === 'addresses' ? '#fff1f2' : '#f0f0f0',
                color: activeTab === 'addresses' ? '#ff385c' : '#717171',
                padding: '1px 7px',
                borderRadius: '10px',
              }}
            >
              {addresses.length}
            </span>
          </button>
          <button
            type="button"
            onClick={() => setActiveTab('security')}
            style={{
              padding: '12px 18px',
              fontSize: '14px',
              fontWeight: 600,
              border: 'none',
              background: 'transparent',
              cursor: 'pointer',
              color: activeTab === 'security' ? '#ff385c' : '#717171',
              borderBottom: activeTab === 'security' ? '2px solid #ff385c' : '2px solid transparent',
              transition: 'all 0.2s',
            }}
          >
            Bảo Mật & Mật Khẩu
          </button>
        </div>

        {/* ── TAB 1: THÔNG TIN CÁ NHÂN ── */}
        {activeTab === 'profile' && (
          <section
            style={{
              backgroundColor: '#ffffff',
              borderRadius: '16px',
              border: '1px solid #ebebeb',
              padding: '32px',
              boxShadow: '0 1px 3px rgba(0,0,0,0.02)',
            }}
          >
            <h2 style={{ fontSize: '18px', fontWeight: 600, margin: '0 0 20px', color: '#222222' }}>
              Hồ Sơ Của Bạn
            </h2>

            {profileMsg && (
              <div
                style={{
                  padding: '12px 16px',
                  borderRadius: '8px',
                  marginBottom: '20px',
                  fontSize: '13px',
                  backgroundColor: profileMsg.type === 'success' ? '#f0fdf4' : '#fef2f2',
                  color: profileMsg.type === 'success' ? '#166534' : '#991b1b',
                  border: `1px solid ${profileMsg.type === 'success' ? '#bbf7d0' : '#fecaca'}`,
                }}
              >
                {profileMsg.text}
              </div>
            )}

            {loadingProfile ? (
              <p style={{ color: '#717171', fontSize: '14px' }}>Đang tải thông tin...</p>
            ) : (
              <form onSubmit={handleSaveProfile} style={{ display: 'flex', flexDirection: 'column', gap: '18px', maxWidth: '580px' }}>
                <div>
                  <label style={{ display: 'block', fontSize: '13px', fontWeight: 600, marginBottom: '6px' }}>
                    Email đăng ký
                  </label>
                  <input
                    type="email"
                    disabled
                    value={profile?.email || ''}
                    style={{
                      width: '100%',
                      padding: '10px 14px',
                      borderRadius: '8px',
                      border: '1px solid #e2e2e2',
                      backgroundColor: '#f9f9f9',
                      color: '#717171',
                      fontSize: '14px',
                    }}
                  />
                  <span style={{ fontSize: '12px', color: '#888888', marginTop: '4px', display: 'block' }}>
                    Email là tên định danh tài khoản, không thể thay đổi.
                  </span>
                </div>

                <div>
                  <label style={{ display: 'block', fontSize: '13px', fontWeight: 600, marginBottom: '6px' }}>
                    Họ và tên <span style={{ color: '#ff385c' }}>*</span>
                  </label>
                  <input
                    type="text"
                    value={profileForm.fullName}
                    onChange={(e) => setProfileForm({ ...profileForm, fullName: e.target.value })}
                    placeholder="Nguyễn Văn A"
                    style={{
                      width: '100%',
                      padding: '10px 14px',
                      borderRadius: '8px',
                      border: '1px solid #b0b0b0',
                      fontSize: '14px',
                      outline: 'none',
                    }}
                  />
                </div>

                <div>
                  <label style={{ display: 'block', fontSize: '13px', fontWeight: 600, marginBottom: '6px' }}>
                    Số điện thoại liên hệ
                  </label>
                  <input
                    type="tel"
                    value={profileForm.phoneNumber}
                    onChange={(e) => setProfileForm({ ...profileForm, phoneNumber: e.target.value })}
                    placeholder="0987654321"
                    style={{
                      width: '100%',
                      padding: '10px 14px',
                      borderRadius: '8px',
                      border: '1px solid #b0b0b0',
                      fontSize: '14px',
                      outline: 'none',
                    }}
                  />
                </div>

                <div>
                  <label style={{ display: 'block', fontSize: '13px', fontWeight: 600, marginBottom: '6px' }}>
                    URL Ảnh đại diện (Avatar)
                  </label>
                  <input
                    type="url"
                    value={profileForm.imageUrl}
                    onChange={(e) => setProfileForm({ ...profileForm, imageUrl: e.target.value })}
                    placeholder="https://example.com/avatar.jpg"
                    style={{
                      width: '100%',
                      padding: '10px 14px',
                      borderRadius: '8px',
                      border: '1px solid #b0b0b0',
                      fontSize: '14px',
                      outline: 'none',
                    }}
                  />
                </div>

                <div style={{ marginTop: '10px' }}>
                  <button
                    type="submit"
                    disabled={savingProfile}
                    style={{
                      backgroundColor: '#ff385c',
                      color: '#ffffff',
                      border: 'none',
                      borderRadius: '8px',
                      padding: '11px 24px',
                      fontSize: '14px',
                      fontWeight: 600,
                      cursor: savingProfile ? 'not-allowed' : 'pointer',
                      opacity: savingProfile ? 0.7 : 1,
                    }}
                  >
                    {savingProfile ? 'Đang lưu...' : 'Lưu Thay Đổi'}
                  </button>
                </div>
              </form>
            )}
          </section>
        )}

        {/* ── TAB 2: SỔ ĐỊA CHỈ NHẬN HÀNG ── */}
        {activeTab === 'addresses' && (
          <section>
            <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '18px' }}>
              <div>
                <h2 style={{ fontSize: '18px', fontWeight: 600, margin: 0, color: '#222222' }}>
                  Địa Chỉ Nhận Hàng Đã Lưu
                </h2>
                <p style={{ fontSize: '13px', color: '#717171', margin: '2px 0 0' }}>
                  Địa chỉ mặc định sẽ tự động áp dụng khi bạn đặt mua hàng trên ShopVibe.
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
                <span>Thêm Địa Chỉ Mới</span>
              </button>
            </div>

            {loadingAddresses ? (
              <p style={{ color: '#717171', fontSize: '14px' }}>Đang tải sổ địa chỉ...</p>
            ) : addresses.length === 0 ? (
              <div
                style={{
                  backgroundColor: '#ffffff',
                  borderRadius: '16px',
                  border: '1px dashed #dddddd',
                  padding: '48px 24px',
                  textAlign: 'center',
                }}
              >
                <span className="material-symbols-outlined" style={{ fontSize: '42px', color: '#b0b0b0' }}>
                  home_pin
                </span>
                <p style={{ fontSize: '15px', fontWeight: 500, color: '#222222', margin: '8px 0 4px' }}>
                  Bạn chưa lưu địa chỉ nhận hàng nào
                </p>
                <p style={{ fontSize: '13px', color: '#717171', margin: '0 0 16px' }}>
                  Hãy thêm địa chỉ nhà riêng hoặc văn phòng để đặt hàng nhanh chóng mà không cần nhập lại.
                </p>
                <button
                  type="button"
                  onClick={openCreateModal}
                  style={{
                    backgroundColor: '#ff385c',
                    color: '#ffffff',
                    border: 'none',
                    borderRadius: '8px',
                    padding: '9px 20px',
                    fontSize: '13px',
                    fontWeight: 600,
                    cursor: 'pointer',
                  }}
                >
                  Thêm Địa Chỉ Ngay
                </button>
              </div>
            ) : (
              <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(360px, 1fr))', gap: '16px' }}>
                {addresses.map((addr) => (
                  <div
                    key={addr.addressId}
                    style={{
                      backgroundColor: '#ffffff',
                      borderRadius: '14px',
                      border: addr.isDefault ? '2px solid #ff385c' : '1px solid #ebebeb',
                      padding: '20px',
                      position: 'relative',
                      boxShadow: '0 1px 3px rgba(0,0,0,0.02)',
                      display: 'flex',
                      flexDirection: 'column',
                      justifyContent: 'space-between',
                    }}
                  >
                    <div>
                      {/* Top Header */}
                      <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '8px' }}>
                        <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                          <span style={{ fontSize: '15px', fontWeight: 700, color: '#222222' }}>
                            {addr.receiverName}
                          </span>
                          <span
                            style={{
                              fontSize: '11px',
                              fontWeight: 600,
                              backgroundColor: '#f3f4f6',
                              color: '#4b5563',
                              padding: '2px 8px',
                              borderRadius: '4px',
                            }}
                          >
                            {addr.addressType}
                          </span>
                        </div>
                        {addr.isDefault && (
                          <span
                            style={{
                              fontSize: '11px',
                              fontWeight: 700,
                              color: '#ff385c',
                              backgroundColor: '#fff1f2',
                              padding: '2px 8px',
                              borderRadius: '10px',
                            }}
                          >
                            Mặc định
                          </span>
                        )}
                      </div>

                      {/* Phone */}
                      <p style={{ fontSize: '13px', color: '#717171', margin: '0 0 8px' }}>
                        📞 {addr.receiverPhone}
                      </p>

                      {/* Address */}
                      <p style={{ fontSize: '14px', color: '#222222', lineHeight: '1.4', margin: 0 }}>
                        📍 {addr.fullAddress || addr.streetAddress}
                      </p>
                    </div>

                    {/* Footer Actions */}
                    <div
                      style={{
                        marginTop: '18px',
                        paddingTop: '12px',
                        borderTop: '1px solid #f2f2f2',
                        display: 'flex',
                        alignItems: 'center',
                        justifyContent: 'space-between',
                      }}
                    >
                      <div>
                        {!addr.isDefault && (
                          <button
                            type="button"
                            onClick={() => handleSetDefault(addr.addressId)}
                            style={{
                              background: 'none',
                              border: 'none',
                              padding: 0,
                              color: '#717171',
                              fontSize: '12px',
                              fontWeight: 500,
                              cursor: 'pointer',
                              textDecoration: 'underline',
                            }}
                          >
                            Thiết lập mặc định
                          </button>
                        )}
                      </div>

                      <div style={{ display: 'flex', gap: '8px' }}>
                        <button
                          type="button"
                          onClick={() => openEditModal(addr)}
                          style={{
                            background: '#ffffff',
                            border: '1px solid #dddddd',
                            borderRadius: '6px',
                            padding: '4px 10px',
                            fontSize: '12px',
                            fontWeight: 500,
                            cursor: 'pointer',
                            color: '#222222',
                          }}
                        >
                          Sửa
                        </button>
                        <button
                          type="button"
                          onClick={() => handleDeleteAddress(addr.addressId)}
                          style={{
                            background: '#ffffff',
                            border: '1px solid #fee2e2',
                            borderRadius: '6px',
                            padding: '4px 10px',
                            fontSize: '12px',
                            fontWeight: 500,
                            cursor: 'pointer',
                            color: '#dc2626',
                          }}
                        >
                          Xóa
                        </button>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </section>
        )}

        {/* ── TAB 3: BẢO MẬT & ĐỔI MẬT KHẨU ── */}
        {activeTab === 'security' && (
          <section
            style={{
              backgroundColor: '#ffffff',
              borderRadius: '16px',
              border: '1px solid #ebebeb',
              padding: '32px',
              boxShadow: '0 1px 3px rgba(0,0,0,0.02)',
              maxWidth: '580px',
            }}
          >
            <h2 style={{ fontSize: '18px', fontWeight: 600, margin: '0 0 20px', color: '#222222' }}>
              Đổi Mật Khẩu
            </h2>

            {passwordMsg && (
              <div
                style={{
                  padding: '12px 16px',
                  borderRadius: '8px',
                  marginBottom: '20px',
                  fontSize: '13px',
                  backgroundColor: passwordMsg.type === 'success' ? '#f0fdf4' : '#fef2f2',
                  color: passwordMsg.type === 'success' ? '#166534' : '#991b1b',
                  border: `1px solid ${passwordMsg.type === 'success' ? '#bbf7d0' : '#fecaca'}`,
                }}
              >
                {passwordMsg.text}
              </div>
            )}

            {!profile?.hasPassword ? (
              <div style={{ color: '#717171', fontSize: '14px', lineHeight: '1.5' }}>
                Tài khoản của bạn được đăng nhập trực tiếp qua <strong>Google OAuth</strong> nên không cần thiết lập mật khẩu riêng.
              </div>
            ) : (
              <form onSubmit={handleChangePassword} style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>
                <div>
                  <label style={{ display: 'block', fontSize: '13px', fontWeight: 600, marginBottom: '6px' }}>
                    Mật khẩu hiện tại <span style={{ color: '#ff385c' }}>*</span>
                  </label>
                  <input
                    type="password"
                    value={passwordForm.currentPassword}
                    onChange={(e) => setPasswordForm({ ...passwordForm, currentPassword: e.target.value })}
                    placeholder="••••••••"
                    required
                    style={{
                      width: '100%',
                      padding: '10px 14px',
                      borderRadius: '8px',
                      border: '1px solid #b0b0b0',
                      fontSize: '14px',
                      outline: 'none',
                    }}
                  />
                </div>

                <div>
                  <label style={{ display: 'block', fontSize: '13px', fontWeight: 600, marginBottom: '6px' }}>
                    Mật khẩu mới (tối thiểu 6 ký tự) <span style={{ color: '#ff385c' }}>*</span>
                  </label>
                  <input
                    type="password"
                    value={passwordForm.newPassword}
                    onChange={(e) => setPasswordForm({ ...passwordForm, newPassword: e.target.value })}
                    placeholder="••••••••"
                    required
                    style={{
                      width: '100%',
                      padding: '10px 14px',
                      borderRadius: '8px',
                      border: '1px solid #b0b0b0',
                      fontSize: '14px',
                      outline: 'none',
                    }}
                  />
                </div>

                <div>
                  <label style={{ display: 'block', fontSize: '13px', fontWeight: 600, marginBottom: '6px' }}>
                    Xác nhận mật khẩu mới <span style={{ color: '#ff385c' }}>*</span>
                  </label>
                  <input
                    type="password"
                    value={passwordForm.confirmNewPassword}
                    onChange={(e) => setPasswordForm({ ...passwordForm, confirmNewPassword: e.target.value })}
                    placeholder="••••••••"
                    required
                    style={{
                      width: '100%',
                      padding: '10px 14px',
                      borderRadius: '8px',
                      border: '1px solid #b0b0b0',
                      fontSize: '14px',
                      outline: 'none',
                    }}
                  />
                </div>

                <div style={{ marginTop: '10px' }}>
                  <button
                    type="submit"
                    disabled={savingPassword}
                    style={{
                      backgroundColor: '#222222',
                      color: '#ffffff',
                      border: 'none',
                      borderRadius: '8px',
                      padding: '11px 24px',
                      fontSize: '14px',
                      fontWeight: 600,
                      cursor: savingPassword ? 'not-allowed' : 'pointer',
                      opacity: savingPassword ? 0.7 : 1,
                    }}
                  >
                    {savingPassword ? 'Đang xử lý...' : 'Cập Nhật Mật Khẩu'}
                  </button>
                </div>
              </form>
            )}
          </section>
        )}

        {/* ── MODAL: THÊM / SỬA ĐỊA CHỈ NHẬN HÀNG ── */}
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
                boxShadow: '0 20px 25px -5px rgba(0,0,0,0.1)',
                overflow: 'hidden',
              }}
            >
              <div
                style={{
                  padding: '20px 24px',
                  borderBottom: '1px solid #ebebeb',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'space-between',
                }}
              >
                <h3 style={{ margin: 0, fontSize: '17px', fontWeight: 600 }}>
                  {editingAddressId ? 'Cập Nhật Địa Chỉ Nhận Hàng' : 'Thêm Địa Chỉ Nhận Hàng Mới'}
                </h3>
                <button
                  type="button"
                  onClick={() => setIsModalOpen(false)}
                  style={{ border: 'none', background: 'none', cursor: 'pointer', fontSize: '20px', color: '#717171' }}
                >
                  ✕
                </button>
              </div>

              <form onSubmit={handleSaveModal}>
                <div style={{ padding: '24px', display: 'flex', flexDirection: 'column', gap: '14px' }}>
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

                  <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '12px' }}>
                    <div>
                      <label style={{ display: 'block', fontSize: '13px', fontWeight: 600, marginBottom: '6px' }}>
                        Họ tên người nhận <span style={{ color: '#ff385c' }}>*</span>
                      </label>
                      <input
                        type="text"
                        value={modalForm.receiverName}
                        onChange={(e) => setModalForm({ ...modalForm, receiverName: e.target.value })}
                        placeholder="Nguyễn Văn A"
                        required
                        style={{ width: '100%', padding: '10px 12px', borderRadius: '8px', border: '1px solid #b0b0b0', fontSize: '14px' }}
                      />
                    </div>
                    <div>
                      <label style={{ display: 'block', fontSize: '13px', fontWeight: 600, marginBottom: '6px' }}>
                        Số điện thoại <span style={{ color: '#ff385c' }}>*</span>
                      </label>
                      <input
                        type="tel"
                        value={modalForm.receiverPhone}
                        onChange={(e) => setModalForm({ ...modalForm, receiverPhone: e.target.value })}
                        placeholder="0987654321"
                        required
                        style={{ width: '100%', padding: '10px 12px', borderRadius: '8px', border: '1px solid #b0b0b0', fontSize: '14px' }}
                      />
                    </div>
                  </div>

                  <div>
                    <label style={{ display: 'block', fontSize: '13px', fontWeight: 600, marginBottom: '6px' }}>
                      Địa chỉ chi tiết (Số nhà, tên đường, tòa nhà) <span style={{ color: '#ff385c' }}>*</span>
                    </label>
                    <input
                      type="text"
                      value={modalForm.streetAddress}
                      onChange={(e) => setModalForm({ ...modalForm, streetAddress: e.target.value })}
                      placeholder="Số 123 Đường Nguyễn Trãi"
                      required
                      style={{ width: '100%', padding: '10px 12px', borderRadius: '8px', border: '1px solid #b0b0b0', fontSize: '14px' }}
                    />
                  </div>

                  <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '12px' }}>
                    <div>
                      <label style={{ display: 'block', fontSize: '13px', fontWeight: 600, marginBottom: '6px' }}>
                        Quận / Huyện
                      </label>
                      <input
                        type="text"
                        value={modalForm.district || ''}
                        onChange={(e) => setModalForm({ ...modalForm, district: e.target.value })}
                        placeholder="Quận 1"
                        style={{ width: '100%', padding: '10px 12px', borderRadius: '8px', border: '1px solid #b0b0b0', fontSize: '14px' }}
                      />
                    </div>
                    <div>
                      <label style={{ display: 'block', fontSize: '13px', fontWeight: 600, marginBottom: '6px' }}>
                        Tỉnh / Thành phố <span style={{ color: '#ff385c' }}>*</span>
                      </label>
                      <input
                        type="text"
                        value={modalForm.provinceCity}
                        onChange={(e) => setModalForm({ ...modalForm, provinceCity: e.target.value })}
                        placeholder="TP. Hồ Chí Minh"
                        required
                        style={{ width: '100%', padding: '10px 12px', borderRadius: '8px', border: '1px solid #b0b0b0', fontSize: '14px' }}
                      />
                    </div>
                  </div>

                  <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '12px' }}>
                    <div>
                      <label style={{ display: 'block', fontSize: '13px', fontWeight: 600, marginBottom: '6px' }}>
                        Loại địa chỉ
                      </label>
                      <select
                        value={modalForm.addressType}
                        onChange={(e) => setModalForm({ ...modalForm, addressType: e.target.value })}
                        style={{ width: '100%', padding: '10px 12px', borderRadius: '8px', border: '1px solid #b0b0b0', fontSize: '14px', backgroundColor: '#fff' }}
                      >
                        <option value="Nhà riêng">Nhà riêng</option>
                        <option value="Văn phòng">Văn phòng</option>
                      </select>
                    </div>

                    <div style={{ display: 'flex', alignItems: 'center', paddingTop: '24px' }}>
                      <label style={{ display: 'flex', alignItems: 'center', gap: '8px', cursor: 'pointer', fontSize: '13px', fontWeight: 500 }}>
                        <input
                          type="checkbox"
                          checked={modalForm.isDefault}
                          onChange={(e) => setModalForm({ ...modalForm, isDefault: e.target.checked })}
                          style={{ width: '16px', height: '16px', accentColor: '#ff385c' }}
                        />
                        Đặt làm địa chỉ mặc định
                      </label>
                    </div>
                  </div>
                </div>

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
                    {modalSubmitting ? 'Đang lưu...' : editingAddressId ? 'Cập Nhật' : 'Thêm Mới'}
                  </button>
                </div>
              </form>
            </div>
          </div>
        )}

      </main>
    </div>
  );
};
