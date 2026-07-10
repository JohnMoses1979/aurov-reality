package com.example.auro.service;

import java.security.SecureRandom;
import java.time.Instant;
import java.util.Map;
import java.util.concurrent.ConcurrentHashMap;

import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.http.HttpStatus;
import org.springframework.stereotype.Service;
import org.springframework.util.StringUtils;
import org.springframework.web.server.ResponseStatusException;

import com.example.auro.config.TwilioProperties;
import com.twilio.Twilio;
import com.twilio.exception.ApiException;
import com.twilio.rest.verify.v2.service.Verification;
import com.twilio.rest.verify.v2.service.VerificationCheck;

@Service
public class OtpService {

    private static final Logger log = LoggerFactory.getLogger(OtpService.class);

    private static final long VERIFIED_TTL_SECONDS = 600; // 10 minutes
    private static final long FALLBACK_OTP_TTL_SECONDS = 300; // 5 minutes

    private final TwilioProperties twilioProperties;
    private final boolean devMode;
    private final boolean exposeFallbackOtp;
    private final boolean allowFallbackOtp;

    private final Map<String, Instant> verifiedMobiles = new ConcurrentHashMap<>();
    private final Map<String, FallbackOtpRecord> fallbackOtps = new ConcurrentHashMap<>();
    private final SecureRandom secureRandom = new SecureRandom();

    public OtpService(
            TwilioProperties twilioProperties,
            @Value("${app.otp.dev-mode:false}") boolean devMode,
            @Value("${app.otp.expose-fallback-code:false}") boolean exposeFallbackOtp,
            @Value("${app.otp.allow-fallback:false}") boolean allowFallbackOtp
    ) {
        this.twilioProperties = twilioProperties;
        this.devMode = devMode;
        this.exposeFallbackOtp = exposeFallbackOtp;
        this.allowFallbackOtp = allowFallbackOtp;

        if (devMode) {
            log.warn("OTP dev mode is enabled. SMS will not be sent. Local OTP will be generated.");
            return;
        }

        if (isTwilioConfigured()) {
            Twilio.init(twilioProperties.getAccountSid(), twilioProperties.getAuthToken());
            log.info("Twilio Verify initialized successfully.");
        } else if (allowFallbackOtp) {
            log.warn("Twilio Verify is not configured. Local fallback OTP is enabled.");
        } else {
            log.error("Twilio Verify is not configured and fallback OTP is disabled.");
        }
    }

    /**
     * Sends OTP.
     *
     * Returns fallback OTP only when:
     * app.otp.dev-mode=true OR app.otp.allow-fallback=true
     * AND app.otp.expose-fallback-code=true
     */
    public String sendOtp(String mobile) {
        PhoneNumber phone = normalizeIndianMobile(mobile);

        if (devMode) {
            return createFallbackOtp(phone.clean10());
        }

        if (isTwilioConfigured()) {
            try {
                Verification verification = Verification.creator(
                        twilioProperties.getVerifyServiceSid(),
                        phone.e164(),
                        "sms"
                ).create();

                fallbackOtps.remove(phone.clean10());

                log.info("Twilio OTP sent to {}, status={}", phone.e164(), verification.getStatus());
                return null;

            } catch (ApiException ex) {
                log.error("Twilio OTP send failed for {}. Code={}, Message={}",
                        phone.e164(), ex.getCode(), ex.getMessage(), ex);

                if (!allowFallbackOtp) {
                    throw new ResponseStatusException(
                            HttpStatus.SERVICE_UNAVAILABLE,
                            "OTP service failed: " + ex.getMessage()
                    );
                }

                log.warn("Using fallback OTP because Twilio send failed for {}", phone.e164());
                return createFallbackOtp(phone.clean10());

            } catch (Exception ex) {
                log.error("Unexpected OTP send error for {}", phone.e164(), ex);

                if (!allowFallbackOtp) {
                    throw new ResponseStatusException(
                            HttpStatus.SERVICE_UNAVAILABLE,
                            "OTP service is temporarily unavailable. Please try again."
                    );
                }

                return createFallbackOtp(phone.clean10());
            }
        }

        if (!allowFallbackOtp) {
            throw new ResponseStatusException(
                    HttpStatus.SERVICE_UNAVAILABLE,
                    "Twilio OTP settings are missing. Please configure Twilio."
            );
        }

        return createFallbackOtp(phone.clean10());
    }

