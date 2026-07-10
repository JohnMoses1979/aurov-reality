package com.example.auro.dto;

import com.example.auro.entity.SubmittedWork;

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
public class SubmittedWorkResponse {

    private Long id;

    private String submissionCode;

    private String managerName;

    private String managerUsername;

    private String managerRole;

    private String employeeId;

    private String department;

    private String title;

    private String description;

    private String submissionDate;

    private String submissionIso;

    private String createdIso;

    private String status;

    private String remarks;

    private String reviewedBy;

    private String reviewedAt;

    private PdfFileResponse pdf;

    public static SubmittedWorkResponse fromEntity(SubmittedWork work) {
        return SubmittedWorkResponse.builder()
                .id(work.getId())
                .submissionCode(work.getSubmissionCode())
                .managerName(work.getManagerName())
                .managerUsername(work.getManagerUsername())
                .managerRole(work.getManagerRole())
                .employeeId(work.getEmployeeId())
                .department(work.getDepartment())
                .title(work.getTitle())
                .description(work.getDescription())
                .submissionDate(work.getSubmissionDate() == null ? null : work.getSubmissionDate().toString())
                .submissionIso(work.getSubmissionDate() == null ? null : work.getSubmissionDate().toString())
                .createdIso(work.getCreatedAt() == null ? null : work.getCreatedAt().toString())
                .status(work.getStatus())
                .remarks(work.getRemarks())
                .reviewedBy(work.getReviewedBy())
                .reviewedAt(work.getReviewedAt() == null ? null : work.getReviewedAt().toString())
                .pdf(
                        PdfFileResponse.builder()
                                .name(work.getPdfOriginalName())
                                .type(work.getPdfContentType())
                                .size(work.getPdfSize() == null ? null : Math.round(work.getPdfSize() / 1024.0) + " KB")
                                .url("/api/submitted-works/" + work.getId() + "/pdf")
                                .build()
                )
                .build();
    }
}
