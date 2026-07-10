package com.example.auro.dto;

 
import java.time.LocalDateTime;

public record SalesLeadRecordDto(
        String id,
        Long recordId,
        String recordType,
        String name,
        String customerName,
        String customer,
        String phone,
        String mobile,
        String email,
        String source,
        String type,
        String propertyNumber,
        String propertyName,
        String ventureName,
        String venture,
        String status,
        LocalDateTime createdAt
) {
}
