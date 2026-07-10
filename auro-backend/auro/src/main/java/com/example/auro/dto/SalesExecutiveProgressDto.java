package com.example.auro.dto;

public record SalesExecutiveProgressDto(
        Long id,
        String employeeId,
        String name,
        String email,
        String username,
        String role,
        String status,
        long totalTasks,
        long completedTasks,
        long progressPercent
) {
}
