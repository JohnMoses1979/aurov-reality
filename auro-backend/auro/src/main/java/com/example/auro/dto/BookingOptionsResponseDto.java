package com.example.auro.dto;

 
import java.util.List;

public record BookingOptionsResponseDto(
        List<BookingOptionVentureDto> ventures,
        List<BookingOptionPropertyDto> properties
) {
}
