package com.example.auro.controller;

 
import java.util.List;

import org.springframework.core.io.Resource;
import org.springframework.http.HttpHeaders;
import org.springframework.http.MediaType;
import org.springframework.http.ResponseEntity;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.security.core.Authentication;
import org.springframework.web.bind.annotation.DeleteMapping;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.PatchMapping;
import org.springframework.web.bind.annotation.PathVariable;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.PutMapping;
import org.springframework.web.bind.annotation.RequestBody;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RequestParam;
import org.springframework.web.bind.annotation.RequestPart;
import org.springframework.web.bind.annotation.RestController;
import org.springframework.web.multipart.MultipartFile;

import com.example.auro.dto.ManagerOptionResponse;
import com.example.auro.dto.ManagerTaskResponse;
import com.example.auro.dto.TaskStatusUpdateRequest;
import com.example.auro.entity.ManagerTask;
import com.example.auro.service.ManagerTaskService;

import lombok.RequiredArgsConstructor;

@RestController
@RequiredArgsConstructor
@RequestMapping("/api/manager-tasks")
public class ManagerTaskController {

    private final ManagerTaskService managerTaskService;

    @GetMapping("/managers")
    @PreAuthorize("hasAnyAuthority('Managing Director','Operational Head','Admin','Super Admin')")
    public List<ManagerOptionResponse> getAssignableManagers() {
        return managerTaskService.getAssignableManagers();
    }

    @PostMapping(consumes = MediaType.MULTIPART_FORM_DATA_VALUE)
    @PreAuthorize("hasAnyAuthority('Managing Director','Operational Head','Admin','Super Admin')")
    public ManagerTaskResponse createTask(
            @RequestParam String title,
            @RequestParam Long assigneeId,
            @RequestParam(required = false) String due,
            @RequestPart("pdf") MultipartFile pdf,
            Authentication authentication
    ) {
        return managerTaskService.createTask(
                title,
                assigneeId,
                due,
                pdf,
                authentication
        );
    }

    @GetMapping
    @PreAuthorize("hasAnyAuthority('Managing Director','Operational Head','Admin','Super Admin')")
    public List<ManagerTaskResponse> getAllTasks() {
        return managerTaskService.getAllTasks();
    }

    @GetMapping("/my")
    @PreAuthorize("isAuthenticated()")
    public List<ManagerTaskResponse> getMyTasks(Authentication authentication) {
        return managerTaskService.getMyTasks(authentication);
    }

    @GetMapping("/{id}")
    @PreAuthorize("isAuthenticated()")
    public ManagerTaskResponse getTaskById(
            @PathVariable Long id,
            Authentication authentication
    ) {
        return managerTaskService.getTaskById(id, authentication);
    }

    @PutMapping(value = "/{id}", consumes = MediaType.MULTIPART_FORM_DATA_VALUE)
    @PreAuthorize("hasAnyAuthority('Managing Director','Operational Head','Admin','Super Admin')")
    public ManagerTaskResponse updateTask(
            @PathVariable Long id,
            @RequestParam String title,
            @RequestParam Long assigneeId,
            @RequestParam(required = false) String due,
            @RequestPart(value = "pdf", required = false) MultipartFile pdf,
            Authentication authentication
    ) {
        return managerTaskService.updateTask(
                id,
                title,
                assigneeId,
                due,
                pdf,
                authentication
        );
    }

    @PatchMapping("/{id}/status")
    @PreAuthorize("isAuthenticated()")
    public ManagerTaskResponse updateStatus(
            @PathVariable Long id,
            @RequestBody TaskStatusUpdateRequest request,
            Authentication authentication
    ) {
        return managerTaskService.updateStatus(
                id,
                request.getStatus(),
                authentication
        );
    }

    @DeleteMapping("/{id}")
    @PreAuthorize("hasAnyAuthority('Managing Director','Operational Head','Admin','Super Admin')")
    public void deleteTask(@PathVariable Long id) {
        managerTaskService.deleteTask(id);
    }

    @GetMapping("/{id}/pdf")
    @PreAuthorize("isAuthenticated()")
    public ResponseEntity<Resource> viewPdf(
            @PathVariable Long id,
            Authentication authentication
    ) {
        Resource resource = managerTaskService.getTaskPdf(id, authentication);
        ManagerTask task = managerTaskService.getTaskPdfInfo(id, authentication);

        return ResponseEntity.ok()
                .contentType(MediaType.APPLICATION_PDF)
                .header(
                        HttpHeaders.CONTENT_DISPOSITION,
                        "inline; filename=\"" + task.getPdfName() + "\""
                )
                .body(resource);
    }
}

