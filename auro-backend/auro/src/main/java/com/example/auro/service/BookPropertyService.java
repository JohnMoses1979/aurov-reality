package com.example.auro.service;

 
import com.example.auro.dto.BookPropertyRequestDto;
import com.example.auro.dto.BookingOptionsResponseDto;
import com.example.auro.dto.BookingResponseDto;

public interface BookPropertyService {

    BookingOptionsResponseDto getBookingOptions();

    BookingResponseDto bookProperty(BookPropertyRequestDto request);
}
