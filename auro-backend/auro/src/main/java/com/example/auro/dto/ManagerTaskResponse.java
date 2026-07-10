package com.example.auro.dto;

 
import com.example.auro.entity.ManagerTask;

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
public class ManagerTaskResponse {

    private Long id;

    private String taskCode;

    private String title;

    private Long assigneeId;

    private String assigneeEmployeeId;

    private String assignee;

    private String assigneeUsername;

    private String assigneeRole;

    private String department;

    private String due;

    private String status;

    private String assignedBy;

    private String assignedByRole;

    private String pdfName;

    private String pdfUrl;

    private String createdAt;

    public static ManagerTaskResponse fromEntity(ManagerTask task) {
        return ManagerTaskResponse.builder()
                .id(task.getId())
                .taskCode(task.getTaskCode())
                .title(task.getTitle())
                .assigneeId(task.getAssigneeId())
                .assigneeEmployeeId(task.getAssigneeEmployeeId())
                .assignee(task.getAssignee())
                .assigneeUsername(task.getAssigneeUsername())
                .assigneeRole(task.getAssigneeRole())
                .department(task.getDepartment())
                .due(task.getDue() == null ? null : task.getDue().toString())
                .status(task.getStatus())
                .assignedBy(task.getAssignedBy())
                .assignedByRole(task.getAssignedByRole())
                .pdfName(task.getPdfName())
                .pdfUrl("/api/manager-tasks/" + task.getId() + "/pdf")
                .createdAt(task.getCreatedAt() == null ? null : task.getCreatedAt().toString())
                .build();
    }
}
