package com.example.auro.controller;

 
import java.util.Map;

import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.RequestBody;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;

import com.example.auro.dto.MailRequest;
import com.example.auro.service.MailService;

import jakarta.validation.Valid;

@RestController
@RequestMapping("/api/mail")
public class MailController {

    private final MailService mailService;

    public MailController(MailService mailService) {
        this.mailService = mailService;
    }

    @PostMapping("/send")
    public Map<String, Object> sendMail(@Valid @RequestBody MailRequest request) {
        mailService.sendMail(request);

        return Map.of(
                "success", true,
                "message", "Mail sent successfully"
        );
    }
}
