export interface DeviceSession {
  _id: string;
  device: string;
  ip: string;
  createdAt: string;
  lastActiveAt: string;
  isCurrent: boolean;
}
