package org.example.demo.controller;

import org.example.demo.entity.User;
import org.example.demo.entity.Conversation;
import org.example.demo.entity.UnreadMessage;
import org.example.demo.payload.response.ConversationResponse;
import org.example.demo.repository.UserRepository;
import org.example.demo.repository.ConversationRepository;
import org.example.demo.repository.UnreadMessageRepository;
import org.example.demo.security.UserDetailsImpl;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.ResponseEntity;
import org.springframework.security.core.Authentication;
import org.springframework.security.core.context.SecurityContextHolder;
import org.springframework.web.bind.annotation.*;

import java.util.List;
import java.util.Set;
import java.util.HashSet;
import java.util.stream.Collectors;

@RestController
@RequestMapping("/api/users")
public class UserController {

    @Autowired
    private UserRepository userRepository;

    @Autowired
    private ConversationRepository conversationRepository;

    @Autowired
    private UnreadMessageRepository unreadMessageRepository;

    @GetMapping
    public List<User> getAllUsers() {
        return userRepository.findAll();
    }

    @GetMapping("/{id}")
    public ResponseEntity<User> getUserById(@PathVariable Long id) {
        return userRepository.findById(id)
                .map(ResponseEntity::ok)
                .orElse(ResponseEntity.notFound().build());
    }

    @GetMapping("/conversations")
    public ResponseEntity<List<ConversationResponse>> getUserConversations() {
        Authentication authentication = SecurityContextHolder.getContext().getAuthentication();
        UserDetailsImpl userDetails = (UserDetailsImpl) authentication.getPrincipal();
        Long currentUserId = userDetails.getId();

        // Get both direct conversations and group conversations
        List<Conversation> directConversations = conversationRepository.findByUserIdOrderByLastMessageTimeDesc(currentUserId);
        List<Conversation> groupConversations = conversationRepository.findGroupConversationsByUserId(currentUserId);
        
        // Combine both lists
        List<Conversation> allConversations = new java.util.ArrayList<>(directConversations);
        allConversations.addAll(groupConversations);
        
        // Sort by last message time
        allConversations.sort((c1, c2) -> {
            if (c1.getLastMessageTime() == null && c2.getLastMessageTime() == null) return 0;
            if (c1.getLastMessageTime() == null) return 1;
            if (c2.getLastMessageTime() == null) return -1;
            return c2.getLastMessageTime().compareTo(c1.getLastMessageTime());
        });
        
        List<ConversationResponse> responses = allConversations.stream().map(conv -> {
            if (conv.getIsGroup()) {
                // Group conversation
                Set<User> members = conv.getMembers();
                List<User> membersList = members.stream().collect(Collectors.toList());
                
                // Get unread count for this user
                UnreadMessage unread = unreadMessageRepository.findByUserIdAndConversationId(currentUserId, conv.getId()).orElse(null);
                int unreadCount = unread != null ? unread.getUnreadCount() : 0;
                
                return new ConversationResponse(
                    conv.getId(),
                    null, // No single user ID for groups
                    conv.getGroupName(),
                    null, // No email for groups
                    conv.getGroupDescription(),
                    null, // No phone for groups
                    conv.getGroupAvatarUrl(),
                    null, // No online status for groups
                    null, // No last seen for groups
                    conv.getLastMessage(),
                    conv.getLastMessageTime(),
                    conv.getLastSenderId(),
                    true, // isGroup
                    conv.getGroupName(),
                    conv.getGroupDescription(),
                    membersList,
                    unreadCount
                );
            } else {
                // Direct conversation
                Long otherUserId = conv.getUser1Id().equals(currentUserId) ? conv.getUser2Id() : conv.getUser1Id();
                User otherUser = userRepository.findById(otherUserId).orElse(null);
                
                if (otherUser == null) return null;
                
                // Get unread count for this user
                UnreadMessage unread = unreadMessageRepository.findByUserIdAndConversationId(currentUserId, conv.getId()).orElse(null);
                int unreadCount = unread != null ? unread.getUnreadCount() : 0;
                
                return new ConversationResponse(
                    conv.getId(),
                    otherUser.getId(),
                    otherUser.getUsername(),
                    otherUser.getEmail(),
                    otherUser.getBio(),
                    otherUser.getPhone(),
                    otherUser.getAvatarUrl(),
                    otherUser.getIsOnline(),
                    otherUser.getLastSeen(),
                    conv.getLastMessage(),
                    conv.getLastMessageTime(),
                    conv.getLastSenderId(),
                    false, // isGroup
                    null,
                    null,
                    null,
                    unreadCount
                );
            }
        }).filter(r -> r != null).collect(Collectors.toList());

        return ResponseEntity.ok(responses);
    }

    @GetMapping("/available")
    public ResponseEntity<List<User>> getAvailableUsers() {
        Authentication authentication = SecurityContextHolder.getContext().getAuthentication();
        UserDetailsImpl userDetails = (UserDetailsImpl) authentication.getPrincipal();
        Long currentUserId = userDetails.getId();

        // Get all users except current user
        List<User> allUsers = userRepository.findAll().stream()
            .filter(user -> !user.getId().equals(currentUserId))
            .collect(Collectors.toList());

        return ResponseEntity.ok(allUsers);
    }

    @PostMapping("/groups")
    public ResponseEntity<ConversationResponse> createGroup(@RequestBody GroupCreateRequest request) {
        Authentication authentication = SecurityContextHolder.getContext().getAuthentication();
        UserDetailsImpl userDetails = (UserDetailsImpl) authentication.getPrincipal();
        Long currentUserId = userDetails.getId();

        // Get members including creator
        Set<User> members = new HashSet<>();
        User creator = userRepository.findById(currentUserId).orElse(null);
        if (creator != null) {
            members.add(creator);
        }
        
        for (Long memberId : request.getMemberIds()) {
            User member = userRepository.findById(memberId).orElse(null);
            if (member != null) {
                members.add(member);
            }
        }

        // Create group conversation
        Conversation groupConv = new Conversation(request.getName(), request.getDescription(), currentUserId, members);
        groupConv = conversationRepository.save(groupConv);

        // Create unread message entries for all members
        for (User member : members) {
            UnreadMessage unread = new UnreadMessage(member.getId(), groupConv.getId());
            unreadMessageRepository.save(unread);
        }

        List<User> membersList = members.stream().collect(Collectors.toList());
        ConversationResponse response = new ConversationResponse(
            groupConv.getId(),
            null,
            groupConv.getGroupName(),
            null,
            groupConv.getGroupDescription(),
            null,
            groupConv.getGroupAvatarUrl(),
            null,
            null,
            groupConv.getLastMessage(),
            groupConv.getLastMessageTime(),
            groupConv.getLastSenderId(),
            true,
            groupConv.getGroupName(),
            groupConv.getGroupDescription(),
            membersList,
            0
        );

        return ResponseEntity.ok(response);
    }

    public static class GroupCreateRequest {
        private String name;
        private String description;
        private List<Long> memberIds;

        // Getters and setters
        public String getName() { return name; }
        public void setName(String name) { this.name = name; }
        public String getDescription() { return description; }
        public void setDescription(String description) { this.description = description; }
        public List<Long> getMemberIds() { return memberIds; }
        public void setMemberIds(List<Long> memberIds) { this.memberIds = memberIds; }
    }
}
