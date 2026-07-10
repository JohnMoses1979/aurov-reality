package com.example.auro.dto;

 
public class ContactRequestDto {

    private String name;
    private String phone;
    private String email;
    private Long ventureId;
    private Long propertyId;
    private String message;
    private String leadType;

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

    public String getMessage() {
        return message;
    }

    public String getLeadType() {
        return leadType;
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

    public void setMessage(String message) {
        this.message = message;
    }

    public void setLeadType(String leadType) {
        this.leadType = leadType;
    }
}
