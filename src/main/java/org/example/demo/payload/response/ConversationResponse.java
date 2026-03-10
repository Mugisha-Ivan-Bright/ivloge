package org.example.demo.payload.response;

import java.time.LocalDateTime;

public class ConversationResponse {
    private Long conversationId;
    private Long userId;
    private String username;
    private String email;
    private String bio;
    private String phone;
    private String avatarUrl;
    private Boolean isOnline;
    private LocalDateTime lastSeen;
    private String lastMessage;
    private LocalDateTime lastMessageTime;
    private Long lastSenderId;

    public ConversationResponse() {}

    public ConversationResponse(Long conversationId, Long userId, String username, String email, 
                                String bio, String phone, String avatarUrl, Boolean isOnline, 
                                LocalDateTime lastSeen, String lastMessage, LocalDateTime lastMessageTime, 
                                Long lastSenderId) {
        this.conversationId = conversationId;
        this.userId = userId;
        this.username = username;
        this.email = email;
        this.bio = bio;
        this.phone = phone;
        this.avatarUrl = avatarUrl;
        this.isOnline = isOnline;
        this.lastSeen = lastSeen;
        this.lastMessage = lastMessage;
        this.lastMessageTime = lastMessageTime;
        this.lastSenderId = lastSenderId;
    }

    // Getters and Setters
    public Long getConversationId() { return conversationId; }
    public void setConversationId(Long conversationId) { this.conversationId = conversationId; }
    public Long getUserId() { return userId; }
    public void setUserId(Long userId) { this.userId = userId; }
    public String getUsername() { return username; }
    public void setUsername(String username) { this.username = username; }
    public String getEmail() { return email; }
    public void setEmail(String email) { this.email = email; }
    public String getBio() { return bio; }
    public void setBio(String bio) { this.bio = bio; }
    public String getPhone() { return phone; }
    public void setPhone(String phone) { this.phone = phone; }
    public String getAvatarUrl() { return avatarUrl; }
    public void setAvatarUrl(String avatarUrl) { this.avatarUrl = avatarUrl; }
    public Boolean getIsOnline() { return isOnline; }
    public void setIsOnline(Boolean isOnline) { this.isOnline = isOnline; }
    public LocalDateTime getLastSeen() { return lastSeen; }
    public void setLastSeen(LocalDateTime lastSeen) { this.lastSeen = lastSeen; }
    public String getLastMessage() { return lastMessage; }
    public void setLastMessage(String lastMessage) { this.lastMessage = lastMessage; }
    public LocalDateTime getLastMessageTime() { return lastMessageTime; }
    public void setLastMessageTime(LocalDateTime lastMessageTime) { this.lastMessageTime = lastMessageTime; }
    public Long getLastSenderId() { return lastSenderId; }
    public void setLastSenderId(Long lastSenderId) { this.lastSenderId = lastSenderId; }
}
