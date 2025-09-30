/**
 * Data mapping utilities for frontend-backend integration
 * Provides one-way mapping from backend to frontend for Employee pages
 */

// Generic mapping helpers
export const mapId = (item: any): string => item?.id || item?._id || '';

export const mapUser = (user: any) => ({
  id: mapId(user),
  full_name: user?.full_name || user?.name || '',
  email: user?.email || '',
  role: user?.role?.role_name || user?.role || 'employee'
});

export const mapDate = (date: any): string => {
  if (!date) return '';
  return new Date(date).toISOString().split('T')[0];
};

export const mapStatus = (status: any, defaultStatus: string = 'active'): string => {
  return (status || '').toString().toLowerCase() || defaultStatus;
};

// PPE specific mapping
export const mapPPEIssuance = (item: any) => ({
  id: mapId(item),
  user_id: mapId(item.user_id),
  ppe_item_id: mapId(item.ppe_item_id),
  issued_date: mapDate(item.issued_date),
  expected_return_date: mapDate(item.expected_return_date),
  actual_return_date: mapDate(item.actual_return_date),
  status: mapStatus(item.status, 'issued'),
  condition: mapStatus(item.condition, 'good'),
  notes: item?.notes || '',
  created_at: mapDate(item.created_at),
  updated_at: mapDate(item.updated_at)
});

// Training specific mapping
export const mapCourse = (item: any) => ({
  id: mapId(item),
  course_name: item?.course_name || item?.name || '',
  description: item?.description || '',
  duration: item?.duration || 0,
  is_mandatory: Boolean(item?.is_mandatory),
  created_at: mapDate(item.created_at),
  updated_at: mapDate(item.updated_at)
});

export const mapTrainingSession = (item: any) => ({
  id: mapId(item),
  course_id: mapId(item.course_id),
  session_name: item?.session_name || item?.name || '',
  start_date: mapDate(item.start_date),
  end_date: mapDate(item.end_date),
  status: mapStatus(item.status, 'scheduled'),
  max_participants: item?.max_participants || 0,
  current_participants: item?.current_participants || 0,
  created_at: mapDate(item.created_at),
  updated_at: mapDate(item.updated_at)
});

export const mapEnrollment = (item: any) => ({
  id: mapId(item),
  user_id: mapId(item.user_id),
  session_id: mapId(item.session_id),
  status: mapStatus(item.status, 'enrolled'),
  enrolled_date: mapDate(item.enrolled_date),
  completed_date: mapDate(item.completed_date),
  score: item?.score || null,
  created_at: mapDate(item.created_at),
  updated_at: mapDate(item.updated_at)
});

// Incident specific mapping
export const mapIncident = (item: any) => ({
  id: mapId(item),
  title: item?.title || '',
  description: item?.description || '',
  location: item?.location || '',
  severity: mapStatus(item.severity, 'low'),
  status: mapStatus(item.status, 'reported'),
  reported_by: mapId(item.reported_by),
  images: Array.isArray(item?.images) ? item.images : [],
  created_at: mapDate(item.created_at),
  updated_at: mapDate(item.updated_at)
});

// Generic array mapping
export const mapArray = <T>(items: any[], mapper: (item: any) => T): T[] => {
  if (!Array.isArray(items)) return [];
  return items.map(mapper);
};

// API response mapping
export const mapApiResponse = <T>(response: any, mapper: (item: any) => T) => {
  const data = response?.data;
  if (Array.isArray(data)) {
    return { ...response, data: data.map(mapper) };
  }
  return { ...response, data: data ? mapper(data) : null };
};
