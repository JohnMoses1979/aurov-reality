package com.example.auro.dto;

 
import lombok.AllArgsConstructor;
import lombok.Getter;
import lombok.NoArgsConstructor;
import lombok.Setter;

@Getter
@Setter
@NoArgsConstructor
@AllArgsConstructor
public class CustomerSiteVisitRequest {

    private String customer;

    private String phone;

    private String email;

    private String venture;

    private String visitDate;

    private String timeSlot;

    private String status;

    private String notes;
}
