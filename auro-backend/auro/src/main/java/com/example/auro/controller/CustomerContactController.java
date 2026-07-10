package com.example.auro.controller;

 
import org.springframework.web.bind.annotation.CrossOrigin;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.RequestBody;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;

import com.example.auro.dto.ContactOptionsResponseDto;
import com.example.auro.dto.ContactRequestDto;
import com.example.auro.dto.ContactResponseDto;
import com.example.auro.service.ContactService;

@RestController
@RequestMapping("/api/customer")
@CrossOrigin(origins = {
        "http://localhost:3000",
        "http://localhost:5173",
        "http://localhost:8080"
})
public class CustomerContactController {

    private final ContactService contactService;

    public CustomerContactController(ContactService contactService) {
        this.contactService = contactService;
    }

    @GetMapping("/contact-options")
    public ContactOptionsResponseDto getContactOptions() {
        return contactService.getContactOptions();
    }

    @PostMapping("/contact-requests")
    public ContactResponseDto createContactRequest(@RequestBody ContactRequestDto request) {
        return contactService.createContactRequest(request);
    }
}
