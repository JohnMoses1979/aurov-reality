package com.example.auro.dto;

public record ComplaintAttachmentDto(
        Long id,
        String name,
        String contentType,
        Long sizeBytes
) {
}
