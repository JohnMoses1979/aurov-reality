package com.example.auro.service;

import com.example.auro.dto.SiteVisitOptionsResponseDto;
import com.example.auro.dto.SiteVisitPropertyOptionDto;
import com.example.auro.dto.SiteVisitRequestDto;
import com.example.auro.dto.SiteVisitResponseDto;
import com.example.auro.dto.SiteVisitVentureOptionDto;
import com.example.auro.entity.Property;
import com.example.auro.entity.SiteVisit;
import com.example.auro.entity.SiteVisitStatus;
import com.example.auro.entity.Venture;
import com.example.auro.repository.PropertyRepository;
import com.example.auro.repository.SiteVisitRepository;
import com.example.auro.repository.VentureRepository;
import java.util.List;
import java.util.Locale;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

@Service
public class SiteVisitServiceImpl implements SiteVisitService {

    private final VentureRepository ventureRepository;
    private final PropertyRepository propertyRepository;
    private final SiteVisitRepository siteVisitRepository;
    private final NotificationService notificationService;

    public SiteVisitServiceImpl(
            VentureRepository ventureRepository,
            PropertyRepository propertyRepository,
            SiteVisitRepository siteVisitRepository,
            NotificationService notificationService
    ) {
        this.ventureRepository = ventureRepository;
        this.propertyRepository = propertyRepository;
        this.siteVisitRepository = siteVisitRepository;
        this.notificationService = notificationService;
    }

    @Override
    public SiteVisitOptionsResponseDto getOptions() {
        List<SiteVisitVentureOptionDto> ventures = ventureRepository.findAll()
                .stream()
                .map(venture -> new SiteVisitVentureOptionDto(
                        venture.getId(),
                        venture.getName()
                ))
                .toList();

        List<SiteVisitPropertyOptionDto> properties = propertyRepository.findAll()
                .stream()
                .map(property -> new SiteVisitPropertyOptionDto(
                        property.getId(),
                        property.getVentureId(),
                        property.getType(),
                        property.getNumber(),
                        property.getArea(),
                        formatStatus(property.getStatus())
                ))
                .toList();

        return new SiteVisitOptionsResponseDto(ventures, properties);
    }

    @Override
    @Transactional
    public SiteVisitResponseDto createSiteVisit(SiteVisitRequestDto request) {
        validate(request);

        Venture venture = ventureRepository.findById(request.getVentureId())
                .orElseThrow(() -> new RuntimeException("Venture not found"));

        Property property = null;
        String propertyName = "General venture visit";

        if (request.getPropertyId() != null) {
            property = propertyRepository.findById(request.getPropertyId())
                    .orElseThrow(() -> new RuntimeException("Property not found"));

            if (!property.getVentureId().equals(venture.getId())) {
                throw new RuntimeException("Selected property does not belong to selected venture");
            }

            propertyName = property.getType() + " " + property.getNumber();
        }

        SiteVisit siteVisit = new SiteVisit();
        siteVisit.setCustomerName(request.getName().trim());
        siteVisit.setPhone(normalizePhone(request.getPhone()));
        siteVisit.setEmail(request.getEmail() == null ? null : request.getEmail().trim());
        siteVisit.setVentureId(venture.getId());
        siteVisit.setVentureName(venture.getName());
        siteVisit.setPropertyId(property == null ? null : property.getId());
        siteVisit.setPropertyName(propertyName);
        siteVisit.setVisitDate(request.getDate());
        siteVisit.setTimeSlot(request.getTimeSlot());
        siteVisit.setStatus(SiteVisitStatus.PENDING);

        SiteVisit saved = siteVisitRepository.save(siteVisit);
        saved.setVisitCode("SV-" + saved.getId());
        saved = siteVisitRepository.save(saved);

        notificationService.notifyRoles(
                List.of("Managing Director", "Operational Head"),
                "Site Visit",
                "New customer site visit booked",
                saved.getCustomerName() + " booked a site visit for " + saved.getVentureName() + ".",
                "SITE_VISIT",
                String.valueOf(saved.getId())
        );
        notificationService.notifyCustomerByPhone(
                saved.getPhone(),
                "Site Visit",
                "Site visit booked successfully",
                "Your site visit for " + saved.getVentureName() + " is booked with status Pending.",
                "SITE_VISIT",
                String.valueOf(saved.getId())
        );

        return toDto(saved);
    }

