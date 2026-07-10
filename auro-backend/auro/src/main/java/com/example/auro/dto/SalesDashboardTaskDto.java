package com.example.auro.dto;

import java.time.LocalDateTime;

public record SalesDashboardTaskDto(
        String id,
        Long taskId,
        String title,
        String assignee,
        String assigneeEmployeeId,
        String status,
        String date,
        SalesDashboardFileDto updatePdf,
        SalesDashboardFileDto completionPdf,
        LocalDateTime createdAt
) {
}
