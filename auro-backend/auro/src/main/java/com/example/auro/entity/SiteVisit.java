package com.example.auro.entity;

import jakarta.persistence.Entity;
import jakarta.persistence.EnumType;
import jakarta.persistence.Enumerated;
import jakarta.persistence.GeneratedValue;
import jakarta.persistence.GenerationType;
import jakarta.persistence.Id;
import jakarta.persistence.Table;
import java.time.LocalDate;
import java.time.LocalDateTime;

@Entity
@Table(name = "site_visits")
public class SiteVisit {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    private String visitCode;
    private String customerName;
    private String phone;
    private String email;
    private Long ventureId;
    private String ventureName;
    private Long propertyId;
    private String propertyName;
    private LocalDate visitDate;
    private String timeSlot;

    @Enumerated(EnumType.STRING)
    private SiteVisitStatus status = SiteVisitStatus.PENDING;

    private LocalDateTime createdAt = LocalDateTime.now();

    public Long getId() {
        return id;
    }

    public String getVisitCode() {
        return visitCode;
    }

    public String getCustomerName() {
        return customerName;
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

    public String getVentureName() {
        return ventureName;
    }

    public Long getPropertyId() {
        return propertyId;
    }

    public String getPropertyName() {
        return propertyName;
    }

    public LocalDate getVisitDate() {
        return visitDate;
    }

    public String getTimeSlot() {
        return timeSlot;
    }

    public SiteVisitStatus getStatus() {
        return status;
    }

    public LocalDateTime getCreatedAt() {
        return createdAt;
    }

    public void setVisitCode(String visitCode) {
        this.visitCode = visitCode;
    }

    public void setCustomerName(String customerName) {
        this.customerName = customerName;
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

    public void setVentureName(String ventureName) {
        this.ventureName = ventureName;
    }

    public void setPropertyId(Long propertyId) {
        this.propertyId = propertyId;
    }

    public void setPropertyName(String propertyName) {
        this.propertyName = propertyName;
    }

    public void setVisitDate(LocalDate visitDate) {
        this.visitDate = visitDate;
    }

    public void setTimeSlot(String timeSlot) {
        this.timeSlot = timeSlot;
    }

    public void setStatus(SiteVisitStatus status) {
        this.status = status;
    }
}
