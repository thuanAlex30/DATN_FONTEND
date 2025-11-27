export interface ProjectMessage {
  _id: string;
  id: string;
  project_id: string;
  sender_id: string;
  sender_name: string;
  content: string;
  message_type: 'TEXT' | 'IMAGE' | 'FILE' | 'SYSTEM';
  reply_to?: string;
  attachments?: string[];
  created_at: string;
  updated_at: string;
}

export interface ProjectNotification {
  _id: string;
  id: string;
  project_id: string;
  user_id: string;
  title: string;
  message: string;
  type: 'TASK' | 'MILESTONE' | 'RISK' | 'RESOURCE' | 'MEETING' | 'GENERAL';
  is_read: boolean;
  created_at: string;
  updated_at: string;
}

export interface ProjectMeeting {
  _id: string;
  id: string;
  project_id: string;
  title: string;
  description: string;
  meeting_date: string;
  duration: number;
  location: string;
  meeting_type: 'IN_PERSON' | 'ONLINE' | 'HYBRID';
  attendees: string[];
  agenda: string[];
  created_by: string;
  created_at: string;
  updated_at: string;
}

export interface CreateMessageData {
  project_id: string;
  content: string;
  message_type: 'TEXT' | 'IMAGE' | 'FILE' | 'SYSTEM';
  reply_to?: string;
  attachments?: string[];
}

export interface CreateNotificationData {
  project_id: string;
  user_id: string;
  title: string;
  message: string;
  type: 'TASK' | 'MILESTONE' | 'RISK' | 'RESOURCE' | 'MEETING' | 'GENERAL';
}

export interface CreateMeetingData {
  project_id: string;
  title: string;
  description: string;
  meeting_date: string;
  duration: number;
  location: string;
  meeting_type: 'IN_PERSON' | 'ONLINE' | 'HYBRID';
  attendees: string[];
  agenda: string[];
}
