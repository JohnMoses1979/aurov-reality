package com.example.auro.controller;

import com.example.auro.dto.ComplaintResponse;
import com.example.auro.dto.TaskResponse;
import com.example.auro.dto.TaskStatusRequest;
import com.example.auro.entity.UserAccount;
import com.example.auro.security.UserPrincipal;
import com.example.auro.service.ComplaintService;
import com.example.auro.service.TaskService;
import jakarta.validation.Valid;
import java.util.List;
import lombok.RequiredArgsConstructor;
import org.springframework.http.HttpHeaders;
import org.springframework.http.HttpStatus;
import org.springframework.http.MediaType;
import org.springframework.http.ResponseEntity;
import org.springframework.security.core.Authentication;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.PatchMapping;
import org.springframework.web.bind.annotation.PathVariable;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.RequestBody;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RequestParam;
import org.springframework.web.bind.annotation.RestController;
import org.springframework.web.multipart.MultipartFile;
import org.springframework.web.server.ResponseStatusException;

@RestController
@RequiredArgsConstructor
@RequestMapping("/api/{executiveKey:marketing|crm|accounts|hr}-executive")
public class DepartmentExecutiveWorkflowController {

    private final TaskService taskService;
    private final ComplaintService complaintService;

    @GetMapping("/dashboard")
    public ExecutiveDashboardResponse dashboard(
            @PathVariable String executiveKey,
            Authentication authentication
    ) {
        UserAccount user = requireUser(authentication);
        validateExecutiveScope(executiveKey, user);

        List<TaskResponse> tasks = taskService.myTasks(user);
        List<ComplaintResponse> complaints = complaintService.getAll(
                null,
                null,
                null,
                null,
                null,
                null,
                null,
                authentication
        );

        return new ExecutiveDashboardResponse(tasks, complaints);
    }

    @GetMapping("/tasks/mine")
    public List<TaskResponse> myTasks(
            @PathVariable String executiveKey,
            Authentication authentication
    ) {
        UserAccount user = requireUser(authentication);
        validateExecutiveScope(executiveKey, user);
        return taskService.myTasks(user);
    }

    @PatchMapping("/tasks/{taskId}/status")
    public TaskResponse updateStatus(
            @PathVariable String executiveKey,
            @PathVariable String taskId,
            @Valid @RequestBody TaskStatusRequest request,
            Authentication authentication
    ) {
        UserAccount user = requireUser(authentication);
        validateExecutiveScope(executiveKey, user);
        return taskService.updateStatus(taskId, request.status(), user);
    }

    @PostMapping("/tasks/{taskId}/upload/{kind}")
    public TaskResponse uploadTaskPdf(
            @PathVariable String executiveKey,
            @PathVariable String taskId,
            @PathVariable String kind,
            @RequestParam("file") MultipartFile file,
            Authentication authentication
    ) {
        UserAccount user = requireUser(authentication);
        validateExecutiveScope(executiveKey, user);
        return taskService.uploadTaskPdf(taskId, kind, file, user);
    }

    @GetMapping("/tasks/{taskId}/download/{kind}")
    public ResponseEntity<?> downloadTaskPdf(
            @PathVariable String executiveKey,
            @PathVariable String taskId,
            @PathVariable String kind,
            Authentication authentication
    ) {
        UserAccount user = requireUser(authentication);
        validateExecutiveScope(executiveKey, user);
        TaskService.DownloadFile file = taskService.getDownloadFile(taskId, kind, user);

        return ResponseEntity.ok()
                .contentType(MediaType.parseMediaType(file.contentType()))
                .header(
                        HttpHeaders.CONTENT_DISPOSITION,
                        "attachment; filename=\"" + file.fileName() + "\""
                )
                .body(file.resource());
    }

    @GetMapping("/task-updates/mine")
    public List<TaskResponse> myTaskUpdates(
            @PathVariable String executiveKey,
            Authentication authentication
    ) {
        UserAccount user = requireUser(authentication);
        validateExecutiveScope(executiveKey, user);
        return taskService.myTaskUpdates(user);
    }

    @GetMapping("/task-updates/{taskId}/download/{kind}")
    public ResponseEntity<?> downloadTaskUpdatePdf(
            @PathVariable String executiveKey,
            @PathVariable String taskId,
            @PathVariable String kind,
            Authentication authentication
    ) {
        UserAccount user = requireUser(authentication);
        validateExecutiveScope(executiveKey, user);
        TaskService.DownloadFile file = taskService.getDownloadFile(taskId, kind, user);

        return ResponseEntity.ok()
                .contentType(MediaType.parseMediaType(file.contentType()))
                .header(
                        HttpHeaders.CONTENT_DISPOSITION,
                        "attachment; filename=\"" + file.fileName() + "\""
                )
                .body(file.resource());
    }

    private UserAccount requireUser(Authentication authentication) {
        if (authentication == null) {
            throw new ResponseStatusException(HttpStatus.UNAUTHORIZED, "User not authenticated");
        }

        Object principal = authentication.getPrincipal();
        if (principal instanceof UserPrincipal userPrincipal) {
            return userPrincipal.getUser();
        }
        if (principal instanceof UserAccount userAccount) {
            return userAccount;
        }

        throw new ResponseStatusException(HttpStatus.UNAUTHORIZED, "User not authenticated");
    }

    private void validateExecutiveScope(String executiveKey, UserAccount user) {
        if (user == null) {
            throw new ResponseStatusException(HttpStatus.UNAUTHORIZED, "User not authenticated");
        }

        Scope scope = Scope.fromKey(executiveKey);

        String role = user.getRole() == null ? "" : user.getRole().trim();
        String department = user.getDepartment() == null ? "" : user.getDepartment().trim();

        if (!scope.role.equalsIgnoreCase(role)) {
            throw new ResponseStatusException(HttpStatus.FORBIDDEN, "This route is not allowed for your executive role");
        }

        if (!scope.department.equalsIgnoreCase(department)) {
            throw new ResponseStatusException(HttpStatus.FORBIDDEN, "This route is not allowed for your department");
        }
    }

    public record ExecutiveDashboardResponse(
            List<TaskResponse> tasks,
            List<ComplaintResponse> complaints
    ) {
    }

    private record Scope(String role, String department) {
        private static Scope fromKey(String executiveKey) {
            String key = executiveKey == null ? "" : executiveKey.trim().toLowerCase();
            return switch (key) {
                case "marketing" -> new Scope("Marketing Executive", "Marketing");
                case "crm" -> new Scope("CRM Executive", "CRM");
                case "accounts" -> new Scope("Accounts Executive", "Accounts");
                case "hr" -> new Scope("HR Executive", "HR");
                default -> throw new ResponseStatusException(HttpStatus.NOT_FOUND, "Unsupported executive route");
            };
        }
    }
}
