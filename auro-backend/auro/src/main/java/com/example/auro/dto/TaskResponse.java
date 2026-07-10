package com.example.auro.dto;

import com.example.auro.entity.PdfTask;
import com.example.auro.entity.PdfTaskStatus;
import com.example.auro.entity.TaskEntity;

public record TaskResponse(
        String id,
        String title,
        String status,
        String department,
        String assignedBy,
        String assignedByName,
        String assigneeId,
        String assigneeEmployeeId,
        String assigneeUsername,
        String assigneeEmail,
        String assignee,
        String due,
        String pdfName,
        String updatePdfName,
        String completionPdfName,
        String createdAt,
        String updatedAt
) {
    public static TaskResponse from(TaskEntity task) {
        return new TaskResponse(
                task.getId(),
                task.getTitle(),
                task.getStatus(),
                task.getDepartment(),
                task.getAssignedBy(),
                task.getAssignedByName(),
                task.getAssigneeId(),
                task.getAssigneeEmployeeId(),
                task.getAssigneeUsername(),
                task.getAssigneeEmail(),
                task.getAssignee(),
                task.getDue(),
                task.getPdfName(),
                task.getUpdatePdfName(),
                task.getCompletionPdfName(),
                task.getCreatedAt() == null ? null : task.getCreatedAt().toString(),
                task.getUpdatedAt() == null ? null : task.getUpdatedAt().toString()
        );
    }

    public static TaskResponse from(PdfTask task, String assignedByName) {
        return new TaskResponse(
                task.getTaskCode() != null ? task.getTaskCode() : "TASK-" + task.getId(),
                task.getTitle(),
                formatStatus(task.getStatusEnum()),
                task.getDepartment(),
                task.getAssignedByRole(),
                assignedByName,
                task.getAssigneeId() == null ? null : String.valueOf(task.getAssigneeId()),
                task.getAssigneeEmployeeId(),
                null,
                null,
                task.getAssignee(),
                task.getDue() == null ? null : task.getDue().toString(),
                task.getPdfName(),
                task.getUpdatePdfName(),
                task.getCompletionPdfName(),
                task.getCreatedAt() == null ? null : task.getCreatedAt().toString(),
                task.getUpdatedAt() == null ? null : task.getUpdatedAt().toString()
        );
    }

    private static String formatStatus(PdfTaskStatus status) {
        if (status == null) {
            return "Assigned";
        }

        return switch (status) {
            case ASSIGNED -> "Assigned";
            case IN_PROGRESS -> "In Progress";
            case SUBMITTED -> "Submitted";
            case REVIEWED -> "Reviewed";
            case APPROVED -> "Approved";
            case COMPLETED -> "Completed";
            case REJECTED -> "Rejected";
            case CLOSED -> "Closed";
        };
    }
}



