package com.example.auro.controller;

import com.example.auro.dto.CustomerSiteVisitRequest;
import com.example.auro.dto.CustomerSiteVisitResponse;
import com.example.auro.dto.StatusUpdateRequest;
import com.example.auro.service.CustomerSiteVisitService;
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

@RestController
@RequestMapping("/api/site-visits")
public class CustomerSiteVisitController {

    private final CustomerSiteVisitService service;

    public CustomerSiteVisitController(CustomerSiteVisitService service) {
        this.service = service;
    }

    @GetMapping
    public List<CustomerSiteVisitResponse> getAll() {
        return service.getAll();
    }

    @GetMapping("/{id}")
    public CustomerSiteVisitResponse getById(@PathVariable Long id) {
        return service.getById(id);
    }

    @PostMapping
    public CustomerSiteVisitResponse create(
            @RequestBody CustomerSiteVisitRequest request,
            Authentication authentication
    ) {
        String createdBy = authentication == null ? "Customer" : authentication.getName();
        return service.create(request, createdBy);
    }

    @PutMapping("/{id}")
    public CustomerSiteVisitResponse update(
            @PathVariable Long id,
            @RequestBody CustomerSiteVisitRequest request
    ) {
        return service.update(id, request);
    }

    @PatchMapping("/{id}/status")
    public CustomerSiteVisitResponse updateStatus(
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
