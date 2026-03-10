import Stomp from 'stompjs';
import SockJS from 'sockjs-client';
import { ChatMessage } from '../types';

class ChatService {
  stompClient: Stomp.Client | null = null;

  connect(username: string, onMessageReceived: (msg: ChatMessage) => void): void {
    const socket = new SockJS('/ws-chat');
    this.stompClient = Stomp.over(socket);
    this.stompClient.debug = () => {}; // Disable debug logging

    this.stompClient.connect({}, (frame) => {
      console.log('Connected: ' + frame);
      
      this.stompClient?.subscribe('/topic/public', (messageOutput) => {
        onMessageReceived(JSON.parse(messageOutput.body));
      });

      // Join chat
      this.stompClient?.send("/app/chat.addUser", {}, JSON.stringify({
        sender: username,
        type: 'JOIN'
      }));
    });
  }

  sendMessage(message: ChatMessage): void {
    if (this.stompClient && this.stompClient.connected) {
      this.stompClient.send("/app/chat.sendMessage", {}, JSON.stringify(message));
    }
  }

  disconnect(): void {
    if (this.stompClient !== null) {
      this.stompClient.disconnect(() => {});
    }
    console.log("Disconnected");
  }
}

export default new ChatService();
