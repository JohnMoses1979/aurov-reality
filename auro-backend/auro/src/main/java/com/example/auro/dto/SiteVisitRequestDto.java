package com.example.auro.dto;

 
import java.time.LocalDate;

public class SiteVisitRequestDto {

    private String name;
    private String phone;
    private String email;
    private Long ventureId;
    private Long propertyId;
    private LocalDate date;
    private String timeSlot;

    public String getName() {
        return name;
    }

    public String getPhone() {
        return phone;
    }

    public String getEmail() {
        return email;
    }

    public Long getVentureId() {
        return ventureId;
    }

    public Long getPropertyId() {
        return propertyId;
    }

    public LocalDate getDate() {
        return date;
    }

    public String getTimeSlot() {
        return timeSlot;
    }

    public void setName(String name) {
        this.name = name;
    }

    public void setPhone(String phone) {
        this.phone = phone;
    }

    public void setEmail(String email) {
        this.email = email;
    }

    public void setVentureId(Long ventureId) {
        this.ventureId = ventureId;
    }

    public void setPropertyId(Long propertyId) {
        this.propertyId = propertyId;
    }

    public void setDate(LocalDate date) {
        this.date = date;
    }

    public void setTimeSlot(String timeSlot) {
        this.timeSlot = timeSlot;
    }
}
