package com.example.auro.entity;

import jakarta.persistence.CascadeType;
import jakarta.persistence.Column;
import jakarta.persistence.Entity;
import jakarta.persistence.FetchType;
import jakarta.persistence.GeneratedValue;
import jakarta.persistence.GenerationType;
import jakarta.persistence.Id;
import jakarta.persistence.OneToMany;
import jakarta.persistence.PrePersist;
import jakarta.persistence.PreUpdate;
import jakarta.persistence.Table;
import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Getter;
import lombok.NoArgsConstructor;
import lombok.Setter;

import java.time.LocalDate;
import java.time.LocalDateTime;
import java.util.ArrayList;
import java.util.List;

@Entity
@Table(name = "employees")
@Getter
@Setter
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class Employee {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @Column(name = "employee_id", length = 80)
    private String employeeId;

    @Column(name = "first_name", length = 100)
    private String firstName;

    @Column(name = "last_name", length = 100)
    private String lastName;

    @Column(length = 180)
    private String name;

    @Column(unique = true, length = 120)
    private String username;

    @Column(length = 255)
    private String password;

    @Column(unique = true, length = 180)
    private String email;

    @Column(name = "mobile_number", length = 30)
    private String mobileNumber;

    @Column(columnDefinition = "TEXT")
    private String address;

    @Column(length = 100)
    private String department;

    @Column(length = 100)
    private String role;

    @Column(length = 120)
    private String designation;

    @Column(name = "joining_date")
    private LocalDate joiningDate;

    @Column(length = 30)
    private String status = "Active";

    @Column(name = "profile_photo", columnDefinition = "TEXT")
    private String profilePhoto;

    @Column(name = "aadhaar_image_url", columnDefinition = "TEXT")
    private String aadhaarImageUrl;

    @Column(name = "pan_image_url", columnDefinition = "TEXT")
    private String panImageUrl;

    @Column(name = "created_by", length = 120)
    private String createdBy;

    @Column(name = "created_at", nullable = false, updatable = false)
    private LocalDateTime createdAt;

    @Column(name = "updated_at")
    private LocalDateTime updatedAt;

    /*
     * Keep this only once.
     */
    @Builder.Default
    @OneToMany(
            mappedBy = "employee",
            cascade = CascadeType.ALL,
            orphanRemoval = true,
            fetch = FetchType.LAZY
    )
    private List<EmployeeDocument> documents = new ArrayList<>();

    public String getFullName() {
        if (name != null && !name.isBlank()) {
            return name;
        }

        String first = firstName == null ? "" : firstName.trim();
        String last = lastName == null ? "" : lastName.trim();
        String combined = (first + " " + last).trim();

        return combined.isBlank() ? null : combined;
    }

    public void setFullName(String fullName) {
        this.name = fullName;

        if (fullName == null || fullName.isBlank()) {
            this.firstName = null;
            this.lastName = null;
            return;
        }

        String trimmed = fullName.trim();
        String[] parts = trimmed.split("\\s+", 2);

        this.firstName = parts[0];
        this.lastName = parts.length > 1 ? parts[1] : "";
    }

    public void addDocument(EmployeeDocument document) {
        if (document == null) {
            return;
        }

        document.setEmployee(this);
        this.documents.add(document);
    }

    public void clearDocuments() {
        if (this.documents == null) {
            this.documents = new ArrayList<>();
            return;
        }

        this.documents.forEach(document -> document.setEmployee(null));
        this.documents.clear();
    }

    public void replaceDocuments(List<EmployeeDocument> newDocuments) {
        clearDocuments();

        if (newDocuments != null) {
            newDocuments.forEach(this::addDocument);
        }
    }

    @PrePersist
    public void onCreate() {
        if (createdAt == null) {
            createdAt = LocalDateTime.now();
        }

        if (updatedAt == null) {
            updatedAt = LocalDateTime.now();
        }

        applyDefaultsAndSync();
    }

    @PreUpdate
    public void onUpdate() {
        updatedAt = LocalDateTime.now();
        applyDefaultsAndSync();
    }

    private void applyDefaultsAndSync() {
        if (status == null || status.isBlank()) {
            status = "Active";
        }

        if ((name == null || name.isBlank()) && (firstName != null || lastName != null)) {
            String first = firstName == null ? "" : firstName.trim();
            String last = lastName == null ? "" : lastName.trim();
            String combined = (first + " " + last).trim();

            if (!combined.isBlank()) {
                name = combined;
            }
        }

        if ((firstName == null || firstName.isBlank()) && name != null && !name.isBlank()) {
            String[] parts = name.trim().split("\\s+", 2);
            firstName = parts[0];
            lastName = parts.length > 1 ? parts[1] : "";
        }

        if ((username == null || username.isBlank()) && email != null && !email.isBlank()) {
            username = email;
        }

        if ((designation == null || designation.isBlank()) && role != null && !role.isBlank()) {
            designation = role;
        }

        if (documents == null) {
            documents = new ArrayList<>();
        }
    }
}