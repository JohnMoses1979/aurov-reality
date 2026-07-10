package com.example.auro.dto;

 
import java.time.LocalDate;
import java.time.LocalDateTime;

public record SiteVisitResponseDto(
        String id,
        Long visitId,
        String customer,
        String phone,
        String email,
        String type,
        Long ventureId,
        String venture,
        Long propertyId,
        String property,
        LocalDate date,
        String timeSlot,
        String status,
        LocalDateTime createdAt
) {
}
