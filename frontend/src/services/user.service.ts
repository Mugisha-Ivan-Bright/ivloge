import axios from 'axios';
import { User, ChatMessage, Conversation, MessageRequest, GroupChatRequest } from '../types';

const API_URL = '/api/users';
const MESSAGE_URL = '/api/messages';

const getAuthHeader = () => {
  const userStr = localStorage.getItem('user');

  if (!userStr) {
    console.log('No user data in localStorage');
    return {};
  }

  try {
    const user = JSON.parse(userStr);
    console.log('User data from localStorage:', user);

    if (user && user.accessToken) {
      console.log('Using accessToken for authorization');
      return { Authorization: 'Bearer ' + user.accessToken };
    } else {
      console.log('No accessToken found in user data');
      return {};
    }
  } catch (error) {
    console.error('Error parsing user data:', error);
    return {};
  }
};

class UserService {
  getAllUsers() {
    return axios.get<User[]>(API_URL, { headers: getAuthHeader() });
  }

  getUserById(id: number) {
    return axios.get<User>(API_URL + '/' + id, { headers: getAuthHeader() });
  }

  getConversations() {
    const headers = getAuthHeader();
    console.log('Fetching conversations with headers:', headers);
    return axios.get<Conversation[]>(API_URL + '/conversations', { headers })
      .then(response => {
        console.log('Conversations API response:', response);
        return response;
      })
      .catch(error => {
        console.error('Conversations API error:', error);
        console.error('Error response:', error.response);
        throw error;
      });
  }

  getAvailableUsers() {
    const headers = getAuthHeader();
    console.log('Fetching available users with headers:', headers);
    return axios.get<User[]>(API_URL + '/available', { headers })
      .then(response => {
        console.log('Available users API response:', response);
        return response;
      })
      .catch(error => {
        console.error('Available users API error:', error);
        console.error('Error response:', error.response);
        throw error;
      });
  }

  getConversationMessages(conversationId: number, page = 0, size = 50) {
    return axios.get<ChatMessage[]>(`${MESSAGE_URL}/conversation/${conversationId}?page=${page}&size=${size}`, { headers: getAuthHeader() });
  }

  sendMessage(messageRequest: MessageRequest) {
    return axios.post<ChatMessage>(`${MESSAGE_URL}/send`, messageRequest, { headers: getAuthHeader() });
  }

  // New methods for enhanced features
  createGroup(groupRequest: GroupChatRequest) {
    return axios.post<Conversation>(`${API_URL}/groups`, groupRequest, { headers: getAuthHeader() });
  }

  markMessageAsRead(messageId: number) {
    return axios.post(`${MESSAGE_URL}/${messageId}/read`, {}, { headers: getAuthHeader() });
  }

  markMessageAsDelivered(messageId: number) {
    return axios.post(`${MESSAGE_URL}/${messageId}/delivered`, {}, { headers: getAuthHeader() });
  }

  editMessage(messageId: number, content: string) {
    return axios.put<ChatMessage>(`${MESSAGE_URL}/${messageId}`, { content }, { headers: getAuthHeader() });
  }

  deleteMessage(messageId: number) {
    return axios.delete(`${MESSAGE_URL}/${messageId}`, { headers: getAuthHeader() });
  }

  // Typing indicators (for future WebSocket implementation)
  sendTypingIndicator(conversationId: number, isTyping: boolean) {
    // This would typically be sent via WebSocket
    console.log('Typing indicator:', { conversationId, isTyping });
  }

  // Get unread message counts
  getUnreadCounts() {
    return axios.get<{ conversationId: number, unreadCount: number }[]>(`${API_URL}/unread-counts`, { headers: getAuthHeader() });
  }
}

export default new UserService();
