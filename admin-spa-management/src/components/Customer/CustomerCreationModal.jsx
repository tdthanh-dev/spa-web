import React from 'react';
import { useCustomerCreationModal } from '@/hooks';

const CustomerCreationModal = ({
  isOpen,
  onClose,
  onCustomerCreated,
  leadData = null,
}) => {
  const {
    formData,
    validation,
    loading,
    error,
    handleInputChange,
    handleSubmit,
    handleClose,
  } = useCustomerCreationModal(leadData, onCustomerCreated, onClose);

  if (!isOpen) return null;

  const inputBase =
    'w-full px-3 py-2 rounded-lg border focus:outline-none focus:ring-2 focus:ring-primary-500 focus:border-transparent transition';
  const labelBase = 'block text-sm font-medium text-black-700';
  const sectionCard =
    'rounded-2xl border border-primary-100 bg-white/80 backdrop-blur-sm p-5';

  return (
    <div
      className="fixed inset-0 z-[100] flex items-start justify-center p-4 sm:p-6 bg-black/50 backdrop-blur-sm overflow-y-auto"
      onClick={handleClose}
      role="dialog"
      aria-modal="true"
    >
      <div
        className="bg-white shadow-2xl w-full max-w-[960px] rounded-2xl flex flex-col"
        style={{ maxHeight: '90vh' }}
        onClick={(e) => e.stopPropagation()}
      >
        {/* Header (sticky) */}
        <div className="sticky top-0 z-10 flex items-center justify-between px-6 py-4 border-b border-primary-100 bg-primary-50/80 backdrop-blur">
          <h2 className="text-lg sm:text-xl font-bold text-black-900 flex items-center gap-2">
            <span className="text-xl">🆕</span>
            Tạo khách hàng mới
          </h2>
          <button
            className="p-2 rounded-lg text-black-700 hover:bg-black-50 transition"
            onClick={handleClose}
            disabled={loading}
            title="Đóng"
          >
            <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
            </svg>
          </button>
        </div>

        {/* Body (scroll) */}
        <div className="flex-1 overflow-y-auto px-6 py-5">
          {error && (
            <div className="mb-5 p-3 rounded-xl border border-error-200 bg-error-50 text-error-700 text-sm flex items-center gap-2">
              <span>⚠️</span>
              <span>{error}</span>
            </div>
          )}

          <form onSubmit={handleSubmit} className="space-y-5">
            {/* Thông tin cơ bản */}
            <section className={sectionCard}>
              <h3 className="text-base font-semibold text-black-900 mb-3 flex items-center gap-2">
                <span className="text-lg">👤</span>
                Thông tin cơ bản
              </h3>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div className="space-y-1.5">
                  <label htmlFor="fullName" className={labelBase}>
                    Họ và tên <span className="text-error-500">*</span>
                  </label>
                  <input
                    id="fullName"
                    type="text"
                    value={formData.fullName}
                    onChange={(e) => handleInputChange('fullName', e.target.value)}
                    placeholder="Nhập họ và tên"
                    className={`${inputBase} ${
                      validation.fullName ? 'border-error-300 bg-error-50' : 'border-black-200'
                    }`}
                    disabled={loading}
                    required
                  />
                  {validation.fullName && (
                    <p className="text-error-600 text-xs">{validation.fullName}</p>
                  )}
                </div>

                <div className="space-y-1.5">
                  <label htmlFor="phone" className={labelBase}>
                    Số điện thoại <span className="text-error-500">*</span>
                  </label>
                  <input
                    id="phone"
                    type="tel"
                    value={formData.phone}
                    onChange={(e) => handleInputChange('phone', e.target.value)}
                    placeholder="0987654321"
                    className={`${inputBase} ${
                      validation.phone ? 'border-error-300 bg-error-50' : 'border-black-200'
                    }`}
                    disabled={loading}
                    required
                  />
                  {validation.phone && (
                    <p className="text-error-600 text-xs">{validation.phone}</p>
                  )}
                </div>

                <div className="space-y-1.5 md:col-span-2">
                  <label htmlFor="email" className={labelBase}>
                    Email
                  </label>
                  <input
                    id="email"
                    type="email"
                    value={formData.email}
                    onChange={(e) => handleInputChange('email', e.target.value)}
                    placeholder="example@email.com"
                    className={`${inputBase} ${
                      validation.email ? 'border-error-300 bg-error-50' : 'border-black-200'
                    }`}
                    disabled={loading}
                  />
                  {validation.email && (
                    <p className="text-error-600 text-xs">{validation.email}</p>
                  )}
                </div>
              </div>
            </section>

            {/* Thông tin cá nhân */}
            <section className={sectionCard}>
              <h3 className="text-base font-semibold text-black-900 mb-3 flex items-center gap-2">
                <span className="text-lg">🎂</span>
                Thông tin cá nhân
              </h3>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div className="space-y-1.5">
                  <label htmlFor="dob" className={labelBase}>
                    Ngày sinh
                  </label>
                  <input
                    id="dob"
                    type="date"
                    value={formData.dob}
                    onChange={(e) => handleInputChange('dob', e.target.value)}
                    className={`${inputBase} ${
                      validation.dob ? 'border-error-300 bg-error-50' : 'border-black-200'
                    }`}
                    disabled={loading}
                    max={new Date().toISOString().split('T')[0]}
                  />
                  {validation.dob && (
                    <p className="text-error-600 text-xs">{validation.dob}</p>
                  )}
                </div>

                <div className="space-y-1.5">
                  <label htmlFor="gender" className={labelBase}>
                    Giới tính
                  </label>
                  <select
                    id="gender"
                    value={formData.gender}
                    onChange={(e) => handleInputChange('gender', e.target.value)}
                    className={`${inputBase} border-black-200`}
                    disabled={loading}
                  >
                    <option value="FEMALE">Nữ</option>
                    <option value="MALE">Nam</option>
                  </select>
                </div>

                <div className="space-y-1.5 md:col-span-2">
                  <label htmlFor="address" className={labelBase}>
                    Địa chỉ
                  </label>
                  <input
                    id="address"
                    type="text"
                    value={formData.address}
                    onChange={(e) => handleInputChange('address', e.target.value)}
                    placeholder="Nhập địa chỉ"
                    className={`${inputBase} ${
                      validation.address ? 'border-error-300 bg-error-50' : 'border-black-200'
                    }`}
                    disabled={loading}
                  />
                  {validation.address && (
                    <p className="text-error-600 text-xs">{validation.address}</p>
                  )}
                </div>
              </div>
            </section>

            {/* Thông tin bổ sung */}
            <section className={sectionCard}>
              <h3 className="text-base font-semibold text-black-900 mb-3 flex items-center gap-2">
                <span className="text-lg">📝</span>
                Thông tin bổ sung
              </h3>

              <div className="space-y-4">
                <div className="space-y-1.5">
                  <label htmlFor="notes" className={labelBase}>
                    Ghi chú
                  </label>
                  <textarea
                    id="notes"
                    rows={3}
                    value={formData.notes}
                    onChange={(e) => handleInputChange('notes', e.target.value)}
                    placeholder="Nhập ghi chú về khách hàng..."
                    className={`${inputBase} border-black-200 resize-none`}
                    disabled={loading}
                  />
                </div>

                <label htmlFor="isVip" className="flex items-center gap-3 cursor-pointer">
                  <input
                    id="isVip"
                    type="checkbox"
                    checked={formData.isVip}
                    onChange={(e) => handleInputChange('isVip', e.target.checked)}
                    className="w-4 h-4 rounded border-black-300 text-primary-600 focus:ring-primary-500"
                    disabled={loading}
                  />
                  <span className="text-sm font-medium text-black-800 flex items-center gap-2">
                    <span className="text-base">👑</span> Khách hàng VIP
                  </span>
                </label>
              </div>
            </section>
          </form>
        </div>

        {/* Footer (sticky) */}
        <div className="sticky bottom-0 z-10 flex items-center justify-end gap-3 px-6 py-4 border-t border-primary-100 bg-white/95 backdrop-blur">
          <button
            type="button"
            className="px-4 py-2 rounded-xl bg-white text-black-800 ring-1 ring-black-200 hover:bg-black-50 transition disabled:opacity-60"
            onClick={handleClose}
            disabled={loading}
          >
            Hủy
          </button>
          <button
            type="submit"
            className="px-4 py-2 rounded-xl bg-primary-500 text-white hover:bg-primary-600 transition disabled:opacity-60 disabled:cursor-not-allowed inline-flex items-center gap-2"
            onClick={handleSubmit}
            disabled={loading || !formData.fullName || !formData.phone}
          >
            {loading ? (
              <>
                <svg className="animate-spin -ml-1 mr-2 h-4 w-4" fill="none" viewBox="0 0 24 24">
                  <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
                  <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z" />
                </svg>
                Đang tạo...
              </>
            ) : (
              <>
                <span>✅</span> Tạo khách hàng
              </>
            )}
          </button>
        </div>
      </div>
    </div>
  );
};

export default CustomerCreationModal;
