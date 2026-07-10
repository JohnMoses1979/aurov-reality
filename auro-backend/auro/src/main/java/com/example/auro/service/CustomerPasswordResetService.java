package com.example.auro.service;

import com.example.auro.config.TwilioProperties;
import com.example.auro.dto.ApiMessageResponse;
import com.example.auro.dto.PasswordResetOtpRequest;
import com.example.auro.dto.ResetPasswordRequest;
import com.example.auro.entity.CustomerEntity;
import com.example.auro.repository.CustomerRepository;
import com.twilio.Twilio;
import com.twilio.rest.verify.v2.service.Verification;
import com.twilio.rest.verify.v2.service.VerificationCheck;
import lombok.RequiredArgsConstructor;
import org.springframework.http.HttpStatus;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.stereotype.Service;
import org.springframework.web.server.ResponseStatusException;

@Service
@RequiredArgsConstructor
public class CustomerPasswordResetService {

    private final CustomerRepository customerRepository;
    private final PasswordEncoder passwordEncoder;
    private final TwilioProperties twilioProperties;

    public ApiMessageResponse requestOtp(PasswordResetOtpRequest request) {
        String mobile = request.mobile().trim();

        customerRepository.findByMobileNumber(mobile)
                .orElseThrow(() -> new ResponseStatusException(
                        HttpStatus.NOT_FOUND,
                        "No customer account found with this mobile number"
                ));

        Twilio.init(
                twilioProperties.getAccountSid(),
                twilioProperties.getAuthToken()
        );

        Verification.creator(
                twilioProperties.getVerifyServiceSid(),
                "+91" + mobile,
                "sms"
        ).create();

        return new ApiMessageResponse("OTP sent to registered mobile number.");
    }

    public ApiMessageResponse resetPassword(ResetPasswordRequest request) {
        String mobile = request.mobile().trim();

        CustomerEntity customer = customerRepository.findByMobileNumber(mobile)
                .orElseThrow(() -> new ResponseStatusException(
                        HttpStatus.NOT_FOUND,
                        "No customer account found with this mobile number"
                ));

        Twilio.init(
                twilioProperties.getAccountSid(),
                twilioProperties.getAuthToken()
        );

        VerificationCheck verificationCheck = VerificationCheck.creator(
                        twilioProperties.getVerifyServiceSid())
                .setTo("+91" + mobile)
                .setCode(request.otp().trim())
                .create();

        if (!"approved".equalsIgnoreCase(verificationCheck.getStatus())) {
            throw new ResponseStatusException(
                    HttpStatus.BAD_REQUEST,
                    "Invalid or expired OTP"
            );
        }

        customer.setPassword(passwordEncoder.encode(request.password()));
        customerRepository.save(customer);

        return new ApiMessageResponse("Password updated successfully.");
    }
}
