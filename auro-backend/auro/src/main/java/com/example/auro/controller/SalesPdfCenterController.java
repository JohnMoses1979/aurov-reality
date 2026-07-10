package com.example.auro.controller;

import com.example.auro.dto.PdfCenterTaskDto;
import com.example.auro.dto.PdfTaskReviewRequestDto;
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
@RequestMapping("/api/sales/pdf-center")
@PreAuthorize("hasAuthority('Sales Manager')")
@CrossOrigin(origins = {
        "http://localhost:3000",
        "http://localhost:5173",
        "http://localhost:8080"
})
public class SalesPdfCenterController {

    private static final String MANAGER_KEY = "sales";

    private final DepartmentManagerWorkflowService workflowService;

    public SalesPdfCenterController(DepartmentManagerWorkflowService workflowService) {
        this.workflowService = workflowService;
    }

    @GetMapping
    public List<PdfCenterTaskDto> getPdfUpdates() {
        return workflowService.getPdfCenterUpdates(MANAGER_KEY);
    }

    @PatchMapping("/tasks/{taskId}/review")
    public PdfCenterTaskDto reviewTask(
            @PathVariable Long taskId,
            @RequestBody PdfTaskReviewRequestDto request
    ) {
        return workflowService.reviewPdfCenterTask(MANAGER_KEY, taskId, request.getDecision());
    }

    @GetMapping("/tasks/{taskId}/files/{fileType}")
    public ResponseEntity<Resource> downloadTaskFile(
            @PathVariable Long taskId,
            @PathVariable String fileType
    ) {
        Resource resource = workflowService.getPdfCenterTaskFile(MANAGER_KEY, taskId, fileType);
        String fileName = workflowService.getPdfCenterTaskFileName(MANAGER_KEY, taskId, fileType);

        return ResponseEntity.ok()
                .contentType(MediaType.APPLICATION_PDF)
                .header(
                        HttpHeaders.CONTENT_DISPOSITION,
                        "attachment; filename=\"" + fileName + "\""
                )
                .body(resource);
    }
}
