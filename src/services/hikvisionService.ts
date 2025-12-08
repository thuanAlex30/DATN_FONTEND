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

    const startTime = todayStart.toISOString().replace('Z', '+08:00');
    const endTime = todayEnd.toISOString().replace('Z', '+08:00');

    return hikvisionService.getAccessControlEvents({
      startTime,
      endTime,
      major: 5,
      minor: 0,
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
    const startTime = startDate.toISOString().replace('Z', '+08:00');
    const endTime = endDate.toISOString().replace('Z', '+08:00');

    return hikvisionService.getAccessControlEvents({
      startTime,
      endTime,
      major: 5,
      minor: 0,
      maxResults: 100 // Use 100 like Python code to avoid "Invalid Content" errors
    });
  }
};

export default hikvisionService;

