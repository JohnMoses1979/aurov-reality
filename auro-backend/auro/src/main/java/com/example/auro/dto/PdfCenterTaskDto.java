package com.example.auro.dto;

public record PdfCenterTaskDto(
        String id,
        Long taskId,
        String title,
        String assignee,
        String assigneeEmployeeId,
        String status,
        String pdfName,
        PdfCenterFileDto updatePdf,
        PdfCenterFileDto completionPdf
) {
}
