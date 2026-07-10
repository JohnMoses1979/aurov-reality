package com.example.auro.dto;

 
import java.util.List;

public record EmployeeManagementPageResponse(
        Boolean canManage,
        String currentRole,
        String currentDepartment,
        List<String> roleOptions,
        List<EmployeeResponse> employees
) {
}
