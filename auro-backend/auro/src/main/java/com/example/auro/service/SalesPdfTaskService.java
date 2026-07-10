package com.example.auro.service;

import java.time.LocalDate;
import java.util.List;
import java.util.Map;

import org.springframework.core.io.Resource;
import org.springframework.web.multipart.MultipartFile;

import com.example.auro.dto.PdfTaskAssigneeDto;
import com.example.auro.dto.PdfTaskResponseDto;

public interface SalesPdfTaskService {

    /*
     * New secured method:
     * Sales Manager username/email comes from JWT Authentication
     */
    List<PdfTaskAssigneeDto> getSalesExecutives(String managerUsername);

    /*
     * New secured method:
     * Returns tasks assigned by logged-in Sales Manager
     */
    List<PdfTaskResponseDto> getSalesManagerTasks(String managerUsername);

    /*
     * Dashboard endpoint:
     * GET /api/sales/pdf-tasks/dashboard
     */
    Map<String, Object> dashboard(String managerUsername);

    /*
     * Multipart PDF assignment:
     * POST /api/sales/pdf-tasks
     * Content-Type: multipart/form-data
     */
    PdfTaskResponseDto assignPdfTask(
            String title,
            Long assigneeId,
            LocalDate due,
            MultipartFile file,
            String managerUsername
    );

    /*
     * JSON PDF assignment:
     * POST /api/sales/pdf-tasks
     * Content-Type: application/json
     */
    PdfTaskResponseDto assignPdfTask(
            Map<String, Object> request,
            String managerUsername
    );

    /*
     * Download assigned PDF
     */
    Resource getPdfResource(Long taskId);

    /*
     * Original uploaded PDF file name
     */
    String getOriginalPdfName(Long taskId);
}