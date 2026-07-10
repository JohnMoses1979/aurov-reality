package com.example.auro.service;

import com.example.auro.dto.CustomerPropertiesPageResponseDto;
import com.example.auro.dto.CustomerPropertyDto;
import com.example.auro.dto.CustomerPropertyVentureDto;
import com.example.auro.entity.Property;
import com.example.auro.entity.Venture;
import com.example.auro.repository.PropertyRepository;
import com.example.auro.repository.VentureRepository;
import java.util.LinkedHashMap;
import java.util.List;
import java.util.Map;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

@Service
public class CustomerPropertiesServiceImpl implements CustomerPropertiesService {

    private final PropertyRepository propertyRepository;
    private final VentureRepository ventureRepository;

    public CustomerPropertiesServiceImpl(
            PropertyRepository propertyRepository,
            VentureRepository ventureRepository
    ) {
        this.propertyRepository = propertyRepository;
        this.ventureRepository = ventureRepository;
    }

    @Override
    @Transactional(readOnly = true)
    public CustomerPropertiesPageResponseDto getPropertiesPage(Long ventureId) {
        List<Venture> ventures = ventureRepository.findAll();
        Map<Long, Venture> venturesById = ventures.stream()
                .filter(venture -> venture.getId() != null)
                .collect(LinkedHashMap::new, (map, venture) -> map.put(venture.getId(), venture), Map::putAll);

        List<Property> properties = ventureId == null
                ? propertyRepository.findAll()
                : propertyRepository.findByVenture_Id(ventureId);

        List<CustomerPropertyVentureDto> ventureDtos = ventures.stream()
                .map(this::toVentureDto)
                .toList();

        CustomerPropertyVentureDto selectedVenture = null;

        if (ventureId != null) {
            selectedVenture = ventures.stream()
                    .filter(venture -> venture.getId().equals(ventureId))
                    .findFirst()
                    .map(this::toVentureDto)
                    .orElse(null);
        }

        List<CustomerPropertyDto> propertyDtos = properties.stream()
                .map(property -> toPropertyDto(property, venturesById))
                .toList();

        return new CustomerPropertiesPageResponseDto(
                ventureDtos,
                propertyDtos,
                selectedVenture
        );
    }

    private CustomerPropertyDto toPropertyDto(Property property, Map<Long, Venture> venturesById) {
        Venture venture = property.getVenture();
        Long ventureId = venture != null ? venture.getId() : null;
        String ventureName = ventureId != null && venturesById.containsKey(ventureId)
                ? venturesById.get(ventureId).getName()
                : "Aurov Venture";

        return new CustomerPropertyDto(
                property.getId(),
                ventureId,
                ventureName,
                property.getType(),
                property.getNumber(),
                property.getArea(),
                property.getBhkType(),
                property.getFacing(),
                property.getPrice(),
                formatStatus(property.getStatus()),
                property.getImage(),
                List.copyOf(property.getImages())
        );
    }

    private CustomerPropertyVentureDto toVentureDto(Venture venture) {
        List<String> ventureImages = venture.getGalleryImageUrls() == null
                ? List.of()
                : List.copyOf(venture.getGalleryImageUrls());

        return new CustomerPropertyVentureDto(
                venture.getId(),
                venture.getName(),
                venture.getPosterImageUrl(),
                ventureImages
        );
    }

    private String formatStatus(String status) {
        if (status == null || status.isBlank()) return "Available";
        if (status.equalsIgnoreCase("Available")) return "Available";
        if (status.equalsIgnoreCase("Reserved")) return "Reserved";
        if (status.equalsIgnoreCase("Booked")) return "Booked";
        if (status.equalsIgnoreCase("Sold")) return "Sold";
        if (status.equalsIgnoreCase("Blocked")) return "Blocked";
        return status;
    }
}
