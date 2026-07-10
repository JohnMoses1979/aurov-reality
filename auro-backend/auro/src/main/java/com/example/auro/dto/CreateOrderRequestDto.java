package com.example.auro.dto;

 
import java.math.BigDecimal;

public class CreateOrderRequestDto {

    private Long bookingId;
    private Long propertyId;
    private Long ventureId;

    private String customerName;
    private String phone;
    private String email;

    private BigDecimal amount;

    public Long getBookingId() {
        return bookingId;
    }

    public Long getPropertyId() {
        return propertyId;
    }

    public Long getVentureId() {
        return ventureId;
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

    public BigDecimal getAmount() {
        return amount;
    }

    public void setBookingId(Long bookingId) {
        this.bookingId = bookingId;
    }

    public void setPropertyId(Long propertyId) {
        this.propertyId = propertyId;
    }

    public void setVentureId(Long ventureId) {
        this.ventureId = ventureId;
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

    public void setAmount(BigDecimal amount) {
        this.amount = amount;
    }
}
