package com.example.auro.controller;

 
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RequestParam;
import org.springframework.web.bind.annotation.RestController;

import com.example.auro.dto.CalendarActivityResponse;
import com.example.auro.service.LeadershipCalendarService;

import lombok.RequiredArgsConstructor;

@RestController
@RequestMapping("/api/leadership/calendar")
@RequiredArgsConstructor
public class LeadershipCalendarController {

    private final LeadershipCalendarService service;

    @GetMapping
    @PreAuthorize("hasAnyAuthority('Managing Director','Operational Head','Admin','Super Admin')")
    public CalendarActivityResponse getActivities(
            @RequestParam String date
    ) {
        return service.getCalendarActivities(date);
    }
}

