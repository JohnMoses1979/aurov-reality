package com.example.auro.controller;

 
import com.example.auro.dto.VentureResponse;
import com.example.auro.service.VentureService;
import com.fasterxml.jackson.core.type.TypeReference;
import com.fasterxml.jackson.databind.ObjectMapper;
import lombok.RequiredArgsConstructor;
import org.springframework.http.MediaType;
import org.springframework.security.core.Authentication;
import org.springframework.web.bind.annotation.*;
import org.springframework.web.multipart.MultipartFile;

import java.util.Collections;
import java.util.List;

@RestController
@RequestMapping("/api/ventures")
@RequiredArgsConstructor
public class VentureController {

    private final VentureService ventureService;
    private final ObjectMapper objectMapper;

    @GetMapping
    public List<VentureResponse> getAllVentures() {
        return ventureService.getAllVentures();
    }

    @GetMapping("/{id}")
    public VentureResponse getVentureById(@PathVariable Long id) {
        return ventureService.getVentureById(id);
    }

    @PostMapping(consumes = MediaType.MULTIPART_FORM_DATA_VALUE)
    public VentureResponse createVenture(
            @RequestParam String name,
            @RequestParam String location,
            @RequestParam String type,
            @RequestParam String description,
            @RequestParam String amenities,
            @RequestPart("posterImage") MultipartFile posterImage,
            @RequestPart(value = "galleryImages", required = false) List<MultipartFile> galleryImages,
            Authentication authentication
    ) {
        String createdBy = authentication == null ? "System" : authentication.getName();

        return ventureService.createVenture(
                name,
                location,
                type,
                description,
                amenities,
                posterImage,
                galleryImages,
                createdBy
        );
    }

    @PutMapping(value = "/{id}", consumes = MediaType.MULTIPART_FORM_DATA_VALUE)
    public VentureResponse updateVenture(
            @PathVariable Long id,
            @RequestParam String name,
            @RequestParam String location,
            @RequestParam String type,
            @RequestParam String description,
            @RequestParam String amenities,
            @RequestPart(value = "posterImage", required = false) MultipartFile posterImage,
            @RequestPart(value = "galleryImages", required = false) List<MultipartFile> galleryImages,
            @RequestParam(value = "existingGalleryImages", required = false) String existingGalleryImagesJson
    ) {
        List<String> existingGalleryImages = parseExistingGalleryImages(existingGalleryImagesJson);

        return ventureService.updateVenture(
                id,
                name,
                location,
                type,
                description,
                amenities,
                posterImage,
                galleryImages,
                existingGalleryImages
        );
    }

    @DeleteMapping("/{id}")
    public void deleteVenture(@PathVariable Long id) {
        ventureService.deleteVenture(id);
    }

    private List<String> parseExistingGalleryImages(String json) {
        try {
            if (json == null || json.isBlank()) {
                return Collections.emptyList();
            }

            return objectMapper.readValue(json, new TypeReference<List<String>>() {});
        } catch (Exception e) {
            return Collections.emptyList();
        }
    }
}
