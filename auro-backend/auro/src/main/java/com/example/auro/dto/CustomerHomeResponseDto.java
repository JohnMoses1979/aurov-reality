package com.example.auro.dto;

 
import java.util.List;

public record CustomerHomeResponseDto(
        List<VentureHomeDto> ventures,
        List<PropertyHomeDto> properties,
        List<PropertyHomeDto> availableProperties,
        List<String> gallery,
        List<String> amenities
) {
}
