package com.example.auro.controller;

import com.example.auro.dto.SiteVisitOptionsResponseDto;
import com.example.auro.dto.SiteVisitRequestDto;
import com.example.auro.dto.SiteVisitResponseDto;
import com.example.auro.dto.StatusUpdateRequest;
import com.example.auro.service.SiteVisitService;
import java.util.List;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.PatchMapping;
import org.springframework.web.bind.annotation.PathVariable;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.RequestBody;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RequestParam;
import org.springframework.web.bind.annotation.RestController;

@RestController
@RequestMapping("/api/customer")
public class SiteVisitController {

    private final SiteVisitService siteVisitService;

    public SiteVisitController(SiteVisitService siteVisitService) {
        this.siteVisitService = siteVisitService;
    }

    @GetMapping("/site-visit-options")
    public SiteVisitOptionsResponseDto getOptions() {
        return siteVisitService.getOptions();
    }

    @PostMapping("/site-visits")
    public SiteVisitResponseDto createSiteVisit(@RequestBody SiteVisitRequestDto request) {
        return siteVisitService.createSiteVisit(request);
    }

    @GetMapping("/site-visits")
    public List<SiteVisitResponseDto> getSiteVisits(@RequestParam(required = false) String phone) {
        return siteVisitService.getSiteVisitsByPhone(phone);
    }

    @PatchMapping("/site-visits/{id}/status")
    public SiteVisitResponseDto updateSiteVisitStatus(
            @PathVariable Long id,
            @RequestBody StatusUpdateRequest request
    ) {
        return siteVisitService.updateSiteVisitStatus(id, request.getStatus());
    }
}
