package com.example.auro.controller;

 
import java.util.List;

import org.springframework.web.bind.annotation.CrossOrigin;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.PatchMapping;
import org.springframework.web.bind.annotation.PathVariable;
import org.springframework.web.bind.annotation.RequestBody;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;

import com.example.auro.dto.SalesCustomerActivityDto;
import com.example.auro.dto.StatusUpdateRequestDto;
import com.example.auro.service.SalesCustomerActivityService;

@RestController
@RequestMapping("/api/sales/customer-activity")
@CrossOrigin(origins = {
        "http://localhost:3000",
        "http://localhost:5173",
        "http://localhost:8080"
})
public class SalesCustomerActivityController {

    private final SalesCustomerActivityService salesCustomerActivityService;

    public SalesCustomerActivityController(
            SalesCustomerActivityService salesCustomerActivityService
    ) {
        this.salesCustomerActivityService = salesCustomerActivityService;
    }

    @GetMapping
    public List<SalesCustomerActivityDto> getCustomerActivity() {
        return salesCustomerActivityService.getCustomerActivity();
    }

    @PatchMapping("/leads/{leadId}/status")
    public SalesCustomerActivityDto updateLeadStatus(
            @PathVariable Long leadId,
            @RequestBody StatusUpdateRequestDto request
    ) {
        return salesCustomerActivityService.updateLeadStatus(
                leadId,
                request.getStatus()
        );
    }

    @PatchMapping("/bookings/{bookingId}/status")
    public SalesCustomerActivityDto updateBookingStatus(
            @PathVariable Long bookingId,
            @RequestBody StatusUpdateRequestDto request
    ) {
        return salesCustomerActivityService.updateBookingStatus(
                bookingId,
                request.getStatus()
        );
    }
}
