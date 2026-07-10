package com.example.auro.controller;

import org.springframework.web.bind.annotation.CrossOrigin;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RequestParam;
import org.springframework.web.bind.annotation.RestController;

import com.example.auro.dto.CustomerPropertiesPageResponseDto;
import com.example.auro.service.CustomerPropertiesService;

@RestController
@RequestMapping("/api/customer")
@CrossOrigin(origins = {
        "http://localhost:3000",
        "http://localhost:5173",
        "http://localhost:8080"
})
public class CustomerPropertiesController {

    private final CustomerPropertiesService customerPropertiesService;

    public CustomerPropertiesController(CustomerPropertiesService customerPropertiesService) {
        this.customerPropertiesService = customerPropertiesService;
    }

    @GetMapping("/properties-page")
    public CustomerPropertiesPageResponseDto getPropertiesPage(
            @RequestParam(name = "ventureId", required = false) Long ventureId
    ) {
        return customerPropertiesService.getPropertiesPage(ventureId);
    }
}
