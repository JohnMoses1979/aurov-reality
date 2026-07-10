package com.example.auro.service;

import com.example.auro.dto.SubmittedWorkResponseDto;
import org.springframework.core.io.Resource;
import org.springframework.web.multipart.MultipartFile;

import java.time.LocalDate;
import java.util.List;

public interface SalesSubmitWorkService {

    List<SubmittedWorkResponseDto> getMySubmissions(String email);

    SubmittedWorkResponseDto submitWork(
            String email,
            String title,
            String description,
            LocalDate submissionDate,
            MultipartFile file
    );

    Resource getPdfResource(String email, Long workId);

    String getPdfName(Long workId);
}
