package com.example.auro.dto;

public record EmployeeDocumentDto(
        Long id,
        String name,
        String type,
        Long sizeBytes,
        String size,
        String url
) {
}
