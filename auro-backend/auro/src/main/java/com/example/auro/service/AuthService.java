package com.example.auro.service;

import com.example.auro.dto.*;
import com.example.auro.entity.CustomerEntity;
import com.example.auro.entity.Employee;
import com.example.auro.entity.UserAccount;
import com.example.auro.exception.ApiException;
import com.example.auro.repository.CustomerRepository;
import com.example.auro.repository.UserRepository;
import com.example.auro.security.JwtService;
import com.example.auro.util.RoleConstants;
import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.dao.IncorrectResultSizeDataAccessException;
import org.springframework.http.HttpStatus;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.util.LinkedHashMap;
import java.util.Map;
import java.util.Locale;

@Service
public class AuthService {
    private static final Logger log = LoggerFactory.getLogger(AuthService.class);
    private static final long OTP_EXPIRES_SECONDS = 300;

    private final UserRepository userRepository;
    private final CustomerRepository customerRepository;
    private final PasswordEncoder passwordEncoder;
    private final JwtService jwtService;
    private final OtpService otpService;
    private final CredentialEmailService credentialEmailService;

    public AuthService(
            UserRepository userRepository,
            CustomerRepository customerRepository,
            PasswordEncoder passwordEncoder,
            JwtService jwtService,
            OtpService otpService,
            CredentialEmailService credentialEmailService
    ) {
        this.userRepository = userRepository;
        this.customerRepository = customerRepository;
        this.passwordEncoder = passwordEncoder;
        this.jwtService = jwtService;
        this.otpService = otpService;
        this.credentialEmailService = credentialEmailService;
    }

    @Transactional(readOnly = true)
    public LoginResponse login(LoginRequest request) {
        String identifier = normalize(request.getIdentifier());
        try {
            UserAccount user;
            try {
                user = userRepository.findByLoginIdentifier(identifier)
                        .orElseThrow(() -> new ApiException(HttpStatus.UNAUTHORIZED, "Invalid login credentials."));
            } catch (IncorrectResultSizeDataAccessException ex) {
                throw new ApiException(
                        HttpStatus.CONFLICT,
                        "Multiple accounts match this login identifier. Please contact admin."
                );
            }

            if (!user.isActive()) {
                throw new ApiException(HttpStatus.FORBIDDEN, "Your account is inactive. Contact admin.");
            }

            String actualRole = normalize(user.getRole());
            if (!RoleConstants.isValidRole(actualRole)) {
                throw new ApiException(HttpStatus.CONFLICT, "Your account role is not configured correctly. Contact admin.");
            }


            if (!passwordMatches(request.getPassword(), user)) {
                throw new ApiException(HttpStatus.UNAUTHORIZED, "Invalid login credentials.");
            }

            String token = jwtService.generateToken(user);
            return new LoginResponse(token, jwtService.getExpirationMs(), RoleConstants.getHomePath(actualRole), UserResponse.from(user));
        } catch (ApiException ex) {
            throw ex;
        } catch (Exception ex) {
            log.error("Login failed unexpectedly for identifier {}", identifier, ex);
            throw new ApiException(HttpStatus.SERVICE_UNAVAILABLE, "Login service is temporarily unavailable. Please try again.");
        }
    }

    public OtpResponse requestCustomerRegistrationOtp(OtpRequest request) {
        String mobile = normalizeMobile(request.getMobile());
        if (userRepository.existsByMobile(mobile)) {
            throw new ApiException(HttpStatus.CONFLICT, "Mobile number already exists.");
        }
        try {
            String debugOtp = otpService.sendOtp(mobile);
            String message = debugOtp == null
                    ? "OTP sent to mobile number."
                    : "OTP generated locally because SMS service is unavailable.";
            return new OtpResponse(message, OTP_EXPIRES_SECONDS, debugOtp);
        } catch (IllegalArgumentException ex) {
            throw new ApiException(HttpStatus.BAD_REQUEST, ex.getMessage());
        } catch (Exception ex) {
            log.error("Customer registration OTP failed for mobile {}", mobile, ex);
            throw new ApiException(HttpStatus.SERVICE_UNAVAILABLE, "OTP service is temporarily unavailable. Please try again.");
        }
    }

