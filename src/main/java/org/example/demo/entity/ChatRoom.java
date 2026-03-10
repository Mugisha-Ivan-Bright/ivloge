package org.example.demo.entity;

import jakarta.persistence.*;
import java.time.LocalDateTime;
import java.util.HashSet;
import java.util.Set;

@Entity
@Table(name = "chat_rooms")
public class ChatRoom {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    private String name;

    @Column(nullable = false)
    private Boolean isGroup;

    @ManyToMany(fetch = FetchType.LAZY)
    @JoinTable(
        name = "room_members",
        joinColumns = @JoinColumn(name = "room_id"),
        inverseJoinColumns = @JoinColumn(name = "user_id")
    )
    private Set<User> members = new HashSet<>();

    private LocalDateTime createdAt;

    public ChatRoom() {}

    public ChatRoom(String name, Boolean isGroup) {
        this.name = name;
        this.isGroup = isGroup;
    }

    public static ChatRoomBuilder builder() {
        return new ChatRoomBuilder();
    }

    @PrePersist
    protected void onCreate() {
        createdAt = LocalDateTime.now();
    }

    // Getters and Setters
    public Long getId() { return id; }
    public void setId(Long id) { this.id = id; }
    public String getName() { return name; }
    public void setName(String name) { this.name = name; }
    public Boolean getIsGroup() { return isGroup; }
    public void setIsGroup(Boolean isGroup) { this.isGroup = isGroup; }
    public Set<User> getMembers() { return members; }
    public void setMembers(Set<User> members) { this.members = members; }
    public LocalDateTime getCreatedAt() { return createdAt; }
    public void setCreatedAt(LocalDateTime createdAt) { this.createdAt = createdAt; }

    public static class ChatRoomBuilder {
        private String name;
        private Boolean isGroup;

        public ChatRoomBuilder name(String name) { this.name = name; return this; }
        public ChatRoomBuilder isGroup(Boolean isGroup) { this.isGroup = isGroup; return this; }
        public ChatRoom build() { return new ChatRoom(name, isGroup); }
    }
}
