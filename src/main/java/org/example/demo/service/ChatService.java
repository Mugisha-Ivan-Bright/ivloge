package org.example.demo.service;

import org.example.demo.entity.ChatMessage;
import org.example.demo.model.WsMessage;
import org.example.demo.repository.MessageRepository;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.messaging.simp.SimpMessagingTemplate;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.time.LocalDateTime;

@Service
public class ChatService {

    @Autowired
    private SimpMessagingTemplate messagingTemplate;

    @Autowired
    private MessageRepository messageRepository;

    @Transactional
    public void processMessage(WsMessage wsMessage) {
        // 1. Persist message metadata and encrypted payload
        ChatMessage chatMessage = ChatMessage.builder()
                .conversationId(wsMessage.getConversationId())
                .senderId(1L) // FIXME: Get from SecurityContext or session
                .payload(wsMessage.getPayload())
                .type(ChatMessage.MessageType.valueOf(wsMessage.getType().name()))
                .timestamp(LocalDateTime.now())
                .build();

        messageRepository.save(chatMessage);

        // 2. Dispatch message
        if (wsMessage.getRecipient() != null) {
            // Private 1-on-1
            messagingTemplate.convertAndSendToUser(
                    wsMessage.getRecipient(), "/queue/messages", wsMessage);
        } else {
            // Group / Broadcast
            messagingTemplate.convertAndSend("/topic/public/" + wsMessage.getConversationId(), wsMessage);
        }
    }
}
