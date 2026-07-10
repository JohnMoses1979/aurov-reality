package com.example.auro.service;

import java.math.BigDecimal;
import java.util.List;

import org.springframework.stereotype.Service;
import org.springframework.web.multipart.MultipartFile;

import com.example.auro.dto.PropertyResponse;
import com.example.auro.entity.Property;
import com.example.auro.entity.Venture;
import com.example.auro.repository.PropertyRepository;
import com.example.auro.repository.VentureRepository;

import lombok.RequiredArgsConstructor;

@Service
@RequiredArgsConstructor
public class PropertyService {

    private final PropertyRepository propertyRepository;
    private final VentureRepository ventureRepository;
    private final FileStorageService fileStorageService;

    public List<PropertyResponse> getAllProperties(Long ventureId) {
        List<Property> properties;

        if (ventureId != null) {
            properties = propertyRepository.findByVenture_Id(ventureId);
        } else {
            properties = propertyRepository.findAll();
        }

        return properties.stream()
                .map(PropertyResponse::fromEntity)
                .toList();
    }

    public PropertyResponse getPropertyById(Long id) {
        Property property = propertyRepository.findById(id)
                .orElseThrow(() -> new RuntimeException("Property not found"));

        return PropertyResponse.fromEntity(property);
    }

    public PropertyResponse createProperty(
            Long ventureId,
            String type,
            String number,
            String area,
            BigDecimal price,
            String status,
            String facing,
            String floor,
            String bhkType,
            MultipartFile image,
            String createdBy
    ) {
        Venture venture = ventureRepository.findById(ventureId)
                .orElseThrow(() -> new RuntimeException("Venture not found"));

        if (image == null || image.isEmpty()) {
            throw new RuntimeException("Property image is required");
        }

        String imageUrl = fileStorageService.saveFile(image, "properties");

        Property property = new Property();
        property.setVenture(venture);
        property.setType(type);
        property.setNumber(number);
        property.setArea(area);
        property.setPrice(price);
        property.setStatus(status);
        property.setFacing(facing);
        property.setFloor(floor);
        property.setBhkType(bhkType);
        property.setImageUrl(imageUrl);
        property.setCreatedBy(createdBy);

        Property saved = propertyRepository.save(property);

        return PropertyResponse.fromEntity(saved);
    }

    public PropertyResponse updateProperty(
            Long id,
            Long ventureId,
            String type,
            String number,
            String area,
            BigDecimal price,
            String status,
            String facing,
            String floor,
            String bhkType,
            MultipartFile image
    ) {
        Property property = propertyRepository.findById(id)
                .orElseThrow(() -> new RuntimeException("Property not found"));

        Venture venture = ventureRepository.findById(ventureId)
                .orElseThrow(() -> new RuntimeException("Venture not found"));

        property.setVenture(venture);
        property.setType(type);
        property.setNumber(number);
        property.setArea(area);
        property.setPrice(price);
        property.setStatus(status);
        property.setFacing(facing);
        property.setFloor(floor);
        property.setBhkType(bhkType);

        if (image != null && !image.isEmpty()) {
            String imageUrl = fileStorageService.saveFile(image, "properties");
            property.setImageUrl(imageUrl);
        }

        Property saved = propertyRepository.save(property);

        return PropertyResponse.fromEntity(saved);
    }

    public void deleteProperty(Long id) {
        if (!propertyRepository.existsById(id)) {
            throw new RuntimeException("Property not found");
        }

        propertyRepository.deleteById(id);
    }
}

