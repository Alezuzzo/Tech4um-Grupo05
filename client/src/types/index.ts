export interface User {
  id: string;
  username: string;
  email: string;
  token?: string;
}

export interface AuthResponse {
  user: User;
  token: string;
}

export interface Room {
  id: string;
  name: string;
  description: string;
  creatorName?: string;
  participantsCount?: number;
  count?: number; 
  isFeatured?: boolean;
}

export interface Participant {
  id: string;
  name: string;
  avatarColor?: string;
  isOnline: boolean;
}

export interface Message {
  id: string;
  content: string;
  senderId: string;
  senderName: string;
  createdAt: string;
  isPrivate: boolean;
  receiverId?: string;
}