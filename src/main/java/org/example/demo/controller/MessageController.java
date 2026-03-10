package org.example.demo.controller;

import org.example.demo.entity.ChatMessage;
import org.example.demo.entity.Conversation;
import org.example.demo.entity.UnreadMessage;
import org.example.demo.repository.MessageRepository;
import org.example.demo.repository.ConversationRepository;
import org.example.demo.repository.UserRepository;
import org.example.demo.repository.UnreadMessageRepository;
import org.example.demo.security.UserDetailsImpl;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.data.domain.PageRequest;
import org.springframework.http.ResponseEntity;
import org.springframework.security.core.Authentication;
import org.springframework.security.core.context.SecurityContextHolder;
import org.springframework.web.bind.annotation.*;

import java.time.LocalDateTime;
import java.util.List;
import java.util.Optional;

@RestController
@RequestMapping("/api/messages")
public class MessageController {

    @Autowired
    private MessageRepository messageRepository;

    @Autowired
    private ConversationRepository conversationRepository;

    @Autowired
    private UserRepository userRepository;

    @Autowired
    private UnreadMessageRepository unreadMessageRepository;

    @GetMapping("/conversation/{conversationId}")
    public ResponseEntity<List<ChatMessage>> getConversationMessages(
            @PathVariable Long conversationId,
            @RequestParam(defaultValue = "0") int page,
            @RequestParam(defaultValue = "50") int size) {
        
        Authentication authentication = SecurityContextHolder.getContext().getAuthentication();
        UserDetailsImpl userDetails = (UserDetailsImpl) authentication.getPrincipal();
        Long currentUserId = userDetails.getId();
        
        List<ChatMessage> messages = messageRepository.findByConversationIdOrderByTimestampDesc(
                conversationId, PageRequest.of(page, size));
        
        // Mark messages as read
        markMessagesAsRead(conversationId, currentUserId);
        
        return ResponseEntity.ok(messages);
    }

    @PostMapping("/send")
    public ResponseEntity<?> sendMessage(@RequestBody MessageRequest request) {
        Authentication authentication = SecurityContextHolder.getContext().getAuthentication();
        UserDetailsImpl userDetails = (UserDetailsImpl) authentication.getPrincipal();
        Long currentUserId = userDetails.getId();

        Conversation conversation;
        
        // Check if receiverId is actually a conversationId (for group chats)
        Optional<Conversation> existingConv = conversationRepository.findById(request.getReceiverId());
        if (existingConv.isPresent() && existingConv.get().getIsGroup()) {
            // This is a group chat
            conversation = existingConv.get();
        } else {
            // This is a direct message - find or create conversation
            Optional<Conversation> convOpt = conversationRepository.findByTwoUsers(currentUserId, request.getReceiverId());
            
            if (convOpt.isEmpty()) {
                conversation = new Conversation(currentUserId, request.getReceiverId());
                conversation = conversationRepository.save(conversation);
                
                // Create unread message entries for both users
                unreadMessageRepository.save(new UnreadMessage(currentUserId, conversation.getId()));
                unreadMessageRepository.save(new UnreadMessage(request.getReceiverId(), conversation.getId()));
            } else {
                conversation = convOpt.get();
            }
        }

        // Determine message type
        ChatMessage.MessageType messageType = ChatMessage.MessageType.TEXT;
        if (request.getContent().startsWith("📷 Image:") || request.getContent().contains("cloudinary.com")) {
            messageType = ChatMessage.MessageType.IMAGE;
        } else if (request.getContent().contains("http") && (request.getContent().contains(".pdf") || request.getContent().contains(".doc"))) {
            messageType = ChatMessage.MessageType.FILE;
        }

        // Save message
        ChatMessage message = ChatMessage.builder()
                .conversationId(conversation.getId())
                .senderId(currentUserId)
                .payload(request.getContent())
                .type(messageType)
                .timestamp(LocalDateTime.now())
                .build();
        
        message = messageRepository.save(message);

        // Update conversation last message
        conversation.setLastMessage(request.getContent());
        conversation.setLastMessageTime(LocalDateTime.now());
        conversation.setLastSenderId(currentUserId);
        conversationRepository.save(conversation);

        // Update unread count for all other members
        if (conversation.getIsGroup()) {
            // For group chats, update unread count for all members except sender
            for (User member : conversation.getMembers()) {
                if (!member.getId().equals(currentUserId)) {
                    updateUnreadCount(conversation.getId(), member.getId());
                }
            }
        } else {
            // For direct chats, update unread count for receiver
            updateUnreadCount(conversation.getId(), request.getReceiverId());
        }

        return ResponseEntity.ok(message);
    }

