package com.example.auro.controller;

import com.example.auro.dto.SalesTaskReviewRequestDto;
import com.example.auro.dto.SalesTaskUpdateDto;
import com.example.auro.service.DepartmentManagerWorkflowService;
import java.util.List;
import org.springframework.core.io.Resource;
import org.springframework.http.HttpHeaders;
import org.springframework.http.MediaType;
import org.springframework.http.ResponseEntity;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.web.bind.annotation.CrossOrigin;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.PatchMapping;
import org.springframework.web.bind.annotation.PathVariable;
import org.springframework.web.bind.annotation.RequestBody;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;

@RestController
@RequestMapping("/api/sales/task-updates")
@PreAuthorize("hasAuthority('Sales Manager')")
@CrossOrigin(origins = {
        "http://localhost:3000",
        "http://localhost:5173",
        "http://localhost:8080"
})
public class SalesTaskUpdatesController {

    private static final String MANAGER_KEY = "sales";

    private final DepartmentManagerWorkflowService workflowService;

    public SalesTaskUpdatesController(DepartmentManagerWorkflowService workflowService) {
        this.workflowService = workflowService;
    }

    @GetMapping
    public List<SalesTaskUpdateDto> getTaskUpdates() {
        return workflowService.getTaskUpdates(MANAGER_KEY);
    }

    @PatchMapping("/{taskId}/review")
    public SalesTaskUpdateDto reviewTask(
            @PathVariable Long taskId,
            @RequestBody SalesTaskReviewRequestDto request
    ) {
        return workflowService.reviewTaskUpdate(MANAGER_KEY, taskId, request.getDecision());
    }

    @GetMapping("/{taskId}/files/{fileType}")
    public ResponseEntity<Resource> downloadTaskFile(
            @PathVariable Long taskId,
            @PathVariable String fileType
    ) {
        Resource resource = workflowService.getTaskUpdateFile(MANAGER_KEY, taskId, fileType);
        String fileName = workflowService.getTaskUpdateFileName(MANAGER_KEY, taskId, fileType);

        return ResponseEntity.ok()
                .contentType(MediaType.APPLICATION_PDF)
                .header(
                        HttpHeaders.CONTENT_DISPOSITION,
                        "attachment; filename=\"" + fileName + "\""
                )
                .body(resource);
    }
}
