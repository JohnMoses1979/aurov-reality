package com.example.auro.dto;

 
import java.util.List;

public record SiteVisitOptionsResponseDto(
        List<SiteVisitVentureOptionDto> ventures,
        List<SiteVisitPropertyOptionDto> properties
) {
}
