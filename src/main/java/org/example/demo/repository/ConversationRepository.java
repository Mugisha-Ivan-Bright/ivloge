package org.example.demo.repository;

import org.example.demo.entity.Conversation;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;
import org.springframework.stereotype.Repository;

import java.util.List;
import java.util.Optional;

@Repository
public interface ConversationRepository extends JpaRepository<Conversation, Long> {
    
    @Query("SELECT c FROM Conversation c WHERE (c.user1Id = :userId OR c.user2Id = :userId) AND c.isGroup = false ORDER BY c.lastMessageTime DESC")
    List<Conversation> findByUserIdOrderByLastMessageTimeDesc(@Param("userId") Long userId);
    
    @Query("SELECT c FROM Conversation c JOIN c.members m WHERE m.id = :userId AND c.isGroup = true ORDER BY c.lastMessageTime DESC")
    List<Conversation> findGroupConversationsByUserId(@Param("userId") Long userId);
    
    @Query("SELECT c FROM Conversation c WHERE (c.user1Id = :user1Id AND c.user2Id = :user2Id) OR (c.user1Id = :user2Id AND c.user2Id = :user1Id)")
    Optional<Conversation> findByTwoUsers(@Param("user1Id") Long user1Id, @Param("user2Id") Long user2Id);
    
    @Query("SELECT c FROM Conversation c WHERE c.isGroup = true")
    List<Conversation> findAllGroupConversations();
}
