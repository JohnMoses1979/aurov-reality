package com.example.auro.service;

import com.example.auro.dto.NotificationResponse;
import com.example.auro.entity.Notification;
import com.example.auro.entity.UserAccount;
import com.example.auro.repository.NotificationRepository;
import com.example.auro.repository.UserRepository;
import com.example.auro.security.UserPrincipal;
import java.time.LocalDateTime;
import java.util.Collection;
import java.util.LinkedHashMap;
import java.util.LinkedHashSet;
import java.util.List;
import java.util.Map;
import java.util.Optional;
import java.util.Set;
import org.springframework.security.access.AccessDeniedException;
import org.springframework.security.core.Authentication;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

@Service
public class NotificationService {

    private final NotificationRepository notificationRepository;
    private final UserRepository userRepository;

    public NotificationService(NotificationRepository notificationRepository, UserRepository userRepository) {
        this.notificationRepository = notificationRepository;
        this.userRepository = userRepository;
    }

    @Transactional(readOnly = true)
    public Map<String, Object> getMyNotifications(Authentication authentication) {
        UserAccount user = requireUser(authentication);
        List<NotificationResponse> notifications = notificationRepository
                .findByRecipientUserIdOrderByCreatedAtDesc(user.getId())
                .stream()
                .limit(50)
                .map(NotificationResponse::from)
                .toList();

        long unreadCount = notifications.stream().filter(item -> !item.read()).count();

        Map<String, Object> response = new LinkedHashMap<>();
        response.put("notifications", notifications);
        response.put("unreadCount", unreadCount);
        return response;
    }

    @Transactional
    public NotificationResponse markAsRead(Long id, Authentication authentication) {
        UserAccount user = requireUser(authentication);
        Notification notification = notificationRepository.findByIdAndRecipientUserId(id, user.getId())
                .orElseThrow(() -> new AccessDeniedException("Notification not found"));

        if (!notification.isRead()) {
            notification.setRead(true);
            notification.setReadAt(LocalDateTime.now());
            notification = notificationRepository.save(notification);
        }

        return NotificationResponse.from(notification);
    }

    @Transactional
    public void markAllAsRead(Authentication authentication) {
        UserAccount user = requireUser(authentication);
        List<Notification> notifications = notificationRepository.findByRecipientUserIdOrderByCreatedAtDesc(user.getId());
        LocalDateTime now = LocalDateTime.now();
        boolean changed = false;

        for (Notification notification : notifications) {
            if (!notification.isRead()) {
                notification.setRead(true);
                notification.setReadAt(now);
                changed = true;
            }
        }

        if (changed) {
            notificationRepository.saveAll(notifications);
        }
    }

    @Transactional
    public void notifyRoles(Collection<String> roles, String type, String title, String message, String entityType, String entityId) {
        if (roles == null || roles.isEmpty()) {
            return;
        }

        Set<Long> recipientIds = new LinkedHashSet<>();
        for (String role : roles) {
            if (role == null || role.isBlank()) {
                continue;
            }
            userRepository.findByRoleIgnoreCaseAndActiveTrue(role.trim())
                    .forEach(user -> recipientIds.add(user.getId()));
        }

        createNotificationsByIds(recipientIds, type, title, message, entityType, entityId, null);
    }

    @Transactional
    public void notifyRole(String role, String type, String title, String message, String entityType, String entityId) {
        notifyRoles(List.of(role), type, title, message, entityType, entityId);
    }

    @Transactional
    public void notifyUserId(Long userId, String type, String title, String message, String entityType, String entityId) {
        if (userId == null) {
            return;
        }
        createNotificationsByIds(Set.of(userId), type, title, message, entityType, entityId, null);
    }

    @Transactional
    public void notifyUserByIdentifier(String identifier, String type, String title, String message, String entityType, String entityId) {
        if (identifier == null || identifier.isBlank()) {
            return;
        }
        userRepository.findByLoginIdentifier(identifier.trim())
                .ifPresent(user -> createNotifications(List.of(user), type, title, message, entityType, entityId, null));
    }

    @Transactional
    public void notifyCustomerByPhone(String phone, String type, String title, String message, String entityType, String entityId) {
        String normalized = normalizeMobile(phone);
        if (normalized == null) {
            return;
        }
        userRepository.findByMobile(normalized)
                .ifPresent(user -> createNotifications(List.of(user), type, title, message, entityType, entityId, "/customer/home"));
    }

    @Transactional
    public void notifyUsers(Collection<UserAccount> users, String type, String title, String message, String entityType, String entityId) {
        createNotifications(users, type, title, message, entityType, entityId, null);
    }

    private void createNotificationsByIds(Collection<Long> userIds, String type, String title, String message, String entityType, String entityId, String targetPath) {
        if (userIds == null || userIds.isEmpty()) {
            return;
        }
        List<UserAccount> users = userRepository.findAllById(userIds).stream()
                .filter(UserAccount::isActive)
                .toList();
        createNotifications(users, type, title, message, entityType, entityId, targetPath);
    }

    private void createNotifications(Collection<UserAccount> users, String type, String title, String message, String entityType, String entityId, String targetPath) {
        if (users == null || users.isEmpty() || title == null || title.isBlank()) {
            return;
        }

        Set<Long> seenIds = new LinkedHashSet<>();
        List<Notification> notifications = users.stream()
                .filter(user -> user != null && user.getId() != null && user.isActive())
                .filter(user -> seenIds.add(user.getId()))
                .map(user -> buildNotification(user, type, title, message, entityType, entityId, targetPath))
                .toList();

        if (!notifications.isEmpty()) {
            notificationRepository.saveAll(notifications);
        }
    }

    private Notification buildNotification(UserAccount user, String type, String title, String message, String entityType, String entityId, String targetPath) {
        Notification notification = new Notification();
        notification.setRecipientUser(user);
        notification.setType(blankOrDefault(type, "Update"));
        notification.setTitle(title.trim());
        notification.setMessage(message == null ? "" : message.trim());
        notification.setEntityType(blankOrDefault(entityType, "GENERAL"));
        notification.setEntityId(entityId == null ? "" : entityId.trim());
        notification.setTargetPath(targetPath);
        return notification;
    }

    private UserAccount requireUser(Authentication authentication) {
        if (authentication == null) {
            throw new AccessDeniedException("Login required");
        }

        Object principal = authentication.getPrincipal();
        if (principal instanceof UserPrincipal userPrincipal) {
            return userPrincipal.getUser();
        }
        if (principal instanceof UserAccount userAccount) {
            return userAccount;
        }

        Optional<UserAccount> byIdentifier = userRepository.findByLoginIdentifier(authentication.getName());
        return byIdentifier.orElseThrow(() -> new AccessDeniedException("Login required"));
    }

    private String normalizeMobile(String phone) {
        if (phone == null || phone.isBlank()) {
            return null;
        }
        String digits = phone.replaceAll("\\D", "");
        if (digits.length() > 10) {
            digits = digits.substring(digits.length() - 10);
        }
        return digits.length() == 10 ? digits : null;
    }

    private String blankOrDefault(String value, String fallback) {
        return value == null || value.isBlank() ? fallback : value.trim();
    }
}
