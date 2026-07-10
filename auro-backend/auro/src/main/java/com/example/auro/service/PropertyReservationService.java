package com.example.auro.service;

 
import java.math.BigDecimal;
import java.time.LocalDate;
import java.util.List;

import org.springframework.stereotype.Service;

import com.example.auro.dto.PropertyReservationRequest;
import com.example.auro.dto.PropertyReservationResponse;
import com.example.auro.entity.PropertyReservation;
import com.example.auro.repository.PropertyReservationRepository;

import lombok.RequiredArgsConstructor;

@Service
@RequiredArgsConstructor
public class PropertyReservationService {

    private final PropertyReservationRepository repository;

    public List<PropertyReservationResponse> getAll() {
        return repository.findAll()
                .stream()
                .map(PropertyReservationResponse::fromEntity)
                .toList();
    }

    public PropertyReservationResponse getById(Long id) {
        PropertyReservation booking = repository.findById(id)
                .orElseThrow(() -> new RuntimeException("Property reservation not found"));

        return PropertyReservationResponse.fromEntity(booking);
    }

    public PropertyReservationResponse create(
            PropertyReservationRequest request,
            String createdBy
    ) {
        PropertyReservation booking = PropertyReservation.builder()
                .customer(request.getCustomer())
                .phone(request.getPhone())
                .email(request.getEmail())
                .property(request.getProperty())
                .venture(request.getVenture())
                .amount(request.getAmount())
                .paid(request.getPaid() == null ? BigDecimal.ZERO : request.getPaid())
                .bookingDate(parseDate(request.getBookingDate()))
                .status(request.getStatus() == null || request.getStatus().isBlank() ? "Pending" : request.getStatus())
                .notes(request.getNotes())
                .createdBy(createdBy)
                .build();

        PropertyReservation saved = repository.save(booking);

        saved.setBookingCode("BOOK" + String.format("%05d", saved.getId()));

        saved = repository.save(saved);

        return PropertyReservationResponse.fromEntity(saved);
    }

    public PropertyReservationResponse update(
            Long id,
            PropertyReservationRequest request
    ) {
        PropertyReservation booking = repository.findById(id)
                .orElseThrow(() -> new RuntimeException("Property reservation not found"));

        booking.setCustomer(request.getCustomer());
        booking.setPhone(request.getPhone());
        booking.setEmail(request.getEmail());
        booking.setProperty(request.getProperty());
        booking.setVenture(request.getVenture());
        booking.setAmount(request.getAmount());
        booking.setPaid(request.getPaid() == null ? BigDecimal.ZERO : request.getPaid());
        booking.setBookingDate(parseDate(request.getBookingDate()));
        booking.setStatus(request.getStatus());
        booking.setNotes(request.getNotes());

        PropertyReservation saved = repository.save(booking);

        return PropertyReservationResponse.fromEntity(saved);
    }

    public PropertyReservationResponse updateStatus(Long id, String status) {
        PropertyReservation booking = repository.findById(id)
                .orElseThrow(() -> new RuntimeException("Property reservation not found"));

        booking.setStatus(status);

        PropertyReservation saved = repository.save(booking);

        return PropertyReservationResponse.fromEntity(saved);
    }

    public void delete(Long id) {
        if (!repository.existsById(id)) {
            throw new RuntimeException("Property reservation not found");
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
