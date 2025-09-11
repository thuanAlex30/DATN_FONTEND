import { useState } from 'react';
import type { FormEvent, ChangeEvent } from 'react';
import authService from '../../services/authService';

interface LoginFormProps {
  onLoginSuccess?: () => void;
}

export default function LoginForm({ onLoginSuccess }: LoginFormProps) {
  const [email, setEmail] = useState<string>('');
  const [password, setPassword] = useState<string>('');
  const [rememberMe, setRememberMe] = useState<boolean>(false);
  const [showPassword, setShowPassword] = useState<boolean>(false);
  const [loading, setLoading] = useState<boolean>(false);
  const [error, setError] = useState<string>('');

  const handleSubmit = async (e: FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    setLoading(true);
    setError('');

    if (!email || !password) {
      setError('Vui lòng nhập đầy đủ email và mật khẩu');
      setLoading(false);
      return;
    }

    try {
      const result = await authService.login({ 
        username: email,
        password 
      });

      if (result.success) {
        if (rememberMe) {
          localStorage.setItem('rememberMe', 'true');
        } else {
          localStorage.removeItem('rememberMe');
        }
        
        // Call the callback to notify parent component
        if (onLoginSuccess) {
          onLoginSuccess();
        } else {
          // Fallback to window.location if no callback provided
          window.location.href = '/dashboard';
        }
      } else {
        setError(result.message || 'Đăng nhập thất bại');
      }
    } catch (err) {
      console.error('Login error:', err);
      setError('Đã xảy ra lỗi không mong muốn. Vui lòng thử lại.');
    } finally {
      setLoading(false);
    }
  };

  const handleForgotPassword = async () => {
    if (!email) {
      setError('Vui lòng nhập email để khôi phục mật khẩu');
      return;
    }

    try {
      const result = await authService.forgotPassword(email);
      if (result.success) {
        alert('Email khôi phục mật khẩu đã được gửi!');
        setError('');
      } else {
        setError(result.message || 'Gửi email thất bại');
      }
    } catch (error) {
      console.error('Forgot password error:', error);
      setError('Không thể gửi email khôi phục. Vui lòng thử lại.');
    }
  };

  const handleRegister = () => {
    window.location.href = '/register';
  };

  return (
    <div className="min-h-screen bg-gray-50 flex items-center justify-center p-4">
      <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-8 w-full max-w-md">
        {/* Logo */}
        <div className="text-center mb-8">
          <div className="text-2xl font-bold text-black mb-3">
            <span className="inline-block mr-1">✱</span>
            <span className="font-script">logo</span>
          </div>
          <h1 className="text-xl font-bold text-black mb-2">Chào mừng trở lại!</h1>
          <p className="text-gray-500 text-sm">Đăng nhập vào tài khoản của bạn để tiếp tục.</p>
        </div>

        {/* Error Message */}
        {error && (
          <div className="bg-red-50 border border-red-200 text-red-700 px-4 py-3 rounded-lg text-sm mb-4">
            <div className="flex items-center">
              <svg className="w-4 h-4 mr-2" fill="currentColor" viewBox="0 0 20 20">
                <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zM8.707 7.293a1 1 0 00-1.414 1.414L8.586 10l-1.293 1.293a1 1 0 101.414 1.414L10 11.414l1.293 1.293a1 1 0 001.414-1.414L11.414 10l1.293-1.293a1 1 0 00-1.414-1.414L10 8.586 8.707 7.293z" clipRule="evenodd" />
              </svg>
              {error}
            </div>
          </div>
        )}

        {/* Form */}
        <form onSubmit={handleSubmit} className="space-y-4">
          {/* Email Input */}
          <div>
            <label className="block text-sm font-medium text-black mb-2">Địa chỉ Email</label>
            <input
              type="email"
              value={email}
              onChange={(e: ChangeEvent<HTMLInputElement>) => setEmail(e.target.value)}
              placeholder="tennguoidung@example.com"
              className="w-full px-4 py-3 border border-gray-300 rounded-md focus:ring-2 focus:ring-blue-500 focus:border-blue-500 outline-none transition-colors placeholder-gray-400"
              required
              disabled={loading}
            />
          </div>

          {/* Password Input */}
          <div>
            <label className="block text-sm font-medium text-black mb-2">Mật khẩu</label>
            <div className="relative">
              <input
                type={showPassword ? 'text' : 'password'}
                value={password}
                onChange={(e: ChangeEvent<HTMLInputElement>) => setPassword(e.target.value)}
                placeholder="••••••••"
                className="w-full px-4 py-3 border border-gray-300 rounded-md focus:ring-2 focus:ring-blue-500 focus:border-blue-500 outline-none transition-colors pr-12 placeholder-gray-400"
                required
                disabled={loading}
              />
              <button
                type="button"
                onClick={() => setShowPassword(!showPassword)}
                className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-500 hover:text-gray-700"
                disabled={loading}
                aria-label={showPassword ? 'Ẩn mật khẩu' : 'Hiện mật khẩu'}
              >
                {showPassword ? (
                  <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13.875 18.825A10.05 10.05 0 0112 19c-4.478 0-8.268-2.943-9.543-7a9.97 9.97 0 011.563-3.029m5.858.908a3 3 0 114.243 4.243M9.878 9.878l4.242 4.242M9.878 9.878L6.5 6.5m3.378 3.378a3 3 0 004.243 4.243M12 3c4.478 0 8.268 2.943 9.543 7a10.025 10.025 0 01-4.132 5.411m0 0L21 21l-6-6m0 0l-6-6" />
                  </svg>
                ) : (
                  <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" />
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M2.458 12C3.732 7.943 7.523 5 12 5c4.478 0 8.268 2.943 9.542 7-1.274 4.057-5.064 7-9.542 7-4.477 0-8.268-2.943-9.542-7z" />
                  </svg>
                )}
              </button>
            </div>
          </div>

          {/* Remember Me & Forgot Password */}
          <div className="flex items-center justify-between">
            <label className="inline-flex items-center select-none">
              <input
                id="remember-me"
                type="checkbox"
                checked={rememberMe}
                onChange={(e: ChangeEvent<HTMLInputElement>) => setRememberMe(e.target.checked)}
                className="h-4 w-4 text-blue-600 focus:ring-blue-500 border-gray-300 rounded"
                disabled={loading}
              />
              <span className="ml-2 text-sm text-black">Nhớ tôi</span>
            </label>
            <button
              type="button"
              onClick={handleForgotPassword}
              className="text-sm text-blue-600 hover:text-blue-800 hover:underline"
              disabled={loading}
            >
              Quên mật khẩu?
            </button>
          </div>

          {/* Login Button */}
          <button
            type="submit"
            disabled={loading || !email || !password}
            className={`w-full py-3 px-4 rounded-md font-medium flex items-center justify-center transition-colors ${
              loading || !email || !password
                ? 'bg-gray-300 text-gray-600 cursor-not-allowed'
                : 'bg-blue-600 text-white hover:bg-blue-700'
            }`}
          >
            {loading ? (
              <>
                <svg className="animate-spin -ml-1 mr-2 h-5 w-5 text-white" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                  <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                  <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                </svg>
                <span>Đang đăng nhập...</span>
              </>
            ) : (
              'Đăng nhập'
            )}
          </button>
        </form>

        {/* Register Link */}
        <div className="mt-6 text-center">
          <span className="text-sm text-gray-500">Chưa có tài khoản? </span>
          <button
            onClick={handleRegister}
            className="text-sm text-blue-600 hover:text-blue-800 hover:underline font-medium"
            disabled={loading}
          >
            Đăng ký
          </button>
        </div>
      </div>
    </div>
  );
} 