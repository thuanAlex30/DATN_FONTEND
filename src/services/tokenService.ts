import { api } from '../config/axios';
import type { AxiosResponse } from 'axios';

interface RefreshTokenResponse {
  data: {
    data: {
      tokens: {
        accessToken: string;
        refreshToken: string;
      };
    };
  };
}

export const refreshTokenService = async (refreshToken: string): Promise<RefreshTokenResponse> => {
  return api.post('/auth/refresh-token', { refreshToken });
};

export const logoutService = async (): Promise<void> => {
  return api.post('/auth/logout');
};
