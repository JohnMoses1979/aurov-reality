package com.example.auro.dto;

 
import java.util.List;

public record ComplaintResponseDto(
        String id,
        Long complaintId,
        String employeeId,
        String employeeName,
        String employeeRole,
        String department,
        String target,
        String targetLabel,
        String raisedTo,
        String subject,
        String description,
        String priority,
        String status,
        String remarks,
        String resolutionNotes,
        String createdAt,
        String createdIso,
        List<ComplaintAttachmentDto> attachments,
        List<ComplaintHistoryDto> statusHistory
) {
}
