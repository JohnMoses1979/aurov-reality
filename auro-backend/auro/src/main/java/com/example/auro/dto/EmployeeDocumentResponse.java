package com.example.auro.dto;

import java.time.LocalDateTime;

public record EmployeeDocumentResponse(
        Long id,
        String name,
        String size,
        String type,
        String url,
        LocalDateTime uploadedAt
) {
}
