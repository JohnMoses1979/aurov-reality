package com.example.auro.dto;

 
import java.time.LocalDateTime;

public record ContactResponseDto(
        String id,
        Long leadId,
        String customer,
        String phone,
        String email,
        String leadType,
        Long ventureId,
        String venture,
        Long propertyId,
        String property,
        String message,
        String status,
        LocalDateTime createdAt
) {
}
