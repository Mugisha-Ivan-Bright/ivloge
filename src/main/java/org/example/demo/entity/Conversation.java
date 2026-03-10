package org.example.demo.entity;

import jakarta.persistence.*;
import java.time.LocalDateTime;
import java.util.HashSet;
import java.util.Set;

@Entity
@Table(name = "conversations")
public class Conversation {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @Column(name = "user1_id")
    private Long user1Id;

    @Column(name = "user2_id")
    private Long user2Id;

    @Column(name = "is_group")
    private Boolean isGroup = false;

    @Column(name = "group_name")
    private String groupName;

    @Column(name = "group_description")
    private String groupDescription;

    @Column(name = "group_avatar_url")
    private String groupAvatarUrl;

    @Column(name = "created_by")
    private Long createdBy;

    @ManyToMany(fetch = FetchType.LAZY)
    @JoinTable(
        name = "conversation_members",
        joinColumns = @JoinColumn(name = "conversation_id"),
        inverseJoinColumns = @JoinColumn(name = "user_id")
    )
    private Set<User> members = new HashSet<>();

    @Column(name = "last_message")
    private String lastMessage;

    @Column(name = "last_message_time")
    private LocalDateTime lastMessageTime;

    @Column(name = "last_sender_id")
    private Long lastSenderId;

    @Column(name = "created_at")
    private LocalDateTime createdAt;

    @Column(name = "updated_at")
    private LocalDateTime updatedAt;

    public Conversation() {}

    public Conversation(Long user1Id, Long user2Id) {
        this.user1Id = user1Id;
        this.user2Id = user2Id;
        this.isGroup = false;
        this.createdAt = LocalDateTime.now();
        this.updatedAt = LocalDateTime.now();
    }

    // Group chat constructor
    public Conversation(String groupName, String groupDescription, Long createdBy, Set<User> members) {
        this.groupName = groupName;
        this.groupDescription = groupDescription;
        this.createdBy = createdBy;
        this.members = members;
        this.isGroup = true;
        this.createdAt = LocalDateTime.now();
        this.updatedAt = LocalDateTime.now();
    }

    @PrePersist
    protected void onCreate() {
        createdAt = LocalDateTime.now();
        updatedAt = LocalDateTime.now();
    }

    @PreUpdate
    protected void onUpdate() {
        updatedAt = LocalDateTime.now();
    }

    // Getters and Setters
    public Long getId() { return id; }
    public void setId(Long id) { this.id = id; }
    public Long getUser1Id() { return user1Id; }
    public void setUser1Id(Long user1Id) { this.user1Id = user1Id; }
    public Long getUser2Id() { return user2Id; }
    public void setUser2Id(Long user2Id) { this.user2Id = user2Id; }
    public Boolean getIsGroup() { return isGroup; }
    public void setIsGroup(Boolean isGroup) { this.isGroup = isGroup; }
    public String getGroupName() { return groupName; }
    public void setGroupName(String groupName) { this.groupName = groupName; }
    public String getGroupDescription() { return groupDescription; }
    public void setGroupDescription(String groupDescription) { this.groupDescription = groupDescription; }
    public String getGroupAvatarUrl() { return groupAvatarUrl; }
    public void setGroupAvatarUrl(String groupAvatarUrl) { this.groupAvatarUrl = groupAvatarUrl; }
    public Long getCreatedBy() { return createdBy; }
    public void setCreatedBy(Long createdBy) { this.createdBy = createdBy; }
    public Set<User> getMembers() { return members; }
    public void setMembers(Set<User> members) { this.members = members; }
    public String getLastMessage() { return lastMessage; }
    public void setLastMessage(String lastMessage) { this.lastMessage = lastMessage; }
    public LocalDateTime getLastMessageTime() { return lastMessageTime; }
    public void setLastMessageTime(LocalDateTime lastMessageTime) { this.lastMessageTime = lastMessageTime; }
    public Long getLastSenderId() { return lastSenderId; }
    public void setLastSenderId(Long lastSenderId) { this.lastSenderId = lastSenderId; }
    public LocalDateTime getCreatedAt() { return createdAt; }
    public LocalDateTime getUpdatedAt() { return updatedAt; }
}