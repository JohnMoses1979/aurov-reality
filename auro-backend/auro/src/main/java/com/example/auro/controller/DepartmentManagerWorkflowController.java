package com.example.auro.controller;

import com.example.auro.dto.PdfCenterTaskDto;
import com.example.auro.dto.PdfTaskAssigneeDto;
import com.example.auro.dto.PdfTaskResponseDto;
import com.example.auro.dto.PdfTaskReviewRequestDto;
import com.example.auro.dto.SalesDashboardResponseDto;
import com.example.auro.dto.SalesDashboardTaskDto;
import com.example.auro.dto.SalesReportsResponseDto;
import com.example.auro.dto.SalesTaskReviewRequestDto;
import com.example.auro.dto.SalesTaskUpdateDto;
import com.example.auro.dto.SubmittedWorkResponseDto;
import com.example.auro.dto.TaskReviewRequestDto;
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
import org.springframework.web.bind.annotation.PatchMapping;
import org.springframework.web.bind.annotation.PathVariable;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.RequestBody;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RequestParam;
import org.springframework.web.bind.annotation.RestController;
import org.springframework.web.multipart.MultipartFile;

@RestController
@RequestMapping("/api/{managerKey:marketing|crm|accounts|hr}")
@PreAuthorize("hasAnyAuthority('Marketing Manager','CRM Manager','Accounts Manager','HR Manager')")
@CrossOrigin(origins = {"http://localhost:3000", "http://localhost:5173", "http://localhost:8080"})
public class DepartmentManagerWorkflowController {

    private final DepartmentManagerWorkflowService workflowService;

    public DepartmentManagerWorkflowController(DepartmentManagerWorkflowService workflowService) {
        this.workflowService = workflowService;
    }

    @GetMapping("/dashboard")
    public SalesDashboardResponseDto getDashboard(@PathVariable String managerKey) {
        return workflowService.getDashboard(managerKey);
    }

    @PatchMapping("/dashboard/tasks/{taskId}/review")
    public SalesDashboardTaskDto reviewDashboardTask(@PathVariable String managerKey, @PathVariable Long taskId, @RequestBody TaskReviewRequestDto request) {
        return workflowService.reviewDashboardTask(managerKey, taskId, request.getDecision());
    }

    @GetMapping("/dashboard/tasks/{taskId}/files/{fileType}")
    public ResponseEntity<Resource> downloadDashboardTaskFile(@PathVariable String managerKey, @PathVariable Long taskId, @PathVariable String fileType) {
        return pdfResponse(
                workflowService.getDashboardTaskFile(managerKey, taskId, fileType),
                workflowService.getDashboardTaskFileName(managerKey, taskId, fileType)
        );
    }

    @GetMapping("/pdf-tasks/executives")
    public List<PdfTaskAssigneeDto> getExecutives(@PathVariable String managerKey) {
        return workflowService.getExecutives(managerKey);
    }

    @GetMapping("/pdf-tasks")
    public List<PdfTaskResponseDto> getTasks(@PathVariable String managerKey) {
        return workflowService.getTasks(managerKey);
    }

    @PostMapping(value = "/pdf-tasks", consumes = MediaType.MULTIPART_FORM_DATA_VALUE)
    public PdfTaskResponseDto assignTask(
            @PathVariable String managerKey,
            @RequestParam String title,
            @RequestParam Long assigneeId,
            @RequestParam(required = false) @DateTimeFormat(iso = DateTimeFormat.ISO.DATE) LocalDate due,
            @RequestParam MultipartFile file
    ) {
        return workflowService.assignTask(managerKey, title, assigneeId, due, file);
    }

    @GetMapping("/pdf-tasks/{taskId}/pdf")
    public ResponseEntity<Resource> downloadAssignedTaskPdf(@PathVariable String managerKey, @PathVariable Long taskId) {
        return pdfResponse(
                workflowService.getAssignedTaskPdf(managerKey, taskId),
                workflowService.getAssignedTaskPdfName(managerKey, taskId)
        );
    }

    @GetMapping("/task-updates")
    public List<SalesTaskUpdateDto> getTaskUpdates(@PathVariable String managerKey) {
        return workflowService.getTaskUpdates(managerKey);
    }

    @PatchMapping("/task-updates/{taskId}/review")
    public SalesTaskUpdateDto reviewTaskUpdate(@PathVariable String managerKey, @PathVariable Long taskId, @RequestBody SalesTaskReviewRequestDto request) {
        return workflowService.reviewTaskUpdate(managerKey, taskId, request.getDecision());
    }

    @GetMapping("/task-updates/{taskId}/files/{fileType}")
    public ResponseEntity<Resource> downloadTaskUpdateFile(@PathVariable String managerKey, @PathVariable Long taskId, @PathVariable String fileType) {
        return pdfResponse(
                workflowService.getTaskUpdateFile(managerKey, taskId, fileType),
                workflowService.getTaskUpdateFileName(managerKey, taskId, fileType)
        );
    }

    @GetMapping("/pdf-center")
    public List<PdfCenterTaskDto> getPdfCenterUpdates(@PathVariable String managerKey) {
        return workflowService.getPdfCenterUpdates(managerKey);
    }

    @PatchMapping("/pdf-center/tasks/{taskId}/review")
    public PdfCenterTaskDto reviewPdfCenterTask(@PathVariable String managerKey, @PathVariable Long taskId, @RequestBody PdfTaskReviewRequestDto request) {
        return workflowService.reviewPdfCenterTask(managerKey, taskId, request.getDecision());
    }

    @GetMapping("/pdf-center/tasks/{taskId}/files/{fileType}")
    public ResponseEntity<Resource> downloadPdfCenterTaskFile(@PathVariable String managerKey, @PathVariable Long taskId, @PathVariable String fileType) {
        return pdfResponse(
                workflowService.getPdfCenterTaskFile(managerKey, taskId, fileType),
                workflowService.getPdfCenterTaskFileName(managerKey, taskId, fileType)
        );
    }

    @GetMapping("/reports")
    public SalesReportsResponseDto getReports(@PathVariable String managerKey) {
        return workflowService.getReports(managerKey);
    }

    @GetMapping("/submit-work/my")
    public List<SubmittedWorkResponseDto> getMySubmissions(@PathVariable String managerKey) {
        return workflowService.getMySubmissions(managerKey);
    }

    @PostMapping(value = "/submit-work", consumes = MediaType.MULTIPART_FORM_DATA_VALUE)
    public SubmittedWorkResponseDto submitWork(
            @PathVariable String managerKey,
            @RequestParam String title,
            @RequestParam String description,
            @RequestParam @DateTimeFormat(iso = DateTimeFormat.ISO.DATE) LocalDate submissionDate,
            @RequestParam MultipartFile file
    ) {
        return workflowService.submitWork(managerKey, title, description, submissionDate, file);
    }

    @GetMapping("/submit-work/{workId}/pdf")
    public ResponseEntity<Resource> downloadSubmittedWorkPdf(@PathVariable String managerKey, @PathVariable Long workId) {
        return pdfResponse(
                workflowService.getSubmittedWorkPdf(managerKey, workId),
                workflowService.getSubmittedWorkPdfName(managerKey, workId)
        );
    }

    private ResponseEntity<Resource> pdfResponse(Resource resource, String fileName) {
        return ResponseEntity.ok()
                .contentType(MediaType.APPLICATION_PDF)
                .header(HttpHeaders.CONTENT_DISPOSITION, "attachment; filename=\"" + fileName + "\"")
                .body(resource);
    }
}
