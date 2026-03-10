package org.example.demo.controller;

import org.example.demo.model.WsMessage;
import org.example.demo.service.ChatService;
import org.example.demo.service.PresenceService;
import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.messaging.handler.annotation.MessageMapping;
import org.springframework.messaging.handler.annotation.Payload;
import org.springframework.messaging.simp.SimpMessageHeaderAccessor;
import org.springframework.stereotype.Controller;

@Controller
public class ChatController {

    private static final Logger logger = LoggerFactory.getLogger(ChatController.class);

    @Autowired
    private ChatService chatService;

    @Autowired
    private PresenceService presenceService;

    @MessageMapping("/chat.send")
    public void sendMessage(@Payload WsMessage wsMessage) {
        logger.info("Received message for conversation: {}", wsMessage.getConversationId());
        chatService.processMessage(wsMessage);
    }

    @MessageMapping("/chat.join")
    public void addUser(@Payload WsMessage wsMessage, SimpMessageHeaderAccessor headerAccessor) {
        String username = wsMessage.getSender();
        logger.info("User joined: {}", username);
        
        // Track presence
        presenceService.setOnline(username);
        
        // Add username in web socket session
        headerAccessor.getSessionAttributes().put("username", username);
    }
}
