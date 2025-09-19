import { useCallback } from 'react';
import { useNavigate } from 'react-router-dom';

export const useSafeNavigate = () => {
  const navigate = useNavigate();

  const safeNavigate = useCallback((path: string, options?: { replace?: boolean }) => {
    // Use requestAnimationFrame to ensure DOM is ready
    requestAnimationFrame(() => {
      navigate(path, options);
    });
  }, [navigate]);

  return safeNavigate;
};
