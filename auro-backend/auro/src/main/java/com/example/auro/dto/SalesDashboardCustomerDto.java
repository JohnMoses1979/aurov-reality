package com.example.auro.dto;

public record SalesDashboardCustomerDto(
        String id,
        Long recordId,
        String customer,
        String source,
        String phone,
        String email,
        String status
) {
}
