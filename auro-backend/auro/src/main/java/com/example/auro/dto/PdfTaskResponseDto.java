package com.example.auro.dto;

 
import java.time.LocalDate;
import java.time.LocalDateTime;

public record PdfTaskResponseDto(
        String id,
        Long taskId,
        String title,
        String department,
        String assignedBy,
        Long assigneeId,
        String assignee,
        String assigneeEmployeeId,
        LocalDate due,
        String status,
        String pdfName,
        LocalDateTime createdAt
) {
}
