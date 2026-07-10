package com.example.auro.entity;

import jakarta.persistence.CascadeType;
import jakarta.persistence.Column;
import jakarta.persistence.Entity;
import jakarta.persistence.FetchType;
import jakarta.persistence.GeneratedValue;
import jakarta.persistence.GenerationType;
import jakarta.persistence.Id;
import jakarta.persistence.JoinColumn;
import jakarta.persistence.ManyToOne;
import jakarta.persistence.OneToMany;
import jakarta.persistence.PrePersist;
import jakarta.persistence.PreUpdate;
import jakarta.persistence.Table;
import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Getter;
import lombok.NoArgsConstructor;
import lombok.Setter;

import java.time.LocalDateTime;
import java.util.ArrayList;
import java.util.List;

@Entity
@Table(name = "complaints")
@Getter
@Setter
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class Complaint {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    private String complaintCode;

    private String sourceType;

    private String target;

    private String targetLabel;

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "raised_by_id")
    private UserAccount raisedBy;

    private String department;

    private String employeeId;

    private String employeeName;

    private String employeeRole;

    private String customerName;

    private String customerPhone;

    private String customerEmail;

    private String priority;

    private String subject;

    @Column(columnDefinition = "TEXT")
    private String description;

    private String status;

    @Column(columnDefinition = "TEXT")
    private String remarks;

    @Column(columnDefinition = "TEXT")
    private String resolutionNotes;

    @Column(columnDefinition = "TEXT")
    private String attachmentsJson;

    @Column(columnDefinition = "TEXT")
    private String statusHistoryJson;

    private String createdBy;

    private LocalDateTime createdAt;

    private LocalDateTime updatedAt;

    @OneToMany(mappedBy = "complaint", cascade = CascadeType.ALL, orphanRemoval = true)
    @Builder.Default
    private List<ComplaintAttachment> attachments = new ArrayList<>();

    @OneToMany(mappedBy = "complaint", cascade = CascadeType.ALL, orphanRemoval = true)
    @Builder.Default
    private List<ComplaintStatusHistory> statusHistory = new ArrayList<>();

    @PrePersist
    public void onCreate() {
        createdAt = LocalDateTime.now();
        updatedAt = LocalDateTime.now();

        if (status == null || status.isBlank()) {
            status = "Pending";
        }

        if (priority == null || priority.isBlank()) {
            priority = "Medium";
        }

        if (attachmentsJson == null || attachmentsJson.isBlank()) {
            attachmentsJson = "[]";
        }

        if (statusHistoryJson == null || statusHistoryJson.isBlank()) {
            statusHistoryJson = "[]";
        }
    }

    @PreUpdate
    public void onUpdate() {
        updatedAt = LocalDateTime.now();
    }
}
