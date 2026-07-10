package com.example.auro.controller;

 
import java.math.BigDecimal;
import java.util.List;

import org.springframework.http.MediaType;
import org.springframework.security.core.Authentication;
import org.springframework.web.bind.annotation.DeleteMapping;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.PathVariable;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.PutMapping;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RequestParam;
import org.springframework.web.bind.annotation.RequestPart;
import org.springframework.web.bind.annotation.RestController;
import org.springframework.web.multipart.MultipartFile;

import com.example.auro.dto.PropertyResponse;
import com.example.auro.service.PropertyService;

import lombok.RequiredArgsConstructor;

@RestController
@RequestMapping("/api/properties")
@RequiredArgsConstructor
public class PropertyController {

    private final PropertyService propertyService;

    @GetMapping
    public List<PropertyResponse> getAllProperties(
            @RequestParam(required = false) Long ventureId
    ) {
        return propertyService.getAllProperties(ventureId);
    }

    @GetMapping("/{id}")
    public PropertyResponse getPropertyById(@PathVariable Long id) {
        return propertyService.getPropertyById(id);
    }

    @PostMapping(consumes = MediaType.MULTIPART_FORM_DATA_VALUE)
    public PropertyResponse createProperty(
            @RequestParam Long ventureId,
            @RequestParam String type,
            @RequestParam String number,
            @RequestParam String area,
            @RequestParam BigDecimal price,
            @RequestParam String status,
            @RequestParam(required = false) String facing,
            @RequestParam(required = false) String floor,
            @RequestParam(required = false) String bhkType,
            @RequestPart("image") MultipartFile image,
            Authentication authentication
    ) {
        String createdBy = authentication == null ? "System" : authentication.getName();

        return propertyService.createProperty(
                ventureId,
                type,
                number,
                area,
                price,
                status,
                facing,
                floor,
                bhkType,
                image,
                createdBy
        );
    }

    @PutMapping(value = "/{id}", consumes = MediaType.MULTIPART_FORM_DATA_VALUE)
    public PropertyResponse updateProperty(
            @PathVariable Long id,
            @RequestParam Long ventureId,
            @RequestParam String type,
            @RequestParam String number,
            @RequestParam String area,
            @RequestParam BigDecimal price,
            @RequestParam String status,
            @RequestParam(required = false) String facing,
            @RequestParam(required = false) String floor,
            @RequestParam(required = false) String bhkType,
            @RequestPart(value = "image", required = false) MultipartFile image
    ) {
        return propertyService.updateProperty(
                id,
                ventureId,
                type,
                number,
                area,
                price,
                status,
                facing,
                floor,
                bhkType,
                image
        );
    }

    @DeleteMapping("/{id}")
    public void deleteProperty(@PathVariable Long id) {
        propertyService.deleteProperty(id);
    }
}
