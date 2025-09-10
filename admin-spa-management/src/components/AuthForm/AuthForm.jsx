import React, { useState, useEffect } from 'react';
import { authAPI } from '@/services/api';
import { saveAuthData } from '@/utils/auth';
import { formatEmailOrPhoneForDisplay } from '@/utils/formatters';
import './AuthForm.css';

const AuthForm = ({ onLogin }) => {
  const [formType, setFormType] = useState('email'); // 'email', 'phone', 'otp'
  const [formData, setFormData] = useState({
    email: '',
    password: '',
    phone: '',
    otp: ['', '', '', '', '', '']
  });
  const [showPassword, setShowPassword] = useState(false);
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);
  const [otpTimer, setOtpTimer] = useState(240); // 4 minutes = 240 seconds
  const [isTimerActive, setIsTimerActive] = useState(false);
  const [currentEmailOrPhone, setCurrentEmailOrPhone] = useState(''); // Store for OTP verification
  const [displayEmail, setDisplayEmail] = useState(''); // Store actual email from server response for display

  // Countdown timer for OTP
  useEffect(() => {
    let interval = null;
    if (isTimerActive && otpTimer > 0) {
      interval = setInterval(() => {
        setOtpTimer(timer => timer - 1);
      }, 1000);
    } else if (otpTimer === 0) {
      setIsTimerActive(false);
    }
    return () => clearInterval(interval);
  }, [isTimerActive, otpTimer]);



  const handleInputChange = (field, value) => {
    setFormData(prev => ({
      ...prev,
      [field]: value
    }));
    setError('');
  };

  const handleOtpChange = (index, value) => {
    // Handle paste event (6 digits)
    if (value.length === 6 && /^\d{6}$/.test(value)) {
      const otpArray = value.split('');
      setFormData(prev => ({
        ...prev,
        otp: otpArray
      }));
      
      // Clear any existing error when paste is successful
      setError('');
      return;
    }
    
    // Handle single digit input
    if (value.length <= 1 && /^\d*$/.test(value)) {
      const newOtp = [...formData.otp];
      newOtp[index] = value;
      setFormData(prev => ({
        ...prev,
        otp: newOtp
      }));

      // Clear error when user starts typing
      setError('');

      // Auto focus next input if current input has value
      if (value && index < 5) {
        const nextInput = document.querySelector(`input[name="otp-${index + 1}"]`);
        if (nextInput) nextInput.focus();
      }
    }
  };

  const handleOtpPaste = (e, index) => {
    e.preventDefault();
    const pastedData = e.clipboardData.getData('text');
    
    // Check if pasted data is 6 digits
    if (/^\d{6}$/.test(pastedData)) {
      const otpArray = pastedData.split('');
      setFormData(prev => ({
        ...prev,
        otp: otpArray
      }));
      
      // Clear any existing error when paste is successful
      setError('');
    } else {
      // Show error for invalid paste data
      setError('Mã OTP phải có đúng 6 số');
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    setError('');
    
    try {
      if (formType === 'email') {
        if (!formData.email || !formData.password) {
          setError('Vui lòng nhập đầy đủ thông tin');
          setLoading(false);
          return;
        }
        
        // Call request OTP API
        const response = await authAPI.requestOtp(formData.email, formData.password);
        
        console.log('Request OTP response:', response.data); // Debug log
        
        if (response.data && response.data.success) {
          // Extract data from ApiResponse wrapper
          const otpData = response.data.data;
          
          // Store email for OTP verification
          setCurrentEmailOrPhone(formData.email);
          // Store actual email from server response for display
          setDisplayEmail(otpData.email || formData.email);
          // Switch to OTP form
          setFormType('otp');
          // Set timer from response (default 4 minutes)
          const remainingSeconds = 4 * 60; // 4 minutes default
          setOtpTimer(remainingSeconds);
          setIsTimerActive(true);
          // Clear OTP inputs
          setFormData(prev => ({ ...prev, otp: ['', '', '', '', '', ''] }));
        } else {
          // Handle error response
          setError(response.data.error || response.data.message || 'Không thể gửi OTP');
        }
        
      } else if (formType === 'phone') {
        if (!formData.phone || !formData.password) {
          setError('Vui lòng nhập đầy đủ thông tin');
          setLoading(false);
          return;
        }
        
        // Use phone number as-is without country code formatting
        const phoneNumber = formData.phone;
        
        // Call request OTP API with phone
        const response = await authAPI.requestOtp(phoneNumber, formData.password);
        
        console.log('Phone Request OTP response:', response.data); // Debug log
        
        if (response.data && response.data.success) {
          // Extract data from ApiResponse wrapper
          const otpData = response.data.data;
          
          // Store phone for OTP verification
          setCurrentEmailOrPhone(phoneNumber);
          // Store actual email from server response for display (server might return email even when login with phone)
          setDisplayEmail(otpData.email || phoneNumber);
          // Switch to OTP form
          setFormType('otp');
          // Set timer from response (default 4 minutes)
          const remainingSeconds = 4 * 60; // 4 minutes default
          setOtpTimer(remainingSeconds);
          setIsTimerActive(true);
          // Clear OTP inputs
          setFormData(prev => ({ ...prev, otp: ['', '', '', '', '', ''] }));
        } else {
          // Handle error response
          setError(response.data.error || response.data.message || 'Không thể gửi OTP');
        }
        
      } else if (formType === 'otp') {
        const otpCode = formData.otp.join('');
        if (otpCode.length !== 6) {
          setError('Vui lòng nhập đầy đủ mã OTP');
          setLoading(false);
          return;
        }
        
        // Clear error if OTP is complete
        setError('');
        
        // Call verify OTP API with complete auth flow
        try {
          const result = await authAPI.verifyOtpAndLogin(currentEmailOrPhone, otpCode);
          
          console.log('OTP verification result:', result); // Debug log
          
          if (result.success) {
            console.log('Login successful, user data:', result.user); // Debug log
            // Auth data is automatically saved by verifyOtpAndLogin
            // Call success callback with user data
            onLogin(result.user);
          } else {
            console.log('Login failed:', result.message); // Debug log
            setError(result.message || 'Xác thực OTP thất bại');
          }
        } catch (otpError) {
          console.error('OTP verification exception:', otpError);
          // Handle API errors
          if (otpError.response?.status === 400) {
            setError('Mã OTP không hợp lệ hoặc đã hết hạn');
          } else if (otpError.response?.status === 401) {
            setError('Mã OTP không chính xác');
          } else {
            setError('Xác thực OTP thất bại. Vui lòng thử lại');
          }
        }
      }
    } catch (error) {
      console.error('Auth error:', error);
      
      // Handle different error cases
      if (error.response?.status === 401) {
        setError('Email/SĐT hoặc mật khẩu không chính xác');
      } else if (error.response?.status === 400) {
        const errorMessage = error.response.data?.message || error.response.data?.error;
        if (errorMessage) {
          setError(errorMessage);
        } else {
          setError('Thông tin không hợp lệ');
        }
      } else if (error.response?.status === 500) {
        setError('Lỗi server. Vui lòng thử lại sau');
      } else if (error.code === 'NETWORK_ERROR' || !error.response) {
        setError('Không thể kết nối đến server. Vui lòng kiểm tra kết nối mạng');
      } else {
        setError('Đã xảy ra lỗi. Vui lòng thử lại');
      }
    } finally {
      setLoading(false);
    }
  };

  const switchToOtp = async () => {
    if (formType === 'phone') {
      if (!formData.phone || !formData.password) {
        setError('Vui lòng nhập đầy đủ thông tin trước');
        return;
      }
      
      setLoading(true);
      setError('');
      
      try {
        // Use phone number as-is without country code formatting
        const phoneNumber = formData.phone;
        
        // Call login OTP API
        const response = await authAPI.loginOtp(phoneNumber, formData.password);
        
        console.log('Switch to OTP response:', response.data); // Debug log
        
        if (response.data && response.data.success) {
          // Extract data from ApiResponse wrapper
          const otpData = response.data.data;
          
          setCurrentEmailOrPhone(phoneNumber);
          setDisplayEmail(otpData.email || phoneNumber);
          setFormType('otp');
          const remainingSeconds = (otpData.remainingMinutes || 4) * 60;
          setOtpTimer(remainingSeconds);
          setIsTimerActive(true);
          setFormData(prev => ({ ...prev, otp: ['', '', '', '', '', ''] }));
        } else {
          setError(response.data.error || response.data.message || 'Không thể gửi OTP');
        }
      } catch (error) {
        console.error('Switch to OTP error:', error);
        if (error.response?.status === 401) {
          setError('Số điện thoại hoặc mật khẩu không chính xác');
        } else {
          setError('Không thể gửi mã OTP. Vui lòng thử lại');
        }
      } finally {
        setLoading(false);
      }
    }
  };

  const resendOtp = async () => {
    if (!currentEmailOrPhone) {
      setError('Không thể gửi lại OTP. Vui lòng đăng nhập lại');
      return;
    }
    
    setLoading(true);
    setError('');
    
    try {
      // Determine if we need password (we'll need to get it from the current form state)
      let password = formData.password;
      if (!password) {
        setError('Vui lòng nhập lại mật khẩu để gửi OTP');
        setFormType(currentEmailOrPhone.includes('@') ? 'email' : 'phone');
        setLoading(false);
        return;
      }
      
      // Resend OTP
      const response = await authAPI.loginOtp(currentEmailOrPhone, password);
      
      console.log('Resend OTP response:', response.data); // Debug log
      
      if (response.data && response.data.success) {
        // Extract data from ApiResponse wrapper
        const otpData = response.data.data;
        
        const remainingSeconds = (otpData.remainingMinutes || 4) * 60;
        setOtpTimer(remainingSeconds);
        setIsTimerActive(true);
        setFormData(prev => ({
          ...prev,
          otp: ['', '', '', '', '', '']
        }));
        // Success message will be shown by the response
      } else {
        setError(response.data.error || response.data.message || 'Không thể gửi lại OTP');
      }
    } catch (error) {
      console.error('Resend OTP error:', error);
      setError('Không thể gửi lại mã OTP. Vui lòng thử lại');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="auth-container">
      <div className="auth-form-box">
        <div className="auth-form-container">
          {/* Email Login Form */}
          {formType === 'email' && (
            <form onSubmit={handleSubmit} className="auth-form">
              <h2 className="auth-title">Đăng nhập</h2>
              <p className="auth-subtitle">
                <span 
                  className="auth-link"
                  onClick={() => setFormType('phone')}
                >
                  Đăng nhập bằng số điện thoại
                </span>
              </p>

              <div className="form-group">
                <label>Địa chỉ email</label>
                <div className="input-container">
                  <input
                    type="email"
                    placeholder="your.email@example.com"
                    value={formData.email}
                    onChange={(e) => handleInputChange('email', e.target.value)}
                    className="form-input"
                  />
                </div>
              </div>

              <div className="form-group">
                <label>
                  Mật khẩu
                  <span className="forgot-password">Quên mật khẩu?</span>
                </label>
                <div className="password-input-container">
                  <div className="input-container">

                    <input
                      type={showPassword ? 'text' : 'password'}
                      placeholder="Nhập mật khẩu"
                      value={formData.password}
                      onChange={(e) => handleInputChange('password', e.target.value)}
                      className="form-input"
                      style={{ paddingRight: '50px' }}
                    />
                    <button
                      type="button"
                      className="password-toggle"
                      onClick={() => setShowPassword(!showPassword)}
                    >
                      {showPassword ? '🙈' : '👁️'}
                    </button>
                  </div>
                </div>
              </div>

              {error && (
                <div className="error-message">
                  <span className="error-icon">⚠️</span>
                  {error}
                </div>
              )}

              <button type="submit" className="auth-submit-btn" disabled={loading}>
                {loading ? (
                  <span style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                    <span className="loading-spinner-small"></span>
                    Đang xử lý...
                  </span>
                ) : (
                  'Đăng nhập'
                )}
              </button>
            </form>
          )}

          {/* Phone Login Form */}
          {formType === 'phone' && (
            <form onSubmit={handleSubmit} className="auth-form">
              <h2 className="auth-title">Đăng nhập</h2>
              <p className="auth-subtitle">
                <span 
                  className="auth-link"
                  onClick={() => setFormType('email')}
                >
                  Đăng nhập bằng email
                </span>
              </p>

              <div className="form-group">
                <label>Số điện thoại</label>
                <div className="input-container">
                  <input
                    type="tel"
                    placeholder="Nhập số điện thoại (VD: 0397554756)"
                    value={formData.phone}
                    onChange={(e) => handleInputChange('phone', e.target.value)}
                    className="form-input"
                  />
                </div>
              </div>

              <div className="form-group">
                <label>
                  Mật khẩu
                  <span className="forgot-password">Quên mật khẩu?</span>
                </label>
                <div className="password-input-container">
                  <div className="input-container">

                    <input
                      type={showPassword ? 'text' : 'password'}
                      placeholder="Nhập mật khẩu"
                      value={formData.password}
                      onChange={(e) => handleInputChange('password', e.target.value)}
                      className="form-input"
                      style={{ paddingRight: '50px' }}
                    />
                    <button
                      type="button"
                      className="password-toggle"
                      onClick={() => setShowPassword(!showPassword)}
                    >
                      {showPassword ? '🙈' : '👁️'}
                    </button>
                  </div>
                </div>
              </div>

              {error && (
                <div className="error-message">
                  <span className="error-icon">⚠️</span>
                  {error}
                </div>
              )}

              <button type="submit" className="auth-submit-btn" disabled={loading}>
                {loading ? (
                  <span style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                    <span className="loading-spinner-small"></span>
                    Đang xử lý...
                  </span>
                ) : (
                  'Đăng nhập'
                )}
              </button>

              <button 
                type="button" 
                className="auth-sms-btn"
                onClick={switchToOtp}
                disabled={loading}
              >
                {loading ? 'Đang gửi OTP...' : 'Đăng nhập bằng mã SMS'}
              </button>
            </form>
          )}

          {/* OTP Form */}
          {formType === 'otp' && (
            <form onSubmit={handleSubmit} className="auth-form">
              <button 
                type="button"
                className="back-btn"
                onClick={() => setFormType('phone')}
              >
                ← Quay lại
              </button>

              <h2 className="auth-title">Nhập mã OTP</h2>
              <p className="auth-subtitle">
                Mã OTP được gửi về "{formatEmailOrPhoneForDisplay(displayEmail)}"
              </p>

              <div className="otp-container">
                {formData.otp.map((digit, index) => (
                  <input
                    key={index}
                    type="text"
                    name={`otp-${index}`}
                    value={digit}
                    onChange={(e) => handleOtpChange(index, e.target.value)}
                    onPaste={(e) => handleOtpPaste(e, index)}
                    onKeyDown={(e) => {
                      // Handle backspace to go to previous input
                      if (e.key === 'Backspace' && !digit && index > 0) {
                        const prevInput = document.querySelector(`input[name="otp-${index - 1}"]`);
                        if (prevInput) prevInput.focus();
                      }
                      // Handle arrow keys for navigation
                      if (e.key === 'ArrowLeft' && index > 0) {
                        const prevInput = document.querySelector(`input[name="otp-${index - 1}"]`);
                        if (prevInput) prevInput.focus();
                      }
                      if (e.key === 'ArrowRight' && index < 5) {
                        const nextInput = document.querySelector(`input[name="otp-${index + 1}"]`);
                        if (nextInput) nextInput.focus();
                      }
                    }}
                    onFocus={() => {
                      // Clear error when user focuses on any input
                      if (error) setError('');
                    }}
                    className="otp-input"
                    maxLength="1"
                    inputMode="numeric"
                    pattern="[0-9]*"
                    autoComplete="one-time-code"
                  />
                ))}
              </div>

              <div className="otp-timer">
                {isTimerActive ? (
                  <span>Mã xác nhận có hiệu lực trong <strong>{Math.floor(otpTimer / 60)}:{String(otpTimer % 60).padStart(2, '0')}</strong></span>
                ) : (
                  <span 
                    className="resend-otp"
                    onClick={resendOtp}
                  >
                    Gửi lại mã OTP
                  </span>
                )}
              </div>

              {error && (
                <div className="error-message">
                  <span className="error-icon">⚠️</span>
                  {error}
                </div>
              )}

              <button type="submit" className="auth-submit-btn" disabled={loading}>
                {loading ? (
                  <span style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                    <span className="loading-spinner-small"></span>
                    Đang xác thực...
                  </span>
                ) : (
                  'Xác nhận'
                )}
              </button>
            </form>
          )}
        </div>
      </div>
    </div>
  );
};

export default AuthForm;