package com.example.auro.dto;

 
import com.example.auro.entity.CustomerSiteVisit;

import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Getter;
import lombok.NoArgsConstructor;
import lombok.Setter;

@Getter
@Setter
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class CustomerSiteVisitResponse {

    private Long id;

    private String visitCode;

    private String type;

    private String customer;

    private String phone;

    private String email;

    private String venture;

    private String date;

    private String timeSlot;

    private String status;

    private String notes;

    private String createdBy;

    private String createdAt;

    public static CustomerSiteVisitResponse fromEntity(CustomerSiteVisit visit) {
        return CustomerSiteVisitResponse.builder()
                .id(visit.getId())
                .visitCode(visit.getVisitCode())
                .type("Site Visit")
                .customer(visit.getCustomer())
                .phone(visit.getPhone())
                .email(visit.getEmail())
                .venture(visit.getVenture())
                .date(visit.getVisitDate() == null ? null : visit.getVisitDate().toString())
                .timeSlot(visit.getTimeSlot())
                .status(visit.getStatus())
                .notes(visit.getNotes())
                .createdBy(visit.getCreatedBy())
                .createdAt(visit.getCreatedAt() == null ? null : visit.getCreatedAt().toLocalDate().toString())
                .build();
    }
}
