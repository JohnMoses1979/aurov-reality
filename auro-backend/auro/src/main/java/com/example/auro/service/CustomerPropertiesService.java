package com.example.auro.service;

 
import com.example.auro.dto.CustomerPropertiesPageResponseDto;

public interface CustomerPropertiesService {

    CustomerPropertiesPageResponseDto getPropertiesPage(Long ventureId);
}
