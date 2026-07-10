package com.example.auro.service;


import java.util.Collections;

import org.springframework.stereotype.Service;

import com.example.auro.dto.CalendarActivityResponse;

import lombok.RequiredArgsConstructor;

@Service
@RequiredArgsConstructor
public class LeadershipCalendarService {

    private final SubmittedWorkService submittedWorkService;

    public CalendarActivityResponse getCalendarActivities(String date) {
        return CalendarActivityResponse.builder()
                .submitted(submittedWorkService.getByDate(date))

                // Connect these later with your bookings/site-visits/complaints modules.
                .bookings(Collections.emptyList())
                .siteVisits(Collections.emptyList())
                .demoRequests(Collections.emptyList())
                .complaints(Collections.emptyList())

                .build();
    }
}
