package com.example.auro.controller;

import com.example.auro.dto.SubmittedWorkResponseDto;
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
@RequestMapping("/api/sales/submit-work")
@PreAuthorize("hasAuthority('Sales Manager')")
@CrossOrigin(origins = {
        "http://localhost:3000",
        "http://localhost:5173",
        "http://localhost:8080"
})
public class SalesSubmitWorkController {

    private static final String MANAGER_KEY = "sales";

    private final DepartmentManagerWorkflowService workflowService;

    public SalesSubmitWorkController(DepartmentManagerWorkflowService workflowService) {
        this.workflowService = workflowService;
    }

    @GetMapping("/my")
    public List<SubmittedWorkResponseDto> getMySubmissions() {
        return workflowService.getMySubmissions(MANAGER_KEY);
    }

    @PostMapping(consumes = MediaType.MULTIPART_FORM_DATA_VALUE)
    public SubmittedWorkResponseDto submitWork(
            @RequestParam String title,
            @RequestParam String description,
            @RequestParam
            @DateTimeFormat(iso = DateTimeFormat.ISO.DATE)
            LocalDate submissionDate,
            @RequestParam MultipartFile file
    ) {
        return workflowService.submitWork(MANAGER_KEY, title, description, submissionDate, file);
    }

    @GetMapping("/{workId}/pdf")
    public ResponseEntity<Resource> downloadPdf(@PathVariable Long workId) {
        Resource resource = workflowService.getSubmittedWorkPdf(MANAGER_KEY, workId);
        String fileName = workflowService.getSubmittedWorkPdfName(MANAGER_KEY, workId);

        return ResponseEntity.ok()
                .contentType(MediaType.APPLICATION_PDF)
                .header(
                        HttpHeaders.CONTENT_DISPOSITION,
                        "attachment; filename=\"" + fileName + "\""
                )
                .body(resource);
    }
}