    public OtpResponse requestPasswordResetOtp(OtpRequest request) {
        String mobile = normalizeMobile(request.getMobile());
        UserAccount user = userRepository.findByMobile(mobile)
                .orElseThrow(() -> new ApiException(HttpStatus.NOT_FOUND, "No account found for this mobile number."));

        if (!user.isActive()) {
            throw new ApiException(HttpStatus.FORBIDDEN, "Your account is inactive. Contact admin.");
        }

        try {
            String debugOtp = otpService.sendOtp(mobile);
            String message = debugOtp == null
                    ? "OTP sent to registered mobile number."
                    : "OTP generated locally because SMS service is unavailable.";
            return new OtpResponse(message, OTP_EXPIRES_SECONDS, debugOtp);
        } catch (IllegalArgumentException ex) {
            throw new ApiException(HttpStatus.BAD_REQUEST, ex.getMessage());
        } catch (Exception ex) {
            log.error("Password reset OTP failed for mobile {}", mobile, ex);
            throw new ApiException(HttpStatus.SERVICE_UNAVAILABLE, "OTP service is temporarily unavailable. Please try again.");
        }
    }

    public OtpResponse requestProfileMobileOtp(OtpRequest request) {
        String mobile = normalizeMobile(request.getMobile());
        try {
            String debugOtp = otpService.sendOtp(mobile);
            String message = debugOtp == null
                    ? "OTP sent to mobile number."
                    : "OTP generated locally because SMS service is unavailable.";
            return new OtpResponse(message, OTP_EXPIRES_SECONDS, debugOtp);
        } catch (IllegalArgumentException ex) {
            throw new ApiException(HttpStatus.BAD_REQUEST, ex.getMessage());
        } catch (Exception ex) {
            log.error("Profile mobile OTP failed for mobile {}", mobile, ex);
            throw new ApiException(HttpStatus.SERVICE_UNAVAILABLE, "OTP service is temporarily unavailable. Please try again.");
        }
    }

    public OtpResponse verifyPasswordResetOtp(OtpVerificationRequest request) {
        verifyRawOtp(normalizeMobile(request.getMobile()), request.getOtp());
        return new OtpResponse("OTP verified.", OTP_EXPIRES_SECONDS);
    }

    public OtpResponse verifyProfileMobileOtp(OtpVerificationRequest request) {
        verifyRawOtp(normalizeMobile(request.getMobile()), request.getOtp());
        return new OtpResponse("OTP verified.", OTP_EXPIRES_SECONDS);
    }

    public void requireProfileMobileOtp(String mobile, String otp) {
        consumeVerifiedOrOtp(normalizeMobile(mobile), otp);
    }

    @Transactional
    public UserResponse resetPassword(PasswordResetRequest request) {
        String mobile = normalizeMobile(request.getMobile());
        consumeVerifiedOrOtp(mobile, request.getOtp());

        UserAccount user = userRepository.findByMobile(mobile)
                .orElseThrow(() -> new ApiException(HttpStatus.NOT_FOUND, "No account found for this mobile number."));

        if (!user.isActive()) {
            throw new ApiException(HttpStatus.FORBIDDEN, "Your account is inactive. Contact admin.");
        }

        user.setPasswordHash(passwordEncoder.encode(request.getPassword()));
        return UserResponse.from(userRepository.save(user));
    }

