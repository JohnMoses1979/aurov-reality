package com.example.auro.dto;

public record SalesReportsStatsDto(
        long executives,
        long assignedTasks,
        long completedTasks,
        long overallProgress
) {
}
