package com.example.auro.controller;

 
import com.example.auro.dto.ApiMessageResponse;
import com.example.auro.dto.PasswordResetOtpRequest;
import com.example.auro.dto.ResetPasswordRequest;
import com.example.auro.service.CustomerPasswordResetService;
import jakarta.validation.Valid;
import lombok.RequiredArgsConstructor;
import org.springframework.web.bind.annotation.*;

@RestController
@RequiredArgsConstructor
@RequestMapping("/api/auth/customer")
public class CustomerPasswordResetController {

    private final CustomerPasswordResetService passwordResetService;

    @PostMapping("/forgot-password/request-otp")
    public ApiMessageResponse requestPasswordResetOtp(
            @Valid @RequestBody PasswordResetOtpRequest request
    ) {
        return passwordResetService.requestOtp(request);
    }

    @PostMapping("/forgot-password/reset")
    public ApiMessageResponse resetPassword(
            @Valid @RequestBody ResetPasswordRequest request
    ) {
        return passwordResetService.resetPassword(request);
    }
}

