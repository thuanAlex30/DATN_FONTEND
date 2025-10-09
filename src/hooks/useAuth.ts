import { useSelector } from 'react-redux';
import type { RootState } from '../store';

export const useAuth = () => {
  const { user, accessToken, isAuthenticated } = useSelector((state: RootState) => state.auth);
  
  return {
    user,
    accessToken,
    isAuthenticated,
    isAdmin: user?.role?.role_name === 'admin',
    isEmployee: user?.role?.role_name === 'employee',
  };
};
