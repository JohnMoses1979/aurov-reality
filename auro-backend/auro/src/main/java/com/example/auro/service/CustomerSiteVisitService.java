package com.example.auro.service;

 
import java.time.LocalDate;
import java.util.List;

import org.springframework.stereotype.Service;

import com.example.auro.dto.CustomerSiteVisitRequest;
import com.example.auro.dto.CustomerSiteVisitResponse;
import com.example.auro.entity.CustomerSiteVisit;
import com.example.auro.repository.CustomerSiteVisitRepository;

import lombok.RequiredArgsConstructor;

@Service
@RequiredArgsConstructor
public class CustomerSiteVisitService {

    private final CustomerSiteVisitRepository repository;

    public List<CustomerSiteVisitResponse> getAll() {
        return repository.findAll()
                .stream()
                .map(CustomerSiteVisitResponse::fromEntity)
                .toList();
    }

    public CustomerSiteVisitResponse getById(Long id) {
        CustomerSiteVisit visit = repository.findById(id)
                .orElseThrow(() -> new RuntimeException("Site visit not found"));

        return CustomerSiteVisitResponse.fromEntity(visit);
    }

    public CustomerSiteVisitResponse create(
            CustomerSiteVisitRequest request,
            String createdBy
    ) {
        CustomerSiteVisit visit = CustomerSiteVisit.builder()
                .customer(request.getCustomer())
                .phone(request.getPhone())
                .email(request.getEmail())
                .venture(request.getVenture())
                .visitDate(parseDate(request.getVisitDate()))
                .timeSlot(request.getTimeSlot())
                .status(request.getStatus() == null || request.getStatus().isBlank() ? "Pending" : request.getStatus())
                .notes(request.getNotes())
                .createdBy(createdBy)
                .build();

        CustomerSiteVisit saved = repository.save(visit);

        saved.setVisitCode("VIS" + String.format("%05d", saved.getId()));

        saved = repository.save(saved);

        return CustomerSiteVisitResponse.fromEntity(saved);
    }

    public CustomerSiteVisitResponse update(
            Long id,
            CustomerSiteVisitRequest request
    ) {
        CustomerSiteVisit visit = repository.findById(id)
                .orElseThrow(() -> new RuntimeException("Site visit not found"));

        visit.setCustomer(request.getCustomer());
        visit.setPhone(request.getPhone());
        visit.setEmail(request.getEmail());
        visit.setVenture(request.getVenture());
        visit.setVisitDate(parseDate(request.getVisitDate()));
        visit.setTimeSlot(request.getTimeSlot());
        visit.setStatus(request.getStatus());
        visit.setNotes(request.getNotes());

        CustomerSiteVisit saved = repository.save(visit);

        return CustomerSiteVisitResponse.fromEntity(saved);
    }

    public CustomerSiteVisitResponse updateStatus(Long id, String status) {
        CustomerSiteVisit visit = repository.findById(id)
                .orElseThrow(() -> new RuntimeException("Site visit not found"));

        visit.setStatus(status);

        CustomerSiteVisit saved = repository.save(visit);

        return CustomerSiteVisitResponse.fromEntity(saved);
    }

    public void delete(Long id) {
        if (!repository.existsById(id)) {
            throw new RuntimeException("Site visit not found");
        }

        repository.deleteById(id);
    }

    private LocalDate parseDate(String value) {
        if (value == null || value.isBlank()) {
            return null;
        }

        return LocalDate.parse(value);
    }
}
