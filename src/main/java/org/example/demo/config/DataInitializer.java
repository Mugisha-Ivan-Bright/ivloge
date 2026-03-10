package org.example.demo.config;

import org.example.demo.entity.ERole;
import org.example.demo.entity.Role;
import org.example.demo.entity.User;
import org.example.demo.entity.Conversation;
import org.example.demo.entity.ChatMessage;
import org.example.demo.repository.RoleRepository;
import org.example.demo.repository.UserRepository;
import org.example.demo.repository.ConversationRepository;
import org.example.demo.repository.MessageRepository;
import org.springframework.boot.CommandLineRunner;
import org.springframework.context.annotation.Bean;
import org.springframework.context.annotation.Configuration;
import org.springframework.security.crypto.password.PasswordEncoder;

import java.time.LocalDateTime;
import java.util.HashSet;
import java.util.Set;

@Configuration
public class DataInitializer {

    @Bean
    CommandLineRunner initRoles(RoleRepository roleRepository) {
        return args -> {
            if (roleRepository.findByName(ERole.ROLE_USER).isEmpty()) {
                roleRepository.save(new Role(ERole.ROLE_USER));
            }
            if (roleRepository.findByName(ERole.ROLE_ADMIN).isEmpty()) {
                roleRepository.save(new Role(ERole.ROLE_ADMIN));
            }
        };
    }

    @Bean
    CommandLineRunner initSampleData(UserRepository userRepository, 
                                   ConversationRepository conversationRepository,
                                   MessageRepository messageRepository,
                                   RoleRepository roleRepository,
                                   PasswordEncoder passwordEncoder) {
        return args -> {
            Role userRole = roleRepository.findByName(ERole.ROLE_USER)
                .orElseThrow(() -> new RuntimeException("Error: Role is not found."));
            
            Set<Role> roles = new HashSet<>();
            roles.add(userRole);

            // Create sample users if they don't exist
            User alice = userRepository.findByUsername("alice").orElse(null);
            if (alice == null) {
                alice = new User("alice", "alice@example.com", passwordEncoder.encode("password123"));
                alice.setBio("Life is mirror, smile at it 😊");
                alice.setPhone("6482652535");
                alice.setIsOnline(true);
                alice.setRoles(roles);
                alice = userRepository.save(alice);
            }

            User bob = userRepository.findByUsername("bob").orElse(null);
            if (bob == null) {
                bob = new User("bob", "bob@example.com", passwordEncoder.encode("password123"));
                bob.setBio("Coffee lover ☕ | Developer 💻");
                bob.setPhone("5551234567");
                bob.setIsOnline(false);
                bob.setLastSeen(LocalDateTime.now().minusHours(2));
                bob.setRoles(roles);
                bob = userRepository.save(bob);
            }

            User charlie = userRepository.findByUsername("charlie").orElse(null);
            if (charlie == null) {
                charlie = new User("charlie", "charlie@example.com", passwordEncoder.encode("password123"));
                charlie.setBio("Adventure seeker 🌍");
                charlie.setPhone("5559876543");
                charlie.setIsOnline(true);
                charlie.setRoles(roles);
                charlie = userRepository.save(charlie);
            }

            // Additional sample users
            User jelena = userRepository.findByUsername("jelena").orElse(null);
            if (jelena == null) {
                jelena = new User("jelena", "jelena@example.com", passwordEncoder.encode("password123"));
                jelena.setBio("Life is mirror, smile at it 😊");
                jelena.setPhone("6482662535");
                jelena.setIsOnline(true);
                jelena.setRoles(roles);
                jelena = userRepository.save(jelena);
            }

            User dana = userRepository.findByUsername("dana").orElse(null);
            if (dana == null) {
                dana = new User("dana", "dana@example.com", passwordEncoder.encode("password123"));
                dana.setBio("I decided to move in different direction");
                dana.setPhone("5551112222");
                dana.setIsOnline(false);
                dana.setLastSeen(LocalDateTime.now().minusHours(4));
                dana.setRoles(roles);
                dana = userRepository.save(dana);
            }

            User pedro = userRepository.findByUsername("pedro").orElse(null);
            if (pedro == null) {
                pedro = new User("pedro", "pedro@example.com", passwordEncoder.encode("password123"));
                pedro.setBio("I have no idea, man 😊");
                pedro.setPhone("5553334444");
                pedro.setIsOnline(false);
                pedro.setLastSeen(LocalDateTime.now().minusDays(1));
                pedro.setRoles(roles);
                pedro = userRepository.save(pedro);
            }

            // Create sample conversations and messages only if they don't exist
            if (conversationRepository.count() == 0) {
                // Conversation between alice and bob
                Conversation conv1 = new Conversation(alice.getId(), bob.getId());
                conv1.setLastMessage("Check this out https://short.ly/jgh82k");
                conv1.setLastMessageTime(LocalDateTime.now().minusMinutes(15));
                conv1.setLastSenderId(alice.getId());
                conv1 = conversationRepository.save(conv1);

                // Messages for alice-bob conversation
                ChatMessage msg1 = new ChatMessage(conv1.getId(), alice.getId(), 
                    "Have you seen the latest updates?", ChatMessage.MessageType.TEXT, 
                    LocalDateTime.now().minusHours(2));
                messageRepository.save(msg1);

                ChatMessage msg2 = new ChatMessage(conv1.getId(), bob.getId(), 
                    "Nope. Can you please upload it here?", ChatMessage.MessageType.TEXT, 
                    LocalDateTime.now().minusHours(1).minusMinutes(30));
                messageRepository.save(msg2);

                ChatMessage msg3 = new ChatMessage(conv1.getId(), alice.getId(), 
                    "Wait, I'm looking into it!", ChatMessage.MessageType.TEXT, 
                    LocalDateTime.now().minusHours(1));
                messageRepository.save(msg3);

                ChatMessage msg4 = new ChatMessage(conv1.getId(), bob.getId(), 
                    "I checked it. Yep, that works!", ChatMessage.MessageType.TEXT, 
                    LocalDateTime.now().minusMinutes(45));
                messageRepository.save(msg4);

                ChatMessage msg5 = new ChatMessage(conv1.getId(), alice.getId(), 
                    "Let me know if it works or not?", ChatMessage.MessageType.TEXT, 
                    LocalDateTime.now().minusMinutes(30));
                messageRepository.save(msg5);

                ChatMessage msg6 = new ChatMessage(conv1.getId(), alice.getId(), 
                    "Check this out https://short.ly/jgh82k", ChatMessage.MessageType.TEXT, 
                    LocalDateTime.now().minusMinutes(15));
                messageRepository.save(msg6);

                // Conversation between alice and charlie
                Conversation conv2 = new Conversation(alice.getId(), charlie.getId());
                conv2.setLastMessage("I can't believe it. Great Job!!!");
                conv2.setLastMessageTime(LocalDateTime.now().minusMinutes(5));
                conv2.setLastSenderId(charlie.getId());
                conv2 = conversationRepository.save(conv2);

                ChatMessage msg7 = new ChatMessage(conv2.getId(), alice.getId(), 
                    "I have no idea, man 😊", ChatMessage.MessageType.TEXT, 
                    LocalDateTime.now().minusMinutes(20));
                messageRepository.save(msg7);

                ChatMessage msg8 = new ChatMessage(conv2.getId(), charlie.getId(), 
                    "I can't believe it. Great Job!!!", ChatMessage.MessageType.TEXT, 
                    LocalDateTime.now().minusMinutes(5));
                messageRepository.save(msg8);
            }
        };
    }
}
