package com.example.auro.dto;



public record TaskAssigneeDto(
        Long id,
        String employeeId,
        String name,
        String department,
        String role,
        String status
) {
}
