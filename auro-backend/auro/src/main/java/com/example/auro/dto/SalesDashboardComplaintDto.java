package com.example.auro.dto;

public record SalesDashboardComplaintDto(
        String id,
        Long complaintId,
        String subject,
        String employeeName,
        String employeeId,
        String status
) {
}
