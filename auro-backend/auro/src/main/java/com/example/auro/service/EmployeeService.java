package com.example.auro.service;

import com.example.auro.dto.EmployeeResponse;
import com.example.auro.entity.Employee;
import com.example.auro.entity.EmployeeDocument;
import com.example.auro.entity.UserAccount;
import com.example.auro.exception.ApiException;
import com.example.auro.repository.EmployeeRepository;
import com.example.auro.repository.UserRepository;
import com.fasterxml.jackson.core.type.TypeReference;
import com.fasterxml.jackson.databind.ObjectMapper;
import lombok.RequiredArgsConstructor;
import org.springframework.http.HttpStatus;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;
import org.springframework.web.multipart.MultipartFile;

import java.time.LocalDate;
import java.util.ArrayList;
import java.util.List;
import java.util.Locale;

@Service
@RequiredArgsConstructor
public class EmployeeService {

    private final EmployeeRepository employeeRepository;
    private final UserRepository userRepository;
    private final FileStorageService fileStorageService;
    private final PasswordEncoder passwordEncoder;
    private final ObjectMapper objectMapper;
    private final CredentialEmailService credentialEmailService;

    public List<EmployeeResponse> getAllEmployees() {
        return employeeRepository.findAll()
                .stream()
                .map(EmployeeResponse::from)
                .toList();
    }

    public EmployeeResponse getEmployeeById(Long id) {
        Employee employee = employeeRepository.findById(id)
                .orElseThrow(() -> new RuntimeException("Employee not found"));

        return EmployeeResponse.from(employee);
    }

    @Transactional
    public EmployeeResponse createEmployee(
            String firstName,
            String lastName,
            String email,
            String mobileNumber,
            String address,
            String department,
            String role,
            String rawPassword,
            String joiningDate,
            MultipartFile aadhaarImage,
            MultipartFile panImage,
            List<MultipartFile> documents,
            String createdBy
    ) {
        String normalizedFirstName = firstName == null ? "" : firstName.trim();
        String normalizedLastName = lastName == null ? "" : lastName.trim();
        String normalizedEmail = normalizeEmail(email);
        String normalizedMobile = normalizeMobile(mobileNumber);

        if (normalizedFirstName.isBlank()) {
            throw new ApiException(HttpStatus.BAD_REQUEST, "First name is required.");
        }

        if (normalizedLastName.isBlank()) {
            throw new ApiException(HttpStatus.BAD_REQUEST, "Last name is required.");
        }

        if (normalizedEmail.isBlank()) {
            throw new ApiException(HttpStatus.BAD_REQUEST, "Email is required.");
        }

        if (normalizedMobile.isBlank()) {
            throw new ApiException(HttpStatus.BAD_REQUEST, "Mobile number is required.");
        }

        if (aadhaarImage == null || aadhaarImage.isEmpty()) {
            throw new ApiException(HttpStatus.BAD_REQUEST, "Aadhaar image is required.");
        }

        if (panImage == null || panImage.isEmpty()) {
            throw new ApiException(HttpStatus.BAD_REQUEST, "PAN image is required.");
        }

        if (employeeRepository.existsByEmailIgnoreCase(normalizedEmail)) {
            throw new ApiException(HttpStatus.CONFLICT, "Email already exists.");
        }

        if (userRepository.existsByEmailIgnoreCase(normalizedEmail)) {
            throw new ApiException(HttpStatus.CONFLICT, "Login email already exists.");
        }

        employeeRepository.findByMobileNumber(normalizedMobile).ifPresent(existing -> {
            throw new ApiException(HttpStatus.CONFLICT, "Mobile number already exists.");
        });

        if (userRepository.existsByMobile(normalizedMobile)) {
            throw new ApiException(HttpStatus.CONFLICT, "Login mobile number already exists.");
        }

        String username = generateUniqueUsername(normalizedFirstName, normalizedLastName);
        String finalPassword = preparePassword(normalizedFirstName, rawPassword);

        String aadhaarUrl = fileStorageService.saveFile(aadhaarImage, "employees/aadhaar");
        String panUrl = fileStorageService.saveFile(panImage, "employees/pan");


        Employee employee = new Employee();
        employee.setFirstName(normalizedFirstName);
        employee.setLastName(normalizedLastName);
        employee.setName(normalizedFirstName + " " + normalizedLastName);
        employee.setUsername(username);
        employee.setPassword(passwordEncoder.encode(finalPassword));
        employee.setEmail(normalizedEmail);
        employee.setMobileNumber(normalizedMobile);
        employee.setAddress(address);
        employee.setDepartment(department);
        employee.setRole(role);
        employee.setJoiningDate(parseDate(joiningDate));
        employee.setStatus("Active");
        employee.setAadhaarImageUrl(aadhaarUrl);
        employee.setPanImageUrl(panUrl);
        List<EmployeeDocument> documentList = saveDocuments(documents);
        linkDocuments(employee, documentList);
        employee.setDocuments(documentList);
        employee.setCreatedBy(createdBy);

        Employee saved = employeeRepository.save(employee);
        saved.setEmployeeId("EMP" + String.format("%05d", saved.getId()));
        saved = employeeRepository.save(saved);

        UserAccount userAccount = new UserAccount();
        userAccount.setFullName(saved.getName());
        userAccount.setEmployeeId(saved.getEmployeeId());
        userAccount.setUsername(saved.getUsername());
        userAccount.setEmail(saved.getEmail());
        userAccount.setMobile(saved.getMobileNumber());
        userAccount.setPasswordHash(passwordEncoder.encode(finalPassword));
        userAccount.setRole(saved.getRole());
        userAccount.setDepartment(saved.getDepartment());
        userAccount.setAddress(saved.getAddress());
        userAccount.setActive(true);
        userRepository.save(userAccount);
        credentialEmailService.sendCreatedCredentials(userAccount, finalPassword);

        return EmployeeResponse.from(saved, finalPassword);
    }

