package com.example.auro.dto;


public record SalesExecutiveReportDto(
        Long id,
        String employeeId,
        String name,
        String email,
        String username,
        String role,
        String status,
        long assigned,
        long completed,
        long percent
) {
}
