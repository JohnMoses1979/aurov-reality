package com.example.auro.dto;

import com.example.auro.entity.Employee;
import com.example.auro.entity.EmployeeDocument;

import java.time.LocalDate;
import java.time.LocalDateTime;
import java.util.List;

public record EmployeeResponse(
        Long id,
        String employeeId,
        String firstName,
        String lastName,
        String name,
        String email,
        String mobileNumber,
        String phone,
        String address,
        String department,
        String role,
        String designation,
        String username,
        String password,
        String status,
        LocalDate joiningDate,
        String createdBy,
        LocalDateTime createdAt,
        List<EmployeeDocumentResponse> documents,
        Boolean credentialEmailSent,
        String credentialEmailMessage
) {
    public static EmployeeResponse from(Employee employee) {
        return from(employee, null, null, null);
    }

    public static EmployeeResponse from(Employee employee, String password) {
        return from(employee, password, null, null);
    }

    public static EmployeeResponse from(
            Employee employee,
            String password,
            Boolean credentialEmailSent,
            String credentialEmailMessage
    ) {
        List<EmployeeDocumentResponse> docs = employee.getDocuments() == null
                ? List.of()
                : employee.getDocuments().stream().map(EmployeeResponse::toDocumentResponse).toList();

        return new EmployeeResponse(
                employee.getId(),
                employee.getEmployeeId(),
                employee.getFirstName(),
                employee.getLastName(),
                employee.getName(),
                employee.getEmail(),
                employee.getMobileNumber(),
                employee.getMobileNumber(),
                employee.getAddress(),
                employee.getDepartment(),
                employee.getRole(),
                employee.getDesignation(),
                employee.getUsername(),
                password,
                employee.getStatus(),
                employee.getJoiningDate(),
                employee.getCreatedBy(),
                employee.getCreatedAt(),
                docs,
                credentialEmailSent,
                credentialEmailMessage
        );
    }

    private static EmployeeDocumentResponse toDocumentResponse(EmployeeDocument document) {
        return new EmployeeDocumentResponse(
                document.getId(),
                document.getName(),
                document.getSize(),
                document.getType(),
                document.getUrl(),
                document.getUploadedAt()
        );
    }
}