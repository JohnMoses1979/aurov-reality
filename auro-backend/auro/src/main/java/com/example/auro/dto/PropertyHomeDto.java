package com.example.auro.dto;

 
import java.math.BigDecimal;
import java.util.List;

public record PropertyHomeDto(
        Long id,
        Long ventureId,
        String type,
        String number,
        String area,
        BigDecimal price,
        String status,
        String image,
        List<String> images
) {
}
