package com.predictive.service;

import com.predictive.dto.AuthDtos.*;
import com.predictive.entity.AppUser;
import com.predictive.repository.AppUserRepository;
import com.predictive.security.JwtTokenProvider;
import org.springframework.http.HttpStatus;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;
import org.springframework.web.server.ResponseStatusException;

import java.security.SecureRandom;
import java.time.LocalDateTime;
import java.util.Base64;

@Service
public class AuthService {

    private final AppUserRepository users;
    private final PasswordEncoder encoder;
    private final JwtTokenProvider tokenProvider;
    private final SecureRandom random = new SecureRandom();

    public AuthService(AppUserRepository users, PasswordEncoder encoder, JwtTokenProvider tokenProvider) {
        this.users = users;
        this.encoder = encoder;
        this.tokenProvider = tokenProvider;
    }

    @Transactional
    public AuthResponse register(RegisterRequest req) {
        String email = req.getEmail().trim().toLowerCase();
        if (users.existsByEmailIgnoreCase(email)) {
            throw new ResponseStatusException(HttpStatus.CONFLICT, "An account with this email already exists.");
        }

        AppUser.Role role = AppUser.Role.USER;
        if (req.getRole() != null && req.getRole().equalsIgnoreCase("ADMIN")) {
            role = AppUser.Role.ADMIN;
        }

        AppUser user = new AppUser();
        user.setFullName(req.getFullName().trim());
        user.setEmail(email);
        user.setPhone(req.getPhone());
        user.setPasswordHash(encoder.encode(req.getPassword()));
        user.setRole(role);
        user.setCreatedAt(LocalDateTime.now());
        AppUser saved = users.save(user);

        return buildAuthResponse(saved);
    }

    public AuthResponse login(LoginRequest req) {
        AppUser user = users.findByEmailIgnoreCase(req.getEmail().trim())
                .orElseThrow(() -> new ResponseStatusException(HttpStatus.UNAUTHORIZED, "Invalid email or password."));
        if (!encoder.matches(req.getPassword(), user.getPasswordHash())) {
            throw new ResponseStatusException(HttpStatus.UNAUTHORIZED, "Invalid email or password.");
        }
        return buildAuthResponse(user);
    }

    @Transactional
    public ResetTokenResponse beginPasswordReset(ForgotPasswordRequest req) {
        AppUser user = users.findByEmailIgnoreCase(req.getEmail().trim())
                .orElseThrow(() -> new ResponseStatusException(HttpStatus.NOT_FOUND, "No account found with this email."));

        byte[] buf = new byte[24];
        random.nextBytes(buf);
        String token = Base64.getUrlEncoder().withoutPadding().encodeToString(buf);

        user.setResetToken(token);
        user.setResetTokenExpiry(LocalDateTime.now().plusHours(1));
        users.save(user);

        return new ResetTokenResponse("Reset token generated.", token);
    }

    @Transactional
    public MessageResponse resetPassword(ResetPasswordRequest req) {
        AppUser user = users.findByResetToken(req.getToken())
                .orElseThrow(() -> new ResponseStatusException(HttpStatus.BAD_REQUEST, "Invalid or expired reset link."));
        if (user.getResetTokenExpiry() == null || user.getResetTokenExpiry().isBefore(LocalDateTime.now())) {
            throw new ResponseStatusException(HttpStatus.BAD_REQUEST, "Invalid or expired reset link.");
        }
        user.setPasswordHash(encoder.encode(req.getPassword()));
        user.setResetToken(null);
        user.setResetTokenExpiry(null);
        users.save(user);
        return new MessageResponse("Password updated successfully. Please log in.");
    }

    private AuthResponse buildAuthResponse(AppUser user) {
        String token = tokenProvider.generateToken(
                user.getId(),
                user.getEmail(),
                user.getRole().name(),
                user.getFullName());
        UserDto dto = new UserDto(
                user.getId(),
                user.getFullName(),
                user.getEmail(),
                user.getPhone(),
                user.getRole().name());
        return new AuthResponse(token, tokenProvider.getValidityMs(), dto);
    }
}
