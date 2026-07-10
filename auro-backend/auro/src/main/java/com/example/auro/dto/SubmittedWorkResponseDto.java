package com.example.auro.dto;

import java.time.LocalDate;
import java.time.LocalDateTime;

public record SubmittedWorkResponseDto(
        String id,
        Long workId,
        String title,
        String description,
        LocalDate submissionDate,
        String department,
        String managerName,
        String managerRole,
        String employeeId,
        String employeeEmail,
        SubmittedWorkPdfDto pdf,
        String status,
        String remarks,
        LocalDateTime createdAt
) {
}