    @Transactional
    public UserResponse registerCustomer(CreateCustomerRequest request) {
        String mobile = normalizeMobile(request.getMobile());
        validateUnique(null, null, request.getEmail(), mobile);
        consumeVerifiedOrOtp(mobile, request.getOtp());

        String normalizedEmail = blankToNull(request.getEmail());
        String rawPassword = request.getPassword();

        UserAccount user = new UserAccount();
        user.setFullName(request.getFullName().trim());
        user.setEmail(normalizedEmail);
        user.setMobile(mobile);
        user.setUsername("CUS" + mobile);
        user.setPasswordHash(passwordEncoder.encode(rawPassword));
        user.setRole(RoleConstants.CUSTOMER);
        user.setDepartment(RoleConstants.getDepartment(RoleConstants.CUSTOMER));
        UserAccount savedUser = userRepository.save(user);

        CustomerEntity customer = customerRepository.findByMobileNumber(mobile)
                .orElseGet(CustomerEntity::new);
        customer.setName(request.getFullName().trim());
        customer.setMobileNumber(mobile);
        customer.setEmail(normalizedEmail);
        customer.setPassword(passwordEncoder.encode(rawPassword));
        customer.setRole("customer");
        customer.setStatus("Active");
        customerRepository.save(customer);

        return UserResponse.from(savedUser);
    }

    @Transactional
    public UserResponse createEmployee(CreateEmployeeRequest request) {
        return createEmployee(request, null);
    }

    @Transactional
    public UserResponse createEmployee(CreateEmployeeRequest request, String creatorRole) {
        String role = normalizeRole(request.getRole());
        if (!RoleConstants.isValidRole(role) || RoleConstants.CUSTOMER.equals(role)) {
            throw new ApiException(HttpStatus.BAD_REQUEST, "Invalid employee role.");
        }

        if (creatorRole != null && !creatorRole.isBlank()) {
            if (!RoleConstants.isSuperRole(creatorRole)) {
                throw new ApiException(HttpStatus.FORBIDDEN, "Only Managing Director or Operational Head can create manager accounts.");
            }
            if (!RoleConstants.isDepartmentManagerRole(role)) {
                throw new ApiException(HttpStatus.BAD_REQUEST, "Managing Director and Operational Head can create department manager roles only.");
            }
        }

        String fullName = normalize(request.getFullName());
        if (fullName.isBlank()) {
            throw new ApiException(HttpStatus.BAD_REQUEST, "Full name is required.");
        }

        String email = normalize(request.getEmail()).toLowerCase(Locale.ROOT);
        String mobile = normalizeMobile(request.getMobile());
        String employeeId = normalize(request.getEmployeeId());
        String username = normalize(request.getUsername());
        String rawPassword = normalize(request.getPassword());

        if (email.isBlank()) {
            throw new ApiException(HttpStatus.BAD_REQUEST, "Email is required.");
        }
        if (mobile.isBlank()) {
            throw new ApiException(HttpStatus.BAD_REQUEST, "Mobile number is required.");
        }

        if (employeeId.isBlank()) {
            employeeId = generateEmployeeId(role);
        }
        if (username.isBlank()) {
            username = generateUsername(fullName);
        }
        if (rawPassword.isBlank()) {
            rawPassword = generatePassword(fullName);
        }

        validateUnique(employeeId, username, email, mobile);

        UserAccount user = new UserAccount();
        user.setFullName(fullName);
        user.setEmployeeId(employeeId.toUpperCase(Locale.ROOT));
        user.setUsername(username);
        user.setEmail(email);
        user.setMobile(mobile);
        user.setPasswordHash(passwordEncoder.encode(rawPassword));
        user.setRole(role);
        user.setDepartment(RoleConstants.getDepartment(role));

        UserAccount savedUser = userRepository.save(user);
        CredentialEmailService.DeliveryResult deliveryResult = credentialEmailService.sendCreatedCredentials(savedUser, rawPassword);
        return UserResponse.from(savedUser, rawPassword, deliveryResult.sent(), deliveryResult.message());
    }

    public Map<String, Object> profileResponse(Employee employee) {
        Map<String, Object> response = new LinkedHashMap<>();
        response.put("id", employee.getId());
        response.put("employeeId", employee.getEmployeeId());
        response.put("name", employee.getName());
        response.put("fullName", employee.getFullName());
        response.put("email", employee.getEmail());
        response.put("username", employee.getUsername());
        response.put("mobileNumber", employee.getMobileNumber());
        response.put("phone", employee.getMobileNumber());
        response.put("address", employee.getAddress());
        response.put("department", employee.getDepartment());
        response.put("role", employee.getRole());
        response.put("status", employee.getStatus());
        response.put("profilePhoto", employee.getProfilePhoto());
        return response;
    }

