export interface Notification {
  _id: string;
  type: string;
  message: string;
  projectId?: string;
  actorId?: string;
  read: boolean;
  createdAt: string;
}
