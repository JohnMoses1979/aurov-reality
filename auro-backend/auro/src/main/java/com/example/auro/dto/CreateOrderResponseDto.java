package com.example.auro.dto;

 
import java.math.BigDecimal;

public record CreateOrderResponseDto(
        Long transactionId,
        String keyId,
        String orderId,
        BigDecimal amount,
        Integer amountInPaise,
        String currency,
        String customerName,
        String phone,
        String email
) {
}
