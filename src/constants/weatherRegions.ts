export type WeatherRegionCode =
  | 'hn'
  | 'dn'
  | 'hcm'
  | 'hp'
  | 'ct';

export interface WeatherRegion {
  code: WeatherRegionCode;
  name: string;
  latitude: number;
  longitude: number;
  timezone: string;
}

export const WEATHER_REGIONS: WeatherRegion[] = [
  {
    code: 'hn',
    name: 'Hà Nội',
    latitude: 21.0278,
    longitude: 105.8342,
    timezone: 'Asia/Bangkok',
  },
  {
    code: 'hcm',
    name: 'TP. Hồ Chí Minh',
    latitude: 10.8231,
    longitude: 106.6297,
    timezone: 'Asia/Bangkok',
  },
  {
    code: 'dn',
    name: 'Đà Nẵng',
    latitude: 16.0544,
    longitude: 108.2022,
    timezone: 'Asia/Bangkok',
  },
  {
    code: 'hp',
    name: 'Hải Phòng',
    latitude: 20.8449,
    longitude: 106.6881,
    timezone: 'Asia/Bangkok',
  },
  {
    code: 'ct',
    name: 'Cần Thơ',
    latitude: 10.0452,
    longitude: 105.7469,
    timezone: 'Asia/Bangkok',
  },
];

export const DEFAULT_WEATHER_REGION = WEATHER_REGIONS[2]; // Đà Nẵng

export const WEATHER_REGION_OPTIONS = WEATHER_REGIONS.map((region) => ({
  label: region.name,
  value: region.code,
}));

export const getWeatherRegionByCode = (
  code?: WeatherRegionCode,
): WeatherRegion => {
  if (!code) {
    return DEFAULT_WEATHER_REGION;
  }

  return WEATHER_REGIONS.find((region) => region.code === code) ?? DEFAULT_WEATHER_REGION;
};

