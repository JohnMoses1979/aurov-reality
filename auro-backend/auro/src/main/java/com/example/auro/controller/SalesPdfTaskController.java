package com.example.auro.controller;

import com.example.auro.dto.PdfTaskAssigneeDto;
import com.example.auro.dto.PdfTaskResponseDto;
import com.example.auro.service.DepartmentManagerWorkflowService;
import java.time.LocalDate;
import java.util.List;
import org.springframework.core.io.Resource;
import org.springframework.format.annotation.DateTimeFormat;
import org.springframework.http.HttpHeaders;
import org.springframework.http.MediaType;
import org.springframework.http.ResponseEntity;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.web.bind.annotation.CrossOrigin;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.PathVariable;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RequestParam;
import org.springframework.web.bind.annotation.RestController;
import org.springframework.web.multipart.MultipartFile;

@RestController
@RequestMapping("/api/sales/pdf-tasks")
@CrossOrigin(origins = {
        "http://localhost:3000",
        "http://localhost:5173",
        "http://localhost:8080"
})
@PreAuthorize("hasAuthority('Sales Manager')")
public class SalesPdfTaskController {

    private static final String MANAGER_KEY = "sales";

    private final DepartmentManagerWorkflowService workflowService;

    public SalesPdfTaskController(DepartmentManagerWorkflowService workflowService) {
        this.workflowService = workflowService;
    }

    @GetMapping("/executives")
    public List<PdfTaskAssigneeDto> getExecutives() {
        return workflowService.getExecutives(MANAGER_KEY);
    }

    @GetMapping
    public List<PdfTaskResponseDto> getTasks() {
        return workflowService.getTasks(MANAGER_KEY);
    }

    @PostMapping(consumes = MediaType.MULTIPART_FORM_DATA_VALUE)
    public PdfTaskResponseDto assignTaskMultipart(
            @RequestParam String title,
            @RequestParam Long assigneeId,
            @RequestParam(required = false)
            @DateTimeFormat(iso = DateTimeFormat.ISO.DATE)
            LocalDate due,
            @RequestParam MultipartFile file
    ) {
        return workflowService.assignTask(MANAGER_KEY, title, assigneeId, due, file);
    }

    @GetMapping("/{taskId}/pdf")
    public ResponseEntity<Resource> downloadPdf(@PathVariable Long taskId) {
        Resource resource = workflowService.getAssignedTaskPdf(MANAGER_KEY, taskId);
        String fileName = workflowService.getAssignedTaskPdfName(MANAGER_KEY, taskId);

        return ResponseEntity.ok()
                .contentType(MediaType.APPLICATION_PDF)
                .header(
                        HttpHeaders.CONTENT_DISPOSITION,
                        "attachment; filename=\"" + fileName + "\""
                )
                .body(resource);
    }
}