    private String generateEmployeeId(String role) {
        String prefix = RoleConstants.getEmployeeIdPrefix(role);
        int sequence = 1;
        String candidate;
        do {
            candidate = String.format(Locale.ROOT, "%s%03d", prefix, sequence++);
        } while (userRepository.existsByEmployeeIdIgnoreCase(candidate));
        return candidate;
    }

    private String generateUsername(String fullName) {
        String base = fullName.toLowerCase(Locale.ROOT)
                .replaceAll("[^a-z0-9]+", ".")
                .replaceAll("(^\\.)|(\\.$)", "")
                .replaceAll("\\.{2,}", ".");
        if (base.isBlank()) {
            base = "employee";
        }

        String candidate = base;
        int sequence = 1;
        while (userRepository.existsByUsernameIgnoreCase(candidate)) {
            candidate = base + sequence++;
        }
        return candidate;
    }

    private String generatePassword(String fullName) {
        String firstToken = fullName.trim().split("\\s+")[0].replaceAll("[^A-Za-z0-9]", "");
        if (firstToken.isBlank()) {
            firstToken = "Employee";
        }
        String normalized = firstToken.substring(0, 1).toUpperCase(Locale.ROOT)
                + firstToken.substring(1);
        return normalized + "@123";
    }

    private void consumeVerifiedOrOtp(String mobile, String otp) {
        if (otpService.isAlreadyVerified(mobile)) {
            otpService.clearVerified(mobile);
            return;
        }

        verifyRawOtp(mobile, otp);
        otpService.clearVerified(mobile);
    }

    private void verifyRawOtp(String mobile, String otp) {
        if (!otpService.verifyOtp(mobile, otp)) {
            throw new ApiException(HttpStatus.BAD_REQUEST, "Invalid OTP.");
        }
    }

    private void validateUnique(String employeeId, String username, String email, String mobile) {
        if (employeeId != null && !employeeId.isBlank() && userRepository.existsByEmployeeIdIgnoreCase(employeeId.trim())) {
            throw new ApiException(HttpStatus.CONFLICT, "Employee ID already exists.");
        }
        if (username != null && !username.isBlank() && userRepository.existsByUsernameIgnoreCase(username.trim())) {
            throw new ApiException(HttpStatus.CONFLICT, "Username already exists.");
        }
        if (email != null && !email.isBlank() && userRepository.existsByEmailIgnoreCase(email.trim())) {
            throw new ApiException(HttpStatus.CONFLICT, "Email already exists.");
        }
        if (mobile != null && !mobile.isBlank() && userRepository.existsByMobile(mobile.trim())) {
            throw new ApiException(HttpStatus.CONFLICT, "Mobile number already exists.");
        }
    }

    private String normalize(String value) {
        return value == null ? "" : value.trim();
    }

    private String normalizeRole(String role) {
        return normalize(role);
    }

    private String normalizeMobile(String mobile) {
        String digits = mobile == null ? "" : mobile.replaceAll("\\D", "");
        if (digits.length() > 10 && digits.startsWith("91")) {
            digits = digits.substring(digits.length() - 10);
        }
        if (!digits.isBlank() && digits.length() != 10) {
            throw new ApiException(HttpStatus.BAD_REQUEST, "Mobile number must be 10 digits.");
        }
        return digits;
    }

    private String blankToNull(String value) {
        if (value == null || value.isBlank()) return null;
        return value.trim().toLowerCase(Locale.ROOT);
    }

    private boolean passwordMatches(String rawPassword, UserAccount user) {
        String storedPassword = normalize(user.getPasswordHash());
        if (storedPassword.isBlank()) {
            storedPassword = normalize(user.getLegacyPassword());
        }

        if (storedPassword.isBlank()) {
            return false;
        }

        try {
            return passwordEncoder.matches(rawPassword, storedPassword);
        } catch (IllegalArgumentException ex) {
            return storedPassword.equals(rawPassword);
        }
    }
}




