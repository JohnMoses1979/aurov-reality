package com.example.auro.dto;

import java.util.List;

public record EmployeeManagementResponseDto(
        boolean canManage,
        String currentRole,
        String currentDepartment,
        List<String> roleOptions,
        List<EmployeeResponseDto> employees
) {
}
