package com.example.auro.dto;

public record SalesTaskUpdateDto(
        String id,
        Long taskId,
        String title,
        String assignee,
        String assigneeEmployeeId,
        String status,
        String pdfName,
        SalesTaskUpdateFileDto updatePdf,
        SalesTaskUpdateFileDto completionPdf
) {
}
