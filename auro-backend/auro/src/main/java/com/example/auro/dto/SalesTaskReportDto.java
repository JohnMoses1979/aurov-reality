package com.example.auro.dto;

public record SalesTaskReportDto(
        String id,
        Long taskId,
        String title,
        String assignee,
        String assigneeEmployeeId,
        String pdfName,
        String status,
        String updatedAt
) {
}
