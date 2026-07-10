package com.example.auro.dto;

public record ComplaintHistoryDto(
        String status,
        String note,
        String remarks,
        String updatedBy,
        String updatedByRole,
        String dateTime
) {
}
