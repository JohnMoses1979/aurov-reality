package com.example.auro.dto;

 
import java.util.List;

public record CustomerPropertiesPageResponseDto(
        List<CustomerPropertyVentureDto> ventures,
        List<CustomerPropertyDto> properties,
        CustomerPropertyVentureDto selectedVenture
) {
}
