package com.example.auro.dto;

 
import java.util.List;

import com.example.auro.entity.Complaint;
import com.example.auro.entity.ComplaintStatusHistory;

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
public class ComplaintResponse {

    private Long id;

    private String complaintCode;

    private String sourceType;

    private String target;

    private String targetLabel;

    private String department;

    private String employeeId;

    private String employeeName;

    private String employeeRole;

    private String customerName;

    private String customerPhone;

    private String customerEmail;

    private String priority;

    private String subject;

    private String description;

    private String status;

    private String remarks;

    private String resolutionNotes;

    private String createdAt;

    private String createdIso;

    private String dateTime;

    private String raisedTo;

    private List<ComplaintAttachmentResponse> attachments;

    private List<ComplaintStatusHistory> statusHistory;

    public static ComplaintResponse fromEntity(Complaint complaint) {
        return ComplaintResponse.builder()
                .id(complaint.getId())
                .complaintCode(complaint.getComplaintCode())
                .sourceType(complaint.getSourceType())
                .target(complaint.getTarget())
                .targetLabel(complaint.getTargetLabel())
                .department(complaint.getDepartment())
                .employeeId(complaint.getEmployeeId())
                .employeeName(
                        complaint.getEmployeeName() != null
                                ? complaint.getEmployeeName()
                                : complaint.getCustomerName()
                )
                .employeeRole(
                        complaint.getEmployeeRole() != null
                                ? complaint.getEmployeeRole()
                                : "Customer"
                )
                .customerName(complaint.getCustomerName())
                .customerPhone(complaint.getCustomerPhone())
                .customerEmail(complaint.getCustomerEmail())
                .priority(complaint.getPriority())
                .subject(complaint.getSubject())
                .description(complaint.getDescription())
                .status(complaint.getStatus())
                .remarks(complaint.getRemarks())
                .resolutionNotes(complaint.getResolutionNotes())
                .createdAt(
                        complaint.getCreatedAt() == null
                                ? null
                                : complaint.getCreatedAt().toString()
                )
                .createdIso(
                        complaint.getCreatedAt() == null
                                ? null
                                : complaint.getCreatedAt().toString()
                )
                .dateTime(
                        complaint.getCreatedAt() == null
                                ? null
                                : complaint.getCreatedAt().toString()
                )
                .raisedTo(complaint.getTargetLabel())
                .attachments(
                        complaint.getAttachments()
                                .stream()
                                .map(ComplaintAttachmentResponse::fromEntity)
                                .toList()
                )
                .statusHistory(List.of())
                .build();
    }
}
