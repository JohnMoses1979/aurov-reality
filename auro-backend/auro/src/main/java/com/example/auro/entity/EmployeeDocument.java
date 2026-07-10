package com.example.auro.entity;

import jakarta.persistence.Column;
import jakarta.persistence.Entity;
import jakarta.persistence.FetchType;
import jakarta.persistence.GeneratedValue;
import jakarta.persistence.GenerationType;
import jakarta.persistence.Id;
import jakarta.persistence.JoinColumn;
import jakarta.persistence.ManyToOne;
import jakarta.persistence.PrePersist;
import jakarta.persistence.Table;
import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Getter;
import lombok.NoArgsConstructor;
import lombok.Setter;
import org.hibernate.annotations.CreationTimestamp;

import java.time.LocalDateTime;

@Entity
@Table(name = "employee_documents")
@Getter
@Setter
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class EmployeeDocument {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    /*
     * Employee relation.
     * DB column: employee_id
     */
    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "employee_id", nullable = false)
    private Employee employee;

    /*
     * Frontend display name.
     */
    @Column(name = "name")
    private String name;

    /*
     * Original uploaded file name.
     */
    @Column(name = "file_name")
    private String fileName;

    /*
     * New field from second code.
     * Example: application/pdf, image/png
     */
    @Column(name = "content_type")
    private String contentType;

    /*
     * New field from second code.
     * Server/local/S3 file path if using storage.
     */
    @Column(name = "file_path", length = 1500)
    private String filePath;

    /*
     * Public/download URL or data URL.
     */
    @Column(name = "url")
    private String url;

    /*
     * New field from second code.
     * File size in bytes.
     */
    @Column(name = "size_bytes")
    private Long sizeBytes;

    /*
     * Old frontend size text.
     * Example: 120 KB
     */
    @Column(name = "size")
    private String size;

    /*
     * Old frontend type field.
     */
    @Column(name = "type")
    private String type;

    @CreationTimestamp
    @Column(name = "uploaded_at", nullable = false, updatable = false)
    private LocalDateTime uploadedAt;

    @PrePersist
    public void prePersist() {
        if (uploadedAt == null) {
            uploadedAt = LocalDateTime.now();
        }

        if (fileName == null || fileName.isBlank()) {
            fileName = name == null || name.isBlank() ? "document" : name;
        }

        if (name == null || name.isBlank()) {
            name = fileName;
        }

        if (contentType == null || contentType.isBlank()) {
            contentType = type == null || type.isBlank()
                    ? "application/octet-stream"
                    : type;
        }

        if (type == null || type.isBlank()) {
            type = contentType;
        }

        if (sizeBytes == null) {
            sizeBytes = 0L;
        }

        if (size == null) {
            size = "";
        }

        if (url == null) {
            url = "";
        }
    }
}