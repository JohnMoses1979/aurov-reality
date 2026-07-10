package com.example.auro.dto;

import java.time.LocalDate;
import java.util.List;

public record EmployeeRequest(
        String firstName,
        String lastName,
        String email,
        String mobileNumber,
        String address,
        String department,
        String role,
        String designation,
        String password,
        LocalDate joiningDate,
        String status,
        List<EmployeeDocumentRequest> documents,
        List<Long> existingDocumentIds
) {
}
