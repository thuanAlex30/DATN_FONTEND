import { api } from '../config/axios';

export interface AcsEventSearchParams {
  searchID?: string;
  searchResultPosition?: number;
  maxResults?: number;
  major?: number;
  minor?: number;
  startTime?: string;
  endTime?: string;
}

export interface AcsEventInfo {
  major: number;
  minor: number;
  time: string;
  netUser: string;
  remoteHostAddr: string;
  cardNo: string;
  cardType: number;
  whiteListNo: number;
  reportChannel: number;
  cardReaderKind: number;
  cardReaderNo: number;
  doorNo: number;
  verifyNo: number;
  alarmInNo: number;
  alarmOutNo: number;
  caseSensorNo: number;
  RS485No: number;
  employeeNoString?: string; // Mã nhân viên
  multiCardGroupNo?: number;
  accessChannel?: number;
  deviceNo?: number;
  distractControlNo?: number;
  localControllerID?: number;
  InternetAccess?: number;
  type?: number;
  MACAddr?: string;
  swipeCardType?: number;
  serialNo?: number;
  userType?: string;
  attendanceStatus?: string;
  statusValue?: number;
  user?: {
    id: string;
    user_id: number;
    username: string;
    full_name: string;
    email: string;
  };
}

export interface AcsEventResponse {
  AcsEvent: {
    searchID: string;
    responseStatusStrg: string;
    numOfMatches: number;
    totalMatches: number;
    InfoList: AcsEventInfo[];
  };
}

export interface HikvisionApiResponse {
  success: boolean;
  statusCode: number;
  message: string;
  data: AcsEventResponse | { events: AcsEventInfo[]; total: number };
  timestamp: string;
}

const hikvisionService = {
  /**
   * Get Access Control Events
   * @param params - Search parameters
   * @returns Promise with access control events
   */
  getAccessControlEvents: (params?: AcsEventSearchParams & { getAll?: boolean }) => {
    const queryParams = new URLSearchParams();
    
    if (params) {
      Object.entries(params).forEach(([key, value]) => {
        if (value !== undefined && value !== null) {
          queryParams.append(key, String(value));
        }
      });
    }
    
    const queryString = queryParams.toString();
    const url = `/hikvision/events${queryString ? `?${queryString}` : ''}`;
    
    return api.get<HikvisionApiResponse>(url);
  },

  /**
   * Search Access Control Events with custom parameters
   * @param searchParams - Search parameters in request body
   * @returns Promise with access control events
   */
  searchAccessControlEvents: (searchParams: AcsEventSearchParams) => {
    return api.post<HikvisionApiResponse>('/hikvision/events/search', searchParams);
  },

  /**
   * Get all access control events (with pagination)
   * @param params - Search parameters
   * @returns Promise with all access control events
   */
  getAllAccessControlEvents: (params?: AcsEventSearchParams) => {
    return hikvisionService.getAccessControlEvents({ ...params, getAll: true });
  },

  /**
   * Get today's access control events
   * @param getAll - If true, fetch all events with pagination (default: true)
   * @returns Promise with today's events
   */
  getTodayEvents: (getAll: boolean = true) => {
    const now = new Date();
    const todayStart = new Date(now.getFullYear(), now.getMonth(), now.getDate());
    const todayEnd = new Date(todayStart);
    todayEnd.setHours(23, 59, 59, 999);

    // Format timestamp without timezone to match Hikvision API format: "2025-12-13T00:00:00"
    const formatDate = (date: Date): string => {
      const year = date.getFullYear();
      const month = String(date.getMonth() + 1).padStart(2, '0');
      const day = String(date.getDate()).padStart(2, '0');
      const hours = String(date.getHours()).padStart(2, '0');
      const minutes = String(date.getMinutes()).padStart(2, '0');
      const seconds = String(date.getSeconds()).padStart(2, '0');
      return `${year}-${month}-${day}T${hours}:${minutes}:${seconds}`;
    };

    const startTime = formatDate(todayStart);
    const endTime = formatDate(todayEnd);

    return hikvisionService.getAccessControlEvents({
      startTime,
      endTime,
      major: 5,
      minor: 38, // Chỉ lấy events vân tay
      maxResults: 100, // Use 100 like Python code
      getAll // Use pagination to get all events
    });
  },

  /**
   * Get events for a specific date range
   * @param startDate - Start date
   * @param endDate - End date
   * @returns Promise with events in date range
   */
  getEventsByDateRange: (startDate: Date, endDate: Date) => {
    // Format timestamp without timezone to match Hikvision API format: "2025-12-13T00:00:00"
    const formatDate = (date: Date): string => {
      const year = date.getFullYear();
      const month = String(date.getMonth() + 1).padStart(2, '0');
      const day = String(date.getDate()).padStart(2, '0');
      const hours = String(date.getHours()).padStart(2, '0');
      const minutes = String(date.getMinutes()).padStart(2, '0');
      const seconds = String(date.getSeconds()).padStart(2, '0');
      return `${year}-${month}-${day}T${hours}:${minutes}:${seconds}`;
    };

    const startTime = formatDate(startDate);
    const endTime = formatDate(endDate);

    return hikvisionService.getAccessControlEvents({
      startTime,
      endTime,
      major: 5,
      minor: 38, // Chỉ lấy events vân tay
      maxResults: 100 // Use 100 like Python code to avoid "Invalid Content" errors
    });
  },

  /**
   * Get Access Control Events filtered by Project
   * @param projectId - Project ID
   * @param params - Search parameters
   * @returns Promise with filtered access control events
   */
  getAccessControlEventsByProject: (projectId: string, params?: AcsEventSearchParams & { getAll?: boolean }) => {
    const queryParams = new URLSearchParams();
    
    if (params) {
      Object.entries(params).forEach(([key, value]) => {
        if (value !== undefined && value !== null) {
          queryParams.append(key, String(value));
        }
      });
    }
    
    const queryString = queryParams.toString();
    const url = `/hikvision/events/project/${projectId}${queryString ? `?${queryString}` : ''}`;
    
    return api.get<HikvisionApiResponse>(url);
  }
};

export default hikvisionService;

