package com.example.auro.dto;

import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.Pattern;
import jakarta.validation.constraints.Size;

public record ResetPasswordRequest(

    @NotBlank
    @Pattern(regexp ="\\d{10}", message ="mobile number number must be 10 digits")
    String mobile,

    @NotBlank
    @Pattern(regexp = "\\d{6}", message = "OTP must be 6 digits")
    String otp,

    @NotBlank
    @Size(min = 6, max = 100 , message ="password must be at least 6 characters ")
    String password
) {
}
