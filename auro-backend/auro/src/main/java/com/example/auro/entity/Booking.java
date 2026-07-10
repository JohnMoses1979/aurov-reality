package com.example.auro.entity;

import java.time.LocalDate;
import java.time.LocalDateTime;

import jakarta.persistence.Entity;
import jakarta.persistence.EnumType;
import jakarta.persistence.Enumerated;
import jakarta.persistence.GeneratedValue;
import jakarta.persistence.GenerationType;
import jakarta.persistence.Id;
import jakarta.persistence.Table;

@Entity
@Table(name = "bookings")
public class Booking {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    private String bookingCode;
    private String customerName;
    private String phone;
    private String propertyTitle;
    private String propertyName;
    private String ventureName;
    private String paymentMode;
    private String status;

    @Enumerated(EnumType.STRING)
    private BookingType type;

    private LocalDate activityDate;
    private LocalDateTime createdAt = LocalDateTime.now();

    public Long getId() {
        return id;
    }

    public String getBookingCode() {
        return bookingCode;
    }

    public String getCustomerName() {
        return customerName;
    }

    public String getPhone() {
        return phone;
    }

    public String getPropertyTitle() {
        return propertyTitle;
    }

    public String getPropertyName() {
        return propertyName != null ? propertyName : propertyTitle;
    }

    public String getVentureName() {
        return ventureName;
    }

    public String getPaymentMode() {
        return paymentMode;
    }

    public String getStatus() {
        return status;
    }

    public BookingType getType() {
        return type;
    }

    public LocalDate getActivityDate() {
        return activityDate;
    }

    public LocalDateTime getCreatedAt() {
        return createdAt;
    }

    public void setBookingCode(String bookingCode) {
        this.bookingCode = bookingCode;
    }

    public void setCustomerName(String customerName) {
        this.customerName = customerName;
    }

    public void setPhone(String phone) {
        this.phone = phone;
    }

    public void setPropertyTitle(String propertyTitle) {
        this.propertyTitle = propertyTitle;
        if (this.propertyName == null) {
            this.propertyName = propertyTitle;
        }
    }

    public void setPropertyName(String propertyName) {
        this.propertyName = propertyName;
        this.propertyTitle = propertyName;
    }

    public void setVentureName(String ventureName) {
        this.ventureName = ventureName;
    }

    public void setPaymentMode(String paymentMode) {
        this.paymentMode = paymentMode;
    }

    public void setStatus(String status) {
        this.status = status;
    }

    public void setStatus(BookingStatus status) {
        this.status = status == null ? null : status.name();
    }

    public void setType(BookingType type) {
        this.type = type;
    }

    public void setActivityDate(LocalDate activityDate) {
        this.activityDate = activityDate;
    }

    public void setCreatedAt(LocalDateTime createdAt) {
        this.createdAt = createdAt;
    }
}
