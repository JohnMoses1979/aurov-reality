package com.example.auro.dto;

import java.util.List;

public record SalesDashboardResponseDto(
        SalesDashboardStatsDto stats,
        List<SalesExecutiveProgressDto> executives,
        List<SalesDashboardTaskDto> submittedTasks,
        List<SalesDashboardActivityDto> recentActivity,
        List<SalesDashboardCustomerDto> customers,
        List<SalesDashboardComplaintDto> complaints
) {
}
