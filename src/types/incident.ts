export interface Incident {
  _id?: string;
  id?: string;
  description: string;
  images?: string[];
  location: string;
  severity: string;
  status: string;
  createdBy?: {
    _id?: string;
    full_name?: string;
    username?: string;
  };
  createdAt: string;
}
