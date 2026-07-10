package com.example.auro.service;

 
import java.util.List;

import org.springframework.core.io.Resource;

import com.example.auro.dto.PdfCenterTaskDto;

public interface SalesPdfCenterService {

    List<PdfCenterTaskDto> getPdfUpdates();

    PdfCenterTaskDto reviewTask(Long taskId, String decision);

    Resource getTaskFile(Long taskId, String fileType);

    String getTaskFileName(Long taskId, String fileType);
}
