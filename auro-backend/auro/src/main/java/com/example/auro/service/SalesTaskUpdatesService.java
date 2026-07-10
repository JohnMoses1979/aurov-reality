package com.example.auro.service;

 
import java.util.List;

import org.springframework.core.io.Resource;

import com.example.auro.dto.SalesTaskUpdateDto;

public interface SalesTaskUpdatesService {

    List<SalesTaskUpdateDto> getTaskUpdates();

    SalesTaskUpdateDto reviewTask(Long taskId, String decision);

    Resource getTaskFile(Long taskId, String fileType);

    String getTaskFileName(Long taskId, String fileType);
}
