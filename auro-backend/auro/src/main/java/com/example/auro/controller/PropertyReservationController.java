package com.example.auro.controller;

 
import java.util.List;

import org.springframework.security.core.Authentication;
import org.springframework.web.bind.annotation.DeleteMapping;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.PatchMapping;
import org.springframework.web.bind.annotation.PathVariable;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.PutMapping;
import org.springframework.web.bind.annotation.RequestBody;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;

import com.example.auro.dto.PropertyReservationRequest;
import com.example.auro.dto.PropertyReservationResponse;
import com.example.auro.dto.StatusUpdateRequest;
import com.example.auro.service.PropertyReservationService;

import lombok.RequiredArgsConstructor;

@RestController
@RequestMapping("/api/property-reservations")
@RequiredArgsConstructor
public class PropertyReservationController {

    private final PropertyReservationService service;

    @GetMapping
    public List<PropertyReservationResponse> getAll() {
        return service.getAll();
    }

    @GetMapping("/{id}")
    public PropertyReservationResponse getById(@PathVariable Long id) {
        return service.getById(id);
    }

    @PostMapping
    public PropertyReservationResponse create(
            @RequestBody PropertyReservationRequest request,
            Authentication authentication
    ) {
        String createdBy = authentication == null ? "Customer" : authentication.getName();

        return service.create(request, createdBy);
    }

    @PutMapping("/{id}")
    public PropertyReservationResponse update(
            @PathVariable Long id,
            @RequestBody PropertyReservationRequest request
    ) {
        return service.update(id, request);
    }

    @PatchMapping("/{id}/status")
    public PropertyReservationResponse updateStatus(
            @PathVariable Long id,
            @RequestBody StatusUpdateRequest request
    ) {
        return service.updateStatus(id, request.getStatus());
    }

    @DeleteMapping("/{id}")
    public void delete(@PathVariable Long id) {
        service.delete(id);
    }
}
