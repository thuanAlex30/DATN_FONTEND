// Project Management Constants

export const PROJECT_STATUS = {
  PLANNING: 'PLANNING',
  ACTIVE: 'ACTIVE',
  COMPLETED: 'COMPLETED',
  CANCELLED: 'CANCELLED',
  ON_HOLD: 'ON_HOLD'
} as const;

export const PROJECT_STATUS_LABELS = {
  [PROJECT_STATUS.PLANNING]: 'Đang lập kế hoạch',
  [PROJECT_STATUS.ACTIVE]: 'Đang thực hiện',
  [PROJECT_STATUS.COMPLETED]: 'Hoàn thành',
  [PROJECT_STATUS.CANCELLED]: 'Đã hủy',
  [PROJECT_STATUS.ON_HOLD]: 'Tạm dừng'
} as const;

export const PROJECT_STATUS_COLORS = {
  [PROJECT_STATUS.PLANNING]: 'blue',
  [PROJECT_STATUS.ACTIVE]: 'green',
  [PROJECT_STATUS.COMPLETED]: 'success',
  [PROJECT_STATUS.CANCELLED]: 'red',
  [PROJECT_STATUS.ON_HOLD]: 'orange'
} as const;

export const PROJECT_PRIORITY = {
  LOW: 'LOW',
  MEDIUM: 'MEDIUM',
  HIGH: 'HIGH',
  URGENT: 'URGENT'
} as const;

export const PROJECT_PRIORITY_LABELS = {
  [PROJECT_PRIORITY.LOW]: 'Thấp',
  [PROJECT_PRIORITY.MEDIUM]: 'Trung bình',
  [PROJECT_PRIORITY.HIGH]: 'Cao',
  [PROJECT_PRIORITY.URGENT]: 'Khẩn cấp'
} as const;

export const PROJECT_PRIORITY_COLORS = {
  [PROJECT_PRIORITY.LOW]: 'green',
  [PROJECT_PRIORITY.MEDIUM]: 'blue',
  [PROJECT_PRIORITY.HIGH]: 'orange',
  [PROJECT_PRIORITY.URGENT]: 'red'
} as const;

export const PROJECT_TYPE = {
  CONSTRUCTION: 'CONSTRUCTION',
  MAINTENANCE: 'MAINTENANCE',
  RENOVATION: 'RENOVATION',
  INSPECTION: 'INSPECTION',
  SAFETY: 'SAFETY',
  TRAINING: 'TRAINING'
} as const;

export const PROJECT_TYPE_LABELS = {
  [PROJECT_TYPE.CONSTRUCTION]: 'Xây dựng',
  [PROJECT_TYPE.MAINTENANCE]: 'Bảo trì',
  [PROJECT_TYPE.RENOVATION]: 'Cải tạo',
  [PROJECT_TYPE.INSPECTION]: 'Kiểm tra',
  [PROJECT_TYPE.SAFETY]: 'An toàn',
  [PROJECT_TYPE.TRAINING]: 'Đào tạo'
} as const;

export const ROLE_IN_PROJECT = {
  PROJECT_MANAGER: 'PROJECT_MANAGER',
  TEAM_LEADER: 'TEAM_LEADER',
  DEVELOPER: 'DEVELOPER',
  DESIGNER: 'DESIGNER',
  TESTER: 'TESTER',
  ANALYST: 'ANALYST',
  CONSULTANT: 'CONSULTANT',
  OBSERVER: 'OBSERVER'
} as const;

export const ROLE_IN_PROJECT_LABELS = {
  [ROLE_IN_PROJECT.PROJECT_MANAGER]: 'Quản lý dự án',
  [ROLE_IN_PROJECT.TEAM_LEADER]: 'Trưởng nhóm',
  [ROLE_IN_PROJECT.DEVELOPER]: 'Phát triển',
  [ROLE_IN_PROJECT.DESIGNER]: 'Thiết kế',
  [ROLE_IN_PROJECT.TESTER]: 'Kiểm thử',
  [ROLE_IN_PROJECT.ANALYST]: 'Phân tích',
  [ROLE_IN_PROJECT.CONSULTANT]: 'Tư vấn',
  [ROLE_IN_PROJECT.OBSERVER]: 'Quan sát'
} as const;

export const ASSIGNMENT_STATUS = {
  ACTIVE: 'active',
  INACTIVE: 'inactive',
  COMPLETED: 'completed'
} as const;

export const ASSIGNMENT_STATUS_LABELS = {
  [ASSIGNMENT_STATUS.ACTIVE]: 'Hoạt động',
  [ASSIGNMENT_STATUS.INACTIVE]: 'Không hoạt động',
  [ASSIGNMENT_STATUS.COMPLETED]: 'Hoàn thành'
} as const;

export const ASSIGNMENT_STATUS_COLORS = {
  [ASSIGNMENT_STATUS.ACTIVE]: 'green',
  [ASSIGNMENT_STATUS.INACTIVE]: 'red',
  [ASSIGNMENT_STATUS.COMPLETED]: 'blue'
} as const;

// Validation constants
export const VALIDATION_RULES = {
  PROJECT_NAME_MIN_LENGTH: 3,
  PROJECT_NAME_MAX_LENGTH: 100,
  DESCRIPTION_MIN_LENGTH: 10,
  DESCRIPTION_MAX_LENGTH: 500,
  MAX_PROJECT_DURATION_DAYS: 1825, // 5 years
  MIN_PROGRESS: 0,
  MAX_PROGRESS: 100
} as const;

// API endpoints
export const API_ENDPOINTS = {
  PROJECTS: '/api/projects',
  PROJECT_BY_ID: (id: string) => `/api/projects/${id}`,
  PROJECT_MEMBERS: (id: string) => `/api/projects/${id}/members`,
  PROJECT_LEADERS: (id: string) => `/api/projects/${id}/leaders`,
  PROJECT_MILESTONES: (id: string) => `/api/projects/${id}/milestones`,
  PROJECT_RISKS: (id: string) => `/api/projects/${id}/risks`,
  SITES: '/api/sites',
  USERS: '/api/users'
} as const;

// Default values
export const DEFAULT_VALUES = {
  PROJECT_PRIORITY: PROJECT_PRIORITY.MEDIUM,
  PROJECT_TYPE: PROJECT_TYPE.CONSTRUCTION,
  PROJECT_STATUS: PROJECT_STATUS.PLANNING,
  PROGRESS: 0,
} as const;
