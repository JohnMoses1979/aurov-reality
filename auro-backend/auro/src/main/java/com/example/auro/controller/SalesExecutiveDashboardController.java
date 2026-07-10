package com.example.auro.controller;

import com.example.auro.dto.ComplaintResponse;
import com.example.auro.dto.TaskResponse;
import com.example.auro.entity.UserAccount;
import com.example.auro.service.ComplaintService;
import com.example.auro.service.TaskService;
import lombok.RequiredArgsConstructor;
import org.springframework.security.core.Authentication;
import org.springframework.security.core.annotation.AuthenticationPrincipal;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;

import java.util.List;

@RestController
@RequiredArgsConstructor
@RequestMapping("/api/sales-executive/dashboard")
public class SalesExecutiveDashboardController {

    private final TaskService taskService;
    private final ComplaintService complaintService;

    @GetMapping
    public SalesExecutiveDashboardResponse dashboard(
            @AuthenticationPrincipal(expression = "user") UserAccount user,
            Authentication authentication
    ) {
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

        return new SalesExecutiveDashboardResponse(tasks, complaints);
    }

    public record SalesExecutiveDashboardResponse(
            List<TaskResponse> tasks,
            List<ComplaintResponse> complaints
    ) {
    }
}
