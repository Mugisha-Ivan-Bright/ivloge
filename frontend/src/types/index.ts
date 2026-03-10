export interface User {
  id: number;
  username: string;
  email: string;
  bio?: string;
  phone?: string;
  avatarUrl?: string;
  isOnline?: boolean;
  lastSeen?: string;
  roles: string[];
  token?: string;
}

export interface AuthResponse {
  id: number;
  username: string;
  email: string;
  bio?: string;
  phone?: string;
  roles: string[];
  accessToken: string;
  tokenType: string;
}

export interface ChatMessage {
  id?: number;
  conversationId: number;
  senderId: number;
  payload: string;
  type: 'TEXT' | 'JOIN' | 'LEAVE' | 'KEY_EXCHANGE' | 'FILE' | 'IMAGE';
  timestamp: string;
  status?: 'sent' | 'delivered' | 'read';
  deliveredAt?: string;
  readAt?: string;
  editedAt?: string;
  isDeleted?: boolean;
  reactions?: MessageReaction[];
}

export interface MessageReaction {
  userId: number;
  emoji: string;
  timestamp: string;
}

export interface Conversation {
  conversationId: number;
  userId?: number;
  username: string;
  email?: string;
  bio?: string;
  phone?: string;
  avatarUrl?: string;
  isOnline?: boolean;
  lastSeen?: string;
  lastMessage?: string;
  lastMessageTime?: string;
  lastSenderId?: number;
  isGroup?: boolean;
  groupName?: string;
  groupDescription?: string;
  groupMembers?: User[];
  unreadCount?: number;
}

export interface ConversationResponse {
  conversationId: number;
  userId?: number;
  username: string;
  email?: string;
  bio?: string;
  phone?: string;
  avatarUrl?: string;
  isOnline?: boolean;
  lastSeen?: string;
  lastMessage?: string;
  lastMessageTime?: string;
  lastSenderId?: number;
  isGroup?: boolean;
  groupName?: string;
  groupDescription?: string;
  groupMembers?: User[];
  unreadCount?: number;
}

export interface MessageRequest {
  receiverId: number;
  content: string;
}

export interface GroupChatRequest {
  name: string;
  description?: string;
  memberIds: number[];
}

export interface UserProfile {
  id: number;
  username: string;
  email: string;
  bio?: string;
  phone?: string;
  avatarUrl?: string;
  isOnline?: boolean;
  lastSeen?: string;
  joinedDate?: string;
  mutualGroups?: Conversation[];
  sharedMedia?: MediaItem[];
}

export interface MediaItem {
  id: number;
  type: 'image' | 'video' | 'document' | 'audio';
  url: string;
  name: string;
  size: number;
  timestamp: string;
}

export interface TypingIndicator {
  userId: number;
  conversationId: number;
  isTyping: boolean;
  timestamp: string;
}
