package org.example.demo.entity;

import jakarta.persistence.*;
import jakarta.persistence.Index;
import jakarta.persistence.Table;
import java.time.LocalDateTime;

@Entity
@Table(name = "chat_messages", indexes = {
    @Index(name = "idx_conv_time", columnList = "conversation_id, timestamp"),
    @Index(name = "idx_sender", columnList = "sender_id")
})
public class ChatMessage {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @Column(name = "conversation_id", nullable = false)
    private Long conversationId;

    @Column(name = "sender_id", nullable = false)
    private Long senderId;

    @Lob
    @Column(nullable = false)
    private String payload;

    @Column(nullable = false)
    private LocalDateTime timestamp;

    @Enumerated(EnumType.STRING)
    private MessageType type;

    @Enumerated(EnumType.STRING)
    @Column(name = "status")
    private MessageStatus status = MessageStatus.SENT;

    @Column(name = "delivered_at")
    private LocalDateTime deliveredAt;

    @Column(name = "read_at")
    private LocalDateTime readAt;

    @Column(name = "edited_at")
    private LocalDateTime editedAt;

    @Column(name = "is_deleted")
    private Boolean isDeleted = false;

    public ChatMessage() {}

    public ChatMessage(Long conversationId, Long senderId, String payload, MessageType type, LocalDateTime timestamp) {
        this.conversationId = conversationId;
        this.senderId = senderId;
        this.payload = payload;
        this.type = type;
        this.timestamp = timestamp;
        this.status = MessageStatus.SENT;
    }

    public static ChatMessageBuilder builder() {
        return new ChatMessageBuilder();
    }

    public enum MessageType {
        TEXT, KEY_EXCHANGE, JOIN, LEAVE, FILE, IMAGE
    }

    public enum MessageStatus {
        SENT, DELIVERED, READ
    }

    @PrePersist
    protected void onCreate() {
        if (timestamp == null) {
            timestamp = LocalDateTime.now();
        }
        if (status == null) {
            status = MessageStatus.SENT;
        }
    }

    // Getters and Setters
    public Long getId() { return id; }
    public void setId(Long id) { this.id = id; }
    public Long getConversationId() { return conversationId; }
    public void setConversationId(Long conversationId) { this.conversationId = conversationId; }
    public Long getSenderId() { return senderId; }
    public void setSenderId(Long senderId) { this.senderId = senderId; }
    public String getPayload() { return payload; }
    public void setPayload(String payload) { this.payload = payload; }
    public LocalDateTime getTimestamp() { return timestamp; }
    public void setTimestamp(LocalDateTime timestamp) { this.timestamp = timestamp; }
    public MessageType getType() { return type; }
    public void setType(MessageType type) { this.type = type; }
    public MessageStatus getStatus() { return status; }
    public void setStatus(MessageStatus status) { this.status = status; }
    public LocalDateTime getDeliveredAt() { return deliveredAt; }
    public void setDeliveredAt(LocalDateTime deliveredAt) { this.deliveredAt = deliveredAt; }
    public LocalDateTime getReadAt() { return readAt; }
    public void setReadAt(LocalDateTime readAt) { this.readAt = readAt; }
    public LocalDateTime getEditedAt() { return editedAt; }
    public void setEditedAt(LocalDateTime editedAt) { this.editedAt = editedAt; }
    public Boolean getIsDeleted() { return isDeleted; }
    public void setIsDeleted(Boolean isDeleted) { this.isDeleted = isDeleted; }

    public static class ChatMessageBuilder {
        private Long conversationId;
        private Long senderId;
        private String payload;
        private MessageType type;
        private LocalDateTime timestamp;

        public ChatMessageBuilder conversationId(Long conversationId) { this.conversationId = conversationId; return this; }
        public ChatMessageBuilder senderId(Long senderId) { this.senderId = senderId; return this; }
        public ChatMessageBuilder payload(String payload) { this.payload = payload; return this; }
        public ChatMessageBuilder type(MessageType type) { this.type = type; return this; }
        public ChatMessageBuilder timestamp(LocalDateTime timestamp) { this.timestamp = timestamp; return this; }
        public ChatMessage build() { return new ChatMessage(conversationId, senderId, payload, type, timestamp); }
    }
}
