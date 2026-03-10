package org.example.demo.repository;

import org.example.demo.entity.UnreadMessage;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;
import org.springframework.stereotype.Repository;

import java.util.List;
import java.util.Optional;

@Repository
public interface UnreadMessageRepository extends JpaRepository<UnreadMessage, Long> {
    
    Optional<UnreadMessage> findByUserIdAndConversationId(Long userId, Long conversationId);
    
    List<UnreadMessage> findByUserId(Long userId);
    
    @Query("SELECT um FROM UnreadMessage um WHERE um.userId = :userId AND um.unreadCount > 0")
    List<UnreadMessage> findUnreadByUserId(@Param("userId") Long userId);
    
    void deleteByConversationId(Long conversationId);
}