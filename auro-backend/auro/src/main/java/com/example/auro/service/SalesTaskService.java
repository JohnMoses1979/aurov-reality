package com.example.auro.service;

 
import java.time.LocalDate;
import java.util.List;

import org.springframework.core.io.Resource;
import org.springframework.web.multipart.MultipartFile;

import com.example.auro.dto.TaskAssigneeDto;
import com.example.auro.dto.TaskResponseDto;

public interface SalesTaskService {

    List<TaskAssigneeDto> getExecutives();

    List<TaskResponseDto> getTasks();

    TaskResponseDto assignTask(
            String title,
            Long assigneeId,
            LocalDate due,
            MultipartFile file
    );

    Resource getPdf(Long taskId);

    String getPdfName(Long taskId);
}
