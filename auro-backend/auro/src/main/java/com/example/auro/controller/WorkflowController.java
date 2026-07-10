package com.example.auro.controller;

 
import java.util.Map;

import org.springframework.security.core.annotation.AuthenticationPrincipal;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.PatchMapping;
import org.springframework.web.bind.annotation.PathVariable;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RequestParam;
import org.springframework.web.bind.annotation.RestController;
import org.springframework.web.multipart.MultipartFile;

import com.example.auro.security.UserPrincipal;
import com.example.auro.service.WorkflowService;

@RestController
@RequestMapping("/api/workflows")
public class WorkflowController {
    private final WorkflowService workflowService;

    public WorkflowController(WorkflowService workflowService) {
        this.workflowService = workflowService;
    }

    @GetMapping
    public Map<String, Object> snapshot(@AuthenticationPrincipal UserPrincipal principal) {
        return workflowService.snapshot(principal.getUser());
    }

    @PostMapping("/tasks")
    public Map<String, Object> createTask(
            @AuthenticationPrincipal UserPrincipal principal,
            @RequestParam Long assigneeId,
            @RequestParam String title,
            @RequestParam(required = false) String due,
            @RequestParam MultipartFile file
    ) {
        return workflowService.createTask(principal.getUser(), assigneeId, title, due, file);
    }

    @PatchMapping("/tasks/{id}/status")
    public Map<String, Object> updateTaskStatus(@AuthenticationPrincipal UserPrincipal principal, @PathVariable Long id, @RequestParam String status) {
        return workflowService.updateTaskStatus(principal.getUser(), id, status);
    }

    @PostMapping("/tasks/{id}/pdf")
    public Map<String, Object> uploadTaskPdf(
            @AuthenticationPrincipal UserPrincipal principal,
            @PathVariable Long id,
            @RequestParam String kind,
            @RequestParam MultipartFile file
    ) {
        return workflowService.uploadTaskPdf(principal.getUser(), id, kind, file);
    }

    @PatchMapping("/tasks/{id}/review")
    public Map<String, Object> reviewTask(@AuthenticationPrincipal UserPrincipal principal, @PathVariable Long id, @RequestParam String decision) {
        return workflowService.reviewTask(principal.getUser(), id, decision);
    }

    @PostMapping("/submitted-work")
    public Map<String, Object> submitWork(
            @AuthenticationPrincipal UserPrincipal principal,
            @RequestParam String title,
            @RequestParam String description,
            @RequestParam(required = false) String submissionDate,
            @RequestParam MultipartFile file
    ) {
        return workflowService.submitWork(principal.getUser(), title, description, submissionDate, file);
    }

    @PatchMapping("/submitted-work/{id}/review")
    public Map<String, Object> reviewSubmittedWork(
            @AuthenticationPrincipal UserPrincipal principal,
            @PathVariable Long id,
            @RequestParam String status,
            @RequestParam(required = false) String remarks
    ) {
        return workflowService.reviewSubmittedWork(principal.getUser(), id, status, remarks);
    }

    @PostMapping("/complaints")
    public Map<String, Object> raiseComplaint(
            @AuthenticationPrincipal UserPrincipal principal,
            @RequestParam String subject,
            @RequestParam String description,
            @RequestParam(required = false) String priority,
            @RequestParam(required = false) String attachments
    ) {
        return workflowService.raiseComplaint(principal.getUser(), subject, description, priority, attachments);
    }

    @PatchMapping("/complaints/{id}/status")
    public Map<String, Object> updateComplaintStatus(
            @AuthenticationPrincipal UserPrincipal principal,
            @PathVariable Long id,
            @RequestParam String status,
            @RequestParam(required = false) String note
    ) {
        return workflowService.updateComplaintStatus(principal.getUser(), id, status, note);
    }
}