    @PostMapping("/{messageId}/read")
    public ResponseEntity<?> markMessageAsRead(@PathVariable Long messageId) {
        Authentication authentication = SecurityContextHolder.getContext().getAuthentication();
        UserDetailsImpl userDetails = (UserDetailsImpl) authentication.getPrincipal();
        Long currentUserId = userDetails.getId();

        Optional<ChatMessage> messageOpt = messageRepository.findById(messageId);
        if (messageOpt.isPresent()) {
            ChatMessage message = messageOpt.get();
            if (!message.getSenderId().equals(currentUserId)) {
                message.setStatus(ChatMessage.MessageStatus.READ);
                message.setReadAt(LocalDateTime.now());
                messageRepository.save(message);
            }
        }

        return ResponseEntity.ok().build();
    }

    @PostMapping("/{messageId}/delivered")
    public ResponseEntity<?> markMessageAsDelivered(@PathVariable Long messageId) {
        Optional<ChatMessage> messageOpt = messageRepository.findById(messageId);
        if (messageOpt.isPresent()) {
            ChatMessage message = messageOpt.get();
            if (message.getStatus() == ChatMessage.MessageStatus.SENT) {
                message.setStatus(ChatMessage.MessageStatus.DELIVERED);
                message.setDeliveredAt(LocalDateTime.now());
                messageRepository.save(message);
            }
        }

        return ResponseEntity.ok().build();
    }

    @PutMapping("/{messageId}")
    public ResponseEntity<?> editMessage(@PathVariable Long messageId, @RequestBody EditMessageRequest request) {
        Authentication authentication = SecurityContextHolder.getContext().getAuthentication();
        UserDetailsImpl userDetails = (UserDetailsImpl) authentication.getPrincipal();
        Long currentUserId = userDetails.getId();

        Optional<ChatMessage> messageOpt = messageRepository.findById(messageId);
        if (messageOpt.isPresent()) {
            ChatMessage message = messageOpt.get();
            if (message.getSenderId().equals(currentUserId)) {
                message.setPayload(request.getContent());
                message.setEditedAt(LocalDateTime.now());
                messageRepository.save(message);
                return ResponseEntity.ok(message);
            }
        }

        return ResponseEntity.notFound().build();
    }

    @DeleteMapping("/{messageId}")
    public ResponseEntity<?> deleteMessage(@PathVariable Long messageId) {
        Authentication authentication = SecurityContextHolder.getContext().getAuthentication();
        UserDetailsImpl userDetails = (UserDetailsImpl) authentication.getPrincipal();
        Long currentUserId = userDetails.getId();

        Optional<ChatMessage> messageOpt = messageRepository.findById(messageId);
        if (messageOpt.isPresent()) {
            ChatMessage message = messageOpt.get();
            if (message.getSenderId().equals(currentUserId)) {
                message.setIsDeleted(true);
                messageRepository.save(message);
                return ResponseEntity.ok().build();
            }
        }

        return ResponseEntity.notFound().build();
    }

    private void markMessagesAsRead(Long conversationId, Long userId) {
        // Reset unread count for this user in this conversation
        Optional<UnreadMessage> unreadOpt = unreadMessageRepository.findByUserIdAndConversationId(userId, conversationId);
        if (unreadOpt.isPresent()) {
            UnreadMessage unread = unreadOpt.get();
            unread.setUnreadCount(0);
            unread.setLastReadAt(LocalDateTime.now());
            unreadMessageRepository.save(unread);
        }
    }

    private void updateUnreadCount(Long conversationId, Long userId) {
        Optional<UnreadMessage> unreadOpt = unreadMessageRepository.findByUserIdAndConversationId(userId, conversationId);
        if (unreadOpt.isPresent()) {
            UnreadMessage unread = unreadOpt.get();
            unread.setUnreadCount(unread.getUnreadCount() + 1);
            unreadMessageRepository.save(unread);
        } else {
            UnreadMessage unread = new UnreadMessage(userId, conversationId);
            unread.setUnreadCount(1);
            unreadMessageRepository.save(unread);
        }
    }

    public static class MessageRequest {
        private Long receiverId;
        private String content;

        public Long getReceiverId() { return receiverId; }
        public void setReceiverId(Long receiverId) { this.receiverId = receiverId; }
        public String getContent() { return content; }
        public void setContent(String content) { this.content = content; }
    }

    public static class EditMessageRequest {
        private String content;

        public String getContent() { return content; }
        public void setContent(String content) { this.content = content; }
    }
}