    @Override
    public List<SiteVisitResponseDto> getAllSiteVisits() {
        return siteVisitRepository.findAllByOrderByCreatedAtDesc()
                .stream()
                .map(this::toDto)
                .toList();
    }

    @Override
    public List<SiteVisitResponseDto> getSiteVisitsByPhone(String phone) {
        if (phone == null || phone.trim().isEmpty()) {
            return getAllSiteVisits();
        }

        return siteVisitRepository.findByPhoneOrderByCreatedAtDesc(normalizePhone(phone))
                .stream()
                .map(this::toDto)
                .toList();
    }

    @Override
    @Transactional
    public SiteVisitResponseDto updateSiteVisitStatus(Long id, String status) {
        SiteVisit siteVisit = siteVisitRepository.findById(id)
                .orElseThrow(() -> new RuntimeException("Site visit not found"));

        siteVisit.setStatus(parseStatus(status));
        SiteVisit saved = siteVisitRepository.save(siteVisit);

        notificationService.notifyCustomerByPhone(
                saved.getPhone(),
                "Site Visit Update",
                "Your site visit status changed",
                saved.getVentureName() + " site visit is now " + formatStatus(saved.getStatus().name()) + ".",
                "SITE_VISIT",
                String.valueOf(saved.getId())
        );

        return toDto(saved);
    }

    private void validate(SiteVisitRequestDto request) {
        if (request.getName() == null || request.getName().trim().isEmpty()) {
            throw new RuntimeException("Customer name is required");
        }

        if (request.getPhone() == null || request.getPhone().trim().isEmpty()) {
            throw new RuntimeException("Phone number is required");
        }

        normalizePhone(request.getPhone());

        if (request.getVentureId() == null) {
            throw new RuntimeException("Venture is required");
        }

        if (request.getDate() == null) {
            throw new RuntimeException("Visit date is required");
        }

        if (request.getTimeSlot() == null || request.getTimeSlot().trim().isEmpty()) {
            throw new RuntimeException("Time slot is required");
        }
    }

    private String normalizePhone(String phone) {
        String digits = phone == null ? "" : phone.replaceAll("\\D", "");
        if (digits.length() > 10 && digits.startsWith("91")) {
            digits = digits.substring(digits.length() - 10);
        }
        if (digits.length() != 10) {
            throw new RuntimeException("Phone number must be 10 digits");
        }
        return digits;
    }

    private SiteVisitStatus parseStatus(String status) {
        String normalized = status == null ? "" : status.trim().toLowerCase(Locale.ROOT);
        return switch (normalized) {
            case "confirmed" -> SiteVisitStatus.CONFIRMED;
            case "completed", "complete", "closed", "close" -> SiteVisitStatus.COMPLETED;
            case "cancelled", "canceled" -> SiteVisitStatus.CANCELLED;
            case "pending" -> SiteVisitStatus.PENDING;
            default -> throw new RuntimeException("Invalid site visit status");
        };
    }

    private SiteVisitResponseDto toDto(SiteVisit siteVisit) {
        return new SiteVisitResponseDto(
                siteVisit.getVisitCode() != null ? siteVisit.getVisitCode() : "SV-" + siteVisit.getId(),
                siteVisit.getId(),
                siteVisit.getCustomerName(),
                siteVisit.getPhone(),
                siteVisit.getEmail(),
                "Site Visit",
                siteVisit.getVentureId(),
                siteVisit.getVentureName(),
                siteVisit.getPropertyId(),
                siteVisit.getPropertyName(),
                siteVisit.getVisitDate(),
                siteVisit.getTimeSlot(),
                formatStatus(siteVisit.getStatus().name()),
                siteVisit.getCreatedAt()
        );
    }

    private String formatStatus(String status) {
        if (status == null || status.isBlank()) {
            return "Pending";
        }

        return status.substring(0, 1).toUpperCase() + status.substring(1).toLowerCase(Locale.ROOT);
    }
}
