package com.example.auro.dto;

 
import java.math.BigDecimal;
import java.util.List;

public record CustomerPropertyDto(
        Long id,
        Long ventureId,
        String ventureName,
        String type,
        String number,
        String area,
        String bhkType,
        String facing,
        BigDecimal price,
        String status,
        String image,
        List<String> images
) {
}
