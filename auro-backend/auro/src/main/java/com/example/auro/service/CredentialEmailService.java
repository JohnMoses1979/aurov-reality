package com.example.auro.service;

import java.util.Collection;
import java.util.LinkedHashSet;
import java.util.Set;

import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.beans.factory.ObjectProvider;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.mail.SimpleMailMessage;
import org.springframework.mail.javamail.JavaMailSender;
import org.springframework.stereotype.Service;

import com.example.auro.entity.UserAccount;

@Service
public class CredentialEmailService {
    private static final Logger log = LoggerFactory.getLogger(CredentialEmailService.class);

    private final ObjectProvider<JavaMailSender> mailSenderProvider;
    private final String fromAddress;

    public CredentialEmailService(
            ObjectProvider<JavaMailSender> mailSenderProvider,
            @Value("${app.mail.from:${spring.mail.username:}}") String fromAddress
    ) {
        this.mailSenderProvider = mailSenderProvider;
        this.fromAddress = fromAddress;
    }

    public DeliveryResult sendCreatedCredentials(UserAccount user, String temporaryPassword) {
        Set<String> recipients = new LinkedHashSet<>();
        if (user.getEmail() != null && !user.getEmail().isBlank()) {
            recipients.add(user.getEmail().trim());
        }
        return sendCredentials(
                recipients,
                "Your Aurov Reality login credentials",
                buildCreatedMessage(user, temporaryPassword)
        );
    }

    public DeliveryResult sendUpdatedCredentials(UserAccount user, String temporaryPassword, Collection<String> leadershipEmails) {
        Set<String> recipients = new LinkedHashSet<>();
        if (user.getEmail() != null && !user.getEmail().isBlank()) {
            recipients.add(user.getEmail().trim());
        }
        if (leadershipEmails != null) {
            leadershipEmails.stream()
                    .filter(email -> email != null && !email.isBlank())
                    .map(String::trim)
                    .forEach(recipients::add);
        }
        return sendCredentials(recipients, "Updated Aurov Reality login credentials", buildUpdatedMessage(user, temporaryPassword));
    }

    private DeliveryResult sendCredentials(Collection<String> recipients, String subject, String body) {
        if (recipients == null || recipients.isEmpty()) {
            log.warn("No recipient email configured for credential email.");
            return new DeliveryResult(false, "No recipient email configured.");
        }

        JavaMailSender mailSender = mailSenderProvider.getIfAvailable();
        if (mailSender == null || !isConfiguredAddress(fromAddress)) {
            log.warn("Mail sender is not configured with a real sender address. Skipping credential email for {}", recipients);
            log.debug("Credential email body: {}", body);
            return new DeliveryResult(false, "Mail sender is not configured. Set SPRING_MAIL_USERNAME and SPRING_MAIL_PASSWORD.");
        }

        boolean sent = false;
        String lastMessage = "Credential email was not sent.";

        for (String recipient : recipients) {
            try {
                SimpleMailMessage message = new SimpleMailMessage();
                message.setTo(recipient);
                message.setFrom(fromAddress);
                message.setSubject(subject);
                message.setText(body);
                mailSender.send(message);
                sent = true;
                lastMessage = "Credential email sent.";
                log.info("Credential email sent to {}", recipient);
            } catch (Exception error) {
                lastMessage = error.getMessage() == null ? "Unable to send credential email." : error.getMessage();
                log.warn("Unable to send credential email to {}", recipient, error);
            }
        }

        return new DeliveryResult(sent, lastMessage);
    }

    private String buildCreatedMessage(UserAccount user, String temporaryPassword) {
        return "Hello " + user.getFullName() + ",\n\n"
                + "Your Aurov Reality account has been created.\n"
                + "Role: " + user.getRole() + "\n"
                + "Employee ID: " + safe(user.getEmployeeId()) + "\n"
                + "Username: " + safe(user.getUsername()) + "\n"
                + "Password: " + safe(temporaryPassword) + "\n"
                + "Login Page: " + "/login" + "\n\n"
                + "Please log in with these credentials and change the password if needed.";
    }

    private String buildUpdatedMessage(UserAccount user, String temporaryPassword) {
        return "Hello " + user.getFullName() + ",\n\n"
                + "Your Aurov Reality password has been updated.\n"
                + "Role: " + user.getRole() + "\n"
                + "Username: " + safe(user.getUsername()) + "\n"
                + "Password: " + safe(temporaryPassword) + "\n\n"
                + "Managing Director and Operational Head have also been notified.";
    }

    private boolean isConfiguredAddress(String value) {
        return value != null && !value.isBlank() && !value.toLowerCase().startsWith("replace_with_");
    }

    public record DeliveryResult(boolean sent, String message) {
    }

    private String safe(String value) {
        return value == null ? "" : value;
    }
}
