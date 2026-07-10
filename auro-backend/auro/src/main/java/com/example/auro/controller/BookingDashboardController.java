package com.example.auro.controller;

 
import java.util.List;

import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;

import com.example.auro.dto.BookingDashboardResponse;
import com.example.auro.service.BookingDashboardService;

import lombok.RequiredArgsConstructor;

@RestController
@RequestMapping("/api/bookings")
@RequiredArgsConstructor
public class BookingDashboardController {

    private final BookingDashboardService bookingDashboardService;

    @GetMapping
    public List<BookingDashboardResponse> getAllBookings() {
        return bookingDashboardService.getAllBookings();
    }
}
