import { api } from '../config/axios';

interface SendOTPResponse {
  success: boolean;
  message: string;
  data?: {
    expiresIn: number;
  };
}

interface VerifyOTPResponse {
  success: boolean;
  message: string;
  data?: {
    token: string; // Token để reset password
  };
}

interface ResetPasswordResponse {
  success: boolean;
  message: string;
}

const forgotPasswordService = {
  /**
   * Gửi mã OTP đến email
   */
  async sendOTP(email: string): Promise<SendOTPResponse> {
    try {
      const response = await api.post('/auth/forgot-password', { email });
      return response.data;
    } catch (error: any) {
      console.error('Error sending OTP:', error);
      throw error;
    }
  },

  /**
   * Xác nhận mã OTP
   */
  async verifyOTP(email: string, otp: string): Promise<VerifyOTPResponse> {
    try {
      const response = await api.post('/auth/verify-otp', { email, otp });
      return response.data;
    } catch (error: any) {
      console.error('Error verifying OTP:', error);
      throw error;
    }
  },

  /**
   * Đặt lại mật khẩu với OTP đã xác nhận
   */
  async resetPassword(email: string, newPassword: string, otpToken: string): Promise<ResetPasswordResponse> {
    try {
      const response = await api.post('/auth/reset-password', {
        email,
        newPassword,
        otpToken
      });
      return response.data;
    } catch (error: any) {
      console.error('Error resetting password:', error);
      throw error;
    }
  }
};

export default forgotPasswordService;

