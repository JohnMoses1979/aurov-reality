package com.example.auro.service;

import com.example.auro.dto.SiteVisitOptionsResponseDto;
import com.example.auro.dto.SiteVisitRequestDto;
import com.example.auro.dto.SiteVisitResponseDto;
import java.util.List;

public interface SiteVisitService {

    SiteVisitOptionsResponseDto getOptions();

    SiteVisitResponseDto createSiteVisit(SiteVisitRequestDto request);

    List<SiteVisitResponseDto> getAllSiteVisits();

    List<SiteVisitResponseDto> getSiteVisitsByPhone(String phone);

    SiteVisitResponseDto updateSiteVisitStatus(Long id, String status);
}
