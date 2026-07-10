package com.example.auro.controller;

 
import java.time.LocalDate;
import java.util.List;

import org.springframework.core.io.Resource;
import org.springframework.format.annotation.DateTimeFormat;
import org.springframework.http.HttpHeaders;
import org.springframework.http.MediaType;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.CrossOrigin;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.PathVariable;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RequestParam;
import org.springframework.web.bind.annotation.RestController;
import org.springframework.web.multipart.MultipartFile;

import com.example.auro.dto.TaskAssigneeDto;
import com.example.auro.dto.TaskResponseDto;
import com.example.auro.service.SalesTaskService;

@RestController
@RequestMapping("/api/sales/tasks")
@CrossOrigin(origins = {
        "http://localhost:3000",
        "http://localhost:5173",
        "http://localhost:8080"
})
public class SalesTaskController {

    private final SalesTaskService salesTaskService;

    public SalesTaskController(SalesTaskService salesTaskService) {
        this.salesTaskService = salesTaskService;
    }

    @GetMapping("/executives")
    public List<TaskAssigneeDto> getExecutives() {
        return salesTaskService.getExecutives();
    }

    @GetMapping
    public List<TaskResponseDto> getTasks() {
        return salesTaskService.getTasks();
    }

    @PostMapping(consumes = MediaType.MULTIPART_FORM_DATA_VALUE)
    public TaskResponseDto assignTask(
            @RequestParam String title,
            @RequestParam Long assigneeId,
            @RequestParam(required = false)
            @DateTimeFormat(iso = DateTimeFormat.ISO.DATE)
            LocalDate due,
            @RequestParam MultipartFile file
    ) {
        return salesTaskService.assignTask(title, assigneeId, due, file);
    }

    @GetMapping("/{taskId}/pdf")
    public ResponseEntity<Resource> downloadPdf(@PathVariable Long taskId) {
        Resource resource = salesTaskService.getPdf(taskId);
        String fileName = salesTaskService.getPdfName(taskId);

        return ResponseEntity.ok()
                .contentType(MediaType.APPLICATION_PDF)
                .header(
                        HttpHeaders.CONTENT_DISPOSITION,
                        "attachment; filename=\"" + fileName + "\""
                )
                .body(resource);
    }
}
