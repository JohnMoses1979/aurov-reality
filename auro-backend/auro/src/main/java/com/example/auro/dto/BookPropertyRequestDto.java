package com.example.auro.dto;

import java.math.BigDecimal;

public class BookPropertyRequestDto {

    private String name;
    private String phone;
    private Long ventureId;
    private Long propertyId;
    private BigDecimal amount;
    private String paymentMode;
    private String upiId;
    private String bankName;
    private String accountHolderName;
    private String transferReference;
    private String cardHolderName;
    private String cardLastFour;
    private String cashReceiptNumber;
    private String paymentReference;
    private String paymentStatus;
    private String remarks;

    public String getName() {
        return name;
    }

    public String getPhone() {
        return phone;
    }

    public Long getVentureId() {
        return ventureId;
    }

    public Long getPropertyId() {
        return propertyId;
    }

    public BigDecimal getAmount() {
        return amount;
    }

    public String getPaymentMode() {
        return paymentMode;
    }

    public String getUpiId() {
        return upiId;
    }

    public String getBankName() {
        return bankName;
    }

    public String getAccountHolderName() {
        return accountHolderName;
    }

    public String getTransferReference() {
        return transferReference;
    }

    public String getCardHolderName() {
        return cardHolderName;
    }

    public String getCardLastFour() {
        return cardLastFour;
    }

    public String getCashReceiptNumber() {
        return cashReceiptNumber;
    }

    public String getPaymentReference() {
        return paymentReference;
    }

    public String getPaymentStatus() {
        return paymentStatus;
    }

    public String getRemarks() {
        return remarks;
    }

    public void setName(String name) {
        this.name = name;
    }

    public void setPhone(String phone) {
        this.phone = phone;
    }

    public void setVentureId(Long ventureId) {
        this.ventureId = ventureId;
    }

    public void setPropertyId(Long propertyId) {
        this.propertyId = propertyId;
    }

    public void setAmount(BigDecimal amount) {
        this.amount = amount;
    }

    public void setPaymentMode(String paymentMode) {
        this.paymentMode = paymentMode;
    }

    public void setUpiId(String upiId) {
        this.upiId = upiId;
    }

    public void setBankName(String bankName) {
        this.bankName = bankName;
    }

    public void setAccountHolderName(String accountHolderName) {
        this.accountHolderName = accountHolderName;
    }

    public void setTransferReference(String transferReference) {
        this.transferReference = transferReference;
    }

    public void setCardHolderName(String cardHolderName) {
        this.cardHolderName = cardHolderName;
    }

    public void setCardLastFour(String cardLastFour) {
        this.cardLastFour = cardLastFour;
    }

    public void setCashReceiptNumber(String cashReceiptNumber) {
        this.cashReceiptNumber = cashReceiptNumber;
    }

    public void setPaymentReference(String paymentReference) {
        this.paymentReference = paymentReference;
    }

    public void setPaymentStatus(String paymentStatus) {
        this.paymentStatus = paymentStatus;
    }

    public void setRemarks(String remarks) {
        this.remarks = remarks;
    }
}
