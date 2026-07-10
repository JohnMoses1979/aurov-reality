package com.example.auro.entity;

import java.time.LocalDate;
import java.time.LocalDateTime;

import jakarta.persistence.Column;
import jakarta.persistence.Entity;
import jakarta.persistence.FetchType;
import jakarta.persistence.GeneratedValue;
import jakarta.persistence.GenerationType;
import jakarta.persistence.Id;
import jakarta.persistence.JoinColumn;
import jakarta.persistence.Lob;
import jakarta.persistence.ManyToOne;
import jakarta.persistence.PrePersist;
import jakarta.persistence.PreUpdate;
import jakarta.persistence.Table;

import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Getter;
import lombok.NoArgsConstructor;
import lombok.Setter;

@Entity
@Table(name = "submitted_works")
@Getter
@Setter
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class SubmittedWork {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @Column(name = "submission_code", length = 80)
    private String submissionCode;

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "manager_id")
    private UserAccount manager;

    @Column(name = "manager_name", nullable = false, length = 150)
    private String managerName;

    @Column(name = "manager_username", length = 150)
    private String managerUsername;

    @Column(name = "manager_role", nullable = false, length = 120)
    private String managerRole;

    @Column(name = "employee_id", length = 80)
    private String employeeId;

    @Column(name = "employee_email", length = 180)
    private String employeeEmail;

    @Column(nullable = false, length = 100)
    private String department;

    @Column(nullable = false, length = 220)
    private String title;

    @Column(nullable = false, columnDefinition = "TEXT")
    private String description;

    @Column(name = "submission_date")
    private LocalDate submissionDate;

    @Column(nullable = false, length = 50)
    private String status;

    @Column(columnDefinition = "TEXT")
    private String remarks;

    @Column(name = "reviewed_by", length = 150)
    private String reviewedBy;

    @Column(name = "reviewed_at")
    private LocalDateTime reviewedAt;

    /*
     * Old file fields - keep these because your existing code may be using them.
     */
    @Column(name = "file_name", length = 255)
    private String fileName;

    @Column(name = "content_type", length = 120)
    private String contentType;

    @Column(name = "file_size_label", length = 80)
    private String fileSizeLabel;

    @Lob
    @Column(columnDefinition = "LONGBLOB")
    private byte[] data;

    /*
     * Old PDF storage fields - keep these for backward compatibility.
     */
    @Column(name = "pdf_original_name", length = 255)
    private String pdfOriginalName;

    @Column(name = "pdf_content_type", length = 120)
    private String pdfContentType;

    @Column(name = "pdf_size")
    private Long pdfSize;

    @Column(name = "pdf_storage_path", columnDefinition = "TEXT")
    private String pdfStoragePath;

    /*
     * New frontend PDF data-url fields.
     * Use these when frontend sends base64/dataUrl PDF.
     */
    @Column(name = "pdf_name", length = 255)
    private String pdfName;

    @Column(name = "pdf_size_bytes")
    private Long pdfSizeBytes;

    @Lob
    @Column(name = "pdf_data_url", columnDefinition = "LONGTEXT")
    private String pdfDataUrl;

    @Column(name = "created_by", length = 150)
    private String createdBy;

    @Column(name = "created_at", nullable = false, updatable = false)
    private LocalDateTime createdAt;

    @Column(name = "updated_at")
    private LocalDateTime updatedAt;

    @PrePersist
    public void onCreate() {
        if (createdAt == null) {
            createdAt = LocalDateTime.now();
        }

        if (updatedAt == null) {
            updatedAt = LocalDateTime.now();
        }

        if (submissionDate == null) {
            submissionDate = LocalDate.now();
        }

        applyDefaults();
        syncPdfFields();
    }

    @PreUpdate
    public void onUpdate() {
        updatedAt = LocalDateTime.now();

        applyDefaults();
        syncPdfFields();
    }

    private void applyDefaults() {
        if (status == null || status.isBlank()) {
            status = "Submitted";
        }

        if (remarks == null) {
            remarks = "";
        }

        if (pdfContentType == null || pdfContentType.isBlank()) {
            pdfContentType = "application/pdf";
        }

        if (contentType == null || contentType.isBlank()) {
            contentType = pdfContentType;
        }

        if (pdfSize == null) {
            pdfSize = 0L;
        }

        if (pdfSizeBytes == null) {
            pdfSizeBytes = 0L;
        }
    }

    /*
     * Keeps old code and new code compatible.
     */
    private void syncPdfFields() {
        if ((pdfName == null || pdfName.isBlank()) && pdfOriginalName != null) {
            pdfName = pdfOriginalName;
        }

        if ((pdfOriginalName == null || pdfOriginalName.isBlank()) && pdfName != null) {
            pdfOriginalName = pdfName;
        }

        if ((fileName == null || fileName.isBlank()) && pdfName != null) {
            fileName = pdfName;
        }

        if ((pdfName == null || pdfName.isBlank()) && fileName != null) {
            pdfName = fileName;
        }

        if (pdfSizeBytes == null || pdfSizeBytes == 0L) {
            pdfSizeBytes = pdfSize == null ? 0L : pdfSize;
        }

        if (pdfSize == null || pdfSize == 0L) {
            pdfSize = pdfSizeBytes == null ? 0L : pdfSizeBytes;
        }
    }
}