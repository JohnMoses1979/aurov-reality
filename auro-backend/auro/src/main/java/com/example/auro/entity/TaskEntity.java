package com.example.auro.entity;

 
import java.time.LocalDateTime;
import java.util.UUID;

import jakarta.persistence.Entity;
import jakarta.persistence.Id;
import jakarta.persistence.PrePersist;
import jakarta.persistence.PreUpdate;
import jakarta.persistence.Table;
import lombok.Data;

@Data
@Entity
@Table(name = "tasks")
public class TaskEntity {

    @Id
    private String id;

    private String title;

    private String status = "Pending";

    private String department;

    private String assignedBy;

    private String assignedByName;

    private String assigneeId;

    private String assigneeEmployeeId;

    private String assigneeUsername;

    private String assigneeEmail;

    private String assignee;

    private String due;

    private String pdfName;

    private String assignmentPdfPath;

    private String assignmentPdfType;

    private String updatePdfName;

    private String updatePdfPath;

    private String updatePdfType;

    private String completionPdfName;

    private String completionPdfPath;

    private String completionPdfType;

    private LocalDateTime createdAt;

    private LocalDateTime updatedAt;

    @PrePersist
    public void beforeCreate() {
        if (id == null || id.isBlank()) {
            id = "TASK-" + UUID.randomUUID().toString().substring(0, 8).toUpperCase();
        }

        createdAt = LocalDateTime.now();
        updatedAt = LocalDateTime.now();
    }

    @PreUpdate
    public void beforeUpdate() {
        updatedAt = LocalDateTime.now();
    }
}
