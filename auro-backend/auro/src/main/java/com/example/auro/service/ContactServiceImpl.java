package com.example.auro.service;

 
import java.util.List;

import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import com.example.auro.dto.ContactOptionsResponseDto;
import com.example.auro.dto.ContactRequestDto;
import com.example.auro.dto.ContactResponseDto;
import com.example.auro.dto.ContactVentureOptionDto;
import com.example.auro.entity.CustomerLead;
import com.example.auro.entity.Property;
import com.example.auro.entity.Venture;
import com.example.auro.repository.CustomerLeadRepository;
import com.example.auro.repository.PropertyRepository;
import com.example.auro.repository.VentureRepository;

@Service
public class ContactServiceImpl implements ContactService {

    private final VentureRepository ventureRepository;
    private final PropertyRepository propertyRepository;
    private final CustomerLeadRepository leadRepository;

    public ContactServiceImpl(
            VentureRepository ventureRepository,
            PropertyRepository propertyRepository,
            CustomerLeadRepository leadRepository
    ) {
        this.ventureRepository = ventureRepository;
        this.propertyRepository = propertyRepository;
        this.leadRepository = leadRepository;
    }

    @Override
    public ContactOptionsResponseDto getContactOptions() {
        List<ContactVentureOptionDto> ventures = ventureRepository.findAll()
                .stream()
                .map(venture -> new ContactVentureOptionDto(
                        venture.getId(),
                        venture.getName()
                ))
                .toList();

        return new ContactOptionsResponseDto(ventures);
    }

    @Override
    @Transactional
    public ContactResponseDto createContactRequest(ContactRequestDto request) {
        validate(request);

        Venture venture = null;
        String ventureName = "General enquiry";

        if (request.getVentureId() != null) {
            venture = ventureRepository.findById(request.getVentureId())
                    .orElseThrow(() -> new RuntimeException("Venture not found"));

            ventureName = venture.getName();
        }

        Property property = null;
        String propertyName = "";

        if (request.getPropertyId() != null) {
            property = propertyRepository.findById(request.getPropertyId())
                    .orElseThrow(() -> new RuntimeException("Property not found"));

            propertyName = property.getType() + " " + property.getNumber();

            if (venture != null && !property.getVentureId().equals(venture.getId())) {
                throw new RuntimeException("Selected property does not belong to selected venture");
            }
        }

        CustomerLead lead = new CustomerLead();
        lead.setLeadType(
                request.getLeadType() == null || request.getLeadType().isBlank()
                        ? "Contact Request"
                        : request.getLeadType()
        );
        lead.setCustomerName(request.getName().trim());
        lead.setPhone(request.getPhone().trim());
        lead.setEmail(request.getEmail());
        lead.setVentureId(venture == null ? null : venture.getId());
        lead.setVentureName(ventureName);
        lead.setPropertyId(property == null ? null : property.getId());
        lead.setPropertyName(propertyName);
        lead.setMessage(request.getMessage().trim());
        lead.setStatus("New");

        CustomerLead saved = leadRepository.save(lead);
        saved.setLeadCode("LD-" + saved.getId());
        saved = leadRepository.save(saved);

        return toDto(saved);
    }

    private void validate(ContactRequestDto request) {
        if (request.getName() == null || request.getName().trim().isEmpty()) {
            throw new RuntimeException("Name is required");
        }

        if (request.getPhone() == null || request.getPhone().trim().isEmpty()) {
            throw new RuntimeException("Phone is required");
        }

        if (request.getMessage() == null || request.getMessage().trim().isEmpty()) {
            throw new RuntimeException("Message is required");
        }
    }

    private ContactResponseDto toDto(CustomerLead lead) {
        return new ContactResponseDto(
                lead.getLeadCode() != null ? lead.getLeadCode() : "LD-" + lead.getId(),
                lead.getId(),
                lead.getCustomerName(),
                lead.getPhone(),
                lead.getEmail(),
                lead.getLeadType(),
                lead.getVentureId(),
                lead.getVentureName(),
                lead.getPropertyId(),
                lead.getPropertyName(),
                lead.getMessage(),
                lead.getStatus(),
                lead.getCreatedAt()
        );
    }
}

