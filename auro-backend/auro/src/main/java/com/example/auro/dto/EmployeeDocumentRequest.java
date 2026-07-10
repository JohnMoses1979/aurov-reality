package com.example.auro.dto;

public record EmployeeDocumentRequest(
        Long id,
        String name,
        String size,
        String type,
        String url,
        Boolean serverDocument
) {
}
