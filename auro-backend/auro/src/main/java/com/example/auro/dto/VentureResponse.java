package com.example.auro.dto;

 
import java.util.List;

import com.example.auro.entity.Venture;

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
public class VentureResponse {

    private Long id;
    private String name;
    private String location;
    private String type;
    private String description;
    private String amenities;

    private String image;
    private List<String> images;

    private String posterImageUrl;
    private List<String> galleryImageUrls;

    private String createdBy;
    private String createdAt;

    public static VentureResponse fromEntity(Venture venture) {
        return VentureResponse.builder()
                .id(venture.getId())
                .name(venture.getName())
                .location(venture.getLocation())
                .type(venture.getType())
                .description(venture.getDescription())
                .amenities(venture.getAmenities())

                // frontend compatibility
                .image(venture.getPosterImageUrl())
                .images(venture.getGalleryImageUrls())

                // backend proper names
                .posterImageUrl(venture.getPosterImageUrl())
                .galleryImageUrls(venture.getGalleryImageUrls())

                .createdBy(venture.getCreatedBy())
                .createdAt(
                        venture.getCreatedAt() == null
                                ? null
                                : venture.getCreatedAt().toLocalDate().toString()
                )
                .build();
    }
}
