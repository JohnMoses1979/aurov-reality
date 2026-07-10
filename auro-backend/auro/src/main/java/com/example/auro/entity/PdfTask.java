package com.example.auro.entity;

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

import java.time.LocalDate;
import java.time.LocalDateTime;

@Entity
@Table(name = "pdf_tasks")
public class PdfTask {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @Column(name = "task_code", length = 80)
    private String taskCode;

    @Column(nullable = false, length = 220)
    private String title;

    @Column(nullable = false, length = 100)
    private String department;

    /*
     * String status is safer for frontend:
     * Assigned / In Progress / Submitted / Completed / Approved / Rejected / Closed
     */
    @Column(length = 40)
    private String status = "Assigned";

    /*
     * New relation from second code.
     */
    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "assigned_by_id")
    private Employee assignedBy;

    /*
     * New relation from second code.
     */
    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "assignee_id")
    private Employee assigneeEmployee;

    /*
     * Old field support.
     */
    @Column(name = "assigned_by_role", length = 120)
    private String assignedByRole;

    @Column(name = "assignee", length = 150)
    private String assignee;

    @Column(name = "assignee_employee_id", length = 80)
    private String assigneeEmployeeId;

    @Column(name = "due_date")
    private LocalDate dueDate;

    /*
     * Assignment PDF metadata.
     */
    @Column(name = "assignment_file_name", length = 255)
    private String assignmentFileName;

    @Column(name = "assignment_content_type", length = 120)
    private String assignmentContentType;

    @Column(name = "assignment_file_size_label", length = 80)
    private String assignmentFileSizeLabel;

    /*
     * New BLOB storage from second code.
     */
    @Lob
    @Column(name = "assignment_data", columnDefinition = "LONGBLOB")
    private byte[] assignmentData;

    /*
     * Old path storage support.
     */
    @Column(name = "pdf_storage_name", length = 255)
    private String pdfStorageName;

    @Column(name = "pdf_path", length = 1500)
    private String pdfPath;

    /*
     * Update PDF.
     */
    @Column(name = "update_file_name", length = 255)
    private String updateFileName;

    @Column(name = "update_content_type", length = 120)
    private String updateContentType;

    @Column(name = "update_file_size_label", length = 80)
    private String updateFileSizeLabel;

    @Lob
    @Column(name = "update_data", columnDefinition = "LONGBLOB")
    private byte[] updateData;

    @Column(name = "update_pdf_path", length = 1500)
    private String updatePdfPath;

    /*
     * Completion PDF.
     */
    @Column(name = "completion_file_name", length = 255)
    private String completionFileName;

    @Column(name = "completion_content_type", length = 120)
    private String completionContentType;

    @Column(name = "completion_file_size_label", length = 80)
    private String completionFileSizeLabel;

    @Lob
    @Column(name = "completion_data", columnDefinition = "LONGBLOB")
    private byte[] completionData;

    @Column(name = "completion_pdf_path", length = 1500)
    private String completionPdfPath;

    @Column(name = "submitted_at")
    private LocalDateTime submittedAt;

    @Column(name = "reviewed_at")
    private LocalDateTime reviewedAt;

    @Column(name = "created_at", nullable = false, updatable = false)
    private LocalDateTime createdAt;

    @Column(name = "updated_at", nullable = false)
    private LocalDateTime updatedAt;

    public PdfTask() {
    }

    @PrePersist
    public void prePersist() {
        LocalDateTime now = LocalDateTime.now();

        if (createdAt == null) {
            createdAt = now;
        }

        if (updatedAt == null) {
            updatedAt = now;
        }

        applyDefaultsAndSync();
    }

    @PreUpdate
    public void preUpdate() {
        updatedAt = LocalDateTime.now();
        applyDefaultsAndSync();
    }

    private void applyDefaultsAndSync() {
        if (status == null || status.isBlank()) {
            status = "Assigned";
        }

        if (assignmentContentType == null || assignmentContentType.isBlank()) {
            assignmentContentType = "application/pdf";
        }

        if (updateContentType == null || updateContentType.isBlank()) {
            updateContentType = "application/pdf";
        }

        if (completionContentType == null || completionContentType.isBlank()) {
            completionContentType = "application/pdf";
        }

        if ((assignmentFileName == null || assignmentFileName.isBlank()) && pdfStorageName != null) {
            assignmentFileName = pdfStorageName;
        }

        if ((pdfStorageName == null || pdfStorageName.isBlank()) && assignmentFileName != null) {
            pdfStorageName = assignmentFileName;
        }
    }

    public Long getId() {
        return id;
    }

    public String getTaskCode() {
        return taskCode;
    }

    public String getTitle() {
        return title;
    }

    public String getDepartment() {
        return department;
    }

    public String getStatus() {
        return status;
    }

    public PdfTaskStatus getStatusEnum() {
        if (status == null || status.isBlank()) {
            return PdfTaskStatus.ASSIGNED;
        }

        String normalized = status.trim().toUpperCase().replace(' ', '_');

        return switch (normalized) {
            case "PENDING", "ASSIGNED" -> PdfTaskStatus.ASSIGNED;
            case "IN_PROGRESS" -> PdfTaskStatus.IN_PROGRESS;
            case "SUBMITTED" -> PdfTaskStatus.SUBMITTED;
            case "REVIEWED" -> PdfTaskStatus.REVIEWED;
            case "APPROVED" -> PdfTaskStatus.APPROVED;
            case "COMPLETED" -> PdfTaskStatus.COMPLETED;
            case "REJECTED" -> PdfTaskStatus.REJECTED;
            case "CLOSED" -> PdfTaskStatus.CLOSED;
            default -> null;
        };
    }

    public Employee getAssignedBy() {
        return assignedBy;
    }

    public Long getAssignedById() {
        return assignedBy == null ? null : assignedBy.getId();
    }

    public String getAssignedByRole() {
        return assignedByRole;
    }

    public Employee getAssigneeEmployee() {
        return assigneeEmployee;
    }

    public Long getAssigneeId() {
        return assigneeEmployee == null ? null : assigneeEmployee.getId();
    }

    public String getAssignee() {
        return assignee;
    }

    public String getAssigneeEmployeeId() {
        return assigneeEmployeeId;
    }

    /*
     * Old frontend/backend support.
     */
    public LocalDate getDue() {
        return dueDate;
    }

    public LocalDate getDueDate() {
        return dueDate;
    }

    /*
     * Old naming support.
     */
    public String getPdfName() {
        return assignmentFileName;
    }

    public String getPdfContentType() {
        return assignmentContentType;
    }

    public String getPdfStorageName() {
        return pdfStorageName;
    }

    public String getPdfPath() {
        return pdfPath;
    }

    public String getAssignmentFileName() {
        return assignmentFileName;
    }

    public String getAssignmentContentType() {
        return assignmentContentType;
    }

    public String getAssignmentFileSizeLabel() {
        return assignmentFileSizeLabel;
    }

    public byte[] getAssignmentData() {
        return assignmentData;
    }

    /*
     * Old naming support.
     */
    public String getUpdatePdfName() {
        return updateFileName;
    }

    public String getUpdatePdfPath() {
        return updatePdfPath;
    }

    public String getUpdateFileName() {
        return updateFileName;
    }

    public String getUpdateContentType() {
        return updateContentType;
    }

    public String getUpdateFileSizeLabel() {
        return updateFileSizeLabel;
    }

    public byte[] getUpdateData() {
        return updateData;
    }

    /*
     * Old naming support.
     */
    public String getCompletionPdfName() {
        return completionFileName;
    }

    public String getCompletionPdfPath() {
        return completionPdfPath;
    }

    public String getCompletionFileName() {
        return completionFileName;
    }

    public String getCompletionContentType() {
        return completionContentType;
    }

    public String getCompletionFileSizeLabel() {
        return completionFileSizeLabel;
    }

    public byte[] getCompletionData() {
        return completionData;
    }

    public LocalDateTime getSubmittedAt() {
        return submittedAt;
    }

    public LocalDateTime getReviewedAt() {
        return reviewedAt;
    }

    public LocalDateTime getCreatedAt() {
        return createdAt;
    }

    public LocalDateTime getUpdatedAt() {
        return updatedAt;
    }

    public void setId(Long id) {
        this.id = id;
    }

    public void setTaskCode(String taskCode) {
        this.taskCode = taskCode;
    }

    public void setTitle(String title) {
        this.title = title;
    }

    public void setDepartment(String department) {
        this.department = department;
    }

    public void setStatus(String status) {
        this.status = status;
    }

    /*
     * Old enum support if old service sends PdfTaskStatus.
     */
    public void setStatus(PdfTaskStatus status) {
        this.status = status == null ? null : status.name();
    }

    public void setAssignedBy(Employee assignedBy) {
        this.assignedBy = assignedBy;
    }

    /*
     * Old support.
     * Creates lightweight Employee reference only with id.
     */
    public void setAssignedById(Long assignedById) {
        if (assignedById == null) {
            this.assignedBy = null;
            return;
        }

        Employee employee = new Employee();
        employee.setId(assignedById);
        this.assignedBy = employee;
    }

    public void setAssignedByRole(String assignedByRole) {
        this.assignedByRole = assignedByRole;
    }

    /*
     * Old support.
     */
    public void setAssignedBy(String assignedBy) {
        this.assignedByRole = assignedBy;
    }

    public void setAssigneeEmployee(Employee assigneeEmployee) {
        this.assigneeEmployee = assigneeEmployee;
    }

    public void setAssigneeId(Long assigneeId) {
        if (assigneeId == null) {
            this.assigneeEmployee = null;
            return;
        }

        Employee employee = new Employee();
        employee.setId(assigneeId);
        this.assigneeEmployee = employee;
    }

    public void setAssignee(String assignee) {
        this.assignee = assignee;
    }

    public void setAssigneeEmployeeId(String assigneeEmployeeId) {
        this.assigneeEmployeeId = assigneeEmployeeId;
    }

    public void setDue(LocalDate due) {
        this.dueDate = due;
    }

    public void setDueDate(LocalDate dueDate) {
        this.dueDate = dueDate;
    }

    /*
     * Old naming support.
     */
    public void setPdfName(String pdfName) {
        this.assignmentFileName = pdfName;
    }

    public void setPdfContentType(String pdfContentType) {
        this.assignmentContentType = pdfContentType;
    }

    public void setPdfStorageName(String pdfStorageName) {
        this.pdfStorageName = pdfStorageName;
    }

    public void setPdfPath(String pdfPath) {
        this.pdfPath = pdfPath;
    }

    public void setAssignmentFileName(String assignmentFileName) {
        this.assignmentFileName = assignmentFileName;
    }

    public void setAssignmentContentType(String assignmentContentType) {
        this.assignmentContentType = assignmentContentType;
    }

    public void setAssignmentFileSizeLabel(String assignmentFileSizeLabel) {
        this.assignmentFileSizeLabel = assignmentFileSizeLabel;
    }

    public void setAssignmentData(byte[] assignmentData) {
        this.assignmentData = assignmentData;
    }

    /*
     * Old naming support.
     */
    public void setUpdatePdfName(String updatePdfName) {
        this.updateFileName = updatePdfName;
    }

    public void setUpdatePdfPath(String updatePdfPath) {
        this.updatePdfPath = updatePdfPath;
    }

    public void setUpdateFileName(String updateFileName) {
        this.updateFileName = updateFileName;
    }

    public void setUpdateContentType(String updateContentType) {
        this.updateContentType = updateContentType;
    }

    public void setUpdateFileSizeLabel(String updateFileSizeLabel) {
        this.updateFileSizeLabel = updateFileSizeLabel;
    }

    public void setUpdateData(byte[] updateData) {
        this.updateData = updateData;
    }

    /*
     * Old naming support.
     */
    public void setCompletionPdfName(String completionPdfName) {
        this.completionFileName = completionPdfName;
    }

    public void setCompletionPdfPath(String completionPdfPath) {
        this.completionPdfPath = completionPdfPath;
    }

    public void setCompletionFileName(String completionFileName) {
        this.completionFileName = completionFileName;
    }

    public void setCompletionContentType(String completionContentType) {
        this.completionContentType = completionContentType;
    }

    public void setCompletionFileSizeLabel(String completionFileSizeLabel) {
        this.completionFileSizeLabel = completionFileSizeLabel;
    }

    public void setCompletionData(byte[] completionData) {
        this.completionData = completionData;
    }

    public void setSubmittedAt(LocalDateTime submittedAt) {
        this.submittedAt = submittedAt;
    }

    public void setReviewedAt(LocalDateTime reviewedAt) {
        this.reviewedAt = reviewedAt;
    }

    public void setCreatedAt(LocalDateTime createdAt) {
        this.createdAt = createdAt;
    }

    public void setUpdatedAt(LocalDateTime updatedAt) {
        this.updatedAt = updatedAt;
    }
}


