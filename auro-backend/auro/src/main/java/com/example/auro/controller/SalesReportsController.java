package com.example.auro.controller;

import com.example.auro.dto.SalesReportsResponseDto;
import com.example.auro.service.DepartmentManagerWorkflowService;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.web.bind.annotation.CrossOrigin;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;

@RestController
@RequestMapping("/api/sales/reports")
@PreAuthorize("hasAuthority('Sales Manager')")
@CrossOrigin(origins = {
        "http://localhost:3000",
        "http://localhost:5173",
        "http://localhost:8080"
})
public class SalesReportsController {

    private static final String MANAGER_KEY = "sales";

    private final DepartmentManagerWorkflowService workflowService;

    public SalesReportsController(DepartmentManagerWorkflowService workflowService) {
        this.workflowService = workflowService;
    }

    @GetMapping
    public SalesReportsResponseDto getReports() {
        return workflowService.getReports(MANAGER_KEY);
    }
}