    public boolean verifyOtp(String mobile, String otp) {
        PhoneNumber phone = normalizeIndianMobile(mobile);

        if (!StringUtils.hasText(otp)) {
            throw new ResponseStatusException(HttpStatus.BAD_REQUEST, "OTP is required");
        }

        String otpCode = otp.trim();

        FallbackOtpRecord fallback = fallbackOtps.get(phone.clean10());

        if (fallback != null) {
            if (fallback.isExpired()) {
                fallbackOtps.remove(phone.clean10());
                return false;
            }

            boolean matches = fallback.code().equals(otpCode);

            if (matches) {
                fallbackOtps.remove(phone.clean10());
                verifiedMobiles.put(phone.clean10(), Instant.now().plusSeconds(VERIFIED_TTL_SECONDS));
            }

            return matches;
        }

        if (devMode) {
            return false;
        }

        if (!isTwilioConfigured()) {
            throw new ResponseStatusException(
                    HttpStatus.SERVICE_UNAVAILABLE,
                    "Twilio OTP settings are missing. Please configure Twilio."
            );
        }

        try {
            VerificationCheck check = VerificationCheck.creator(twilioProperties.getVerifyServiceSid())
                    .setTo(phone.e164())
                    .setCode(otpCode)
                    .create();

            boolean approved = "approved".equalsIgnoreCase(check.getStatus());

            if (approved) {
                verifiedMobiles.put(phone.clean10(), Instant.now().plusSeconds(VERIFIED_TTL_SECONDS));
            }

            log.info("Twilio OTP verification for {} status={}", phone.e164(), check.getStatus());

            return approved;

        } catch (ApiException ex) {
            log.warn("Twilio OTP verification failed for {}. Code={}, Message={}",
                    phone.e164(), ex.getCode(), ex.getMessage());

            return false;

        } catch (Exception ex) {
            log.error("Unexpected OTP verification error for {}", phone.e164(), ex);

            throw new ResponseStatusException(
                    HttpStatus.SERVICE_UNAVAILABLE,
                    "OTP verification service is temporarily unavailable."
            );
        }
    }

    public boolean isAlreadyVerified(String mobile) {
        PhoneNumber phone = normalizeIndianMobile(mobile);
        Instant expiry = verifiedMobiles.get(phone.clean10());

        if (expiry == null) {
            return false;
        }

        if (expiry.isBefore(Instant.now())) {
            verifiedMobiles.remove(phone.clean10());
            return false;
        }

        return true;
    }

    public void clearVerified(String mobile) {
        PhoneNumber phone = normalizeIndianMobile(mobile);
        verifiedMobiles.remove(phone.clean10());
        fallbackOtps.remove(phone.clean10());
    }

    private boolean isTwilioConfigured() {
        return twilioProperties != null
                && isConfiguredSecret(twilioProperties.getAccountSid())
                && isConfiguredSecret(twilioProperties.getAuthToken())
                && isConfiguredSecret(twilioProperties.getVerifyServiceSid());
    }

    private boolean isConfiguredSecret(String value) {
        return StringUtils.hasText(value) && !value.trim().toLowerCase().startsWith("replace_with_");
    }
    private String createFallbackOtp(String cleanMobile) {
        String code = String.format("%06d", secureRandom.nextInt(1_000_000));

        fallbackOtps.put(
                cleanMobile,
                new FallbackOtpRecord(code, Instant.now().plusSeconds(FALLBACK_OTP_TTL_SECONDS))
        );

        log.warn("Fallback OTP generated for mobile ending with {}",
                cleanMobile.length() >= 4 ? cleanMobile.substring(cleanMobile.length() - 4) : cleanMobile);

        if (exposeFallbackOtp) {
            log.warn("Fallback OTP for {} = {}", cleanMobile, code);
            return code;
        }

        return null;
    }

    private PhoneNumber normalizeIndianMobile(String mobile) {
        if (!StringUtils.hasText(mobile)) {
            throw new ResponseStatusException(HttpStatus.BAD_REQUEST, "Mobile number is required");
        }

        String raw = mobile.trim().replaceAll("\\s+", "");
        String digits = raw.replaceAll("\\D", "");

        String clean10;

        if (digits.length() == 10) {
            clean10 = digits;
        } else if (digits.length() == 12 && digits.startsWith("91")) {
            clean10 = digits.substring(2);
        } else if (digits.length() == 11 && digits.startsWith("0")) {
            clean10 = digits.substring(1);
        } else {
            throw new ResponseStatusException(
                    HttpStatus.BAD_REQUEST,
                    "Invalid mobile number. Use 10 digit Indian number or +91 format."
            );
        }

        return new PhoneNumber("+91" + clean10, clean10);
    }

    private record PhoneNumber(String e164, String clean10) {
    }

    private record FallbackOtpRecord(String code, Instant expiresAt) {
        private boolean isExpired() {
            return expiresAt == null || !expiresAt.isAfter(Instant.now());
        }
    }
}