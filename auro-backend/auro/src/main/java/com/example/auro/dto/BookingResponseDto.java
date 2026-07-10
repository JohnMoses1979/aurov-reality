package com.example.auro.dto;

 
import java.math.BigDecimal;
import java.time.LocalDateTime;

public record BookingResponseDto(
        String id,
        Long bookingId,
        String customerName,
        String phone,
        Long ventureId,
        String venture,
        Long propertyId,
        String property,
        BigDecimal amount,
        String paymentMode,
        String remarks,
        String status,
        LocalDateTime createdAt
) {
}
