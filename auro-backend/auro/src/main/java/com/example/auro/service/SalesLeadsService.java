package com.example.auro.service;

 
import java.util.List;

import com.example.auro.dto.SalesLeadRecordDto;

public interface SalesLeadsService {

    List<SalesLeadRecordDto> getLeadsAndBookings();

    SalesLeadRecordDto updateLeadStatus(Long leadId, String status);

    SalesLeadRecordDto updateBookingStatus(Long bookingId, String status);
}
