package com.example.auro.dto;

import java.math.BigDecimal;

import com.example.auro.entity.Property;

import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Getter;
import lombok.NoArgsConstructor;
import lombok.Setter;

@Getter
@Setter
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class PropertyResponse {

    private Long id;

    private Long ventureId;

    private String ventureName;

    private String type;

    private String number;

    private String area;

    private BigDecimal price;

    private String status;

    private String facing;

    private String floor;

    private String bhkType;

    private String image;

    private String imageUrl;

    private String createdBy;

    private String createdAt;

    public static PropertyResponse fromEntity(Property property) {
        return PropertyResponse.builder()
                .id(property.getId())
                .ventureId(property.getVenture().getId())
                .ventureName(property.getVenture().getName())
                .type(property.getType())
                .number(property.getNumber())
                .area(property.getArea())
                .price(property.getPrice())
                .status(property.getStatus())
                .facing(property.getFacing())
                .floor(property.getFloor())
                .bhkType(property.getBhkType())
                .image(property.getImageUrl())
                .imageUrl(property.getImageUrl())
                .createdBy(property.getCreatedBy())
                .createdAt(
                        property.getCreatedAt() == null
                                ? null
                                : property.getCreatedAt().toLocalDate().toString()
                )
                .build();
    }
}
