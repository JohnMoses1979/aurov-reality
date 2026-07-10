package com.example.auro.service;

 
import java.util.List;

import com.example.auro.dto.SalesCustomerActivityDto;

public interface SalesCustomerActivityService {

    List<SalesCustomerActivityDto> getCustomerActivity();

    SalesCustomerActivityDto updateLeadStatus(Long leadId, String status);

    SalesCustomerActivityDto updateBookingStatus(Long bookingId, String status);
}
