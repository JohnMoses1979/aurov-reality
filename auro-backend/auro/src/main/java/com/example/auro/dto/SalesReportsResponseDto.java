package com.example.auro.dto;

import java.util.List;

public record SalesReportsResponseDto(
        SalesReportsStatsDto stats,
        List<SalesExecutiveReportDto> executives,
        List<SalesTaskReportDto> tasks
) {
}
