package com.example.auro.dto;

 
import java.util.List;

import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Getter;
import lombok.NoArgsConstructor;
import lombok.Setter;

@Getter
@Setter
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class CalendarActivityResponse {

    private List<SubmittedWorkResponse> submitted;

    private List<Object> bookings;

    private List<Object> siteVisits;

    private List<Object> demoRequests;

    private List<Object> complaints;
}
