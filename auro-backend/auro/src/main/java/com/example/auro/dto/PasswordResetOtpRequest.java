package com.example.auro.dto;

import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.Pattern;

public record PasswordResetOtpRequest(
    @NotBlank
    @Pattern(regexp = "\\d{10}",message="mobile number must be 10 digits")
    String mobile
) {
}