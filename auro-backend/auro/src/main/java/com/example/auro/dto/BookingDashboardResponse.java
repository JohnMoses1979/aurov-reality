package com.example.auro.dto;

 
import java.math.BigDecimal;

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
public class BookingDashboardResponse {

    private Long id;

    private String code;

    private String type;

    private String customer;

    private String phone;

    private String email;

    private String property;

    private String venture;

    private String date;

    private String timeSlot;

    private BigDecimal amount;

    private BigDecimal paid;

    private String status;
}
