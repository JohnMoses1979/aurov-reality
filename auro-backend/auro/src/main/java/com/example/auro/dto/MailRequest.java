package com.example.auro.dto;

 
import jakarta.validation.constraints.Email;
import jakarta.validation.constraints.NotBlank;

public class MailRequest {

    @Email(message = "Receiver email must be valid")
    @NotBlank(message = "Receiver email is required")
    private String to;

    private String cc;

    @NotBlank(message = "Subject is required")
    private String subject;

    @NotBlank(message = "Message is required")
    private String message;

    public MailRequest() {
    }

    public String getTo() {
        return to;
    }

    public void setTo(String to) {
        this.to = to;
    }

    public String getCc() {
        return cc;
    }

    public void setCc(String cc) {
        this.cc = cc;
    }

    public String getSubject() {
        return subject;
    }

    public void setSubject(String subject) {
        this.subject = subject;
    }

    public String getMessage() {
        return message;
    }

    public void setMessage(String message) {
        this.message = message;
    }
}