    @Transactional
    public EmployeeResponse updateEmployee(
            Long id,
            String firstName,
            String lastName,
            String email,
            String mobileNumber,
            String address,
            String department,
            String role,
            String rawPassword,
            String joiningDate,
            String status,
            MultipartFile aadhaarImage,
            MultipartFile panImage,
            List<MultipartFile> documents,
            String existingDocumentsJson,
            String existingAadhaarImage,
            String existingPanImage
    ) {
        Employee employee = employeeRepository.findById(id)
                .orElseThrow(() -> new RuntimeException("Employee not found"));

        employee.setFirstName(firstName);
        employee.setLastName(lastName);
        employee.setName(firstName + " " + lastName);
        employee.setEmail(normalizeEmail(email));
        String normalizedMobile = normalizeMobile(mobileNumber);
        employee.setMobileNumber(normalizedMobile);
        employee.setAddress(address);
        employee.setDepartment(department);
        employee.setRole(role);
        employee.setJoiningDate(parseDate(joiningDate));
        employee.setStatus(status == null || status.isBlank() ? "Active" : status);

        String changedPassword = null;

        if (rawPassword != null && !rawPassword.isBlank()) {
            changedPassword = rawPassword.trim();
            employee.setPassword(passwordEncoder.encode(changedPassword));
        }

        if (aadhaarImage != null && !aadhaarImage.isEmpty()) {
            employee.setAadhaarImageUrl(
                    fileStorageService.saveFile(aadhaarImage, "employees/aadhaar")
            );
        } else if (existingAadhaarImage != null && !existingAadhaarImage.isBlank()) {
            employee.setAadhaarImageUrl(existingAadhaarImage);
        }

        if (panImage != null && !panImage.isEmpty()) {
            employee.setPanImageUrl(
                    fileStorageService.saveFile(panImage, "employees/pan")
            );
        } else if (existingPanImage != null && !existingPanImage.isBlank()) {
            employee.setPanImageUrl(existingPanImage);
        }

        List<EmployeeDocument> finalDocuments = parseExistingDocuments(existingDocumentsJson);
        linkDocuments(employee, finalDocuments);
        finalDocuments.addAll(saveDocuments(documents));
        employee.setDocuments(finalDocuments);

        Employee saved = employeeRepository.save(employee);
        final String updatedPassword = changedPassword;

        findLinkedUserAccount(saved).ifPresent(userAccount -> {
            userAccount.setFullName(saved.getName());
            userAccount.setUsername(saved.getUsername());
            userAccount.setEmail(saved.getEmail());
            userAccount.setMobile(saved.getMobileNumber());
            userAccount.setDepartment(saved.getDepartment());
            userAccount.setRole(saved.getRole());
            userAccount.setAddress(saved.getAddress());
            userAccount.setActive("Active".equalsIgnoreCase(saved.getStatus()));
            if (updatedPassword != null) {
                userAccount.setPasswordHash(passwordEncoder.encode(updatedPassword));
            }
            userRepository.save(userAccount);
        });

        return EmployeeResponse.from(saved, changedPassword);
    }

    @Transactional
    public EmployeeResponse toggleStatus(Long id) {
        Employee employee = employeeRepository.findById(id)
                .orElseThrow(() -> new RuntimeException("Employee not found"));

        if ("Active".equalsIgnoreCase(employee.getStatus())) {
            employee.setStatus("Inactive");
        } else {
            employee.setStatus("Active");
        }

        findLinkedUserAccount(employee).ifPresent(userAccount -> {
            userAccount.setActive("Active".equalsIgnoreCase(employee.getStatus()));
            userRepository.save(userAccount);
        });

        Employee saved = employeeRepository.save(employee);
        return EmployeeResponse.from(saved);
    }

