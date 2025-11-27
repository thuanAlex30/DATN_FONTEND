export const WEATHER_CODE_LABELS: Record<number, string> = {
  0: 'Trời quang',
  1: 'Ít mây',
  2: 'Có mây',
  3: 'Nhiều mây',
  45: 'Sương mù',
  48: 'Sương giá',
  51: 'Mưa phùn nhẹ',
  53: 'Mưa phùn',
  55: 'Mưa phùn dày',
  61: 'Mưa nhẹ',
  63: 'Mưa vừa',
  65: 'Mưa to',
  71: 'Tuyết nhẹ',
  73: 'Tuyết',
  75: 'Tuyết dày',
  80: 'Mưa rào nhẹ',
  81: 'Mưa rào',
  82: 'Mưa rào mạnh',
  95: 'Dông',
  96: 'Dông kèm mưa đá',
  99: 'Dông mạnh',
};

export const getWeatherConditionLabel = (code?: number | null): string => {
  if (code === undefined || code === null) {
    return 'Đang cập nhật';
  }
  return WEATHER_CODE_LABELS[code] ?? `Mã ${code}`;
};


