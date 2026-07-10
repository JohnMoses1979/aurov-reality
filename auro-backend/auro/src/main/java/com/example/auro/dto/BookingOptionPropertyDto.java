package com.example.auro.dto;

 
import java.math.BigDecimal;

public record BookingOptionPropertyDto(
        Long id,
        Long ventureId,
        String type,
        String number,
        String area,
        BigDecimal price,
        String status
) {
}