    @Transactional
    public void deleteEmployee(Long id) {
        Employee employee = employeeRepository.findById(id)
                .orElseThrow(() -> new RuntimeException("Employee not found"));

        findLinkedUserAccount(employee).ifPresent(userRepository::delete);
        employeeRepository.delete(employee);
    }

    private java.util.Optional<UserAccount> findLinkedUserAccount(Employee employee) {
        if (employee.getEmployeeId() != null && !employee.getEmployeeId().isBlank()) {
            java.util.Optional<UserAccount> byEmployeeId = userRepository.findByLoginIdentifier(employee.getEmployeeId());
            if (byEmployeeId.isPresent()) {
                return byEmployeeId;
            }
        }

        if (employee.getEmail() != null && !employee.getEmail().isBlank()) {
            return userRepository.findByLoginIdentifier(employee.getEmail());
        }

        if (employee.getUsername() != null && !employee.getUsername().isBlank()) {
            return userRepository.findByLoginIdentifier(employee.getUsername());
        }

        return java.util.Optional.empty();
    }

    private String generateUniqueUsername(String firstName, String lastName) {
        String cleanFirstName = cleanName(firstName);
        String cleanLastName = cleanName(lastName);

        String baseUsername = cleanFirstName + "." + cleanLastName;
        String finalUsername = baseUsername;

        int counter = 1;

        while (employeeRepository.existsByUsername(finalUsername)
                || userRepository.existsByUsernameIgnoreCase(finalUsername)) {
            finalUsername = baseUsername + counter;
            counter++;
        }

        return finalUsername;
    }

    private String cleanName(String value) {
        if (value == null) {
            return "";
        }

        return value
                .trim()
                .toLowerCase(Locale.ROOT)
                .replaceAll("[^a-z0-9]", "");
    }

    private String preparePassword(String firstName, String rawPassword) {
        if (rawPassword != null && !rawPassword.isBlank()) {
            return rawPassword.trim();
        }

        String cleanFirstName =
                firstName == null || firstName.isBlank()
                        ? "Employee"
                        : firstName.trim();

        return cleanFirstName + "@123";
    }

    private LocalDate parseDate(String value) {
        if (value == null || value.isBlank()) {
            return null;
        }

        return LocalDate.parse(value);
    }

    private List<EmployeeDocument> saveDocuments(List<MultipartFile> documents) {
        List<EmployeeDocument> savedDocuments = new ArrayList<>();

        if (documents == null || documents.isEmpty()) {
            return savedDocuments;
        }

        for (MultipartFile file : documents) {
            if (file == null || file.isEmpty()) {
                continue;
            }

            String url = fileStorageService.saveFile(file, "employee-documents");

            EmployeeDocument doc = new EmployeeDocument();
            doc.setName(file.getOriginalFilename());
            doc.setFileName(file.getOriginalFilename());
            doc.setType(file.getContentType());
            doc.setSize(String.valueOf(file.getSize()));
            doc.setUrl(url);

            savedDocuments.add(doc);
        }

        return savedDocuments;
    }

    private List<EmployeeDocument> parseExistingDocuments(String json) {
        try {
            if (json == null || json.isBlank()) {
                return new ArrayList<>();
            }

            List<EmployeeDocument> documents = objectMapper.readValue(
                    json,
                    new TypeReference<List<EmployeeDocument>>() {}
            );

            documents.forEach(document -> {
                if (document.getFileName() == null || document.getFileName().isBlank()) {
                    document.setFileName(document.getName());
                }
            });

            return documents;
        } catch (Exception e) {
            return new ArrayList<>();
        }
    }

    private String normalizeEmail(String email) {
        return email == null ? "" : email.trim().toLowerCase(Locale.ROOT);
    }

    private void linkDocuments(Employee employee, List<EmployeeDocument> documents) {
        if (employee == null || documents == null) {
            return;
        }

        documents.forEach(document -> document.setEmployee(employee));
    }

    private String normalizeMobile(String mobileNumber) {
        if (mobileNumber == null) {
            return "";
        }

        String digits = mobileNumber.replaceAll("\\D", "");
        if (digits.length() > 10 && digits.startsWith("91")) {
            digits = digits.substring(digits.length() - 10);
        }

        if (!digits.isBlank() && digits.length() != 10) {
            throw new ApiException(HttpStatus.BAD_REQUEST, "Mobile number must be 10 digits.");
        }

        return digits;
    }
}


