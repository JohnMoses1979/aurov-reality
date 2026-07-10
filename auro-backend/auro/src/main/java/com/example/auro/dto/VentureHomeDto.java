package com.example.auro.dto;
 
import java.math.BigDecimal;
import java.util.List;

public record VentureHomeDto(
        Long id,
        String name,
        String location,
        String description,
        String category,
        String launchLabel,
        BigDecimal startingPrice,
        String image,
        List<String> images,
        List<String> amenities,
        long availableUnits,
        long bookedUnits
) {
}
