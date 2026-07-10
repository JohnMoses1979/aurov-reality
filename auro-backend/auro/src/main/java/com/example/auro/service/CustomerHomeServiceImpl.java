package com.example.auro.service;

import com.example.auro.dto.CustomerHomeResponseDto;
import com.example.auro.dto.PropertyHomeDto;
import com.example.auro.dto.VentureHomeDto;
import com.example.auro.entity.Property;
import com.example.auro.entity.Venture;
import com.example.auro.repository.PropertyRepository;
import com.example.auro.repository.VentureRepository;
import java.math.BigDecimal;
import java.util.LinkedHashSet;
import java.util.List;
import org.springframework.stereotype.Service;

@Service
public class CustomerHomeServiceImpl implements CustomerHomeService {

    private final VentureRepository ventureRepository;
    private final PropertyRepository propertyRepository;

    public CustomerHomeServiceImpl(
            VentureRepository ventureRepository,
            PropertyRepository propertyRepository
    ) {
        this.ventureRepository = ventureRepository;
        this.propertyRepository = propertyRepository;
    }

    @Override
    public CustomerHomeResponseDto getCustomerHome() {
        List<Venture> ventures = ventureRepository.findAll();
        List<Property> properties = propertyRepository.findAll();
        List<Property> availableProperties = propertyRepository.findByStatusNotIgnoreCase("Sold")
                .stream()
                .filter(property -> !equalsIgnoreCase(property.getStatus(), "Reserved"))
                .filter(property -> !equalsIgnoreCase(property.getStatus(), "Booked"))
                .filter(property -> !equalsIgnoreCase(property.getStatus(), "Blocked"))
                .toList();

        List<VentureHomeDto> ventureDtos = ventures.stream()
                .map(this::toVentureDto)
                .toList();

        List<PropertyHomeDto> propertyDtos = properties.stream()
                .map(this::toPropertyDto)
                .toList();

        List<PropertyHomeDto> availableDtos = availableProperties.stream()
                .map(this::toPropertyDto)
                .toList();

        List<String> gallery = buildGallery(ventures, properties);
        List<String> amenities = buildAmenities(ventures);

        return new CustomerHomeResponseDto(
                ventureDtos,
                propertyDtos,
                availableDtos,
                gallery,
                amenities
        );
    }

    private VentureHomeDto toVentureDto(Venture venture) {
        long availableUnits = propertyRepository.countByVenture_IdAndStatusIgnoreCase(
                venture.getId(),
                "Available"
        );

        long bookedUnits = propertyRepository.countByVenture_IdAndStatusIn(
                venture.getId(),
                List.of("Reserved", "Booked", "Sold")
        );

        BigDecimal startingPrice = propertyRepository.findByVenture_Id(venture.getId())
                .stream()
                .map(Property::getPrice)
                .filter(price -> price != null && price.compareTo(BigDecimal.ZERO) > 0)
                .min(BigDecimal::compareTo)
                .orElse(BigDecimal.ZERO);

        return new VentureHomeDto(
                venture.getId(),
                venture.getName(),
                venture.getLocation(),
                venture.getDescription(),
                venture.getType(),
                null,
                startingPrice,
                venture.getPosterImageUrl(),
                venture.getGalleryImageUrls(),
                splitAmenities(venture.getAmenities()),
                availableUnits,
                bookedUnits
        );
    }

    private PropertyHomeDto toPropertyDto(Property property) {
        return new PropertyHomeDto(
                property.getId(),
                property.getVentureId(),
                property.getType(),
                property.getNumber(),
                property.getArea(),
                property.getPrice(),
                formatStatus(property.getStatus()),
                property.getImage(),
                property.getImages()
        );
    }

    private String formatStatus(String status) {
        if (equalsIgnoreCase(status, "Available")) return "Available";
        if (equalsIgnoreCase(status, "Reserved")) return "Reserved";
        if (equalsIgnoreCase(status, "Booked")) return "Booked";
        if (equalsIgnoreCase(status, "Sold")) return "Sold";
        if (equalsIgnoreCase(status, "Blocked")) return "Blocked";
        return status == null || status.isBlank() ? "Available" : status;
    }

    private List<String> buildGallery(List<Venture> ventures, List<Property> properties) {
        LinkedHashSet<String> gallery = new LinkedHashSet<>();

        for (Venture venture : ventures) {
            if (venture.getPosterImageUrl() != null) {
                gallery.add(venture.getPosterImageUrl());
            }
            gallery.addAll(venture.getGalleryImageUrls());
        }

        for (Property property : properties) {
            if (property.getImage() != null) {
                gallery.add(property.getImage());
            }
            gallery.addAll(property.getImages());
        }

        return gallery.stream()
                .filter(item -> item != null && !item.trim().isEmpty())
                .limit(8)
                .toList();
    }

    private List<String> buildAmenities(List<Venture> ventures) {
        LinkedHashSet<String> amenities = new LinkedHashSet<>();

        for (Venture venture : ventures) {
            amenities.addAll(splitAmenities(venture.getAmenities()));
        }

        return amenities.stream()
                .filter(item -> item != null && !item.trim().isEmpty())
                .limit(12)
                .toList();
    }

    private List<String> splitAmenities(String amenities) {
        if (amenities == null || amenities.isBlank()) {
            return List.of();
        }

        return List.of(amenities.split(","))
                .stream()
                .map(String::trim)
                .filter(item -> !item.isEmpty())
                .toList();
    }
    private boolean equalsIgnoreCase(String left, String right) {
        if (left == null || right == null) {
            return false;
        }
        return left.equalsIgnoreCase(right);
    }
}

