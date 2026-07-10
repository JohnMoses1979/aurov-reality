package com.example.auro.dto;

import java.time.LocalDate;
import java.util.List;

public class EmployeeResponseDto {
    private final Long id;
    private final String employeeId;
    private final String firstName;
    private final String lastName;
    private final String name;
    private final String email;
    private final String mobileNumber;
    private final String phone;
    private final String address;
    private final String department;
    private final String role;
    private final String designation;
    private final LocalDate joiningDate;
    private final String username;
    private final String password;
    private final String status;
    private final String aadhaarImageUrl;
    private final String panImageUrl;
    private final String createdBy;
    private final String createdAt;
    private final List<EmployeeDocumentDto> documents;

    public EmployeeResponseDto(
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
            LocalDate joiningDate,
            String username,
            String password,
            String status,
            String aadhaarImageUrl,
            String panImageUrl,
            String createdBy,
            String createdAt,
            List<EmployeeDocumentDto> documents
    ) {
        this.id = id;
        this.employeeId = employeeId;
        this.firstName = firstName;
        this.lastName = lastName;
        this.name = name;
        this.email = email;
        this.mobileNumber = mobileNumber;
        this.phone = phone;
        this.address = address;
        this.department = department;
        this.role = role;
        this.designation = designation;
        this.joiningDate = joiningDate;
        this.username = username;
        this.password = password;
        this.status = status;
        this.aadhaarImageUrl = aadhaarImageUrl;
        this.panImageUrl = panImageUrl;
        this.createdBy = createdBy;
        this.createdAt = createdAt;
        this.documents = documents;
    }

    public Long getId() {
        return id;
    }

    public String getEmployeeId() {
        return employeeId;
    }

    public String getFirstName() {
        return firstName;
    }

    public String getLastName() {
        return lastName;
    }

    public String getName() {
        return name;
    }

    public String getEmail() {
        return email;
    }

    public String getMobileNumber() {
        return mobileNumber;
    }

    public String getPhone() {
        return phone;
    }

    public String getAddress() {
        return address;
    }

    public String getDepartment() {
        return department;
    }

    public String getRole() {
        return role;
    }

    public String getDesignation() {
        return designation;
    }

    public LocalDate getJoiningDate() {
        return joiningDate;
    }

    public String getUsername() {
        return username;
    }

    public String getPassword() {
        return password;
    }

    public String getStatus() {
        return status;
    }

    public String getAadhaarImageUrl() {
        return aadhaarImageUrl;
    }

    public String getPanImageUrl() {
        return panImageUrl;
    }

    public String getCreatedBy() {
        return createdBy;
    }

    public String getCreatedAt() {
        return createdAt;
    }

    public List<EmployeeDocumentDto> getDocuments() {
        return documents;
    }
}
