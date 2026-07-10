package com.example.auro.dto;

import com.example.auro.entity.Employee;
import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Getter;
import lombok.NoArgsConstructor;
import lombok.Setter;

@Getter
@Setter
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class ManagerOptionResponse {

    private Long id;

    private String employeeId;

    private String name;

    private String username;

    private String role;

    private String department;

    public static ManagerOptionResponse fromEntity(Employee employee) {
        return ManagerOptionResponse.builder()
                .id(employee.getId())
                .employeeId(employee.getEmployeeId())
                .name(employee.getName())
                .username(employee.getUsername())
                .role(employee.getRole())
                .department(employee.getDepartment())
                .build();
    }
}
