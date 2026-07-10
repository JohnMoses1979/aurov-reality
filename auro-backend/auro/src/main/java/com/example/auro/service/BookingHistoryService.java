package com.example.auro.service;

 
import java.util.List;

import com.example.auro.dto.BookingHistoryResponseDto;

public interface BookingHistoryService {

    List<BookingHistoryResponseDto> getAllBookings();

    List<BookingHistoryResponseDto> getBookingsByPhone(String phone);
}
