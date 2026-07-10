package com.example.auro.controller;

 
import org.springframework.web.bind.annotation.CrossOrigin;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.RequestBody;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;

import com.example.auro.dto.BookPropertyRequestDto;
import com.example.auro.dto.BookingOptionsResponseDto;
import com.example.auro.dto.BookingResponseDto;
import com.example.auro.service.BookPropertyService;

@RestController
@RequestMapping("/api/customer")
@CrossOrigin(origins = {
        "http://localhost:3000",
        "http://localhost:5173",
        "http://localhost:8080"
})
public class CustomerBookingController {

    private final BookPropertyService bookPropertyService;

    public CustomerBookingController(BookPropertyService bookPropertyService) {
        this.bookPropertyService = bookPropertyService;
    }

    @GetMapping("/booking-options")
    public BookingOptionsResponseDto getBookingOptions() {
        return bookPropertyService.getBookingOptions();
    }

    @PostMapping("/book-property")
    public BookingResponseDto bookProperty(@RequestBody BookPropertyRequestDto request) {
        return bookPropertyService.bookProperty(request);
    }
}
