package com.example.auro.controller;

import java.util.List;

import org.springframework.web.bind.annotation.CrossOrigin;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RequestParam;
import org.springframework.web.bind.annotation.RestController;

import com.example.auro.dto.BookingHistoryResponseDto;
import com.example.auro.service.BookingHistoryService;

@RestController
@RequestMapping("/api/customer")
@CrossOrigin(origins = {
        "http://localhost:3000",
        "http://localhost:5173",
        "http://localhost:8080"
})
public class CustomerBookingHistoryController {

    private final BookingHistoryService bookingHistoryService;

    public CustomerBookingHistoryController(BookingHistoryService bookingHistoryService) {
        this.bookingHistoryService = bookingHistoryService;
    }

    @GetMapping("/bookings")
    public List<BookingHistoryResponseDto> getBookings(
            @RequestParam(name = "phone", required = false) String phone
    ) {
        return bookingHistoryService.getBookingsByPhone(phone);
    }
}
