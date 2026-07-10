package com.example.auro.controller;

import com.example.auro.dto.SalesLeadRecordDto;
import com.example.auro.dto.SalesLeadStatusUpdateRequestDto;
import com.example.auro.service.SalesLeadsService;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@RestController
@RequestMapping("/api/sales/leads")
@CrossOrigin(origins = {
        "http://localhost:3000",
        "http://localhost:5173",
        "http://localhost:8080"
})
public class SalesLeadsController {

    private final SalesLeadsService salesLeadsService;

    public SalesLeadsController(SalesLeadsService salesLeadsService) {
        this.salesLeadsService = salesLeadsService;
    }

    @GetMapping
    public List<SalesLeadRecordDto> getLeadsAndBookings() {
        return salesLeadsService.getLeadsAndBookings();
    }

    @PatchMapping("/customer-leads/{leadId}/status")
    public SalesLeadRecordDto updateLeadStatus(
            @PathVariable Long leadId,
            @RequestBody SalesLeadStatusUpdateRequestDto request
    ) {
        return salesLeadsService.updateLeadStatus(
                leadId,
                request.getStatus()
        );
    }

    @PatchMapping("/bookings/{bookingId}/status")
    public SalesLeadRecordDto updateBookingStatus(
            @PathVariable Long bookingId,
            @RequestBody SalesLeadStatusUpdateRequestDto request
    ) {
        return salesLeadsService.updateBookingStatus(
                bookingId,
                request.getStatus()
        );
    }
}
