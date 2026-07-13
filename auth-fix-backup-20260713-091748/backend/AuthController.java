package com.example.auro.controller;

import org.springframework.http.HttpStatus;
import org.springframework.web.bind.annotation.CrossOrigin;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.RequestBody;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.ResponseStatus;
import org.springframework.web.bind.annotation.RestController;

import com.example.auro.dto.CreateCustomerRequest;
import com.example.auro.dto.LoginRequest;
import com.example.auro.dto.LoginResponse;
import com.example.auro.dto.OtpRequest;
import com.example.auro.dto.OtpResponse;
import com.example.auro.dto.OtpVerificationRequest;
import com.example.auro.dto.PasswordResetRequest;
import com.example.auro.dto.UserResponse;
import com.example.auro.service.AuthService;

import jakarta.validation.Valid;

@RestController
@RequestMapping("/api/auth")
@CrossOrigin(origins = {
        "http://localhost:3000",
        "http://localhost:5173",
        "http://localhost:8080",
        "http://localhost:8081"
})
public class AuthController {

    private final AuthService authService;

    public AuthController(AuthService authService) {
        this.authService = authService;
    }

    /**
     * Login for Managing Director, Operational Head, Managers,
     * Executives and Customer.
     *
     * POST /api/auth/login
     */
    @PostMapping("/login")
    public LoginResponse login(@Valid @RequestBody LoginRequest request) {
        return authService.login(request);
    }

    /**
     * Send OTP for customer registration.
     *
     * POST /api/auth/customer/register/otp
     */
    @PostMapping("/customer/register/otp")
    public OtpResponse requestCustomerRegistrationOtp(@Valid @RequestBody OtpRequest request) {
        return authService.requestCustomerRegistrationOtp(request);
    }

    /**
     * Register customer after OTP verification.
     *
     * POST /api/auth/customer/register
     * POST /api/auth/register-customer
     */
    @PostMapping({
            "/customer/register",
            "/register-customer"
    })
    @ResponseStatus(HttpStatus.CREATED)
    public UserResponse registerCustomer(@Valid @RequestBody CreateCustomerRequest request) {
        return authService.registerCustomer(request);
    }

    /**
     * Send OTP for password reset.
     *
     * POST /api/auth/password-reset/otp
     */
    @PostMapping("/password-reset/otp")
    public OtpResponse requestPasswordResetOtp(@Valid @RequestBody OtpRequest request) {
        return authService.requestPasswordResetOtp(request);
    }

    /**
     * Verify password reset OTP.
     *
     * POST /api/auth/password-reset/verify
     */
    @PostMapping("/password-reset/verify")
    public OtpResponse verifyPasswordResetOtp(@Valid @RequestBody OtpVerificationRequest request) {
        return authService.verifyPasswordResetOtp(request);
    }

    /**
     * Reset password after OTP verification.
     *
     * POST /api/auth/password-reset
     */
    @PostMapping("/password-reset")
    public UserResponse resetPassword(@Valid @RequestBody PasswordResetRequest request) {
        return authService.resetPassword(request);
    }

    /**
     * Send OTP for profile mobile update.
     *
     * POST /api/auth/profile-mobile/otp
     */
    @PostMapping("/profile-mobile/otp")
    public OtpResponse requestProfileMobileOtp(@Valid @RequestBody OtpRequest request) {
        return authService.requestProfileMobileOtp(request);
    }

    /**
     * Verify OTP for profile mobile update.
     *
     * POST /api/auth/profile-mobile/verify
     */
    @PostMapping("/profile-mobile/verify")
    public OtpResponse verifyProfileMobileOtp(@Valid @RequestBody OtpVerificationRequest request) {
        return authService.verifyProfileMobileOtp(request);
    }
}