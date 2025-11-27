import { useCallback, useMemo, useState } from 'react';

export type LocationPermissionState =
  | 'prompt'
  | 'granted'
  | 'denied'
  | 'unsupported'
  | 'unknown';

export interface BrowserLocation {
  latitude: number;
  longitude: number;
  accuracy?: number;
  timezone?: string;
  timestamp: number;
}

export interface UseBrowserLocationResult {
  coords: BrowserLocation | null;
  permission: LocationPermissionState;
  loading: boolean;
  error: string | null;
  requestLocation: () => void;
  hasLocation: boolean;
}

const resolveTimezone = () => {
  try {
    return Intl.DateTimeFormat().resolvedOptions().timeZone;
  } catch {
    return undefined;
  }
};

export const useBrowserLocation = (): UseBrowserLocationResult => {
  const [coords, setCoords] = useState<BrowserLocation | null>(null);
  const [permission, setPermission] =
    useState<LocationPermissionState>('unknown');
  const [loading, setLoading] = useState<boolean>(false);
  const [error, setError] = useState<string | null>(null);

  const requestLocation = useCallback(() => {
    if (!('geolocation' in navigator)) {
      setPermission('unsupported');
      setError('Trình duyệt không hỗ trợ chia sẻ vị trí.');
      return;
    }

    setLoading(true);
    setError(null);

    navigator.geolocation.getCurrentPosition(
      (position) => {
        setPermission('granted');
        setCoords({
          latitude: position.coords.latitude,
          longitude: position.coords.longitude,
          accuracy: position.coords.accuracy,
          timezone: resolveTimezone(),
          timestamp: position.timestamp,
        });
        setLoading(false);
      },
      (err) => {
        if (err.code === err.PERMISSION_DENIED) {
          setPermission('denied');
          setError('Bạn đã từ chối quyền truy cập vị trí.');
        } else {
          setPermission('prompt');
          setError('Không thể lấy vị trí hiện tại.');
        }
        setLoading(false);
      },
      { enableHighAccuracy: true, timeout: 10000, maximumAge: 5 * 60 * 1000 },
    );
  }, []);

  const hasLocation = useMemo(() => coords !== null, [coords]);

  return {
    coords,
    permission,
    loading,
    error,
    requestLocation,
    hasLocation,
  };
};

export default useBrowserLocation;


