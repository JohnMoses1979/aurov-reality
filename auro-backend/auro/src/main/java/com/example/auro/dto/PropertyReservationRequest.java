package com.example.auro.dto;

 
import java.math.BigDecimal;

import lombok.AllArgsConstructor;
import lombok.Getter;
import lombok.NoArgsConstructor;
import lombok.Setter;

@Getter
@Setter
@NoArgsConstructor
@AllArgsConstructor
public class PropertyReservationRequest {

    private String customer;

    private String phone;

    private String email;

    private String property;

    private String venture;

    private BigDecimal amount;

    private BigDecimal paid;

    private String bookingDate;

    private String status;

    private String notes;
}
