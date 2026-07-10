package com.example.auro.dto;

 
public record SiteVisitPropertyOptionDto(
        Long id,
        Long ventureId,
        String type,
        String number,
        String area,
        String status
) {
}
