package com.example.auro.service;

import org.springframework.beans.factory.annotation.Value;
import org.springframework.mail.javamail.JavaMailSender;
import org.springframework.mail.javamail.MimeMessageHelper;
import org.springframework.stereotype.Service;

import com.example.auro.dto.MailRequest;

import jakarta.mail.internet.MimeMessage;

@Service
public class MailService {

    private final JavaMailSender mailSender;

    @Value("${app.mail.from:${spring.mail.username:}}")
    private String fromEmail;

    @Value("${app.mail.name:Aurov Reality}")
    private String fromName;

    public MailService(JavaMailSender mailSender) {
        this.mailSender = mailSender;
    }

    public void sendMail(MailRequest request) {
        try {
            MimeMessage message = mailSender.createMimeMessage();

            MimeMessageHelper helper = new MimeMessageHelper(message, true, "UTF-8");

            helper.setFrom(fromEmail, fromName);
            helper.setTo(request.getTo().trim());

            if (request.getCc() != null && !request.getCc().isBlank()) {
                helper.setCc(request.getCc().trim());
            }

            helper.setSubject(request.getSubject().trim());

            String htmlBody = buildHtmlBody(request.getMessage());

            helper.setText(htmlBody, true);

            mailSender.send(message);
        } catch (Exception exception) {
            throw new RuntimeException("Unable to send mail: " + exception.getMessage());
        }
    }

    private String buildHtmlBody(String message) {
        String safeMessage = message == null ? "" : message.replace("\n", "<br/>");

        return """
                <div style="font-family: Arial, sans-serif; background:#f8fafc; padding:24px;">
                    <div style="max-width:640px; margin:auto; background:white; border-radius:16px; padding:24px; border:1px solid #e5e7eb;">
                        <h2 style="color:#0B3D91; margin-top:0;">Aurov Reality</h2>
                        <p style="font-size:15px; color:#334155; line-height:1.7;">
                            %s
                        </p>
                        <hr style="border:none; border-top:1px solid #e5e7eb; margin:24px 0;" />
                        <p style="font-size:12px; color:#64748b;">
                            This email was sent from Aurov Reality Portal.
                        </p>
                    </div>
                </div>
                """.formatted(safeMessage);
    }
}
