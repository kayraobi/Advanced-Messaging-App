export type NotificationType =
  | 'chat'
  | 'system'
  | 'push'
  | 'event'
  | 'news'
  | 'weather';

export interface Notification {
  id: string;
  title: string;
  body?: string;
  emoji: string;
  isRead: boolean;
  createdAt: string;
  roomId?: string;
  type?: NotificationType;
}

export type NewNotification = Omit<Notification, 'id' | 'isRead' | 'createdAt'> & {
  id?: string;
  isRead?: boolean;
  createdAt?: string;
};
