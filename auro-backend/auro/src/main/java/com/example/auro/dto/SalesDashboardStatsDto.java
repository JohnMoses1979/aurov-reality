package com.example.auro.dto;

public record SalesDashboardStatsDto(
        long executives,
        long assignedTasks,
        long submittedTasks,
        long completedTasks,
        long overallProgress
) {
}
