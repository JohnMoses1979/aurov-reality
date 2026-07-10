package com.example.auro.dto;

 
public record VerifyPaymentResponseDto(
        boolean success,
        String message,
        Long transactionId,
        String status,
        String razorpayPaymentId
) {
}
