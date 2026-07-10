package com.example.auro.service;

 
import com.example.auro.dto.ContactOptionsResponseDto;
import com.example.auro.dto.ContactRequestDto;
import com.example.auro.dto.ContactResponseDto;

public interface ContactService {

    ContactOptionsResponseDto getContactOptions();

    ContactResponseDto createContactRequest(ContactRequestDto request);
}
