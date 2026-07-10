package com.example.auro.service;

 
import org.springframework.core.io.Resource;

import com.example.auro.dto.SalesDashboardResponseDto;
import com.example.auro.dto.SalesDashboardTaskDto;

public interface SalesDashboardService {

    SalesDashboardResponseDto getDashboard();

    SalesDashboardTaskDto reviewTask(Long taskId, String decision);

    Resource getTaskFile(Long taskId, String fileType);

    String getTaskFileName(Long taskId, String fileType);
}
