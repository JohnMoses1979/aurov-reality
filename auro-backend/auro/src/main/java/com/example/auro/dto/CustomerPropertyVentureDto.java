package com.example.auro.dto;
 
import java.util.List;

public record CustomerPropertyVentureDto(
        Long id,
        String name,
        String image,
        List<String> images
) {
}
