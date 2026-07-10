package com.example.auro.controller;

import com.example.auro.dto.SalesDashboardResponseDto;
import com.example.auro.dto.SalesDashboardTaskDto;
import com.example.auro.dto.TaskReviewRequestDto;
import com.example.auro.service.DepartmentManagerWorkflowService;
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
@RequestMapping("/api/sales/dashboard")
@PreAuthorize("hasAuthority('Sales Manager')")
@CrossOrigin(origins = {
        "http://localhost:3000",
        "http://localhost:5173",
        "http://localhost:8080"
})
public class SalesDashboardController {

    private static final String MANAGER_KEY = "sales";

    private final DepartmentManagerWorkflowService workflowService;

    public SalesDashboardController(DepartmentManagerWorkflowService workflowService) {
        this.workflowService = workflowService;
    }

    @GetMapping
    public SalesDashboardResponseDto getDashboard() {
        return workflowService.getDashboard(MANAGER_KEY);
    }

    @PatchMapping("/tasks/{taskId}/review")
    public SalesDashboardTaskDto reviewTask(
            @PathVariable Long taskId,
            @RequestBody TaskReviewRequestDto request
    ) {
        return workflowService.reviewDashboardTask(MANAGER_KEY, taskId, request.getDecision());
    }

    @GetMapping("/tasks/{taskId}/files/{fileType}")
    public ResponseEntity<Resource> downloadTaskFile(
            @PathVariable Long taskId,
            @PathVariable String fileType
    ) {
        Resource resource = workflowService.getDashboardTaskFile(MANAGER_KEY, taskId, fileType);
        String fileName = workflowService.getDashboardTaskFileName(MANAGER_KEY, taskId, fileType);

        return ResponseEntity.ok()
                .contentType(MediaType.APPLICATION_PDF)
                .header(
                        HttpHeaders.CONTENT_DISPOSITION,
                        "attachment; filename=\"" + fileName + "\""
                )
                .body(resource);
    }
}
