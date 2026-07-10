package com.example.auro.dto;

public record PdfTaskAssigneeDto(
        Long id,
        String employeeId,
        String name,
        String department,
        String role,
        String status
) {
}
