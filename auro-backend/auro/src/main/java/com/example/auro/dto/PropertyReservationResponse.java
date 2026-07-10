package com.example.auro.dto;

 
import java.math.BigDecimal;

import com.example.auro.entity.PropertyReservation;

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
public class PropertyReservationResponse {

    private Long id;

    private String bookingCode;

    private String type;

    private String customer;

    private String phone;

    private String email;

    private String property;

    private String venture;

    private BigDecimal amount;

    private BigDecimal paid;

    private String date;

    private String status;

    private String notes;

    private String createdBy;

    private String createdAt;

    public static PropertyReservationResponse fromEntity(PropertyReservation booking) {
        return PropertyReservationResponse.builder()
                .id(booking.getId())
                .bookingCode(booking.getBookingCode())
                .type("Property Reservation")
                .customer(booking.getCustomer())
                .phone(booking.getPhone())
                .email(booking.getEmail())
                .property(booking.getProperty())
                .venture(booking.getVenture())
                .amount(booking.getAmount())
                .paid(booking.getPaid())
                .date(booking.getBookingDate() == null ? null : booking.getBookingDate().toString())
                .status(booking.getStatus())
                .notes(booking.getNotes())
                .createdBy(booking.getCreatedBy())
                .createdAt(booking.getCreatedAt() == null ? null : booking.getCreatedAt().toLocalDate().toString())
                .build();
    }
}