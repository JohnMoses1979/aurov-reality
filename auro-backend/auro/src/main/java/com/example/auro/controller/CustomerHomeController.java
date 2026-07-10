package com.example.auro.controller;

 
import org.springframework.web.bind.annotation.CrossOrigin;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;

import com.example.auro.dto.CustomerHomeResponseDto;
import com.example.auro.service.CustomerHomeService;

@RestController
@RequestMapping("/api/customer")
@CrossOrigin(origins = {
        "http://localhost:3000",
        "http://localhost:5173",
        "http://localhost:8080"
})
public class CustomerHomeController {

    private final CustomerHomeService customerHomeService;

    public CustomerHomeController(CustomerHomeService customerHomeService) {
        this.customerHomeService = customerHomeService;
    }

    @GetMapping("/home")
    public CustomerHomeResponseDto getCustomerHome() {
        return customerHomeService.getCustomerHome();
    }
}
