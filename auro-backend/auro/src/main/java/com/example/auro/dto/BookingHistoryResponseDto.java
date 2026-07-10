package com.example.auro.dto;

 
import java.math.BigDecimal;
import java.time.LocalDateTime;

public record BookingHistoryResponseDto(
        String id,
        Long bookingId,
        String customer,
        String phone,
        String type,
        String venture,
        String property,
        BigDecimal amount,
        String paymentMode,
        String remarks,
        String status,
        LocalDateTime createdAt
) {
}
