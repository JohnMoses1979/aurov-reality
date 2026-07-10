package com.example.auro.controller;

import com.example.auro.dto.TaskResponse;
import com.example.auro.entity.UserAccount;
import com.example.auro.service.TaskService;
import lombok.RequiredArgsConstructor;
import org.springframework.http.HttpHeaders;
import org.springframework.http.MediaType;
import org.springframework.http.ResponseEntity;
import org.springframework.security.core.annotation.AuthenticationPrincipal;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.PathVariable;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;

import java.util.List;

@RestController
@RequiredArgsConstructor
@RequestMapping("/api/sales-executive/task-updates")
public class SalesExecutiveTaskUpdatesController {

    private final TaskService taskService;

    @GetMapping("/mine")
    public List<TaskResponse> myTaskUpdates(
            @AuthenticationPrincipal(expression = "user") UserAccount user
    ) {
        return taskService.myTaskUpdates(user);
    }

    @GetMapping("/{taskId}/download/{kind}")
    public ResponseEntity<?> downloadPdf(
            @PathVariable String taskId,
            @PathVariable String kind,
            @AuthenticationPrincipal(expression = "user") UserAccount user
    ) {
        TaskService.DownloadFile file = taskService.getDownloadFile(taskId, kind, user);

        return ResponseEntity.ok()
                .contentType(MediaType.parseMediaType(file.contentType()))
                .header(
                        HttpHeaders.CONTENT_DISPOSITION,
                        "attachment; filename=\"" + file.fileName() + "\""
                )
                .body(file.resource());
    }
}
