package org.example.demo.model;

public class WsMessage {
    private String sender;
    private String recipient; // For 1-on-1
    private Long conversationId;
    private String payload; // Encrypted
    private MessageType type;

    public WsMessage() {}

    public WsMessage(String sender, String recipient, Long conversationId, String payload, MessageType type) {
        this.sender = sender;
        this.recipient = recipient;
        this.conversationId = conversationId;
        this.payload = payload;
        this.type = type;
    }

    public static WsMessageBuilder builder() {
        return new WsMessageBuilder();
    }

    public enum MessageType {
        CHAT, JOIN, LEAVE, ERROR
    }

    // Getters and Setters
    public String getSender() { return sender; }
    public void setSender(String sender) { this.sender = sender; }
    public String getRecipient() { return recipient; }
    public void setRecipient(String recipient) { this.recipient = recipient; }
    public Long getConversationId() { return conversationId; }
    public void setConversationId(Long conversationId) { this.conversationId = conversationId; }
    public String getPayload() { return payload; }
    public void setPayload(String payload) { this.payload = payload; }
    public MessageType getType() { return type; }
    public void setType(MessageType type) { this.type = type; }

    public static class WsMessageBuilder {
        private String sender;
        private String recipient;
        private Long conversationId;
        private String payload;
        private MessageType type;

        public WsMessageBuilder sender(String sender) { this.sender = sender; return this; }
        public WsMessageBuilder recipient(String recipient) { this.recipient = recipient; return this; }
        public WsMessageBuilder conversationId(Long conversationId) { this.conversationId = conversationId; return this; }
        public WsMessageBuilder payload(String payload) { this.payload = payload; return this; }
        public WsMessageBuilder type(MessageType type) { this.type = type; return this; }
        public WsMessage build() { return new WsMessage(sender, recipient, conversationId, payload, type); }
    }
}
