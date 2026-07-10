package com.example.auro.controller;

import com.example.auro.dto.TaskResponse;
import com.example.auro.dto.TaskStatusRequest;
import com.example.auro.entity.UserAccount;
import com.example.auro.service.TaskService;
import jakarta.validation.Valid;
import lombok.RequiredArgsConstructor;
import org.springframework.http.HttpHeaders;
import org.springframework.http.MediaType;
import org.springframework.http.ResponseEntity;
import org.springframework.security.core.annotation.AuthenticationPrincipal;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.PatchMapping;
import org.springframework.web.bind.annotation.PathVariable;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.RequestBody;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RequestParam;
import org.springframework.web.bind.annotation.RestController;
import org.springframework.web.multipart.MultipartFile;

import java.util.List;

@RestController
@RequiredArgsConstructor
@RequestMapping({"/api/executive/tasks", "/api/sales-executive/tasks"})
public class SalesExecutiveTaskController {

    private final TaskService taskService;

    @GetMapping("/mine")
    public List<TaskResponse> myTasks(
            @AuthenticationPrincipal(expression = "user") UserAccount user
    ) {
        return taskService.myTasks(user);
    }

    @PatchMapping("/{taskId}/status")
    public TaskResponse updateStatus(
            @PathVariable String taskId,
            @Valid @RequestBody TaskStatusRequest request,
            @AuthenticationPrincipal(expression = "user") UserAccount user
    ) {
        return taskService.updateStatus(taskId, request.status(), user);
    }

    @PostMapping("/{taskId}/upload/{kind}")
    public TaskResponse uploadTaskPdf(
            @PathVariable String taskId,
            @PathVariable String kind,
            @RequestParam("file") MultipartFile file,
            @AuthenticationPrincipal(expression = "user") UserAccount user
    ) {
        return taskService.uploadTaskPdf(taskId, kind, file, user);
    }

    @GetMapping("/{taskId}/download/{kind}")
    public ResponseEntity<?> downloadTaskPdf(
            @PathVariable String taskId,
            @PathVariable String kind,
            @AuthenticationPrincipal(expression = "user") UserAccount user
    ) {
        TaskService.DownloadFile download = taskService.getDownloadFile(taskId, kind, user);

        return ResponseEntity.ok()
                .contentType(MediaType.parseMediaType(download.contentType()))
                .header(
                        HttpHeaders.CONTENT_DISPOSITION,
                        "attachment; filename=\"" + download.fileName() + "\""
                )
                .body(download.resource());
    }
}
