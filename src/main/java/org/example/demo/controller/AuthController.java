package org.example.demo.controller;

import jakarta.validation.Valid;
import org.example.demo.entity.ERole;
import org.example.demo.entity.Role;
import org.example.demo.entity.User;
import org.example.demo.entity.PasswordResetToken;
import org.example.demo.payload.request.LoginRequest;
import org.example.demo.payload.request.SignupRequest;
import org.example.demo.payload.response.JwtResponse;
import org.example.demo.payload.response.MessageResponse;
import org.example.demo.repository.RoleRepository;
import org.example.demo.repository.UserRepository;
import org.example.demo.repository.PasswordResetTokenRepository;
import org.example.demo.security.JwtUtils;
import org.example.demo.security.UserDetailsImpl;
import org.example.demo.service.EmailService;
import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.ResponseEntity;
import org.springframework.security.authentication.AuthenticationManager;
import org.springframework.security.authentication.UsernamePasswordAuthenticationToken;
import org.springframework.security.core.Authentication;
import org.springframework.security.core.context.SecurityContextHolder;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.web.bind.annotation.*;

import java.util.*;
import java.util.stream.Collectors;

@CrossOrigin(origins = "*", maxAge = 3600)
@RestController
@RequestMapping("/api/auth")
public class AuthController {
    private static final Logger logger = LoggerFactory.getLogger(AuthController.class);

    @Autowired
    AuthenticationManager authenticationManager;

    @Autowired
    UserRepository userRepository;

    @Autowired
    RoleRepository roleRepository;

    @Autowired
    PasswordEncoder encoder;

    @Autowired
    JwtUtils jwtUtils;

    @Autowired
    PasswordResetTokenRepository tokenRepository;

    @Autowired
    EmailService emailService;

    @PostMapping("/signin")
    public ResponseEntity<?> authenticateUser(@Valid @RequestBody LoginRequest loginRequest) {
        logger.info("Login attempt for email: {}", loginRequest.getEmail());
        
        try {
            Authentication authentication = authenticationManager.authenticate(
                    new UsernamePasswordAuthenticationToken(loginRequest.getEmail(), loginRequest.getPassword()));

            SecurityContextHolder.getContext().setAuthentication(authentication);
            String jwt = jwtUtils.generateJwtToken(authentication);

            UserDetailsImpl userDetails = (UserDetailsImpl) authentication.getPrincipal();
            List<String> roles = userDetails.getAuthorities().stream()
                    .map(item -> item.getAuthority())
                    .collect(Collectors.toList());

            // Fetch full user details to include bio and phone
            Optional<User> userOptional = userRepository.findByEmail(loginRequest.getEmail());
            User user = userOptional.orElse(null);

            logger.info("Login successful for email: {}", loginRequest.getEmail());
            return ResponseEntity.ok(new JwtResponse(jwt,
                    userDetails.getId(),
                    userDetails.getUsername(),
                    userDetails.getEmail(),
                    user != null ? user.getBio() : null,
                    user != null ? user.getPhone() : null,
                    roles));
        } catch (Exception e) {
            logger.error("Login failed for email: {}", loginRequest.getEmail(), e);
            return ResponseEntity.badRequest().body(new MessageResponse("Error: Invalid email or password!"));
        }
    }

    @PostMapping("/signup")
    public ResponseEntity<?> registerUser(@Valid @RequestBody SignupRequest signUpRequest) {
        logger.info("Registration attempt for email: {}, username: {}", signUpRequest.getEmail(), signUpRequest.getUsername());
        
        if (!signUpRequest.getPassword().equals(signUpRequest.getConfirmPassword())) {
            logger.warn("Password mismatch during registration for email: {}", signUpRequest.getEmail());
            return ResponseEntity
                    .badRequest()
                    .body(new MessageResponse("Error: Passwords do not match!"));
        }

        if (userRepository.existsByUsername(signUpRequest.getUsername())) {
            logger.warn("Username already exists: {}", signUpRequest.getUsername());
            return ResponseEntity
                    .badRequest()
                    .body(new MessageResponse("Error: Username is already taken!"));
        }

        if (userRepository.existsByEmail(signUpRequest.getEmail())) {
            logger.warn("Email already exists: {}", signUpRequest.getEmail());
            return ResponseEntity
                    .badRequest()
                    .body(new MessageResponse("Error: Email is already in use!"));
        }

        // Create new user's account
        User user = User.builder()
                .username(signUpRequest.getUsername())
                .email(signUpRequest.getEmail())
                .password(encoder.encode(signUpRequest.getPassword()))
                .build();

        Set<Role> roles = new HashSet<>();
        Role userRole = roleRepository.findByName(ERole.ROLE_USER)
                .orElseThrow(() -> new RuntimeException("Error: Role is not found."));
        roles.add(userRole);

        user.setRoles(roles);
        User savedUser = userRepository.save(user);
        
        logger.info("User registered successfully - ID: {}, email: {}, username: {}, roles: {}", 
            savedUser.getId(), savedUser.getEmail(), savedUser.getUsername(), savedUser.getRoles().size());

        return ResponseEntity.ok(new MessageResponse("User registered successfully!"));
    }

    @PostMapping("/forgot-password")
    public ResponseEntity<?> forgotPassword(@RequestParam String email) {
        Optional<User> userOptional = userRepository.findByEmail(email);
        if (userOptional.isEmpty()) {
            return ResponseEntity.badRequest().body(new MessageResponse("Error: Email not found!"));
        }

        User user = userOptional.get();
        String token = UUID.randomUUID().toString();
        PasswordResetToken resetToken = new PasswordResetToken(token, user, 30); // 30 mins expiry
        tokenRepository.save(resetToken);

        String resetUrl = "http://localhost:5173/reset-password?token=" + token;
        emailService.sendEmail(user.getEmail(), "Password Reset Request",
                "To reset your password, click the link below:\n" + resetUrl);

        return ResponseEntity.ok(new MessageResponse("Password reset link sent to your email!"));
    }

    @PostMapping("/reset-password")
    public ResponseEntity<?> resetPassword(@RequestParam String token, @RequestParam String newPassword) {
        Optional<PasswordResetToken> tokenOptional = tokenRepository.findByToken(token);
        if (tokenOptional.isEmpty() || tokenOptional.get().isExpired()) {
            return ResponseEntity.badRequest().body(new MessageResponse("Error: Invalid or expired token!"));
        }

        PasswordResetToken resetToken = tokenOptional.get();
        User user = resetToken.getUser();
        user.setPassword(encoder.encode(newPassword));
        userRepository.save(user);

        tokenRepository.delete(resetToken);

        return ResponseEntity.ok(new MessageResponse("Password reset successfully!"));
    }

    // Debug endpoint - remove in production
    @GetMapping("/debug/user")
    public ResponseEntity<?> debugUser(@RequestParam String email) {
        Optional<User> userOpt = userRepository.findByEmail(email);
        if (userOpt.isEmpty()) {
            return ResponseEntity.ok(new MessageResponse("User not found with email: " + email));
        }
        User user = userOpt.get();
        return ResponseEntity.ok(new MessageResponse(
            "User found - ID: " + user.getId() + 
            ", Email: " + user.getEmail() + 
            ", Username: " + user.getUsername() + 
            ", Roles: " + user.getRoles().size() +
            ", Password starts with: " + user.getPassword().substring(0, 10) + "..."
        ));
    }
}
